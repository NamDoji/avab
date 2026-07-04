import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Dòng Tiền — AvaB Finance' }

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const fmtVNDShort = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function getMonthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString('vi-VN', { month: 'short', year: 'numeric' })
}

export default async function CashflowPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) redirect('/dang-nhap')

  // Get last 12 months
  const now = new Date()
  const months: { year: number; month: number; label: string }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: getMonthLabel(d.getFullYear(), d.getMonth() + 1) })
  }

  const startDate = new Date(months[0].year, months[0].month - 1, 1)

  // Load all paid payments in range
  const payments = await prisma.tuitionPayment.findMany({
    where: {
      isPaid: true,
      isFree: false,
      paidAt: { gte: startDate },
    },
    select: { amount: true, paidAt: true },
  })

  // Group by month
  const monthlyRevenue = new Map<string, number>()
  for (const p of payments) {
    if (!p.paidAt) continue
    const key = `${p.paidAt.getFullYear()}-${p.paidAt.getMonth() + 1}`
    monthlyRevenue.set(key, (monthlyRevenue.get(key) ?? 0) + p.amount)
  }

  const chartData = months.map(m => ({
    ...m,
    key: `${m.year}-${m.month}`,
    income: monthlyRevenue.get(`${m.year}-${m.month}`) ?? 0,
    expense: 0, // placeholder — chi ra sẽ tích hợp sau với HRM payroll
  }))

  const maxValue = Math.max(...chartData.map(d => d.income), 1)
  const totalIncome = chartData.reduce((s, d) => s + d.income, 0)
  const currentMonthIncome = chartData[chartData.length - 1]?.income ?? 0
  const prevMonthIncome = chartData[chartData.length - 2]?.income ?? 0
  const momChange = prevMonthIncome > 0
    ? Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100)
    : currentMonthIncome > 0 ? 100 : 0
  const avgMonthly = chartData.length > 0 ? Math.round(totalIncome / chartData.length) : 0

  // Best month
  const bestMonth = chartData.reduce((best, m) => m.income > best.income ? m : best, chartData[0])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="px-4 sm:px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/finance"
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white">📈 Dòng Tiền</h1>
                <p className="text-indigo-200 text-sm mt-0.5">
                  Thu – Chi 12 tháng gần nhất
                </p>
              </div>
            </div>
            {/* Export */}
            <Link
              href="/api/admin/finance/export"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition"
            >
              📥 Xuất Excel
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)' }}>
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide mb-1">📈 Tháng này</p>
            <p className="text-2xl font-black leading-tight">{fmtVND(currentMonthIncome)}</p>
            <div className="mt-3">
              <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                {momChange >= 0 ? '📈' : '📉'} {momChange >= 0 ? '+' : ''}{momChange}% vs tháng trước
              </span>
            </div>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
            <p className="text-xs font-semibold text-sky-200 uppercase tracking-wide mb-1">📊 Trung bình/tháng</p>
            <p className="text-2xl font-black leading-tight">{fmtVND(avgMonthly)}</p>
            <div className="mt-3">
              <span className="text-xs text-sky-200">Dựa trên 12 tháng</span>
            </div>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide mb-1">💰 Tổng 12 tháng</p>
            <p className="text-2xl font-black leading-tight">{fmtVND(totalIncome)}</p>
            <div className="mt-3">
              <span className="text-xs text-emerald-200">Thu học phí</span>
            </div>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}>
            <p className="text-xs font-semibold text-amber-200 uppercase tracking-wide mb-1">🏆 Tháng cao nhất</p>
            <p className="text-2xl font-black leading-tight">{fmtVND(bestMonth?.income ?? 0)}</p>
            <div className="mt-3">
              <span className="text-xs text-amber-200">{bestMonth?.label ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900 text-lg">📊 Thu nhập theo tháng</h2>
              <p className="text-xs text-gray-500 mt-0.5">12 tháng gần nhất — học phí thu được</p>
            </div>
            <div className="flex gap-4 text-xs flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)' }} />
                <span className="text-gray-600 font-medium">Thu vào</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block bg-red-300" />
                <span className="text-gray-400 font-medium">Chi ra (sắp có)</span>
              </span>
            </div>
          </div>

          <div className="px-6 py-6">
            {/* CSS Bar Chart */}
            <div className="flex items-end gap-2 h-48 overflow-x-auto pb-4">
              {chartData.map((d) => {
                const barH = maxValue > 0 ? Math.max(4, Math.round((d.income / maxValue) * 180)) : 4
                const isCurrentMonth = d.year === now.getFullYear() && d.month === now.getMonth() + 1
                return (
                  <div
                    key={d.key}
                    className="flex flex-col items-center gap-1 flex-shrink-0"
                    style={{ minWidth: '56px' }}
                  >
                    {/* Value tooltip */}
                    {d.income > 0 && (
                      <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                        {fmtVNDShort(d.income)}
                      </span>
                    )}
                    {/* Income bar */}
                    <div
                      className="w-10 rounded-t-xl transition-all relative group cursor-default"
                      style={{
                        height: `${barH}px`,
                        background: isCurrentMonth
                          ? 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)'
                          : 'linear-gradient(180deg, #a5b4fc 0%, #818cf8 100%)',
                        boxShadow: isCurrentMonth ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                      }}
                    >
                      {/* Hover tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                          {fmtVND(d.income)}
                        </div>
                      </div>
                    </div>
                    {/* Month label */}
                    <span
                      className={`text-xs font-semibold ${
                        isCurrentMonth ? 'text-indigo-600' : 'text-gray-400'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      {d.label.split(' ')[0]}
                    </span>
                    <span
                      className="text-gray-300"
                      style={{ fontSize: '9px' }}
                    >
                      {d.year}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Note about chi ra */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-sm text-amber-800 font-semibold">💡 Chi ra sẽ được tích hợp sau</p>
              <p className="text-xs text-amber-700 mt-1">
                Dữ liệu chi ra (lương, vận hành, tiện ích) sẽ được đồng bộ từ module HRM & Kế toán. 
                Hiện tại chỉ hiển thị dòng tiền thu vào từ học phí.
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Detail Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">📋 Chi tiết theo tháng</h2>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                  <th className="text-left px-6 py-3">Tháng</th>
                  <th className="text-right px-4 py-3">Thu vào</th>
                  <th className="text-right px-4 py-3">Chi ra</th>
                  <th className="text-right px-4 py-3">Lợi nhuận</th>
                  <th className="text-right px-6 py-3">So tháng trước</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...chartData].reverse().map((d, idx, arr) => {
                  const prev = arr[idx + 1]
                  const change = prev && prev.income > 0
                    ? Math.round(((d.income - prev.income) / prev.income) * 100)
                    : null
                  const isCurrentMonth = d.year === now.getFullYear() && d.month === now.getMonth() + 1

                  return (
                    <tr
                      key={d.key}
                      className={`hover:bg-indigo-50/30 transition ${isCurrentMonth ? 'bg-indigo-50/20' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isCurrentMonth && (
                            <span className="text-xs font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-md">Hiện tại</span>
                          )}
                          <span className="font-semibold text-gray-800">{d.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-emerald-700">
                        {d.income > 0 ? fmtVND(d.income) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-400">
                        <span className="text-xs italic">N/A</span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-indigo-700">
                        {d.income > 0 ? fmtVND(d.income) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {change !== null ? (
                          <span
                            className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                              change >= 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {change >= 0 ? '+' : ''}{change}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/finance"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            ← Về Finance Dashboard
          </Link>
          <Link
            href="/admin/finance/reports"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
          >
            📊 Xem báo cáo chi tiết
          </Link>
          <Link
            href="/api/admin/finance/export"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            📥 Xuất Excel
          </Link>
        </div>
      </div>
    </main>
  )
}
