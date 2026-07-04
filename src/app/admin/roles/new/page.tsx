'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function CreateRolePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cloneId = searchParams.get('clone')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('ACADEMIC')
  const [color, setColor] = useState('gray')

  const [permsData, setPermsData] = useState<PermissionsData | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadingPerms, setLoadingPerms] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-slug from name
  useEffect(() => {
    setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }, [name])

  // Fetch permissions
  useEffect(() => {
    fetch('/api/admin/permissions')
      .then(r => r.json())
      .then(data => {
        if (data.success) setPermsData(data.data)
      })
      .finally(() => setLoadingPerms(false))
  }, [])

  // Pre-fill if cloning
  useEffect(() => {
    if (!cloneId) return
    fetch(`/api/admin/roles/${cloneId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const role = data.data
          setName(role.name + ' (Clone)')
          setDescription(role.description || '')
          setLevel(role.level)
          setColor(role.color)
          const keys = (role.rolePermissions as { permission: Permission }[]).map(rp => rp.permission.key)
          setSelected(new Set(keys))
        }
      })
  }, [cloneId])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Tên role là bắt buộc'); return }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          level,
          color,
          permissions: Array.from(selected),
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Tạo role thất bại')
        return
      }
      router.push(`/admin/roles/${data.data.id}`)
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setSubmitting(false)
    }
  }

  const modules = permsData ? Object.keys(permsData.grouped).sort() : []
  const totalSelected = selected.size
  const totalPerms = permsData?.permissions.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-violet-200 text-sm mb-3">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            {' / '}
            <Link href="/admin/roles" className="hover:text-white">Roles</Link>
            {' / '}
            <span>New</span>
          </p>
          <h1 className="text-3xl font-black">🛡️ Tạo Role Mới</h1>
          {cloneId && <p className="text-violet-200 text-sm mt-1">📋 Clone từ role có sẵn</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="container-custom py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Role info */}
            <div className="space-y-5">
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
                    placeholder="vd: Giáo viên chủ nhiệm"
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Slug (auto-generated)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="giao-vien-chu-nhiem"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Cấp độ *
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
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
                    placeholder="Mô tả ngắn về vai trò này..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-sm disabled:opacity-60"
              >
                {submitting ? '⏳ Đang tạo...' : '✅ Tạo Role'}
              </button>

              <Link href="/admin/roles"
                className="block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Quay lại danh sách
              </Link>
            </div>

            {/* Right: Permission editor */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-900 text-base">🔑 Permissions</h2>
                <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
                  {totalSelected} / {totalPerms} đã chọn
                </span>
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
                        {/* Module header */}
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

                        {/* Permissions checkboxes */}
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
      </form>
    </div>
  )
}


export default function CreateRolePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray-400">Đang tải...</span></div>}>
      <CreateRolePageInner />
    </Suspense>
  )
}
