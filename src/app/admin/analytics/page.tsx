import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Analytics Center — AvaB Admin' }

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  THEORY: '📖 Lý thuyết',
  HOMEWORK: '📝 Bài tập',
  ANSWER_KEY: '✅ Đáp án',
  QUIZ: '📊 Quiz',
  TEACHER_GUIDE: '👩‍🏫 GV Guide',
  VIDEO_SCRIPT: '🎬 Video Script',
}

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const [
    totalStudents,
    activeEnrollments,
    totalCourses,
    totalAIProjects,
    totalSubjectMaterials,
    recentHomework,
    topCourses,
    materialsByType,
    recentAnswers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.aIProject.count(),
    prisma.subjectMaterial.count(),
    prisma.homeworkSet.count(),
    prisma.course.findMany({
      take: 5,
      orderBy: { enrollments: { _count: 'desc' } },
      include: {
        _count: { select: { enrollments: true, subjects: true } },
      },
    }),
    prisma.subjectMaterial.groupBy({
      by: ['type'],
      _count: { id: true },
    }),
    prisma.studentAnswer.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        question: { select: { content: true, subjectId: true } },
      },
    }),
  ])

  return (
    <div className="min-h-screen pt-20 bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 text-white py-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <Link href="/admin" className="inline-flex items-center gap-1 text-orange-200 text-sm font-semibold mb-3 hover:text-white transition-colors">
            ← Admin Dashboard
          </Link>
          <p className="text-orange-200 text-sm font-semibold mb-1">📊 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-1">Analytics Center</h1>
          <p className="text-orange-100 text-sm">Phân tích học tập &amp; AI usage</p>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">

        {/* ── 1. Stats row ───────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">📈 Tổng quan</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '👥',
                label: 'Tổng học sinh',
                value: totalStudents,
                sub: 'Học viên STUDENT',
                gradient: 'from-blue-500 to-indigo-600',
              },
              {
                icon: '✅',
                label: 'Đang học',
                value: activeEnrollments,
                sub: 'Enrollment ACTIVE',
                gradient: 'from-teal-500 to-emerald-600',
              },
              {
                icon: '📚',
                label: 'Khóa học active',
                value: totalCourses,
                sub: 'Courses isActive',
                gradient: 'from-purple-500 to-violet-600',
              },
              {
                icon: '🤖',
                label: 'AI Projects',
                value: totalAIProjects,
                sub: 'AIProject tổng',
                gradient: 'from-pink-500 to-rose-600',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${stat.gradient} p-6 text-white shadow-md`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-black mb-1">{stat.value.toLocaleString('vi-VN')}</div>
                <div className="font-bold text-sm">{stat.label}</div>
                <div className="text-white/60 text-xs mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. AI Usage ───────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🤖 AI Usage</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Total AI materials */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl">📄</div>
                <div>
                  <h2 className="font-black text-gray-900">Tài liệu AI đã tạo</h2>
                  <p className="text-gray-400 text-xs">Tổng SubjectMaterial trong hệ thống</p>
                </div>
              </div>
              <div className="text-5xl font-black text-purple-600 mb-4">{totalSubjectMaterials.toLocaleString('vi-VN')}</div>

              {/* Type breakdown */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 mb-2">Chia theo loại</p>
                {materialsByType.length === 0 ? (
                  <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {materialsByType
                      .sort((a, b) => b._count.id - a._count.id)
                      .map((m) => (
                        <div
                          key={m.type}
                          className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl px-3 py-1.5 text-sm font-semibold"
                        >
                          <span>{MATERIAL_TYPE_LABELS[m.type] ?? m.type}</span>
                          <span className="bg-purple-200 text-purple-800 rounded-full px-2 py-0.5 text-xs font-black">
                            {m._count.id}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Homework & more */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center text-2xl">📋</div>
                <div>
                  <h2 className="font-black text-gray-900">Bài tập & nội dung</h2>
                  <p className="text-gray-400 text-xs">Tổng hợp nội dung học tập</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Homework Sets</p>
                      <p className="text-gray-400 text-xs">Bộ bài tập đã tạo</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-orange-600">{recentHomework.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">AI Projects</p>
                      <p className="text-gray-400 text-xs">Workspace AI Studio</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-blue-600">{totalAIProjects.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Subject Materials</p>
                      <p className="text-gray-400 text-xs">Tài liệu AI tổng cộng</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-purple-600">{totalSubjectMaterials.toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Top Courses ─────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🏆 Top Khóa học (by enrollment)</p>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {topCourses.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">📚</div>
                <p>Chưa có khóa học nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {topCourses.map((course, idx) => (
                  <div key={course.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    {/* Rank */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0
                      ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'}`}>
                      {idx + 1}
                    </div>

                    {/* Course info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/courses/${course.id}`} className="font-bold text-gray-900 hover:text-purple-600 transition-colors truncate block">
                        {course.name}
                      </Link>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {course.code}
                        {course.grade && ` · Lớp ${course.grade}`}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-xl font-black text-blue-600">{course._count.enrollments}</div>
                        <div className="text-xs text-gray-400">Học sinh</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-black text-purple-600">{course._count.subjects}</div>
                        <div className="text-xs text-gray-400">Chuyên đề</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Learning Activity ───────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">⚡ Hoạt động gần đây</p>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {recentAnswers.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p>Chưa có hoạt động nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentAnswers.map((answer) => {
                  const shortQ = answer.question.content.length > 60
                    ? answer.question.content.slice(0, 60) + '…'
                    : answer.question.content
                  const studentName = answer.user.name ?? 'Học viên'
                  return (
                    <div key={answer.id} className="flex items-start gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0 mt-0.5">
                        {studentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">
                          <span className="font-bold text-teal-700">{studentName}</span>
                          {' '}vừa trả lời:{' '}
                          <span className="text-gray-600 italic">&ldquo;{shortQ}&rdquo;</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(answer.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── 5. Quick links ─────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🔗 Truy cập nhanh</p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/admin/users',      icon: '👥', label: 'Xem chi tiết học sinh',   color: 'hover:border-blue-300 hover:bg-blue-50' },
              { href: '/admin/courses',    icon: '📚', label: 'Quản lý khóa học',         color: 'hover:border-purple-300 hover:bg-purple-50' },
              { href: '/admin/ai-studio',  icon: '🤖', label: 'AI Studio',                color: 'hover:border-pink-300 hover:bg-pink-50' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-sm hover:shadow-md transition-all text-sm font-bold text-gray-700 ${link.color}`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
                <span className="text-gray-400">→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
