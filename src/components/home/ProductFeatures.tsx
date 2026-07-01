import Link from 'next/link'

const features = [
  {
    icon: '🤖',
    title: 'AI Cá Nhân Hoá',
    desc: 'Adaptive Learning tự động điều chỉnh lộ trình và độ khó theo năng lực từng học sinh',
    badge: 'Core',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: '🧞',
    title: 'Hỏi Bụt',
    desc: 'Hỏi đáp mọi thắc mắc với AI — nhận giải đáp từ chuyên gia bất kỳ lúc nào',
    badge: 'AI Q&A',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: '✅',
    title: 'Chấm điểm tự động',
    desc: 'Kết quả hiển thị ngay sau khi nộp bài, giáo viên và phụ huynh nhận thông báo tức thì',
    badge: 'Automation',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '🎬',
    title: 'Video ngắn (TikTok style)',
    desc: 'Bài giảng dạng video ngắn bổ ích — học sinh tiếp thu nhanh, không nhàm chán',
    badge: 'Engaging',
    badgeColor: 'bg-pink-100 text-pink-700',
  },
  {
    icon: '🔤',
    title: 'AI Dịch EN-VN & OCR',
    desc: 'Chuyển đổi ảnh thành văn bản, dịch Anh-Việt tự động hỗ trợ học tập đa ngôn ngữ',
    badge: 'AI',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    icon: '👥',
    title: 'Mạng xã hội giáo dục',
    desc: 'Kết nối học sinh — giáo viên — phụ huynh — trường học trong một hệ sinh thái giáo dục',
    badge: 'Community',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    icon: '📊',
    title: 'Dashboard phụ huynh',
    desc: 'Theo dõi tiến trình học, điểm số và thời gian học của con real-time mọi lúc mọi nơi',
    badge: 'Parents',
    badgeColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: '💻',
    title: 'IDE Lập trình (Scratch/Python)',
    desc: 'Lập trình kéo thả Scratch, Python, Java, C++ — tích hợp ngay trên nền tảng',
    badge: 'Roadmap',
    badgeColor: 'bg-gray-100 text-gray-600',
  },
  {
    icon: '🏆',
    title: 'Hệ thống thi thử',
    desc: 'Đề thi thử Toán Tư Duy bám sát cấu trúc đề thi học bổng lớp 1 các trường chất lượng cao',
    badge: 'Exam Prep',
    badgeColor: 'bg-red-100 text-red-700',
  },
]

export function ProductFeatures() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-purple-600 font-bold uppercase text-sm tracking-wider">Tính năng</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-4">
            Nền tảng EdTech{' '}
            <span className="text-gradient">toàn diện nhất</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Không chỉ là website bài tập — AvaB là một hệ sinh thái học tập tích hợp AI, 
            được thiết kế từ góc nhìn của học sinh dành cho học sinh.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-white rounded-3xl border-2 border-gray-100 p-5 card-hover hover:border-purple-200"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
              </div>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${f.badgeColor}`}>
                {f.badge}
              </span>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* KPIs from PPTX */}
        <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '500+', label: 'Phụ huynh quan tâm', icon: '👨‍👩‍👧', sub: 'mỗi năm' },
            { value: '100+', label: 'Học viên mua khoá học', icon: '🎓', sub: 'mỗi năm' },
            { value: '≤15', label: 'Học sinh/nhóm', icon: '👥', sub: 'online theo nhóm' },
            { value: '3 năm', label: 'Kinh nghiệm thực chiến', icon: '📅', sub: '2022 - 2024' },
          ].map((kpi) => (
            <div key={kpi.label} className="gradient-card rounded-3xl p-5 text-center border border-purple-100">
              <div className="text-3xl mb-2">{kpi.icon}</div>
              <div className="text-3xl font-black text-gradient">{kpi.value}</div>
              <div className="text-gray-700 font-semibold text-sm mt-1">{kpi.label}</div>
              <div className="text-gray-400 text-xs">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/khoa-hoc" className="btn-primary inline-flex items-center gap-2">
            Trải nghiệm ngay →
          </Link>
        </div>
      </div>
    </section>
  )
}
