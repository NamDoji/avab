import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'CRM Campaigns — AvaB EOS' }

// ── Mock campaign data ─────────────────────────────────────────────────────────
// NOTE: No DB model yet — will be replaced with real data when CampaignModel is added.
interface Campaign {
  id: string
  name: string
  channel: 'EMAIL' | 'SMS' | 'ZALO' | 'SOCIAL'
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'PAUSED'
  audience: number
  sent: number
  opened: number
  converted: number
  sentDate: string | null
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Khai giảng khóa Tháng 8/2024',
    channel: 'EMAIL',
    status: 'SENT',
    audience: 1240,
    sent: 1238,
    opened: 487,
    converted: 38,
    sentDate: '15/07/2024',
  },
  {
    id: '2',
    name: 'Ưu đãi 30% học phí - Hè 2024',
    channel: 'SMS',
    status: 'SENT',
    audience: 856,
    sent: 852,
    opened: 623,
    converted: 51,
    sentDate: '02/06/2024',
  },
  {
    id: '3',
    name: 'Thông báo lịch học Tháng 9',
    channel: 'ZALO',
    status: 'SCHEDULED',
    audience: 2100,
    sent: 0,
    opened: 0,
    converted: 0,
    sentDate: null,
  },
  {
    id: '4',
    name: 'Re-engage học viên cũ Q3/2024',
    channel: 'EMAIL',
    status: 'DRAFT',
    audience: 340,
    sent: 0,
    opened: 0,
    converted: 0,
    sentDate: null,
  },
  {
    id: '5',
    name: 'TikTok Ads — Thu hút học sinh THPT',
    channel: 'SOCIAL',
    status: 'PAUSED',
    audience: 15000,
    sent: 9800,
    opened: 1230,
    converted: 12,
    sentDate: '01/07/2024',
  },
]

// ── Configs ────────────────────────────────────────────────────────────────────
const CHANNEL_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  EMAIL:  { label: 'Email',       icon: '📧', color: '#1d4ed8', bg: '#dbeafe' },
  SMS:    { label: 'SMS',         icon: '💬', color: '#854d0e', bg: '#fef9c3' },
  ZALO:   { label: 'Zalo OA',     icon: '💚', color: '#166534', bg: '#dcfce7' },
  SOCIAL: { label: 'Social Media',icon: '📱', color: '#7e22ce', bg: '#fae8ff' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Bản nháp',    color: '#6b7280', bg: '#f3f4f6' },
  SCHEDULED: { label: 'Đã lên lịch', color: '#1d4ed8', bg: '#dbeafe' },
  SENT:      { label: 'Đã gửi',      color: '#166534', bg: '#dcfce7' },
  PAUSED:    { label: 'Tạm dừng',    color: '#854d0e', bg: '#fef9c3' },
}

// ── Channel capability cards ────────────────────────────────────────────────────
const CHANNEL_CARDS = [
  {
    icon: '📧',
    title: 'Email Campaign',
    desc: 'Newsletter, khuyến mãi, onboarding học viên mới',
    color: '#1d4ed8',
    bg: '#dbeafe',
    comingSoon: false,
  },
  {
    icon: '💬',
    title: 'SMS Campaign',
    desc: 'Tin nhắn ngắn đến số điện thoại học sinh, phụ huynh',
    color: '#854d0e',
    bg: '#fef9c3',
    comingSoon: true,
  },
  {
    icon: '💚',
    title: 'Zalo OA',
    desc: 'Gửi ZNS qua Zalo Official Account đến học viên',
    color: '#166534',
    bg: '#dcfce7',
    comingSoon: true,
  },
  {
    icon: '📱',
    title: 'Social Media',
    desc: 'Quảng cáo Facebook, TikTok, Instagram Ads',
    color: '#7e22ce',
    bg: '#fae8ff',
    comingSoon: true,
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function pct(n: number, total: number) {
  if (total === 0) return 0
  return Math.round((n / total) * 100)
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function CampaignsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const totalSent      = MOCK_CAMPAIGNS.filter((c) => c.status === 'SENT').length
  const totalAudience  = MOCK_CAMPAIGNS.reduce((s, c) => s + c.audience, 0)
  const totalConverted = MOCK_CAMPAIGNS.reduce((s, c) => s + c.converted, 0)

  return (
    <div className="min-h-screen pt-20 bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #b45309 0%, #dc2626 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-orange-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/crm" className="hover:text-white transition-colors">CRM</Link>
            <span>/</span>
            <span>Campaigns</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">📣 Campaigns</h1>
              <p className="text-orange-200 text-sm">
                Quản lý chiến dịch Email · SMS · Zalo OA · Social Media
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
              >
                🚀 Sắp ra mắt
              </span>
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                ➕ Tạo Campaign
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">

        {/* ── Summary Stats ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng campaigns',  value: MOCK_CAMPAIGNS.length, icon: '📋', bg: '#fae8ff', color: '#7e22ce' },
            { label: 'Đã gửi',          value: totalSent,             icon: '✅', bg: '#dcfce7', color: '#166534' },
            { label: 'Tổng audience',   value: totalAudience.toLocaleString('vi-VN'), icon: '👥', bg: '#dbeafe', color: '#1d4ed8' },
            { label: 'Tổng chuyển đổi', value: totalConverted,        icon: '🎯', bg: '#fef9c3', color: '#854d0e' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: s.bg, border: `1px solid ${s.color}22` }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: s.color }}>{s.icon} {s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Channel Capability Cards ─────────────────────────────── */}
        <div>
          <h2 className="text-sm font-black text-gray-700 mb-3">📡 Kênh gửi</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {CHANNEL_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{ background: card.bg, border: `1px solid ${card.color}22` }}
              >
                {card.comingSoon && (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: card.color, color: '#fff' }}
                  >
                    Sắp ra mắt
                  </span>
                )}
                <span className="text-3xl block mb-2">{card.icon}</span>
                <h3 className="text-sm font-black" style={{ color: card.color }}>{card.title}</h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: card.color + 'bb' }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Campaign List ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-800">📊 Danh sách Campaigns</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-semibold">
              Dữ liệu mẫu — chưa kết nối DB
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {MOCK_CAMPAIGNS.map((campaign) => {
              const ch  = CHANNEL_CONFIG[campaign.channel]
              const st  = STATUS_CONFIG[campaign.status]
              const openRate    = pct(campaign.opened,    campaign.sent)
              const convertRate = pct(campaign.converted, campaign.audience)

              return (
                <div key={campaign.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {/* Left: name + channel */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: ch.bg, color: ch.color }}
                        >
                          {ch.icon} {ch.label}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-gray-900 mt-1.5">{campaign.name}</h3>
                      {campaign.sentDate && (
                        <p className="text-xs text-gray-400 mt-0.5">Gửi ngày: {campaign.sentDate}</p>
                      )}
                    </div>

                    {/* Right: metrics */}
                    <div className="flex gap-4 text-center shrink-0">
                      <div>
                        <p className="text-xs text-gray-400">Audience</p>
                        <p className="text-sm font-black text-gray-800">{campaign.audience.toLocaleString()}</p>
                      </div>
                      {campaign.status === 'SENT' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-400">Mở email</p>
                            <p className="text-sm font-black" style={{ color: '#1d4ed8' }}>{openRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Chuyển đổi</p>
                            <p className="text-sm font-black" style={{ color: '#166534' }}>{convertRate}%</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for sent campaigns */}
                  {campaign.status === 'SENT' && campaign.sent > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16 shrink-0">Mở</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${openRate}%`, background: '#1d4ed8' }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-blue-700 w-10 text-right">
                          {campaign.opened.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16 shrink-0">Đăng ký</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${convertRate}%`, background: '#166534' }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-green-700 w-10 text-right">
                          {campaign.converted}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Coming Soon Banner ────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #b4530922, #dc262622)', border: '1px dashed #b4530944' }}
        >
          <p className="text-2xl mb-2">🚀</p>
          <h3 className="text-base font-black text-gray-800">Tính năng Campaigns đang được phát triển</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Sắp ra mắt: Soạn campaign trực tiếp trong AvaB EOS, lên lịch gửi tự động,
            phân tích hiệu quả và A/B testing.
          </p>
          <Link
            href="/admin/crm"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#b45309,#dc2626)' }}
          >
            ← Quay lại CRM
          </Link>
        </div>

      </div>
    </div>
  )
}
