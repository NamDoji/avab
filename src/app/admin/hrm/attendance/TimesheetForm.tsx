'use client'

import { useState } from 'react'

interface Staff {
  id: string
  name: string | null
  role: string
}

interface Props {
  staff: Staff[]
  onSuccess?: () => void
}

export default function TimesheetForm({ staff, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    userId: '',
    date: new Date().toISOString().slice(0, 10),
    checkIn: '08:00',
    checkOut: '17:00',
    note: '',
  })

  async function handleSeed() {
    setSeeding(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/hrm/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true }),
      })
      const json = await res.json()
      setMsg(json.message ?? json.error ?? 'Xong')
      if (json.success) onSuccess?.()
    } catch {
      setMsg('Lỗi kết nối')
    } finally {
      setSeeding(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.userId) { setMsg('Vui lòng chọn nhân viên'); return }
    setLoading(true)
    setMsg('')
    try {
      const dateStr = form.date
      const checkIn = form.checkIn ? `${dateStr}T${form.checkIn}:00` : undefined
      const checkOut = form.checkOut ? `${dateStr}T${form.checkOut}:00` : undefined
      const res = await fetch('/api/admin/hrm/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: form.userId, date: dateStr, checkIn, checkOut, note: form.note }),
      })
      const json = await res.json()
      if (json.success) {
        setMsg('✅ Đã chấm công thành công!')
        setForm({ userId: '', date: new Date().toISOString().slice(0, 10), checkIn: '08:00', checkOut: '17:00', note: '' })
        setOpen(false)
        onSuccess?.()
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
    <div className="flex items-center gap-3">
      {msg && (
        <span className={`text-sm font-semibold ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </span>
      )}
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="flex items-center gap-2 bg-gray-100 text-gray-700 rounded-2xl px-4 py-2.5 text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {seeding ? '⏳' : '🌱'} Seed dữ liệu mẫu
      </button>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white text-cherry-700 border border-cherry-300 rounded-2xl px-4 py-2.5 text-sm font-bold hover:bg-cherry-50 transition-colors"
      >
        📝 Chấm công
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-gray-900">📝 Chấm công nhanh</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nhân viên *</label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                >
                  <option value="">— Chọn nhân viên —</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name ?? 'Chưa đặt tên'} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Ngày *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Check-in</label>
                  <input
                    type="time"
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Check-out</label>
                  <input
                    type="time"
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="VD: Đi làm muộn..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                />
              </div>

              {msg && (
                <p className={`text-sm font-semibold ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {msg}
                </p>
              )}

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
                  className="flex-1 bg-cherry-600 text-white rounded-2xl py-2.5 text-sm font-bold hover:bg-cherry-700 transition-colors disabled:opacity-50"
                >
                  {loading ? '⏳ Đang lưu...' : '✅ Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
