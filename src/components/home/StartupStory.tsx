import Link from 'next/link'
import { ArrowRight, Trophy, Users, TrendingUp } from 'lucide-react'

export function StartupStory() {
  return (
    <section className="section-padding bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Story */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6 text-sm font-semibold">
              <Trophy size={14} className="text-yellow-400" />
              SV_STARTUP-2024 · Giải Ba Thành phố Hà Nội
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-5 leading-tight">
              Câu chuyện về 5 học sinh lớp 10<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-teal-300">
                biến ý tưởng thành doanh nghiệp thật
              </span>
            </h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Nhóm TenG0 — 5 học sinh lớp 10G0 trường THCS-THPT Newton — tham gia cuộc thi 
              khởi nghiệp quốc gia không phải để thắng giải, mà để <strong className="text-white">
              chứng minh rằng học sinh Việt Nam có thể xây dựng startup công nghệ thật sự</strong>.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Sau khi đoạt giải, thay vì dừng lại, nhóm tiếp tục: xây sản phẩm, tìm khách hàng, 
              ký đối tác với ITSOL và Techainer, và đưa AvaB trở thành nền tảng EdTech 
              phục vụ hơn <strong className="text-teal-300">500 phụ huynh và 100+ học viên</strong> mỗi năm.
            </p>
            <Link
              href="/gioi-thieu"
              className="inline-flex items-center gap-2 bg-white text-purple-800 font-extrabold px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-lg"
            >
              Đọc câu chuyện đầy đủ <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '🥇', label: 'Giải Nhất', sub: 'Vòng Trường', color: 'from-yellow-500 to-yellow-600' },
              { value: '🥈', label: 'Giải Nhì', sub: 'Cụm Nam–Bắc Từ Liêm', color: 'from-gray-400 to-gray-500' },
              { value: '🥉', label: 'Giải Ba', sub: 'TP Hà Nội', color: 'from-orange-500 to-orange-600' },
              { value: '5', label: 'Học sinh sáng lập', sub: 'Lớp 10G0 Newton', color: 'from-purple-500 to-purple-700' },
              { value: '500+', label: 'Phụ huynh', sub: 'Tin tưởng mỗi năm', color: 'from-teal-500 to-teal-700' },
              { value: '3', label: 'Đối tác chiến lược', sub: 'ITSOL · Techainer · Newton', color: 'from-blue-500 to-blue-700' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-3xl bg-gradient-to-br ${stat.color} p-4 text-center`}
              >
                <div className="text-3xl font-black mb-0.5">{stat.value}</div>
                <div className="text-sm font-bold text-white/90">{stat.label}</div>
                <div className="text-xs text-white/60 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
