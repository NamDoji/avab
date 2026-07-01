import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        subjects: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { questions: true, materials: true } },
          },
        },
        enrollments: {
          include: { user: { select: { id: true, name: true, phone: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { enrollments: true } },
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error('Admin get course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải khoá học' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { code, name, description, thumbnail, price, isActive, courseType } = body

    const validCourseTypes = ['TOAN', 'TIENG_ANH', 'LAP_TRINH_THUAT_TOAN', 'LAP_TRINH_SCRATCH', 'LAP_TRINH_PYTHON', 'LAP_TRINH_CPP']
    const updateData: any = { code, name, description, thumbnail, price, isActive }
    if (courseType && validCourseTypes.includes(courseType)) {
      updateData.courseType = courseType
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: course })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }
    console.error('Admin update course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật khoá học' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Đã xoá khoá học' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }
    console.error('Admin delete course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xoá khoá học' },
      { status: 500 }
    )
  }
}
