'use client'

import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContractEmployee {
  id: string
  name: string | null
  role: string
  phone: string
}

export interface ContractRow {
  id: string
  userId: string
  type: string
  startDate: string
  endDate: string | null
  salary: number | null
  position: string | null
  status: string
  notes: string | null
  createdAt: string
  employee: ContractEmployee
}

interface StaffUser {
  id: string
  name: string | null
  role: string
  phone: string
}

interface Props {
  initialContracts: ContractRow[]
  staffList: StaffUser[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  fulltime: 'Toàn thời gian',
  parttime: 'Bán thời gian',
  probation: 'Thử việc',
  freelance: 'Freelance',
}

const CONTRACT_TYPE_COLORS: Record<string, string> = {
  fulltime: 'bg-blue-100 text-blue-700',
  parttime: 'bg-sky-100 text-sky-700',
  probation: 'bg-amber-100 text-amber-700',
  freelance: 'bg-cherry-100 text-cherry-700',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-gray-100 text-gray-600',
  terminated: 'bg-red-100 text-red-700',
}

function fmtVND(n: number) {
  return n.toLocaleString('vi-VN') + ' đ'
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ContractsClient({ initialContracts, staffList }: Props) {
  const [contracts, setContracts] = useState<ContractRow[]>(initialContracts)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Form state
  const [formUserId, setFormUserId] = useState(staffList[0]?.id ?? '')
  const [formType, setFormType] = useState('fulltime')
  const [formStart, setFormStart] = useState('')
  const [formEnd, setFormEnd] = useState('')
  const [formSalary, setFormSalary] = useState('')
  const [formPosition, setFormPosition] = useState('')
  const [formNotes, setFormNotes] = useState('')

  function openAdd() {
    setFormUserId(staffList[0]?.id ?? '')
    setFormType('fulltime')
    setFormStart('')
    setFormEnd('')
    setFormSalary('')
    setFormPosition('')
    setFormNotes('')
    setError('')
    setShowModal(true)
  }

  const handleSave = useCallback(async () => {
    if (!formUserId || !formStart) {
      setError('Vui lòng chọn nhân viên và ngày bắt đầu')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/hrm/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formUserId,
          type: formType,
          startDate: formStart,
          endDate: formEnd || null,
          salary: formSalary ? Number(formSalary) : null,
          position: formPosition || null,
          notes: formNotes || null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Lỗi tạo hợp đồng')
      setContracts((prev) => [data.contract, ...prev])
      setShowModal(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }, [formUserId, formType, formStart, formEnd, formSalary, formPosition, formNotes])

  const filtered = filterStatus === 'all' ? contracts : contracts.filter((c) => c.status === filterStatus)

  const expiringCount = contracts.filter((c) => {
    const d = daysUntil(c.endDate)
    return d !== null && d > 0 && d <= 30
  }).length

  return (
    <>
      {/* ── Expiry warning ───────────────────────────────────────────────────── */}
      {expiringCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-black text-amber-800 text-sm">{expiringCount} hợp đồng sắp hết hạn</p>
            <p className="text-amber-700 text-xs">Cần gia hạn hoặc chấm dứt trong 30 ngày tới</p>
          </div>
        </div>
      )}

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'probation', 'expired', 'terminated'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                filterStatus === s
                  ? 'bg-cherry-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-cherry-300'
              }`}
            >
              {s === 'all' ? 'Tất cả' : CONTRACT_TYPE_LABELS[s] ?? s}
              {s === 'active' && <span className="ml-1">({contracts.filter((c) => c.status === 'active').length})</span>}
            </button>
          ))}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-cherry-600 text-white rounded-2xl px-5 py-2.5 text-sm font-bold hover:bg-cherry-700 transition-colors shadow-sm"
        >
          ＋ Tạo hợp đồng
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-black text-gray-700">📄 Danh sách hợp đồng ({filtered.length})</p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">📄</div>
            <p className="text-gray-500 font-bold mb-1">Chưa có hợp đồng nào</p>
            <p className="text-gray-400 text-sm">Nhấn &quot;Tạo hợp đồng&quot; để thêm hợp đồng đầu tiên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-bold text-gray-600 text-xs">Nhân viên</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Loại HĐ</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Chức vụ</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Từ ngày</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Đến ngày</th>
                  <th className="text-right px-4 py-3 font-bold text-gray-600 text-xs">Lương</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const days = daysUntil(c.endDate)
                  const isExpiringSoon = days !== null && days > 0 && days <= 30
                  const isExpired = days !== null && days <= 0

                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-cherry-100 flex items-center justify-center text-cherry-700 font-black text-sm flex-shrink-0">
                            {(c.employee.name ?? c.employee.phone).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{c.employee.name ?? c.employee.phone}</div>
                            <div className="text-xs text-gray-400">{c.employee.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-black ${CONTRACT_TYPE_COLORS[c.type] ?? 'bg-gray-100 text-gray-700'}`}>
                          {CONTRACT_TYPE_LABELS[c.type] ?? c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{c.position ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(c.startDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        {c.endDate ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-600">
                              {new Date(c.endDate).toLocaleDateString('vi-VN')}
                            </span>
                            {isExpiringSoon && (
                              <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-black">
                                ⚠️ {days}d
                              </span>
                            )}
                            {isExpired && (
                              <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-black">
                                Hết hạn
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Không xác định</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">
                        {c.salary ? fmtVND(c.salary) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-black ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.status === 'active' ? '✅ Hiệu lực' : c.status === 'expired' ? '⏰ Hết hạn' : c.status === 'terminated' ? '❌ Chấm dứt' : c.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal: Tạo hợp đồng ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="font-black text-gray-900 text-lg">📄 Tạo hợp đồng mới</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">👤 Nhân viên *</label>
                <select
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name ?? s.phone} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">📋 Loại hợp đồng *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                  >
                    <option value="fulltime">Toàn thời gian</option>
                    <option value="parttime">Bán thời gian</option>
                    <option value="probation">Thử việc</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">💼 Chức vụ</label>
                  <input
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="VD: Giáo viên Toán"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">📅 Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">📅 Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">💰 Lương cơ bản (VNĐ)</label>
                <input
                  type="number"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  placeholder="VD: 12000000"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">📝 Ghi chú</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm về hợp đồng..."
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-cherry-600 text-white text-sm font-bold hover:bg-cherry-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Đang lưu...' : 'Tạo hợp đồng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
