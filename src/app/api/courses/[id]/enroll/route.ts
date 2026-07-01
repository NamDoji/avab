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
  const userId = (session.user as any).id

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
      message: existing.status === 'APPROVED'
        ? 'Bạn đã được duyệt vào khoá học này!'
        : existing.status === 'PENDING'
        ? 'Đơn đăng ký của bạn đang chờ duyệt.'
        : 'Đã có đơn đăng ký.',
    })
  }

  // Create new enrollment with PENDING status
  const enrollment = await prisma.enrollment.create({
    data: { userId, courseId, status: 'PENDING' },
  })

  return NextResponse.json({
    success: true,
    status: enrollment.status,
    message: 'Đăng ký thành công!',
  })
}
