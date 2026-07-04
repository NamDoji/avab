import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LeaveActions from './LeaveActions'
import CreateLeaveModal from './CreateLeaveModal'

export const metadata = { title: 'Nghỉ phép — HRM — AvaB Admin' }

const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: '🌴 Phép năm',
  sick: '🤒 Ốm',
  unpaid: '💼 Không lương',
  maternity: '👶 Thai sản',
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Chờ duyệt',
  approved: '✅ Đã duyệt',
  rejected: '❌ Từ chối',
}

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function HRMLeafPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const [requests, staff] = await Promise.all([
    prisma.leaveRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'TEACHER'] } },
      select: { id: true, name: true, avatar: true, role: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const userMap = Object.fromEntries(staff.map((u) => [u.id, u]))

  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const approvedCount = requests.filter((r) => r.status === 'approved').length
  const totalDays = requests.filter((r) => r.status === 'approved').reduce((s, r) => s + r.days, 0)

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-amber-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">Nghỉ phép</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black mb-1">🌴 Nghỉ phép</h1>
              <p className="text-amber-100 text-sm">Quản lý đơn xin nghỉ, phê duyệt và theo dõi ngày phép</p>
            </div>
            {pendingCount > 0 && (
              <div className="bg-red-500 text-white rounded-2xl px-4 py-2 text-sm font-black shadow-lg">
                🔔 {pendingCount} đơn chờ duyệt
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm">
            {[
              { label: 'Chờ duyệt', value: pendingCount, icon: '⏳' },
              { label: 'Đã duyệt', value: approvedCount, icon: '✅' },
              { label: 'Tổng ngày', value: `${totalDays}`, icon: '📅' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-xs text-amber-100 mt-0.5">{s.icon} {s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-5">
        {/* Actions bar */}
        <div className="flex items-center justify-end gap-3">
          <CreateLeaveModal staff={staff} />
        </div>

        {/* Pending section */}
        {pendingCount > 0 && (
          <div>
            <p className="text-sm font-black text-gray-700 mb-3">
              ⏳ Chờ phê duyệt
              <span className="ml-2 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-black">
                {pendingCount}
              </span>
            </p>
            <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
              <LeaveTable
                rows={requests.filter((r) => r.status === 'pending')}
                userMap={userMap}
              />
            </div>
          </div>
        )}

        {/* All requests */}
        <div>
          <p className="text-sm font-black text-gray-700 mb-3">
            📋 Tất cả đơn nghỉ phép ({requests.length})
          </p>
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="text-6xl mb-3">🌴</div>
              <h3 className="text-xl font-black text-gray-700 mb-2">Chưa có đơn nghỉ phép nào</h3>
              <p className="text-gray-400 text-sm">Nhấn &quot;+ Tạo đơn nghỉ phép&quot; để bắt đầu</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <LeaveTable rows={requests} userMap={userMap} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-component ────────────────────────────────────────────────────────────

type LeaveRow = {
  id: string
  userId: string
  type: string
  startDate: Date
  endDate: Date
  days: number
  reason: string | null
  status: string
  createdAt: Date
}

function fmtDate2(d: Date) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function LeaveTable({
  rows,
  userMap,
}: {
  rows: LeaveRow[]
  userMap: Record<string, { name: string | null; avatar: string | null; role: string }>
}) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-3 font-bold text-gray-600 text-xs">Nhân viên</th>
            <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Loại nghỉ</th>
            <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Từ</th>
            <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Đến</th>
            <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Số ngày</th>
            <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Lý do</th>
            <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Trạng thái</th>
            <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const u = userMap[r.userId]
            return (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-sm flex-shrink-0">
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
                <td className="px-4 py-3 text-gray-700">{LEAVE_TYPE_LABELS[r.type] ?? r.type}</td>
                <td className="px-4 py-3 text-gray-700 font-medium">{fmtDate2(r.startDate)}</td>
                <td className="px-4 py-3 text-gray-700 font-medium">{fmtDate2(r.endDate)}</td>
                <td className="px-4 py-3">
                  <span className="font-black text-gray-800">{r.days}</span>
                  <span className="text-gray-500 text-xs ml-1">ngày</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">
                  {r.reason || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-bold ${STATUS_BADGE[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <LeaveActions id={r.id} currentStatus={r.status} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
