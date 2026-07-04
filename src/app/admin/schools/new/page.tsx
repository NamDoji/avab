'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PRESET_COLORS = [
  '#7c3aed', // violet
  '#2563eb', // blue
  '#0891b2', // cyan
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#db2777', // pink
  '#0f172a', // dark
]

const FEATURE_LIST = [
  { key: 'gamification', label: '🎮 Gamification', desc: 'XP, Badge, Mission, Leaderboard' },
  { key: 'ai_studio',    label: '✨ AI Studio',    desc: 'Tạo nội dung học bằng AI' },
  { key: 'publishing',   label: '📤 Publishing',   desc: 'Xuất bản nội dung' },
]

export default function NewSchoolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#7c3aed')
  const [logo, setLogo] = useState('')
  const [domain, setDomain] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Settings
  const [allowSelfRegister, setAllowSelfRegister] = useState(false)
  const [maxStudents, setMaxStudents] = useState('')
  const [features, setFeatures] = useState<Record<string, boolean>>({
    gamification: true,
    ai_studio: true,
    publishing: true,
  })

  function generateSlug(val: string) {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function handleNameChange(val: string) {
    setName(val)
    if (!slugManual) {
      setSlug(generateSlug(val))
    }
  }

  function handleSlugChange(val: string) {
    setSlug(generateSlug(val))
    setSlugManual(true)
  }

  function toggleFeature(key: string) {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Tên trường là bắt buộc')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug || undefined,
          logo: logo.trim() || undefined,
          domain: domain.trim() || undefined,
          primaryColor,
          description: description.trim() || undefined,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          settings: {
            allowSelfRegister,
            maxStudents: maxStudents ? Number(maxStudents) : null,
            features,
          },
        }),
      })

      const data = await res.json() as { success: boolean; data?: { id: string }; error?: string }

      if (data.success && data.data) {
        router.push(`/admin/schools/${data.data.id}`)
      } else {
        setError(data.error ?? 'Có lỗi xảy ra')
      }
    } catch (_err) {
      setError('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2447 60%, #1a1a4e 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(99,179,237,0.1)', transform: 'translate(25%, -50%)' }} />
        <div className="container-custom relative">
          <p className="text-blue-300 text-sm mb-3">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            {' / '}
            <Link href="/admin/schools" className="hover:text-white">Trường</Link>
            {' / '}
            <span>Thêm mới</span>
          </p>
          <h1 className="text-3xl font-black">🏫 Thêm Trường mới</h1>
          <p className="text-blue-200 text-sm mt-1">Tạo đơn vị trường học / trung tâm trong hệ thống</p>
        </div>
      </div>

      {/* ── Form ───────────────────────────────────────────────────── */}
      <div className="container-custom py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
              ❌ {error}
            </div>
          )}

          {/* ── Section: Thông tin cơ bản ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-black text-gray-900 text-base border-b border-gray-100 pb-3">
              📋 Thông tin cơ bản
            </h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Tên trường <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="VD: AvaB Education, Trung tâm ABC..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Slug <span className="text-gray-400 font-normal">(dùng trong URL)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm font-mono bg-gray-50 border border-gray-200 rounded-l-xl px-3 py-2.5 border-r-0">
                  avab.vn/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  placeholder="avab-education"
                  className="flex-1 border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Màu thương hiệu</label>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPrimaryColor(c)}
                    className="w-9 h-9 rounded-xl transition-all hover:scale-110"
                    style={{
                      background: c,
                      outline: primaryColor === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-gray-200"
                  />
                  <span className="text-xs font-mono text-gray-500">{primaryColor}</span>
                </div>
              </div>
              {/* Preview */}
              <div className="mt-3 flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
                  style={{ background: primaryColor }}
                >
                  {name.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                  {name || 'Tên trường'} Preview
                </span>
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">URL Logo</label>
              <input
                type="url"
                value={logo}
                onChange={e => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Domain tùy chỉnh <span className="text-gray-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="truong-abc.avab.vn"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Mô tả</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Giới thiệu ngắn về trường..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* ── Section: Liên hệ ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-black text-gray-900 text-base border-b border-gray-100 pb-3">
              📞 Thông tin liên hệ
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Địa chỉ</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Đường ABC, Hà Nội"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0123 456 789"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@truong-abc.vn"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* ── Section: Cài đặt ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-black text-gray-900 text-base border-b border-gray-100 pb-3">
              ⚙️ Cài đặt
            </h2>

            {/* Self register toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-bold text-gray-800">Cho phép tự đăng ký</p>
                <p className="text-xs text-gray-400 mt-0.5">Học sinh có thể tự đăng ký tài khoản mà không cần admin phê duyệt</p>
              </div>
              <button
                type="button"
                onClick={() => setAllowSelfRegister(!allowSelfRegister)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowSelfRegister ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    allowSelfRegister ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Max students */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Số học sinh tối đa <span className="text-gray-400 font-normal">(để trống = không giới hạn)</span>
              </label>
              <input
                type="number"
                value={maxStudents}
                onChange={e => setMaxStudents(e.target.value)}
                min="0"
                placeholder="Không giới hạn"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Feature toggles */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Tính năng được kích hoạt</p>
              <div className="space-y-3">
                {FEATURE_LIST.map(feat => (
                  <div key={feat.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{feat.label}</p>
                      <p className="text-xs text-gray-400">{feat.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFeature(feat.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        features[feat.key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                          features[feat.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Actions ────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pb-8">
            <Link
              href="/admin/schools"
              className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl text-sm transition-all"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm"
            >
              {loading ? '⏳ Đang tạo...' : '🏫 Tạo Trường'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
