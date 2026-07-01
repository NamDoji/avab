'use client'

import { BarChart3, TrendingUp, Users, Target, Award } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

const competitors = [
  { name: 'Cleavai', focus: { vi: 'AI học tập', en: 'AI learning' }, avabEdge: { vi: 'AvaB tập trung lứa tuổi mầm non — chưa ai làm tốt', en: 'AvaB focuses on pre-school age — no one does it well yet' } },
  { name: 'Teky', focus: { vi: 'Lập trình', en: 'Coding' }, avabEdge: { vi: 'Hoàn toàn khác phân khúc', en: 'Completely different segment' } },
  { name: 'Hocmai', focus: { vi: 'Luyện thi THPT', en: 'High school exam prep' }, avabEdge: { vi: 'AvaB target nhỏ hơn, ít cạnh tranh hơn', en: 'AvaB targets a smaller, less competitive niche' } },
  { name: 'Vuihoc', focus: { vi: 'Học online phổ thông', en: 'General online learning' }, avabEdge: { vi: 'Không có chuyên môn luyện thi lớp 1', en: 'No expertise in Grade 1 exam prep' } },
  { name: 'Qanda', focus: { vi: 'Q&A tức thì', en: 'Instant Q&A' }, avabEdge: { vi: 'Khác model hoàn toàn', en: 'Completely different model' } },
  { name: 'Azota', focus: { vi: 'Quản lý bài tập', en: 'Homework management' }, avabEdge: { vi: 'Không phải đối thủ trực tiếp', en: 'Not a direct competitor' } },
]

const t = {
  vi: {
    heroTitle: 'Phân Tích Thị Trường',
    heroSub: 'Thị trường EdTech Việt Nam đang bùng nổ — và AvaB đã xác định đúng phân khúc chưa ai khai thác hiệu quả: luyện thi học bổng lớp 1 bằng AI.',
    marketTitle: '🌏 Thị trường EdTech Việt Nam 2023–2024',
    marketMetrics: [
      { value: '3 tỷ USD', label: 'Quy mô thị trường EdTech VN 2023', icon: '💰', desc: 'Đứng thứ 3 về thu hút đầu tư, chỉ sau E-commerce và Fintech', color: 'from-purple-500 to-purple-700' },
      { value: '20%', label: 'Tăng trưởng CAGR hàng năm', icon: '📈', desc: 'EdTech là ngành tăng trưởng nhanh nhất Đông Nam Á sau đại dịch', color: 'from-teal-500 to-teal-700' },
      { value: '23 triệu', label: 'Users dùng app học tập', icon: '📱', desc: 'Người Việt đã quen học online — hành vi thay đổi không đảo ngược', color: 'from-orange-500 to-orange-700' },
      { value: '13 triệu', label: 'Học sinh các cấp', icon: '🎒', desc: 'Cùng 1.4 triệu giáo viên và 30,000 trường học — hệ sinh thái khổng lồ', color: 'from-blue-500 to-blue-700' },
      { value: '30%', label: 'Thu nhập phụ huynh chi cho giáo dục', icon: '👨‍👩‍👧', desc: 'Tỷ lệ cao nhất khu vực — người Việt sẵn sàng đầu tư cho con học', color: 'from-pink-500 to-pink-700' },
      { value: 'Top 3', label: 'Ngành thu hút VC tại Việt Nam', icon: '🏆', desc: 'Nhà đầu tư đang đổ tiền vào EdTech — thời điểm vàng để xây dựng', color: 'from-yellow-500 to-yellow-600' },
    ],
    segmentTitle: 'Phân khúc AvaB nhắm đến — Chưa ai khai thác đúng',
    segmentH3a: '👶 Trẻ 5–6 tuổi luyện thi lớp 1',
    segmentItemsA: [
      'Mỗi năm có ~96,000 trẻ sinh ra tại Hà Nội → sau 5 năm = 96K gia đình cần chuẩn bị',
      'Tỷ lệ thi vào trường chất lượng cao cạnh tranh cao: 1 chọn 10, thậm chí 1 chọn 20',
      'Phụ huynh sẵn sàng chi 500K–2M để con có lợi thế thi đầu vào',
      'Không có nền tảng online nào đủ tốt, đủ chuyên cho lứa tuổi này',
    ],
    segmentH3b: '😤 Pain points chưa được giải quyết',
    segmentItemsB: [
      'Tài liệu rời rạc, không hệ thống, không cá nhân hoá',
      'Trung tâm luyện thi offline: chi phí cao, đi lại bất tiện, lịch cứng nhắc',
      'Ứng dụng học hiện tại không thiết kế cho lứa tuổi 5, UI/UX không phù hợp',
      'Không có cơ chế theo dõi tiến độ real-time cho phụ huynh bận rộn',
    ],
    compTitle: '⚔️ Bức tranh cạnh tranh',
    compDesc: 'AvaB không cạnh tranh trực tiếp với các nền tảng lớn — thay vào đó, nhóm TenGo xác định đúng khoảng trắng thị trường mà tất cả đối thủ đang bỏ qua.',
    compDescStrong: 'khoảng trắng thị trường',
    tableHeaders: ['Tiêu chí', 'Trung tâm offline', 'App học phổ thông', 'AvaB ⭐'],
    tableRows: [
      ['Thiết kế cho trẻ 5 tuổi', '❌', '❌', '✅'],
      ['AI cá nhân hoá lộ trình', '❌', '⚠️ Hạn chế', '✅'],
      ['Chấm bài tự động', '❌', '⚠️', '✅'],
      ['Bảng xếp hạng tạo động lực', '❌', '❌', '✅'],
      ['Theo dõi tiến độ real-time', '⚠️', '⚠️', '✅'],
      ['Học mọi lúc mọi nơi', '❌', '✅', '✅'],
      ['Chi phí hợp lý', '❌', '✅', '✅'],
      ['Nội dung chuyên biệt thi lớp 1', '⚠️', '❌', '✅'],
    ],
    gtmTitle: 'Chiến lược Go-to-Market',
    gtmPhases: [
      { phase: 'Giai đoạn 1', title: 'Chứng minh giá trị', target: '500 users', desc: 'Tập trung phụ huynh Hà Nội qua Facebook group, word-of-mouth và kênh giáo viên Newton. Chứng minh conversion và retention.' },
      { phase: 'Giai đoạn 2', title: 'Mở rộng B2B', target: '2,000 users', desc: 'Ký hợp tác với 5–10 trường tiểu học, trung tâm luyện thi uy tín. Gói 30K/tháng/HS đem lại doanh thu ổn định.' },
      { phase: 'Giai đoạn 3', title: 'AI & Scale', target: '5,000+ users', desc: 'Triển khai app Android/iOS, tích hợp AI sâu hơn (adaptive difficulty), mở rộng sang Tiếng Anh và Lập trình.' },
    ],
  },
  en: {
    heroTitle: 'Market Analysis',
    heroSub: 'The Vietnamese EdTech market is booming — and AvaB has identified the right segment no one has tapped effectively: AI-powered Grade 1 scholarship exam prep.',
    marketTitle: '🌏 Vietnam EdTech Market 2023–2024',
    marketMetrics: [
      { value: '$3B USD', label: 'Vietnam EdTech market size 2023', icon: '💰', desc: '3rd in investment attraction, behind only E-commerce and Fintech', color: 'from-purple-500 to-purple-700' },
      { value: '20%', label: 'Annual CAGR growth', icon: '📈', desc: 'EdTech is the fastest-growing sector in Southeast Asia post-pandemic', color: 'from-teal-500 to-teal-700' },
      { value: '23M', label: 'Learning app users', icon: '📱', desc: 'Vietnamese are now accustomed to online learning — a behaviour shift that won\'t reverse', color: 'from-orange-500 to-orange-700' },
      { value: '13M', label: 'K–12 students', icon: '🎒', desc: 'Plus 1.4M teachers and 30,000 schools — a massive ecosystem', color: 'from-blue-500 to-blue-700' },
      { value: '30%', label: 'of parent income spent on education', icon: '👨‍👩‍👧', desc: 'Highest ratio in the region — Vietnamese families invest heavily in learning', color: 'from-pink-500 to-pink-700' },
      { value: 'Top 3', label: 'VC-attracting sector in Vietnam', icon: '🏆', desc: 'Investors are pouring money into EdTech — the golden time to build', color: 'from-yellow-500 to-yellow-600' },
    ],
    segmentTitle: 'AvaB\'s Target Segment — Untapped by Anyone',
    segmentH3a: '👶 Children aged 5–6 — Grade 1 exam prep',
    segmentItemsA: [
      '~96,000 children are born in Hanoi each year → after 5 years = 96K families needing to prepare',
      'Competition for quality schools is fierce: 1 spot per 10–20 applicants',
      'Parents are willing to spend 500K–2M VND for their child to have an admissions edge',
      'No online platform is good enough or specialised enough for this age group',
    ],
    segmentH3b: '😤 Unresolved pain points',
    segmentItemsB: [
      'Scattered materials — no system, no personalisation',
      'Offline tutoring centres: high cost, inconvenient travel, rigid schedules',
      'Existing learning apps are not designed for 5-year-olds — UI/UX doesn\'t fit',
      'No real-time progress tracking for busy parents',
    ],
    compTitle: '⚔️ Competitive Landscape',
    compDesc: 'AvaB doesn\'t compete head-on with large platforms — instead, Team TenGo has correctly identified the white space in the market that all competitors are ignoring.',
    compDescStrong: 'white space in the market',
    tableHeaders: ['Criterion', 'Offline tutoring', 'General learning apps', 'AvaB ⭐'],
    tableRows: [
      ['Designed for 5-year-olds', '❌', '❌', '✅'],
      ['AI-personalised learning path', '❌', '⚠️ Limited', '✅'],
      ['Automated grading', '❌', '⚠️', '✅'],
      ['Motivational leaderboard', '❌', '❌', '✅'],
      ['Real-time progress tracking', '⚠️', '⚠️', '✅'],
      ['Learn anytime, anywhere', '❌', '✅', '✅'],
      ['Affordable price', '❌', '✅', '✅'],
      ['Content specialised for Grade 1 exam', '⚠️', '❌', '✅'],
    ],
    gtmTitle: 'Go-to-Market Strategy',
    gtmPhases: [
      { phase: 'Phase 1', title: 'Prove value', target: '500 users', desc: 'Focus on Hanoi parents via Facebook groups, word-of-mouth, and Newton teacher channels. Prove conversion and retention.' },
      { phase: 'Phase 2', title: 'B2B expansion', target: '2,000 users', desc: 'Sign partnerships with 5–10 primary schools and reputable tutoring centres. 30K/month/student package brings stable recurring revenue.' },
      { phase: 'Phase 3', title: 'AI & Scale', target: '5,000+ users', desc: 'Launch Android/iOS app, deeper AI integration (adaptive difficulty), expand into English and Coding subjects.' },
    ],
  },
}

export default function ThiTruongPage() {
  const { lang } = useLang()
  const ui = t[lang]

  return (
    <div className="min-h-screen pt-20">
      <div className="gradient-hero text-white py-16">
        <div className="container-custom text-center">
          <BarChart3 className="mx-auto mb-4" size={48} />
          <h1 className="text-2xl md:text-4xl font-black mb-4">{ui.heroTitle}</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            {ui.heroSub}
          </p>
        </div>
      </div>

      <div className="container-custom py-16 space-y-16">

        {/* Key market numbers */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">
            {ui.marketTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ui.marketMetrics.map((m) => (
              <div key={m.label} className={`rounded-4xl bg-gradient-to-br ${m.color} p-6 text-white card-hover`}>
                <div className="text-4xl mb-3">{m.icon}</div>
                <div className="text-3xl font-black mb-1">{m.value}</div>
                <div className="font-bold text-white/90 mb-2 text-sm">{m.label}</div>
                <p className="text-white/70 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target segment */}
        <section className="bg-purple-50 rounded-4xl p-8 md:p-10 border border-purple-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Target size={24} className="text-purple-600" />
            {ui.segmentTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-lg mb-4">{ui.segmentH3a}</h3>
              <ul className="space-y-3">
                {ui.segmentItemsA.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-500 mt-0.5 shrink-0">●</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-lg mb-4">{ui.segmentH3b}</h3>
              <ul className="space-y-3">
                {ui.segmentItemsB.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-500 mt-0.5 shrink-0">⚠</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Competitive landscape */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">{ui.compTitle}</h2>
          <p className="text-gray-500 mb-6">
            {lang === 'vi' ? (
              <>AvaB không cạnh tranh trực tiếp với các nền tảng lớn — thay vào đó, nhóm TenGo xác định đúng <strong>{ui.compDescStrong}</strong> mà tất cả đối thủ đang bỏ qua.</>
            ) : (
              <>AvaB doesn&apos;t compete head-on with large platforms — instead, Team TenGo has correctly identified the <strong>{ui.compDescStrong}</strong> that all competitors are ignoring.</>
            )}
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {competitors.map((c) => (
              <div key={c.name} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="font-black text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-500 mb-2">{c.focus[lang]}</div>
                <div className="text-xs text-teal-600 font-medium flex items-start gap-1">
                  <span>✅</span> {c.avabEdge[lang]}
                </div>
              </div>
            ))}
          </div>

          {/* Positioning table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-purple-600 text-white">
                  {ui.tableHeaders.map((h) => (
                    <th key={h} className={`text-left p-4 ${h === 'AvaB ⭐' ? 'bg-purple-800' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ui.tableRows.map(([criteria, col1, col2, col3], i) => (
                  <tr key={criteria} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 font-medium text-gray-700 text-sm">{criteria}</td>
                    <td className="p-3 text-center text-xl">{col1}</td>
                    <td className="p-3 text-center text-xl">{col2}</td>
                    <td className="p-3 text-center text-xl bg-purple-50 font-bold">{col3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Go-to-market */}
        <section className="bg-gray-900 rounded-4xl p-8 md:p-10 text-white">
          <TrendingUp className="mb-4 text-teal-400" size={32} />
          <h2 className="text-2xl font-black mb-6">{ui.gtmTitle}</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {ui.gtmPhases.map((p) => (
              <div key={p.phase} className="bg-white/10 rounded-3xl p-5">
                <div className="text-xs font-bold text-purple-300 mb-1">{p.phase}</div>
                <div className="font-black text-white text-lg mb-0.5">{p.title}</div>
                <div className="text-teal-300 font-bold text-sm mb-3">🎯 {p.target}</div>
                <p className="text-white/70 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
