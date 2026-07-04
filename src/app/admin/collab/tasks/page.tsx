import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Tasks — Collaboration — AvaB Admin' }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  running:   { label: 'In Progress', color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  completed: { label: 'Done',        color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  rejected:  { label: 'Cancelled',   color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  cancelled: { label: 'Cancelled',   color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
  on_hold:   { label: 'Pending',     color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
}

// Map workflow status → kanban column
const STATUS_TO_COL: Record<string, 'pending' | 'in_progress' | 'done' | 'cancelled'> = {
  on_hold:   'pending',
  running:   'in_progress',
  completed: 'done',
  rejected:  'cancelled',
  cancelled: 'cancelled',
}

const COL_CONFIG = {
  pending:     { label: 'Pending',     icon: '⏳', color: '#d97706', bg: '#fef9ee' },
  in_progress: { label: 'In Progress', icon: '🔄', color: '#2563eb', bg: '#eff6ff' },
  done:        { label: 'Done',        icon: '✅', color: '#059669', bg: '#f0fdf4' },
  cancelled:   { label: 'Cancelled',   icon: '❌', color: '#6b7280', bg: '#f9fafb' },
}

type ColKey = keyof typeof COL_CONFIG

export default async function CollabTasksPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const instances = await prisma.workflowInstance.findMany({
    include: {
      workflow: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Resolve assignee names
  const assigneeIds = [...new Set(instances.map((i) => i.assignedTo).filter(Boolean))] as string[]
  const assigneeMap = new Map<string, string>()
  if (assigneeIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: { id: true, name: true },
    })
    for (const u of users) assigneeMap.set(u.id, u.name ?? u.id)
  }

  // Group by column
  const columns: Record<ColKey, typeof instances> = {
    pending: [],
    in_progress: [],
    done: [],
    cancelled: [],
  }

  for (const inst of instances) {
    const col = STATUS_TO_COL[inst.status] ?? 'pending'
    columns[col].push(inst)
  }

  const totalTasks = instances.length

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
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
          <p className="text-teal-100 text-sm">{totalTasks} task · Kanban theo trạng thái workflow</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3 flex-wrap">
            {(Object.keys(COL_CONFIG) as ColKey[]).map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{
                  color: COL_CONFIG[col].color,
                  backgroundColor: COL_CONFIG[col].bg,
                  borderColor: COL_CONFIG[col].color + '44',
                }}
              >
                {COL_CONFIG[col].icon} {COL_CONFIG[col].label}: {columns[col].length}
              </span>
            ))}
          </div>
          <Link
            href="/admin/workflow"
            className="flex items-center gap-2 bg-teal-600 text-white rounded-2xl px-4 py-2.5 text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm"
          >
            ➕ Tạo task
          </Link>
        </div>

        {/* ── Kanban ──────────────────────────────────────────────────────── */}
        {totalTasks === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="font-black text-gray-700 mb-1">Chưa có task nào</h3>
            <p className="text-gray-400 text-sm mb-4">Tasks được đồng bộ từ Workflow Instances</p>
            <Link
              href="/admin/workflow"
              className="inline-flex items-center gap-2 bg-teal-600 text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-teal-700 transition-colors"
            >
              🔄 Tới Workflow Engine
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {(Object.keys(COL_CONFIG) as ColKey[]).map((col) => {
              const colConf = COL_CONFIG[col]
              const tasks = columns[col]

              return (
                <div
                  key={col}
                  className="rounded-3xl border overflow-hidden"
                  style={{ backgroundColor: colConf.bg, borderColor: colConf.color + '33' }}
                >
                  {/* Column header */}
                  <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: colConf.color + '22' }}>
                    <span className="text-lg">{colConf.icon}</span>
                    <span className="font-black text-sm" style={{ color: colConf.color }}>{colConf.label}</span>
                    <span
                      className="ml-auto text-xs font-black w-6 h-6 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: colConf.color }}
                    >
                      {tasks.length}
                    </span>
                  </div>

                  {/* Task cards */}
                  <div className="p-3 space-y-2 min-h-[120px]">
                    {tasks.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-6">Không có task</p>
                    ) : (
                      tasks.map((task) => {
                        const stConf = STATUS_CONFIG[task.status]
                        const assigneeName = task.assignedTo ? (assigneeMap.get(task.assignedTo) ?? 'Không rõ') : null

                        return (
                          <Link
                            key={task.id}
                            href={`/admin/workflow/instances/${task.id}`}
                            className="block bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all"
                          >
                            <p className="font-bold text-gray-900 text-sm leading-tight mb-1.5 line-clamp-2">
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-400 mb-2">{task.workflow.name}</p>

                            {/* Badges row */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ color: stConf?.color ?? '#6b7280', backgroundColor: stConf?.bg ?? '#f3f4f6' }}
                              >
                                {task.status}
                              </span>
                              {task.entityType && (
                                <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                                  {task.entityType}
                                </span>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-2.5">
                              {assigneeName ? (
                                <span className="text-[10px] text-gray-500 font-semibold">👤 {assigneeName}</span>
                              ) : (
                                <span className="text-[10px] text-gray-300">Chưa giao</span>
                              )}
                              {task.dueAt && (
                                <span className={`text-[10px] font-semibold ${new Date(task.dueAt) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                                  📅 {new Date(task.dueAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </Link>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Workflow link ─────────────────────────────────────────────── */}
        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-teal-800 text-sm">💡 Tasks được đồng bộ từ Workflow Engine</p>
            <p className="text-teal-600 text-xs mt-0.5">Tạo và quản lý workflow tại Workflow Engine để thêm task mới</p>
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
