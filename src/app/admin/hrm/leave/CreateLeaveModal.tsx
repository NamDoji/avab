'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Staff {
  id: string
  name: string | null
  role: string
}

interface Props {
  staff: Staff[]
}

const LEAVE_TYPES = [
  { value: 'annual', label: '🌴 Nghỉ phép năm' },
  { value: 'sick', label: '🤒 Nghỉ ốm' },
  { value: 'unpaid', label: '💼 Nghỉ không lương' },
  { value: 'maternity', label: '👶 Nghỉ thai sản' },
]

export default function CreateLeaveModal({ staff }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    userId: '',
    type: 'annual',
    startDate: today,
    endDate: today,
    reason: '',
  })

  function calcDays(start: string, end: string) {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000
    return Math.max(1, Math.round(diff + 1))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.userId) { setMsg('Vui lòng chọn nhân viên'); return }
    setLoading(true)
    setMsg('')
    try {
      const days = calcDays(form.startDate, form.endDate)
      const res = await fetch('/api/admin/hrm/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, days }),
      })
      const json = await res.json()
      if (json.success) {
        setMsg('✅ Đã tạo đơn nghỉ phép!')
        setOpen(false)
        setForm({ userId: '', type: 'annual', startDate: today, endDate: today, reason: '' })
        router.refresh()
      } else {
        setMsg(json.error ?? 'Lỗi không xác định')
      }
    } catch {
      setMsg('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {msg && !open && (
        <span className="text-sm font-semibold text-green-600">{msg}</span>
      )}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-amber-500 text-white rounded-2xl px-5 py-2.5 text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm"
      >
        + Tạo đơn nghỉ phép
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900">🌴 Tạo đơn nghỉ phép</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nhân viên *</label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">— Chọn nhân viên —</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.name ?? 'Chưa đặt tên'} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Loại nghỉ *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Từ ngày *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Đến ngày *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="text-sm text-amber-700 font-bold">
                Số ngày: {calcDays(form.startDate, form.endDate)} ngày
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Lý do</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={2}
                  placeholder="Lý do xin nghỉ..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              {msg && <p className="text-sm font-semibold text-red-600">{msg}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-2xl py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 text-white rounded-2xl py-2.5 text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {loading ? '⏳ Đang lưu...' : '✅ Tạo đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
