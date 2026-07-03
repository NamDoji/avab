import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

export async function GET(req: NextRequest) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status as number })

  const format = req.nextUrl.searchParams.get('format') ?? 'xlsx'

  // Fetch all payments with full detail
  const payments = await prisma.tuitionPayment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      collection: {
        include: { course: { select: { id: true, name: true, grade: true } } },
      },
      enrollment: {
        include: { user: { select: { name: true, phone: true } } },
      },
    },
  })

  // ── CSV export ──────────────────────────────────────────────────────────
  if (format === 'csv') {
    const rows = payments.map(p => ({
      'Họ tên': p.enrollment.user.name ?? '',
      'SĐT': p.enrollment.user.phone ?? '',
      'Khoá học': p.collection.course.name,
      'Lớp': p.collection.course.grade ?? '',
      'Đợt thu': p.collection.title,
      'Số tiền (VNĐ)': p.amount,
      'Miễn phí': p.isFree ? 'Có' : 'Không',
      'Đã đóng': p.isPaid ? 'Có' : 'Không',
      'Ngày đóng': p.paidAt ? new Date(p.paidAt).toLocaleDateString('vi-VN') : '',
      'Ghi chú': p.note ?? '',
    }))

    const headers = Object.keys(rows[0] ?? {})
    const csvLines = [
      headers.join(','),
      ...rows.map(row =>
        headers
          .map(h => {
            const val = String((row as Record<string, string | number>)[h] ?? '')
            // Escape commas and quotes
            return val.includes(',') || val.includes('"') || val.includes('\n')
              ? `"${val.replace(/"/g, '""')}"`
              : val
          })
          .join(',')
      ),
    ]
    const csvContent = '\uFEFF' + csvLines.join('\r\n') // BOM for Excel UTF-8

    const fileName = `avab-finance-${new Date().toISOString().slice(0, 10)}.csv`
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  }

  // ── XLSX export (default) ───────────────────────────────────────────────
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    select: { id: true, name: true, grade: true },
    orderBy: { name: 'asc' },
  })

  const collections = await prisma.tuitionCollection.findMany({
    include: {
      payments: {
        include: {
          enrollment: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const wb = XLSX.utils.book_new()

  // Sheet 1: Summary per course
  const summaryRows = courses.map(c => {
    const courseCols = collections.filter(col => col.courseId === c.id)
    const allCoursePayments = courseCols.flatMap(col => col.payments)
    const collected = allCoursePayments.filter(p => p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0)
    const pending   = allCoursePayments.filter(p => !p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0)
    return {
      'Khoá học': c.name,
      'Lớp': c.grade ?? 'Tất cả',
      'Học viên': new Set(allCoursePayments.map(p => p.userId)).size,
      'Đã thu (VNĐ)': collected,
      'Còn thiếu (VNĐ)': pending,
      'Tổng dự kiến (VNĐ)': collected + pending,
      '% Hoàn thành': collected + pending > 0
        ? Math.round((collected / (collected + pending)) * 100) + '%'
        : 'N/A',
    }
  })
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Tổng hợp')

  // Sheet 2: Detail per payment
  const detailRows = payments.map(p => ({
    'Khoá học': p.collection.course.name,
    'Đợt thu': p.collection.title,
    'Số buổi': p.collection.sessions,
    'Học viên': p.enrollment.user.name ?? 'N/A',
    'SĐT': p.enrollment.user.phone ?? '',
    'Số tiền (VNĐ)': p.amount,
    'Miễn phí': p.isFree ? 'Có' : 'Không',
    'Đã đóng': p.isPaid ? 'Có' : 'Không',
    'Ngày đóng': p.paidAt ? new Date(p.paidAt).toLocaleDateString('vi-VN') : '',
    'Ghi chú': p.note ?? '',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailRows), 'Chi tiết thu học phí')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const fileName = `avab-finance-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
