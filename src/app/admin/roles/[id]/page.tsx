import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import RoleDetailTabs from './RoleDetailTabs'

export const metadata = { title: 'Chi tiết Role — AvaB Admin' }

const LEVEL_LABELS: Record<string, string> = {
  SYSTEM:       '⚙️ System',
  ORGANIZATION: '🏫 Organization',
  ACADEMIC:     '📚 Academic',
  OPERATION:    '🏢 Operation',
  END_USER:     '👥 End User',
}

const COLOR_CLASS: Record<string, string> = {
  red:     'bg-red-100 text-red-700',
  orange:  'bg-orange-100 text-orange-700',
  purple:  'bg-purple-100 text-purple-700',
  indigo:  'bg-indigo-100 text-indigo-700',
  blue:    'bg-blue-100 text-blue-700',
  cyan:    'bg-cyan-100 text-cyan-700',
  teal:    'bg-teal-100 text-teal-700',
  green:   'bg-green-100 text-green-700',
  lime:    'bg-lime-100 text-lime-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  yellow:  'bg-yellow-100 text-yellow-700',
  amber:   'bg-amber-100 text-amber-700',
  rose:    'bg-rose-100 text-rose-700',
  pink:    'bg-pink-100 text-pink-700',
  sky:     'bg-sky-100 text-sky-700',
  gray:    'bg-gray-100 text-gray-700',
}

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/dang-nhap')
  }

  const { id } = await params

  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        include: { permission: true },
        orderBy: { permission: { key: 'asc' } },
      },
      userRoles: {
        include: {
          user: { select: { id: true, name: true, phone: true, role: true } },
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!role) notFound()

  // Group permissions by module
  const byModule: Record<string, Set<string>> = {}
  for (const rp of role.rolePermissions) {
    const mod = rp.permission.module
    if (!byModule[mod]) byModule[mod] = new Set()
    byModule[mod].add(rp.permission.action)
  }
  const modules = Object.keys(byModule).sort()

  const badgeClass = COLOR_CLASS[role.color] ?? COLOR_CLASS['gray']

  // Serialize for client component
  const serializedRole = {
    id: role.id,
    name: role.name,
    slug: role.slug,
    level: role.level,
    color: role.color,
    isSystem: role.isSystem,
    description: role.description,
    permissions: role.rolePermissions.map(rp => ({
      key: rp.permission.key,
      module: rp.permission.module,
      action: rp.permission.action,
      name: rp.permission.name,
    })),
    byModule: Object.fromEntries(
      Object.entries(byModule).map(([mod, actions]) => [mod, Array.from(actions)])
    ),
    modules,
    userRoles: role.userRoles.map(ur => ({
      id: ur.id,
      userId: ur.userId,
      scopeType: ur.scopeType,
      scopeId: ur.scopeId,
      expiresAt: ur.expiresAt ? ur.expiresAt.toISOString() : null,
      createdAt: ur.createdAt.toISOString(),
      user: ur.user,
    })),
  }

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-violet-200 text-sm mb-3">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            {' / '}
            <Link href="/admin/roles" className="hover:text-white">Roles</Link>
            {' / '}
            <span>{role.name}</span>
          </p>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${badgeClass}`}>{role.color}</span>
              <div>
                <h1 className="text-3xl font-black">{role.name}</h1>
                <p className="text-violet-200 text-sm font-mono mt-0.5">{role.slug}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/roles/${id}/edit`}
                className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
                ✏️ Sửa Role
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-violet-200">
            <span>
              <strong className="text-white">{LEVEL_LABELS[role.level] ?? role.level}</strong>
            </span>
            <span>
              <strong className="text-white">{role.rolePermissions.length}</strong> permissions
            </span>
            <span>
              <strong className="text-white">{role.userRoles.length}</strong> users
            </span>
            {role.isSystem && (
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">SYSTEM ROLE</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs content (client component) */}
      <div className="container-custom py-8">
        <RoleDetailTabs role={serializedRole} />
      </div>
    </div>
  )
}
