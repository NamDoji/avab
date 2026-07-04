import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { YearlyStats } from '@/components/home/YearlyStats'
import { WhyAvab } from '@/components/home/WhyAvab'
import { FeaturedCourses } from '@/components/home/FeaturedCourses'
import { Testimonials } from '@/components/home/Testimonials'
import { CtaSection } from '@/components/home/CtaSection'

export const metadata = {
  title: 'AvaB EOS — Education Operating System',
  description: 'Quản lý toàn bộ trường học bằng AI · ERP · CRM · HRM · Analytics — dành cho mọi mô hình giáo dục Việt Nam.',
}

// ── Server data fetch ─────────────────────────────────────────────────────────

async function getStats() {
  try {
    const [orgs, students, courses] = await Promise.all([
      prisma.organization.count({ where: { isActive: true, deletedAt: null } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
    ])
    return { orgs, students, courses }
  } catch {
    return { orgs: 0, students: 0, courses: 0 }
  }
}

// ── Feature list ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Studio',
    subtitle: 'Giáo án · Bài tập · Đề thi',
    desc: 'Tạo giáo án, bài tập, đề thi bằng AI trong vài giây. Phân tích học lực, gợi ý cải thiện, chatbot hỗ trợ học 24/7.',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
    href: '/admin/ai-studio',
    tags: ['Giáo án AI', 'Đề thi tự động', 'Chatbot học tập'],
  },
  {
    icon: '🏫',
    title: 'School ERP',
    subtitle: 'Học sinh · Lớp học · Thời khóa biểu',
    desc: 'Quản lý học sinh, giáo viên, lớp học, điểm danh, thời khóa biểu — tất cả trên một nền tảng thống nhất.',
    color: '#2563eb',
    bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
    href: '/admin/erp',
    tags: ['Quản lý lớp', 'Điểm danh', 'TKB tự động'],
  },
  {
    icon: '💰',
    title: 'Finance ERP',
    subtitle: 'Học phí · Học bổng · Báo cáo',
    desc: 'Quản lý học phí, học bổng, in hóa đơn, theo dõi thu chi và báo cáo tài chính chuyên nghiệp.',
    color: '#16a34a',
    bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
    href: '/admin/finance',
    tags: ['Học phí', 'Hóa đơn', 'Báo cáo tài chính'],
  },
  {
    icon: '📊',
    title: 'Analytics',
    subtitle: 'Dashboard · KPI · Báo cáo PDF',
    desc: 'Dashboard thông minh cho từng vai trò. Theo dõi KPI, xuất báo cáo PDF, phân tích học lực toàn trường.',
    color: '#d97706',
    bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
    href: '/admin/analytics',
    tags: ['Dashboard', 'KPI', 'Xuất PDF'],
  },
]

const PILLARS = [
  { icon: '🎓', label: 'CRM Tuyển sinh', desc: 'Pipeline leads, follow-up tự động' },
  { icon: '👥', label: 'HRM Nhân sự', desc: 'Giáo viên, lương thưởng, đánh giá' },
  { icon: '💬', label: 'Collaboration', desc: 'Chat, task, họp trực tuyến' },
  { icon: '🎨', label: 'White Label', desc: 'Brand riêng, domain riêng' },
]

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const stats = await getStats()

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          HERO — gradient violet → blue, animated
      ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-20"
        style={{ background: 'linear-gradient(135deg, #3b0764 0%, #7c3aed 40%, #1d4ed8 80%, #0ea5e9 100%)' }}
      >
        {/* Animated blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle,#a78bfa,transparent)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle,#38bdf8,transparent)', animation: 'pulse 3s ease-in-out 1s infinite' }}
        />

        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {['🤖','📊','🏫','💰','👥','🎓','📱','🔔','📋','⭐'].map((icon, i) => (
            <span
              key={i}
              className="absolute text-2xl opacity-10"
              style={{
                left: `${8 + (i * 9) % 84}%`,
                top: `${10 + (i * 13) % 75}%`,
                animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite alternate`,
              }}
            >
              {icon}
            </span>
          ))}
        </div>

        <div className="container-custom relative z-10 py-24">
          <div className="max-w-5xl mx-auto text-center">

            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full text-sm font-bold text-white/90"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            >
              <span>🏆</span>
              <span>Giải Ba Thành phố Hà Nội · Khởi nghiệp sáng tạo TenGo 2024</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              AvaB{' '}
              <span style={{ background: 'linear-gradient(90deg,#fbbf24,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Education
              </span>
              <br />
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white/90">
                Operating System
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Quản lý toàn bộ trường học · AI · ERP · CRM · HRM · Analytics<br className="hidden sm:block" />
              <span className="text-white/60 text-base">Dành cho mọi mô hình giáo dục Việt Nam</span>
            </p>

            {/* Real stats */}
            {(stats.orgs > 0 || stats.students > 0 || stats.courses > 0) && (
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                {[
                  { n: stats.orgs,     label: 'trường',    icon: '🏫' },
                  { n: stats.students, label: 'học sinh',  icon: '🎓' },
                  { n: stats.courses,  label: 'khóa học',  icon: '📚' },
                ].filter(s => s.n > 0).map(s => (
                  <div key={s.label}
                    className="text-center px-6 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                  >
                    <p className="text-3xl font-black text-white">{s.n.toLocaleString('vi-VN')}</p>
                    <p className="text-xs text-white/70 font-semibold mt-0.5">{s.icon} {s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dang-ky-to-chuc"
                className="px-8 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                  color: '#1c1917',
                  boxShadow: '0 8px 32px rgba(251,191,36,0.4)',
                }}
              >
                🚀 Bắt đầu miễn phí 30 ngày
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                🎬 Xem demo
              </a>
            </div>

            {/* No credit card */}
            <p className="text-white/50 text-xs mt-4 font-medium">
              Không cần thẻ tín dụng · Cài đặt trong 5 phút · Hỗ trợ 24/7
            </p>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — 4 pillar cards
      ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-purple-700 bg-purple-100 mb-4">
              ✨ Tính năng cốt lõi
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Một nền tảng. Mọi nhu cầu.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              AvaB EOS tích hợp toàn bộ quy trình vận hành giáo dục vào một hệ thống thống nhất,
              thông minh, dễ sử dụng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <Link
                key={f.title}
                href={f.href}
                className="group block rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ background: f.bg, border: `1.5px solid ${f.color}20` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
                    style={{ background: f.color + '18' }}
                  >
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black mb-0.5" style={{ color: f.color }}>{f.title}</h3>
                    <p className="text-xs font-bold text-gray-500 mb-2">{f.subtitle}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {f.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: f.color + '15', color: f.color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-2xl group-hover:translate-x-1 transition-transform shrink-0">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MORE MODULES — compact pillars
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h3 className="text-xl font-black text-gray-800">Và còn nhiều hơn nữa…</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PILLARS.map(p => (
              <div key={p.label}
                className="rounded-2xl p-5 text-center"
                style={{ background: '#f9fafb', border: '1px solid #f1f5f9' }}
              >
                <span className="text-3xl block mb-2">{p.icon}</span>
                <p className="font-black text-gray-800 text-sm">{p.label}</p>
                <p className="text-xs text-gray-400 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Existing curated sections
      ═══════════════════════════════════════════════════════════════ */}
      <YearlyStats />
      <WhyAvab />
      <FeaturedCourses />
      <Testimonials />

      {/* ═══════════════════════════════════════════════════════════════
          CTA SECTION — final conversion
      ═══════════════════════════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#3b0764 0%,#7c3aed 50%,#1d4ed8 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute top-10 left-10 text-6xl opacity-5">🏆</div>
          <div className="absolute bottom-10 right-10 text-6xl opacity-5">🎓</div>
        </div>
        <div className="container-custom relative text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-yellow-300 bg-yellow-400/20 mb-6">
            🚀 Bắt đầu ngay hôm nay
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Trường bạn xứng đáng với<br />
            <span style={{ background: 'linear-gradient(90deg,#fbbf24,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              công nghệ tốt nhất
            </span>
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Dùng thử miễn phí 30 ngày. Không cần thẻ tín dụng. Hỗ trợ cài đặt tận nơi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dang-ky-to-chuc"
              className="px-10 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                color: '#1c1917',
                boxShadow: '0 8px 32px rgba(251,191,36,0.4)',
              }}
            >
              🎓 Bắt đầu miễn phí 30 ngày
            </Link>
            <Link
              href="/lien-he"
              className="px-10 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(255,255,255,0.3)',
              }}
            >
              💬 Tư vấn miễn phí
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-12px) rotate(5deg); }
        }
      `}</style>
    </>
  )
}
