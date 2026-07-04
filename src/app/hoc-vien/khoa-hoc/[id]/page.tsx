import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, CheckCircle, Target, Clock, TrendingUp, ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Chi tiết khoá học — AvaB Học viên' }

// ── Course type themes (reused from public course page) ─────────────────────
const K12_SUBJECT_THEME: Record<string, { gradient: string; emoji: string }> = {
  THINKING_MATH: { gradient: 'from-purple-600 to-indigo-600', emoji: '🧠' },
  MATH:          { gradient: 'from-blue-600 to-indigo-600',   emoji: '📐' },
  VIETNAMESE:    { gradient: 'from-red-500 to-orange-500',    emoji: '📖' },
  ENGLISH:       { gradient: 'from-green-500 to-teal-600',    emoji: '🇬🇧' },
  SCIENCE:       { gradient: 'from-cyan-500 to-teal-600',     emoji: '🔬' },
  PHYSICS:       { gradient: 'from-violet-600 to-indigo-700', emoji: '⚛️' },
  CHEMISTRY:     { gradient: 'from-lime-500 to-green-600',    emoji: '🧪' },
  BIOLOGY:       { gradient: 'from-emerald-500 to-teal-600',  emoji: '🧬' },
  HISTORY:       { gradient: 'from-amber-500 to-orange-500',  emoji: '🏰' },
  GEOGRAPHY:     { gradient: 'from-emerald-500 to-cyan-600',  emoji: '🌍' },
  INFORMATICS:   { gradient: 'from-sky-500 to-blue-600',      emoji: '💻' },
  ALGO:          { gradient: 'from-yellow-400 to-orange-500', emoji: '🤖' },
  SCRATCH:       { gradient: 'from-orange-400 to-pink-500',   emoji: '🐱' },
  PYTHON:        { gradient: 'from-teal-500 to-cyan-600',     emoji: '🐍' },
  CPP:           { gradient: 'from-violet-600 to-purple-700', emoji: '⚡' },
  IELTS:         { gradient: 'from-sky-500 to-blue-600',      emoji: '📝' },
  CAMBRIDGE:     { gradient: 'from-rose-500 to-fuchsia-600',  emoji: '🎓' },
  GENERAL:       { gradient: 'from-gray-600 to-slate-700',    emoji: '📚' },
}

const LEGACY_THEME: Record<string, { gradient: string; emoji: string }> = {
  TOAN:                 { gradient: 'from-purple-600 to-indigo-600', emoji: '📐' },
  TIENG_ANH:            { gradient: 'from-green-500 to-teal-600',    emoji: '🇬🇧' },
  LAP_TRINH_THUAT_TOAN: { gradient: 'from-yellow-400 to-orange-500', emoji: '🤖' },
  LAP_TRINH_SCRATCH:    { gradient: 'from-orange-400 to-pink-500',   emoji: '🐱' },
  LAP_TRINH_PYTHON:     { gradient: 'from-teal-500 to-cyan-600',     emoji: '🐍' },
  LAP_TRINH_CPP:        { gradient: 'from-violet-600 to-purple-700', emoji: '⚡' },
}

function getTheme(subjectCode: string | null, courseType: string | null) {
  if (subjectCode && K12_SUBJECT_THEME[subjectCode]) return K12_SUBJECT_THEME[subjectCode]
  if (courseType && LEGACY_THEME[courseType]) return LEGACY_THEME[courseType]
  return K12_SUBJECT_THEME.GENERAL
}

function getGradeLabel(pct: number) {
  if (pct >= 90) return { label: 'A — Xuất sắc', color: 'text-green-600', bg: 'bg-green-50' }
  if (pct >= 70) return { label: 'B — Giỏi', color: 'text-blue-600', bg: 'bg-blue-50' }
  if (pct >= 50) return { label: 'C — Khá', color: 'text-yellow-600', bg: 'bg-yellow-50' }
  return { label: 'D — Cần cố gắng', color: 'text-red-600', bg: 'bg-red-50' }
}

// ── Data loading ─────────────────────────────────────────────────────────────

async function getCourseData(courseId: string, userId: string) {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const [course, enrollment, todayAnswers, allAnswers] = await Promise.all([
    prisma.course.findFirst({
      where: { id: courseId, isActive: true },
      include: {
        subjects: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    }),
    prisma.studentAnswer.findMany({
      where: {
        userId,
        createdAt: { gte: todayStart },
        question: { subject: { courseId } },
      },
      select: { isCorrect: true },
    }),
    prisma.studentAnswer.findMany({
      where: {
        userId,
        question: { subject: { courseId } },
      },
      select: { isCorrect: true, score: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  return { course, enrollment, todayAnswers, allAnswers }
}

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const { id: courseId } = await params
  const userId = (session.user as { id: string }).id

  const { course, enrollment, todayAnswers, allAnswers } =
    await getCourseData(courseId, userId)

  if (!course) notFound()

  // Redirect if not enrolled (or not active)
  const isEnrolled =
    enrollment && ['ACTIVE', 'APPROVED'].includes(enrollment.status)

  if (!isEnrolled) {
    redirect(`/khoa-hoc/${courseId}`)
  }

  const theme = getTheme(
    (course as { subjectCode?: string }).subjectCode ?? null,
    (course as { courseType?: string }).courseType ?? null
  )

  // Stats
  const totalQuestionsInCourse = course.subjects.reduce(
    (sum, s) => sum + s._count.questions,
    0
  )
  const quizLimit = Math.min(20, totalQuestionsInCourse)

  const todayCorrect = todayAnswers.filter(a => a.isCorrect).length
  const todayTotal = todayAnswers.length
  const todayPct = quizLimit > 0 ? Math.round((todayTotal / quizLimit) * 100) : 0

  const allCorrect = allAnswers.filter(a => a.isCorrect).length
  const allTotal = allAnswers.length
  const allAccuracy = allTotal > 0 ? Math.round((allCorrect / allTotal) * 100) : 0

  // Recent quiz score (last 20 answers grouped by day)
  const recentByDay: Map<string, { correct: number; total: number; date: string }> = new Map()
  for (const ans of allAnswers) {
    const day = new Date(ans.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    })
    const prev = recentByDay.get(day) ?? { correct: 0, total: 0, date: day }
    recentByDay.set(day, {
      correct: prev.correct + (ans.isCorrect ? 1 : 0),
      total: prev.total + 1,
      date: day,
    })
  }
  const recentScores = Array.from(recentByDay.values()).slice(0, 5)

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 pt-20">
      {/* Hero Header */}
      <div className={`bg-gradient-to-br ${theme.gradient} text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/hoc-vien"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition"
          >
            <ArrowLeft size={16} />
            Bảng điều khiển
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">
              {theme.emoji}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black leading-tight">{course.name}</h1>
              {course.description && (
                <p className="text-white/75 text-sm mt-1 line-clamp-2">{course.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                  📚 {course.subjects.length} chuyên đề
                </span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                  ❓ {totalQuestionsInCourse} câu hỏi
                </span>
                <span className="text-xs bg-green-400/80 text-green-900 px-3 py-1 rounded-full font-bold">
                  ✅ Đang học
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ── Quiz CTA Card ──────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-6 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-indigo-300" />
                <h2 className="font-black text-lg">Làm bài kiểm tra</h2>
              </div>
              <p className="text-indigo-300 text-sm mb-4">
                {quizLimit} câu hỏi ngẫu nhiên • 15 phút • 20 XP/câu đúng
              </p>
              {/* Today progress */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-indigo-300 mb-1">
                  <span>Hôm nay</span>
                  <span>
                    {todayTotal}/{quizLimit} câu đã làm
                  </span>
                </div>
                <div className="bg-white/10 rounded-full h-2 overflow-hidden w-48">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all"
                    style={{ width: `${Math.min(100, todayPct)}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              href={`/hoc-vien/khoa-hoc/${courseId}/quiz`}
              className="shrink-0 bg-white text-indigo-800 font-black px-6 py-3 rounded-2xl hover:bg-indigo-50 transition active:scale-95 text-sm"
            >
              🎯 Làm bài kiểm tra →
            </Link>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Câu đúng hôm nay</span>
            </div>
            <div className="text-2xl font-black text-green-600">{todayCorrect}</div>
            <div className="text-xs text-gray-400">{todayTotal} đã làm</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Tỉ lệ chính xác</span>
            </div>
            <div className="text-2xl font-black text-purple-600">{allAccuracy}%</div>
            <div className="text-xs text-gray-400">{allTotal} tổng câu</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Chuyên đề</span>
            </div>
            <div className="text-2xl font-black text-blue-600">{course.subjects.length}</div>
            <div className="text-xs text-gray-400">{totalQuestionsInCourse} câu hỏi</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">Lần thi hôm nay</span>
            </div>
            <div className="text-2xl font-black text-yellow-600">
              {Math.floor(todayTotal / Math.max(quizLimit, 1))}
            </div>
            <div className="text-xs text-gray-400">lượt đã làm</div>
          </div>
        </div>

        {/* ── Recent Scores ──────────────────────────────────────── */}
        {recentScores.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Kết quả gần đây
            </h2>
            <div className="space-y-3">
              {recentScores.map((day, i) => {
                const pct =
                  day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0
                const { label, color, bg } = getGradeLabel(pct)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50"
                  >
                    <div className="text-sm font-black text-gray-500 w-20">{day.date}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">
                          {day.correct}/{day.total} câu đúng
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}>
                          {label}
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 90
                              ? 'bg-green-500'
                              : pct >= 70
                              ? 'bg-blue-500'
                              : pct >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-black text-gray-700 w-12 text-right">{pct}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Subject List ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Chuyên đề trong khoá học
            </h2>
            <Link
              href={`/khoa-hoc/${courseId}`}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              Xem tất cả →
            </Link>
          </div>

          {course.subjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="font-semibold">Chưa có chuyên đề nào</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {course.subjects.map((subject, idx) => {
                const colors = [
                  'from-purple-400 to-purple-600',
                  'from-indigo-400 to-indigo-600',
                  'from-blue-400 to-blue-600',
                  'from-teal-400 to-teal-600',
                  'from-green-400 to-green-600',
                  'from-pink-400 to-pink-600',
                ]
                const color = colors[idx % colors.length]
                return (
                  <Link
                    key={subject.id}
                    href={`/hoc-vien/khoa-hoc/${courseId}/${subject.id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition`}
                    >
                      {subject.icon ?? '📖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm line-clamp-1">
                        {subject.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {subject._count.questions} câu hỏi
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-purple-400 transition text-xs">→</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Quick actions ──────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href={`/hoc-vien/khoa-hoc/${courseId}/quiz`}
            className={`bg-gradient-to-br ${theme.gradient} text-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:opacity-90 active:scale-95 transition`}
          >
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-black">Kiểm tra</span>
          </Link>
          <Link
            href={`/hoc-vien/khoa-hoc/${courseId}/bai-tap`}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:opacity-90 active:scale-95 transition"
          >
            <span className="text-2xl">📝</span>
            <span className="text-xs font-black">Bài tập</span>
          </Link>
          <Link
            href="/hoc-vien/gamification"
            className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:opacity-90 active:scale-95 transition"
          >
            <span className="text-2xl">🏅</span>
            <span className="text-xs font-black">Thành tích</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
