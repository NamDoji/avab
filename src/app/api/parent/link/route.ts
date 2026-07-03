import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireParent() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  const role = (session.user as any).role
  if (role !== 'PARENT' && role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

// POST /api/parent/link — Liên kết phụ huynh với học sinh theo SĐT
export async function POST(request: NextRequest) {
  const check = await requireParent()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập số điện thoại học sinh' }, { status: 400 })
    }

    const parentId = (check.session.user as any).id as string

    // Tìm học sinh theo SĐT
    const student = await prisma.user.findUnique({
      where: { phone: phone.trim() },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        enrollments: {
          where: { status: { in: ['ACTIVE', 'APPROVED'] } },
          include: { course: { select: { name: true, courseType: true } } },
          take: 5,
        },
      },
    })

    if (!student) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy học sinh với số điện thoại này' }, { status: 404 })
    }

    if (!student.isActive) {
      return NextResponse.json({ success: false, error: 'Tài khoản học sinh đã bị khoá' }, { status: 400 })
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json({ success: false, error: 'Tài khoản này không phải học sinh' }, { status: 400 })
    }

    if (student.id === parentId) {
      return NextResponse.json({ success: false, error: 'Không thể tự liên kết với chính mình' }, { status: 400 })
    }

    // Tạo liên kết (upsert để tránh duplicate)
    const link = await prisma.parentStudentLink.upsert({
      where: { parentId_studentId: { parentId, studentId: student.id } },
      update: {},
      create: { parentId, studentId: student.id },
    })

    return NextResponse.json({
      success: true,
      message: `Đã liên kết thành công với học sinh ${student.name ?? student.phone}`,
      link,
      student: {
        id: student.id,
        name: student.name,
        phone: student.phone,
        enrollments: student.enrollments,
      },
    })
  } catch (error) {
    console.error('[POST /api/parent/link]', error)
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 })
  }
}

// DELETE /api/parent/link — Hủy liên kết
export async function DELETE(request: NextRequest) {
  const check = await requireParent()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { studentId } = await request.json()
    const parentId = (check.session.user as any).id as string

    await prisma.parentStudentLink.delete({
      where: { parentId_studentId: { parentId, studentId } },
    })

    return NextResponse.json({ success: true, message: 'Đã hủy liên kết' })
  } catch (error) {
    console.error('[DELETE /api/parent/link]', error)
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
