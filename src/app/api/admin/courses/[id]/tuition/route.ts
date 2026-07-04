import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return { error: 'Không có quyền', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return { session, userId, orgCtx }
}

// Verify course belongs to admin's org
async function verifyCourseOwnership(courseId: string, orgCtx: { id: string } | null) {
  if (!orgCtx) return true // SUPER_ADMIN: no restriction
  const course = await prisma.course.findFirst({
    where: { id: courseId },
    select: { organizationId: true, isPublic: true },
  })
  if (!course) return false
  return course.organizationId === orgCtx.id || course.isPublic === true
}

// Shared helper — map collection + payments to summary stats
function toSummary(col: {
  id: string; title: string; sessions: number; unitAmount: number; totalAmount: number;
  note: string | null; createdAt: Date;
  _count: { payments: number };
  payments: { isPaid: boolean; isFree: boolean; amount: number }[];
}) {
  return {
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
  }
}

const COLLECTION_INCLUDE = {
  _count: { select: { payments: true } },
  payments: { select: { isPaid: true, isFree: true, amount: true } },
} as const

// GET /api/admin/courses/[id]/tuition — list collections + stats
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(_req)
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: courseId } = await params

  // Org ownership check
  if (!await verifyCourseOwnership(courseId, check.orgCtx))
    return NextResponse.json({ success: false, error: 'Khoá học không thuộc tổ chức này' }, { status: 403 })

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, name: true, pricePerSession: true, price: true, paymentType: true },
  })
  if (!course) return NextResponse.json({ success: false, error: 'Không tìm thấy khoá học' }, { status: 404 })

  // ── PER_COURSE: single collection, auto-create + auto-sync new enrollments ──
  if (course.paymentType === 'PER_COURSE') {
    const amount = course.price ?? 0

    // Find or create the ONE collection for this course
    let collection = await prisma.tuitionCollection.findFirst({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    })

    if (!collection) {
      collection = await prisma.tuitionCollection.create({
        data: {
          courseId,
          title: 'Học phí khoá học',
          sessions: 0,
          unitAmount: amount,
          totalAmount: amount,
          note: null,
        },
      })
    }

    // Sync: add newly enrolled students not yet in this collection
    const existingPayments = await prisma.tuitionPayment.findMany({
      where: { collectionId: collection.id },
      select: { enrollmentId: true },
    })
    const existingEnrollmentIds = existingPayments.map(p => p.enrollmentId)

    const newEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: { in: ['ACTIVE', 'APPROVED'] },
        ...(existingEnrollmentIds.length > 0 ? { id: { notIn: existingEnrollmentIds } } : {}),
      },
      select: { id: true, userId: true },
    })

    if (newEnrollments.length > 0) {
      await prisma.tuitionPayment.createMany({
        data: newEnrollments.map(e => ({
          collectionId: collection!.id,
          enrollmentId: e.id,
          userId: e.userId,
          amount,
          isFree: false,
          isPaid: false,
        })),
      })
    }

    // Fetch updated stats
    const col = await prisma.tuitionCollection.findUniqueOrThrow({
      where: { id: collection.id },
      include: COLLECTION_INCLUDE,
    })

    return NextResponse.json({
      success: true,
      data: { course, collections: [toSummary(col)] },
    })
  }

  // ── PER_SESSION: original multi-collection behaviour ──
  const collections = await prisma.tuitionCollection.findMany({
    where: { courseId },
    orderBy: { createdAt: 'desc' },
    include: COLLECTION_INCLUDE,
  })

  return NextResponse.json({
    success: true,
    data: { course, collections: collections.map(toSummary) },
  })
}

// POST /api/admin/courses/[id]/tuition — create new collection
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: courseId } = await params

  if (!await verifyCourseOwnership(courseId, check.orgCtx))
    return NextResponse.json({ success: false, error: 'Khoá học không thuộc tổ chức này' }, { status: 403 })

  const body = await req.json()
  const { title, sessions, note } = body

  if (!title) {
    return NextResponse.json({ success: false, error: 'Thiếu thông tin' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { pricePerSession: true, price: true, paymentType: true },
  })
  if (!course) return NextResponse.json({ success: false, error: 'Không tìm thấy khoá học' }, { status: 404 })

  // Get all active enrollments for this course (excluding PAUSED)
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId, status: { in: ['ACTIVE', 'APPROVED'] } },
    select: { id: true, userId: true },
  })

  if (course.paymentType === 'PER_COURSE') {
    // Thu theo khoá: amount = course.price (hoặc body.amount nếu có)
    const amount = body.amount ?? (course.price ?? 0)
    const collection = await prisma.$transaction(async (tx) => {
      const col = await tx.tuitionCollection.create({
        data: {
          courseId,
          title,
          sessions: 0,
          unitAmount: amount,
          totalAmount: amount,
          note: note ?? null,
        },
      })
      if (enrollments.length > 0) {
        await tx.tuitionPayment.createMany({
          data: enrollments.map(e => ({
            collectionId: col.id,
            enrollmentId: e.id,
            userId: e.userId,
            amount: amount,
            isFree: false,
            isPaid: false,
          })),
        })
      }
      return col
    })
    return NextResponse.json({ success: true, data: collection }, { status: 201 })
  }

  // PER_SESSION: require sessions
  if (!sessions) {
    return NextResponse.json({ success: false, error: 'Thiếu số buổi' }, { status: 400 })
  }

  const unitAmount = course.pricePerSession ?? 0
  const totalAmount = unitAmount * Number(sessions)

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
