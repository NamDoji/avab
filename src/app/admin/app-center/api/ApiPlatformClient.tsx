'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ApiKeyItem {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

interface Props {
  apiKeys: ApiKeyItem[]
  orgId: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ALL_PERMISSIONS = [
  { value: 'courses.read',      label: 'Courses — Read',      group: 'Courses' },
  { value: 'courses.write',     label: 'Courses — Write',     group: 'Courses' },
  { value: 'students.read',     label: 'Students — Read',     group: 'Students' },
  { value: 'students.write',    label: 'Students — Write',    group: 'Students' },
  { value: 'enrollments.read',  label: 'Enrollments — Read',  group: 'Enrollments' },
  { value: 'enrollments.write', label: 'Enrollments — Write', group: 'Enrollments' },
  { value: 'payments.read',     label: 'Payments — Read',     group: 'Payments' },
  { value: 'payments.write',    label: 'Payments — Write',    group: 'Payments' },
  { value: 'analytics.read',    label: 'Analytics — Read',    group: 'Analytics' },
]

const API_DOCS = [
  { method: 'GET',  path: '/api/v1/courses',     desc: 'Danh sách khóa học' },
  { method: 'GET',  path: '/api/v1/students',    desc: 'Danh sách học sinh' },
  { method: 'POST', path: '/api/v1/enrollments', desc: 'Đăng ký khóa học' },
  { method: 'GET',  path: '/api/v1/analytics',   desc: 'Thống kê tổng quan' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function maskKey(key: string): string {
  if (key.length <= 12) return key
  const prefix = key.slice(0, 12) // "avab_sk_live"
  const suffix = key.slice(-4)
  return `${prefix}...${suffix}`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'Chưa dùng'
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'Vừa xong'
  if (h < 24) return `${h}h trước`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} ngày trước`
  return formatDate(iso)
}

// ─────────────────────────────────────────────────────────────────────────────
// Method badge
// ─────────────────────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: string }) {
  const colours: Record<string, string> = {
    GET:    'bg-emerald-100 text-emerald-700',
    POST:   'bg-blue-100 text-blue-700',
    PUT:    'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${colours[method] ?? 'bg-gray-100 text-gray-700'}`}>
      {method}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Key Modal
// ─────────────────────────────────────────────────────────────────────────────

function CreateKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (key: ApiKeyItem & { rawKey: string }) => void
}) {
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState<string[]>(['courses.read'])
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function togglePermission(val: string) {
    setPermissions((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Tên key không được để trống'); return }
    if (permissions.length === 0) { setError('Chọn ít nhất một quyền'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/app-center/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), permissions, expiresAt: expiresAt || null }),
      })
      const data = await res.json() as { success: boolean; data?: ApiKeyItem & { rawKey: string }; error?: string }
      if (!data.success || !data.data) throw new Error(data.error ?? 'Tạo key thất bại')
      onCreated(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-800">🔑 Tạo API Key mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tên key *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Production App"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Quyền hạn *</label>
            <div className="grid grid-cols-1 gap-2">
              {ALL_PERMISSIONS.map((p) => (
                <label key={p.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.includes(p.value)}
                    onChange={() => togglePermission(p.value)}
                    className="w-4 h-4 accent-cherry-600"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-mono text-cherry-600 text-xs mr-1">{p.group}</span>
                    {p.label.split('—')[1]?.trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Expires */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Hết hạn (tuỳ chọn)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #BE3659)' }}
            >
              {loading ? 'Đang tạo...' : 'Tạo API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// New Key Display Modal
// ─────────────────────────────────────────────────────────────────────────────

function NewKeyDisplayModal({ rawKey, onClose }: { rawKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function copyKey() {
    navigator.clipboard.writeText(rawKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">✅</div>
            <div>
              <h3 className="text-lg font-black text-gray-800">API Key đã tạo thành công!</h3>
              <p className="text-sm text-gray-500">Sao chép key này ngay — sẽ không hiển thị lại</p>
            </div>
          </div>

          <div className="bg-gray-950 rounded-xl p-4 font-mono text-sm text-emerald-400 break-all select-all border border-gray-800">
            {rawKey}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={copyKey}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition"
              style={{ background: copied ? '#10b981' : 'linear-gradient(135deg, #6366f1, #BE3659)' }}
            >
              {copied ? '✅ Đã sao chép!' : '📋 Sao chép key'}
            </button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main client component
// ─────────────────────────────────────────────────────────────────────────────

export default function ApiPlatformClient({ apiKeys: initialKeys, orgId }: Props) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys)
  const [showCreate, setShowCreate] = useState(false)
  const [newRawKey, setNewRawKey] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Unused orgId suppressor — used for future scoped ops
  void orgId

  function handleCreated(item: ApiKeyItem & { rawKey: string }) {
    const { rawKey, ...keyItem } = item
    setKeys((prev) => [keyItem, ...prev])
    setShowCreate(false)
    setNewRawKey(rawKey)
  }

  async function handleDelete(id: string) {
    if (!confirm('Vô hiệu hoá API key này?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/app-center/api-keys?id=${id}`, { method: 'DELETE' })
      const data = await res.json() as { success: boolean }
      if (data.success) setKeys((prev) => prev.filter((k) => k.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {showCreate && (
        <CreateKeyModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {newRawKey && (
        <NewKeyDisplayModal rawKey={newRawKey} onClose={() => setNewRawKey(null)} />
      )}

      <div className="min-h-screen pt-14 bg-gray-50">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden text-white py-12"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-cherry-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cherry-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="container-custom relative">
            <p className="text-slate-400 text-sm font-semibold mb-1">
              🧭 AvaB Admin &rsaquo;{' '}
              <Link href="/admin/app-center" className="hover:text-white transition">App Center</Link>
            </p>
            <h1 className="text-4xl font-black mb-2">🔑 API Platform</h1>
            <p className="text-slate-400 text-sm">Quản lý API Keys và tài liệu REST API</p>
          </div>
        </div>

        <div className="container-custom py-10 space-y-10">

          {/* ── API Keys ─────────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗝️</span>
                <h2 className="text-lg font-black text-gray-800">API Keys</h2>
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-cherry-100 text-cherry-700">{keys.length}</span>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #BE3659)' }}
              >
                + Tạo API Key mới
              </button>
            </div>

            {keys.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-3">🔑</div>
                <p className="text-gray-500 text-sm">Chưa có API key nào. Tạo key đầu tiên để bắt đầu.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 font-bold text-gray-600">Tên key</th>
                      <th className="text-left px-5 py-3 font-bold text-gray-600">Key</th>
                      <th className="text-left px-5 py-3 font-bold text-gray-600 hidden md:table-cell">Quyền hạn</th>
                      <th className="text-left px-5 py-3 font-bold text-gray-600 hidden lg:table-cell">Dùng lần cuối</th>
                      <th className="text-left px-5 py-3 font-bold text-gray-600 hidden lg:table-cell">Hết hạn</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-gray-800">{k.name}</td>
                        <td className="px-5 py-3.5">
                          <code className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {maskKey(k.key)}
                          </code>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {k.permissions.slice(0, 3).map((p) => (
                              <span key={p} className="px-1.5 py-0.5 rounded text-xs font-medium bg-cherry-50 text-cherry-600">
                                {p}
                              </span>
                            ))}
                            {k.permissions.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                                +{k.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">{relativeTime(k.lastUsedAt)}</td>
                        <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">{formatDate(k.expiresAt)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDelete(k.id)}
                            disabled={deletingId === k.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {deletingId === k.id ? '...' : 'Vô hiệu hoá'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Documentation Quick Links ─────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">📖</span>
              <h2 className="text-lg font-black text-gray-800">API Documentation</h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Auth notice */}
              <div className="px-6 py-4 bg-slate-50 border-b border-gray-100">
                <p className="text-sm text-gray-600">
                  Xác thực bằng header:{' '}
                  <code className="font-mono text-xs bg-slate-200 text-cherry-700 px-2 py-0.5 rounded">
                    Authorization: Bearer avab_sk_live_xxxx
                  </code>
                </p>
              </div>

              <div className="divide-y divide-gray-50">
                {API_DOCS.map((doc) => (
                  <div key={doc.path} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                    <MethodBadge method={doc.method} />
                    <code className="font-mono text-sm text-gray-800 flex-1">{doc.path}</code>
                    <span className="text-sm text-gray-500 hidden sm:block">{doc.desc}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Base URL: <code className="font-mono text-xs">https://app.avab.vn</code> &middot;
                  Phiên bản API: <code className="font-mono text-xs">v1</code>
                </p>
              </div>
            </div>
          </section>

          {/* ── Permissions reference ────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">🛡️</span>
              <h2 className="text-lg font-black text-gray-800">Quyền hạn (Scopes)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_PERMISSIONS.map((p) => (
                <div key={p.value} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cherry-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-cherry-600 text-xs font-black">{p.value.includes('.write') ? 'W' : 'R'}</span>
                  </div>
                  <code className="font-mono text-xs text-gray-700">{p.value}</code>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
