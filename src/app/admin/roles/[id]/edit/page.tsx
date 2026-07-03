'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Permission {
  id: string
  key: string
  module: string
  action: string
  name: string
  description?: string | null
}

interface PermissionsData {
  permissions: Permission[]
  grouped: Record<string, Permission[]>
}

interface Role {
  id: string
  name: string
  slug: string
  description?: string | null
  level: string
  color: string
  isSystem: boolean
  rolePermissions: { permission: Permission }[]
}

const LEVEL_OPTIONS = [
  { value: 'SYSTEM', label: '⚙️ System' },
  { value: 'ORGANIZATION', label: '🏫 Organization' },
  { value: 'ACADEMIC', label: '📚 Academic' },
  { value: 'OPERATION', label: '🏢 Operation' },
  { value: 'END_USER', label: '👥 End User' },
]

const COLOR_OPTIONS = [
  'gray', 'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky', 'blue',
  'indigo', 'violet', 'purple', 'pink', 'rose',
]

const COLOR_BG: Record<string, string> = {
  gray: 'bg-gray-400', red: 'bg-red-500', orange: 'bg-orange-500',
  amber: 'bg-amber-500', yellow: 'bg-yellow-400', lime: 'bg-lime-500',
  green: 'bg-green-500', emerald: 'bg-emerald-500', teal: 'bg-teal-500',
  cyan: 'bg-cyan-500', sky: 'bg-sky-500', blue: 'bg-blue-500',
  indigo: 'bg-indigo-500', violet: 'bg-violet-500', purple: 'bg-purple-500',
  pink: 'bg-pink-500', rose: 'bg-rose-500',
}

export default function EditRolePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [role, setRole] = useState<Role | null>(null)
  const [loadingRole, setLoadingRole] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('ACADEMIC')
  const [color, setColor] = useState('gray')

  const [permsData, setPermsData] = useState<PermissionsData | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadingPerms, setLoadingPerms] = useState(true)

  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPerms, setSavingPerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Fetch role detail
  useEffect(() => {
    fetch(`/api/admin/roles/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const r: Role = data.data
          setRole(r)
          setName(r.name)
          setDescription(r.description || '')
          setLevel(r.level)
          setColor(r.color)
          const keys = r.rolePermissions.map(rp => rp.permission.key)
          setSelected(new Set(keys))
        }
      })
      .finally(() => setLoadingRole(false))
  }, [id])

  // Fetch permissions catalog
  useEffect(() => {
    fetch('/api/admin/permissions')
      .then(r => r.json())
      .then(data => {
        if (data.success) setPermsData(data.data)
      })
      .finally(() => setLoadingPerms(false))
  }, [])

  const togglePermission = useCallback((key: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const toggleModule = useCallback((modulePerms: Permission[]) => {
    const moduleKeys = modulePerms.map(p => p.key)
    const allSelected = moduleKeys.every(k => selected.has(k))
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) {
        moduleKeys.forEach(k => next.delete(k))
      } else {
        moduleKeys.forEach(k => next.add(k))
      }
      return next
    })
  }, [selected])

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Tên role là bắt buộc'); return }
    setSavingInfo(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
          level,
        }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Lỗi cập nhật'); return }
      setSuccessMsg('✅ Đã lưu thông tin role')
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setSavingInfo(false)
    }
  }

  async function handleSavePermissions() {
    setSavingPerms(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`/api/admin/roles/${id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionKeys: Array.from(selected) }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Lỗi cập nhật permissions'); return }
      setSuccessMsg(`✅ Đã cập nhật ${data.data.updated} permissions`)
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setSavingPerms(false)
    }
  }

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Tên role là bắt buộc'); return }
    setSavingInfo(true)
    setSavingPerms(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const [infoRes, permRes] = await Promise.all([
        fetch(`/api/admin/roles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), description: description.trim() || null, color, level }),
        }),
        fetch(`/api/admin/roles/${id}/permissions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissionKeys: Array.from(selected) }),
        }),
      ])
      const [infoData, permData] = await Promise.all([infoRes.json(), permRes.json()])
      if (!infoData.success) { setError(infoData.error || 'Lỗi cập nhật thông tin'); return }
      if (!permData.success) { setError(permData.error || 'Lỗi cập nhật permissions'); return }
      setSuccessMsg(`✅ Đã lưu thành công — ${permData.data.updated} permissions`)
      router.push(`/admin/roles/${id}`)
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setSavingInfo(false)
      setSavingPerms(false)
    }
  }

  if (loadingRole) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-gray-400">
        Đang tải...
      </div>
    )
  }

  if (!role) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-red-500">
        Role không tồn tại.
      </div>
    )
  }

  const modules = permsData ? Object.keys(permsData.grouped).sort() : []
  const totalSelected = selected.size
  const totalPerms = permsData?.permissions.length ?? 0

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-violet-200 text-sm mb-3">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            {' / '}
            <Link href="/admin/roles" className="hover:text-white">Roles</Link>
            {' / '}
            <Link href={`/admin/roles/${id}`} className="hover:text-white">{role.name}</Link>
            {' / '}
            <span>Edit</span>
          </p>
          <h1 className="text-3xl font-black">✏️ Chỉnh sửa Role</h1>
          <p className="text-violet-200 text-sm mt-1 font-mono">{role.slug}</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Role info */}
          <div className="space-y-5">
            <form onSubmit={handleSaveInfo}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-black text-gray-900 text-base">📋 Thông tin Role</h2>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Tên Role *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                {/* Slug (read-only) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Slug (không thể thay đổi)
                  </label>
                  <input
                    type="text"
                    value={role.slug}
                    readOnly
                    className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono bg-gray-50 text-gray-400"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Cấp độ
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    disabled={role.isSystem}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    {LEVEL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Màu badge
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full ${COLOR_BG[c] ?? 'bg-gray-400'} transition-all ${
                          color === c ? 'ring-2 ring-offset-2 ring-gray-700 scale-110' : 'hover:scale-105'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Đang chọn: <strong>{color}</strong></p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingInfo}
                    className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60"
                  >
                    {savingInfo ? '⏳ Lưu...' : '💾 Lưu thông tin'}
                  </button>
                </div>
              </div>
            </form>

            {/* Save all button */}
            <form onSubmit={handleSaveAll}>
              <button
                type="submit"
                disabled={savingInfo || savingPerms}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-sm disabled:opacity-60"
              >
                {(savingInfo || savingPerms) ? '⏳ Đang lưu...' : '✅ Lưu tất cả & Quay lại'}
              </button>
            </form>

            <div className="flex gap-3">
              <Link href={`/admin/roles/${id}`}
                className="flex-1 text-center text-sm text-gray-500 hover:text-gray-700 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                ← Chi tiết Role
              </Link>
              <Link href="/admin/roles"
                className="flex-1 text-center text-sm text-gray-500 hover:text-gray-700 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                Danh sách Roles
              </Link>
            </div>
          </div>

          {/* Right: Permission editor */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-900 text-base">🔑 Permissions</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
                  {totalSelected} / {totalPerms}
                </span>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={savingPerms}
                  className="text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
                >
                  {savingPerms ? '⏳' : '💾 Lưu'}
                </button>
              </div>
            </div>

            {loadingPerms ? (
              <div className="text-center py-12 text-gray-400 text-sm">Đang tải permissions...</div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {modules.map(mod => {
                  const modulePerms = permsData!.grouped[mod]
                  const moduleKeys = modulePerms.map(p => p.key)
                  const allSelected = moduleKeys.every(k => selected.has(k))
                  const someSelected = moduleKeys.some(k => selected.has(k))

                  return (
                    <div key={mod} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between bg-gray-50 px-3 py-2">
                        <span className="text-xs font-black text-gray-700 uppercase tracking-wide">{mod}</span>
                        <button
                          type="button"
                          onClick={() => toggleModule(modulePerms)}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-lg transition-all ${
                            allSelected
                              ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                              : someSelected
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {allSelected ? '✅ Bỏ tất cả' : '☑️ Chọn tất cả'}
                        </button>
                      </div>

                      <div className="p-2 flex flex-wrap gap-1.5">
                        {modulePerms.map(perm => {
                          const isChecked = selected.has(perm.key)
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer border transition-all ${
                                isChecked
                                  ? 'bg-violet-50 border-violet-200 text-violet-700'
                                  : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                              }`}
                              title={perm.description ?? perm.name}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                className="sr-only"
                              />
                              <span className={isChecked ? 'text-violet-500' : 'text-gray-300'}>
                                {isChecked ? '✅' : '⬜'}
                              </span>
                              <span className="font-semibold">{perm.action}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
