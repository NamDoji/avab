import Link from 'next/link'

interface Props {
  orgCount: number
  studentCount: number
  courseCount: number
}

/**
 * A compact stats bar that shows live platform numbers and key CTAs.
 * Sits just below the Hero section.
 */
export function PlatformStatsBar({ orgCount, studentCount, courseCount }: Props) {
  return (
    <section className="bg-white border-b border-gray-100 py-6">
      <div className="container-custom">
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          {[
            { icon: '🏫', value: orgCount.toLocaleString('vi-VN'), label: 'Trường / Trung tâm' },
            { icon: '👩‍🎓', value: studentCount.toLocaleString('vi-VN'), label: 'Học sinh đang học' },
            { icon: '📚', value: courseCount.toLocaleString('vi-VN'), label: 'Khoá học công khai' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 text-gray-700">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-black text-gray-900 leading-tight">{stat.value}</p>
                <p className="text-xs text-gray-500 font-semibold">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['🤖 AI Studio', '🏢 ERP Trường học', '📊 Phân tích học tập', '📅 Thời khoá biểu', '🎮 Gamification', '💬 Cộng đồng'].map(
            (feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 bg-cherry-50 text-cherry-700 text-xs font-bold px-3 py-1.5 rounded-full border border-cherry-100"
              >
                {feature}
              </span>
            ),
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dang-ky-to-chuc"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black text-white shadow-lg shadow-cherry-200 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #951F3D, #4f46e5)' }}
          >
            🚀 Đăng ký miễn phí 30 ngày
          </Link>
          <Link
            href="/thi-truong"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black text-cherry-700 bg-cherry-50 border border-cherry-200 hover:bg-cherry-100 transition-all"
          >
            📖 Xem kho học liệu
          </Link>
        </div>
      </div>
    </section>
  )
}
