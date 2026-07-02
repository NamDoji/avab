import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

// GET /api/admin/courses/[id]/students - Danh sách học viên
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id: courseId } = await params

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: { not: 'REMOVED' } },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: enrollments })
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách học viên' }, { status: 500 })
  }
}

// POST /api/admin/courses/[id]/students - Thêm học viên
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { phone, email, name, isFree } = body

    if (!phone && !email) {
      return NextResponse.json({ success: false, error: 'Cần nhập SĐT hoặc email' }, { status: 400 })
    }

    // Lấy thông tin khoá học
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy khoá học' }, { status: 404 })
    }

    // Tìm user theo phone hoặc email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    })

    let created = false
    if (!user) {
      // Tạo user mới
      const hashedPassword = await bcrypt.hash('123456', 10)
      user = await prisma.user.create({
        data: {
          phone: phone || '',
          email: email || null,
          name: name || phone || email || 'Học viên',
          password: hashedPassword,
          role: 'STUDENT',
        },
      })
      created = true
    }

    // Kiểm tra đã enroll chưa
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    })

    if (existing) {
      if (existing.status === 'REMOVED') {
        // Kích hoạt lại
        const expiresAt = course.paymentType === 'PER_COURSE'
          ? new Date(Date.now() + course.courseDurationMonths * 30 * 24 * 60 * 60 * 1000)
          : null

        const updated = await prisma.enrollment.update({
          where: { id: existing.id },
          data: { status: 'ACTIVE', isFree: isFree ?? false, expiresAt },
        })
        return NextResponse.json({ success: true, data: updated, reactivated: true })
      }
      return NextResponse.json({ success: false, error: 'Học viên đã trong khoá học này' }, { status: 409 })
    }

    // Tạo enrollment mới
    const expiresAt = course.paymentType === 'PER_COURSE'
      ? new Date(Date.now() + course.courseDurationMonths * 30 * 24 * 60 * 60 * 1000)
      : null

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        status: 'ACTIVE',
        isFree: isFree ?? false,
        expiresAt,
      },
    })

    return NextResponse.json({ success: true, data: enrollment, created }, { status: 201 })
  } catch (error) {
    console.error('Add student error:', error)
    return NextResponse.json({ success: false, error: 'Không thể thêm học viên' }, { status: 500 })
  }
}
