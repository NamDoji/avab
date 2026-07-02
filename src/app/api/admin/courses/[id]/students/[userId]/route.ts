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

// PATCH /api/admin/courses/[id]/students/[userId] - Cập nhật parentName
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id: courseId, userId } = await params
    const body = await request.json()

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy học viên' }, { status: 404 })
    }

    const { parentName, action } = body
    const updateData: any = {}

    if (action === 'pause') {
      updateData.status = 'PAUSED'
      updateData.pausedAt = new Date()
      updateData.resumedAt = null
    } else if (action === 'resume') {
      updateData.status = 'ACTIVE'
      updateData.resumedAt = new Date()
      // giữ pausedAt cũ — dùng để filter chưyên đề trong giai đoạn nghỉ
    } else if (parentName !== undefined) {
      updateData.parentName = parentName ?? null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'Không có gì để cập nhật' }, { status: 400 })
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update enrollment error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật' }, { status: 500 })
  }
}

// DELETE /api/admin/courses/[id]/students/[userId] - Xoá học viên (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id: courseId, userId } = await params

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy học viên trong khoá học này' }, { status: 404 })
    }

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'REMOVED' },
    })

    return NextResponse.json({ success: true, message: 'Đã xoá học viên khỏi khoá học' })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xoá học viên' }, { status: 500 })
  }
}
