'use client'

import { useState, useEffect } from 'react'

interface LocalCampaign {
  id: string
  name: string
  channel: string
  audience: string
  startDate: string
  budget: string
  createdAt: string
}

const STORAGE_KEY = 'avab_demo_campaigns'
const CHANNELS = ['EMAIL', 'SMS', 'ZALO', 'SOCIAL']

export default function CampaignCreateClient() {
  const [campaigns, setCampaigns] = useState<LocalCampaign[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', channel: 'EMAIL', audience: '', startDate: '', budget: '',
  })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCampaigns(JSON.parse(stored) as LocalCampaign[])
    } catch { /* ignore */ }
  }, [])

  function save(updated: LocalCampaign[]) {
    setCampaigns(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setMsg('❌ Vui lòng nhập tên campaign'); return }
    const newCampaign: LocalCampaign = {
      id: Date.now().toString(),
      name: form.name.trim(),
      channel: form.channel,
      audience: form.audience,
      startDate: form.startDate,
      budget: form.budget,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    }
    save([newCampaign, ...campaigns])
    setForm({ name: '', channel: 'EMAIL', audience: '', startDate: '', budget: '' })
    setShowForm(false)
    setMsg('✅ Đã tạo campaign (lưu local demo)')
    setTimeout(() => setMsg(''), 3000)
  }

  function handleDelete(id: string) {
    save(campaigns.filter(c => c.id !== id))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    background: '#fff',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6,
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-gray-800">➕ Tạo Campaign Mới</h2>
          <p className="text-xs text-gray-400 mt-0.5">Demo mode — lưu vào localStorage</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#b45309,#dc2626)' }}
        >
          {showForm ? '✕ Đóng' : '➕ Tạo Campaign'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-5">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Tên campaign *</label>
              <input
                style={inputStyle}
                placeholder="VD: Khai giảng Tháng 9/2025"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>Kênh gửi</label>
              <select
                style={{ ...inputStyle }}
                value={form.channel}
                onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
              >
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Target audience</label>
              <input
                style={inputStyle}
                placeholder="VD: Học sinh THPT Hà Nội"
                value={form.audience}
                onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>Ngày bắt đầu</label>
              <input
                type="date"
                style={inputStyle}
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>Ngân sách (VNĐ)</label>
              <input
                style={inputStyle}
                placeholder="VD: 5000000"
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="submit"
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#b45309,#dc2626)',
                color: '#fff', fontWeight: 700, cursor: 'pointer',
              }}
            >
              💾 Lưu Campaign
            </button>
            {msg && <span style={{ fontSize: 13, fontWeight: 600 }}>{msg}</span>}
          </div>
        </form>
      )}

      {!showForm && msg && (
        <div className="px-5 pb-3">
          <p className="text-sm font-semibold text-green-600">{msg}</p>
        </div>
      )}

      {/* Saved campaigns */}
      {campaigns.length > 0 && (
        <div className="divide-y divide-gray-50">
          {campaigns.map(c => (
            <div key={c.id} className="px-5 py-3 flex items-center gap-3">
              <span className="text-lg">📣</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {c.channel} · {c.audience || '—'} · {c.startDate || 'Chưa có ngày'}
                  {c.budget ? ` · ${parseInt(c.budget).toLocaleString('vi-VN')} ₫` : ''}
                  · Tạo: {c.createdAt}
                </p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                style={{
                  padding: '5px 10px', borderRadius: 8, border: 'none',
                  background: '#fef2f2', color: '#dc2626', fontWeight: 700,
                  cursor: 'pointer', fontSize: 12,
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {campaigns.length === 0 && !showForm && (
        <div className="px-5 py-8 text-center text-gray-400">
          <p className="text-2xl mb-2">📣</p>
          <p className="text-sm">Chưa có campaign nào. Nhấn &ldquo;Tạo Campaign&rdquo; để bắt đầu.</p>
        </div>
      )}
    </div>
  )
}
