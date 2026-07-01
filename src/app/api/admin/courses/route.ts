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

export async function GET() {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { subjects: true, enrollments: true } },
      },
    })

    return NextResponse.json({ success: true, data: courses })
  } catch (error) {
    console.error('Admin get courses error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải khoá học' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const body = await request.json()
    const { code, name, description, thumbnail, price } = body

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Mã khoá học và tên là bắt buộc' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: { code, name, description, thumbnail, price: price ?? 0 },
    })

    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Mã khoá học đã tồn tại' },
        { status: 409 }
      )
    }
    console.error('Admin create course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo khoá học' },
      { status: 500 }
    )
  }
}
