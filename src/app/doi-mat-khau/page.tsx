'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'

export default function DoiMatKhauPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.')
      return
    }

    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch {
      setError('Không thể kết nối. Kiểm tra lại kết nối mạng.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-teal-500" size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">✅ Đổi mật khẩu thành công!</h1>
          <p className="text-gray-600 mb-6">Mật khẩu của bạn đã được cập nhật. Vui lòng dùng mật khẩu mới cho lần đăng nhập tiếp theo.</p>
          <Link href="/hoc-vien" className="btn-primary inline-block">
            Về trang học viên →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-4xl shadow-xl border border-purple-100 overflow-hidden">
          {/* Header */}
          <div className="gradient-hero text-white p-6 text-center">
            <KeyRound className="mx-auto mb-2" size={36} />
            <h1 className="text-2xl font-black">Đổi mật khẩu</h1>
            <p className="text-white/80 text-sm mt-1">Bảo mật tài khoản của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                🔐 Mật khẩu hiện tại
              </label>
              <input
                type="password"
                required
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                🔑 Mật khẩu mới
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                ✅ Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full !py-4 text-base ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? '⏳ Đang xử lý...' : '💾 Đổi mật khẩu'}
            </button>

            <div className="text-center">
              <Link href="/hoc-vien" className="flex items-center justify-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition">
                <ArrowLeft size={14} /> Quay lại trang học viên
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
