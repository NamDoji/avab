import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Chi tiết Role — AvaB Admin' }

// All known actions in display order
const ACTIONS = ['view', 'create', 'edit', 'delete', 'publish', 'generate', 'approve', 'export', 'assign', 'enroll', 'submit', 'reject', 'config']
const ACTION_LABELS: Record<string, string> = {
  view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete',
  publish: 'Publish', generate: 'Gen', approve: 'Approve', export: 'Export',
  assign: 'Assign', enroll: 'Enroll', submit: 'Submit', reject: 'Reject', config: 'Config',
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
        take: 20,
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

  // Which actions actually exist across all permissions for this role
  const usedActions = ACTIONS.filter(a =>
    Object.values(byModule).some(actions => actions.has(a))
  )

  const badgeClass = COLOR_CLASS[role.color] ?? COLOR_CLASS['gray']

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <Link href="/admin/roles" className="text-violet-300 text-sm hover:text-white transition-colors mb-4 inline-block">
            ← Danh sách Roles
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${badgeClass}`}>{role.color}</span>
            <div>
              <h1 className="text-3xl font-black">{role.name}</h1>
              <p className="text-violet-200 text-sm font-mono">{role.slug} · {role.level}</p>
            </div>
          </div>
          <div className="flex gap-6 mt-4 text-sm text-violet-200">
            <span><strong className="text-white">{role.rolePermissions.length}</strong> permissions</span>
            <span><strong className="text-white">{role.userRoles.length}</strong> users (hiển thị)</span>
            {role.isSystem && <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">SYSTEM ROLE</span>}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Permissions matrix ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-black text-gray-900 text-lg">🔑 Permission Matrix</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-3 font-bold text-gray-500 uppercase tracking-wide w-28">Module</th>
                    {usedActions.map(action => (
                      <th key={action} className="p-3 font-bold text-gray-500 uppercase tracking-wide text-center">
                        {ACTION_LABELS[action] ?? action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod, i) => (
                    <tr key={mod} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                      <td className="p-3 font-semibold text-gray-700 capitalize">{mod}</td>
                      {usedActions.map(action => (
                        <td key={action} className="p-3 text-center">
                          {byModule[mod]?.has(action) ? (
                            <span className="text-emerald-500 text-base">✅</span>
                          ) : (
                            <span className="text-gray-200 text-base">⬜</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Permission list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-gray-900 mb-3 text-sm">📋 Tất cả permissions ({role.rolePermissions.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {role.rolePermissions.map(rp => (
                  <span key={rp.id}
                    className="bg-violet-50 text-violet-700 text-xs font-mono font-semibold px-2 py-1 rounded-lg border border-violet-100">
                    {rp.permission.key}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Users with this role ───────────────────────────── */}
          <div>
            <h2 className="font-black text-gray-900 text-lg mb-4">👥 Users với role này</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {role.userRoles.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Chưa có user nào được gán role này
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {role.userRoles.map(ur => (
                    <li key={ur.id} className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {ur.user.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{ur.user.name}</p>
                        <p className="text-gray-400 text-xs">{ur.user.phone}</p>
                      </div>
                      <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                        {ur.user.role}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {role.userRoles.length === 20 && (
              <p className="text-xs text-gray-400 mt-2 text-center">Hiển thị tối đa 20 users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
