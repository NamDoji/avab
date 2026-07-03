import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireTeacher() {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập', status: 401 as const }
  if ((session.user as any).role !== 'TEACHER') return { error: 'Không có quyền', status: 403 as const }
  return { session, userId: (session.user as any).id as string }
}

// GET: Chi tiết 1 session — chỉ trả về nếu createdBy = teacher
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const check = await requireTeacher()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { feedbackId } = await params

  const feedback = await prisma.sessionFeedback.findUnique({
    where: { id: feedbackId },
    include: {
      subject: { include: { course: { select: { id: true, name: true, paymentType: true } } } },
      records: {
        include: {
          user: { select: { id: true, name: true, phone: true, avatar: true } },
        },
        orderBy: [{ attendance: 'desc' }, { createdAt: 'asc' }],
      },
    },
  })

  if (!feedback) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 })
  }

  // Ownership check
  if (feedback.createdBy !== check.userId) {
    return NextResponse.json({ success: false, error: 'Bạn không có quyền truy cập buổi học này' }, { status: 403 })
  }

  return NextResponse.json({ success: true, data: { feedback } })
}

// PATCH: Cập nhật 1 record học sinh — ownership check
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const check = await requireTeacher()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { feedbackId } = await params

  // Verify ownership
  const feedback = await prisma.sessionFeedback.findUnique({
    where: { id: feedbackId },
    select: { createdBy: true },
  })
  if (!feedback) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 })
  }
  if (feedback.createdBy !== check.userId) {
    return NextResponse.json({ success: false, error: 'Không có quyền' }, { status: 403 })
  }

  const body = await req.json()
  const { userId } = body

  const ALLOWED_FIELDS = new Set([
    'attendance', 'focusLevel', 'participationLevel', 'speakingCount',
    'answerQuality', 'comprehension', 'discipline',
    'observation', 'comparison', 'classification', 'patternRecognition', 'expression',
    'emotionState', 'teacherNote', 'aiComment', 'aiCommentAt',
    'hwScore', 'hwCorrect', 'hwTotal',
  ])
  const updateData = Object.fromEntries(
    Object.entries(body).filter(([k, v]) => ALLOWED_FIELDS.has(k) && v !== undefined)
  )

  const record = await prisma.studentSessionRecord.upsert({
    where: { feedbackId_userId: { feedbackId, userId } },
    create: { feedbackId, userId, ...updateData },
    update: updateData,
    include: { user: { select: { id: true, name: true, phone: true, avatar: true } } },
  })

  return NextResponse.json({ success: true, data: record })
}
