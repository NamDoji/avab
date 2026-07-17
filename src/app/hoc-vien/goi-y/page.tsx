import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, Lightbulb, AlertTriangle, BookOpen, Play, RotateCcw } from 'lucide-react'

export const metadata = { title: 'Gợi ý học tập — AvaB' }

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item)
    ;(acc[k] ??= []).push(item)
    return acc
  }, {})
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getRecommendationData(userId: string) {
  const [wrongAnswers, enrollments, lastAnswers] = await Promise.all([
    // Top 50 wrong answers with subject + course context
    prisma.studentAnswer.findMany({
      where: { userId, isCorrect: false },
      include: {
        question: {
          include: {
            subject: {
              include: {
                course: { select: { id: true, name: true, courseType: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    // Active enrollments for "continue from" logic
    prisma.enrollment.findMany({
      where: { userId, status: { in: ['ACTIVE', 'APPROVED'] } },
      include: {
        course: {
          include: {
            subjects: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: { _count: { select: { questions: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Last answered subject → "Tiếp tục từ chỗ bỏ"
    prisma.studentAnswer.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
          include: {
            subject: {
              include: {
                course: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    }),
  ])

  // ── Weak subjects: top 3 by error count ──────────────────────────────
  const grouped = groupBy(wrongAnswers, a => a.question.subjectId)
  const weakSubjects = Object.entries(grouped)
    .map(([subjectId, answers]) => ({
      subjectId,
      subjectName: answers[0]?.question.subject?.name ?? 'Không rõ',
      courseId: answers[0]?.question.subject?.course?.id ?? '',
      courseName: answers[0]?.question.subject?.course?.name ?? '',
      errorCount: answers.length,
      lastError: answers[0]?.createdAt ?? new Date(),
    }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 3)

  // ── Last viewed subject ───────────────────────────────────────────────
  const lastSubject = lastAnswers?.question.subject
    ? {
        subjectId: lastAnswers.question.subjectId,
        subjectName: lastAnswers.question.subject.name,
        courseId: lastAnswers.question.subject.course?.id ?? '',
        courseName: lastAnswers.question.subject.course?.name ?? '',
      }
    : null

  // ── Recommended subjects: subjects with questions not yet answered ────
  const answeredSubjectIds = new Set(
    (await prisma.studentAnswer.findMany({
      where: { userId },
      select: { subjectId: true },
      distinct: ['subjectId'],
    })).map(a => a.subjectId)
  )

  const recommended: { subjectId: string; subjectName: string; courseId: string; courseName: string; questionCount: number }[] = []
  for (const enrollment of enrollments) {
    for (const subject of enrollment.course.subjects) {
      if (!answeredSubjectIds.has(subject.id) && subject._count.questions > 0) {
        recommended.push({
          subjectId: subject.id,
          subjectName: subject.name,
          courseId: enrollment.course.id,
          courseName: enrollment.course.name,
          questionCount: subject._count.questions,
        })
        if (recommended.length >= 4) break
      }
    }
    if (recommended.length >= 4) break
  }

  return { weakSubjects, lastSubject, recommended, totalWrong: wrongAnswers.length }
}

// ── Severity color ────────────────────────────────────────────────────────────

function errorBadge(count: number) {
  if (count >= 10) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: '🔴 Cần ôn gấp' }
  if (count >= 5)  return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: '🟠 Cần ôn thêm' }
  return                  { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: '🟡 Ôn lại một chút' }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GoiYPage() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const userId = (session.user as { id: string }).id
  const { weakSubjects, lastSubject, recommended, totalWrong } = await getRecommendationData(userId)

  const hasData = weakSubjects.length > 0 || lastSubject || recommended.length > 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/hoc-vien" className="p-2 rounded-xl hover:bg-white transition text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Gợi ý học tập dành cho bạn
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Dựa trên kết quả học tập của bạn</p>
          </div>
        </div>

        {!hasData ? (
          /* ── Empty state ─────────────────────────────────────── */
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <span className="text-6xl block mb-4">🎯</span>
            <h2 className="text-xl font-black text-gray-800 mb-2">Chưa có đủ dữ liệu</h2>
            <p className="text-gray-500 text-sm mb-6">Làm thêm các bài quiz để nhận gợi ý cá nhân hoá nhé!</p>
            <Link
              href="/hoc-vien"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-black text-sm transition"
            >
              <BookOpen className="w-4 h-4" />
              Bắt đầu ôn tập
            </Link>
          </div>
        ) : (
          <div className="space-y-5">

            {/* ── Continue from last ─────────────────────────── */}
            {lastSubject && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-cherry-100">
                <p className="text-xs font-bold text-cherry-500 uppercase tracking-wider mb-3">
                  ▶ Tiếp tục từ chỗ bỏ
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cherry-100 flex items-center justify-center shrink-0 text-2xl">
                    📖
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 truncate">{lastSubject.subjectName}</p>
                    <p className="text-xs text-gray-400 truncate">{lastSubject.courseName}</p>
                  </div>
                  <Link
                    href={`/khoa-hoc/${lastSubject.courseId}`}
                    className="shrink-0 flex items-center gap-1.5 bg-cherry-600 hover:bg-cherry-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Tiếp tục
                  </Link>
                </div>
              </div>
            )}

            {/* ── Weak areas ─────────────────────────────────── */}
            {weakSubjects.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <h2 className="font-black text-gray-900">Bạn cần ôn thêm</h2>
                    <p className="text-xs text-gray-400">
                      {totalWrong} câu sai gần đây — tập trung vào các môn này
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {weakSubjects.map(ws => {
                    const badge = errorBadge(ws.errorCount)
                    return (
                      <div
                        key={ws.subjectId}
                        className={`flex items-center gap-4 p-4 rounded-2xl border ${badge.bg} ${badge.border}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`font-black truncate ${badge.text}`}>{ws.subjectName}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{ws.courseName}</p>
                          <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label} · {ws.errorCount} câu sai
                          </span>
                        </div>
                        {ws.courseId && (
                          <Link
                            href={`/khoa-hoc/${ws.courseId}`}
                            className="shrink-0 flex items-center gap-1.5 bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-700 px-3 py-2 rounded-xl font-bold text-xs transition shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Ôn lại
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Recommended new subjects ────────────────────── */}
            {recommended.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🚀</span>
                  <div>
                    <h2 className="font-black text-gray-900">Chuyên đề chưa học</h2>
                    <p className="text-xs text-gray-400">Khám phá kiến thức mới</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {recommended.map((sub, idx) => (
                    <Link
                      key={sub.subjectId}
                      href={`/khoa-hoc/${sub.courseId}`}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate group-hover:text-amber-700">
                          {sub.subjectName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{sub.courseName}</p>
                        <p className="text-xs text-amber-600 font-semibold mt-0.5">
                          {sub.questionCount} câu hỏi
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── CTA: AI Tutor ───────────────────────────────── */}
            <div
              className="rounded-3xl p-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg,#6366f1 0%,#BE3659 100%)' }}
            >
              <span className="text-4xl shrink-0">🤖</span>
              <div className="flex-1">
                <p className="font-black text-white text-sm">Cần giải thích thêm?</p>
                <p className="text-cherry-200 text-xs mt-0.5">
                  Gia sư AI sẵn sàng giải đáp mọi thắc mắc
                </p>
              </div>
              <Link
                href="/hoc-vien/ai-tutor"
                className="shrink-0 bg-white text-cherry-700 font-black px-4 py-2 rounded-xl text-xs hover:bg-cherry-50 transition"
              >
                Hỏi ngay →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
