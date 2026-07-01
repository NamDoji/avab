'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useLang } from '@/contexts/LanguageContext'

export function CtaSection() {
  const { data: session } = useSession()
  const { lang } = useLang()
  const vi = lang === 'vi'

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="gradient-hero rounded-4xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="text-6xl mb-4">🚀</div>

            {session ? (
              <>
                <h2 className="text-3xl md:text-5xl font-black mb-4">
                  {vi ? `Chào mừng trở lại, ${session.user?.name?.split(' ').pop()}! 👋` : `Welcome back, ${session.user?.name?.split(' ').pop()}! 👋`}
                </h2>
                <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                  {vi
                    ? 'Tiếp tục hành trình luyện thi của con. Các bài tập đang chờ!'
                    : 'Continue your learning journey. Exercises are waiting!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/khoa-hoc"
                    className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 font-extrabold text-lg py-4 px-10 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                    {vi ? '📚 Tiếp tục học' : '📚 Continue Learning'}
                  </Link>
                  <Link href="/hoc-vien"
                    className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-bold text-lg py-4 px-10 rounded-3xl hover:bg-white/10 transition-all">
                    {vi ? 'Trang cá nhân' : 'My Dashboard'}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-5xl font-black mb-4">
                  {vi ? 'Bắt đầu hành trình của con hôm nay!' : 'Start your child\'s journey today!'}
                </h2>
                <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                  {vi
                    ? 'Đăng ký miễn phí để nhận tư vấn chương trình học và demo thử một số chuyên đề.'
                    : 'Sign up free to get a consultation and try demo lessons.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dang-ky"
                    className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 font-extrabold text-lg py-4 px-10 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                    {vi ? 'Đăng ký miễn phí ngay ✨' : 'Sign up free now ✨'}
                  </Link>
                  <Link href="/khoa-hoc"
                    className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-bold text-lg py-4 px-10 rounded-3xl hover:bg-white/10 transition-all">
                    {vi ? 'Xem khoá học' : 'View courses'}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
