import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Permissions Catalog — AvaB Admin' }

// Module gradient colors
const MODULE_GRADIENT: Record<string, string> = {
  course:     'from-violet-500 to-purple-600',
  lesson:     'from-indigo-500 to-blue-600',
  homework:   'from-blue-500 to-cyan-600',
  student:    'from-teal-500 to-emerald-600',
  teacher:    'from-emerald-500 to-green-600',
  user:       'from-green-500 to-lime-600',
  finance:    'from-yellow-500 to-amber-600',
  ai:         'from-orange-500 to-red-600',
  content:    'from-red-500 to-rose-600',
  news:       'from-rose-500 to-pink-600',
  analytics:  'from-pink-500 to-fuchsia-600',
  role:       'from-fuchsia-500 to-violet-600',
  audit:      'from-slate-500 to-gray-600',
  system:     'from-gray-600 to-slate-700',
  question:   'from-cyan-500 to-sky-600',
  enrollment: 'from-sky-500 to-indigo-600',
}

function getModuleGradient(module: string): string {
  return MODULE_GRADIENT[module] || 'from-slate-500 to-gray-600'
}

export default async function PermissionsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/dang-nhap')
  }

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
    include: {
      _count: { select: { rolePermissions: true } },
    },
  })

  // Group by module
  const grouped: Record<string, typeof permissions> = {}
  for (const perm of permissions) {
    if (!grouped[perm.module]) grouped[perm.module] = []
    grouped[perm.module].push(perm)
  }
  const modules = Object.keys(grouped).sort()

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-600 to-gray-700 text-white py-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-slate-300 text-sm mb-3">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            {' / '}
            <Link href="/admin/roles" className="hover:text-white">Roles</Link>
            {' / '}
            <span>Permissions</span>
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">🔑 Permissions</h1>
              <p className="text-slate-300 text-sm">
                {permissions.length} permissions · {modules.length} modules
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/roles"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold px-4 py-2 rounded-xl text-sm transition-all backdrop-blur-sm">
                🛡️ Roles
              </Link>
              <Link href="/admin/roles/matrix"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold px-4 py-2 rounded-xl text-sm transition-all backdrop-blur-sm">
                📊 Matrix
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Tổng permissions', value: permissions.length, icon: '🔑' },
            { label: 'Modules', value: modules.length, icon: '📦' },
            { label: 'Avg per module', value: Math.round(permissions.length / (modules.length || 1)), icon: '📊' },
            { label: 'Custom (non-system)', value: permissions.filter(p => !['view','create','edit','delete','publish','generate','approve','export'].includes(p.action)).length, icon: '⚙️' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map(mod => {
            const modPerms = grouped[mod]
            const gradient = getModuleGradient(mod)
            const totalRoleUsage = modPerms.reduce((sum, p) => sum + p._count.rolePermissions, 0)

            return (
              <div key={mod} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Card header with gradient */}
                <div className={`bg-gradient-to-br ${gradient} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg capitalize">{mod}</h3>
                    <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {modPerms.length} perms
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">
                    Dùng bởi {totalRoleUsage} role-permission assignment{totalRoleUsage !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Permission list */}
                <div className="divide-y divide-gray-50">
                  {modPerms.map(perm => (
                    <div key={perm.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                      <code className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex-1 min-w-0 truncate">
                        {perm.key}
                      </code>
                      <span className="text-xs text-gray-400 shrink-0 w-20 truncate">{perm.name}</span>
                      <span className={`text-xs font-bold shrink-0 ${perm._count.rolePermissions > 0 ? 'text-violet-700 bg-violet-50' : 'text-gray-400 bg-gray-50'} px-1.5 py-0.5 rounded-full`}>
                        {perm._count.rolePermissions}r
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {modules.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-4xl mb-3">🔑</p>
            <h3 className="font-black text-gray-900 text-lg mb-1">Chưa có Permissions</h3>
            <p className="text-gray-400 text-sm">Permissions sẽ được seed vào database khi khởi tạo hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  )
}
