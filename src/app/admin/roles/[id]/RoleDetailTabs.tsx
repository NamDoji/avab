'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserAssignModal from './UserAssignModal'

interface PermissionItem {
  key: string
  module: string
  action: string
  name: string
}

interface UserRoleItem {
  id: string
  userId: string
  scopeType: string | null
  scopeId: string | null
  expiresAt: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    phone: string
    role: string
  }
}

interface RoleData {
  id: string
  name: string
  slug: string
  level: string
  color: string
  isSystem: boolean
  description: string | null | undefined
  permissions: PermissionItem[]
  byModule: Record<string, string[]>
  modules: string[]
  userRoles: UserRoleItem[]
}

const ACTIONS = ['view', 'create', 'edit', 'delete', 'publish', 'generate', 'approve', 'export', 'assign', 'enroll', 'submit', 'reject', 'config']

export default function RoleDetailTabs({ role }: { role: RoleData }) {
  const [activeTab, setActiveTab] = useState<'permissions' | 'users'>('permissions')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [userRoles, setUserRoles] = useState<UserRoleItem[]>(role.userRoles)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const usedActions = ACTIONS.filter(a =>
    Object.values(role.byModule).some(actions => actions.includes(a))
  )

  async function handleRemoveUser(ur: UserRoleItem) {
    if (!confirm(`Xóa user "${ur.user.name || ur.user.phone}" khỏi role này?`)) return
    setRemovingId(ur.id)
    try {
      const res = await fetch(`/api/admin/roles/${role.id}/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: ur.userId }),
      })
      const data = await res.json()
      if (data.success) {
        setUserRoles(prev => prev.filter(r => r.id !== ur.id))
      }
    } finally {
      setRemovingId(null)
    }
  }

  function onAssigned() {
    // Refresh user list
    fetch(`/api/admin/roles/${role.id}/users`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setUserRoles(data.data)
      })
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-1 w-fit">
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'permissions'
              ? 'bg-cherry-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          🔑 Permissions ({role.permissions.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-cherry-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          👥 Users ({userRoles.length})
        </button>
      </div>

      {/* Tab: Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-900">{role.permissions.length}</strong> permissions đã gán
              {' · '}
              <span>Read-only — </span>
              <Link href={`/admin/roles/${role.id}/edit`} className="text-cherry-600 hover:underline font-semibold">
                Sửa trong Edit page
              </Link>
            </p>
          </div>

          {/* Matrix view */}
          {role.modules.length > 0 && usedActions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-3 font-bold text-gray-500 uppercase tracking-wide w-28">Module</th>
                    {usedActions.map(action => (
                      <th key={action} className="p-3 font-bold text-gray-500 uppercase tracking-wide text-center">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {role.modules.map((mod, i) => (
                    <tr key={mod} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                      <td className="p-3 font-semibold text-gray-700 capitalize">{mod}</td>
                      {usedActions.map(action => (
                        <td key={action} className="p-3 text-center">
                          {role.byModule[mod]?.includes(action) ? (
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
          )}

          {/* Permission tags */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-black text-gray-900 mb-3 text-sm">
              📋 Tất cả permissions ({role.permissions.length})
            </h3>
            {role.permissions.length === 0 ? (
              <p className="text-gray-400 text-sm">Chưa có permission nào. <Link href={`/admin/roles/${role.id}/edit`} className="text-cherry-600 hover:underline">Thêm ngay →</Link></p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map(perm => (
                  <span
                    key={perm.key}
                    title={perm.name}
                    className="bg-cherry-50 text-cherry-700 text-xs font-mono font-semibold px-2 py-1 rounded-lg border border-cherry-100"
                  >
                    {perm.key}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-900">{userRoles.length}</strong> users có role này
            </p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-cherry-600 hover:bg-cherry-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
            >
              ➕ Gán User
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {userRoles.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                <p className="text-2xl mb-2">👥</p>
                <p>Chưa có user nào được gán role này</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="mt-3 text-cherry-600 hover:underline text-xs font-semibold"
                >
                  + Gán user ngay
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">User</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Phạm vi</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Hết hạn</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {userRoles.map(ur => (
                      <tr key={ur.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-cherry-400 to-cherry-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {ur.user.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{ur.user.name || '(Chưa đặt tên)'}</p>
                              <p className="text-gray-400 text-xs">{ur.user.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {ur.scopeType ? (
                            <div>
                              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                {ur.scopeType}
                              </span>
                              {ur.scopeId && (
                                <p className="text-xs text-gray-400 mt-0.5 font-mono">{ur.scopeId}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Toàn bộ</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {ur.expiresAt
                            ? new Date(ur.expiresAt).toLocaleDateString('vi-VN')
                            : <span className="text-gray-300">Không hết hạn</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveUser(ur)}
                            disabled={removingId === ur.id}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-all disabled:opacity-50"
                          >
                            {removingId === ur.id ? '⏳' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign modal */}
      {showAssignModal && (
        <UserAssignModal
          roleId={role.id}
          roleName={role.name}
          onClose={() => setShowAssignModal(false)}
          onAssigned={onAssigned}
        />
      )}
    </>
  )
}
