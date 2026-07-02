import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

export async function GET() {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status as number })

  // Fetch all data
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
    const allPayments = courseCols.flatMap(col => col.payments)
    const collected = allPayments.filter(p => p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0)
    const pending = allPayments.filter(p => !p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0)
    return {
      'Khoá học': c.name,
      'Lớp': c.grade ?? 'Tất cả',
      'Học viên': new Set(allPayments.map(p => p.userId)).size,
      'Đã thu (VNĐ)': collected,
      'Còn thiếu (VNĐ)': pending,
      'Tổng dự kiến (VNĐ)': collected + pending,
      '% Hoàn thành': collected + pending > 0 ? Math.round((collected / (collected + pending)) * 100) + '%' : 'N/A',
    }
  })
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp')

  // Sheet 2: Detail per collection
  const detailRows: Record<string, any>[] = []
  for (const col of collections) {
    const course = courses.find(c => c.id === col.courseId)
    for (const pay of col.payments) {
      detailRows.push({
        'Khoá học': course?.name ?? col.courseId,
        'Đợt thu': col.title,
        'Số buổi': col.sessions,
        'Học viên': pay.enrollment.user.name ?? 'N/A',
        'SĐT': pay.enrollment.user.phone,
        'Số tiền (VNĐ)': pay.amount,
        'Miễn phí': pay.isFree ? 'Có' : 'Không',
        'Đã đóng': pay.isPaid ? 'Có' : 'Không',
        'Ngày đóng': pay.paidAt ? new Date(pay.paidAt).toLocaleDateString('vi-VN') : '',
        'Ghi chú': pay.note ?? '',
      })
    }
  }
  const wsDetail = XLSX.utils.json_to_sheet(detailRows)
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi tiết thu học phí')

  // Write buffer
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const fileName = `avab-finance-${new Date().toISOString().slice(0, 10)}.xlsx`
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
