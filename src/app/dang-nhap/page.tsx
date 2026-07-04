'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Phone, Lock } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

const ROLE_REDIRECT: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  TEACHER: '/giao-vien',
  STUDENT: '/hoc-vien',
  PARENT: '/phu-huynh',
}

export default function DangNhapPage() {
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { lang } = useLang()
  const vi = lang === 'vi'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      phone: form.phone,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setLoading(false)
      setError(vi ? 'Số điện thoại hoặc mật khẩu không đúng.' : 'Incorrect phone number or password.')
      return
    }

    // Fetch session to get role and redirect accordingly
    try {
      const res = await fetch('/api/auth/session')
      const sess = await res.json()
      const role: string = (sess?.user?.role as string | undefined) ?? 'STUDENT'
      router.push(ROLE_REDIRECT[role] ?? '/hoc-vien')
    } catch {
      router.push('/hoc-vien')
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-4xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="gradient-hero text-white p-6 text-center">
            <LogIn className="mx-auto mb-2" size={36} />
            <h1 className="text-2xl font-black">{vi ? 'Đăng nhập' : 'Sign In'}</h1>
            <p className="text-white/80 text-sm mt-1">
              {vi ? 'Vào trang học của bạn' : 'Access your learning dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <Phone size={14} className="inline mr-1" />
                {vi ? 'Số điện thoại' : 'Phone number'}
              </label>
              <input
                type="tel"
                required
                autoFocus
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0912345678"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <Lock size={14} className="inline mr-1" />
                {vi ? 'Mật khẩu' : 'Password'}
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
              {loading
                ? (vi ? '⏳ Đang đăng nhập...' : '⏳ Signing in...')
                : (vi ? '🔑 Đăng nhập' : '🔑 Sign In')}
            </button>
          </form>

          <div className="px-6 pb-6 text-center space-y-2">
            <p className="text-gray-500 text-sm">
              <Link href="/doi-mat-khau" className="text-purple-500 hover:underline text-sm">
                {vi ? '🔓 Quên mật khẩu?' : '🔓 Forgot password?'}
              </Link>
            </p>
            <p className="text-gray-500 text-sm">
              {vi ? 'Chưa có tài khoản?' : "Don't have an account?"}{' '}
              <Link href="/dang-ky" className="text-purple-600 font-bold hover:underline">
                {vi ? 'Đăng ký miễn phí' : 'Sign up free'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
