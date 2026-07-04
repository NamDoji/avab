import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import RoleDeleteButton from './RoleDeleteButton'

export const metadata = { title: 'Role Management — AvaB Admin' }

const LEVEL_ORDER = ['SYSTEM', 'ORGANIZATION', 'ACADEMIC', 'OPERATION', 'END_USER']
const LEVEL_LABELS: Record<string, string> = {
  SYSTEM:       '⚙️ System',
  ORGANIZATION: '🏫 Organization',
  ACADEMIC:     '📚 Academic',
  OPERATION:    '🏢 Operation',
  END_USER:     '👥 End User',
}

const COLOR_CLASS: Record<string, string> = {
  red:     'bg-red-100 text-red-700 border-red-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  purple:  'bg-purple-100 text-purple-700 border-purple-200',
  indigo:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  cyan:    'bg-cyan-100 text-cyan-700 border-cyan-200',
  teal:    'bg-teal-100 text-teal-700 border-teal-200',
  green:   'bg-green-100 text-green-700 border-green-200',
  lime:    'bg-lime-100 text-lime-700 border-lime-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  yellow:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  rose:    'bg-rose-100 text-rose-700 border-rose-200',
  pink:    'bg-pink-100 text-pink-700 border-pink-200',
  sky:     'bg-sky-100 text-sky-700 border-sky-200',
  gray:    'bg-gray-100 text-gray-700 border-gray-200',
}

export default async function RolesPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/dang-nhap')
  }

  const roles = await prisma.role.findMany({
    include: {
      _count: { select: { rolePermissions: true, userRoles: true } },
    },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  })

  const grouped = LEVEL_ORDER.reduce<Record<string, typeof roles>>((acc, level) => {
    acc[level] = roles.filter(r => r.level === level)
    return acc
  }, {})

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-violet-200 text-sm font-semibold mb-1">🔐 Phân quyền hệ thống</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">🛡️ Role Management</h1>
              <p className="text-violet-200 text-sm">{roles.length} vai trò · {LEVEL_ORDER.length} cấp độ</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/admin/permissions"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold px-4 py-2 rounded-xl text-sm transition-all backdrop-blur-sm">
                🔑 Permissions
              </Link>
              <Link href="/admin/roles/matrix"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold px-4 py-2 rounded-xl text-sm transition-all backdrop-blur-sm">
                📊 Matrix
              </Link>
              <Link href="/admin/roles/new"
                className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm">
                + Tạo Role Mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container-custom py-3">
        <p className="text-xs text-gray-400">
          <Link href="/admin" className="hover:text-gray-600">Admin</Link>
          {' / '}
          <span className="text-gray-600 font-semibold">Roles</span>
        </p>
      </div>

      {/* Content */}
      <div className="container-custom pb-8 space-y-8">
        {LEVEL_ORDER.map(level => {
          const levelRoles = grouped[level]
          if (!levelRoles || levelRoles.length === 0) return null
          return (
            <div key={level}>
              <p className="text-sm font-bold text-gray-700 mb-3">
                {LEVEL_LABELS[level] ?? level}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {levelRoles.map(role => {
                  const badgeClass = COLOR_CLASS[role.color] ?? COLOR_CLASS['gray']
                  return (
                    <div key={role.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3">
                      {/* Color badge + name */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${badgeClass} mb-2`}>
                            {role.color}
                          </span>
                          <h3 className="font-black text-gray-900 text-sm leading-tight">{role.name}</h3>
                          <p className="text-gray-400 text-xs font-mono mt-0.5">{role.slug}</p>
                        </div>
                        {role.isSystem && (
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">
                            SYSTEM
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-black text-gray-700">{role._count.rolePermissions}</span>
                          {' '}permissions
                        </div>
                        <div>
                          <span className="font-black text-gray-700">{role._count.userRoles}</span>
                          {' '}users
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto flex gap-2 flex-wrap">
                        <Link href={`/admin/roles/${role.id}`}
                          className="flex-1 text-center bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-xs py-2 rounded-xl transition-all">
                          Xem →
                        </Link>
                        <Link href={`/admin/roles/${role.id}/edit`}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all">
                          ✏️ Sửa
                        </Link>
                        <Link href={`/admin/roles/new?clone=${role.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all">
                          📋 Clone
                        </Link>
                        {!role.isSystem && (
                          <RoleDeleteButton roleId={role.id} roleName={role.name} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
