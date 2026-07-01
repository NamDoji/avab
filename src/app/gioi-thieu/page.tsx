'use client'

import { Award, TrendingUp, Heart, ExternalLink, Users, Star } from 'lucide-react'
import Image from 'next/image'
import { useLang } from '@/contexts/LanguageContext'

// Đội ngũ hiện tại 2025 (từ PitchDeck ver1.0)
const team = [
  {
    name: 'Đỗ Bảo Nam',
    role: 'Trưởng nhóm & CEO',
    roleEn: 'Team Lead & CEO',
    emoji: '👨‍💼',
    class: 'Lớp 10G0',
    highlight: 'Khởi xướng ý tưởng AvaB, dẫn dắt nhóm từ cuoc thi đến sản phẩm thương mại thực sự',
    highlightEn: 'Initiated the AvaB idea, led the team from competition to a real commercial product',
    contact: 'dobaonam8386@gmail.com',
  },
  {
    name: 'Nguyễn Hoàng Gia Minh',
    role: 'Thành viên — Chiến lược',
    roleEn: 'Member — Strategy',
    emoji: '📊',
    class: 'Lớp 10G0',
    highlight: 'Xây dựng mô hình kinh doanh và phân tích thị trường EdTech Việt Nam',
    highlightEn: 'Built the business model and analysed the Vietnamese EdTech market',
  },
  {
    name: 'Nguyễn Khánh Linh',
    role: 'Thành viên — Nội dung',
    roleEn: 'Member — Content',
    emoji: '📚',
    class: 'Lớp 10G0',
    highlight: 'Phát triển chương trình học và nội dung Toán Tư Duy cho trẻ 5–6 tuổi',
    highlightEn: 'Developed the curriculum and Math Thinking content for children aged 5–6',
  },
  {
    name: 'Phan Minh Minh',
    role: 'Thành viên — Công nghệ',
    roleEn: 'Member — Technology',
    emoji: '💻',
    class: 'Lớp 10G0',
    highlight: 'Xây dựng nền tảng kỹ thuật, tích hợp AI và Adaptive Learning',
    highlightEn: 'Built the technical platform, integrated AI and Adaptive Learning',
  },
  {
    name: 'Lê Minh Quý',
    role: 'Thành viên — Marketing',
    roleEn: 'Member — Marketing',
    emoji: '📣',
    class: 'Lớp 10G0',
    highlight: 'Xây dựng cộng đồng 500+ phụ huynh, triển khai go-to-market',
    highlightEn: 'Built a community of 500+ parents, executed the go-to-market strategy',
  },
]

const milestones = [
  {
    period: 'Tháng 9/2024',
    periodEn: 'September 2024',
    title: 'Ý tưởng ra đời',
    titleEn: 'The idea was born',
    desc: '5 học sinh lớp 10G0 trường THCS-THPT Newton nhận thấy khoảng trống thị trường: thiếu nền tảng học tập cá nhân hoá AI cho học sinh Việt Nam. AvaB được hình thành.',
    descEn: '5 students from class 10G0 at Newton School identified a market gap: the lack of AI-personalised learning for Vietnamese students. AvaB was conceived.',
    icon: '💡',
    color: 'border-yellow-300 bg-yellow-50',
  },
  {
    period: 'Tháng 12/2024',
    periodEn: 'December 2024',
    title: 'Tham dự SV_STARTUP-2024',
    titleEn: 'Competed in SV_STARTUP-2024',
    desc: 'AvaB đại diện cho trường Newton tham dự cuộc thi "Học sinh, sinh viên với Ý tưởng Khởi nghiệp" lần thứ VII — SV_STARTUP-2024 tại Hà Nội.',
    descEn: 'AvaB represented Newton School at the 7th "Students with Startup Ideas" competition — SV_STARTUP-2024 in Hanoi.',
    icon: '🏟️',
    color: 'border-blue-300 bg-blue-50',
  },
  {
    period: 'Cuối 2024',
    periodEn: 'Late 2024',
    title: 'Giải Ba Thành phố Hà Nội',
    titleEn: '3rd Place – Hanoi City',
    desc: 'Đạt Giải Nhất vòng Trường → Giải Nhì cụm Nam–Bắc Từ Liêm → Giải Ba Thành phố Hà Nội. Đây là giải thưởng khởi nghiệp cấp cao nhất mà một nhóm học sinh THCS có thể đạt được.',
    descEn: '1st Place (School round) → 2nd Place (Nam–Bắc Từ Liêm cluster) → 3rd Place (Hanoi City). The highest startup award a junior-high team can win.',
    icon: '🏆',
    color: 'border-purple-300 bg-purple-50',
  },
  {
    period: '2024 – nay',
    periodEn: '2024 – present',
    title: 'Hiện thực hoá thành sản phẩm',
    titleEn: 'Turned into a real product',
    desc: 'Từ ý tưởng thi, nhóm biến AvaB thành sản phẩm thương mại thực sự — website avab.vn hoạt động, bán khoá học, phục vụ 100+ học viên và 500+ phụ huynh quan tâm mỗi năm.',
    descEn: 'From a competition idea, the team turned AvaB into a real commercial product — avab.vn live, selling courses, serving 100+ students and 500+ interested parents per year.',
    icon: '🚀',
    color: 'border-teal-300 bg-teal-50',
  },
  {
    period: '2026+',
    periodEn: '2026+',
    title: 'Mở rộng & Quốc tế hoá',
    titleEn: 'Scale & Internationalise',
    desc: 'Lộ trình mở rộng sang AI cá nhân hoá toàn diện, thêm môn học Tiếng Anh, Lập trình; triển khai app Android/iOS; hướng tới 2K users đến 2026 và 15 tỷ doanh thu đến 2035.',
    descEn: 'Roadmap to full AI personalisation, adding English and Coding subjects; launching Android/iOS app; targeting 2K users by 2026 and 15B VND revenue by 2035.',
    icon: '🌏',
    color: 'border-orange-300 bg-orange-50',
  },
]

const partners = [
  {
    name: 'ITSOL',
    role: 'Đối tác Công nghệ & EdTech',
    roleEn: 'Technology & EdTech Partner',
    desc: 'Hỗ trợ hạ tầng kỹ thuật, vận hành nền tảng',
    descEn: 'Provides technical infrastructure and platform operations',
  },
  {
    name: 'Techainer',
    role: 'Đối tác AI',
    roleEn: 'AI Partner',
    desc: 'Tư vấn và triển khai giải pháp AI, Machine Learning',
    descEn: 'Advises and implements AI / Machine Learning solutions',
  },
  {
    name: 'Newton School',
    role: 'Đối tác Nội dung',
    roleEn: 'Content Partner',
    desc: 'Tập thể giáo viên THCS-THPT Newton đồng hành phát triển học liệu',
    descEn: 'Newton School faculty collaborates to develop learning materials',
  },
]

const whyDiff = [
  { icon: '🧠', title: 'AI Cá Nhân Hoá', titleEn: 'Personalised AI', desc: 'Adaptive Learning + Gamification — mỗi học sinh có lộ trình riêng, không phải học theo số đông', descEn: 'Adaptive Learning + Gamification — every student gets their own path, not a one-size-fits-all approach' },
  { icon: '✅', title: 'Sản phẩm thật', titleEn: 'Real product', desc: 'avab.vn hoạt động, bán khoá học thật, phục vụ 100+ học viên — không phải prototype trường học', descEn: 'avab.vn is live, selling real courses, serving 100+ students — not a school prototype' },
  { icon: '💰', title: 'Doanh thu thật', titleEn: 'Real revenue', desc: '1,5 triệu/năm, tầm nhìn 15 tỷ doanh thu năm 2035', descEn: '1.5M VND/year, vision of 15B VND revenue by 2035' },
  { icon: '🤝', title: 'Đối tác chiến lược', titleEn: 'Strategic partners', desc: 'ITSOL (Tech), Techainer (AI), tập thể giáo viên Newton — bảo chứng chất lượng từ chuyên gia', descEn: 'ITSOL (Tech), Techainer (AI), Newton faculty — quality backed by industry experts' },
  { icon: '📈', title: 'Thị trường lớn', titleEn: 'Large market', desc: '3 tỷ USD EdTech VN 2023, 20% CAGR, 23 triệu học sinh — cơ hội khổng lồ chưa được khai thác đúng', descEn: '$3B EdTech VN 2023, 20% CAGR, 23M students — a huge opportunity yet to be properly tapped' },
  { icon: '🌟', title: 'Giải thưởng quốc gia', titleEn: 'National award', desc: 'Top 3 cuộc thi khởi nghiệp cấp Hà Nội SV_STARTUP-2024 dành cho học sinh toàn thành phố', descEn: 'Top 3 at Hanoi-level startup competition SV_STARTUP-2024, open to all students in the city' },
]

const visionGoals = [
  { vi: '🎯 2035: Doanh thu 15 tỷ', en: '🎯 2035: 15B VND Revenue' },
  { vi: '📈 2027: Doanh thu 1.5 tỷ VND', en: '📈 2027: Revenue 1.5B VND' },
  { vi: '🌏 2035: Top 10 Edtech VN', en: '🌏 2035: Top 10 Edtech VN' },
]

const t = {
  vi: {
    badge: 'SV_STARTUP-2024 · Giải Ba Thành phố Hà Nội',
    h1line1: 'Năm học sinh lớp 10',
    h1highlight: 'xây dựng startup thật',
    heroPara: 'AvaB ra đời từ một câu hỏi đơn giản: "Tại sao việc học của học sinh Việt Nam vẫn chưa được cá nhân hoá như mỗi người xứng đáng được nhận?" — và từ đó, nhóm TenGo đã xây dựng câu trả lời của mình.',
    photoCaptions: [
      'Slide giới thiệu nhóm TenGo tại SV_STARTUP-2024',
      'Nhóm làm việc thực tế với laptop tại trường Newton',
      'TenGo chờ thi thuyết trình — cờ quốc tế tại hội trường',
    ],
    storyLabel: 'Our Story',
    storyH2: 'Từ lớp học đến thị trường',
    storyP1: <>Mùa thu năm 2024, năm học sinh lớp 10G0 trường THCS-THPT Newton — <strong className="text-purple-700"> Đỗ Bảo Nam, Nguyễn Hoàng Gia Minh, Nguyễn Khánh Linh, Phan Minh Minh và Lê Minh Quý</strong> — đã ngồi lại với nhau không phải để làm bài tập về nhà, mà để đặt câu hỏi lớn hơn.</>,
    storyP2: <>Là những học sinh giỏi, cả nhóm đều nhận ra một thực tế: giáo dục Việt Nam đang bùng nổ về số lượng nền tảng học trực tuyến, nhưng <strong>không ai thực sự cá nhân hoá</strong> trải nghiệm học — mỗi học sinh vẫn đang nhận cùng một nội dung, dù nhu cầu, tốc độ học và phong cách tư duy của các em hoàn toàn khác nhau.</>,
    storyP3: <>Từ insight đó, <strong className="text-teal-700">AvaB</strong> được hình thành — nền tảng EdTech kết hợp AI, Adaptive Learning và Gamification, với sản phẩm đầu tiên là khoá học Toán Tư Duy luyện thi học bổng vào lớp 1 dành cho trẻ 5–6 tuổi.</>,
    storyP4: <>Nhóm tham dự <strong>SV_STARTUP-2024</strong> — cuộc thi "Học sinh, sinh viên với Ý tưởng Khởi nghiệp" lần VII tại Hà Nội. Kết quả: <span className="text-yellow-600 font-bold"> Giải Nhất vòng Trường → Giải Nhì cụm Nam–Bắc Từ Liêm → Giải Ba Thành phố Hà Nội</span>. Nhưng quan trọng hơn giải thưởng — <strong> nhóm đã không dừng lại ở cuộc thi</strong>.</>,
    storyQuote: '💬 "Chúng tôi không tham gia để thắng. Chúng tôi tham gia để kiểm chứng — và sau khi thắng, chúng tôi đã chứng minh bằng hành động: xây dựng sản phẩm thật, phục vụ khách hàng thật, tạo ra doanh thu thật." — Đỗ Bảo Nam, CEO',
    storyP5: <>AvaB giờ đây là một doanh nghiệp khởi nghiệp thực sự: website <strong>avab.vn</strong> hoạt động, hơn <strong>500 phụ huynh</strong> quan tâm mỗi năm, <strong>100+ học viên</strong> đã mua khoá học, được bảo trợ bởi <strong>ITSOL</strong> (công nghệ), <strong>Techainer</strong> (AI) và tập thể giáo viên trường Newton (nội dung).</>,
    journeyLabel: 'Hành trình',
    journeyH2: 'Từ ý tưởng đến thực tiễn',
    teamLabel: 'Our Team',
    teamH2: 'Đội ngũ TenGo',
    teamSub: 'Trường THCS-THPT Newton, Hà Nội · Cố vấn: BGH trường Newton',
    whyH2: 'Tại sao AvaB khác biệt?',
    whySub: 'Không chỉ là dự án trường — đây là doanh nghiệp thực, được thị trường kiểm chứng',
    partnersH2: 'Đối tác & Bảo trợ',
    visionH2: 'Tầm nhìn 2035',
    visionPara: 'AvaB đặt mục tiêu trở thành Top 10 Edtech Việt Nam vào năm 2035 — nơi mọi học sinh đều được tiếp cận AI cá nhân hoá, từ luyện thi học bổng lớp 1 đến chuẩn bị thi đại học, với chi phí hợp lý và trải nghiệm học tập đỉnh cao.',
    visionBold: 'Top 10 Edtech Việt Nam vào năm 2035',
  },
  en: {
    badge: 'SV_STARTUP-2024 · 3rd Place Hanoi City',
    h1line1: 'Five 10th-grade students',
    h1highlight: 'building a real startup',
    heroPara: 'AvaB was born from a simple question: "Why hasn\'t learning for Vietnamese students been personalised the way every child deserves?" — and from that, Team TenGo built their answer.',
    photoCaptions: [
      'Team TenGo\'s intro slide at SV_STARTUP-2024',
      'The team working on laptops at Newton School',
      'TenGo waiting for their presentation round — international flags in the hall',
    ],
    storyLabel: 'Our Story',
    storyH2: 'From classroom to market',
    storyP1: <>In autumn 2024, five students from class 10G0 at Newton School — <strong className="text-purple-700"> Đỗ Bảo Nam, Nguyễn Hoàng Gia Minh, Nguyễn Khánh Linh, Phan Minh Minh, and Lê Minh Quý</strong> — sat together not to do homework, but to ask bigger questions.</>,
    storyP2: <>As high-achieving students, the team all noticed a reality: Vietnamese education was exploding with online learning platforms, yet <strong>no one was truly personalising</strong> the experience — every student still received the same content, despite having completely different needs, learning speeds, and thinking styles.</>,
    storyP3: <>From that insight, <strong className="text-teal-700">AvaB</strong> was formed — an EdTech platform combining AI, Adaptive Learning, and Gamification, with its first product being a Math Thinking course for scholarship entrance exams to Grade 1, designed for children aged 5–6.</>,
    storyP4: <>The team entered <strong>SV_STARTUP-2024</strong> — the 7th "Students with Startup Ideas" competition in Hanoi. Result: <span className="text-yellow-600 font-bold"> 1st Place (School round) → 2nd Place (Nam–Bắc Từ Liêm cluster) → 3rd Place (Hanoi City)</span>. But more important than the award — <strong> the team didn't stop at the competition</strong>.</>,
    storyQuote: '💬 "We didn\'t enter to win. We entered to validate — and after winning, we proved it through action: building a real product, serving real customers, generating real revenue." — Đỗ Bảo Nam, CEO',
    storyP5: <>AvaB is now a real startup: <strong>avab.vn</strong> is live, <strong>500+ parents</strong> interested per year, <strong>100+ students</strong> have purchased courses, supported by <strong>ITSOL</strong> (tech), <strong>Techainer</strong> (AI), and the Newton School faculty (content).</>,
    journeyLabel: 'Our Journey',
    journeyH2: 'From idea to reality',
    teamLabel: 'Our Team',
    teamH2: 'Team TenGo',
    teamSub: 'Newton High School, Hanoi · Advisor: Newton School Board',
    whyH2: 'Why AvaB is different?',
    whySub: 'Not just a school project — a real business, validated by the market',
    partnersH2: 'Partners & Sponsors',
    visionH2: 'Vision 2035',
    visionPara: 'AvaB aims to become Top 10 EdTech in Vietnam by 2035 — where every student has access to personalised AI, from Grade 1 scholarship prep to university entrance, at an affordable price with a world-class learning experience.',
    visionBold: 'Top 10 EdTech in Vietnam by 2035',
  },
}

export default function GioiThieuPage() {
  const { lang } = useLang()
  const ui = t[lang]

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="gradient-hero text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {['🎓','💡','🏆','🚀','⭐','📚','💻','🌟'].map((e, i) => (
            <span key={i} className="absolute text-4xl animate-float" style={{
              left: `${8 + i * 12}%`, top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.4}s`
            }}>{e}</span>
          ))}
        </div>
        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-6">
            <Award size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold">{ui.badge}</span>
          </div>
          <h1 className="text-2xl md:text-5xl font-black mb-6 leading-tight">
            {ui.h1line1}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-teal-300">
              {ui.h1highlight}
            </span>
          </h1>
          <p className="text-white/80 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            {ui.heroPara}
          </p>
        </div>
      </div>

      <div className="container-custom py-16 space-y-20">

        {/* Team photos */}
        <section className="grid md:grid-cols-3 gap-4">
          {[
            { src: '/team-slide.jpg' },
            { src: '/team-laptops.jpg' },
            { src: '/team-working.jpg' },
          ].map((photo, i) => (
            <div key={i} className="rounded-3xl overflow-hidden shadow-lg card-hover">
              <div className="relative h-48 bg-gray-100">
                <Image src={photo.src} alt={ui.photoCaptions[i]} fill className="object-cover" />
              </div>
              <div className="bg-white p-3">
                <p className="text-xs text-gray-500 text-center">{ui.photoCaptions[i]}</p>
              </div>
            </div>
          ))}
        </section>

        {/* The Story */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-purple-600 font-bold uppercase text-sm tracking-wider">{ui.storyLabel}</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              {ui.storyH2}
            </h2>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-4xl p-8 md:p-10 border border-purple-100">
            <div className="space-y-5 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>{ui.storyP1}</p>
              <p>{ui.storyP2}</p>
              <p>{ui.storyP3}</p>
              <p>{ui.storyP4}</p>
              <p className="text-purple-800 font-semibold bg-purple-50 rounded-2xl p-4 border-l-4 border-purple-400">
                {ui.storyQuote}
              </p>
              <p>{ui.storyP5}</p>
            </div>
          </div>
        </section>

        {/* Awards highlight */}
        <section className="grid md:grid-cols-3 gap-5">
          {[
            { award: lang === 'vi' ? 'Giải Nhất' : '1st Place', scope: lang === 'vi' ? 'Vòng Trường' : 'School Round', icon: '🥇', color: 'from-yellow-400 to-yellow-600' },
            { award: lang === 'vi' ? 'Giải Nhì' : '2nd Place', scope: lang === 'vi' ? 'Cụm Nam–Bắc Từ Liêm' : 'Nam–Bắc Từ Liêm Cluster', icon: '🥈', color: 'from-gray-400 to-gray-500' },
            { award: lang === 'vi' ? 'Giải Ba' : '3rd Place', scope: lang === 'vi' ? 'Thành phố Hà Nội' : 'Hanoi City', icon: '🥉', color: 'from-orange-400 to-orange-500' },
          ].map((a) => (
            <div key={a.scope} className={`rounded-4xl bg-gradient-to-br ${a.color} p-6 text-white text-center`}>
              <div className="text-5xl mb-3">{a.icon}</div>
              <div className="text-2xl font-black mb-1">{a.award}</div>
              <div className="text-white/80 text-sm font-semibold">{a.scope}</div>
              <div className="text-white/60 text-xs mt-2">SV_STARTUP-2024</div>
            </div>
          ))}
        </section>

        {/* Timeline */}
        <section>
          <div className="text-center mb-10">
            <span className="text-purple-600 font-bold uppercase text-sm tracking-wider">{ui.journeyLabel}</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">{ui.journeyH2}</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className={`rounded-3xl border-2 p-5 ${m.color}`}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0">{m.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-gray-900">{lang === 'vi' ? m.title : m.titleEn}</span>
                      <span className="text-xs text-gray-500 font-medium">{lang === 'vi' ? m.period : m.periodEn}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{lang === 'vi' ? m.desc : m.descEn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <div className="text-center mb-10">
            <span className="text-purple-600 font-bold uppercase text-sm tracking-wider">{ui.teamLabel}</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">
              {ui.teamH2}
            </h2>
            <p className="text-gray-500 mt-2">{ui.teamSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {team.map((member, i) => (
              <div
                key={i}
                className={`bg-white rounded-4xl border-2 p-6 card-hover ${
                  i === 0 ? 'border-purple-300 shadow-lg shadow-purple-100' : 'border-purple-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-3xl ${
                    i === 0 ? 'bg-purple-100' : 'bg-gray-50'
                  }`}>
                    {member.emoji}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 leading-snug">{member.name}</h3>
                    <p className={`text-xs font-bold ${i === 0 ? 'text-purple-600' : 'text-gray-500'}`}>
                      {lang === 'vi' ? member.role : member.roleEn}
                    </p>
                  </div>
                </div>
                <span className="inline-block text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1 mb-3">
                  {member.class} · Newton
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">{lang === 'vi' ? member.highlight : member.highlightEn}</p>
                {member.contact && (
                  <a href={`mailto:${member.contact}`}
                    className="mt-3 flex items-center gap-1 text-purple-500 text-xs hover:text-purple-700">
                    <ExternalLink size={12} /> {member.contact}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* What makes this unique */}
        <section className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-4xl p-8 md:p-12 text-white">
          <div className="text-center mb-10">
            <Star className="mx-auto mb-3 text-yellow-400" size={36} />
            <h2 className="text-2xl md:text-3xl font-black">
              {ui.whyH2}
            </h2>
            <p className="text-white/60 mt-2 text-sm">
              {ui.whySub}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {whyDiff.map((item) => (
              <div key={item.title} className="bg-white/10 rounded-3xl p-4 backdrop-blur-sm">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h4 className="font-bold text-white mb-1">{lang === 'vi' ? item.title : item.titleEn}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{lang === 'vi' ? item.desc : item.descEn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Partners */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">{ui.partnersH2}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {partners.map((p) => (
              <div key={p.name} className="bg-white rounded-3xl border-2 border-gray-100 p-5 text-center card-hover">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-black text-purple-700">
                  {p.name[0]}
                </div>
                <h3 className="font-black text-gray-900 mb-0.5">{p.name}</h3>
                <p className="text-purple-600 text-xs font-semibold mb-2">{lang === 'vi' ? p.role : p.roleEn}</p>
                <p className="text-gray-500 text-sm">{lang === 'vi' ? p.desc : p.descEn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision / Mission */}
        <section className="gradient-hero rounded-4xl p-8 md:p-12 text-white text-center">
          <TrendingUp className="mx-auto mb-4 text-teal-300" size={40} />
          <h2 className="text-2xl md:text-3xl font-black mb-4">{ui.visionH2}</h2>
          <p className="text-white/80 max-w-3xl mx-auto text-lg leading-relaxed mb-6">
            {lang === 'vi' ? (
              <>AvaB đặt mục tiêu trở thành <strong>{ui.visionBold}</strong> — nơi mọi học sinh đều được tiếp cận AI cá nhân hoá, từ luyện thi học bổng lớp 1 đến chuẩn bị thi đại học, với chi phí hợp lý và trải nghiệm học tập đỉnh cao.</>
            ) : (
              <>AvaB aims to become <strong>{ui.visionBold}</strong> — where every student has access to personalised AI, from Grade 1 scholarship prep to university entrance, at an affordable price with a world-class learning experience.</>
            )}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {visionGoals.map((goal) => (
              <span key={goal.vi} className="bg-white/15 border border-white/30 rounded-full px-5 py-2 text-sm font-semibold">
                {lang === 'vi' ? goal.vi : goal.en}
              </span>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
