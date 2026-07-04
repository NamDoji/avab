'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LeadEditFormProps {
  id: string
  initialStatus: string
  initialNote: string | null
  initialNote2: string | null
}

const STATUSES = [
  { value: 'NEW',      label: '🆕 Mới',              color: '#1d4ed8' },
  { value: 'FOLLOWUP', label: '💬 Đang tư vấn',       color: '#854d0e' },
  { value: 'WON',      label: '✅ Đã đăng ký',        color: '#166534' },
  { value: 'LOST',     label: '❌ Không đăng ký',     color: '#991b1b' },
]

export default function LeadEditForm({ id, initialStatus, initialNote, initialNote2 }: LeadEditFormProps) {
  const router = useRouter()
  const [status, setStatus]   = useState(initialStatus)
  const [note, setNote]       = useState(initialNote ?? '')
  const [note2, setNote2]     = useState(initialNote2 ?? '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: note || null, note2: note2 || null }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Lỗi cập nhật')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-gray-800">✏️ Cập nhật thông tin</h3>

      {/* Status */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
          Trạng thái
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all"
              style={
                status === s.value
                  ? { background: s.color, color: '#fff', borderColor: s.color }
                  : { background: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ghi chú khách hàng (note) */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
          Ghi chú khách hàng
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Quan tâm khóa học, nguồn tiếp cận, yêu cầu đặc biệt..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
        />
      </div>

      {/* Ghi chú nội bộ / Phân công (note2) */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
          Ghi chú nội bộ / Phân công
        </label>
        <textarea
          value={note2}
          onChange={(e) => setNote2(e.target.value)}
          placeholder="Giao cho ai, ghi chú xử lý nội bộ..."
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-2.5 text-xs font-semibold" style={{ background: '#fee2e2', color: '#991b1b' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
        style={{
          background: saved
            ? 'linear-gradient(135deg,#166534,#16a34a)'
            : 'linear-gradient(135deg,#7c2d12,#c2410c)',
        }}
      >
        {saving ? '⏳ Đang lưu...' : saved ? '✅ Đã lưu!' : '💾 Lưu thay đổi'}
      </button>
    </div>
  )
}
