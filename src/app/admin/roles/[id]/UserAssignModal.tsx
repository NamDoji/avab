'use client'

import { useState, useEffect, useRef } from 'react'

interface UserResult {
  id: string
  name: string | null
  phone: string
  role: string
}

interface UserAssignModalProps {
  roleId: string
  roleName: string
  onClose: () => void
  onAssigned: () => void
}

const SCOPE_TYPES = [
  { value: '', label: 'Toàn bộ hệ thống' },
  { value: 'course', label: 'Theo khóa học' },
  { value: 'class', label: 'Theo lớp' },
  { value: 'organization', label: 'Theo tổ chức' },
  { value: 'campus', label: 'Theo campus' },
  { value: 'department', label: 'Theo phòng ban' },
]

export default function UserAssignModal({ roleId, roleName, onClose, onAssigned }: UserAssignModalProps) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<UserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null)
  const [scopeType, setScopeType] = useState('')
  const [scopeId, setScopeId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setUsers([])
      return
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearching(true)
      fetch(`/api/admin/users?search=${encodeURIComponent(search)}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) setUsers(data.data.slice(0, 10))
        })
        .finally(() => setSearching(false))
    }, 300)
  }, [search])

  async function handleAssign() {
    if (!selectedUser) { setError('Vui lòng chọn user'); return }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/roles/${roleId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          scopeType: scopeType || undefined,
          scopeId: scopeId.trim() || undefined,
          expiresAt: expiresAt || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Gán thất bại'); return }
      onAssigned()
      onClose()
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-900">➕ Gán User vào Role</h3>
            <p className="text-xs text-gray-400 mt-0.5">Role: <strong>{roleName}</strong></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Tìm user (tên / SĐT)
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedUser(null) }}
                placeholder="Nhập tên hoặc số điện thoại..."
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
              />
              {searching && (
                <span className="absolute right-3 top-2.5 text-gray-400 text-xs">🔍</span>
              )}
            </div>

            {/* Dropdown results */}
            {users.length > 0 && !selectedUser && (
              <div className="mt-1 border border-gray-100 rounded-xl overflow-hidden shadow-md">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setSelectedUser(u); setSearch(u.name || u.phone); setUsers([]) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-cherry-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-cherry-400 to-cherry-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.name || '(Chưa đặt tên)'}</p>
                      <p className="text-xs text-gray-400">{u.phone} · {u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected user badge */}
            {selectedUser && (
              <div className="mt-2 flex items-center gap-2 bg-cherry-50 border border-cherry-200 rounded-xl px-3 py-2">
                <div className="w-7 h-7 bg-gradient-to-br from-cherry-400 to-cherry-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {selectedUser.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cherry-900 truncate">{selectedUser.name}</p>
                  <p className="text-xs text-cherry-500">{selectedUser.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedUser(null); setSearch('') }}
                  className="text-cherry-400 hover:text-cherry-700 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Scope type */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Phạm vi áp dụng
            </label>
            <select
              value={scopeType}
              onChange={e => setScopeType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
            >
              {SCOPE_TYPES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Scope ID (show only if scopeType selected) */}
          {scopeType && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                ID {scopeType} (để trống = tất cả)
              </label>
              <input
                type="text"
                value={scopeId}
                onChange={e => setScopeId(e.target.value)}
                placeholder={`ID của ${scopeType}...`}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
              />
            </div>
          )}

          {/* Expires at */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Ngày hết hạn (tùy chọn)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting || !selectedUser}
            className="flex-1 bg-cherry-600 hover:bg-cherry-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60"
          >
            {submitting ? '⏳ Đang gán...' : '➕ Gán Role'}
          </button>
        </div>
      </div>
    </div>
  )
}
