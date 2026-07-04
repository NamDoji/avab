import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const { id: courseId } = await params
  const userId = (session.user as { id?: string })?.id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Không xác định được người dùng' }, { status: 401 })
  }

  // Read optional body fields
  let parentName: string | null = null
  let parentPhone: string | null = null
  let note: string | null = null
  try {
    const body = await req.json()
    parentName = body.parentName ?? null
    parentPhone = body.parentPhone ?? null
    note = body.note ?? null
  } catch {
    // body is optional
  }

  // Check course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId, isActive: true },
  }).catch(() => null)

  if (!course) {
    return NextResponse.json({ success: false, error: 'Khoá học không tồn tại' }, { status: 404 })
  }

  // Check existing enrollment
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  }).catch(() => null)

  if (existing) {
    return NextResponse.json({
      success: true,
      status: existing.status,
      message:
        existing.status === 'ACTIVE'
          ? 'Bạn đã được duyệt vào khoá học này!'
          : existing.status === 'PENDING'
          ? 'Đơn đăng ký của bạn đang chờ duyệt.'
          : 'Đã có đơn đăng ký.',
    })
  }

  // Create enrollment with PENDING status
  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
      status: 'PENDING',
      note: note ?? undefined,
      parentName: parentName ?? undefined,
    },
  })

  // Auto-create TuitionPayment if course has price > 0
  if (course.price && course.price > 0) {
    try {
      // Find or create a default TuitionCollection for this course
      let collection = await prisma.tuitionCollection.findFirst({
        where: { courseId, title: { contains: 'Đăng ký' } },
      })

      if (!collection) {
        collection = await prisma.tuitionCollection.create({
          data: {
            courseId,
            organizationId: course.organizationId ?? undefined,
            campusId: course.campusId ?? undefined,
            title: `Học phí đăng ký — ${course.name}`,
            sessions: 0,
            unitAmount: course.price,
            totalAmount: course.price,
            note: 'Tự động tạo khi học viên đăng ký',
          },
        })
      }

      await prisma.tuitionPayment.upsert({
        where: {
          collectionId_enrollmentId: {
            collectionId: collection.id,
            enrollmentId: enrollment.id,
          },
        },
        update: {},
        create: {
          collectionId: collection.id,
          enrollmentId: enrollment.id,
          userId,
          amount: course.price,
          isPaid: false,
          note: `Học phí khóa ${course.name}`,
        },
      })
    } catch (err) {
      // Non-fatal: log but don't fail the enrollment
      console.error('[enroll] TuitionPayment creation failed:', err)
    }
  }

  return NextResponse.json({
    success: true,
    status: enrollment.status,
    message: 'Đăng ký thành công!',
  })
}
