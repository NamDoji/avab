import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Permission Matrix — AvaB Admin' }

// Short display names for roles in column headers
const ROLE_ABBREV: Record<string, string> = {
  'super-admin':        'SA',
  'platform-admin':     'PA',
  'org-owner':          'OO',
  'principal':          'PR',
  'academic-director':  'AD',
  'dept-head':          'DH',
  'content-manager':    'CM',
  'reviewer':           'RV',
  'qa':                 'QA',
  'teacher':            'TC',
  'teaching-assistant': 'TA',
  'finance':            'FN',
  'sales':              'SL',
  'customer-care':      'CC',
  'class-manager':      'CL',
  'parent':             'PH',
  'student':            'ST',
  'guest':              'GS',
}

const LEVEL_ORDER = ['SYSTEM', 'ORGANIZATION', 'ACADEMIC', 'OPERATION', 'END_USER']

export default async function PermissionMatrixPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
    redirect('/dang-nhap')
  }

  // Load all roles with their permissions
  const roles = await prisma.role.findMany({
    include: {
      rolePermissions: {
        select: { permissionId: true },
      },
    },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  })

  // Load all permissions grouped by module
  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
  })

  // Build lookup: roleId → Set<permissionId>
  const rolePerms = new Map<string, Set<string>>()
  for (const role of roles) {
    rolePerms.set(role.id, new Set(role.rolePermissions.map(rp => rp.permissionId)))
  }

  // Group permissions by module
  const byModule: Record<string, typeof permissions> = {}
  for (const perm of permissions) {
    if (!byModule[perm.module]) byModule[perm.module] = []
    byModule[perm.module].push(perm)
  }
  const modules = Object.keys(byModule).sort()

  // Sort roles by level
  const sortedRoles = [...roles].sort((a, b) => {
    const li = LEVEL_ORDER.indexOf(a.level)
    const lj = LEVEL_ORDER.indexOf(b.level)
    if (li !== lj) return li - lj
    return a.slug.localeCompare(b.slug)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white py-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <Link href="/admin/roles" className="text-indigo-300 text-sm hover:text-white transition-colors mb-4 inline-block">
            ← Role Management
          </Link>
          <h1 className="text-3xl font-black mb-1">📊 Permission Matrix</h1>
          <p className="text-indigo-200 text-sm">
            {permissions.length} permissions × {roles.length} roles
          </p>
        </div>
      </div>

      {/* Matrix — responsive overflow */}
      <div className="container-custom py-8">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[80vh]">
            <table className="text-xs border-collapse w-full">
              <thead>
                {/* Level header row */}
                <tr className="bg-gray-50 sticky top-0 z-20">
                  <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-200 p-2 text-left font-bold text-gray-500 min-w-[180px]">
                    Permission
                  </th>
                  {sortedRoles.map(role => (
                    <th key={role.id}
                      className="border-b border-gray-200 p-2 text-center font-black whitespace-nowrap min-w-[40px]"
                      title={role.name}>
                      <div className="text-[10px] text-gray-400 font-normal mb-0.5">{role.level.charAt(0)}</div>
                      <div className="text-gray-700">{ROLE_ABBREV[role.slug] ?? role.slug.slice(0, 3).toUpperCase()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map(module => (
                  <>
                    {/* Module header */}
                    <tr key={`mod-${module}`} className="bg-violet-50 sticky">
                      <td colSpan={sortedRoles.length + 1}
                        className="sticky left-0 px-3 py-1.5 font-black text-violet-700 uppercase tracking-wider text-[10px] border-b border-violet-100">
                        {module}
                      </td>
                    </tr>
                    {/* Permission rows */}
                    {byModule[module].map((perm, i) => (
                      <tr key={perm.id}
                        className={`border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                        <td className="sticky left-0 z-10 bg-inherit border-r border-gray-100 px-3 py-1.5 font-mono text-gray-600 whitespace-nowrap">
                          <span className="text-gray-400">{perm.module}.</span>
                          <span className="font-bold text-gray-700">{perm.action}</span>
                        </td>
                        {sortedRoles.map(role => {
                          const has = rolePerms.get(role.id)?.has(perm.id) ?? false
                          return (
                            <td key={role.id} className="p-1.5 text-center">
                              {has ? (
                                <span className="text-emerald-500">✅</span>
                              ) : (
                                <span className="text-gray-200">⬜</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 items-center text-xs text-gray-500">
          <span className="font-bold text-gray-700">Roles:</span>
          {sortedRoles.map(role => (
            <span key={role.id} className="flex items-center gap-1">
              <span className="font-bold text-gray-700">
                {ROLE_ABBREV[role.slug] ?? role.slug.slice(0, 3).toUpperCase()}
              </span>
              = {role.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
