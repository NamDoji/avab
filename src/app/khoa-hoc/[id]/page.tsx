import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EnrollButton from '@/components/courses/EnrollButton'

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

  const colorPalette = [
    'from-purple-400 to-purple-600',
    'from-blue-400 to-blue-600',
    'from-teal-400 to-teal-600',
    'from-cyan-400 to-cyan-600',
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600',
    'from-orange-400 to-orange-600',
    'from-red-400 to-red-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
    'from-violet-400 to-violet-600',
    'from-rose-400 to-rose-600',
  ]

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="gradient-hero text-white py-12">
        <div className="container-custom">
          <Link href="/khoa-hoc" className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors w-fit">
            <ArrowLeft size={16} />
            Tất cả khoá học
          </Link>
          <h1 className="text-2xl md:text-4xl font-black mb-2">{course.name}</h1>
          <p className="text-white/80 mb-4 max-w-2xl">{course.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="bg-white/15 px-3 py-1 rounded-full">
              📚 {course.subjects.length} chuyên đề
            </span>
            <span className="bg-white/15 px-3 py-1 rounded-full">
              👥 {(350 + (course.id.split('').reduce((h,c) => (h*31+c.charCodeAt(0))%1000000, 0) % 351)).toLocaleString('vi-VN')} học viên
            </span>
            <span className="bg-yellow-400 text-yellow-900 font-black px-4 py-1 rounded-full">
              1.500.000 VNĐ / năm
            </span>
          </div>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Enrollment banner — only show when not yet approved */}
        {!isEnrolled && (
          enrollmentStatus === 'PENDING' ? (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-3xl">⏳</div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-amber-900">Đơn đăng ký của bạn đang chờ duyệt.</p>
                <p className="text-amber-700 text-sm">
                  Liên hệ Zalo{' '}
                  <a href="https://zalo.me/0904290583" target="_blank" rel="noopener noreferrer" className="font-bold underline">
                    0904290583
                  </a>{' '}
                  để được hướng dẫn.
                </p>
              </div>
              <EnrollButton courseId={id} isEnrolled={isEnrolled} enrollmentStatus={enrollmentStatus} />
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-3xl">🔒</div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-amber-900">Đăng ký để học toàn bộ khoá học</p>
                <p className="text-amber-700 text-sm">Xem trước chuyên đề, đăng ký để mở khoá học đầy đủ</p>
              </div>
              {session ? (
                <EnrollButton courseId={id} isEnrolled={isEnrolled} enrollmentStatus={enrollmentStatus} />
              ) : (
                <Link href="/dang-nhap" className="btn-primary !py-2 !px-5 !text-sm whitespace-nowrap">
                  Đăng nhập để đăng ký
                </Link>
              )}
            </div>
          )
        )}

        <h2 className="text-xl font-black text-gray-900 mb-6">
          Chọn chuyên đề muốn học
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {course.subjects.map((subject, idx) => {
            const color = colorPalette[idx % colorPalette.length]
            const canAccess = isEnrolled || subject.isPreview

            return (
              <Link
                key={subject.id}
                href={canAccess ? `/khoa-hoc/${id}/${subject.id}` : (session ? '#' : '/dang-nhap')}
                className={`group relative flex flex-col items-center p-4 rounded-3xl text-center border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer select-none
                  ${canAccess ? 'border-purple-100 bg-white hover:border-purple-300' : 'border-gray-100 bg-gray-50 opacity-70'}
                `}
              >
                {!canAccess && (
                  <div className="absolute top-2 right-2 text-gray-400 text-xs">🔒</div>
                )}
                {subject.isPreview && (
                  <div className="absolute top-2 left-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Xem thử
                  </div>
                )}
                <div className="absolute top-2 right-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
                  {subject.order}
                </div>
                <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform duration-200 mb-2`}>
                  {subject.icon || '📖'}
                </div>
                <p className="text-xs font-bold text-gray-700 leading-snug">{subject.name}</p>
                <span className="text-xs text-gray-400 mt-1">
                  {subject._count.questions} câu hỏi
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
