import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { CURRENT_ORG_COOKIE } from '@/lib/current-org'
import Link from 'next/link'
import SuspendOrgButton from './SuspendOrgButton'

export const metadata = { title: '🌐 AvaB Platform — Super Admin' }

const TYPE_LABELS: Record<string, string> = {
  SCHOOL: 'Trường học',
  CENTER: 'Trung tâm',
  CHAIN: 'Chuỗi',
}

function formatRevenue(amount: number | null | undefined): string {
  if (!amount) return '0 ₫'
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B ₫`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M ₫`
  return amount.toLocaleString('vi-VN') + ' ₫'
}

export default async function PlatformPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role
  const userId   = (session?.user as { id?: string })?.id

  // Only ADMIN-level users without an active org context can access this
  if (!session || userRole !== 'ADMIN') redirect('/dang-nhap')

  const cookieStore = await cookies()
  const orgCtx = cookieStore.get(CURRENT_ORG_COOKIE)?.value ?? null

  // Super admin = ADMIN with no org context set
  if (orgCtx) {
    redirect('/admin')
  }

  // ── Platform-level stats ──────────────────────────────────────────────────
  const [orgCount, userCount, courseCount, revenueAgg] = await Promise.all([
    prisma.organization.count({ where: { isActive: true, deletedAt: null } }),
    prisma.user.count(),
    prisma.course.count(),
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true },
      _sum: { amount: true },
    }),
  ])

  const revenue = revenueAgg._sum.amount ?? 0

  // ── All organizations with stats ─────────────────────────────────────────
  const orgs = await prisma.organization.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: {
          campuses: true,
          organizationUsers: true,
          courses: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const KPI_CARDS = [
    { label: 'Tổng tổ chức',  value: orgCount,              icon: '🏢', gradient: 'from-violet-500 to-indigo-600' },
    { label: 'Tổng users',    value: userCount,             icon: '👥', gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Tổng courses',  value: courseCount,           icon: '📚', gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Doanh thu',     value: formatRevenue(revenue), icon: '💰', gradient: 'from-orange-500 to-amber-500' },
  ]

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.04)', transform: 'translate(35%,-55%)' }}
        />
        <div className="container-custom relative">
          <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-widest">
            Platform Control
          </p>
          <h1 className="text-4xl font-black mb-1">🌐 AvaB Platform</h1>
          <p className="text-slate-400 text-sm">Super Admin — Quản lý toàn bộ hệ thống</p>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPI_CARDS.map((kpi) => (
            <div
              key={kpi.label}
              className={`bg-gradient-to-br ${kpi.gradient} rounded-2xl p-5 text-white shadow-md`}
            >
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-3xl font-black">{kpi.value}</div>
              <div className="text-sm opacity-80 mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ── Orgs Table ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-black text-gray-900 text-lg">Danh sách tổ chức</h2>
            <Link
              href="/admin/organizations/new"
              className="text-xs font-bold px-3 py-1.5 rounded-xl text-white shadow"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
            >
              ➕ Thêm tổ chức
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Tên tổ chức</th>
                  <th className="px-4 py-3 text-left font-semibold">Loại</th>
                  <th className="px-4 py-3 text-right font-semibold">Cơ sở</th>
                  <th className="px-4 py-3 text-right font-semibold">Users</th>
                  <th className="px-4 py-3 text-right font-semibold">Khóa học</th>
                  <th className="px-4 py-3 text-center font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orgs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      Chưa có tổ chức nào
                    </td>
                  </tr>
                )}
                {orgs.map((org) => (
                  <tr
                    key={org.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {org.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={org.logo} alt={org.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                          >
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-[180px]">{org.name}</p>
                          <p className="text-xs text-gray-400">{org.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {TYPE_LABELS[org.type] ?? org.type}
                      </span>
                    </td>

                    {/* Campuses */}
                    <td className="px-4 py-3 text-right text-gray-600 font-semibold">
                      {org._count.campuses}
                    </td>

                    {/* Users */}
                    <td className="px-4 py-3 text-right text-gray-600 font-semibold">
                      {org._count.organizationUsers}
                    </td>

                    {/* Courses */}
                    <td className="px-4 py-3 text-right text-gray-600 font-semibold">
                      {org._count.courses}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          org.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {org.isActive ? '✅ Active' : '🚫 Đã tắt'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Login as org */}
                        <form action="/api/admin/platform/switch-org" method="POST">
                          <input type="hidden" name="organizationId" value={org.id} />
                          <button
                            type="submit"
                            className="text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            🔑 Đăng nhập
                          </button>
                        </form>

                        {/* Settings */}
                        <Link
                          href={`/admin/organizations/${org.id}/settings`}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          ⚙️ Cài đặt
                        </Link>

                        {/* Suspend / Activate */}
                        <SuspendOrgButton
                          orgId={org.id}
                          isActive={org.isActive}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orgs.length === 20 && (
            <div className="px-6 py-3 border-t border-gray-100 text-center">
              <Link
                href="/admin/organizations"
                className="text-sm font-bold text-violet-600 hover:text-violet-800"
              >
                Xem tất cả tổ chức →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
