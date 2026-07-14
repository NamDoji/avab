import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = (session.user as any).id

  const quizSet = await prisma.quizSet.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: 'asc' } } },
  })

  if (!quizSet) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  // Ẩn đáp án nếu quiz chưa closed
  const isClosed = quizSet.status === 'closed'
  const questions = quizSet.questions.map(q => ({
    ...q,
    correctKey: isClosed ? q.correctKey : '',
    explanation: isClosed ? q.explanation : null,
  }))

  // Lấy attempt của user này (nếu có)
  const myAttempt = await prisma.quizAttempt.findUnique({
    where: { quizSetId_userId: { quizSetId: id, userId } },
    include: { answers: true },
  }).catch(() => null)

  return NextResponse.json({
    success: true,
    data: { quizSet: { ...quizSet, questions }, myAttempt: myAttempt ?? undefined },
  })
}
