import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EnrollButton from '@/components/courses/EnrollButton'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const COURSE_TYPE_THEME: Record<CourseType, { gradient: string; emoji: string; mascot: string; tagline: string; subjectColors: string[] }> = {
  TOAN: {
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    emoji: '📐',
    mascot: '🦊',
    tagline: 'Toán tư duy — Học thông minh hơn mỗi ngày!',
    subjectColors: ['from-purple-400 to-purple-600','from-indigo-400 to-indigo-600','from-blue-400 to-blue-600','from-violet-400 to-violet-600','from-fuchsia-400 to-fuchsia-600','from-pink-400 to-pink-600'],
  },
  TIENG_ANH: {
    gradient: 'from-green-500 via-teal-500 to-cyan-600',
    emoji: '🇬🇧',
    mascot: '🦜',
    tagline: 'English vui — Học như chơi, nói như người bản xứ!',
    subjectColors: ['from-green-400 to-green-600','from-teal-400 to-teal-600','from-cyan-400 to-cyan-600','from-emerald-400 to-emerald-600','from-lime-400 to-lime-600','from-sky-400 to-sky-600'],
  },
  LAP_TRINH_THUAT_TOAN: {
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    emoji: '🤖',
    mascot: '🤖',
    tagline: 'Lập trình tư duy — Điều khiển robot, phá mê cung!',
    subjectColors: ['from-yellow-400 to-orange-500','from-orange-400 to-red-500','from-amber-400 to-yellow-500','from-red-400 to-pink-500','from-lime-400 to-green-500','from-teal-400 to-cyan-500'],
  },
  LAP_TRINH_SCRATCH: {
    gradient: 'from-orange-400 via-pink-500 to-rose-600',
    emoji: '🐱',
    mascot: '🐱',
    tagline: 'Scratch — Kéo thả code, tạo game siêu vui!',
    subjectColors: ['from-orange-400 to-pink-500','from-pink-400 to-rose-500','from-fuchsia-400 to-purple-500','from-red-400 to-orange-500','from-yellow-400 to-amber-500','from-rose-400 to-pink-500'],
  },
  LAP_TRINH_PYTHON: {
    gradient: 'from-teal-500 via-cyan-500 to-blue-600',
    emoji: '🐍',
    mascot: '🐍',
    tagline: 'Python — Ngôn ngữ lập trình mạnh nhất thế giới!',
    subjectColors: ['from-teal-400 to-teal-600','from-cyan-400 to-blue-500','from-blue-400 to-indigo-500','from-sky-400 to-cyan-500','from-indigo-400 to-blue-500','from-green-400 to-teal-500'],
  },
  LAP_TRINH_CPP: {
    gradient: 'from-violet-600 via-purple-700 to-indigo-800',
    emoji: '⚡',
    mascot: '⚡',
    tagline: 'C++ — Lập trình thi đấu, chinh phục mọi bài toán!',
    subjectColors: ['from-violet-400 to-violet-600','from-purple-400 to-purple-600','from-indigo-400 to-indigo-600','from-blue-400 to-violet-500','from-fuchsia-400 to-violet-500','from-pink-400 to-purple-500'],
  },
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  const course = await prisma.course.findUnique({
    where: { id, isActive: true },
    include: {
      subjects: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { questions: true } },
        },
      },
    },
  }).catch(() => null)

  if (!course) notFound()

  const cType = ((course as any).courseType as CourseType) ?? 'TOAN'
  const theme = COURSE_TYPE_THEME[cType] ?? COURSE_TYPE_THEME.TOAN

  // Check if enrolled and get enrollment status
  let isEnrolled = false
  let enrollmentStatus: string | null = null
  if (session) {
    const userId = (session.user as any).id
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    }).catch(() => null)
    isEnrolled = enrollment?.status === 'APPROVED'
    enrollmentStatus = enrollment?.status ?? null
  }

  const enrollCount = 350 + (course.id.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1000000, 0) % 351)

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Banner — child-friendly, big and colorful */}
      <div className={`bg-gradient-to-br ${theme.gradient} text-white`}>
        <div className="container-custom py-10 md:py-14">
          <Link href="/khoa-hoc" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-5 text-sm transition-colors">
            <ArrowLeft size={16} />
            Tất cả khoá học
          </Link>

          <div className="flex items-start gap-6">
            {/* Big mascot */}
            <div className="hidden md:flex w-24 h-24 rounded-3xl bg-white/20 items-center justify-center text-5xl shrink-0 border-4 border-white/30 shadow-xl">
              {theme.mascot}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="md:hidden text-4xl">{theme.mascot}</span>
                <div>
                  <p className="text-white/70 text-sm font-semibold">{theme.tagline}</p>
                  <h1 className="text-2xl md:text-4xl font-black leading-tight">{course.name}</h1>
                </div>
              </div>
              {course.description && (
                <p className="text-white/80 mb-5 max-w-2xl text-base whitespace-pre-line">{course.description}</p>
              )}
              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full font-semibold">
                  📚 {course.subjects.length} chuyên đề
                </span>
                <span className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full font-semibold">
                  👨‍👩‍👧 {enrollCount.toLocaleString('vi-VN')} học viên
                </span>
                <span className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full font-semibold">
                  🏅 Có huy hiệu & sao thưởng
                </span>
                {course.price ? (
                  <span className="bg-yellow-400 text-yellow-900 font-black px-4 py-1.5 rounded-full">
                    💰 {course.price.toLocaleString('vi-VN')} VNĐ
                  </span>
                ) : (
                  <span className="bg-green-400 text-green-900 font-black px-4 py-1.5 rounded-full">
                    🎁 Miễn phí
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Enrollment banner */}
        {!isEnrolled && (
          enrollmentStatus === 'PENDING' ? (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-4xl">⏳</div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-black text-amber-900 text-lg">Đơn đăng ký đang chờ duyệt...</p>
                <p className="text-amber-700 text-sm mt-1">
                  Liên hệ Zalo{' '}
                  <a href="https://zalo.me/0904290583" target="_blank" rel="noopener noreferrer" className="font-black underline">
                    0904290583
                  </a>{' '}
                  để được hướng dẫn nhanh hơn!
                </p>
              </div>
            </div>
          ) : (
            <div className={`bg-gradient-to-r ${theme.gradient} rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4 text-white`}>
              <div className="text-4xl">{theme.emoji}</div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-black text-lg">Đăng ký để bắt đầu học ngay hôm nay! 🚀</p>
                <p className="text-white/80 text-sm mt-1">Xem thử một số chuyên đề, đăng ký để mở khoá toàn bộ</p>
              </div>
              <div className="flex gap-3 items-center">
                {session ? (
                  <EnrollButton courseId={id} isEnrolled={isEnrolled} enrollmentStatus={enrollmentStatus} />
                ) : (
                  <Link href="/dang-nhap" className="bg-white text-purple-700 font-black px-5 py-2.5 rounded-2xl hover:bg-purple-50 transition text-sm">
                    Đăng nhập để đăng ký →
                  </Link>
                )}
              </div>
            </div>
          )
        )}

        {isEnrolled && (
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl p-5 mb-8 flex items-center gap-4 text-white">
            <div className="text-4xl">🎉</div>
            <div>
              <p className="font-black text-lg">Chào mừng trở lại! Tiếp tục học nào!</p>
              <p className="text-white/80 text-sm">Bạn đã đăng ký khoá học này — nhấn vào chuyên đề để học tiếp 👇</p>
            </div>
          </div>
        )}

        {/* Subject grid — big, colorful, child-friendly */}
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-5 flex items-center gap-2">
          <span className="text-3xl">{theme.emoji}</span>
          Chọn chuyên đề muốn học
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {course.subjects.map((subject, idx) => {
            const color = theme.subjectColors[idx % theme.subjectColors.length]
            const canAccess = isEnrolled || subject.isPreview

            return (
              <Link
                key={subject.id}
                href={canAccess ? `/khoa-hoc/${id}/${subject.id}` : '#'}
                className={`group relative flex flex-col items-center p-4 rounded-3xl text-center border-2 transition-all duration-200 select-none
                  ${canAccess
                    ? 'border-white bg-white hover:border-purple-200 hover:-translate-y-2 hover:shadow-xl active:scale-95 cursor-pointer'
                    : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed pointer-events-none'
                  }
                `}
              >
                {/* Lock badge */}
                {!canAccess && (
                  <div className="absolute top-2 right-2 bg-gray-200 rounded-full p-1">
                    <span className="text-xs">🔒</span>
                  </div>
                )}
                {/* Preview badge */}
                {subject.isPreview && canAccess && (
                  <div className="absolute top-2 left-2 bg-teal-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    Xem thử
                  </div>
                )}
                {/* Order number */}
                <div className="absolute top-2 right-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-[10px] font-black">
                  {subject.order}
                </div>

                {/* Icon circle */}
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 mb-3 mt-1`}>
                  {subject.icon || '📖'}
                </div>

                <p className="text-sm font-black text-gray-800 leading-snug mb-1">{subject.name}</p>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  {subject._count.questions} câu
                </span>
              </Link>
            )
          })}
        </div>

        {/* Motivation footer */}
        <div className="mt-10 bg-white rounded-3xl border-2 border-purple-100 p-6 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h3 className="font-black text-gray-900 text-lg mb-2">Hệ thống khen thưởng</h3>
          <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
              ⭐ Hoàn thành → nhận sao
            </span>
            <span className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
              🏅 Đạt 90%+ → huy hiệu vàng
            </span>
            <span className="flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
              🏆 Top bảng xếp hạng → cúp
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
