'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, MessageSquare, CheckCircle2, XCircle, Clock, RefreshCw, Trash2, StickyNote } from 'lucide-react'

type Status = 'NEW' | 'WON' | 'LOST' | 'FOLLOWUP'

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  NEW:      { label: 'Mới',           color: 'bg-blue-50 text-blue-700 border-blue-200',   icon: <Clock className="w-3.5 h-3.5" /> },
  FOLLOWUP: { label: 'Cần follow-up', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <RefreshCw className="w-3.5 h-3.5" /> },
  WON:      { label: '✅ Bán được',    color: 'bg-green-50 text-green-700 border-green-200',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  LOST:     { label: '❌ Không bán',   color: 'bg-red-50 text-red-700 border-red-200',     icon: <XCircle className="w-3.5 h-3.5" /> },
}

interface Contact {
  id: string
  name: string | null
  phone: string
  email: string | null
  note: string | null
  note2: string | null
  type: string
  status: Status
  createdAt: string
}

export default function AdminContactsPage() {
  const [contacts, setContacts]     = useState<Contact[]>([])
  const [loading, setLoading]       = useState(true)
  const [filterStatus, setFilter]   = useState<string>('ALL')
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editNote, setEditNote]     = useState('')
  const [saving, setSaving]         = useState(false)

  const load = async (status?: string) => {
    setLoading(true)
    const q = status && status !== 'ALL' ? `?status=${status}` : ''
    const res = await fetch(`/api/admin/contacts${q}`)
    const data = await res.json()
    if (data.success) setContacts(data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: Status) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load(filterStatus === 'ALL' ? undefined : filterStatus)
  }

  const saveNote = async (id: string) => {
    setSaving(true)
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note2: editNote }),
    })
    setSaving(false)
    setEditingId(null)
    load()
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Xoá liên hệ này?')) return
    await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = filterStatus === 'ALL' ? contacts : contacts.filter(c => c.status === filterStatus)

  const counts = {
    ALL:      contacts.length,
    NEW:      contacts.filter(c => c.status === 'NEW').length,
    FOLLOWUP: contacts.filter(c => c.status === 'FOLLOWUP').length,
    WON:      contacts.filter(c => c.status === 'WON').length,
    LOST:     contacts.filter(c => c.status === 'LOST').length,
  }

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            Quản lý Liên hệ
          </h1>
          <button onClick={() => load(filterStatus === 'ALL' ? undefined : filterStatus)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-purple-300 transition">
            <RefreshCw className="w-4 h-4" /> Làm mới
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {(['ALL', 'NEW', 'FOLLOWUP', 'WON', 'LOST'] as const).map(s => (
            <button key={s} onClick={() => { setFilter(s); load(s === 'ALL' ? undefined : s) }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                filterStatus === s
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
              }`}>
              {s === 'ALL' ? '📋 Tất cả' : STATUS_CONFIG[s as Status].label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filterStatus === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {counts[s as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Chưa có liên hệ nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(c => {
              const st = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.NEW
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-gray-900 text-base">{c.name || 'Không tên'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(c.createdAt).toLocaleString('vi-VN')} · {c.type === 'CONTACT' ? 'Liên hệ' : 'Đăng ký'}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${st.color}`}>
                      {st.icon} {st.label}
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5 mb-4 text-sm text-gray-600">
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:text-purple-600">
                      <Phone className="w-4 h-4 text-gray-400" /> {c.phone}
                    </a>
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:text-purple-600">
                        <Mail className="w-4 h-4 text-gray-400" /> {c.email}
                      </a>
                    )}
                    {c.note && (
                      <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-2.5">
                        <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-sm leading-relaxed">{c.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Admin note */}
                  {editingId === c.id ? (
                    <div className="mb-3">
                      <textarea
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        placeholder="Ghi chú xử lý..."
                        rows={2}
                        className="w-full border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                      />
                      <div className="flex gap-2 mt-1.5">
                        <button onClick={() => saveNote(c.id)} disabled={saving}
                          className="flex-1 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition">
                          {saving ? 'Đang lưu...' : 'Lưu ghi chú'}
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg hover:bg-gray-50 transition">
                          Huỷ
                        </button>
                      </div>
                    </div>
                  ) : c.note2 ? (
                    <div className="flex items-start gap-2 bg-purple-50 rounded-xl p-2.5 mb-3 cursor-pointer hover:bg-purple-100"
                      onClick={() => { setEditingId(c.id); setEditNote(c.note2 || '') }}>
                      <StickyNote className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <p className="text-purple-800 text-xs">{c.note2}</p>
                    </div>
                  ) : null}

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setEditingId(c.id); setEditNote(c.note2 || '') }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-purple-300 hover:text-purple-600 transition">
                      <StickyNote className="w-3.5 h-3.5" /> Ghi chú
                    </button>
                    <button onClick={() => updateStatus(c.id, 'FOLLOWUP')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition ${c.status==='FOLLOWUP' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-600 hover:border-yellow-300'}`}>
                      <RefreshCw className="w-3.5 h-3.5" /> Follow-up
                    </button>
                    <button onClick={() => updateStatus(c.id, 'WON')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition ${c.status==='WON' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Bán được ✅
                    </button>
                    <button onClick={() => updateStatus(c.id, 'LOST')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition ${c.status==='LOST' ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'}`}>
                      <XCircle className="w-3.5 h-3.5" /> Không bán ❌
                    </button>
                  </div>

                  {/* Delete */}
                  <button onClick={() => deleteContact(c.id)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                    <Trash2 className="w-3.5 h-3.5" /> Xoá
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
