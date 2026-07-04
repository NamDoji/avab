'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  organizationId: string
}

export default function AcademicYearsPage() {
  const [years, setYears]   = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/erp/academic-years')
      .then(r => r.json()).then(setYears).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin/erp/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Lỗi'); return }
      setYears(prev => [data, ...prev].map(y => form.isCurrent ? { ...y, isCurrent: y.id === data.id } : y))
      setShowForm(false)
      setForm({ name: '', startDate: '', endDate: '', isCurrent: false })
    } finally { setSaving(false) }
  }

  async function setCurrentYear(id: string) {
    await fetch('/api/admin/erp/academic-years', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isCurrent: true }),
    })
    setYears(prev => prev.map(y => ({ ...y, isCurrent: y.id === id })))
  }

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin/erp" className="text-gray-400 hover:text-gray-600 text-sm">← ERP</Link>
            <span className="text-gray-300">/</span>
            <h1 className="font-black text-gray-900 text-lg">📅 Năm học</h1>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white min-h-[40px]"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            ➕ Thêm năm học
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Add form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-5 shadow-sm mb-4 space-y-3">
            <h3 className="font-black text-gray-800 text-sm">Năm học mới</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Tên năm học</label>
                <input value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))}
                  placeholder="Năm học 2026-2027" required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Ngày bắt đầu</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f=>({...f, startDate:e.target.value}))} required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Ngày kết thúc</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f=>({...f, endDate:e.target.value}))} required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isCurrent} onChange={e => setForm(f=>({...f, isCurrent:e.target.checked}))}
                className="w-4 h-4 rounded" />
              <span className="text-sm font-semibold text-gray-700">Đặt làm năm học hiện tại</span>
            </label>
            {error && <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">❌ {error}</div>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
              <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {saving ? '⏳ Đang lưu...' : '✅ Tạo'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : years.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-gray-500 font-semibold">Chưa có năm học nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {years.map(y => (
              <div key={y.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{y.isCurrent ? '📅' : '🗓️'}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-gray-900">{y.name}</p>
                      {y.isCurrent && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Hiện tại</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(y.startDate).toLocaleDateString('vi-VN')} → {new Date(y.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                {!y.isCurrent && (
                  <button
                    onClick={() => setCurrentYear(y.id)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all min-h-[40px]"
                  >
                    Đặt hiện tại
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
