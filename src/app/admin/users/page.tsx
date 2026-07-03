'use client'

import { useState, useEffect } from 'react'
import { Users, Search, KeyRound, Plus, X, Edit2, Trash2 } from 'lucide-react'

interface User {
  id: string
  name: string | null
  phone: string
  email: string | null
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
  isActive: boolean
  createdAt: string
  _count: { enrollments: number; answers: number }
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học viên',
  PARENT: 'Phụ huynh',
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  TEACHER: 'bg-teal-100 text-teal-700',
  STUDENT: 'bg-blue-100 text-blue-700',
  PARENT: 'bg-yellow-100 text-yellow-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  // Reset password state
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Create user modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', phone: '', email: '', role: 'STUDENT' })
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit user modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', role: 'STUDENT', isActive: true })
  const [editing, setEditing] = useState(false)
  const [editMsg, setEditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    if (data.success) setUsers(data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [roleFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load()
  }

  // Feature 6: Reset password
  const handleResetPassword = async (user: User) => {
    if (!confirm(`Reset mật khẩu của "${user.name ?? user.phone}" về "123456"?`)) return
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, action: 'reset-password' }),
    })
    const data = await res.json()
    setResetMsg({ type: data.success ? 'success' : 'error', text: data.message ?? data.error ?? 'Lỗi không xác định' })
    setTimeout(() => setResetMsg(null), 4000)
  }

  // Edit user
  const openEditModal = (user: User) => {
    setEditingUser(user)
    setEditForm({ name: user.name ?? '', phone: user.phone, email: user.email ?? '', role: user.role, isActive: user.isActive })
    setEditMsg(null)
    setShowEditModal(true)
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setEditing(true)
    setEditMsg(null)
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: editingUser.id, ...editForm }),
    })
    const data = await res.json()
    if (data.success) {
      setEditMsg({ type: 'success', text: 'Cập nhật thành công!' })
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data.data } : u))
      setTimeout(() => { setShowEditModal(false); setEditMsg(null) }, 1200)
    } else {
      setEditMsg({ type: 'error', text: data.error || 'Không thể cập nhật' })
    }
    setEditing(false)
  }

  // Delete user
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Xóa tài khoản "${user.name ?? user.phone}"? Thành nhà không thể khôi phục!`)) return
    setDeletingId(user.id)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    const data = await res.json()
    if (data.success) {
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } else {
      alert(data.error || 'Không thể xóa')
    }
    setDeletingId(null)
  }

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateMsg(null)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    })
    const data = await res.json()
    if (data.success) {
      setCreateMsg({ type: 'success', text: `Tạo tài khoản thành công! Mật khẩu mặc định: 123456` })
      setCreateForm({ name: '', phone: '', email: '', role: 'STUDENT' })
      load()
      setTimeout(() => { setShowCreateModal(false); setCreateMsg(null) }, 2000)
    } else {
      setCreateMsg({ type: 'error', text: data.error || 'Không thể tạo tài khoản' })
    }
    setCreating(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Quản lý người dùng
          </h1>
          {/* Feature 7: Create user button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" /> Tạo tài khoản
          </button>
        </div>

        {/* Feature 6: Reset message */}
        {resetMsg && (
          <div className={`text-sm px-4 py-2.5 rounded-lg mb-4 ${resetMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {resetMsg.type === 'success' ? '✅' : '❌'} {resetMsg.text}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-60">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, SĐT, email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
            >
              Tìm
            </button>
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Giáo viên</option>
            <option value="STUDENT">Học viên</option>
            <option value="PARENT">Phụ huynh</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Đang tải...</div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không tìm thấy người dùng</p>
            </div>
          ) : (
            <>
              {/* Mobile card layout */}
              <div className="md:hidden divide-y divide-gray-100">
                {users.map((user) => (
                  <div key={user.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{user.name ?? 'N/A'}</p>
                        <p className="text-xs text-gray-400">{user.phone}</p>
                        {user.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {roleLabels[user.role] ?? user.role}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {user.isActive ? 'Hoạt động' : 'Khoá'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('vi-VN')} · {user._count.enrollments} đăng ký</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEditModal(user)}
                          className="flex items-center gap-1 text-xs text-purple-600 px-2.5 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 transition">
                          <Edit2 className="w-3 h-3" /> Sửa
                        </button>
                        <button onClick={() => handleResetPassword(user)}
                          className="flex items-center gap-1 text-xs text-orange-600 px-2.5 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-50 transition">
                          <KeyRound className="w-3 h-3" /> Reset
                        </button>
                        <button onClick={() => handleDeleteUser(user)} disabled={deletingId === user.id}
                          className="flex items-center gap-1 text-xs text-red-600 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition disabled:opacity-40">
                          <Trash2 className="w-3 h-3" /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Người dùng</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Vai trò</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Đăng ký</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Ngày tạo</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-semibold text-gray-800">{user.name ?? 'N/A'}</p>
                          <p className="text-xs text-gray-400">{user.phone}</p>
                          {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                            {roleLabels[user.role] ?? user.role}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">{user._count.enrollments}</td>
                        <td className="p-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {user.isActive ? 'Hoạt động' : 'Bị khoá'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => openEditModal(user)}
                              className="flex items-center gap-1 text-xs text-purple-600 hover:bg-purple-50 px-2.5 py-1.5 rounded-lg transition border border-purple-200">
                              <Edit2 className="w-3.5 h-3.5" /> Sửa
                            </button>
                            <button onClick={() => handleResetPassword(user)}
                              title="Reset mật khẩu về 123456"
                              className="flex items-center gap-1 text-xs text-orange-600 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition border border-orange-200">
                              <KeyRound className="w-3.5 h-3.5" /> Reset
                            </button>
                            <button onClick={() => handleDeleteUser(user)} disabled={deletingId === user.id}
                              className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition border border-red-200 disabled:opacity-40">
                              <Trash2 className="w-3.5 h-3.5" /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-3 text-right">
          Tổng: {users.length} người dùng
        </p>
      </div>

      {/* Edit user modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600" /> Sửa thông tin
              </h2>
              <button onClick={() => { setShowEditModal(false); setEditMsg(null) }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              {editMsg && (
                <div className={`text-sm px-4 py-2.5 rounded-lg ${editMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {editMsg.text}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">SĐT *</label>
                <input type="tel" required value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0912345678"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@gmail.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Vai trò</label>
                <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                  <option value="STUDENT">Học viên</option>
                  <option value="TEACHER">Giáo viên</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                  <span className="text-sm font-semibold text-gray-700">Tài khoản hoạt động</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editing}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition">
                  {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditMsg(null) }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" /> Tạo tài khoản mới
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setCreateMsg(null) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createMsg && (
                <div className={`text-sm px-4 py-2.5 rounded-lg ${createMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {createMsg.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">SĐT *</label>
                <input
                  type="tel"
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0912345678"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@gmail.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Vai trò</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                >
                  <option value="STUDENT">Học viên</option>
                  <option value="TEACHER">Giáo viên</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                🔐 Mật khẩu mặc định: <strong>123456</strong>
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateMsg(null) }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
