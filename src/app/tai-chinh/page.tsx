'use client'

import { TrendingUp, Target, PiggyBank, Users, BookOpen } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// Dữ liệu thực tế 3 năm học kinh doanh
const yearlyData = [
  {
    year: { vi: 'Năm học 1', en: 'Year 1' },
    period: '2024 – 2025',
    interested: '468+',
    students: '135',
    revenue: '200+ triệu',
    highlight: { vi: 'Ra mắt sản phẩm, chứng minh thị trường', en: 'Product launch, market validation' },
    color: 'from-cherry-400 to-cherry-600',
  },
  {
    year: { vi: 'Năm học 2', en: 'Year 2' },
    period: '2025 – 2026',
    interested: '590+',
    students: '330',
    revenue: '490+ triệu',
    highlight: { vi: 'Bứt phá — tăng trưởng 2.4x học viên, 2.4x doanh thu', en: 'Breakout — 2.4x students, 2.4x revenue growth' },
    color: 'from-teal-400 to-teal-600',
  },
  {
    year: { vi: 'Năm học 3', en: 'Year 3' },
    period: '2026 – 2027',
    interested: '450+',
    students: '250+',
    revenue: '370+ triệu',
    highlight: { vi: 'Đang triển khai — số liệu cập nhật đến thời điểm hiện tại', en: 'In progress — figures current as of now' },
    color: 'from-orange-400 to-orange-600',
  },
]

const expansionPlan = [
  {
    phase: { vi: 'Hiện tại', en: 'Current' },
    year: '2022–2024',
    scope: { vi: 'Toán Tư Duy — Lớp 1', en: 'Math Thinking — Grade 1' },
    detail: { vi: 'Khoá học luyện thi học bổng vào lớp 1 các trường chất lượng cao tại Hà Nội. Đã phục vụ 100+ học viên.', en: 'Scholarship exam-prep course for Grade 1 entry at top Hanoi schools. Served 100+ students.' },
    status: 'active',
    icon: '✅',
  },
  {
    phase: { vi: 'Giai đoạn 2', en: 'Phase 2' },
    year: '2025–2027',
    scope: { vi: 'Toán Tư Duy — Lớp 1 đến 5', en: 'Math Thinking — Grades 1–5' },
    detail: { vi: 'Mở rộng chương trình lên bậc tiểu học, bao phủ toàn bộ chặng đường học toán tư duy từ trước lớp 1 đến hết lớp 5.', en: 'Expand curriculum to primary school, covering the full Math Thinking journey from pre-Grade 1 through Grade 5.' },
    status: 'planned',
    icon: '🔵',
  },
  {
    phase: { vi: 'Giai đoạn 3', en: 'Phase 3' },
    year: '2028–2035',
    scope: { vi: 'Toán Tư Duy — Lớp 1 đến 9', en: 'Math Thinking — Grades 1–9' },
    detail: { vi: 'Phủ sóng toàn bộ cấp Tiểu học và THCS. Thêm môn Tiếng Anh tư duy và Lập trình dành cho học sinh.', en: 'Cover all of primary and middle school. Add English Thinking and Coding subjects for students.' },
    status: 'planned',
    icon: '🔵',
  },
  {
    phase: { vi: 'Tầm nhìn 2035', en: 'Vision 2035' },
    year: '2035',
    scope: { vi: 'Đa môn — Lớp 1–9 + Tiếng Anh + Lập trình', en: 'Multi-subject — Grades 1–9 + English + Coding' },
    detail: { vi: 'Mục tiêu doanh thu 15 tỷ VND/năm. Nền tảng EdTech toàn diện cho học sinh Việt Nam từ mầm non đến THCS.', en: 'Target revenue 15B VND/year. Comprehensive EdTech platform for Vietnamese students from kindergarten through middle school.' },
    status: 'vision',
    icon: '🎯',
  },
]

const allocations = [
  { label: { vi: 'Giáo viên & Nội dung chuyên môn', en: 'Teachers & Subject Content' }, pct: 40, color: 'bg-cherry-600', desc: { vi: 'Đội ngũ giảng viên cộng tác, phát triển 25 chuyên đề', en: 'Collaborative faculty, developing 25 topics' } },
  { label: { vi: 'Marketing & Phát triển cộng đồng', en: 'Marketing & Community' }, pct: 30, color: 'bg-teal-500', desc: { vi: 'Mạng xã hội, nhóm phụ huynh, word-of-mouth', en: 'Social media, parent groups, word-of-mouth' } },
  { label: { vi: 'Công nghệ & Nền tảng số', en: 'Technology & Digital Platform' }, pct: 20, color: 'bg-blue-500', desc: { vi: 'Website, hệ thống chấm bài, AI tích hợp', en: 'Website, grading system, integrated AI' } },
  { label: { vi: 'Vận hành & Hỗ trợ khách hàng', en: 'Operations & Customer Support' }, pct: 10, color: 'bg-gray-400', desc: { vi: 'Chăm sóc học viên, điều phối lịch kèm online', en: 'Student care, online tutoring schedule coordination' } },
]

const t = {
  vi: {
    heroTitle: 'Tài Chính Thực Tế',
    heroSub: 'AvaB xây dựng trên nền tảng kinh doanh thực chất — 3 năm phục vụ học viên liên tục, tăng trưởng bền vững từ miệng phụ huynh sang phụ huynh.',
    pricingLabel: 'Bảng giá',
    pricingTitle: 'Một mức giá duy nhất — Trọn gói',
    pricingSub: 'Không phí ẩn, không giao động — rõ ràng và minh bạch',
    priceUnit: 'VND / năm / học sinh',
    pricingFeatures: [
      '25 chuyên đề Toán Tư Duy đầy đủ',
      '10 buổi dạy online theo nhóm (tối đa 15 học sinh)',
      'AI phân tích lộ trình cá nhân',
      'Chấm bài tự động 24/7',
      'Bảng xếp hạng động lực',
      'Truy cập trọn đời khoá học',
    ],
    registerBtn: 'Đăng ký ngay →',
    commissionNote: 'Đại lý phụ huynh hưởng hoa hồng 15–20% mỗi khoá giới thiệu thành công',
    metricsTitle: '📊 Chỉ số thực tế hàng năm',
    metrics: [
      { value: '590+', label: 'Thành viên tham gia', sub: 'năm đỉnh nhất (2025-2026)', icon: '👨‍👩‍👧', color: 'from-cherry-500 to-cherry-700' },
      { value: '330', label: 'Học viên mua khoá', sub: 'năm 2025-2026', icon: '🎓', color: 'from-teal-500 to-teal-700' },
      { value: '490+ M', label: 'Doanh thu', sub: 'năm 2025-2026', icon: '💰', color: 'from-orange-500 to-orange-700' },
    ],
    yearlyTitle: '📈 Kết quả 3 năm kinh doanh thực tế',
    yearlySub: 'AvaB bắt đầu hoạt động thương mại từ năm 2022 và tăng trưởng đều đặn qua mỗi năm.',
    yearlyMembersLabel: 'thành viên tham gia',
    yearlyStudentsLabel: 'mua khoá học',
    yearlyNote: '💡 Điểm mạnh: AvaB tăng trưởng chủ yếu qua word-of-mouth — phụ huynh có con học thành công giới thiệu cho phụ huynh khác, chứng minh chất lượng sản phẩm đủ mạnh để tự lan tỏa.',
    yearlyStrong: 'Điểm mạnh:',
    allocTitle: '💸 Phân bổ chi phí vận hành',
    visionTitle: 'Tầm nhìn 2035 — Doanh thu 15 tỷ VND',
    visionSub: 'Từ 1 khoá học Toán Tư Duy lớp 1, AvaB có lộ trình rõ ràng mở rộng thành nền tảng EdTech toàn diện.',
    visionRevenueLabel: 'Mục tiêu doanh thu năm 2035',
    visionTags: ['Toán Tư Duy Lớp 1–9', 'Tiếng Anh Tư Duy', 'Lập Trình Cho Trẻ', '500K+ Học Viên'],
    credTitle: 'Tính minh bạch & Xác thực',
    credDesc: 'Tất cả số liệu hoạt động của AvaB được trình bày tại cuộc thi SV_STARTUP-2024 và được Ban giám khảo cấp thành phố Hà Nội đánh giá. Dự án đã vận hành thực tế 3 năm với khách hàng thực, doanh thu thực — không phải mô phỏng hay ước tính lý thuyết. Liên hệ',
  },
  en: {
    heroTitle: 'Real Financials',
    heroSub: 'AvaB is built on a solid business foundation — 3 consecutive years serving students, growing sustainably through parent word-of-mouth.',
    pricingLabel: 'Pricing',
    pricingTitle: 'One price, everything included',
    pricingSub: 'No hidden fees, no surprises — clear and transparent',
    priceUnit: 'VND / year / student',
    pricingFeatures: [
      '25 complete Math Thinking topics',
      '10 included group online sessions (max 15 students)',
      'AI personalised learning path analysis',
      'Automated grading 24/7',
      'Motivational leaderboard',
      'Lifetime course access',
    ],
    registerBtn: 'Register now →',
    commissionNote: 'Parent agents earn 15–20% commission per successful referral',
    metricsTitle: '📊 Annual Key Metrics',
    metrics: [
      { value: '590+', label: 'Members enrolled', sub: 'peak year (2025-2026)', icon: '👨‍👩‍👧', color: 'from-cherry-500 to-cherry-700' },
      { value: '330', label: 'Students purchased', sub: 'year 2025-2026', icon: '🎓', color: 'from-teal-500 to-teal-700' },
      { value: '490+ M', label: 'Revenue', sub: 'year 2025-2026', icon: '💰', color: 'from-orange-500 to-orange-700' },
    ],
    yearlyTitle: '📈 3-Year Actual Business Results',
    yearlySub: 'AvaB began commercial operations in 2022 and has grown steadily year over year.',
    yearlyMembersLabel: 'members enrolled',
    yearlyStudentsLabel: 'purchased a course',
    yearlyNote: '💡 Key strength: AvaB grows primarily through word-of-mouth — parents whose children succeed refer other parents, proving product quality strong enough to spread on its own.',
    yearlyStrong: 'Key strength:',
    allocTitle: '💸 Operating Cost Allocation',
    visionTitle: 'Vision 2035 — 15B VND Revenue',
    visionSub: 'From 1 Grade 1 Math Thinking course, AvaB has a clear roadmap to expand into a comprehensive EdTech platform.',
    visionRevenueLabel: '2035 revenue target',
    visionTags: ['Math Thinking Grades 1–9', 'English Thinking', 'Coding for Kids', '500K+ Students'],
    credTitle: 'Transparency & Verification',
    credDesc: 'All AvaB operational figures were presented at the SV_STARTUP-2024 competition and reviewed by Hanoi City judges. The project has operated commercially for 3 years with real customers and real revenue — not simulations or theoretical estimates. Contact',
  },
}

export default function TaiChinhPage() {
  const { lang } = useLang()
  const { data: session } = useSession()
  const ui = t[lang]

  return (
    <div className="min-h-screen pt-20">
      <div className="gradient-hero text-white py-16">
        <div className="container-custom text-center">
          <PiggyBank className="mx-auto mb-4" size={48} />
          <h1 className="text-2xl md:text-4xl font-black mb-4">{ui.heroTitle}</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            {ui.heroSub}
          </p>
        </div>
      </div>

      <div className="container-custom py-16 space-y-16">

        {/* Pricing — prominent */}
        <section className="bg-gradient-to-br from-cherry-600 to-cherry-800 rounded-4xl p-8 md:p-10 text-white text-center">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-2">{ui.pricingLabel}</p>
          <h2 className="text-2xl md:text-3xl font-black mb-2">{ui.pricingTitle}</h2>
          <p className="text-white/70 mb-6">{ui.pricingSub}</p>

          <div className="inline-block bg-white rounded-4xl px-10 py-8 shadow-2xl">
            <div className="text-5xl md:text-6xl font-black text-cherry-700 mb-1">1,5 triệu</div>
            <div className="text-gray-500 font-semibold mb-4">{ui.priceUnit}</div>
            <ul className="text-left space-y-2 mb-6">
              {ui.pricingFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-teal-500 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            {session?.user ? (
              <Link href="/khoa-hoc"
                className="block w-full bg-cherry-600 hover:bg-cherry-700 text-white font-extrabold py-3 rounded-2xl transition-all hover:scale-105 text-center">
                {lang === 'vi' ? 'Bắt đầu khám phá khoá học →' : 'Explore Courses →'}
              </Link>
            ) : (
              <a href="/dang-ky"
                className="block w-full bg-cherry-600 hover:bg-cherry-700 text-white font-extrabold py-3 rounded-2xl transition-all hover:scale-105 text-center">
                {ui.registerBtn}
              </a>
            )}
          </div>

          <p className="mt-5 text-white/50 text-xs">
            {ui.commissionNote}
          </p>
        </section>

        {/* Key metrics */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 text-center">
            {ui.metricsTitle}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {ui.metrics.map((m) => (
              <div key={m.label} className={`rounded-4xl bg-gradient-to-br ${m.color} p-7 text-white text-center`}>
                <div className="text-5xl mb-3">{m.icon}</div>
                <div className="text-4xl font-black mb-1">{m.value}</div>
                <div className="font-bold text-white/90 mb-1">{m.label}</div>
                <div className="text-white/60 text-sm">{m.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3-year actual data */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {ui.yearlyTitle}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {ui.yearlySub}
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {yearlyData.map((y) => (
              <div key={y.year.vi} className={`rounded-4xl bg-gradient-to-br ${y.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black">{y.year[lang]}</span>
                  <span className="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">{y.period}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-white/70" />
                    <span className="text-sm"><strong>{y.interested}</strong> {ui.yearlyMembersLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-white/70" />
                    <span className="text-sm"><strong>{y.students}</strong> {ui.yearlyStudentsLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 font-bold text-xs">VND</span>
                    <span className="text-sm font-black text-yellow-200">{y.revenue}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/70 italic">
                  {y.highlight[lang]}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-cherry-50 border border-cherry-200 rounded-2xl p-4 text-sm text-cherry-800">
            💡 <strong>{ui.yearlyStrong}</strong> {ui.yearlyNote.replace(/^💡 .*?:? /, '')}
          </div>
        </section>

        {/* Financial allocation */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">{ui.allocTitle}</h2>
          <div className="space-y-4">
            {allocations.map((a) => (
              <div key={a.label.vi} className="flex items-center gap-4">
                <div className="w-44 text-sm font-medium text-gray-700 shrink-0">{a.label[lang]}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
                  <div className={`h-full ${a.color} rounded-full flex items-center pl-3`} style={{ width: `${a.pct}%` }}>
                    <span className="text-white text-xs font-bold">{a.pct}%</span>
                  </div>
                </div>
                <div className="w-48 text-xs text-gray-500 shrink-0 hidden md:block">{a.desc[lang]}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 2035 Vision */}
        <section className="bg-gradient-to-br from-gray-900 to-cherry-900 rounded-4xl p-8 md:p-12 text-white">
          <div className="text-center mb-10">
            <Target className="mx-auto mb-3 text-yellow-400" size={40} />
            <h2 className="text-2xl md:text-3xl font-black mb-2">
              {ui.visionTitle}
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-sm">
              {ui.visionSub}
            </p>
          </div>

          <div className="space-y-4">
            {expansionPlan.map((p) => (
              <div
                key={p.phase.vi}
                className={`rounded-3xl p-5 ${
                  p.status === 'active'
                    ? 'bg-teal-500/20 border-2 border-teal-400/50'
                    : p.status === 'vision'
                    ? 'bg-yellow-500/20 border-2 border-yellow-400/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl shrink-0 mt-0.5">{p.icon}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-black text-white">{p.phase[lang]}</span>
                      <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">{p.year}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'active' ? 'bg-teal-400/30 text-teal-300' :
                        p.status === 'vision' ? 'bg-yellow-400/30 text-yellow-300' :
                        'bg-white/10 text-white/50'
                      }`}>{p.scope[lang]}</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{p.detail[lang]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center bg-white/10 rounded-3xl p-6">
            <div className="text-5xl font-black text-yellow-400 mb-1">15 tỷ VND</div>
            <div className="text-white/70">{ui.visionRevenueLabel}</div>
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
              {ui.visionTags.map((tag) => (
                <span key={tag} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-white/80">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Credibility note */}
        <section className="border-2 border-dashed border-cherry-200 rounded-4xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl shrink-0">📋</div>
            <div>
              <h3 className="font-black text-gray-900 mb-2">{ui.credTitle}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {ui.credDesc} <strong>SV_STARTUP-2024</strong>
                {lang === 'vi' ? ' và được Ban giám khảo cấp thành phố Hà Nội đánh giá. Dự án đã vận hành thực tế 3 năm với khách hàng thực, doanh thu thực — không phải mô phỏng hay ước tính lý thuyết.' : ' and reviewed by Hanoi City judges. The project has operated commercially for 3 years with real customers and real revenue — not simulations or theoretical estimates.'}
                {' '}{lang === 'vi' ? 'Liên hệ' : 'Contact'} <strong className="text-cherry-600">dobaonam8386@gmail.com</strong> {lang === 'vi' ? 'để biết thêm thông tin.' : 'for more information.'}
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
