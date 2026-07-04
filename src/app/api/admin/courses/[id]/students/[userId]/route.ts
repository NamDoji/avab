import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession, type OrganizationContext } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return { session, userId, orgCtx }
}

async function verifyCourseOwnership(
  courseId: string,
  orgCtx: OrganizationContext | null,
): Promise<boolean> {
  if (!orgCtx) return true // SUPER_ADMIN: không filter
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { organizationId: true, isPublic: true },
  })
  if (!course) return false
  return course.organizationId === orgCtx.id || course.isPublic === true
}

// PATCH /api/admin/courses/[id]/students/[userId] - Cập nhật parentName
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }
  const { orgCtx } = check

  try {
    const { id: courseId, userId } = await params

    const allowed = await verifyCourseOwnership(courseId, orgCtx)
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Không có quyền truy cập khoá học này' }, { status: 403 })
    }

    const body = await request.json()

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy học viên' }, { status: 404 })
    }

    const { parentName, action } = body
    const updateData: Record<string, unknown> = {}

    if (action === 'pause') {
      updateData.status = 'PAUSED'
      updateData.pausedAt = new Date()
      updateData.resumedAt = null
    } else if (action === 'resume') {
      updateData.status = 'ACTIVE'
      updateData.resumedAt = new Date()
      // giữ pausedAt cũ — dùng để filter chuyên đề trong giai đoạn nghỉ
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }
  const { orgCtx } = check

  try {
    const { id: courseId, userId } = await params

    const allowed = await verifyCourseOwnership(courseId, orgCtx)
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Không có quyền truy cập khoá học này' }, { status: 403 })
    }

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
