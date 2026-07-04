import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type AllowedRole = 'ADMIN' | 'TEACHER'

function isAllowed(role: string | undefined): role is AllowedRole {
  return role === 'ADMIN' || role === 'TEACHER'
}

// GET /api/admin/homework/submissions?subjectId=xxx
// → List submissions with student info for a given subject
export async function GET(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || !isAllowed(role)) {
    return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')

  try {
    const where = subjectId ? { subjectId } : {}

    const submissions = await prisma.homeworkSubmission.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
        subject: {
          select: { id: true, name: true, courseId: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 200,
    })

    return NextResponse.json({ success: true, data: submissions })
  } catch (error) {
    console.error('[admin/homework/submissions GET] error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi server' }, { status: 500 })
  }
}

// PATCH /api/admin/homework/submissions
// Body: { id, score, feedback, status: 'graded' }
export async function PATCH(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || !isAllowed(role)) {
    return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json() as {
      id: string
      score?: number
      feedback?: string
      status?: string
    }

    const { id, score, feedback, status = 'graded' } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu id bài nộp' }, { status: 400 })
    }

    const submission = await prisma.homeworkSubmission.findUnique({ where: { id } })
    if (!submission) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bài nộp' }, { status: 404 })
    }

    const updated = await prisma.homeworkSubmission.update({
      where: { id },
      data: {
        score: score !== undefined ? score : submission.score,
        feedback: feedback !== undefined ? feedback : submission.feedback,
        status,
        gradedAt: new Date(),
        gradedBy: userId,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[admin/homework/submissions PATCH] error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi server' }, { status: 500 })
  }
}
