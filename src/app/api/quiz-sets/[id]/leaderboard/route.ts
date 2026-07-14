import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id: quizSetId } = await params

  // Get quiz set to find subject → course
  const quizSet = await prisma.quizSet.findUnique({
    where: { id: quizSetId },
    select: { subjectId: true, questions: { select: { id: true } } },
  })
  if (!quizSet) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  const subject = await prisma.subject.findUnique({
    where: { id: quizSet.subjectId },
    select: { courseId: true },
  })
  if (!subject) return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 })

  // Get all enrolled students
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: subject.courseId, status: 'ACTIVE' },
    select: { userId: true },
  })
  const enrolledUserIds = enrollments.map(e => e.userId)

  const enrolledUsers = await prisma.user.findMany({
    where: { id: { in: enrolledUserIds } },
    select: { id: true, name: true },
  })

  // Get all attempts for this quiz
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizSetId },
    select: { userId: true, score: true, maxScore: true, submittedAt: true },
    orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
  })

  const attemptMap = new Map(attempts.map(a => [a.userId, a]))
  const maxScore = quizSet.questions.length * 10

  // Build ranked list (submitted students first, then absent)
  const submitted = attempts
    .filter(a => enrolledUserIds.includes(a.userId))
    .map((a, idx) => {
      const user = enrolledUsers.find(u => u.id === a.userId)
      return {
        rank: idx + 1,
        userId: a.userId,
        name: user?.name ?? 'Học viên',
        score: a.score,
        maxScore: a.maxScore || maxScore,
        submittedAt: a.submittedAt?.toISOString() ?? null,
        status: 'submitted' as const,
      }
    })

  // Students who didn't submit = absent
  const absentUsers = enrolledUsers
    .filter(u => !attemptMap.has(u.id))
    .map(u => ({
      rank: 0,
      userId: u.id,
      name: u.name ?? 'Học viên',
      score: null,
      maxScore,
      submittedAt: null,
      status: 'absent' as const,
    }))

  const leaderboard = [...submitted, ...absentUsers]

  return NextResponse.json({ success: true, data: { leaderboard } })
}
