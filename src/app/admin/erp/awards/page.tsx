'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UserInfo {
  id: string
  name: string | null
  phone: string | null
}

interface RewardRecord {
  id: string
  userId: string
  type: string
  category: string
  title: string
  description: string | null
  date: string
  issuedBy: string | null
  createdAt: string
  user: UserInfo | null
}

interface StudentOption {
  id: string
  name: string | null
  phone: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const REWARD_CATEGORIES: { value: string; label: string; icon: string; color: string }[] = [
  { value: 'academic',    label: 'Học sinh giỏi', icon: '🎓', color: '#6366f1' },
  { value: 'achievement', label: 'Tiến bộ',        icon: '📈', color: '#22c55e' },
  { value: 'attendance',  label: 'Chuyên cần',     icon: '⭐', color: '#f59e0b' },
  { value: 'behavior',    label: 'Sáng tạo',       icon: '💡', color: '#ec4899' },
]

function categoryMeta(category: string) {
  return REWARD_CATEGORIES.find((c) => c.value === category) ?? {
    value: category, label: category, icon: '🏅', color: '#6b7280',
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function isThisMonth(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

// ─────────────────────────────────────────────────────────────────────────────
// New-Award Modal
// ─────────────────────────────────────────────────────────────────────────────

function NewAwardModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [query, setQuery]           = useState('')
  const [students, setStudents]     = useState<StudentOption[]>([])
  const [searching, setSearching]   = useState(false)
  const [selected, setSelected]     = useState<StudentOption | null>(null)
  const [category, setCategory]     = useState('academic')
  const [reason, setReason]         = useState('')
  const [date, setDate]             = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  // Search students
  useEffect(() => {
    if (query.length < 2) { setStudents([]); return }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/users?role=STUDENT&search=${encodeURIComponent(query)}`)
        const json = await res.json() as { success: boolean; data: StudentOption[] }
        if (json.success) setStudents(json.data.slice(0, 8))
      } finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) { setError('Vui lòng chọn học sinh'); return }
    if (!reason.trim()) { setError('Vui lòng nhập lý do'); return }

    setSaving(true)
    setError('')
    const cat = categoryMeta(category)
    try {
      const res = await fetch('/api/admin/erp/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selected.id,
          type: 'reward',
          category,
          title: cat.label,
          description: reason,
          date,
        }),
      })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) { setError(json.error ?? 'Lỗi không xác định'); return }
      onCreated()
      onClose()
    } catch {
      setError('Không thể kết nối máy chủ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 text-white flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' }}
        >
          <h2 className="font-black text-lg">🏆 Trao thưởng mới</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Student search */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Học sinh *
            </label>
            {selected ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-black text-sm flex-shrink-0">
                  {(selected.name ?? '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{selected.name ?? 'Chưa có tên'}</p>
                  <p className="text-xs text-gray-500">{selected.phone ?? '—'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setQuery('') }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Đổi
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên hoặc số điện thoại..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ⏳
                  </div>
                )}
                {students.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {students.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelected(s); setStudents([]) }}
                        className="w-full text-left px-4 py-2.5 hover:bg-amber-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xs flex-shrink-0">
                          {(s.name ?? '?')[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{s.name ?? 'Chưa có tên'}</p>
                          <p className="text-xs text-gray-500">{s.phone ?? '—'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {query.length >= 2 && !searching && students.length === 0 && (
                  <p className="mt-1 text-xs text-gray-400 pl-1">Không tìm thấy học sinh</p>
                )}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Loại khen thưởng *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REWARD_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    category === cat.value
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Lý do *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do khen thưởng..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Ngày trao
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' }}
            >
              {saving ? '⏳ Đang lưu...' : '🏆 Trao thưởng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AwardsPage() {
  const [records, setRecords]     = useState<RewardRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter]       = useState<string>('all')

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/erp/rewards?type=reward')
      const json = await res.json() as { success: boolean; data: RewardRecord[] }
      if (json.success) setRecords(json.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const filtered = filter === 'all'
    ? records
    : records.filter((r) => r.category === filter)

  const thisMonth = records.filter((r) => isThisMonth(r.date)).length

  return (
    <>
      {showModal && (
        <NewAwardModal
          onClose={() => setShowModal(false)}
          onCreated={fetchRecords}
        />
      )}

      <div className="min-h-screen pt-14 bg-gray-50">
        {/* Header */}
        <div
          className="relative overflow-hidden text-white py-10"
          style={{ background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
          />
          <div className="container-custom relative">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-amber-100 text-sm mb-2">
              <Link href="/admin/erp" className="hover:text-white transition-colors">
                School ERP
              </Link>
              <span>/</span>
              <span>Khen thưởng</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-black mb-1">🏆 Khen thưởng</h1>
                <p className="text-amber-100 text-sm">Quản lý danh hiệu và phần thưởng học sinh</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="self-start sm:self-auto px-5 py-2.5 bg-white text-amber-700 rounded-xl text-sm font-black shadow hover:shadow-md transition-all"
              >
                + Trao thưởng mới
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-10 mt-5">
              <div>
                <div className="text-3xl font-black">{records.length}</div>
                <div className="text-xs text-amber-100">Tổng khen thưởng</div>
              </div>
              <div>
                <div className="text-3xl font-black">{thisMonth}</div>
                <div className="text-xs text-amber-100">Tháng này</div>
              </div>
              {REWARD_CATEGORIES.map((cat) => {
                const count = records.filter((r) => r.category === cat.value).length
                return count > 0 ? (
                  <div key={cat.value}>
                    <div className="text-3xl font-black">{count}</div>
                    <div className="text-xs text-amber-100">{cat.label}</div>
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom py-6">
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap mb-5">
            {[{ value: 'all', label: 'Tất cả', icon: '📋' }, ...REWARD_CATEGORIES].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f.value
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
                }`}
              >
                {f.icon} {f.label}
                {f.value !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({records.filter((r) => r.category === f.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="text-4xl mb-3 animate-pulse">⏳</div>
              <p className="text-gray-400 font-semibold">Đang tải dữ liệu...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-gray-500 font-semibold text-lg">
                {records.length === 0 ? 'Chưa có khen thưởng nào' : 'Không có kết quả'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {records.length === 0
                  ? 'Nhấn "Trao thưởng mới" để bắt đầu ghi nhận'
                  : 'Thử chọn danh mục khác'}
              </p>
              {records.length === 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 px-5 py-2.5 rounded-xl text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' }}
                >
                  + Trao thưởng mới
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-700">Danh sách khen thưởng</span>
                <span className="text-sm text-gray-400">
                  {filtered.length} / {records.length} bản ghi
                </span>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {filtered.map((r) => {
                  const cat = categoryMeta(r.category)
                  return (
                    <div key={r.id} className="p-4 flex gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: cat.color + '18' }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">
                            {r.user?.name ?? r.userId}
                          </p>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: cat.color + '18', color: cat.color }}
                          >
                            {cat.icon} {cat.label}
                          </span>
                        </div>
                        {r.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(r.date)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Học sinh</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">SĐT</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Loại thưởng</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Lý do</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Ngày trao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const cat = categoryMeta(r.category)
                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-gray-50 transition-colors"
                          style={{ borderTop: '1px solid #f1f5f9' }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                                style={{ background: cat.color + '20', color: cat.color }}
                              >
                                {(r.user?.name ?? r.userId)[0]}
                              </div>
                              <span className="font-semibold text-gray-900">
                                {r.user?.name ?? r.userId}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                            {r.user?.phone ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                              style={{ background: cat.color + '18', color: cat.color }}
                            >
                              {cat.icon} {cat.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-[260px] truncate">
                            {r.description ?? <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {formatDate(r.date)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/admin/erp"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Quay về School ERP
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
