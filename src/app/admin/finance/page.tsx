import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ExportButton } from '@/components/admin/finance/ExportButton'

export const metadata = { title: 'Finance Dashboard — AvaB' }

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const relativeTime = (date: Date | null): string => {
  if (!date) return '—'
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export default async function FinanceDashboardPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) redirect('/dang-nhap')

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  const orgPaymentFilter = orgCtx?.id
    ? { enrollment: { course: { organizationId: orgCtx.id } } }
    : {}

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0)

  const currentMonthLabel = now.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })

  const [
    totalPaid,
    totalPaidThisMonth,
    totalPaidLastMonth,
    totalUnpaid,
    overdueCount,
    recentPayments,
    allPaymentsForCourse,
  ] = await Promise.all([
    // Tổng thu toàn thời gian
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true, isFree: false, ...orgPaymentFilter },
      _sum: { amount: true },
    }),
    // Đã thu tháng này
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true, isFree: false, paidAt: { gte: thisMonthStart }, ...orgPaymentFilter },
      _sum: { amount: true },
    }),
    // Đã thu tháng trước
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true, isFree: false, paidAt: { gte: lastMonthStart, lte: lastMonthEnd }, ...orgPaymentFilter },
      _sum: { amount: true },
    }),
    // Tổng công nợ
    prisma.tuitionPayment.aggregate({
      where: { isPaid: false, isFree: false, ...orgPaymentFilter },
      _sum: { amount: true },
    }),
    // Số lượng công nợ
    prisma.tuitionPayment.count({
      where: { isPaid: false, isFree: false, ...orgPaymentFilter },
    }),
    // 10 giao dịch gần nhất
    prisma.tuitionPayment.findMany({
      where: { isPaid: true, ...orgPaymentFilter },
      orderBy: { paidAt: 'desc' },
      take: 10,
      include: {
        enrollment: {
          include: {
            user: { select: { name: true, phone: true } },
            course: { select: { name: true } },
          },
        },
      },
    }),
    // Tất cả payments để tính revenue per course
    prisma.tuitionPayment.findMany({
      where: { isFree: false, ...orgPaymentFilter },
      select: {
        amount: true,
        isPaid: true,
        enrollment: {
          select: {
            course: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ])

  // ── Tính toán KPIs ──────────────────────────────────────────────────────
  const paidThisMonthAmt  = totalPaidThisMonth._sum.amount  ?? 0
  const paidLastMonthAmt  = totalPaidLastMonth._sum.amount  ?? 0
  const totalPaidAmt      = totalPaid._sum.amount           ?? 0
  const totalUnpaidAmt    = totalUnpaid._sum.amount         ?? 0
  const grandTotal        = totalPaidAmt + totalUnpaidAmt
  const collectionRate    = grandTotal > 0
    ? Math.round((totalPaidAmt / grandTotal) * 100) : 0

  // Month-over-month change %
  const momPct = paidLastMonthAmt > 0
    ? Math.round(((paidThisMonthAmt - paidLastMonthAmt) / paidLastMonthAmt) * 100)
    : paidThisMonthAmt > 0 ? 100 : 0
  const momPositive = momPct >= 0

  // ── Top 5 courses by revenue ────────────────────────────────────────────
  const courseRevenueMap = new Map<string, { id: string; name: string; paid: number; unpaid: number; total: number }>()
  for (const p of allPaymentsForCourse) {
    const course = p.enrollment.course
    if (!courseRevenueMap.has(course.id)) {
      courseRevenueMap.set(course.id, { id: course.id, name: course.name, paid: 0, unpaid: 0, total: 0 })
    }
    const entry = courseRevenueMap.get(course.id)!
    entry.total += p.amount
    if (p.isPaid) entry.paid += p.amount
    else entry.unpaid += p.amount
  }
  const topCourses = [...courseRevenueMap.values()]
    .sort((a, b) => b.paid - a.paid)
    .slice(0, 5)
    .map(c => ({ ...c, rate: c.total > 0 ? Math.round((c.paid / c.total) * 100) : 0 }))

  const maxPaid = topCourses.length > 0 ? topCourses[0].paid : 1

  return (
    <main className="min-h-screen bg-gray-50 pt-14">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="px-4 sm:px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white">💰 Finance Dashboard</h1>
                <p className="text-emerald-200 text-sm mt-0.5">
                  Tổng quan tài chính — {currentMonthLabel}
                </p>
              </div>
            </div>
            <ExportButton />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Zone 1: KPI Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Đã thu tháng này */}
          <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide mb-1">💰 Đã thu tháng này</p>
            <p className="text-2xl font-black leading-tight">{fmtVND(paidThisMonthAmt)}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: momPositive ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.3)',
                  color: 'white',
                }}
              >
                {momPositive ? '📈' : '📉'} {momPositive ? '+' : ''}{momPct}% vs tháng trước
              </span>
            </div>
          </div>

          {/* Card 2: Công nợ chưa thu */}
          <div
            className="rounded-3xl p-6 text-white shadow-md"
            style={{
              background: overdueCount > 0
                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            }}
          >
            <p className="text-xs font-semibold text-red-200 uppercase tracking-wide mb-1">💸 Công nợ chưa thu</p>
            <p className="text-2xl font-black leading-tight">{fmtVND(totalUnpaidAmt)}</p>
            <div className="mt-3">
              {overdueCount > 0 ? (
                <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  🔴 {overdueCount} hóa đơn chưa thanh toán
                </span>
              ) : (
                <span className="text-xs font-semibold text-white/70">✅ Không có công nợ</span>
              )}
            </div>
          </div>

          {/* Card 3: Tổng thu toàn thời gian */}
          <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
            <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-1">📊 Tổng thu toàn bộ</p>
            <p className="text-2xl font-black leading-tight">{fmtVND(totalPaidAmt)}</p>
            <div className="mt-3">
              <span className="text-xs text-purple-200">
                Tổng hóa đơn: {fmtVND(grandTotal)}
              </span>
            </div>
          </div>

          {/* Card 4: Tỷ lệ thu */}
          <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
            <p className="text-xs font-semibold text-sky-200 uppercase tracking-wide mb-1">🎯 Tỷ lệ thu</p>
            <p className="text-2xl font-black leading-tight">{collectionRate}%</p>
            <div className="mt-3">
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <p className="text-xs text-sky-200 mt-1">Đã thu / Tổng hóa đơn</p>
            </div>
          </div>
        </div>

        {/* ── Zone 2: Revenue by Course (Top 5) ───────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">📚 Doanh thu theo khoá học (Top 5)</h2>
            <p className="text-xs text-gray-500 mt-0.5">Sắp xếp theo doanh thu đã thu cao nhất</p>
          </div>

          {topCourses.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              Chưa có dữ liệu thu học phí
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                    <th className="text-left px-6 py-3">Khoá học</th>
                    <th className="text-right px-4 py-3">Tổng hóa đơn</th>
                    <th className="text-right px-4 py-3">Đã thu</th>
                    <th className="text-right px-4 py-3">Còn lại</th>
                    <th className="text-right px-6 py-3">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topCourses.map((course, idx) => (
                    <tr
                      key={course.id}
                      className="hover:bg-emerald-50/50 transition"
                      style={idx === 0 ? { background: 'rgba(5,150,105,0.04)' } : {}}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md">TOP</span>
                          )}
                          <Link
                            href={`/admin/courses/${course.id}/tuition`}
                            className="font-semibold text-gray-800 hover:text-emerald-700 transition"
                          >
                            {course.name}
                          </Link>
                        </div>
                        {/* Revenue bar */}
                        <div className="mt-1.5 w-full max-w-[200px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.round((course.paid / maxPaid) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-600 font-medium">{fmtVND(course.total)}</td>
                      <td className="px-4 py-4 text-right text-emerald-700 font-bold">{fmtVND(course.paid)}</td>
                      <td className="px-4 py-4 text-right text-red-500 font-semibold">{fmtVND(course.unpaid)}</td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className="inline-block font-black text-sm px-2.5 py-1 rounded-full"
                          style={{
                            background: course.rate >= 80
                              ? 'rgba(5,150,105,0.1)'
                              : course.rate >= 50
                              ? 'rgba(245,158,11,0.1)'
                              : 'rgba(239,68,68,0.1)',
                            color: course.rate >= 80
                              ? '#059669'
                              : course.rate >= 50
                              ? '#d97706'
                              : '#dc2626',
                          }}
                        >
                          {course.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Zone 3: Recent Payments Timeline ────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">🕐 Thanh toán gần đây</h2>
            <p className="text-xs text-gray-500 mt-0.5">10 giao dịch mới nhất</p>
          </div>

          {recentPayments.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              Chưa có giao dịch nào được ghi nhận
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentPayments.map((payment, idx) => {
                const studentName = payment.enrollment.user.name ?? payment.enrollment.user.phone ?? 'Học viên'
                const courseName  = payment.enrollment.course.name
                const timeAgo     = relativeTime(payment.paidAt)
                return (
                  <div key={payment.id} className="px-4 sm:px-6 py-4 flex items-center gap-3 hover:bg-gray-50/50 transition flex-wrap">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        <span className="text-emerald-700">{studentName}</span>
                        <span className="text-gray-400 font-normal"> đóng </span>
                        <span className="font-black text-gray-900">{fmtVND(payment.amount)}</span>
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {courseName} · {timeAgo}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                        ✅ Đã thu
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Zone 4: Quick Nav ─────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Điều hướng nhanh
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <Link
              href="/admin/finance/invoices"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
            >
              <span className="text-2xl">📋</span>
              <span>Hóa đơn</span>
            </Link>
            <Link
              href="/admin/finance/vouchers"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' }}
            >
              <span className="text-2xl">🎫</span>
              <span>Voucher</span>
            </Link>
            <Link
              href="/admin/finance/scholarships"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
            >
              <span className="text-2xl">🎓</span>
              <span>Học bổng</span>
            </Link>
            <Link
              href="/admin/finance/installments"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)' }}
            >
              <span className="text-2xl">📋</span>
              <span>Trả góp</span>
            </Link>
            <Link
              href="/admin/finance/cashflow"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}
            >
              <span className="text-2xl">📈</span>
              <span>Dòng tiền</span>
            </Link>
            <Link
              href="/admin/finance/reports"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
            >
              <span className="text-2xl">📊</span>
              <span>Báo cáo</span>
            </Link>
            <Link
              href="/admin/finance/invoices"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' }}
            >
              <span className="text-2xl">🖨️</span>
              <span>In hóa đơn</span>
            </Link>
            <Link
              href="/admin/finance/forecast"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)' }}
            >
              <span className="text-2xl">📈</span>
              <span>Dự báo</span>
            </Link>
            <Link
              href="/admin/finance/payment-gateway"
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}
            >
              <span className="text-2xl">💳</span>
              <span>Cổng TT</span>
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
