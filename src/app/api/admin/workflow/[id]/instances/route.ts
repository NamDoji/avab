import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/admin/workflow/[id]/instances — list instances for this workflow
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params

    // Verify workflow exists
    const def = await prisma.workflowDef.findUnique({ where: { id } })
    if (!def) {
      return NextResponse.json({ success: false, error: 'Workflow không tồn tại' }, { status: 404 })
    }

    const instances = await prisma.workflowInstance.findMany({
      where: { workflowId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        workflow: { select: { name: true, steps: true } },
        _count: { select: { history: true } },
      },
    })

    return NextResponse.json({ success: true, data: instances })
  } catch (error) {
    console.error('GET /api/admin/workflow/[id]/instances error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải instances' }, { status: 500 })
  }
}

// POST /api/admin/workflow/[id]/instances — create new instance
export async function POST(request: NextRequest, { params }: RouteContext) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params

    const def = await prisma.workflowDef.findUnique({ where: { id } })
    if (!def) {
      return NextResponse.json({ success: false, error: 'Workflow không tồn tại' }, { status: 404 })
    }

    const body = await request.json() as {
      title: string
      entityType?: string
      entityId?: string
      assignedTo?: string
      dueAt?: string
      data?: unknown
    }

    const { title, entityType, entityId, assignedTo, dueAt, data } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Thiếu tiêu đề instance' }, { status: 400 })
    }

    // Get first step from workflow def
    const steps = def.steps as Array<{ id: string; type: string; name: string; assigneeRole?: string }>
    if (!steps || steps.length === 0) {
      return NextResponse.json({ success: false, error: 'Workflow không có bước nào' }, { status: 400 })
    }

    const firstStep = steps[0]
    const userId = (check.session.user as { id?: string }).id

    const instance = await prisma.workflowInstance.create({
      data: {
        workflowId: id,
        title,
        entityType,
        entityId,
        status: 'running',
        currentStep: firstStep.id,
        assignedTo: assignedTo,
        dueAt: dueAt ? new Date(dueAt) : undefined,
        startedBy: userId,
        data: data as any ?? undefined,
      },
      include: {
        workflow: { select: { name: true } },
      },
    })

    // Record initial history
    await prisma.workflowHistory.create({
      data: {
        instanceId: instance.id,
        stepId: firstStep.id,
        stepName: firstStep.name,
        action: 'submit',
        actorId: userId,
        note: 'Khởi tạo quy trình',
      },
    })

    return NextResponse.json({ success: true, data: instance }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/workflow/[id]/instances error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo instance' }, { status: 500 })
  }
}
