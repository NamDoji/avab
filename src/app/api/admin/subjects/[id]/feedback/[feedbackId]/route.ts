import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

type Params = { id: string; feedbackId: string }

// GET: Chi tiết 1 session — toàn bộ ma trận học sinh
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: subjectId, feedbackId } = await params

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

  if (!feedback || feedback.subjectId !== subjectId) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 })
  }

  // Lấy danh sách học viên đăng ký (để thêm mới nếu cần)
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: feedback.subject.courseId, status: { in: ['ACTIVE', 'APPROVED'] } },
    include: { user: { select: { id: true, name: true, phone: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ success: true, data: { feedback, enrollments } })
}

// PATCH: Cập nhật 1 record học sinh
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { feedbackId } = await params
  const body = await req.json()
  const { recordId, userId, ...rawData } = body

  // Lọc bỏ các giá trị undefined để tránh overwrite vô ý
  const updateData = Object.fromEntries(
    Object.entries(rawData).filter(([, v]) => v !== undefined)
  )

  // Upsert record
  const record = await prisma.studentSessionRecord.upsert({
    where: { feedbackId_userId: { feedbackId, userId } },
    create: { feedbackId, userId, ...updateData },
    update: updateData,
    include: { user: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ success: true, data: record })
}

// PUT: Cập nhật session note
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { feedbackId } = await params
  const { sessionNote } = await req.json()

  const updated = await prisma.sessionFeedback.update({
    where: { id: feedbackId },
    data: { sessionNote },
  })

  return NextResponse.json({ success: true, data: updated })
}

// DELETE: Xóa session
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { feedbackId } = await params
  await prisma.sessionFeedback.delete({ where: { id: feedbackId } })
  return NextResponse.json({ success: true })
}
