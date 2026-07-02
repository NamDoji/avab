import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

// GET /api/admin/courses/[id]/tuition — list collections + stats
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: courseId } = await params

  const [course, collections] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, name: true, pricePerSession: true },
    }),
    prisma.tuitionCollection.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { payments: true } },
        payments: {
          select: { isPaid: true, isFree: true, amount: true },
        },
      },
    }),
  ])

  if (!course) return NextResponse.json({ success: false, error: 'Không tìm thấy khoá học' }, { status: 404 })

  const collectionsWithStats = collections.map(col => ({
    id: col.id,
    title: col.title,
    sessions: col.sessions,
    unitAmount: col.unitAmount,
    totalAmount: col.totalAmount,
    note: col.note,
    createdAt: col.createdAt,
    totalStudents: col._count.payments,
    paidCount: col.payments.filter(p => p.isPaid && !p.isFree).length,
    freeCount: col.payments.filter(p => p.isFree).length,
    unpaidCount: col.payments.filter(p => !p.isPaid && !p.isFree).length,
    collectedAmount: col.payments.filter(p => p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0),
    pendingAmount: col.payments.filter(p => !p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0),
  }))

  return NextResponse.json({
    success: true,
    data: { course, collections: collectionsWithStats },
  })
}

// POST /api/admin/courses/[id]/tuition — create new collection
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: courseId } = await params

  const body = await req.json()
  const { title, sessions, note } = body

  if (!title || !sessions) {
    return NextResponse.json({ success: false, error: 'Thiếu thông tin' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { pricePerSession: true },
  })
  if (!course) return NextResponse.json({ success: false, error: 'Không tìm thấy khoá học' }, { status: 404 })

  const unitAmount = course.pricePerSession ?? 0
  const totalAmount = unitAmount * Number(sessions)

  // Get all active enrollments for this course
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId, status: { in: ['ACTIVE', 'APPROVED'] } },
    select: { id: true, userId: true },
  })

  // Create collection + payments in a transaction
  const collection = await prisma.$transaction(async (tx) => {
    const col = await tx.tuitionCollection.create({
      data: {
        courseId,
        title,
        sessions: Number(sessions),
        unitAmount,
        totalAmount,
        note: note ?? null,
      },
    })

    if (enrollments.length > 0) {
      await tx.tuitionPayment.createMany({
        data: enrollments.map(e => ({
          collectionId: col.id,
          enrollmentId: e.id,
          userId: e.userId,
          amount: totalAmount,
          isFree: false,
          isPaid: false,
        })),
      })
    }

    return col
  })

  return NextResponse.json({ success: true, data: collection }, { status: 201 })
}
