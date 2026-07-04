'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface WebhookItem {
  id: string
  url: string
  events: string[]
  isActive: boolean
  lastDeliveredAt: string | null
  createdAt: string
}

interface Props {
  webhooks: WebhookItem[]
  orgId: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ALL_EVENTS = [
  { value: 'enrollment.created',  label: 'Đăng ký mới',          icon: '📚', desc: 'Khi học sinh đăng ký khoá học' },
  { value: 'payment.received',    label: 'Thanh toán thành công', icon: '💳', desc: 'Khi nhận được thanh toán học phí' },
  { value: 'student.created',     label: 'Học sinh mới',         icon: '👤', desc: 'Khi tạo tài khoản học sinh mới' },
  { value: 'course.published',    label: 'Khoá học xuất bản',    icon: '🎓', desc: 'Khi khoá học được phát hành' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return 'Chưa gửi'
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'Vừa xong'
  if (h < 24) return `${h}h trước`
  const d = Math.floor(h / 24)
  return `${d} ngày trước`
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Webhook Modal
// ─────────────────────────────────────────────────────────────────────────────

function AddWebhookModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: (item: WebhookItem) => void
}) {
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<string[]>(['enrollment.created'])
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [error, setError] = useState('')

  function toggleEvent(val: string) {
    setEvents((prev) =>
      prev.includes(val) ? prev.filter((e) => e !== val) : [...prev, val],
    )
  }

  async function handleTest() {
    if (!url.trim()) { setError('Nhập URL trước khi test'); return }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/app-center/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json() as { success: boolean; message?: string }
      setTestResult({ ok: data.success, msg: data.message ?? (data.success ? 'Webhook phản hồi thành công' : 'Webhook không phản hồi') })
    } catch {
      setTestResult({ ok: false, msg: 'Không thể kết nối đến URL này' })
    } finally {
      setTesting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) { setError('URL không được để trống'); return }
    if (events.length === 0) { setError('Chọn ít nhất một sự kiện'); return }
    try { new URL(url) } catch { setError('URL không hợp lệ'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/app-center/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), events }),
      })
      const data = await res.json() as { success: boolean; data?: WebhookItem; error?: string }
      if (!data.success || !data.data) throw new Error(data.error ?? 'Thêm webhook thất bại')
      onAdded(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-black text-gray-800">🔗 Thêm Webhook</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Endpoint URL *</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourapp.com/webhooks/avab"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 whitespace-nowrap"
              >
                {testing ? '...' : '🧪 Test'}
              </button>
            </div>
            {testResult && (
              <p className={`text-xs mt-1.5 px-3 py-1.5 rounded-lg ${testResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {testResult.ok ? '✅' : '❌'} {testResult.msg}
              </p>
            )}
          </div>

          {/* Events */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sự kiện lắng nghe *</label>
            <div className="space-y-2">
              {ALL_EVENTS.map((ev) => (
                <label key={ev.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition">
                  <input
                    type="checkbox"
                    checked={events.includes(ev.value)}
                    onChange={() => toggleEvent(ev.value)}
                    className="mt-0.5 w-4 h-4 accent-indigo-600"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{ev.icon} {ev.label}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{ev.desc}</p>
                    <code className="text-xs text-indigo-500 font-mono">{ev.value}</code>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {loading ? 'Đang lưu...' : 'Thêm Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main client component
// ─────────────────────────────────────────────────────────────────────────────

export default function WebhooksClient({ webhooks: initialWebhooks, orgId }: Props) {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(initialWebhooks)
  const [showAdd, setShowAdd] = useState(false)

  void orgId

  function handleAdded(item: WebhookItem) {
    setWebhooks((prev) => [item, ...prev])
    setShowAdd(false)
  }

  async function handleToggle(id: string, current: boolean) {
    const res = await fetch('/api/admin/app-center/webhooks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !current }),
    })
    const data = await res.json() as { success: boolean }
    if (data.success) {
      setWebhooks((prev) => prev.map((w) => w.id === id ? { ...w, isActive: !current } : w))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá webhook này?')) return
    const res = await fetch(`/api/admin/app-center/webhooks?id=${id}`, { method: 'DELETE' })
    const data = await res.json() as { success: boolean }
    if (data.success) setWebhooks((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <>
      {showAdd && <AddWebhookModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}

      <div className="min-h-screen pt-14 bg-gray-50">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden text-white py-12"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="container-custom relative">
            <p className="text-slate-400 text-sm font-semibold mb-1">
              🧭 AvaB Admin &rsaquo;{' '}
              <Link href="/admin/app-center" className="hover:text-white transition">App Center</Link>
            </p>
            <h1 className="text-4xl font-black mb-2">🔗 Webhooks</h1>
            <p className="text-slate-400 text-sm">Nhận thông báo sự kiện thời gian thực từ AvaB</p>
          </div>
        </div>

        <div className="container-custom py-10 space-y-10">

          {/* ── How it works ─────────────────────────────────────────────── */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
            <h3 className="text-sm font-black text-indigo-800 mb-3">📡 Webhooks hoạt động như thế nào?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {[
                { step: '1', title: 'Sự kiện xảy ra', desc: 'Học sinh đăng ký, thanh toán thành công, ...' },
                { step: '2', title: 'AvaB gửi POST', desc: 'HTTP POST đến URL bạn cung cấp, kèm chữ ký HMAC' },
                { step: '3', title: 'Bạn xử lý', desc: 'Ứng dụng nhận payload JSON, xác minh chữ ký, xử lý' },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-bold text-indigo-900">{s.title}</p>
                    <p className="text-indigo-600 text-xs mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Webhook List ─────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">📡</span>
                <h2 className="text-lg font-black text-gray-800">Endpoints</h2>
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">{webhooks.length}</span>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                + Thêm Webhook
              </button>
            </div>

            {webhooks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-3">🔗</div>
                <p className="text-gray-500 text-sm">Chưa có webhook nào. Thêm endpoint để nhận sự kiện.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {webhooks.map((w) => (
                  <div key={w.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition ${w.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${w.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {w.isActive ? '● Đang hoạt động' : '○ Tắt'}
                          </span>
                          <span className="text-xs text-gray-400">Gửi lần cuối: {relativeTime(w.lastDeliveredAt)}</span>
                        </div>
                        <p className="font-mono text-sm font-semibold text-gray-800 mt-2 truncate">{w.url}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {w.events.map((ev) => {
                            const meta = ALL_EVENTS.find((e) => e.value === ev)
                            return (
                              <span key={ev} className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                                {meta?.icon} {ev}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggle(w.id, w.isActive)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-50 transition text-gray-600"
                        >
                          {w.isActive ? 'Tắt' : 'Bật'}
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Events Reference ────────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">📋</span>
              <h2 className="text-lg font-black text-gray-800">Sự kiện hỗ trợ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ALL_EVENTS.map((ev) => (
                <div key={ev.value} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{ev.icon}</div>
                  <div>
                    <code className="font-mono text-sm font-semibold text-gray-800">{ev.value}</code>
                    <p className="text-xs text-gray-500 mt-0.5">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
