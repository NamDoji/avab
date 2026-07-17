'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PaymentGatewayPage() {
  const gateways = [
    {
      id: 'vnpay',
      name: 'VNPay',
      emoji: '🏦',
      desc: 'Cổng thanh toán nội địa phổ biến nhất Việt Nam',
      color: '#005BAC',
      bg: 'linear-gradient(135deg, #005BAC 0%, #003d7a 100%)',
      badge: 'Phổ biến',
      badgeColor: '#fbbf24',
      features: ['Thẻ ATM nội địa', 'NAPAS', 'Internet Banking', 'QR Code'],
    },
    {
      id: 'momo',
      name: 'MoMo',
      emoji: '💜',
      desc: 'Ví điện tử hàng đầu với 31 triệu người dùng',
      color: '#A50064',
      bg: 'linear-gradient(135deg, #A50064 0%, #7b004a 100%)',
      badge: 'Hot',
      badgeColor: '#ef4444',
      features: ['Ví MoMo', 'QR Code', 'Link thanh toán', 'Trả sau'],
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      emoji: '💙',
      desc: 'Thanh toán nhanh qua Zalo với hàng triệu người dùng',
      color: '#0068FF',
      bg: 'linear-gradient(135deg, #0068FF 0%, #004fc4 100%)',
      badge: 'Mới',
      badgeColor: '#10b981',
      features: ['Ví ZaloPay', 'Chuyển khoản', 'QR Code', 'Zalo nhắc nợ'],
    },
    {
      id: 'stripe',
      name: 'Stripe',
      emoji: '🌐',
      desc: 'Cổng quốc tế hỗ trợ thẻ Visa, Mastercard, Apple Pay',
      color: '#6772E5',
      bg: 'linear-gradient(135deg, #6772E5 0%, #4f56c5 100%)',
      badge: 'Quốc tế',
      badgeColor: '#BE3659',
      features: ['Visa / Mastercard', 'Apple Pay', 'Google Pay', 'Đa tiền tệ'],
    },
  ]

  const webhookSteps = [
    { step: '1', title: 'Tạo tài khoản merchant', desc: 'Đăng ký tài khoản doanh nghiệp với cổng thanh toán bạn chọn' },
    { step: '2', title: 'Lấy API Key & Secret', desc: 'Lấy credentials từ dashboard của cổng thanh toán' },
    { step: '3', title: 'Cấu hình Webhook URL', desc: 'Trỏ webhook về: https://your-domain.com/api/webhooks/payment' },
    { step: '4', title: 'Test môi trường Sandbox', desc: 'Kiểm tra với tài khoản test trước khi live' },
    { step: '5', title: 'Go Live', desc: 'Chuyển sang môi trường production sau khi test thành công' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-10"
        style={{ background: 'linear-gradient(135deg, #29050F 0%, #3730a3 50%, #4f46e5 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/finance"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <nav className="flex items-center gap-2 text-cherry-300 text-xs">
              <Link href="/admin/finance" className="hover:text-white transition">Finance</Link>
              <span>›</span>
              <span className="text-white font-semibold">Cổng thanh toán</span>
            </nav>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">💳 Cổng thanh toán online</h1>
              <p className="text-cherry-200 text-sm">
                Kết nối cổng thanh toán để học viên đóng học phí trực tuyến
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-2xl text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#c7d2fe', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              🔜 Dự kiến ra mắt Q3/2026
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── Coming Soon Banner ────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-6 text-white flex items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
        >
          <div className="text-4xl flex-shrink-0">🚀</div>
          <div>
            <h2 className="font-black text-xl mb-1">Thanh toán online sẽ ra mắt trong Q3 2026</h2>
            <p className="text-yellow-100 text-sm">
              Tính năng đang trong quá trình phát triển. Bạn có thể xem trước các cổng thanh toán sẽ được tích hợp
              và chuẩn bị sẵn tài khoản merchant để kích hoạt ngay khi tính năng ra mắt.
            </p>
          </div>
        </div>

        {/* ── Gateway Cards ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="font-black text-gray-900 text-xl mb-4">🏦 Cổng thanh toán được hỗ trợ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {gateways.map((gw) => (
              <div
                key={gw.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Card header */}
                <div className="p-6 text-white" style={{ background: gw.bg }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                      >
                        {gw.emoji}
                      </div>
                      <div>
                        <h3 className="font-black text-lg">{gw.name}</h3>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: gw.badgeColor, color: '#1a1a1a' }}
                        >
                          {gw.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {gw.desc}
                  </p>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {gw.features.map((f) => (
                      <span
                        key={f}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl font-black text-sm text-white cursor-not-allowed opacity-70 transition"
                    style={{ background: gw.bg }}
                    title="Tính năng sẽ ra mắt Q3/2026"
                  >
                    🔗 Kết nối — Coming Soon
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Webhook Setup Instructions ────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">⚙️ Hướng dẫn tích hợp Webhook</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Chuẩn bị trước để kích hoạt ngay khi tính năng ra mắt
            </p>
          </div>
          <div className="p-6 space-y-4">
            {webhookSteps.map((item) => (
              <div key={item.step} className="flex gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}

            {/* Webhook URL preview */}
            <div
              className="mt-4 rounded-2xl px-5 py-4 font-mono text-sm"
              style={{ background: '#0f172a', color: '#86efac' }}
            >
              <div className="text-xs text-gray-500 mb-2 font-sans">Webhook Endpoint</div>
              <code>POST /api/webhooks/payment</code>
              <div className="mt-3 text-xs text-gray-400 font-sans space-y-1">
                <div>{'{'}</div>
                <div className="ml-4"><span className="text-yellow-300">&quot;event&quot;</span>: <span className="text-green-300">&quot;payment.success&quot;</span>,</div>
                <div className="ml-4"><span className="text-yellow-300">&quot;orderId&quot;</span>: <span className="text-green-300">&quot;avab_payment_id&quot;</span>,</div>
                <div className="ml-4"><span className="text-yellow-300">&quot;amount&quot;</span>: <span className="text-blue-300">500000</span>,</div>
                <div className="ml-4"><span className="text-yellow-300">&quot;gateway&quot;</span>: <span className="text-green-300">&quot;vnpay&quot;</span></div>
                <div>{'}'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-8 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #29050F 0%, #4f46e5 100%)' }}
        >
          <div className="text-4xl mb-4">📬</div>
          <h3 className="font-black text-xl mb-2">Nhận thông báo khi ra mắt</h3>
          <p className="text-cherry-200 text-sm mb-6">
            Tính năng thanh toán online sẽ ra mắt trong Q3/2026. Liên hệ đội phát triển để được hỗ trợ tích hợp sớm.
          </p>
          <a
            href="mailto:dev@avab.edu.vn"
            className="inline-block px-8 py-3 rounded-2xl font-black text-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}
          >
            ✉️ Liên hệ đội phát triển
          </a>
        </div>

        <div>
          <Link href="/admin/finance" className="text-sm text-gray-500 hover:text-gray-800 transition">
            ← Quay về Finance Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
