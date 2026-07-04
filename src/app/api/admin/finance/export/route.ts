import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { getOrganizationContext } from '@/lib/organization'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

// ── Date range resolver ──────────────────────────────────────────────────────

function resolveDateRange(
  period: string | null,
  from:   string | null,
  to:     string | null,
): { gte: Date; lte: Date } | null {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()

  if (period === 'month') {
    return {
      gte: new Date(year, month, 1),
      lte: new Date(year, month + 1, 0, 23, 59, 59, 999),
    }
  }
  if (period === 'year') {
    return {
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59, 999),
    }
  }
  if (period === 'custom' && from && to) {
    return {
      gte: new Date(from),
      lte: new Date(to + 'T23:59:59.999Z'),
    }
  }
  // 'all' or no period = no date filter
  return null
}

// ── GET handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status },
    )

  // Org scoping
  const orgCtx = await getOrganizationContext(check.userId)
  const wherePaymentsOrg = orgCtx
    ? { enrollment: { course: { organizationId: orgCtx.id } } }
    : {}

  const sp       = req.nextUrl.searchParams
  const format   = sp.get('format') ?? 'xlsx'
  const period   = sp.get('period')   // month | year | all | custom
  const fromDate = sp.get('from')     // YYYY-MM-DD
  const toDate   = sp.get('to')       // YYYY-MM-DD

  const dateRange = resolveDateRange(period, fromDate, toDate)

  // Build paidAt filter for paid payments
  const paidAtFilter = dateRange
    ? { gte: dateRange.gte, lte: dateRange.lte }
    : undefined

  // Fetch all payments (scoped to org + period)
  const payments = await prisma.tuitionPayment.findMany({
    where: {
      ...wherePaymentsOrg,
      ...(paidAtFilter ? { paidAt: paidAtFilter } : {}),
    },
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
    const rows = payments.map((p) => ({
      'Họ tên':        p.enrollment.user.name ?? '',
      'SĐT':           p.enrollment.user.phone ?? '',
      'Khoá học':      p.collection.course.name,
      'Lớp':           p.collection.course.grade ?? '',
      'Đợt thu':       p.collection.title,
      'Số tiền (VNĐ)': p.amount,
      'Miễn phí':      p.isFree ? 'Có' : 'Không',
      'Đã đóng':       p.isPaid ? 'Có' : 'Không',
      'Ngày đóng':     p.paidAt ? new Date(p.paidAt).toLocaleDateString('vi-VN') : '',
      'Ghi chú':       p.note ?? '',
    }))

    const headers = Object.keys(rows[0] ?? {})
    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = String((row as Record<string, string | number>)[h] ?? '')
            return val.includes(',') || val.includes('"') || val.includes('\n')
              ? `"${val.replace(/"/g, '""')}"`
              : val
          })
          .join(','),
      ),
    ]
    const csvContent = '\uFEFF' + csvLines.join('\r\n')

    const fileName = `avab-finance-${new Date().toISOString().slice(0, 10)}.csv`
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  }

  // ── XLSX multi-sheet export ─────────────────────────────────────────────
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()

  // KPI data for Sheet 1 (summary)
  const [totalPaidAgg, unpaidAgg, thisMonthAgg, yearAgg] = await Promise.all([
    prisma.tuitionPayment.aggregate({
      where: { ...wherePaymentsOrg, isPaid: true, isFree: false },
      _sum:  { amount: true },
      _count: { _all: true },
    }),
    prisma.tuitionPayment.aggregate({
      where: { ...wherePaymentsOrg, isPaid: false, isFree: false },
      _sum:  { amount: true },
      _count: { _all: true },
    }),
    prisma.tuitionPayment.aggregate({
      where: {
        ...wherePaymentsOrg,
        isPaid: true,
        isFree: false,
        paidAt: { gte: new Date(year, month, 1) },
      },
      _sum: { amount: true },
    }),
    prisma.tuitionPayment.aggregate({
      where: {
        ...wherePaymentsOrg,
        isPaid: true,
        isFree: false,
        paidAt: { gte: new Date(year, 0, 1) },
      },
      _sum: { amount: true },
    }),
  ])

  const totalPaid   = totalPaidAgg._sum.amount  ?? 0
  const totalUnpaid = unpaidAgg._sum.amount      ?? 0
  const grandTotal  = totalPaid + totalUnpaid
  const rate        = grandTotal > 0 ? Math.round((totalPaid / grandTotal) * 100) : 0

  const periodLabel = period === 'month'
    ? now.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })
    : period === 'year'
    ? `Năm ${year}`
    : period === 'custom' && fromDate && toDate
    ? `${fromDate} → ${toDate}`
    : 'Toàn bộ'

  // ── Sheet 1: Tổng hợp KPIs ─────────────────────────────────────────────
  const summaryData = [
    { 'Chỉ số': 'Kỳ báo cáo',         'Giá trị': periodLabel },
    { 'Chỉ số': 'Ngày xuất báo cáo',  'Giá trị': now.toLocaleDateString('vi-VN') },
    { 'Chỉ số': '',                    'Giá trị': '' },
    { 'Chỉ số': 'Thu tháng này (VNĐ)', 'Giá trị': thisMonthAgg._sum.amount ?? 0 },
    { 'Chỉ số': 'Thu năm nay (VNĐ)',   'Giá trị': yearAgg._sum.amount ?? 0 },
    { 'Chỉ số': 'Tổng đã thu (VNĐ)',   'Giá trị': totalPaid },
    { 'Chỉ số': 'Công nợ chưa thu (VNĐ)', 'Giá trị': totalUnpaid },
    { 'Chỉ số': 'Tổng hóa đơn (VNĐ)', 'Giá trị': grandTotal },
    { 'Chỉ số': 'Tỷ lệ thu (%)',        'Giá trị': rate },
    { 'Chỉ số': 'Số HĐ đã thu',        'Giá trị': totalPaidAgg._count._all },
    { 'Chỉ số': 'Số HĐ chưa thu',      'Giá trị': unpaidAgg._count._all },
  ]

  // ── Sheet 2: Chi tiết từng payment ────────────────────────────────────
  const detailRows = payments.map((p) => ({
    'Khoá học':      p.collection.course.name,
    'Lớp':           p.collection.course.grade ?? '',
    'Đợt thu':       p.collection.title,
    'Họ tên':        p.enrollment.user.name ?? 'N/A',
    'SĐT':           p.enrollment.user.phone ?? '',
    'Số tiền (VNĐ)': p.amount,
    'Miễn phí':      p.isFree ? 'Có' : 'Không',
    'Đã đóng':       p.isPaid ? 'Có' : 'Không',
    'Ngày đóng':     p.paidAt ? new Date(p.paidAt).toLocaleDateString('vi-VN') : '',
    'Ghi chú':       p.note ?? '',
  }))

  // ── Sheet 3: Doanh thu theo lớp ────────────────────────────────────────
  const collectionsForSheet3 = await prisma.tuitionCollection.findMany({
    where:   orgCtx ? { course: { organizationId: orgCtx.id } } : {},
    include: {
      course:   { select: { name: true, grade: true } },
      payments: {
        where:  { isFree: false },
        select: { amount: true, isPaid: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const classRows = collectionsForSheet3
    .map((col) => {
      const total     = col.payments.reduce((s, p) => s + p.amount, 0)
      const collected = col.payments.filter((p) => p.isPaid).reduce((s, p) => s + p.amount, 0)
      const remaining = total - collected
      const pctRate   = total > 0 ? Math.round((collected / total) * 100) : 0
      return {
        'Đợt thu':        col.title,
        'Khoá học':       col.course.name,
        'Lớp':            col.course.grade ?? '',
        'Tổng HĐ (VNĐ)': total,
        'Đã thu (VNĐ)':   collected,
        'Còn lại (VNĐ)':  remaining,
        '% Thu':          pctRate,
        'Số học sinh':    col.payments.length,
      }
    })
    .sort((a, b) => b['Tổng HĐ (VNĐ)'] - a['Tổng HĐ (VNĐ)'])

  // ── Build workbook ─────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(summaryData),
    'Tổng hợp',
  )
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(detailRows.length > 0 ? detailRows : [{ 'Thông báo': 'Không có dữ liệu trong kỳ này' }]),
    'Chi tiết',
  )
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(classRows.length > 0 ? classRows : [{ 'Thông báo': 'Không có dữ liệu' }]),
    'Theo lớp',
  )

  const buf      = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const suffix   = period === 'month' ? 'thang-nay'
                 : period === 'year'  ? `nam-${year}`
                 : 'tat-ca'
  const fileName = `avab-finance-${suffix}-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buf, {
    headers: {
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
