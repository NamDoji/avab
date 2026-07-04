import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import EnrollForm from './EnrollForm'

interface Props {
  params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { name: true } })
  return { title: `Đăng ký — ${course?.name ?? 'Khóa học'} — AvaB` }
}

export default async function CourseEnrollPage({ params }: Props) {
  const { courseId } = await params

  const session = await auth()
  if (!session) {
    redirect(`/dang-nhap?redirect=${encodeURIComponent(`/dang-ky/${courseId}`)}`)
  }

  const userId = (session.user as { id?: string })?.id
  if (!userId) redirect('/dang-nhap')

  // Load course
  const course = await prisma.course.findUnique({
    where: { id: courseId, isActive: true },
  })

  if (!course) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Không tìm thấy khóa học</h1>
          <p className="text-gray-500 mb-6">Khóa học không tồn tại hoặc đã bị ẩn.</p>
          <Link
            href="/khoa-hoc"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white rounded-2xl px-6 py-3 text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            ← Xem tất cả khóa học
          </Link>
        </div>
      </div>
    )
  }

  // Load user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true },
  })

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })

  if (existing && existing.status === 'ACTIVE') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Bạn đã đăng ký khóa học này</h1>
          <p className="text-gray-500 mb-6">Trạng thái: <span className="font-bold text-emerald-600">Đang học</span></p>
          <Link
            href="/hoc-vien"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white rounded-2xl px-6 py-3 text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            Vào trang học viên →
          </Link>
        </div>
      </div>
    )
  }

  const SUBJECT_META: Record<string, { emoji: string; gradient: string }> = {
    THINKING_MATH: { emoji: '🧠', gradient: 'from-purple-500 to-indigo-600' },
    MATH: { emoji: '📐', gradient: 'from-blue-500 to-indigo-600' },
    ENGLISH: { emoji: '🇬🇧', gradient: 'from-green-400 to-teal-600' },
    SCIENCE: { emoji: '🔬', gradient: 'from-cyan-500 to-teal-600' },
    CODING: { emoji: '💻', gradient: 'from-sky-500 to-blue-600' },
    ALGO: { emoji: '🤖', gradient: 'from-yellow-400 to-orange-500' },
  }
  const meta = SUBJECT_META[course.subjectCode] ?? { emoji: '📚', gradient: 'from-emerald-500 to-teal-600' }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* ── Header gradient ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: `linear-gradient(135deg, #064e3b 0%, #059669 100%)` }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative max-w-2xl mx-auto">
          <Link href="/khoa-hoc" className="inline-flex items-center gap-1 text-emerald-200 text-sm font-semibold mb-4 hover:text-white transition-colors">
            ← Danh sách khóa học
          </Link>
          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-3xl flex-shrink-0 shadow-lg`}
            >
              {meta.emoji}
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">{course.name}</h1>
              {course.description && <p className="text-emerald-100 text-sm line-clamp-2">{course.description}</p>}
              {course.price !== null && course.price > 0 && (
                <p className="text-emerald-200 text-sm font-bold mt-2">
                  💰 {course.price.toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      <div className="container-custom py-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-1">📝 Đăng ký khóa học</h2>
          <p className="text-gray-500 text-sm mb-6">
            {existing?.status === 'PENDING'
              ? 'Đơn đăng ký của bạn đang chờ xét duyệt.'
              : 'Điền thông tin bên dưới để đăng ký vào khóa học.'}
          </p>

          {existing?.status === 'PENDING' ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">⏳</div>
              <p className="font-black text-gray-800 mb-2">Đang chờ duyệt</p>
              <p className="text-gray-500 text-sm mb-6">Đơn đăng ký của bạn đã được ghi nhận và đang chờ xét duyệt từ trung tâm.</p>
              <Link href="/hoc-vien" className="inline-flex items-center gap-2 bg-emerald-600 text-white rounded-2xl px-6 py-3 text-sm font-bold hover:bg-emerald-700 transition-colors">
                Về trang học viên
              </Link>
            </div>
          ) : (
            <EnrollForm
              courseId={courseId}
              courseName={course.name}
              coursePrice={course.price}
              userName={user?.name ?? null}
              userPhone={user?.phone ?? ''}
            />
          )}
        </div>
      </div>
    </div>
  )
}
