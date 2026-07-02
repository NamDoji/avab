'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Loader2, TrendingUp, DollarSign, Clock, Gift, Users } from 'lucide-react'

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'
const fmtK = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

interface Summary {
  expectedRevenue: number
  collectedRevenue: number
  pendingRevenue: number
  freeCount: number
  activeEnrollments: number
}

interface MonthlyEntry {
  month: string
  collected: number
  pending: number
}

interface CourseStats {
  id: string
  name: string
  grade: string | null
  courseType: string
  students: number
  collected: number
  pending: number
  total: number
  completionPct: number
}

interface LogEntry {
  course: string
  collection: string
  student: string
  amount: number
  isPaid: boolean
  paidAt: string | null
}

interface FinanceData {
  summary: Summary
  monthlyData: MonthlyEntry[]
  courseStats: CourseStats[]
  recentLogs: LogEntry[]
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch('/api/admin/finance/summary')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/finance/export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `avab-finance-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Không thể xuất file') }
    setExporting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin mr-2" size={24} /> Đang tải dữ liệu tài chính...
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Không thể tải dữ liệu
    </div>
  )

  const { summary, monthlyData, courseStats, recentLogs } = data
  const maxBar = Math.max(...monthlyData.map(m => m.collected + m.pending), 1)

  const MONTH_LABELS: Record<string, string> = {
    '01': 'T1', '02': 'T2', '03': 'T3', '04': 'T4', '05': 'T5', '06': 'T6',
    '07': 'T7', '08': 'T8', '09': 'T9', '10': 'T10', '11': 'T11', '12': 'T12',
  }
  const formatMonth = (m: string) => {
    const [year, month] = m.split('-')
    return `${MONTH_LABELS[month] ?? month}/${year.slice(2)}`
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-xl hover:bg-gray-200 transition text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900">💰 Tài chính</h1>
              <p className="text-gray-400 text-sm">Tổng quan doanh thu & học phí</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Xuất Excel
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Tổng dự kiến', value: fmt(summary.expectedRevenue), icon: TrendingUp, color: 'from-purple-500 to-purple-700', fmtV: fmtK(summary.expectedRevenue) },
            { label: 'Đã thu', value: fmt(summary.collectedRevenue), icon: DollarSign, color: 'from-teal-500 to-teal-700', fmtV: fmtK(summary.collectedRevenue) },
            { label: 'Còn thiếu', value: fmt(summary.pendingRevenue), icon: Clock, color: 'from-orange-500 to-orange-700', fmtV: fmtK(summary.pendingRevenue) },
            { label: 'Miễn phí', value: `${summary.freeCount} HS`, icon: Gift, color: 'from-blue-500 to-blue-700', fmtV: String(summary.freeCount) },
            { label: 'Đang học', value: `${summary.activeEnrollments} HS`, icon: Users, color: 'from-pink-500 to-pink-700', fmtV: String(summary.activeEnrollments) },
          ].map(card => (
            <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-3xl p-5 text-white`}>
              <card.icon size={24} className="mb-2 opacity-80" />
              <div className="text-2xl font-black">{card.fmtV}</div>
              <div className="text-xs opacity-80 mt-0.5">{card.label}</div>
              <div className="text-xs opacity-60 mt-1 truncate">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" /> Doanh thu theo tháng
          </h2>
          <div className="flex items-end gap-1 h-40 overflow-x-auto">
            {monthlyData.map(m => {
              const totalH = Math.round(((m.collected + m.pending) / maxBar) * 100)
              const paidH = Math.round((m.collected / maxBar) * 100)
              return (
                <div key={m.month} className="flex-shrink-0 flex flex-col items-center gap-1 group" style={{ minWidth: '40px' }}>
                  <div className="relative w-8 flex flex-col justify-end" style={{ height: '120px' }}>
                    {/* Total bar (background) */}
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-orange-100 transition-all"
                      style={{ height: `${totalH}%` }}
                    />
                    {/* Collected bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-teal-500 transition-all"
                      style={{ height: `${paidH}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium mt-1">{formatMonth(m.month)}</div>
                  {/* Tooltip */}
                  <div className="absolute -top-10 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                    {fmtK(m.collected)} đã thu
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-500 inline-block" /> Đã thu</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-100 inline-block" /> Dự kiến</span>
          </div>
        </div>

        {/* Course stats table */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-900 mb-5">📚 Theo khoá học</h2>
          {courseStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Chưa có dữ liệu thu học phí</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-xs">
                    <th className="text-left pb-3 font-medium">Tên khoá</th>
                    <th className="text-left pb-3 font-medium">Lớp</th>
                    <th className="text-right pb-3 font-medium">Học viên</th>
                    <th className="text-right pb-3 font-medium">Đã thu</th>
                    <th className="text-right pb-3 font-medium">Còn thiếu</th>
                    <th className="text-right pb-3 font-medium">% HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courseStats.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-4">
                        <Link href={`/admin/courses/${c.id}/tuition`} className="font-semibold text-gray-800 hover:text-purple-600 transition">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{c.grade ? `Lớp ${c.grade}` : '—'}</td>
                      <td className="py-3 pr-4 text-right text-gray-600">{c.students}</td>
                      <td className="py-3 pr-4 text-right text-teal-600 font-semibold">{fmt(c.collected)}</td>
                      <td className="py-3 pr-4 text-right text-orange-500 font-semibold">{fmt(c.pending)}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${c.completionPct}%` }} />
                          </div>
                          <span className={`font-bold text-xs ${c.completionPct >= 80 ? 'text-teal-600' : c.completionPct >= 50 ? 'text-yellow-600' : 'text-orange-500'}`}>
                            {c.completionPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent log */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-900 mb-5">📋 Lịch sử thu học phí gần đây</h2>
          {recentLogs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Chưa có giao dịch nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-xs">
                    <th className="text-left pb-3 font-medium">Khoá học</th>
                    <th className="text-left pb-3 font-medium">Đợt thu</th>
                    <th className="text-left pb-3 font-medium">Học viên</th>
                    <th className="text-right pb-3 font-medium">Số tiền</th>
                    <th className="text-center pb-3 font-medium">Trạng thái</th>
                    <th className="text-right pb-3 font-medium">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="py-2.5 pr-3 text-gray-700 font-medium max-w-[160px] truncate">{log.course}</td>
                      <td className="py-2.5 pr-3 text-gray-500 text-xs max-w-[140px] truncate">{log.collection}</td>
                      <td className="py-2.5 pr-3 text-gray-700">{log.student}</td>
                      <td className="py-2.5 pr-3 text-right text-purple-700 font-bold">{fmt(log.amount)}</td>
                      <td className="py-2.5 pr-3 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${log.isPaid ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-600'}`}>
                          {log.isPaid ? 'Đã thu' : 'Chưa'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-400 text-xs">
                        {log.paidAt ? new Date(log.paidAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
