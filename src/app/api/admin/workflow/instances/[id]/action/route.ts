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

type ActionType = 'approve' | 'reject' | 'submit' | 'reassign' | 'comment'

interface ActionBody {
  action: ActionType
  note?: string
  nextAssigneeId?: string
  data?: Record<string, unknown>
}

interface WorkflowStep {
  id: string
  type: string
  name: string
  assigneeRole?: string
  nextSteps?: string[]
  autoAction?: string
}

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/admin/workflow/instances/[id]/action
export async function POST(request: NextRequest, { params }: RouteContext) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const body = await request.json() as ActionBody
    const { action, note, nextAssigneeId, data } = body

    if (!action) {
      return NextResponse.json({ success: false, error: 'Thiếu action' }, { status: 400 })
    }

    const validActions: ActionType[] = ['approve', 'reject', 'submit', 'reassign', 'comment']
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: `Action không hợp lệ: ${action}` }, { status: 400 })
    }

    // Load instance + workflow def
    const instance = await prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        workflow: { select: { steps: true, name: true } },
      },
    })

    if (!instance) {
      return NextResponse.json({ success: false, error: 'Instance không tồn tại' }, { status: 404 })
    }

    if (instance.status !== 'running') {
      return NextResponse.json(
        { success: false, error: `Instance đã ${instance.status}, không thể thực hiện action` },
        { status: 400 }
      )
    }

    const steps = instance.workflow.steps as unknown as WorkflowStep[]
    const currentStepIndex = steps.findIndex((s) => s.id === instance.currentStep)

    if (currentStepIndex === -1) {
      return NextResponse.json({ success: false, error: 'Bước hiện tại không hợp lệ' }, { status: 400 })
    }

    const currentStep = steps[currentStepIndex]
    const userId = (check.session.user as { id?: string }).id

    // Record history
    await prisma.workflowHistory.create({
      data: {
        instanceId: id,
        stepId: currentStep.id,
        stepName: currentStep.name,
        action,
        actorId: userId,
        note,
        data: data as any ?? undefined,
      },
    })

    // Handle action logic
    if (action === 'reject') {
      // Reject → update status
      const updated = await prisma.workflowInstance.update({
        where: { id },
        data: {
          status: 'rejected',
          completedAt: new Date(),
        },
        include: {
          workflow: { select: { name: true } },
          history: { orderBy: { createdAt: 'asc' } },
        },
      })
      return NextResponse.json({ success: true, data: updated, message: 'Đã từ chối quy trình' })
    }

    if (action === 'comment') {
      // Comment only — no state change
      const updated = await prisma.workflowInstance.findUnique({
        where: { id },
        include: {
          workflow: { select: { name: true } },
          history: { orderBy: { createdAt: 'asc' } },
        },
      })
      return NextResponse.json({ success: true, data: updated, message: 'Đã thêm bình luận' })
    }

    if (action === 'reassign') {
      if (!nextAssigneeId) {
        return NextResponse.json({ success: false, error: 'Thiếu nextAssigneeId cho reassign' }, { status: 400 })
      }
      const updated = await prisma.workflowInstance.update({
        where: { id },
        data: { assignedTo: nextAssigneeId },
        include: {
          workflow: { select: { name: true } },
          history: { orderBy: { createdAt: 'asc' } },
        },
      })
      return NextResponse.json({ success: true, data: updated, message: 'Đã chuyển giao quy trình' })
    }

    // approve or submit → advance to next step
    if (action === 'approve' || action === 'submit') {
      const nextStepIndex = currentStepIndex + 1

      if (nextStepIndex >= steps.length) {
        // Last step completed
        const updated = await prisma.workflowInstance.update({
          where: { id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
          include: {
            workflow: { select: { name: true } },
            history: { orderBy: { createdAt: 'asc' } },
          },
        })
        return NextResponse.json({ success: true, data: updated, message: 'Quy trình đã hoàn thành' })
      }

      const nextStep = steps[nextStepIndex]

      // Determine next assignee
      let nextAssignee: string | null = instance.assignedTo
      if (nextAssigneeId) {
        nextAssignee = nextAssigneeId
      }

      const updated = await prisma.workflowInstance.update({
        where: { id },
        data: {
          currentStep: nextStep.id,
          assignedTo: nextAssignee,
          ...(data ? { data: JSON.parse(JSON.stringify({ ...(instance.data as Record<string, unknown> ?? {}), ...data })) } : {}),
        },
        include: {
          workflow: { select: { name: true } },
          history: { orderBy: { createdAt: 'asc' } },
        },
      })

      // If next step is auto, record auto action in history
      if (nextStep.type === 'auto') {
        await prisma.workflowHistory.create({
          data: {
            instanceId: id,
            stepId: nextStep.id,
            stepName: nextStep.name,
            action: 'auto',
            note: `Auto action: ${nextStep.autoAction ?? 'unknown'}`,
          },
        })

        // Check if auto step is also the last step
        if (nextStepIndex + 1 >= steps.length) {
          const completed = await prisma.workflowInstance.update({
            where: { id },
            data: { status: 'completed', completedAt: new Date() },
            include: {
              workflow: { select: { name: true } },
              history: { orderBy: { createdAt: 'asc' } },
            },
          })
          return NextResponse.json({ success: true, data: completed, message: 'Quy trình đã hoàn thành (auto)' })
        }
      }

      return NextResponse.json({ success: true, data: updated, message: `Đã chuyển sang bước: ${nextStep.name}` })
    }

    return NextResponse.json({ success: false, error: 'Action không được xử lý' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/admin/workflow/instances/[id]/action error:', error)
    return NextResponse.json({ success: false, error: 'Không thể thực hiện action' }, { status: 500 })
  }
}
