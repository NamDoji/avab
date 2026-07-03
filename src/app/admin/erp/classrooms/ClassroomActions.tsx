'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClassRoom {
  id: string
  name: string
  capacity: number
  type: string
  floor: number | null
  building: string | null
  isActive: boolean
}

interface Props {
  classroom: ClassRoom
}

export function ClassroomActions({ classroom }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Xóa phòng "${classroom.name}"?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/erp/classrooms/${classroom.id}`, { method: 'DELETE' })
      const data = await res.json() as { success: boolean }
      if (data.success) router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50"
      style={{ background: '#fee2e2', color: '#dc2626' }}
    >
      {deleting ? '...' : 'Xóa'}
    </button>
  )
}

export function AddClassroomModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    capacity: 30,
    type: 'standard',
    floor: '',
    building: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Tên phòng là bắt buộc'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/erp/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          capacity: form.capacity,
          type: form.type,
          floor: form.floor ? parseInt(form.floor) : undefined,
          building: form.building || undefined,
        }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setOpen(false)
        setForm({ name: '', capacity: 30, type: 'standard', floor: '', building: '' })
        router.refresh()
      } else {
        setError(data.error ?? 'Có lỗi xảy ra')
      }
    } catch (err) {
      console.error(err)
      setError('Lỗi kết nối')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl font-bold text-sm text-white shadow hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
      >
        + Thêm phòng
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-4">🏛️ Thêm phòng học</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Tên phòng *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="VD: Phòng 101"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Sức chứa</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm((p) => ({ ...p, capacity: parseInt(e.target.value) || 30 }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Tầng</label>
                  <input
                    type="number"
                    value={form.floor}
                    onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))}
                    placeholder="1"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Loại phòng</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="standard">Phòng thường</option>
                  <option value="lab">Phòng thí nghiệm</option>
                  <option value="computer">Phòng máy tính</option>
                  <option value="music">Phòng âm nhạc</option>
                  <option value="gym">Phòng thể dục</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Tòa nhà</label>
                <input
                  type="text"
                  value={form.building}
                  onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
                  placeholder="VD: Tòa A"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-black text-white text-sm disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-gray-600 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
