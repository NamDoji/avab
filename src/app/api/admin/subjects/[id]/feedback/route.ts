import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

// GET: Danh sách session feedback của 1 chuyên đề
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: subjectId } = await params

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      course: { select: { id: true, name: true, paymentType: true, grade: true } },
    },
  })
  if (!subject) return NextResponse.json({ success: false, error: 'Không tìm thấy chuyên đề' }, { status: 404 })

  const feedbacks = await prisma.sessionFeedback.findMany({
    where: { subjectId },
    orderBy: { sessionDate: 'desc' },
    include: {
      _count: { select: { records: true } },
      records: { select: { attendance: true, aiComment: true } },
    },
  })

  // Lấy danh sách học viên đăng ký khoá học này
  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: subject.courseId,
      status: { in: ['ACTIVE', 'APPROVED'] },
    },
    include: {
      user: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    success: true,
    data: {
      subject: { id: subject.id, name: subject.name, icon: subject.icon, courseId: subject.courseId, course: subject.course },
      feedbacks: feedbacks.map(f => ({
        id: f.id, sessionDate: f.sessionDate, sessionNote: f.sessionNote, createdBy: f.createdBy, createdAt: f.createdAt,
        totalStudents: f._count.records,
        presentCount: f.records.filter(r => r.attendance).length,
        aiGeneratedCount: f.records.filter(r => r.aiComment).length,
      })),
      students: enrollments.map(e => ({ id: e.user.id, name: e.user.name, phone: e.user.phone, enrollmentId: e.id })),
    },
  })
}

// POST: Tạo session feedback mới
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: subjectId } = await params
  const { sessionDate, sessionNote, studentIds } = await req.json()
  const createdBy = (check.session!.user as any).id

  const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { courseId: true } })
  if (!subject) return NextResponse.json({ success: false, error: 'Không tìm thấy chuyên đề' }, { status: 404 })

  // Tạo session
  const feedback = await prisma.sessionFeedback.create({
    data: {
      subjectId,
      sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
      sessionNote: sessionNote || null,
      createdBy,
    },
  })

  // Tạo records cho từng học sinh + tự động lấy điểm BTVN
  if (studentIds?.length > 0) {
    // Lấy điểm BTVN gần nhất của từng học sinh
    const hwData = await Promise.all(studentIds.map(async (userId: string) => {
      const answers = await prisma.studentAnswer.findMany({
        where: { userId, subjectId, question: { homeworkSetId: { not: null } } },
        select: { isCorrect: true, score: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
      const correct = answers.filter(a => a.isCorrect).length
      const total = answers.length
      return { userId, hwScore: total > 0 ? Math.round(correct / total * 100) : null, hwCorrect: correct, hwTotal: total }
    }))

    await prisma.studentSessionRecord.createMany({
      data: hwData.map(d => ({
        feedbackId: feedback.id,
        userId: d.userId,
        attendance: true,
        hwScore: d.hwScore,
        hwCorrect: d.hwCorrect,
        hwTotal: d.hwTotal,
      })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json({ success: true, data: { feedbackId: feedback.id } })
}
