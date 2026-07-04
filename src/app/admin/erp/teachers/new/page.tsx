'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTeacherPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', phone: '', email: '', subject: '', qualification: '', note: '',
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
          email: form.email || `gv_${form.phone}@avab.local`,
          role: 'TEACHER',
        }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error ?? 'Lỗi không xác định'); return }
      router.push(`/admin/erp/teachers/${data.data.id}`)
    } catch {
      setError('Không kết nối được server')
    } finally {
      setLoading(false)
    }
  }

  const SUBJECTS = ['Toán','Văn','Tiếng Anh','Vật Lý','Hóa học','Sinh học','Lịch sử','Địa lý','GDCD','Tin học','Thể dục','Mỹ thuật','Âm nhạc','Công nghệ']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/admin/erp/teachers" className="text-gray-400 hover:text-gray-600 transition text-sm">← Giáo viên</Link>
          <span className="text-gray-300">/</span>
          <h1 className="font-black text-gray-900 text-lg">➕ Thêm giáo viên mới</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">👨‍🏫 Thông tin giáo viên</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Họ và tên</label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Nguyễn Thị Lan"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="0912345678"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="giaovien@email.com (tuỳ chọn)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Môn dạy chính</label>
                <select
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400"
                >
                  <option value="">-- Chọn môn --</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Bằng cấp / Chuyên môn</label>
                <input
                  value={form.qualification}
                  onChange={e => set('qualification', e.target.value)}
                  placeholder="Thạc sĩ Toán học — ĐH Sư phạm HN"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400"
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
              placeholder="Kinh nghiệm, lưu ý..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none"
            />
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-xs text-violet-700">
            💡 Mật khẩu mặc định: <strong>123456</strong> — yêu cầu giáo viên đổi sau lần đăng nhập đầu tiên.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">❌ {error}</div>
          )}

          <div className="flex gap-3 pb-6">
            <Link
              href="/admin/erp/teachers"
              className="flex-1 flex items-center justify-center py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4338ca)' }}
            >
              {loading ? '⏳ Đang tạo...' : '✅ Tạo giáo viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
