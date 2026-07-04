'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ORG_TYPES = [
  {
    value: 'CENTER',
    icon: '🏢',
    label: 'Trung tâm',
    desc: 'Trung tâm học thêm, luyện thi, kỹ năng',
  },
  {
    value: 'SCHOOL',
    icon: '🏫',
    label: 'Trường học',
    desc: 'Trường phổ thông, đại học, cơ sở giáo dục chính quy',
  },
  {
    value: 'CHAIN',
    icon: '🔗',
    label: 'Chuỗi',
    desc: 'Nhiều chi nhánh, chuỗi trung tâm / hệ thống trường',
  },
]

const MODULES = [
  { key: 'ai-studio', icon: '🤖', label: 'AI Studio', defaultOn: true },
  { key: 'erp', icon: '🏫', label: 'School ERP', defaultOn: true },
  { key: 'finance', icon: '💰', label: 'Finance ERP', defaultOn: true },
  { key: 'crm', icon: '📞', label: 'CRM', defaultOn: false },
  { key: 'hrm', icon: '👥', label: 'HRM', defaultOn: false },
  { key: 'collaboration', icon: '💬', label: 'Collaboration', defaultOn: false },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function NewOrganizationPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [type, setType] = useState('CENTER')
  const [modules, setModules] = useState<string[]>(
    MODULES.filter((m) => m.defaultOn).map((m) => m.key)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(val: string) {
    setName(val)
    if (!slugManual) {
      setSlug(slugify(val))
    }
  }

  function handleSlugChange(val: string) {
    setSlugManual(true)
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  function toggleModule(key: string) {
    setModules((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !slug.trim()) {
      setError('Tên và slug là bắt buộc')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), type, modules }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Lỗi không xác định')
        return
      }
      router.push(`/admin/organizations/${json.data.id}`)
    } catch {
      setError('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
      >
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Link href="/admin/organizations" className="hover:text-white transition-colors">Organizations</Link>
            <span>/</span>
            <span className="text-white">Tạo mới</span>
          </div>
          <h1 className="text-3xl font-black">➕ Thêm Organization</h1>
          <p className="text-slate-400 text-sm mt-1">Tạo trường học hoặc trung tâm mới trên AvaB</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              ❌ {error}
            </div>
          )}

          {/* Name */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-black text-gray-900">Thông tin cơ bản</h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Tên tổ chức <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="VD: AvaB Hà Nội, Trung tâm ABC..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">avab.vn/org/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="avab-ha-noi"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Tự động sinh từ tên, có thể chỉnh sửa</p>
            </div>
          </div>

          {/* Type */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="font-black text-gray-900">Loại tổ chức</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ORG_TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    type === t.value
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => setType(t.value)}
                    className="sr-only"
                  />
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className="font-bold text-sm text-gray-900">{t.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-snug">{t.desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="font-black text-gray-900">Module kích hoạt</h2>
            <div className="space-y-2">
              {MODULES.map((m) => (
                <label
                  key={m.key}
                  className="flex items-center gap-3 cursor-pointer rounded-xl border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={modules.includes(m.key)}
                    onChange={() => toggleModule(m.key)}
                    className="w-4 h-4 accent-violet-600 rounded"
                  />
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-sm font-bold text-gray-800">{m.label}</span>
                  {m.defaultOn && (
                    <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Mặc định
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/admin/organizations"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-black shadow-md hover:scale-[1.01] transition-transform disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
            >
              {loading ? '⏳ Đang tạo...' : '✅ Tạo Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
