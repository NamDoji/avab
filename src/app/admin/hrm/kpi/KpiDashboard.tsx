'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiTarget {
  metric: string
  target: number
  actual: number
  weight: number
}

interface KpiRecord {
  id: string
  userId: string
  period: string
  targets: KpiTarget[]
  overallScore: number | null
  rating: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  user: { id: string; name: string | null; role: string; phone: string }
}

interface StaffUser {
  id: string
  name: string | null
  role: string
  phone: string
}

interface Props {
  staffList: StaffUser[]
  defaultPeriod: string
  periods: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RATING_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-sky-100 text-sky-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
}

function ProgressBar({ pct }: { pct: number }) {
  const color =
    pct >= 100 ? 'bg-emerald-500' : pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-right">{pct}%</span>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KpiDashboard({ staffList, defaultPeriod, periods }: Props) {
  const [period, setPeriod] = useState(defaultPeriod)
  const [records, setRecords] = useState<KpiRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState<KpiRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formUserId, setFormUserId] = useState('')
  const [formTargets, setFormTargets] = useState<KpiTarget[]>([
    { metric: 'Số buổi dạy', target: 40, actual: 0, weight: 40 },
    { metric: 'Điểm đánh giá học sinh', target: 85, actual: 0, weight: 30 },
    { metric: 'Hoàn thành báo cáo', target: 100, actual: 0, weight: 20 },
    { metric: 'Tham gia đào tạo', target: 2, actual: 0, weight: 10 },
  ])
  const [formRating, setFormRating] = useState('A')

  const fetchRecords = useCallback(async (p: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/hrm/kpi?period=${encodeURIComponent(p)}`)
      const data = await res.json()
      setRecords(data.records ?? [])
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords(period)
  }, [period, fetchRecords])

  function openAdd() {
    setEditRecord(null)
    setFormUserId(staffList[0]?.id ?? '')
    setFormTargets([
      { metric: 'Số buổi dạy', target: 40, actual: 0, weight: 40 },
      { metric: 'Điểm đánh giá học sinh', target: 85, actual: 0, weight: 30 },
      { metric: 'Hoàn thành báo cáo', target: 100, actual: 0, weight: 20 },
      { metric: 'Tham gia đào tạo', target: 2, actual: 0, weight: 10 },
    ])
    setFormRating('A')
    setError('')
    setShowModal(true)
  }

  function openEdit(rec: KpiRecord) {
    setEditRecord(rec)
    setFormUserId(rec.userId)
    setFormTargets(Array.isArray(rec.targets) ? rec.targets : [])
    setFormRating(rec.rating ?? 'A')
    setError('')
    setShowModal(true)
  }

  function calcOverallScore() {
    const totalWeight = formTargets.reduce((s, t) => s + t.weight, 0)
    if (totalWeight === 0) return 0
    const weighted = formTargets.reduce((s, t) => {
      const pct = t.target > 0 ? Math.min((t.actual / t.target) * 100, 100) : 0
      return s + (pct * t.weight) / totalWeight
    }, 0)
    return Math.round(weighted)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const overallScore = calcOverallScore()
    try {
      const res = await fetch('/api/admin/hrm/kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: formUserId, period, targets: formTargets, overallScore, rating: formRating }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Lỗi lưu KPI')
      setShowModal(false)
      fetchRecords(period)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }

  function updateTarget(idx: number, field: keyof KpiTarget, value: string | number) {
    setFormTargets((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)))
  }

  function addTargetRow() {
    setFormTargets((prev) => [...prev, { metric: '', target: 100, actual: 0, weight: 10 }])
  }

  function removeTargetRow(idx: number) {
    setFormTargets((prev) => prev.filter((_, i) => i !== idx))
  }

  const avgScore =
    records.length > 0 ? Math.round(records.reduce((s, r) => s + (r.overallScore ?? 0), 0) / records.length) : 0

  return (
    <>
      {/* ── Period selector ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🗓️ Kỳ đánh giá</p>
          <div className="flex gap-2 flex-wrap">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                  period === p
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-emerald-600 text-white rounded-2xl px-5 py-2.5 text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          ＋ Thêm KPI
        </button>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: '👥',
            label: 'Đã đánh giá',
            value: records.length,
            sub: `kỳ ${period}`,
            color: 'from-emerald-500 to-teal-600',
          },
          {
            icon: '📈',
            label: 'Điểm TB',
            value: avgScore + '%',
            sub: 'Hiệu suất trung bình',
            color: 'from-sky-500 to-blue-600',
          },
          {
            icon: '⭐',
            label: 'Rating A',
            value: records.filter((r) => r.rating === 'A').length,
            sub: 'Nhân viên xuất sắc',
            color: 'from-amber-500 to-orange-500',
          },
          {
            icon: '⚠️',
            label: 'Cần cải thiện',
            value: records.filter((r) => ['C', 'D', 'F'].includes(r.rating ?? '')).length,
            sub: 'Rating C, D, F',
            color: 'from-red-500 to-rose-600',
          },
        ].map((c) => (
          <div
            key={c.label}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${c.color} p-5 text-white shadow-md`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="text-3xl font-black">{c.value}</div>
            <div className="text-sm font-bold mt-0.5">{c.label}</div>
            <div className="text-xs opacity-80 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── KPI Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-black text-gray-700">📋 Bảng KPI — kỳ {period}</p>
          {loading && <span className="text-xs text-gray-400 animate-pulse">Đang tải...</span>}
        </div>

        {records.length === 0 && !loading ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-500 font-bold mb-1">Chưa có dữ liệu KPI</p>
            <p className="text-gray-400 text-sm">Nhấn &quot;Thêm KPI&quot; để bắt đầu đánh giá nhân viên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-bold text-gray-600 text-xs">Nhân viên</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Chỉ tiêu (tóm tắt)</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs min-w-[160px]">Tiến độ</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Rating</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Ngày đánh giá</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const targets = Array.isArray(rec.targets) ? rec.targets : []
                  const pct = rec.overallScore ?? 0
                  return (
                    <tr key={rec.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm flex-shrink-0">
                            {(rec.user.name ?? rec.user.phone).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{rec.user.name ?? rec.user.phone}</div>
                            <div className="text-xs text-gray-400">{rec.user.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {targets.slice(0, 2).map((t, i) => (
                            <div key={i}>
                              {t.metric}: {t.actual}/{t.target}
                            </div>
                          ))}
                          {targets.length > 2 && (
                            <div className="text-gray-400">+{targets.length - 2} chỉ tiêu khác</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <ProgressBar pct={pct} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-black ${
                            RATING_COLORS[rec.rating ?? ''] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {rec.rating ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {rec.reviewedAt ? new Date(rec.reviewedAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(rec)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="font-black text-gray-900 text-lg">
                {editRecord ? '✏️ Cập nhật KPI' : '＋ Thêm KPI mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Staff selector */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">👤 Nhân viên</label>
                <select
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  disabled={!!editRecord}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name ?? s.phone} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Period (read-only) */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">🗓️ Kỳ đánh giá</label>
                <input
                  value={period}
                  readOnly
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium bg-gray-50 text-gray-500"
                />
              </div>

              {/* Targets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-700">🎯 Chỉ tiêu & Kết quả</label>
                  <button
                    onClick={addTargetRow}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    + Thêm chỉ tiêu
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 px-1">
                    <span className="col-span-4">Chỉ tiêu</span>
                    <span className="col-span-2 text-center">Mục tiêu</span>
                    <span className="col-span-2 text-center">Thực tế</span>
                    <span className="col-span-2 text-center">Tỷ trọng %</span>
                    <span className="col-span-2"></span>
                  </div>
                  {formTargets.map((t, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        value={t.metric}
                        onChange={(e) => updateTarget(idx, 'metric', e.target.value)}
                        placeholder="Tên chỉ tiêu"
                        className="col-span-4 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <input
                        type="number"
                        value={t.target}
                        onChange={(e) => updateTarget(idx, 'target', Number(e.target.value))}
                        className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <input
                        type="number"
                        value={t.actual}
                        onChange={(e) => updateTarget(idx, 'actual', Number(e.target.value))}
                        className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <input
                        type="number"
                        value={t.weight}
                        onChange={(e) => updateTarget(idx, 'weight', Number(e.target.value))}
                        className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <button
                        onClick={() => removeTargetRow(idx)}
                        className="col-span-2 text-xs text-red-400 hover:text-red-600 font-bold text-center"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Điểm dự kiến:{' '}
                  <span className="font-black text-emerald-700">{calcOverallScore()}%</span>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">⭐ Xếp loại</label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D', 'F'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFormRating(r)}
                      className={`flex-1 py-2 rounded-2xl text-sm font-black transition-all ${
                        formRating === r
                          ? RATING_COLORS[r] + ' ring-2 ring-emerald-400'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Đang lưu...' : editRecord ? 'Cập nhật' : 'Lưu KPI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
