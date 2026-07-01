import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubjectTabs } from '@/components/courses/SubjectTabs'

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
        course: { select: { id: true, name: true } },
      },
    }).catch(() => null),
    prisma.course.findUnique({ where: { id: courseId }, select: { id: true, name: true } }).catch(() => null),
  ])

  if (!subject || !course) notFound()

  const userId = (session.user as any).id

  // Lấy lịch sử trả lời của user
  const userAnswers = await prisma.studentAnswer.findMany({
    where: { userId, subjectId },
    select: { questionId: true, answer: true, isCorrect: true, score: true },
  }).catch(() => [])

  // Top 5 học sinh cao điểm nhất chuyên đề này
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

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="gradient-hero text-white py-10">
        <div className="container-custom">
          <Link
            href={`/khoa-hoc/${courseId}`}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-3 text-sm transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            {course.name}
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{subject.icon || '📖'}</span>
            <div>
              <h1 className="text-xl md:text-3xl font-black">{subject.name}</h1>
              <p className="text-white/70 text-sm mt-0.5">
                {subject.questions.length} câu hỏi · Chuyên đề {subject.order}
              </p>
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
          materials={subject.materials}
          questions={subject.questions.map((q) => ({
            id: q.id,
            order: q.order,
            content: q.content,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? undefined,
            points: q.points,
          }))}
          answersMap={answersMap}
          top5={top5Data}
          userId={userId}
          userName={session.user?.name || 'Học viên'}
        />
      </div>
    </div>
  )
}
