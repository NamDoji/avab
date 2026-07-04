import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'

export const metadata = { title: 'HRM — Nhân sự — AvaB Admin' }

const HRM_MODULES = [
  { href: '/admin/hrm/staff',      icon: '👥', label: 'Nhân viên',  desc: 'Hồ sơ, phân công',    color: '#7c3aed', badge: null },
  { href: '/admin/hrm/contracts',  icon: '📄', label: 'Hợp đồng',  desc: 'HĐLĐ, theo dõi',       color: '#4f46e5', badge: 'expiringContracts' },
  { href: '/admin/hrm/attendance', icon: '⏰', label: 'Chấm công',  desc: 'Check-in/out',          color: '#0369a1', badge: null },
  { href: '/admin/hrm/kpi',        icon: '📊', label: 'KPI & OKR', desc: 'Mục tiêu, đánh giá',   color: '#059669', badge: null },
  { href: '/admin/hrm/leave',      icon: '🌴', label: 'Nghỉ phép', desc: 'Đơn xin nghỉ',          color: '#d97706', badge: 'pendingLeave' },
  { href: '/admin/hrm/payroll',    icon: '💰', label: 'Bảng lương',desc: 'Lương, thưởng',         color: '#dc2626', badge: null },
]

export default async function HRMPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  const orgUserFilter = orgCtx?.id
    ? { organizationUsers: { some: { organizationId: orgCtx.id } } }
    : {}

  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [totalStaff, adminCount, teacherCount, pendingLeave, expiringContracts] = await Promise.all([
    prisma.user.count({ where: { role: { in: ['ADMIN', 'TEACHER'] } } }),
    prisma.user.count({ where: { role: 'ADMIN', ...orgUserFilter } }),
    prisma.user.count({ where: { role: 'TEACHER', ...orgUserFilter } }),
    prisma.leaveRequest.count({ where: { status: 'pending' } }).catch(() => 0),
    prisma.contract
      .count({ where: { status: 'active', endDate: { gte: now, lte: in30Days } } })
      .catch(() => 0),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="HRM — Nhân sự"
        icon="👔"
        subtitle="Quản lý nhân viên, hợp đồng, chấm công, KPI"
        gradient="linear-gradient(135deg, #4a044e 0%, #7e22ce 100%)"
        breadcrumb={[{ label: 'Admin', href: '/admin' }]}
      />

      <div className="container-custom py-8 space-y-8">
        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">📊 Tổng quan nhân sự</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '👤', label: 'Tổng nhân viên', value: totalStaff,   gradient: 'from-purple-500 to-violet-600' },
              { icon: '🛡️', label: 'Quản trị viên',  value: adminCount,   gradient: 'from-indigo-500 to-blue-600' },
              { icon: '👨‍🏫', label: 'Giáo viên',     value: teacherCount, gradient: 'from-teal-500 to-emerald-600' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${stat.gradient} p-6 text-white shadow-md`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-black mb-1">{stat.value.toLocaleString('vi-VN')}</div>
                <div className="font-bold text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Module Cards ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🗂️ Phân hệ HRM</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {HRM_MODULES.map((mod) => {
              const badgeCount =
            mod.badge === 'pendingLeave'
              ? pendingLeave
              : mod.badge === 'expiringContracts'
              ? expiringContracts
              : 0
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all flex flex-col gap-3 relative"
                >
                  {badgeCount > 0 && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                      {badgeCount}
                    </span>
                  )}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: mod.color + '18' }}
                  >
                    {mod.icon}
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 group-hover:text-purple-700 transition-colors">{mod.label}</h2>
                    <p className="text-gray-400 text-xs mt-0.5">{mod.desc}</p>
                  </div>
                  <div className="mt-auto text-xs font-bold" style={{ color: mod.color }}>
                    Xem chi tiết →
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── Quick link ───────────────────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/hrm/staff"
            className="flex items-center gap-2 bg-purple-600 text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
          >
            <span>👥</span> Danh sách nhân viên
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 bg-white text-gray-700 rounded-2xl px-5 py-3 text-sm font-bold border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm"
          >
            <span>🔗</span> Tất cả người dùng
          </Link>
        </div>
      </div>
    </div>
  )
}
