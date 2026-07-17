'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orgId: string
  onClose: () => void
}

export default function AddCampusModal({ orgId, onClose }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Tên cơ sở là bắt buộc'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/campuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || undefined,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Lỗi không xác định'); return }
      router.refresh()
      onClose()
    } catch {
      setError('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-gray-900 text-lg">🏫 Thêm Cơ sở</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tên cơ sở <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cơ sở Quận 1, Chi nhánh Hà Nội..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mã cơ sở</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: Q1, BD, HN..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Địa chỉ đầy đủ..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0xx xxx xxxx"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-black shadow disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #951F3D, #2563eb)' }}
            >
              {loading ? '⏳ Đang tạo...' : '✅ Tạo Cơ sở'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
