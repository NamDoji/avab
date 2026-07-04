import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SubmitBody {
  subjectId: string
  materialId?: string
  content: string
  answers?: string[]
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  try {
    const body: SubmitBody = await req.json()
    const { subjectId, materialId, content, answers = [] } = body

    if (!subjectId || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Thiếu subjectId hoặc nội dung bài làm' },
        { status: 400 }
      )
    }

    // Verify subject exists and student is enrolled in course
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, courseId: true, name: true },
    })

    if (!subject) {
      return NextResponse.json({ success: false, error: 'Chuyên đề không tồn tại' }, { status: 404 })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: subject.courseId } },
    })

    if (!enrollment || !['ACTIVE', 'APPROVED'].includes(enrollment.status)) {
      return NextResponse.json(
        { success: false, error: 'Bạn chưa đăng ký khoá học này' },
        { status: 403 }
      )
    }

    // Build content: merge text + answers array
    const finalContent =
      answers.length > 0
        ? JSON.stringify({ text: content, answers })
        : content

    // Upsert submission (one submission per student per subject)
    const existing = await prisma.homeworkSubmission.findFirst({
      where: { studentId: userId, subjectId },
    })

    let submission
    if (existing && existing.status === 'submitted') {
      // Allow re-submit while not yet graded
      submission = await prisma.homeworkSubmission.update({
        where: { id: existing.id },
        data: {
          content: finalContent,
          materialId: materialId ?? existing.materialId,
          submittedAt: new Date(),
          status: 'submitted',
        },
      })
    } else if (!existing) {
      submission = await prisma.homeworkSubmission.create({
        data: {
          studentId: userId,
          subjectId,
          materialId: materialId ?? null,
          content: finalContent,
          status: 'submitted',
        },
      })
    } else {
      // Already graded — reject re-submission
      return NextResponse.json(
        { success: false, error: 'Bài đã được chấm. Không thể nộp lại.' },
        { status: 409 }
      )
    }

    // Update UserStats (lessonsViewed++)
    await prisma.userStats.upsert({
      where: { userId },
      create: { userId, lessonsViewed: 1 },
      update: { lessonsViewed: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    })
  } catch (error) {
    console.error('[student/homework/submit] error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi server' }, { status: 500 })
  }
}
