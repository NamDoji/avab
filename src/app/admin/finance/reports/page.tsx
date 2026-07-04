import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Báo cáo tài chính — AvaB' }

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export default async function FinanceReportsPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? ''))
    redirect('/dang-nhap')

  const now            = new Date()
  const thisYear       = now.getFullYear()
  const thisMonth      = now.getMonth()
  const thisMonthStart = new Date(thisYear, thisMonth, 1)
  const lastMonthStart = new Date(thisYear, thisMonth - 1, 1)
  const lastMonthEnd   = new Date(thisYear, thisMonth, 0, 23, 59, 59, 999)
  const yearStart      = new Date(thisYear, 0, 1)
  // Chart covers last 12 months
  const chartStart     = new Date(thisYear, thisMonth - 11, 1)

  const [
    thisMonthAgg,
    lastMonthAgg,
    yearAgg,
    unpaidAgg,
    totalAgg,
    last12Payments,
    collectionsData,
  ] = await Promise.all([
    // KPI 1 — this month
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true, isFree: false, paidAt: { gte: thisMonthStart } },
      _sum: { amount: true },
    }),
    // KPI 1 — last month (for comparison %)
    prisma.tuitionPayment.aggregate({
      where: {
        isPaid: true,
        isFree: false,
        paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
    }),
    // KPI 2 — this year
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true, isFree: false, paidAt: { gte: yearStart } },
      _sum: { amount: true },
    }),
    // KPI 3 — unpaid (debt)
    prisma.tuitionPayment.aggregate({
      where: { isPaid: false, isFree: false },
      _sum: { amount: true },
    }),
    // KPI 4 — total billed (paid + unpaid, excluding free)
    prisma.tuitionPayment.aggregate({
      where: { isFree: false },
      _sum: { amount: true },
    }),
    // Monthly chart data — last 12 months
    prisma.tuitionPayment.findMany({
      where: {
        isPaid: true,
        isFree: false,
        paidAt: { gte: chartStart },
      },
      select: { paidAt: true, amount: true },
    }),
    // Top 20 collections by class for Section 3
    prisma.tuitionCollection.findMany({
      include: {
        course: { select: { name: true, grade: true, campusId: true } },
        payments: {
          where:  { isFree: false },
          select: { amount: true, isPaid: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  // ── KPI values ──────────────────────────────────────────────────────────
  const thisMonthTotal = thisMonthAgg._sum.amount  ?? 0
  const lastMonthTotal = lastMonthAgg._sum.amount  ?? 0
  const yearTotal      = yearAgg._sum.amount       ?? 0
  const unpaidTotal    = unpaidAgg._sum.amount     ?? 0
  const grandTotal     = totalAgg._sum.amount      ?? 0
  const paidTotal      = grandTotal - unpaidTotal
  const collectionRate =
    grandTotal > 0 ? Math.round((paidTotal / grandTotal) * 100) : 0

  const momPct = lastMonthTotal > 0
    ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    : thisMonthTotal > 0 ? 100 : 0
  const momPositive = momPct >= 0

  // ── Monthly chart — group by YYYY-MM ───────────────────────────────────
  const monthlyMap = new Map<string, number>()
  for (const p of last12Payments) {
    if (!p.paidAt) continue
    const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + p.amount)
  }

  const monthlyData: { month: string; label: string; total: number; pct: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d   = new Date(thisYear, thisMonth - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyData.push({
      month: key,
      label: d.toLocaleString('vi-VN', { month: 'short', year: '2-digit' }),
      total: monthlyMap.get(key) ?? 0,
      pct:   0, // filled below
    })
  }
  const maxMonthTotal = Math.max(...monthlyData.map((m) => m.total), 1)
  for (const m of monthlyData) {
    m.pct = Math.round((m.total / maxMonthTotal) * 100)
  }

  // ── Top collections by class ────────────────────────────────────────────
  const topClasses = collectionsData.map((col) => {
    const total     = col.payments.reduce((s, p) => s + p.amount, 0)
    const collected = col.payments.filter((p) => p.isPaid).reduce((s, p) => s + p.amount, 0)
    const remaining = total - collected
    const rate      = total > 0 ? Math.round((collected / total) * 100) : 0
    return {
      id:        col.id,
      title:     col.title,
      courseName: col.course.name,
      grade:     col.course.grade,
      campusId:  col.course.campusId,
      total,
      collected,
      remaining,
      rate,
    }
  })
  .sort((a, b) => b.total - a.total)

  const currentMonthLabel = now.toLocaleString('vi-VN', {
    month: 'long',
    year:  'numeric',
  })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-emerald-300 text-xs mb-2">
            <Link href="/admin/finance" className="hover:text-white transition">
              Finance Dashboard
            </Link>
            <span>›</span>
            <span className="text-white font-semibold">Báo cáo</span>
          </nav>
          <h1 className="text-2xl font-black text-white">📊 Báo cáo tài chính</h1>
          <p className="text-emerald-200 text-sm mt-0.5">
            Tổng hợp doanh thu · {currentMonthLabel}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Section 1 — 4 KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: This month vs last month */}
          <div
            className="rounded-3xl p-6 text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide mb-1">
              💰 Thu tháng này
            </p>
            <p className="text-2xl font-black leading-tight">{fmtVND(thisMonthTotal)}</p>
            <div className="mt-3">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: momPositive ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.3)',
                  color:      'white',
                }}
              >
                {momPositive ? '📈' : '📉'} {momPositive ? '+' : ''}{momPct}% vs tháng trước
              </span>
            </div>
          </div>

          {/* KPI 2: This year total */}
          <div
            className="rounded-3xl p-6 text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
          >
            <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-1">
              📅 Thu năm {thisYear}
            </p>
            <p className="text-2xl font-black leading-tight">{fmtVND(yearTotal)}</p>
            <div className="mt-3">
              <span className="text-xs text-purple-200">Từ đầu năm đến nay</span>
            </div>
          </div>

          {/* KPI 3: Current debt (red if > 0) */}
          <div
            className="rounded-3xl p-6 text-white shadow-md"
            style={{
              background:
                unpaidTotal > 0
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-1"
              style={{ color: unpaidTotal > 0 ? '#fca5a5' : '#d1d5db' }}
            >
              💸 Công nợ hiện tại
            </p>
            <p className="text-2xl font-black leading-tight">{fmtVND(unpaidTotal)}</p>
            <div className="mt-3">
              {unpaidTotal > 0 ? (
                <Link
                  href="/admin/finance/invoices?status=unpaid"
                  className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full hover:bg-white/30 transition"
                >
                  🔴 Xem công nợ →
                </Link>
              ) : (
                <span className="text-xs text-white/70">✅ Không có công nợ</span>
              )}
            </div>
          </div>

          {/* KPI 4: Collection rate */}
          <div
            className="rounded-3xl p-6 text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
          >
            <p className="text-xs font-semibold text-sky-200 uppercase tracking-wide mb-1">
              🎯 Tỷ lệ thu
            </p>
            <p className="text-2xl font-black leading-tight">{collectionRate}%</p>
            <div className="mt-3">
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <p className="text-xs text-sky-200 mt-1">Đã thu / Tổng hóa đơn</p>
            </div>
          </div>
        </div>

        {/* ── Section 2 — Monthly Chart (CSS bars) ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">📈 Doanh thu 12 tháng gần nhất</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tổng thu theo từng tháng (chỉ tính đã thu)
            </p>
          </div>

          <div className="px-6 py-6">
            {monthlyData.every((m) => m.total === 0) ? (
              <p className="text-center text-gray-400 text-sm py-8">
                Chưa có dữ liệu thu trong 12 tháng qua
              </p>
            ) : (
              <div className="space-y-2">
                {monthlyData.map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    {/* Month label */}
                    <span
                      className="text-xs font-semibold text-gray-500 flex-shrink-0"
                      style={{ width: 56, textAlign: 'right' }}
                    >
                      {m.label}
                    </span>

                    {/* Bar */}
                    <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all"
                        style={{
                          width:      `${Math.max(m.pct, m.total > 0 ? 2 : 0)}%`,
                          background: m.month === `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`
                            ? 'linear-gradient(90deg, #059669, #34d399)'
                            : 'linear-gradient(90deg, #10b981, #6ee7b7)',
                        }}
                      />
                    </div>

                    {/* Amount */}
                    <span
                      className="text-xs font-bold text-gray-700 flex-shrink-0"
                      style={{ minWidth: 110, textAlign: 'right' }}
                    >
                      {m.total > 0 ? fmtVND(m.total) : <span className="text-gray-300">—</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Section 3 — Top revenue by class ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">🏫 Doanh thu theo lớp học</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              20 đợt thu gần nhất · Sắp xếp theo tổng hóa đơn
            </p>
          </div>

          {topClasses.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              Chưa có dữ liệu thu học phí
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                    <th className="text-left px-6 py-3">Lớp học / Đợt thu</th>
                    <th className="text-right px-4 py-3">Tổng HĐ</th>
                    <th className="text-right px-4 py-3">Đã thu</th>
                    <th className="text-center px-4 py-3">% Thu</th>
                    <th className="text-right px-6 py-3">Còn lại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/finance/invoices/${cls.id}`}
                          className="font-semibold text-gray-800 hover:text-emerald-700 transition block"
                        >
                          {cls.title}
                        </Link>
                        <span className="text-xs text-gray-400">
                          {cls.courseName}
                          {cls.grade ? ` · Lớp ${cls.grade}` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-600 font-medium">
                        {fmtVND(cls.total)}
                      </td>
                      <td className="px-4 py-4 text-right text-emerald-700 font-bold">
                        {fmtVND(cls.collected)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className="inline-block font-black text-sm px-2.5 py-1 rounded-full"
                          style={{
                            background:
                              cls.rate >= 80
                                ? 'rgba(5,150,105,0.1)'
                                : cls.rate >= 50
                                ? 'rgba(245,158,11,0.1)'
                                : 'rgba(239,68,68,0.1)',
                            color:
                              cls.rate >= 80
                                ? '#059669'
                                : cls.rate >= 50
                                ? '#d97706'
                                : '#dc2626',
                          }}
                        >
                          {cls.rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {cls.remaining > 0 ? (
                          <span className="text-red-600 font-bold">{fmtVND(cls.remaining)}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Section 4 — Export ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-lg mb-1">📥 Xuất báo cáo</h2>
          <p className="text-xs text-gray-500 mb-5">
            Tải xuống báo cáo dạng Excel (.xlsx) với nhiều sheet tổng hợp
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/admin/finance/export?period=month"
              download
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
            >
              📥 Xuất báo cáo tháng này (.xlsx)
            </a>
            <a
              href="/api/admin/finance/export?period=year"
              download
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
            >
              📥 Xuất báo cáo năm nay (.xlsx)
            </a>
            <a
              href="/api/admin/finance/export?period=all"
              download
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm bg-white border border-gray-200"
            >
              📥 Xuất tất cả (.xlsx)
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
