import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TaskBoard, { type TaskCard, type Priority } from '@/components/admin/collab/TaskBoard'

export const metadata = { title: 'Tasks — Collaboration — AvaB Admin' }

export default async function CollabTasksPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const instances = await prisma.workflowInstance.findMany({
    include: {
      workflow: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  // Resolve assignee names by ID (IDs from assignedTo field)
  const assigneeIds = [...new Set(instances.map((i) => i.assignedTo).filter(Boolean))] as string[]
  const assigneeMap = new Map<string, string>()
  if (assigneeIds.length > 0) {
    // Try looking up by user ID
    const users = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: { id: true, name: true },
    })
    for (const u of users) assigneeMap.set(u.id, u.name ?? u.id)
  }

  // Build typed task cards
  const tasks: TaskCard[] = instances.map((inst) => {
    // priority stored in data.priority JSON field
    const dataJson = inst.data as Record<string, unknown> | null
    const priority = (dataJson?.priority as Priority | undefined) ?? null

    // Assignee: may be a user ID or a plain name string
    const assigneeId = inst.assignedTo
    const assigneeName = assigneeId
      ? (assigneeMap.get(assigneeId) ?? assigneeId)  // fallback to raw string (name)
      : null

    return {
      id: inst.id,
      title: inst.title,
      workflowName: inst.workflow.name,
      assigneeId,
      assigneeName,
      dueAt: inst.dueAt ? inst.dueAt.toISOString() : null,
      status: inst.status,
      priority,
      entityType: inst.entityType,
    }
  })

  const totalTasks = tasks.length

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-teal-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/collab" className="hover:text-white transition-colors">Collaboration</Link>
            <span>›</span>
            <span className="text-white">Tasks</span>
          </div>
          <h1 className="text-3xl font-black mb-1">✅ Task Management</h1>
          <p className="text-teal-100 text-sm">{totalTasks} task · Kanban 4 cột · Tạo task nhanh</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* ── Kanban Board (Client) ────────────────────────────────────── */}
        <TaskBoard tasks={tasks} />

        {/* ── Workflow link ─────────────────────────────────────────────── */}
        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-teal-800 text-sm">💡 Tasks đồng bộ với Workflow Engine</p>
            <p className="text-teal-600 text-xs mt-0.5">
              Workflow phức tạp (duyệt nhiều bước) — tạo tại Workflow Engine
            </p>
          </div>
          <Link
            href="/admin/workflow/instances"
            className="flex-shrink-0 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
          >
            Xem instances →
          </Link>
        </div>
      </div>
    </div>
  )
}
