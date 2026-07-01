import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookOpen, Trophy, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AIDashboard } from '@/components/ai/AIDashboard'

async function getStudentData(userId: string) {
  const [enrollments, answers] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            thumbnail: true,
            _count: { select: { subjects: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentAnswer.findMany({
      where: { userId },
      select: { score: true, isCorrect: true, subjectId: true },
    }),
  ])

  const totalScore = answers.reduce((sum, a) => sum + a.score, 0)
  const correctAnswers = answers.filter((a) => a.isCorrect).length
  const totalAnswers = answers.length

  return { enrollments, totalScore, correctAnswers, totalAnswers }
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    PENDING: { icon: AlertCircle, label: 'Chờ duyệt', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    APPROVED: { icon: CheckCircle, label: 'Đã duyệt', classes: 'bg-green-50 text-green-700 border-green-200' },
    REJECTED: { icon: XCircle, label: 'Từ chối', classes: 'bg-red-50 text-red-700 border-red-200' },
  }
  const { icon: Icon, label, classes } = config[status as keyof typeof config] ?? config.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${classes}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

export default async function HocVienPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/dang-nhap')
  }

  const userId = (session.user as any).id as string
  const { enrollments, totalScore, correctAnswers, totalAnswers } =
    await getStudentData(userId)

  const approvedEnrollments = enrollments.filter((e) => e.status === 'APPROVED')
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Xin chào, {session.user.name ?? 'Học viên'} 👋
          </h1>
          <p className="text-purple-100">Dashboard học viên AVAB</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: BookOpen,
              label: 'Khoá đã đăng ký',
              value: enrollments.length,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              icon: CheckCircle,
              label: 'Khoá đã duyệt',
              value: approvedEnrollments.length,
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              icon: Trophy,
              label: 'Tổng điểm',
              value: totalScore,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50',
            },
            {
              icon: Clock,
              label: 'Độ chính xác',
              value: `${accuracy}%`,
              color: 'text-teal-600',
              bg: 'bg-teal-50',
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-5`}>
              <Icon className={`w-6 h-6 ${color} mb-2`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Khoá học của tôi</h2>

          {enrollments.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">Bạn chưa đăng ký khoá học nào</p>
              <Link
                href="/khoa-hoc"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition"
              >
                Khám phá khoá học
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-mono mb-1">
                        {enrollment.course.code}
                      </p>
                      <h3 className="font-bold text-gray-800 line-clamp-2">
                        {enrollment.course.name}
                      </h3>
                    </div>
                    <StatusBadge status={enrollment.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {enrollment.course._count.subjects} chuyên đề
                    </p>
                    {enrollment.status === 'APPROVED' && (
                      <Link
                        href={`/khoa-hoc/${enrollment.course.id}`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                      >
                        Vào học →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Dashboard */}
        <AIDashboard userId={userId} />

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { href: '/khoa-hoc', label: 'Tìm khoá học mới', icon: BookOpen, color: 'bg-purple-600' },
            { href: '/bang-vang', label: 'Bảng xếp hạng', icon: Trophy, color: 'bg-yellow-500' },
            { href: '/tin-tuc', label: 'Tin tức AVAB', icon: Clock, color: 'bg-teal-600' },
            { href: '/doi-mat-khau', label: 'Đổi mật khẩu', icon: CheckCircle, color: 'bg-gray-600' },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`${color} hover:opacity-90 text-white rounded-xl p-5 flex items-center gap-3 transition`}
            >
              <Icon className="w-6 h-6" />
              <span className="font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
