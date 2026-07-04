'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewStudentPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', phone: '', email: '', parentName: '', parentPhone: '', grade: '', note: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.phone) { setError('Vui lòng nhập số điện thoại'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || `hs_${form.phone}@avab.local`,
          role: 'STUDENT',
        }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error ?? 'Lỗi không xác định'); return }
      router.push(`/admin/erp/students/${data.data.id}`)
    } catch {
      setError('Không kết nối được server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/admin/erp/students" className="text-gray-400 hover:text-gray-600 transition text-sm">← Học sinh</Link>
          <span className="text-gray-300">/</span>
          <h1 className="font-black text-gray-900 text-lg">➕ Thêm học sinh mới</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">👤 Thông tin học sinh</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Họ và tên</label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="0912345678"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="hocsinh@email.com (tuỳ chọn)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Khối lớp</label>
                <select
                  value={form.grade}
                  onChange={e => set('grade', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                >
                  <option value="">-- Chọn khối --</option>
                  {['Mầm non','Lớp 1','Lớp 2','Lớp 3','Lớp 4','Lớp 5','Lớp 6','Lớp 7','Lớp 8','Lớp 9','Lớp 10','Lớp 11','Lớp 12'].map(g => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parent info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">👨‍👩‍👧 Phụ huynh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Họ tên phụ huynh</label>
                <input
                  value={form.parentName}
                  onChange={e => set('parentName', e.target.value)}
                  placeholder="Nguyễn Văn B"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">SĐT phụ huynh</label>
                <input
                  value={form.parentPhone}
                  onChange={e => set('parentPhone', e.target.value)}
                  placeholder="0987654321"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-xs font-bold text-gray-500 mb-1">Ghi chú</label>
            <textarea
              rows={3}
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="Ghi chú thêm..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
            💡 Mật khẩu mặc định: <strong>123456</strong> — yêu cầu học sinh đổi sau lần đăng nhập đầu tiên.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">❌ {error}</div>
          )}

          <div className="flex gap-3 pb-6">
            <Link
              href="/admin/erp/students"
              className="flex-1 flex items-center justify-center py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              {loading ? '⏳ Đang tạo...' : '✅ Tạo học sinh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
