import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession } from '@/lib/organization'
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }
  const { orgCtx } = check

  const { id } = await params

  try {
    const body = await request.json() as {
      name?: string
      capacity?: number
      type?: string
      floor?: number
      building?: string
      isActive?: boolean
    }

    // Org-scope: ADMIN chỉ thao tác phòng học thuộc org mình
    if (orgCtx) {
      const existing = await prisma.classRoom.findUnique({
        where: { id },
        select: { organizationId: true },
      })
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy phòng học' }, { status: 404 })
      }
      if (existing.organizationId && existing.organizationId !== orgCtx.id) {
        return NextResponse.json({ success: false, error: 'Không có quyền truy cập phòng học này' }, { status: 403 })
      }
    }

    const classroom = await prisma.classRoom.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.floor !== undefined && { floor: body.floor }),
        ...(body.building !== undefined && { building: body.building }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json({ success: true, data: classroom })
  } catch (error) {
    console.error('Classroom PUT error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật phòng học' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }
  const { orgCtx } = check

  const { id } = await params

  try {
    // Org-scope: ADMIN chỉ thao tác phòng học thuộc org mình
    if (orgCtx) {
      const existing = await prisma.classRoom.findUnique({
        where: { id },
        select: { organizationId: true },
      })
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy phòng học' }, { status: 404 })
      }
      if (existing.organizationId && existing.organizationId !== orgCtx.id) {
        return NextResponse.json({ success: false, error: 'Không có quyền truy cập phòng học này' }, { status: 403 })
      }
    }

    await prisma.classRoom.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Classroom DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xoá phòng học' }, { status: 500 })
  }
}
