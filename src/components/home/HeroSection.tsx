'use client'

import Link from 'next/link'
import { Star, Award, TrendingUp, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLang } from '@/contexts/LanguageContext'

export function HeroSection() {
  const { data: session } = useSession()
  const { lang } = useLang()
  const vi = lang === 'vi'
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-95" />

      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />

      {/* Floating math symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['➕', '✖️', '➖', '÷', '=', '?', '🔢', '⭐', '💡', '🧮'].map((symbol, i) => (
          <div
            key={i}
            className="absolute text-2xl md:text-4xl opacity-10 animate-float"
            style={{
              left: `${10 + (i * 9) % 80}%`,
              top: `${15 + (i * 13) % 70}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            {symbol}
          </div>
        ))}
      </div>

      <div className="container-custom relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Award badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 text-white/90">
            <Award size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold">
              {vi
                ? 'Giải Ba Thành phố Hà Nội • Khởi nghiệp sáng tạo TenGo'
                : 'Hanoi City 3rd Place Award • TenGo Innovation Startup'}
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            {vi ? (
              <>
                Con Tự Tin
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-teal-300 to-purple-300">
                  Chinh Phục
                </span>
                <br />
                Học Bổng Lớp 1
              </>
            ) : (
              <>
                Your Child
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-teal-300 to-purple-300">
                  Conquers
                </span>
                <br />
                Grade 1 Scholarship
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            {vi
              ? 'Phương pháp toán tư duy đỉnh cao, được nghiên cứu và phát triển bởi những học sinh xuất sắc đạt giải tại các kỳ thi Toán Tư Duy Quốc Tế. Giúp con yêu thích toán học và sẵn sàng bứt phá trong kỳ thi tuyển vào các trường chất lượng cao danh giá.'
              : 'A world-class logical thinking math methodology, developed by award-winning students from International Math Olympiads. Help your child love mathematics and ace the entrance exams at Hanoi’s top schools.'}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/khoa-hoc"
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 font-extrabold text-lg py-4 px-8 rounded-3xl shadow-2xl hover:shadow-white/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Sparkles size={20} />
              {session
                ? (lang === 'vi' ? 'Bắt đầu khám phá khoá học' : 'Explore Courses')
                : (lang === 'vi' ? 'Khám phá khoá học' : 'Explore Courses')}
            </Link>
            {!session && (
              <Link
                href="/dang-ky"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white font-bold text-lg py-4 px-8 rounded-3xl hover:bg-white/20 hover:border-white/60 transition-all duration-200"
              >
                {lang === 'vi' ? 'Đăng ký miễn phí' : 'Sign up free'}
              </Link>
            )}
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: '👨‍👩‍👧', value: '1.500+', label: vi ? 'Phụ huynh tin tưởng' : 'Trusting parents' },
              { icon: '🎓', value: '715+', label: vi ? 'Học viên đã mua' : 'Enrolled students' },
              { icon: '⭐', value: vi ? '3 năm' : '3 years', label: vi ? 'Hoạt động liên tục' : 'In operation' },
              { icon: '🏆', value: 'Top 10', label: vi ? 'Điểm số tư duy' : 'Thinking scores' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-white font-black text-xl">{item.value}</span>
                <span className="text-white/60 text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1440 40 1080 0 720 0C360 0 0 40 0 40L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
