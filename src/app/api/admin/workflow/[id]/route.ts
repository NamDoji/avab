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

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/admin/workflow/[id] — get workflow def + instance count
export async function GET(request: NextRequest, { params }: RouteContext) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }
  const { orgCtx } = check

  try {
    const { id } = await params
    const def = await prisma.workflowDef.findUnique({
      where: { id },
      include: {
        _count: { select: { instances: true } },
        instances: {
          select: { id: true, status: true },
        },
      },
    })

    if (!def) {
      return NextResponse.json({ success: false, error: 'Workflow không tồn tại' }, { status: 404 })
    }

    // Org-scope: ADMIN chỉ xem workflow của org mình
    if (orgCtx && def.organizationId !== orgCtx.id) {
      return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: def })
  } catch (error) {
    console.error('GET /api/admin/workflow/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải workflow' }, { status: 500 })
  }
}

// PUT /api/admin/workflow/[id] — update workflow def
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }
  const { orgCtx } = check

  try {
    const { id } = await params
    const body = await request.json() as {
      name?: string
      description?: string
      module?: string
      isTemplate?: boolean
      isActive?: boolean
      steps?: unknown[]
      formSchema?: unknown
      settings?: unknown
      version?: number
    }

    const existing = await prisma.workflowDef.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workflow không tồn tại' }, { status: 404 })
    }

    // Org-scope: ADMIN chỉ sửa workflow của org mình
    if (orgCtx && existing.organizationId !== orgCtx.id) {
      return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
    }

    const updated = await prisma.workflowDef.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.module !== undefined && { module: body.module }),
        ...(body.isTemplate !== undefined && { isTemplate: body.isTemplate }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.steps !== undefined && { steps: body.steps as object[] }),
        ...(body.formSchema !== undefined && { formSchema: body.formSchema as object }),
        ...(body.settings !== undefined && { settings: body.settings as object }),
        ...(body.version !== undefined && { version: body.version }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PUT /api/admin/workflow/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật workflow' }, { status: 500 })
  }
}

// DELETE /api/admin/workflow/[id] — soft delete (set isActive=false)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }
  const { orgCtx } = check

  try {
    const { id } = await params
    const existing = await prisma.workflowDef.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workflow không tồn tại' }, { status: 404 })
    }

    // Org-scope: ADMIN chỉ xoá workflow của org mình
    if (orgCtx && existing.organizationId !== orgCtx.id) {
      return NextResponse.json({ success: false, error: 'Không có quyền truy cập' }, { status: 403 })
    }

    await prisma.workflowDef.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, message: 'Đã vô hiệu hóa workflow' })
  } catch (error) {
    console.error('DELETE /api/admin/workflow/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xóa workflow' }, { status: 500 })
  }
}
