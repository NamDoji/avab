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

// GET: Fetch all questions for a subject
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { subjectId } = await params
    const { searchParams } = new URL(request.url)
    const typeFilter = searchParams.get('type')
    const diffFilter = searchParams.get('difficulty') // easy/medium/hard

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        course: { select: { id: true, name: true, code: true, grade: true } },
      },
    })
    if (!subject) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy chủ đề' }, { status: 404 })
    }

    // Build question filter
    const questionWhere: any = { subjectId }
    if (typeFilter) questionWhere.questionType = typeFilter
    if (diffFilter) {
      // difficulty based on points
      if (diffFilter === 'easy') questionWhere.points = { lte: 1 }
      else if (diffFilter === 'medium') questionWhere.points = { gte: 2, lte: 3 }
      else if (diffFilter === 'hard') questionWhere.points = { gte: 4 }
    }

    const questions = await prisma.question.findMany({
      where: questionWhere,
      orderBy: { order: 'asc' },
    })

    // Stats
    const allQuestions = await prisma.question.findMany({
      where: { subjectId },
      select: { questionType: true, points: true },
    })

    const byType = allQuestions.reduce<Record<string, number>>((acc, q) => {
      acc[q.questionType] = (acc[q.questionType] ?? 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        subject,
        questions,
        stats: {
          total: allQuestions.length,
          byType,
          easy: allQuestions.filter(q => q.points <= 1).length,
          medium: allQuestions.filter(q => q.points >= 2 && q.points <= 3).length,
          hard: allQuestions.filter(q => q.points >= 4).length,
        },
      },
    })
  } catch (error) {
    console.error('Question bank subject fetch error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải dữ liệu' }, { status: 500 })
  }
}
