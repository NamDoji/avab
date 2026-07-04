import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import OrgSettingsTabs from './OrgSettingsTabs'

export const metadata = { title: 'Cài đặt Tổ chức — AvaB Admin' }

const TYPE_LABELS: Record<string, string> = {
  SCHOOL: 'Trường học',
  CENTER: 'Trung tâm',
  CHAIN:  'Chuỗi',
}
const TYPE_COLORS: Record<string, string> = {
  SCHOOL: '#2563eb',
  CENTER: '#7c3aed',
  CHAIN:  '#059669',
}

export default async function OrgSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const { id } = await params

  const org = await prisma.organization.findUnique({
    where: { id, deletedAt: null },
    include: {
      campuses: { where: { isActive: true }, orderBy: { name: 'asc' } },
      organizationUsers: {
        orderBy: { joinedAt: 'asc' },
        include: { user: { select: { id: true, name: true, email: true, phone: true, avatar: true } } },
      },
    },
  })

  if (!org) notFound()

  const modules = Array.isArray(org.modules) ? (org.modules as string[]) : []
  const settings = (org.settings && typeof org.settings === 'object' && !Array.isArray(org.settings))
    ? (org.settings as Record<string, unknown>)
    : {}

  // Serialize for client — remove Date objects
  const orgData = {
    id:          org.id,
    name:        org.name,
    slug:        org.slug,
    type:        org.type,
    logo:        org.logo ?? '',
    domain:      org.domain ?? '',
    isActive:    org.isActive,
    modules,
    settings,
    campusCount: org.campuses.length,
    members: org.organizationUsers.map(ou => ({
      id:       ou.id,
      orgRole:  ou.orgRole,
      joinedAt: ou.joinedAt.toISOString(),
      user: {
        id:     ou.user.id,
        name:   ou.user.name ?? '',
        email:  ou.user.email ?? '',
        phone:  ou.user.phone,
        avatar: ou.user.avatar ?? '',
      },
    })),
  }

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.04)', transform: 'translate(30%,-50%)' }} />
        <div className="container-custom relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/organizations" className="hover:text-white transition-colors">Organizations</Link>
            <span>/</span>
            <Link href={`/admin/organizations/${id}`} className="hover:text-white transition-colors">{org.name}</Link>
            <span>/</span>
            <span className="text-white font-semibold">Cài đặt</span>
          </nav>

          <div className="flex items-center gap-4">
            {/* Logo / Initials */}
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt={org.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20" />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl border-2 border-white/20"
                style={{ background: TYPE_COLORS[org.type] ?? '#7c3aed' }}
              >
                {org.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black">{org.name}</h1>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: TYPE_COLORS[org.type] ?? '#7c3aed' }}
                >
                  {TYPE_LABELS[org.type] ?? org.type}
                </span>
                {!org.isActive && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                    Đã tắt
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                {org.slug}.avab.vn · {org.campuses.length} cơ sở · {org.organizationUsers.length} thành viên
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container-custom py-8">
        <OrgSettingsTabs org={orgData} />
      </div>
    </div>
  )
}
