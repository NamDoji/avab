'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserPlus, Phone, Mail, User, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

export default function DangKyPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { lang } = useLang()
  const vi = lang === 'vi'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch (err) {
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
          <h1 className="text-2xl font-black text-gray-900 mb-3">{vi ? '🎉 Đăng ký thành công!' : '🎉 Registration successful!'}</h1>
          <p className="text-gray-600 mb-2">
            {vi
              ? <> Tài khoản của bạn đã được tạo. Mật khẩu đã được gửi đến email <strong>{form.email}</strong>.</>
              : <> Your account is created. Password was sent to <strong>{form.email}</strong>.</> }
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {vi ? 'Kiểm tra hộp thư (kể cả Spam) và đăng nhập ngay!' : 'Check your inbox (including Spam) and sign in now!'}
          </p>
          <Link href="/dang-nhap" className="btn-primary inline-block">
            {vi ? 'Đăng nhập ngay →' : 'Sign in now →'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-4xl shadow-xl border border-purple-100 overflow-hidden">
          {/* Header */}
          <div className="gradient-hero text-white p-6 text-center">
            <UserPlus className="mx-auto mb-2" size={36} />
            <h1 className="text-2xl font-black">{vi ? 'Đăng ký tài khoản' : 'Create Account'}</h1>
            <p className="text-white/80 text-sm mt-1">{vi ? 'Miễn phí — nhận mật khẩu qua email' : 'Free — receive password via email'}</p>
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
                <User size={14} className="inline mr-1" /> {vi ? 'Tên phụ huynh / học sinh' : 'Parent / Student name'}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <Phone size={14} className="inline mr-1" /> {vi ? 'Số điện thoại *' : 'Phone number *'}
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0912345678"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">{vi ? 'SĐT dùng làm tên đăng nhập' : 'Phone number is your login ID'}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <Mail size={14} className="inline mr-1" /> {vi ? 'Email nhận mật khẩu *' : 'Email for password *'}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@gmail.com"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Password note */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-start gap-2">
              <span className="text-lg flex-shrink-0">📧</span>
              <p className="text-sm text-blue-700">
                {vi
                  ? <> Sau khi đăng ký thành công, mật khẩu mặc định <strong>&quot;123456&quot;</strong> sẽ được gửi qua email. Nhớ đổi mật khẩu sau khi đăng nhập lần đầu.</>
                  : <> After registration, default password <strong>&quot;123456&quot;</strong> will be sent via email. Please change it after first login.</> }
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full !py-4 text-base ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading
                ? (vi ? '⏳ Đang xử lý...' : '⏳ Processing...')
                : (vi ? '🚀 Đăng ký miễn phí' : '🚀 Sign up free')}
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <p className="text-gray-500 text-sm">
              {vi ? 'Đã có tài khoản?' : 'Already have an account?'}{' '}
              <Link href="/dang-nhap" className="text-purple-600 font-bold hover:underline">
                {vi ? 'Đăng nhập' : 'Sign in'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
