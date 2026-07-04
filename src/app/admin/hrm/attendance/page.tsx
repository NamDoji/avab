import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TimesheetForm from './TimesheetForm'

export const metadata = { title: 'Chấm công — HRM — AvaB Admin' }

type RangeKey = 'today' | 'week' | 'month'

function getDateRange(range: RangeKey): { from: Date; to: Date; label: string } {
  const now = new Date()
  if (range === 'today') {
    const from = new Date(now); from.setHours(0, 0, 0, 0)
    const to = new Date(now); to.setHours(23, 59, 59, 999)
    return { from, to, label: 'Hôm nay' }
  }
  if (range === 'week') {
    const day = now.getDay() || 7
    const from = new Date(now); from.setDate(now.getDate() - day + 1); from.setHours(0, 0, 0, 0)
    const to = new Date(from); to.setDate(from.getDate() + 6); to.setHours(23, 59, 59, 999)
    return { from, to, label: 'Tuần này' }
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { from, to, label: 'Tháng này' }
}

function statusBadge(row: { checkIn: Date | null; checkOut: Date | null; hoursWorked: number | null }) {
  if (!row.checkIn) return { label: 'Vắng', color: 'bg-red-100 text-red-700' }
  if (!row.checkOut) return { label: 'Chưa ra', color: 'bg-yellow-100 text-yellow-700' }
  const h = row.hoursWorked ?? 0
  if (h >= 8) return { label: 'Đủ giờ', color: 'bg-green-100 text-green-700' }
  return { label: 'Thiếu giờ', color: 'bg-orange-100 text-orange-700' }
}

function fmt(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function HRMAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const sp = await searchParams
  const range = (sp.range as RangeKey) ?? 'week'
  const { from, to } = getDateRange(range)

  const [timesheets, staff] = await Promise.all([
    prisma.timesheet.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: 'desc' },
      take: 200,
    }),
    prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'TEACHER'] } },
      select: { id: true, name: true, avatar: true, role: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const userMap = Object.fromEntries(staff.map((u) => [u.id, u]))

  // Summary stats
  const totalRecords = timesheets.length
  const doneRecords = timesheets.filter((t) => t.checkIn && t.checkOut).length
  const totalHours = timesheets.reduce((s, t) => s + (t.hoursWorked ?? 0), 0)

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'week', label: 'Tuần này' },
    { key: 'month', label: 'Tháng này' },
  ]

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-sky-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">Chấm công</span>
          </div>
          <h1 className="text-3xl font-black mb-1">⏰ Chấm công nhân viên</h1>
          <p className="text-sky-100 text-sm">Check-in / Check-out, theo dõi giờ làm việc</p>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm">
            {[
              { label: 'Bản ghi', value: totalRecords, icon: '📋' },
              { label: 'Hoàn thành', value: doneRecords, icon: '✅' },
              { label: 'Tổng giờ', value: `${totalHours.toFixed(1)}h`, icon: '⏱️' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-xs text-sky-100 mt-0.5">{s.icon} {s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-5">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date range tabs */}
          <div className="flex gap-2 bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
            {RANGES.map((r) => (
              <Link
                key={r.key}
                href={`?range=${r.key}`}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  range === r.key
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>

          {/* Action buttons */}
          <TimesheetForm staff={staff} />
        </div>

        {/* Staff grid */}
        {timesheets.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-6xl mb-3">📭</div>
            <h3 className="text-xl font-black text-gray-700 mb-2">Chưa có dữ liệu chấm công</h3>
            <p className="text-gray-400 text-sm">Nhấn &quot;Seed dữ liệu mẫu&quot; để tạo nhanh 10 bản ghi mẫu</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-black text-gray-700">
                📋 {timesheets.length} bản ghi
              </p>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-bold text-gray-600 text-xs">Nhân viên</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Ngày</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Check-in</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Check-out</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Giờ làm</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map((t) => {
                    const u = userMap[t.userId]
                    const badge = statusBadge(t)
                    return (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-black text-sm flex-shrink-0">
                              {u?.avatar ? (
                                <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                              ) : (
                                (u?.name?.[0] ?? '?').toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{u?.name ?? 'Không rõ'}</div>
                              <div className="text-xs text-gray-400">{u?.role ?? ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{fmtDate(t.date)}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{fmt(t.checkIn)}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{fmt(t.checkOut)}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-800">
                            {t.hoursWorked != null ? `${t.hoursWorked}h` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
