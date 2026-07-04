import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

const QUICK_TASK_SLUG = 'quick-task'

/**
 * Finds or creates a lightweight "Quick Task" WorkflowDef.
 * This workflow has a single step — tasks created here are standalone cards.
 */
async function getOrCreateQuickTaskWorkflow(organizationId: string | null) {
  const where = organizationId
    ? { slug: QUICK_TASK_SLUG, organizationId }
    : { slug: QUICK_TASK_SLUG }

  const existing = await prisma.workflowDef.findFirst({ where })
  if (existing) return existing

  // Create a minimal single-step task workflow
  return prisma.workflowDef.create({
    data: {
      organizationId: organizationId ?? undefined,
      name: 'Quick Task',
      slug: organizationId ? `${QUICK_TASK_SLUG}-${organizationId.slice(-6)}` : QUICK_TASK_SLUG,
      description: 'Task nhanh từ Collaboration Board',
      module: 'general',
      isActive: true,
      steps: [
        {
          id: 'step_1',
          type: 'task',
          name: 'Thực hiện',
          nextSteps: [],
          conditions: [],
        },
      ],
    },
  })
}

// POST /api/admin/collab/tasks — create a quick task
export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      title?: string
      status?: string
      assignedTo?: string
      dueAt?: string
      priority?: 'high' | 'medium' | 'low'
    }

    const { title, status = 'on_hold', assignedTo, dueAt, priority } = body

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Tiêu đề không được để trống' }, { status: 400 })
    }

    const orgCtx = await getOrganizationContext(check.userId)

    const workflow = await getOrCreateQuickTaskWorkflow(orgCtx?.id ?? null)

    const instance = await prisma.workflowInstance.create({
      data: {
        organizationId: orgCtx?.id ?? undefined,
        workflowId: workflow.id,
        title: title.trim(),
        status,
        currentStep: 'step_1',
        startedBy: check.userId,
        assignedTo: assignedTo?.trim() || undefined,
        dueAt: dueAt ? new Date(dueAt) : undefined,
        data: priority ? { priority } : undefined,
      },
    })

    return NextResponse.json({ success: true, data: instance })
  } catch (error) {
    console.error('POST /api/admin/collab/tasks error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo task' }, { status: 500 })
  }
}
