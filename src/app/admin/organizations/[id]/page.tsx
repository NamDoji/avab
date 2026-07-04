import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import OrgDetailClient from './OrgDetailClient'

export const metadata = { title: 'Chi tiết Organization — AvaB Admin' }

const TYPE_LABELS: Record<string, string> = {
  SCHOOL: 'Trường học',
  CENTER: 'Trung tâm',
  CHAIN: 'Chuỗi',
}

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const { id } = await params

  const [org, orgUsers, academicYears] = await Promise.all([
    prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: {
        campuses: {
          orderBy: { name: 'asc' },
          include: { _count: { select: { campusUsers: true } } },
        },
        _count: {
          select: {
            organizationUsers: true,
            courses: true,
            campuses: { where: { isActive: true } },
          },
        },
      },
    }),
    prisma.organizationUser.findMany({
      where: { organizationId: id },
      orderBy: { joinedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, phone: true, role: true, avatar: true },
        },
      },
    }),
    prisma.academicYear.findMany({
      where: { organizationId: id },
      orderBy: { startDate: 'desc' },
    }),
  ])

  if (!org) notFound()

  const modules: string[] = Array.isArray(org.modules) ? (org.modules as string[]) : []

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(30%,-50%)' }} />
        <div className="container-custom relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/organizations" className="hover:text-white transition-colors">Organizations</Link>
            <span>/</span>
            <span className="text-white font-semibold truncate">{org.name}</span>
          </div>

          <div className="flex items-center gap-4">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt={org.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                {org.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black">{org.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 text-sm">{org.slug}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {TYPE_LABELS[org.type] ?? org.type}
                </span>
                {!org.isActive && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                    Đã tắt
                  </span>
                )}
              </div>
              {modules.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {modules.map((m) => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded-full text-slate-300" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <OrgDetailClient
          org={{
            ...org,
            modules,
            createdAt: org.createdAt.toISOString(),
            campuses: org.campuses.map((c) => ({
              ...c,
              createdAt: undefined as any,
              updatedAt: undefined as any,
              organizationId: undefined as any,
              principalId: undefined as any,
              settings: undefined as any,
            })),
          }}
          orgUsers={orgUsers.map((ou) => ({
            id: ou.id,
            orgRole: ou.orgRole,
            joinedAt: ou.joinedAt.toISOString(),
            user: ou.user,
          }))}
          academicYears={academicYears.map((ay) => ({
            id: ay.id,
            name: ay.name,
            startDate: ay.startDate.toISOString(),
            endDate: ay.endDate.toISOString(),
            isCurrent: ay.isCurrent,
          }))}
        />
      </div>
    </div>
  )
}
