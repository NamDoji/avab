import Link from 'next/link'

export const metadata = { title: 'App Center — AvaB' }

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface AppCard {
  icon: string
  name: string
  desc: string
  connected?: boolean
  apiDoc?: string
}

interface AppSection {
  id: string
  icon: string
  title: string
  apps: AppCard[]
}

const APP_SECTIONS: AppSection[] = [
  {
    id: 'communication',
    icon: '💬',
    title: 'Communication',
    apps: [
      { icon: '💬', name: 'Zalo OA',         desc: 'Gửi thông báo, tự động hoá qua Zalo Official Account' },
      { icon: '📧', name: 'Gmail',            desc: 'Tích hợp email, gửi thông báo tự động cho phụ huynh' },
      { icon: '📱', name: 'SMS',              desc: 'Nhắn tin SMS OTP, nhắc lịch học và thông báo khẩn' },
      { icon: '🟦', name: 'Microsoft Teams',  desc: 'Họp trực tuyến, chat và cộng tác qua Microsoft 365' },
    ],
  },
  {
    id: 'video',
    icon: '🎥',
    title: 'Video Conferencing',
    apps: [
      { icon: '🎥', name: 'Zoom',          desc: 'Lớp học trực tuyến với Zoom Meetings & Webinar' },
      { icon: '🟢', name: 'Google Meet',   desc: 'Họp và dạy học qua Google Meet, tích hợp Calendar' },
      { icon: '🟦', name: 'Microsoft Teams', desc: 'Hội nghị & lớp học qua hệ sinh thái Microsoft 365' },
      { icon: '🌐', name: 'Whereby',       desc: 'Phòng học ảo nhúng trực tiếp vào giao diện AvaB' },
    ],
  },
  {
    id: 'calendar',
    icon: '📅',
    title: 'Calendar',
    apps: [
      { icon: '📅', name: 'Google Calendar', desc: 'Đồng bộ lịch học, thi và sự kiện với Google Calendar' },
      { icon: '📆', name: 'Outlook',         desc: 'Kết nối Microsoft Outlook cho lịch dạy và họp' },
      { icon: '🗓️', name: 'iCal',           desc: 'Xuất lịch học định dạng iCal tương thích mọi ứng dụng' },
      { icon: '🍎', name: 'Apple Calendar',  desc: 'Đồng bộ lịch trực tiếp với Apple Calendar (iOS/macOS)' },
    ],
  },
  {
    id: 'payment',
    icon: '💳',
    title: 'Payment',
    apps: [
      { icon: '🏦', name: 'VNPay',    desc: 'Thanh toán học phí qua VNPay QR và cổng thanh toán' },
      { icon: '💜', name: 'MoMo',     desc: 'Nhận học phí và gửi thông báo thanh toán qua ví MoMo' },
      { icon: '💙', name: 'ZaloPay',  desc: 'Thanh toán tức thì qua ZaloPay cho phụ huynh học sinh' },
      { icon: '🏧', name: 'Ngân hàng', desc: 'Tích hợp Internet Banking qua cổng thanh toán mở' },
    ],
  },
  {
    id: 'lms',
    icon: '🎓',
    title: 'LMS / Education',
    apps: [
      { icon: '🏫', name: 'Google Classroom', desc: 'Đồng bộ lớp học, bài tập và điểm từ Google Classroom' },
      { icon: '📘', name: 'Moodle',           desc: 'Kết nối hệ thống LMS Moodle hiện có của trường' },
      { icon: '⬛', name: 'Blackboard',       desc: 'Tích hợp Blackboard Learn cho trường đại học' },
      { icon: '🟥', name: 'Canvas LMS',       desc: 'Nhập/xuất khoá học và dữ liệu từ Canvas LMS' },
    ],
  },
]

const DEV_CARDS: (AppCard & { big?: boolean; href?: string })[] = [
  {
    icon: '🔑',
    name: 'API Platform',
    desc: 'Quản lý API Keys, xem tài liệu REST API và tích hợp dữ liệu học sinh, khoá học, điểm số.',
    href: '/admin/app-center/api',
  },
  {
    icon: '🔗',
    name: 'Webhooks',
    desc: 'Nhận thông báo sự kiện thời gian thực: đăng ký mới, thanh toán, điểm danh, nộp bài và các sự kiện tuỳ chỉnh.',
    href: '/admin/app-center/webhooks',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
      🔜 Sắp ra mắt
    </span>
  )
}

function AppCardComponent({ app }: { app: AppCard }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-indigo-100 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-gray-800 text-sm leading-tight">{app.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{app.desc}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <ComingSoonBadge />
        <button
          disabled
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-400 cursor-not-allowed"
          title="Sắp ra mắt"
        >
          Kết nối
        </button>
      </div>
    </div>
  )
}

function DevCardComponent({ card }: { card: typeof DEV_CARDS[number] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #e0e7ff, #f0fdf4)' }}
        >
          {card.icon}
        </div>
        <div>
          <h3 className="font-black text-gray-800 text-lg leading-tight">{card.name}</h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-auto">
        {card.href ? (
          <Link
            href={card.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            ⚙️ Quản lý
          </Link>
        ) : card.apiDoc ? (
          <Link
            href={card.apiDoc}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            📖 Xem tài liệu
          </Link>
        ) : (
          <ComingSoonBadge />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AppCenterPage() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-slate-400 text-sm font-semibold mb-1">🧭 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-2">🔌 App Center</h1>
          <p className="text-slate-400 text-sm">Tích hợp và mở rộng AvaB</p>
        </div>
      </div>

      <div className="container-custom py-10 space-y-12">

        {/* Main integration sections */}
        {APP_SECTIONS.map((section) => (
          <section key={section.id}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{section.icon}</span>
              <h2 className="text-lg font-black text-gray-800">{section.title}</h2>
              <div className="flex-1 h-px bg-gray-200 ml-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.apps.map((app) => (
                <AppCardComponent key={app.name} app={app} />
              ))}
            </div>
          </section>
        ))}

        {/* API & Developer section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🛠️</span>
            <h2 className="text-lg font-black text-gray-800">API & Developer</h2>
            <div className="flex-1 h-px bg-gray-200 ml-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DEV_CARDS.map((card) => (
              <DevCardComponent key={card.name} card={card} />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div
          className="rounded-2xl p-8 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        >
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-xl font-black mb-2">Đề xuất tích hợp mới?</h3>
          <p className="text-slate-400 text-sm mb-5">
            Hãy cho chúng tôi biết bạn cần tích hợp gì để chúng tôi ưu tiên phát triển.
          </p>
          <a
            href="mailto:support@avab.io?subject=Đề xuất tích hợp App Center"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
          >
            📩 Gửi đề xuất
          </a>
        </div>

      </div>
    </div>
  )
}
