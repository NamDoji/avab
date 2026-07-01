'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react'

export default function LienHePage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'CONTACT' }),
      })
      const data = await res.json()
      if (data.success || res.ok) {
        setDone(true)
      } else {
        setError(data.error || 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch {
      setError('Không thể gửi. Vui lòng thử lại sau.')
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-hero text-white py-16 pt-28">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-3">📬 Liên hệ với AvaB</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Có câu hỏi về khoá học? Muốn hợp tác? Hãy để lại thông tin — chúng tôi sẽ phản hồi trong vòng 24 giờ.
          </p>
        </div>
      </div>

      <div className="container-custom py-14 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-10">

          {/* ── Form liên hệ ── */}
          <div className="bg-white rounded-4xl shadow-sm p-8">
            {done ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                <CheckCircle className="w-16 h-16 text-teal-500" />
                <h2 className="text-xl font-black text-gray-900">Đã gửi thành công!</h2>
                <p className="text-gray-500">Chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể. Cảm ơn bạn!</p>
                <button
                  onClick={() => { setDone(false); setForm({ name: '', phone: '', email: '', message: '' }) }}
                  className="mt-2 text-purple-600 font-semibold hover:underline text-sm"
                >
                  Gửi thêm
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên *</label>
                    <input
                      required
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
                    <input
                      required
                      type="tel"
                      placeholder="0912 345 678"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Bạn muốn hỏi hoặc trao đổi điều gì?"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? 'Đang gửi...' : <><Send size={16} /> Gửi liên hệ</>}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── Thông tin liên hệ ── */}
          <div className="space-y-5">
            {/* Zalo / Phone */}
            <div className="bg-white rounded-4xl shadow-sm p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-0.5">Zalo / Điện thoại</p>
                <a href="tel:0904290583" className="text-purple-600 font-semibold hover:underline text-sm">
                  0904 290 583
                </a>
                <p className="text-gray-400 text-xs mt-1">Thứ 2 – Thứ 7 · 8:00 – 20:00</p>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-4xl shadow-sm p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-0.5">Email</p>
                <a href="mailto:nam@itsol.vn" className="text-purple-600 font-semibold hover:underline text-sm">
                  nam@itsol.vn
                </a>
                <p className="text-gray-400 text-xs mt-1">Phản hồi trong vòng 24 giờ</p>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="bg-white rounded-4xl shadow-sm p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-0.5">Địa chỉ</p>
                <p className="text-gray-600 text-sm">SH1 Toà B, CC Paragon, Ngõ 86 Duy Tân, Cầu Giấy, Hà Nội</p>
                <p className="text-gray-400 text-xs mt-1">Đào tạo online toàn quốc</p>
              </div>
            </div>

            {/* Banner Zalo */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-4xl p-6 text-white">
              <p className="text-2xl mb-2">💬</p>
              <h3 className="font-black text-lg mb-1">Nhắn Zalo ngay!</h3>
              <p className="text-white/80 text-sm mb-4">Được tư vấn miễn phí về khoá học phù hợp cho bé.</p>
              <a
                href="https://zalo.me/0904290583"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-purple-700 font-extrabold px-6 py-2.5 rounded-2xl text-sm hover:scale-105 transition-all"
              >
                Mở Zalo →
              </a>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
