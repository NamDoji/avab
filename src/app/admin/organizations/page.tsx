import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { type Prisma } from '@prisma/client'

export const metadata = { title: 'Organizations — AvaB Admin' }

const TYPE_LABELS: Record<string, string> = {
  SCHOOL: 'Trường học',
  CENTER: 'Trung tâm',
  CHAIN: 'Chuỗi',
}

const TYPE_COLORS: Record<string, string> = {
  SCHOOL: 'bg-blue-100 text-blue-700',
  CENTER: 'bg-violet-100 text-violet-700',
  CHAIN: 'bg-emerald-100 text-emerald-700',
}

const MODULE_ICONS: Record<string, string> = {
  'ai-studio': '🤖',
  erp: '🏫',
  finance: '💰',
  crm: '📞',
  analytics: '📊',
  hrm: '👥',
  collaboration: '💬',
}

function OrgInitials({ name }: { name: string }) {
  const words = name.trim().split(/\s+/)
  const initials = words.length >= 2
    ? words[0][0] + words[words.length - 1][0]
    : name.slice(0, 2)
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
    >
      {initials.toUpperCase()}
    </div>
  )
}

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string }>
}) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const { filter = 'ALL', sort = 'newest' } = await searchParams

  // Build where clause
  const typeFilter = filter !== 'ALL' ? filter : undefined
  const where: Prisma.OrganizationWhereInput = {
    deletedAt: null,
    ...(typeFilter ? { type: typeFilter } : {}),
  }

  // Build orderBy
  const orderBy: Prisma.OrganizationOrderByWithRelationInput =
    sort === 'name'
      ? { name: 'asc' }
      : { createdAt: 'desc' }

  // Stats for the month
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [orgs, campusCount, totalUsers, activeCount, thisMonthCount] = await Promise.all([
    prisma.organization.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            campuses: { where: { isActive: true } },
            organizationUsers: true,
            courses: true,
          },
        },
      },
    }),
    prisma.campus.count({ where: { isActive: true } }),
    prisma.organizationUser.count(),
    prisma.organization.count({ where: { deletedAt: null, isActive: true } }),
    prisma.organization.count({ where: { deletedAt: null, createdAt: { gte: thisMonthStart } } }),
  ])

  const orgCount = orgs.length

  // Filter tabs
  const FILTER_TABS = [
    { value: 'ALL',    label: 'Tất cả' },
    { value: 'SCHOOL', label: '🏫 Trường học' },
    { value: 'CENTER', label: '🎓 Trung tâm' },
    { value: 'CHAIN',  label: '🏢 Chuỗi' },
  ]
  const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'name',   label: 'Tên A-Z' },
  ]

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(30%,-50%)' }} />
        <div className="container-custom relative">
          <p className="text-slate-400 text-sm font-semibold mb-1">🏢 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-1">Organizations</h1>
          <p className="text-slate-400 text-sm">Quản lý các trường học và trung tâm trên AvaB</p>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Tổng tổ chức',          value: orgCount,      icon: '🏢', color: 'from-violet-500 to-indigo-600' },
            { label: 'Đang active',             value: activeCount,   icon: '✅', color: 'from-emerald-500 to-teal-600' },
            { label: 'Cơ sở hoạt động',        value: campusCount,   icon: '🏫', color: 'from-blue-500 to-cyan-600' },
            { label: 'Đăng ký tháng này',      value: thisMonthCount,icon: '📅', color: 'from-orange-500 to-amber-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-md`}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-sm opacity-80 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA + Actions row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-gray-900">Danh sách tổ chức</h2>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/dang-ky-to-chuc"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:scale-[1.02] transition-transform"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <span>✨</span>
              <span>Đăng ký tổ chức mới</span>
            </Link>
            <Link
              href="/admin/organizations/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:scale-[1.02] transition-transform"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
            >
              <span>➕</span>
              <span>Thêm nhanh</span>
            </Link>
          </div>
        </div>

        {/* Filter & Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(tab => (
              <Link
                key={tab.value}
                href={`/admin/organizations?filter=${tab.value}&sort=${sort}`}
                className="px-3 py-1.5 rounded-full text-sm font-bold transition-colors"
                style={{
                  background: filter === tab.value ? '#7c3aed' : '#f1f5f9',
                  color: filter === tab.value ? '#fff' : '#475569',
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Sắp xếp:</span>
            {SORT_OPTIONS.map(opt => (
              <Link
                key={opt.value}
                href={`/admin/organizations?filter=${filter}&sort=${opt.value}`}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={{
                  background: sort === opt.value ? '#0f172a' : '#f1f5f9',
                  color: sort === opt.value ? '#fff' : '#475569',
                }}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Org grid */}
        {orgs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🏢</div>
            <p className="font-semibold text-lg">Chưa có tổ chức nào</p>
            <p className="text-sm mt-1">Tạo tổ chức đầu tiên để bắt đầu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgs.map((org) => {
              const modules = Array.isArray(org.modules) ? (org.modules as string[]) : []
              return (
                <div
                  key={org.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex items-start gap-4">
                    {org.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <OrgInitials name={org.name} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-gray-900 truncate">{org.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[org.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {TYPE_LABELS[org.type] ?? org.type}
                        </span>
                        {!org.isActive && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                            Đã tắt
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{org.slug}</p>

                      {/* Stats */}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>🏫 {org._count.campuses} cơ sở</span>
                        <span>👥 {org._count.organizationUsers} thành viên</span>
                        <span>📚 {org._count.courses} khóa học</span>
                      </div>

                      {/* Module pills */}
                      {modules.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {modules.map((mod) => (
                            <span
                              key={mod}
                              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                            >
                              {MODULE_ICONS[mod] ?? '⚙️'} {mod}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="text-sm font-bold px-4 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
