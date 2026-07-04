import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Dự báo doanh thu — AvaB Finance' }

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const fmtShort = (n: number): string => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' tr'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k'
  return n.toString()
}

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

export default async function ForecastPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN')
    redirect('/dang-nhap')

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // ── Actual revenue last 6 months ──────────────────────────────────────
  const lastSixMonthsRaw = await prisma.tuitionPayment.findMany({
    where: {
      isPaid: true,
      isFree: false,
      paidAt: { gte: sixMonthsAgo },
    },
    select: { paidAt: true, amount: true },
  })

  // ── Expected (unpaid, non-free) ────────────────────────────────────────
  const expectedRevenue = await prisma.tuitionPayment.aggregate({
    where: { isPaid: false, isFree: false },
    _sum: { amount: true },
    _count: true,
  })

  // ── Build monthly buckets for the last 6 months ───────────────────────
  const monthlyActual: Map<string, number> = new Map()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyActual.set(key, 0)
  }
  for (const p of lastSixMonthsRaw) {
    if (!p.paidAt) continue
    const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`
    if (monthlyActual.has(key)) {
      monthlyActual.set(key, (monthlyActual.get(key) ?? 0) + p.amount)
    }
  }

  const monthlyData = Array.from(monthlyActual.entries()).map(([key, amount]) => {
    const [year, month] = key.split('-').map(Number)
    return {
      key,
      label: `${MONTH_NAMES[month - 1]}/${String(year).slice(-2)}`,
      amount,
      year,
      month,
    }
  })

  // ── Linear trend forecast (next 3 months) ────────────────────────────
  const actualAmounts = monthlyData.map((m) => m.amount)
  const n = actualAmounts.length
  const avgActual = n > 0 ? actualAmounts.reduce((s, v) => s + v, 0) / n : 0

  // Simple linear regression: y = a + b*x
  const xBar = (n - 1) / 2
  const yBar = avgActual
  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (i - xBar) * (actualAmounts[i] - yBar)
    denominator += (i - xBar) ** 2
  }
  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = yBar - slope * xBar

  const forecastMonths = [1, 2, 3].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const predicted = Math.max(0, Math.round(intercept + slope * (n - 1 + offset)))
    return {
      label: `${MONTH_NAMES[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`,
      amount: predicted,
    }
  })

  // ── Key insights ──────────────────────────────────────────────────────
  const nonZeroMonths = actualAmounts.filter((v) => v > 0)
  const bestMonthIdx = actualAmounts.indexOf(Math.max(...actualAmounts))
  const bestMonth = monthlyData[bestMonthIdx]
  const growthPct =
    actualAmounts[0] > 0
      ? Math.round(((actualAmounts[n - 1] - actualAmounts[0]) / actualAmounts[0]) * 100)
      : actualAmounts[n - 1] > 0
      ? 100
      : 0
  const avgMonthly = nonZeroMonths.length > 0
    ? nonZeroMonths.reduce((s, v) => s + v, 0) / nonZeroMonths.length
    : 0

  const expectedAmt = expectedRevenue._sum.amount ?? 0

  // Chart max value
  const allAmounts = [
    ...actualAmounts,
    ...forecastMonths.map((f) => f.amount),
    expectedAmt,
  ]
  const chartMax = Math.max(...allAmounts, 1)

  return (
    <main className="min-h-screen bg-gray-50 pt-14">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/admin/finance"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <nav className="flex items-center gap-2 text-blue-300 text-xs">
              <Link href="/admin/finance" className="hover:text-white transition">Finance</Link>
              <span>›</span>
              <span className="text-white font-semibold">Dự báo doanh thu</span>
            </nav>
          </div>
          <h1 className="text-2xl font-black text-white">📈 Dự báo doanh thu</h1>
          <p className="text-blue-200 text-sm mt-1">
            6 tháng thực tế + dự báo 3 tháng tới dựa trên xu hướng
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── KPI Top Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl p-5 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide mb-1">📊 TB tháng</p>
            <p className="text-xl font-black leading-tight">{fmtVND(Math.round(avgMonthly))}</p>
            <p className="text-xs text-emerald-200 mt-1">Tháng có doanh thu</p>
          </div>
          <div className="rounded-3xl p-5 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
            <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide mb-1">🏆 Tháng cao nhất</p>
            <p className="text-xl font-black leading-tight">{fmtVND(bestMonth?.amount ?? 0)}</p>
            <p className="text-xs text-yellow-200 mt-1">{bestMonth?.label ?? '—'}</p>
          </div>
          <div
            className="rounded-3xl p-5 text-white shadow-sm"
            style={{
              background: growthPct >= 0
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            }}
          >
            <p className="text-xs font-semibold text-sky-200 uppercase tracking-wide mb-1">📉 Tăng trưởng 6T</p>
            <p className="text-xl font-black leading-tight">
              {growthPct > 0 ? '+' : ''}{growthPct}%
            </p>
            <p className="text-xs text-sky-200 mt-1">So tháng đầu vs cuối</p>
          </div>
          <div className="rounded-3xl p-5 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
            <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-1">💸 Chưa thu</p>
            <p className="text-xl font-black leading-tight">{fmtVND(expectedAmt)}</p>
            <p className="text-xs text-purple-200 mt-1">{expectedRevenue._count} hóa đơn</p>
          </div>
        </div>

        {/* ── Actual vs Expected Bar ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-black text-gray-900 text-lg mb-1">📊 Thực thu vs Công nợ</h2>
          <p className="text-xs text-gray-500 mb-6">So sánh doanh thu đã thu và doanh thu chưa thu</p>

          {/* Big comparison */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Actual */}
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">✅ Đã thu (6T)</span>
                <span className="font-black text-emerald-700 text-sm">
                  {fmtVND(actualAmounts.reduce((s, v) => s + v, 0))}
                </span>
              </div>
              <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((actualAmounts.reduce((s, v) => s + v, 0) / Math.max(actualAmounts.reduce((s, v) => s + v, 0) + expectedAmt, 1)) * 100))}%`,
                    background: 'linear-gradient(90deg, #059669, #10b981)',
                  }}
                />
              </div>
            </div>
            {/* Pending */}
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🔴 Công nợ</span>
                <span className="font-black text-red-600 text-sm">{fmtVND(expectedAmt)}</span>
              </div>
              <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((expectedAmt / Math.max(actualAmounts.reduce((s, v) => s + v, 0) + expectedAmt, 1)) * 100))}%`,
                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Monthly Trend Chart ────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-black text-gray-900 text-lg mb-1">📅 Xu hướng doanh thu theo tháng</h2>
          <p className="text-xs text-gray-500 mb-6">6 tháng thực tế + dự báo 3 tháng tới</p>

          {/* CSS Bar Chart */}
          <div className="flex items-end gap-3 h-48">
            {/* Actual months */}
            {monthlyData.map((m, i) => {
              const heightPct = chartMax > 0 ? Math.max(4, Math.round((m.amount / chartMax) * 100)) : 4
              const isCurrentMonth = i === monthlyData.length - 1
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-xs text-gray-500 font-medium">{fmtShort(m.amount)}</span>
                  <div
                    className="w-full rounded-t-xl transition-all relative group"
                    style={{
                      height: `${heightPct}%`,
                      background: isCurrentMonth
                        ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
                      minHeight: '8px',
                    }}
                    title={`${m.label}: ${fmtVND(m.amount)}`}
                  >
                    {isCurrentMonth && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-700 whitespace-nowrap">
                        Tháng này
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{m.label}</span>
                </div>
              )
            })}

            {/* Divider */}
            <div className="flex flex-col items-center justify-end h-full">
              <div className="w-px h-40 border-l-2 border-dashed border-blue-300 opacity-60" />
              <span className="text-xs text-blue-400 font-semibold mt-1 rotate-90 translate-y-6 whitespace-nowrap">
                Dự báo →
              </span>
            </div>

            {/* Forecast months */}
            {forecastMonths.map((m) => {
              const heightPct = chartMax > 0 ? Math.max(4, Math.round((m.amount / chartMax) * 100)) : 4
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-xs text-blue-500 font-medium">{fmtShort(m.amount)}</span>
                  <div
                    className="w-full rounded-t-xl transition-all"
                    style={{
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%)',
                      minHeight: '8px',
                      opacity: 0.7,
                      border: '2px dashed #3b82f6',
                    }}
                    title={`Dự báo ${m.label}: ${fmtVND(m.amount)}`}
                  />
                  <span className="text-xs text-blue-400 font-medium">{m.label}</span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(180deg, #34d399, #10b981)' }} />
              <span className="text-xs text-gray-500 font-medium">Doanh thu thực tế</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border-2 border-dashed border-blue-400" style={{ background: '#93c5fd', opacity: 0.7 }} />
              <span className="text-xs text-gray-500 font-medium">Dự báo (linear trend)</span>
            </div>
          </div>
        </div>

        {/* ── Forecast Table ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">🔮 Dự báo chi tiết 3 tháng tới</h2>
            <p className="text-xs text-gray-500 mt-0.5">Dựa trên hồi quy tuyến tính từ xu hướng 6 tháng</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                  <th className="text-left px-6 py-3">Tháng</th>
                  <th className="text-right px-4 py-3">Dự báo doanh thu</th>
                  <th className="text-right px-4 py-3">So TB 6T</th>
                  <th className="text-right px-6 py-3">Xu hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {forecastMonths.map((m) => {
                  const diffPct = avgMonthly > 0
                    ? Math.round(((m.amount - avgMonthly) / avgMonthly) * 100)
                    : 0
                  return (
                    <tr key={m.label} className="hover:bg-blue-50/30 transition">
                      <td className="px-6 py-4 font-bold text-gray-800">📅 {m.label}</td>
                      <td className="px-4 py-4 text-right font-black text-blue-700">
                        {fmtVND(m.amount)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className="font-bold text-sm px-2 py-0.5 rounded-full"
                          style={{
                            background: diffPct >= 0 ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.1)',
                            color: diffPct >= 0 ? '#059669' : '#dc2626',
                          }}
                        >
                          {diffPct > 0 ? '+' : ''}{diffPct}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-lg">
                        {slope > 0 ? '📈' : slope < 0 ? '📉' : '➡️'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Key Insights ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-black text-gray-900 text-lg mb-4">💡 Phân tích nhanh</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">TB tháng thực tế</p>
              <p className="text-lg font-black text-emerald-800">{fmtVND(Math.round(avgMonthly))}</p>
              <p className="text-xs text-emerald-600 mt-1">Tính trên tháng có doanh thu</p>
            </div>
            <div className="rounded-2xl p-4 bg-yellow-50 border border-yellow-100">
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-1">Tháng cao nhất</p>
              <p className="text-lg font-black text-yellow-800">{bestMonth?.label ?? '—'}</p>
              <p className="text-xs text-yellow-600 mt-1">{fmtVND(bestMonth?.amount ?? 0)}</p>
            </div>
            <div
              className="rounded-2xl p-4 border"
              style={{
                background: growthPct >= 0 ? '#f0fdf4' : '#fef2f2',
                borderColor: growthPct >= 0 ? '#bbf7d0' : '#fecaca',
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: growthPct >= 0 ? '#059669' : '#dc2626' }}
              >
                Tăng trưởng
              </p>
              <p
                className="text-lg font-black"
                style={{ color: growthPct >= 0 ? '#065f46' : '#991b1b' }}
              >
                {growthPct > 0 ? '+' : ''}{growthPct}%
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: growthPct >= 0 ? '#059669' : '#dc2626' }}
              >
                So sánh tháng đầu → tháng gần nhất
              </p>
            </div>
          </div>

          {/* Slope interpretation */}
          <div
            className="mt-4 rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: slope > 0 ? '#eff6ff' : slope < 0 ? '#fef2f2' : '#f9fafb',
              border: `1px solid ${slope > 0 ? '#bfdbfe' : slope < 0 ? '#fecaca' : '#e5e7eb'}`,
            }}
          >
            <span className="text-2xl">{slope > 0 ? '🚀' : slope < 0 ? '⚠️' : '➡️'}</span>
            <div>
              <p className="font-black text-sm text-gray-900">
                {slope > 0
                  ? 'Xu hướng tích cực — Doanh thu đang tăng trưởng!'
                  : slope < 0
                  ? 'Xu hướng giảm — Cần phân tích nguyên nhân'
                  : 'Xu hướng ổn định — Doanh thu không đổi'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Tốc độ thay đổi TB: {slope > 0 ? '+' : ''}{fmtVND(Math.round(Math.abs(slope)))} mỗi tháng
              </p>
            </div>
          </div>
        </div>

        <div>
          <Link href="/admin/finance" className="text-sm text-gray-500 hover:text-gray-800 transition">
            ← Quay về Finance Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
