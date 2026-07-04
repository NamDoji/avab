import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ApprovalActions from '@/components/admin/ApprovalActions'

export const metadata = { title: 'Workflow Engine — AvaB Admin' }

// ── Module config ─────────────────────────────────────────────────────────────
const MODULE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  content:    { label: 'Nội dung',   color: '#7c3aed', icon: '📚' },
  enrollment: { label: 'Tuyển sinh', color: '#2563eb', icon: '🎓' },
  finance:    { label: 'Tài chính',  color: '#059669', icon: '💰' },
  hr:         { label: 'Nhân sự',    color: '#d97706', icon: '👥' },
  general:    { label: 'Chung',      color: '#6b7280', icon: '⚙️' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  running:   { label: 'Đang chạy',  color: '#2563eb', bg: '#dbeafe' },
  completed: { label: 'Hoàn thành', color: '#059669', bg: '#d1fae5' },
  rejected:  { label: 'Từ chối',    color: '#dc2626', bg: '#fee2e2' },
  cancelled: { label: 'Đã hủy',     color: '#6b7280', bg: '#f3f4f6' },
  on_hold:   { label: 'Tạm dừng',   color: '#d97706', bg: '#fef3c7' },
}

interface WorkflowStep {
  id: string
  name: string
  type: string
}

interface WorkflowDefWithCount {
  id: string
  name: string
  module: string
  description: string | null
  steps: unknown
  isActive: boolean
  _count: { instances: number }
}

interface WorkflowInstance {
  id: string
  title: string
  entityType: string | null
  currentStep: string
  assignedTo: string | null
  dueAt: Date | null
  status: string
  createdAt: Date
  workflow: {
    name: string
    steps: unknown
  }
}

export default async function WorkflowHubPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // ── Seed sample workflow instances if none exist ────────────────────────
  const instanceCount = await prisma.workflowInstance.count()
  if (instanceCount === 0) {
    const firstWorkflow = await prisma.workflowDef.findFirst()
    const firstAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (firstWorkflow && firstAdmin) {
      // Get first step id from workflow steps
      const steps = firstWorkflow.steps as Array<{ id: string }>
      const firstStepId = steps?.[0]?.id ?? 'review'
      await prisma.workflowInstance.createMany({
        data: [
          {
            workflowId: firstWorkflow.id,
            status: 'running',
            startedBy: firstAdmin.id,
            currentStep: firstStepId,
            title: 'Duyệt giáo án Toán 5A HK1',
          },
          {
            workflowId: firstWorkflow.id,
            status: 'running',
            startedBy: firstAdmin.id,
            currentStep: firstStepId,
            title: 'Duyệt học liệu Tiếng Anh THCS',
          },
          {
            workflowId: firstWorkflow.id,
            status: 'completed',
            startedBy: firstAdmin.id,
            currentStep: firstStepId,
            completedAt: new Date(),
            title: 'Xuất bản khóa học Lập trình Scratch',
          },
        ],
      })
    }
  }

  const [defs, runningInstances, templates, completedThisMonth, pendingInstances] = await Promise.all([
    prisma.workflowDef.findMany({
      where: { isTemplate: false, isActive: true },
      include: { _count: { select: { instances: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.workflowInstance.findMany({
      where: { status: 'running' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { workflow: { select: { name: true, steps: true } } },
    }),
    prisma.workflowDef.findMany({
      where: { isTemplate: true, isActive: true },
      orderBy: { module: 'asc' },
    }),
    prisma.workflowInstance.count({
      where: { status: 'completed', completedAt: { gte: startOfMonth } },
    }),
    prisma.workflowInstance.findMany({
      where: { status: 'running' },
      include: {
        workflow: { select: { name: true, module: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const stats = [
    { icon: '⚙️', label: 'Workflows đang hoạt động', value: defs.length, color: '#6366f1' },
    { icon: '🔄', label: 'Instances đang chạy',       value: runningInstances.length, color: '#2563eb' },
    { icon: '✅', label: 'Đã hoàn thành (tháng này)', value: completedThisMonth, color: '#059669' },
    { icon: '📋', label: 'Templates sẵn có',           value: templates.length, color: '#d97706' },
  ]

  interface PendingInstance {
    id: string
    title: string
    startedBy: string | null
    currentStep: string
    createdAt: Date
    workflow: { name: string; module: string }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-10 px-6"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%,-50%)' }}
        />
        <div className="container mx-auto max-w-6xl">
          <p className="text-indigo-200 text-sm font-semibold mb-1">
            <Link href="/admin" className="hover:underline">← Admin</Link> / Workflow Engine
          </p>
          <h1 className="text-3xl font-black mb-1">⚙️ Workflow Engine</h1>
          <p className="text-indigo-200 text-sm">Tự động hóa quy trình vận hành toàn trường</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">

        {/* ── Active Approval Queue ──────────────────────────────────────── */}
        {pendingInstances.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm font-bold text-gray-700">🔔 Hàng đợi phê duyệt</p>
              <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                {pendingInstances.length}
              </span>
            </div>
            <div className="space-y-3">
              {(pendingInstances as PendingInstance[]).map((inst) => {
                const mod = MODULE_CONFIG[inst.workflow.module] ?? MODULE_CONFIG.general
                const timeAgo = (() => {
                  const diff = Date.now() - new Date(inst.createdAt).getTime()
                  const hours = Math.floor(diff / 3600000)
                  if (hours < 1) return 'Vừa xong'
                  if (hours < 24) return `${hours}g trước`
                  return `${Math.floor(hours / 24)}d trước`
                })()
                return (
                  <div
                    key={inst.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: `${mod.color}20` }}
                    >
                      {mod.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">{inst.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {inst.workflow.name} · {timeAgo}
                      </p>
                    </div>
                    <ApprovalActions instanceId={inst.id} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Section 1: Workflows của tôi ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-700">⚙️ Workflows của tôi</p>
            <Link
              href="/admin/workflow/new"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Tạo workflow mới
            </Link>
          </div>

          {defs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-gray-500 text-sm">Chưa có workflow nào. Hãy tạo từ template bên dưới!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(defs as WorkflowDefWithCount[]).map((def) => {
                const mod = MODULE_CONFIG[def.module] ?? MODULE_CONFIG.general
                return (
                  <div key={def.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: mod.color }}
                      >
                        {mod.icon} {mod.label}
                      </span>
                      <span className="text-xs text-gray-400">{def._count.instances} instances</span>
                    </div>
                    <h3 className="font-black text-gray-900 text-sm mb-1">{def.name}</h3>
                    {def.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{def.description}</p>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <Link
                        href={`/admin/workflow/instances?workflowId=${def.id}`}
                        className="flex-1 text-center text-xs font-bold py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        Xem instances
                      </Link>
                      <Link
                        href={`/admin/workflow/${def.id}/edit`}
                        className="text-xs font-bold py-1.5 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Sửa
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Section 2: Templates ──────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-4">📋 Templates sẵn có</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {templates.map((tpl) => {
              const mod = MODULE_CONFIG[tpl.module] ?? MODULE_CONFIG.general
              const steps = tpl.steps as unknown as WorkflowStep[]
              return (
                <div
                  key={tpl.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                    style={{ background: `${mod.color}20` }}
                  >
                    {mod.icon}
                  </div>
                  <h3 className="font-black text-xs text-gray-900 mb-1 leading-snug">{tpl.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{steps?.length ?? 0} bước</p>
                  <form action={`/api/admin/workflow/${tpl.id}/clone`} method="POST" className="mt-auto">
                    <Link
                      href={`/admin/workflow/new?fromTemplate=${tpl.id}`}
                      className="block text-center text-xs font-bold py-1.5 rounded-lg text-white transition-colors"
                      style={{ background: mod.color }}
                    >
                      Dùng template
                    </Link>
                  </form>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Section 3: Đang chạy ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-700">🔄 Đang chạy</p>
            <Link
              href="/admin/workflow/instances"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          {runningInstances.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-sm">Không có quy trình nào đang chạy</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Quy trình</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Tiêu đề</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3 hidden sm:table-cell">Bước hiện tại</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3 hidden md:table-cell">Hạn</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(runningInstances as WorkflowInstance[]).map((inst) => {
                    const steps = inst.workflow.steps as unknown as WorkflowStep[]
                    const currentStep = steps?.find((s) => s.id === inst.currentStep)
                    const st = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG.running
                    return (
                      <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/workflow/instances/${inst.id}`} className="font-semibold text-indigo-600 hover:underline text-xs">
                            {inst.workflow.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-[180px] truncate">{inst.title}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                          {currentStep?.name ?? inst.currentStep}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">
                          {inst.dueAt ? new Date(inst.dueAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ color: st.color, background: st.bg }}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
