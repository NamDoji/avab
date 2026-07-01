'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Phone, Lock } from 'lucide-react'

export default function DangNhapPage() {
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      phone: form.phone,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Số điện thoại hoặc mật khẩu không đúng.')
    } else {
      router.push('/hoc-vien')
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-4xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="gradient-hero text-white p-6 text-center">
            <LogIn className="mx-auto mb-2" size={36} />
            <h1 className="text-2xl font-black">Đăng nhập</h1>
            <p className="text-white/80 text-sm mt-1">Vào trang học của con</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <Phone size={14} className="inline mr-1" /> Số điện thoại
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0912345678"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <Lock size={14} className="inline mr-1" /> Mật khẩu
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full !py-4 text-base ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? '⏳ Đang đăng nhập...' : '🔑 Đăng nhập'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <p className="text-gray-500 text-sm">
              Chưa có tài khoản?{' '}
              <Link href="/dang-ky" className="text-purple-600 font-bold hover:underline">
                Đăng ký miễn phí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
