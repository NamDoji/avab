import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubjectTabs } from '@/components/courses/SubjectTabs'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const COURSE_TYPE_HEADER: Record<CourseType, { gradient: string; mascot: string }> = {
  TOAN:                 { gradient: 'from-purple-600 via-indigo-600 to-blue-600', mascot: '🦊' },
  TIENG_ANH:            { gradient: 'from-green-500 via-teal-500 to-cyan-600',    mascot: '🦜' },
  LAP_TRINH_THUAT_TOAN: { gradient: 'from-yellow-400 via-orange-500 to-red-500',  mascot: '🤖' },
  LAP_TRINH_SCRATCH:    { gradient: 'from-orange-400 via-pink-500 to-rose-600',   mascot: '🐱' },
  LAP_TRINH_PYTHON:     { gradient: 'from-teal-500 via-cyan-500 to-blue-600',     mascot: '🐍' },
  LAP_TRINH_CPP:        { gradient: 'from-violet-600 via-purple-700 to-indigo-800', mascot: '⚡' },
}

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; subjectId: string }>
}) {
  const { id: courseId, subjectId } = await params
  const session = await auth()
  if (!session) redirect('/dang-nhap')

  const [subject, course] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        materials: { orderBy: { type: 'asc' } },
        questions: { orderBy: { order: 'asc' } },
        course: { select: { id: true, name: true, courseType: true } },
      },
    }).catch(() => null),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, name: true, courseType: true },
    }).catch(() => null),
  ])

  if (!subject || !course) notFound()

  const cType = ((course as any).courseType as CourseType) ?? 'TOAN'
  const header = COURSE_TYPE_HEADER[cType] ?? COURSE_TYPE_HEADER.TOAN

  const userId = (session.user as any).id

  // Lịch sử trả lời của user
  const userAnswers = await prisma.studentAnswer.findMany({
    where: { userId, subjectId },
    select: { questionId: true, answer: true, isCorrect: true, score: true },
  }).catch(() => [])

  // Top 5 học sinh cao điểm nhất chuyên đề
  const top5 = await prisma.studentAnswer.groupBy({
    by: ['userId'],
    where: { subjectId },
    _sum: { score: true },
    orderBy: { _sum: { score: 'desc' } },
    take: 5,
  }).catch(() => [])

  const top5UserIds = top5.map((t) => t.userId)
  const top5Users = await prisma.user.findMany({
    where: { id: { in: top5UserIds } },
    select: { id: true, name: true },
  }).catch(() => [])

  const top5Data = top5.map((t, idx) => ({
    rank: idx + 1,
    userId: t.userId,
    name: top5Users.find((u) => u.id === t.userId)?.name || 'Học viên',
    score: t._sum.score || 0,
    isMe: t.userId === userId,
  }))

  const answersMap = Object.fromEntries(userAnswers.map((a) => [a.questionId, a]))

  // Điểm cao nhất chưyên đề hiện tại
  const mySubjectScore = userAnswers.reduce((sum, a) => sum + (a.score || 0), 0)

  // Tổng điểm tất cả chưyên đề trong khoá (sum of best score per subject)
  // Lấy tất cả subjectId trong khoá để tính tổng điểm
  const courseSubjects = await prisma.subject.findMany({
    where: { courseId },
    select: { id: true },
  }).catch(() => [])
  const courseSubjectIds = courseSubjects.map(s => s.id)

  const allMyScores = await prisma.studentAnswer.groupBy({
    by: ['subjectId'],
    where: { userId, subjectId: { in: courseSubjectIds } },
    _sum: { score: true },
  }).catch(() => [])
  const myTotalScore = allMyScores.reduce((sum, s) => sum + (s._sum.score || 0), 0)

  // Tổng điểm tối đa có thể (để hiển thị %)
  const maxPossible = await prisma.question.aggregate({
    where: { subjectId: { in: courseSubjectIds } },
    _sum: { points: true },
  }).catch(() => ({ _sum: { points: 0 } }))
  const maxScore = maxPossible._sum.points || 0

  // Tính số câu đã làm / tổng
  const doneCount = userAnswers.filter(a => a.isCorrect).length
  const totalQ = subject.questions.length
  const progressPct = totalQ > 0 ? Math.round(doneCount / totalQ * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Header — child-friendly gradient */}
      <div className={`bg-gradient-to-br ${header.gradient} text-white`}>
        <div className="container-custom py-8 md:py-10">
          <Link
            href={`/khoa-hoc/${courseId}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            {course.name}
          </Link>

          <div className="flex items-center gap-4">
            {/* Subject icon — big */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl md:text-4xl shadow-xl shrink-0">
              {subject.icon || header.mascot}
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-black leading-tight">{subject.name}</h1>
              <p className="text-white/70 text-sm mt-1">
                {totalQ} câu hỏi · Chuyên đề {subject.order}
              </p>
              {/* Progress bar */}
              {totalQ > 0 && (
                <div className="mt-3 max-w-xs">
                  <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                    <span>Tiến độ</span>
                    <span>{progressPct}% ({doneCount}/{totalQ} câu đúng)</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 max-w-4xl">
        <SubjectTabs
          subject={{
            id: subject.id,
            name: subject.name,
            courseId,
          }}
          courseType={cType}
          materials={subject.materials}
          questions={subject.questions.map((q) => ({
            id: q.id,
            order: q.order,
            questionType: (q as any).questionType ?? 'OPEN',
            content: q.content,
            imageUrl: (q as any).imageUrl ?? undefined,
            audioUrl: (q as any).audioUrl ?? undefined,
            options: (q as any).options ?? undefined,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? undefined,
            points: q.points,
          }))}
          answersMap={answersMap}
          top5={top5Data}
          userId={userId}
          userName={session.user?.name || 'Học viên'}
          mySubjectScore={mySubjectScore}
          myTotalScore={myTotalScore}
          maxScore={maxScore}
        />
      </div>
    </div>
  )
}
