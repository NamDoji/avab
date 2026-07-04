import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Chi tiết Cơ sở — AvaB Admin' }

export default async function CampusDetailPage({
  params,
}: {
  params: Promise<{ id: string; campusId: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) redirect('/dang-nhap')

  const { id, campusId } = await params

  const [campus, org, campusUsers] = await Promise.all([
    prisma.campus.findFirst({
      where: { id: campusId, organizationId: id },
      include: {
        _count: { select: { campusUsers: true } },
      },
    }),
    prisma.organization.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, slug: true },
    }),
    prisma.campusUser.findMany({
      where: { campusId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: { id: true, name: true, phone: true, role: true, avatar: true },
        },
      },
    }),
  ])

  if (!campus || !org) notFound()

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
      >
        <div className="container-custom relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2 flex-wrap">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/organizations" className="hover:text-white transition-colors">Organizations</Link>
            <span>/</span>
            <Link href={`/admin/organizations/${org.id}`} className="hover:text-white transition-colors truncate">
              {org.name}
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">{campus.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black">{campus.name}</h1>
                {campus.code && (
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-white/15 text-slate-200">
                    {campus.code}
                  </span>
                )}
                {!campus.isActive && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                    Đã tắt
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-0.5">{org.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Thành viên', value: campus._count.campusUsers, icon: '👥' },
            { label: 'Địa chỉ', value: campus.address ?? 'Chưa cập nhật', icon: '📍', text: true },
            { label: 'Điện thoại', value: campus.phone ?? 'Chưa cập nhật', icon: '📞', text: true },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-xl mb-1">{s.icon}</div>
              {s.text ? (
                <p className="text-sm font-semibold text-gray-700 truncate">{s.value}</p>
              ) : (
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-900 mb-4">👥 Thành viên tại cơ sở</h2>
          {campusUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm">Chưa có thành viên nào tại cơ sở này</p>
            </div>
          ) : (
            <div className="space-y-2">
              {campusUsers.map((cu) => (
                <div key={cu.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                    {(cu.user.name ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{cu.user.name ?? 'Chưa đặt tên'}</p>
                    {cu.user.phone && <p className="text-xs text-gray-400">{cu.user.phone}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {cu.campusRole && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {cu.campusRole}
                      </span>
                    )}
                    {cu.isPrimary && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Chính
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
