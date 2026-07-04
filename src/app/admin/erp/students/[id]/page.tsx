import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import StudentProfileTabs from './StudentProfileTabs'
import type { StudentProfileTabsProps } from './StudentProfileTabs'

export const metadata = { title: 'Hồ sơ học sinh — AvaB ERP' }

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ name, size = 64 }: { name: string | null; size?: number }) {
  const letter = name ? name.trim()[0]?.toUpperCase() ?? '?' : '?'
  const colors = ['#0f766e', '#0369a1', '#7c3aed', '#db2777', '#ea580c', '#65a30d']
  const color  = colors[(letter.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {letter}
    </div>
  )
}

const BG_LEVEL_LABELS: Record<string, string> = {
  BEGINNER:     '🌱 Mới bắt đầu',
  INTERMEDIATE: '📖 Trung cấp',
  ADVANCED:     '🚀 Nâng cao',
}

const STYLE_LABELS: Record<string, string> = {
  VISUAL:      '👁 Thị giác',
  READING:     '📖 Đọc / Viết',
  KINESTHETIC: '🤸 Thực hành',
  MIXED:       '🔀 Hỗn hợp',
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { id } = await params

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              subjects: { take: 5, orderBy: { order: 'asc' } },
            },
          },
        },
      },
      learnerProfile: true,
      answers: {
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          question: { select: { content: true, subjectId: true } },
        },
      },
      userStats: true,
      userBadges: { include: { badge: true }, take: 10 },
      sessionRecords: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { feedback: true },
      },
    },
  })

  if (!student || student.role !== 'STUDENT') notFound()

  const activeEnrollments  = student.enrollments.filter((e) => e.status === 'ACTIVE')
  const expiredEnrollments = student.enrollments.filter((e) => e.status !== 'ACTIVE')
  const isActive = activeEnrollments.length > 0
  const correctAnswers = student.answers.filter((a) => a.isCorrect).length

  // Serialize for client components (Dates → passed as-is, React server serializes them)
  const tabProps: StudentProfileTabsProps = {
    enrollments: student.enrollments.map((e) => ({
      id: e.id,
      status: e.status,
      expiresAt: e.expiresAt,
      createdAt: e.createdAt,
      course: {
        id: e.course.id,
        name: e.course.name,
        grade: e.course.grade,
        subjectName: e.course.subjectName,
        subjects: e.course.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          order: s.order,
        })),
      },
    })),
    answers: student.answers.map((a) => ({
      id: a.id,
      isCorrect: a.isCorrect,
      score: a.score,
      createdAt: a.createdAt,
      question: { content: a.question.content, subjectId: a.question.subjectId },
    })),
    sessionRecords: student.sessionRecords.map((r) => ({
      id: r.id,
      attendance: r.attendance,
      focusLevel: r.focusLevel,
      comprehension: r.comprehension,
      teacherNote: r.teacherNote,
      emotionState: r.emotionState,
      createdAt: r.createdAt,
      feedback: {
        id: r.feedback.id,
        sessionDate: r.feedback.sessionDate,
        sessionNote: r.feedback.sessionNote,
        subjectId: r.feedback.subjectId,
      },
    })),
    userBadges: student.userBadges.map((ub) => ({
      id: ub.id,
      earnedAt: ub.earnedAt,
      badge: {
        id: ub.badge.id,
        key: ub.badge.key,
        name: ub.badge.name,
        icon: ub.badge.icon,
        color: ub.badge.color,
        xpReward: ub.badge.xpReward,
      },
    })),
    userStats: student.userStats
      ? {
          xp: student.userStats.xp,
          coin: student.userStats.coin,
          level: student.userStats.level,
          streak: student.userStats.streak,
          totalAnswers: student.userStats.totalAnswers,
          correctAnswers: student.userStats.correctAnswers,
          lessonsViewed: student.userStats.lessonsViewed,
        }
      : null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-8"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)' }}
      >
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-teal-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">ERP</Link>
            <span>/</span>
            <Link href="/admin/erp/students" className="hover:text-white transition-colors">Học sinh</Link>
            <span>/</span>
            <span>{student.name ?? student.phone}</span>
            <span>/</span>
            <Link href={`/admin/erp/students/${id}/analytics`} className="hover:text-white transition-colors">📊 Analytics</Link>
            <span>/</span>
            <Link href={`/admin/erp/students/${id}/homework`} className="hover:text-white transition-colors">📝 Bài tập</Link>
          </div>
          <h1 className="text-2xl font-black">{student.name ?? 'Chưa có tên'}</h1>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Tabs (2/3) ── */}
          <div className="lg:col-span-2">
            <StudentProfileTabs {...tabProps} />
          </div>

          {/* ── Right: Profile card (1/3) ── */}
          <div className="space-y-4">

            {/* Avatar + tên + status */}
            <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
              <div className="flex justify-center mb-3">
                <Avatar name={student.name} size={72} />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-0.5">
                {student.name ?? '—'}
              </h2>
              <p className="text-gray-500 text-sm mb-3">{student.phone}</p>
              {student.email && (
                <p className="text-gray-400 text-xs mb-3">{student.email}</p>
              )}
              <span
                className="inline-block text-sm font-bold px-3 py-1.5 rounded-full"
                style={
                  isActive
                    ? { background: '#dcfce7', color: '#166534' }
                    : { background: '#f3f4f6', color: '#6b7280' }
                }
              >
                {isActive ? 'Đang học' : 'Chưa có lớp'}
              </span>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-700 text-sm mb-3">📊 Thống kê nhanh</h3>
              <div className="space-y-2">
                {[
                  { label: 'Tổng câu đã làm', value: student.answers.length.toLocaleString() },
                  { label: 'Câu đúng (20 gần nhất)', value: `${correctAnswers}/${student.answers.length}` },
                  {
                    label: 'Streak',
                    value: student.userStats ? `${student.userStats.streak} ngày 🔥` : '—',
                  },
                  {
                    label: 'Level',
                    value: student.userStats ? `Lv.${student.userStats.level} ⚡` : '—',
                  },
                  {
                    label: 'Khóa đang học',
                    value: `${activeEnrollments.length} khóa`,
                  },
                  {
                    label: 'Khóa đã kết thúc',
                    value: `${expiredEnrollments.length} khóa`,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{stat.label}</span>
                    <span className="font-semibold text-gray-800">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learner profile */}
            {student.learnerProfile && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-700 text-sm mb-3">🧠 Hồ sơ học tập</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trình độ</span>
                    <span className="font-semibold">
                      {BG_LEVEL_LABELS[student.learnerProfile.backgroundLevel] ?? student.learnerProfile.backgroundLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phong cách học</span>
                    <span className="font-semibold">
                      {STYLE_LABELS[student.learnerProfile.learningStyle] ?? student.learnerProfile.learningStyle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Giờ/tuần</span>
                    <span className="font-semibold">{student.learnerProfile.weeklyHours}h</span>
                  </div>
                  {student.learnerProfile.targetSchool && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trường mục tiêu</span>
                      <span className="font-semibold text-right max-w-32 truncate">
                        {student.learnerProfile.targetSchool}
                      </span>
                    </div>
                  )}
                  {student.learnerProfile.additionalNotes && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">{student.learnerProfile.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ngày tham gia */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="text-xs text-gray-400 mb-1">Ngày tham gia</div>
              <div className="text-sm font-semibold text-gray-700">
                {new Date(student.createdAt).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Homework link */}
            <Link
              href={`/admin/erp/students/${id}/homework`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              📝 Xem bài tập nộp
            </Link>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-colors"
                style={{ background: '#f3f4f6', color: '#374151' }}
              >
                ✏️ Sửa thông tin
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}
              >
                📱 Đặt lại mật khẩu
              </Link>
              <Link
                href="/admin/erp/students"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Quay về danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
