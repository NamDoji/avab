import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SCORE_CORRECT = 10
const SCORE_WRONG = 2
const SCORE_SKIP = 0

function matchAnswer(selected: string | null, correctKey: string, hasOptions: boolean): boolean {
  if (!selected) return false
  if (hasOptions) return selected.trim().toUpperCase() === correctKey.trim().toUpperCase()
  // Open-ended: loose match
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  return norm(selected) === norm(correctKey)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id: quizSetId } = await params
  const userId = (session.user as any).id
  const { answers } = await req.json() as {
    answers: Array<{ questionId: string; selectedKey: string | null }>
  }

  // Check quiz is open
  const quizSet = await prisma.quizSet.findUnique({
    where: { id: quizSetId },
    include: { questions: true },
  })
  if (!quizSet) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  if (quizSet.status !== 'open') {
    return NextResponse.json({ success: false, error: 'Quiz không còn mở' }, { status: 400 })
  }

  // Check no existing attempt
  const existing = await prisma.quizAttempt.findUnique({
    where: { quizSetId_userId: { quizSetId, userId } },
  })
  if (existing) {
    return NextResponse.json({ success: false, error: 'Bạn đã nộp bài rồi' }, { status: 400 })
  }

  const questionMap = new Map(quizSet.questions.map(q => [q.id, q]))

  // Grade answers
  let totalScore = 0
  const gradedAnswers: Array<{
    questionId: string; selectedKey: string | null; isCorrect: boolean; score: number
  }> = answers.map(a => {
    const q = questionMap.get(a.questionId)
    if (!q) return { questionId: a.questionId, selectedKey: a.selectedKey, isCorrect: false, score: SCORE_SKIP }
    const hasOptions = Array.isArray(q.options) && (q.options as any[]).length > 0
    const isCorrect = matchAnswer(a.selectedKey, q.correctKey, hasOptions)
    const score = a.selectedKey === null ? SCORE_SKIP : isCorrect ? SCORE_CORRECT : SCORE_WRONG
    totalScore += score
    return { questionId: a.questionId, selectedKey: a.selectedKey, isCorrect, score }
  })

  const maxScore = quizSet.questions.length * SCORE_CORRECT

  // Create attempt + answers
  const attempt = await prisma.quizAttempt.create({
    data: {
      quizSetId,
      userId,
      score: totalScore,
      maxScore,
      submittedAt: new Date(),
      answers: {
        create: gradedAnswers.map(a => ({
          questionId: a.questionId,
          selectedKey: a.selectedKey,
          isCorrect: a.isCorrect,
          score: a.score,
        })),
      },
    },
    include: { answers: true },
  })

  return NextResponse.json({
    success: true,
    data: {
      id: attempt.id,
      score: attempt.score,
      maxScore: attempt.maxScore,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers,
    },
  })
}
