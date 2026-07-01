import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

// POST: Create a new question
export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json()
    const { subjectId, questionType = 'OPEN', content, imageUrl, audioUrl, options, correctAnswer, explanation, points = 1, order } = body

    if (!subjectId || !content || !correctAnswer) {
      return NextResponse.json(
        { success: false, error: 'subjectId, content và correctAnswer là bắt buộc' },
        { status: 400 }
      )
    }

    // Auto-assign order if not provided
    let finalOrder = order
    if (finalOrder === undefined || finalOrder === null) {
      const last = await prisma.question.findFirst({
        where: { subjectId },
        orderBy: { order: 'desc' },
        select: { order: true },
      })
      finalOrder = (last?.order ?? 0) + 1
    }

    const question = await prisma.question.create({
      data: {
        subjectId,
        questionType,
        content,
        imageUrl,
        audioUrl,
        options: options ?? undefined,
        correctAnswer,
        explanation,
        points,
        order: finalOrder,
      },
    })

    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo câu hỏi' }, { status: 500 })
  }
}
