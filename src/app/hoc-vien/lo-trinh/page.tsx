import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, MapPin, CheckCircle2, Circle, Lock } from 'lucide-react'

export const metadata = { title: 'Lộ trình học tập — AvaB' }

// ── Course type meta ──────────────────────────────────────────────────────────

const COURSE_META: Record<string, { emoji: string; gradient: string; accent: string }> = {
  THINKING_MATH: { emoji: '🧠', gradient: 'from-cherry-500 to-cherry-600', accent: '#6366f1' },
  MATH:          { emoji: '📐', gradient: 'from-blue-500 to-cherry-600',   accent: '#3b82f6' },
  TOAN:          { emoji: '📐', gradient: 'from-blue-500 to-cherry-600',   accent: '#3b82f6' },
  VIETNAMESE:    { emoji: '📖', gradient: 'from-red-500 to-orange-500',    accent: '#ef4444' },
  ENGLISH:       { emoji: '🇬🇧', gradient: 'from-green-400 to-teal-600',   accent: '#10b981' },
  TIENG_ANH:     { emoji: '🇬🇧', gradient: 'from-green-400 to-teal-600',   accent: '#10b981' },
  SCIENCE:       { emoji: '🔬', gradient: 'from-cyan-500 to-teal-600',     accent: '#06b6d4' },
  PHYSICS:       { emoji: '⚛️', gradient: 'from-cherry-500 to-cherry-700', accent: '#BE3659' },
  CHEMISTRY:     { emoji: '🧪', gradient: 'from-lime-500 to-green-600',    accent: '#84cc16' },
  BIOLOGY:       { emoji: '🧬', gradient: 'from-emerald-500 to-teal-600',  accent: '#10b981' },
  ALGO:          { emoji: '🤖', gradient: 'from-yellow-400 to-orange-500', accent: '#f59e0b' },
  PYTHON:        { emoji: '🐍', gradient: 'from-teal-400 to-cyan-600',     accent: '#14b8a6' },
  CPP:           { emoji: '⚡', gradient: 'from-cherry-500 to-cherry-700', accent: '#951F3D' },
  SCRATCH:       { emoji: '🐱', gradient: 'from-orange-400 to-pink-500',   accent: '#f97316' },
  IELTS:         { emoji: '📝', gradient: 'from-sky-500 to-blue-600',      accent: '#0ea5e9' },
  CAMBRIDGE:     { emoji: '🎓', gradient: 'from-rose-500 to-pink-600',     accent: '#f43f5e' },
  GENERAL:       { emoji: '📚', gradient: 'from-gray-500 to-slate-600',    accent: '#6b7280' },
}

function getCourseMeta(courseType: string | null) {
  return COURSE_META[courseType ?? ''] ?? COURSE_META.GENERAL
}

// ── Subject node status ───────────────────────────────────────────────────────

type SubjectStatus = 'done' | 'in_progress' | 'locked'

function getSubjectStatus(
  subjectId: string,
  answeredIds: Set<string>,
  index: number
): SubjectStatus {
  if (answeredIds.has(subjectId)) return 'done'
  // Unlock first unanswered subject, lock the rest
  const isNext = index === 0 || [...answeredIds].length > 0
  return isNext ? 'in_progress' : 'locked'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LoTrinhPage() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const userId = (session.user as { id: string }).id

  // ── Fetch data ────────────────────────────────────────────────────────
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { in: ['ACTIVE', 'APPROVED'] } },
    include: {
      course: {
        include: {
          subjects: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              materials: {
                where: { type: 'THEORY' },
                select: { id: true },
              },
              questions: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Which subjects has this student answered?
  const answeredSubjectIds = new Set(
    (
      await prisma.studentAnswer.findMany({
        where: { userId },
        select: { subjectId: true },
        distinct: ['subjectId'],
      })
    ).map(a => a.subjectId)
  )

  if (enrollments.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/hoc-vien" className="p-2 rounded-xl hover:bg-white transition text-gray-500">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-teal-500" />
              Lộ trình học tập
            </h1>
          </div>
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <span className="text-6xl block mb-4">🗺️</span>
            <h2 className="text-xl font-black text-gray-800 mb-2">Chưa có lộ trình</h2>
            <p className="text-gray-500 text-sm mb-6">
              Đăng ký khoá học để nhận lộ trình học tập cá nhân hoá!
            </p>
            <Link
              href="/khoa-hoc"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-sm transition"
            >
              📚 Xem khoá học
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/hoc-vien" className="p-2 rounded-xl hover:bg-white transition text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-teal-500" />
              Lộ trình học tập
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {enrollments.length} khoá học đang theo học
            </p>
          </div>
        </div>

        {/* ── Per-course roadmap ───────────────────────────── */}
        <div className="space-y-6">
          {enrollments.map(enrollment => {
            const course = enrollment.course
            const meta = getCourseMeta(course.courseType)
            const subjects = course.subjects
            const doneCount = subjects.filter(s => answeredSubjectIds.has(s.id)).length
            const total = subjects.length
            const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0

            // Next recommended subject (first not done with questions)
            const nextSubject = subjects.find(
              s => !answeredSubjectIds.has(s.id) && s.questions.length > 0
            )

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Course header */}
                <div className={`bg-gradient-to-r ${meta.gradient} p-5`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-black text-white text-lg leading-snug truncate">
                        {course.name}
                      </h2>
                      <p className="text-white/70 text-xs mt-0.5">
                        {doneCount}/{total} chuyên đề hoàn thành
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-3xl font-black text-white">{progressPct}%</div>
                      <div className="text-white/60 text-xs">tiến độ</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 bg-white/20 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Subject roadmap */}
                {subjects.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">
                    Khoá học chưa có chuyên đề nào
                  </div>
                ) : (
                  <div className="p-5">
                    {/* Next step banner */}
                    {nextSubject && (
                      <div
                        className="flex items-center gap-3 p-3 rounded-2xl mb-5 border"
                        style={{
                          background: `${meta.accent}10`,
                          borderColor: `${meta.accent}30`,
                        }}
                      >
                        <span className="text-xl shrink-0">🎯</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-500">Bước tiếp theo</p>
                          <p className="font-black text-gray-800 truncate">{nextSubject.name}</p>
                          <p className="text-xs text-gray-400">
                            {nextSubject.questions.length} câu hỏi · {nextSubject.materials.length} tài liệu lý thuyết
                          </p>
                        </div>
                        <Link
                          href={`/khoa-hoc/${course.id}`}
                          className="shrink-0 text-xs font-black px-3 py-1.5 rounded-xl text-white transition"
                          style={{ background: meta.accent }}
                        >
                          Học ngay →
                        </Link>
                      </div>
                    )}

                    {/* Vertical roadmap */}
                    <div className="relative">
                      {subjects.map((subject, idx) => {
                        const isDone      = answeredSubjectIds.has(subject.id)
                        const isNext      = !isDone && subject.id === nextSubject?.id
                        const isLocked    = !isDone && !isNext
                        const isLast      = idx === subjects.length - 1

                        return (
                          <div key={subject.id} className="flex gap-4">
                            {/* Node column */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isDone
                                    ? 'bg-green-500 shadow-md shadow-green-200'
                                    : isNext
                                    ? 'bg-white border-2 shadow-md'
                                    : 'bg-gray-100 border border-gray-200'
                                }`}
                                style={isNext ? { borderColor: meta.accent } : {}}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : isNext ? (
                                  <Circle
                                    className="w-4 h-4"
                                    style={{ color: meta.accent }}
                                  />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </div>
                              {!isLast && (
                                <div
                                  className={`w-0.5 flex-1 my-1 min-h-[24px] ${
                                    isDone ? 'bg-green-300' : 'bg-gray-200'
                                  }`}
                                />
                              )}
                            </div>

                            {/* Content column */}
                            <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                              <div
                                className={`flex items-center gap-2 p-3 rounded-2xl transition ${
                                  isDone
                                    ? 'bg-green-50 border border-green-100'
                                    : isNext
                                    ? 'bg-white border shadow-sm'
                                    : 'bg-gray-50 border border-gray-100'
                                }`}
                                style={isNext ? { borderColor: `${meta.accent}40` } : {}}
                              >
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`font-bold text-sm truncate ${
                                      isDone
                                        ? 'text-green-800'
                                        : isNext
                                        ? 'text-gray-900'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {idx + 1}. {subject.name}
                                  </p>
                                  <div className="flex gap-2 mt-0.5">
                                    {subject.questions.length > 0 && (
                                      <span
                                        className={`text-xs font-semibold ${
                                          isDone ? 'text-green-600' : isNext ? 'text-gray-500' : 'text-gray-300'
                                        }`}
                                      >
                                        📝 {subject.questions.length} câu hỏi
                                      </span>
                                    )}
                                    {subject.materials.length > 0 && (
                                      <span
                                        className={`text-xs font-semibold ${
                                          isDone ? 'text-green-600' : isNext ? 'text-gray-500' : 'text-gray-300'
                                        }`}
                                      >
                                        📖 {subject.materials.length} lý thuyết
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isDone && (
                                  <span className="text-xs font-bold text-green-600 shrink-0">✅ Xong</span>
                                )}
                                {isNext && (
                                  <Link
                                    href={`/khoa-hoc/${course.id}`}
                                    className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-xl text-white transition"
                                    style={{ background: meta.accent }}
                                  >
                                    Học →
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Completion celebration */}
                    {progressPct === 100 && (
                      <div className="mt-4 text-center py-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100">
                        <span className="text-3xl">🎉</span>
                        <p className="font-black text-green-700 mt-1">Hoàn thành toàn bộ khoá học!</p>
                        <p className="text-xs text-green-500">Tuyệt vời! Bạn đã học hết tất cả chuyên đề.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
