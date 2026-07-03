import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import WorkflowActionForm from './WorkflowActionForm'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  running:   { label: 'Đang chạy',  color: '#2563eb', bg: '#dbeafe' },
  completed: { label: 'Hoàn thành', color: '#059669', bg: '#d1fae5' },
  rejected:  { label: 'Từ chối',    color: '#dc2626', bg: '#fee2e2' },
  cancelled: { label: 'Đã hủy',     color: '#6b7280', bg: '#f3f4f6' },
  on_hold:   { label: 'Tạm dừng',   color: '#d97706', bg: '#fef3c7' },
}

const ACTION_LABELS: Record<string, string> = {
  approve:  '✅ Phê duyệt',
  reject:   '❌ Từ chối',
  submit:   '📤 Gửi tiếp',
  reassign: '🔄 Chuyển giao',
  comment:  '💬 Bình luận',
  auto:     '⚙️ Tự động',
}

const STEP_TYPE_ICON: Record<string, string> = {
  form_input:   '📝',
  review:       '🔍',
  approval:     '✅',
  auto:         '⚙️',
  payment:      '💳',
  notification: '🔔',
}

interface WorkflowStep {
  id: string
  name: string
  type: string
  assigneeRole?: string
  nextSteps?: string[]
  autoAction?: string
}

interface HistoryRecord {
  id: string
  stepId: string
  stepName: string
  action: string
  actorId: string | null
  note: string | null
  createdAt: Date
}

type ActionType = 'approve' | 'reject' | 'submit' | 'reassign' | 'comment'

type RouteContext = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: RouteContext) {
  const { id } = await params
  const instance = await prisma.workflowInstance.findUnique({
    where: { id },
    select: { title: true },
  })
  return { title: `${instance?.title ?? 'Instance'} — Workflow Engine — AvaB Admin` }
}

export default async function WorkflowInstanceDetailPage({ params }: RouteContext) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const { id } = await params

  const instance = await prisma.workflowInstance.findUnique({
    where: { id },
    include: {
      workflow: {
        select: {
          id: true,
          name: true,
          module: true,
          steps: true,
          description: true,
        },
      },
      history: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!instance) notFound()

  const steps = instance.workflow.steps as unknown as WorkflowStep[]
  const currentStep = steps?.find((s) => s.id === instance.currentStep)
  const st = STATUS_CONFIG[instance.status] ?? STATUS_CONFIG.running
  const isActive = instance.status === 'running'

  // Allowed actions based on current step type
  const getAllowedActions = (): ActionType[] => {
    if (!isActive || !currentStep) return []
    const base: ActionType[] = ['comment']
    if (['approval', 'review'].includes(currentStep.type)) {
      return ['approve', 'reject', 'reassign', 'comment']
    }
    if (currentStep.type === 'form_input') {
      return ['submit', 'comment']
    }
    return base
  }

  const allowedActions = getAllowedActions()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-8 px-6"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
      >
        <div className="container mx-auto max-w-6xl">
          <p className="text-indigo-200 text-sm font-semibold mb-1">
            <Link href="/admin" className="hover:underline">← Admin</Link>
            {' / '}
            <Link href="/admin/workflow" className="hover:underline">Workflow Engine</Link>
            {' / '}
            <Link href="/admin/workflow/instances" className="hover:underline">Instances</Link>
            {' / Chi tiết'}
          </p>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black truncate">{instance.title}</h1>
              <p className="text-indigo-200 text-sm mt-0.5">{instance.workflow.name}</p>
            </div>
            <span
              className="text-sm font-bold px-3 py-1 rounded-full flex-shrink-0"
              style={{ color: st.color, background: st.bg }}
            >
              {st.label}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ──────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Instance info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-black text-sm text-gray-800 mb-4">📋 Thông tin quy trình</h3>
              <dl className="space-y-2 text-xs">
                {[
                  { label: 'ID', value: instance.id.slice(0, 12) + '…' },
                  { label: 'Quy trình', value: instance.workflow.name },
                  { label: 'Loại thực thể', value: instance.entityType ?? '—' },
                  { label: 'Entity ID', value: instance.entityId ?? '—' },
                  { label: 'Người tạo', value: instance.startedBy ?? '—' },
                  { label: 'Người xử lý', value: instance.assignedTo ?? '—' },
                  {
                    label: 'Hạn chót',
                    value: instance.dueAt ? new Date(instance.dueAt).toLocaleString('vi-VN') : '—',
                  },
                  {
                    label: 'Ngày tạo',
                    value: new Date(instance.createdAt).toLocaleString('vi-VN'),
                  },
                  ...(instance.completedAt
                    ? [{ label: 'Hoàn thành', value: new Date(instance.completedAt).toLocaleString('vi-VN') }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-gray-400 shrink-0">{label}</dt>
                    <dd className="text-gray-700 font-semibold text-right truncate max-w-[140px]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Current step */}
            {currentStep && isActive && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
                <h3 className="font-black text-sm text-gray-800 mb-3">📍 Bước hiện tại</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{STEP_TYPE_ICON[currentStep.type] ?? '⬜'}</span>
                  <span className="font-bold text-sm text-indigo-700">{currentStep.name}</span>
                </div>
                {currentStep.assigneeRole && (
                  <p className="text-xs text-gray-400">
                    Vai trò xử lý: <span className="font-semibold text-gray-600">{currentStep.assigneeRole}</span>
                  </p>
                )}
              </div>
            )}

            {/* All steps overview */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-black text-sm text-gray-800 mb-3">🗺️ Các bước ({steps?.length ?? 0})</h3>
              <div className="space-y-2">
                {steps?.map((step, i) => {
                  const isCurrent = step.id === instance.currentStep
                  const stepIndex = steps.findIndex((s) => s.id === instance.currentStep)
                  const isDone = i < stepIndex || instance.status === 'completed'
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50 border border-indigo-200'
                          : isDone
                          ? 'bg-green-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{
                          background: isCurrent ? '#6366f1' : isDone ? '#059669' : '#e5e7eb',
                          color: isCurrent || isDone ? 'white' : '#6b7280',
                        }}
                      >
                        {isDone && !isCurrent ? '✓' : i + 1}
                      </span>
                      <span className={`flex-1 truncate font-semibold ${
                        isCurrent ? 'text-indigo-700' : isDone ? 'text-green-700' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </span>
                      <span className="text-gray-300">{STEP_TYPE_ICON[step.type] ?? ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action form */}
            {isActive && allowedActions.length > 0 && (
              <WorkflowActionForm
                instanceId={instance.id}
                stepName={currentStep?.name ?? instance.currentStep}
                allowedActions={allowedActions}
              />
            )}

          </div>

          {/* ── Right column — Timeline ───────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-black text-sm text-gray-800 mb-5">📜 Lịch sử xử lý</h3>

              {instance.history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Chưa có lịch sử</p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />

                  <div className="space-y-6 pl-10">
                    {(instance.history as HistoryRecord[]).map((h, i) => {
                      const actionLabel = ACTION_LABELS[h.action] ?? h.action
                      const isLast = i === instance.history.length - 1
                      return (
                        <div key={h.id} className="relative">
                          {/* Dot */}
                          <div
                            className="absolute -left-[34px] w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs"
                            style={{
                              background: h.action === 'approve' || h.action === 'auto'
                                ? '#059669'
                                : h.action === 'reject'
                                ? '#dc2626'
                                : h.action === 'submit'
                                ? '#2563eb'
                                : '#9ca3af',
                            }}
                          />

                          <div className={`${isLast ? 'pb-0' : ''}`}>
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <p className="font-bold text-sm text-gray-800">{actionLabel}</p>
                                <p className="text-xs text-gray-400">
                                  Bước: <span className="font-semibold text-gray-600">{h.stepName}</span>
                                </p>
                                {h.actorId && (
                                  <p className="text-xs text-gray-400">
                                    Người thực hiện: <span className="font-semibold text-gray-600">{h.actorId.slice(0, 8)}…</span>
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-300 shrink-0">
                                {new Date(h.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>

                            {h.note && (
                              <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600 border border-gray-100">
                                {h.note}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* End marker */}
                    {instance.status !== 'running' && (
                      <div className="relative">
                        <div
                          className="absolute -left-[34px] w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                          style={{
                            background: instance.status === 'completed' ? '#059669' : '#dc2626',
                          }}
                        />
                        <p className="font-black text-sm"
                          style={{ color: instance.status === 'completed' ? '#059669' : '#dc2626' }}>
                          {instance.status === 'completed' ? '🎉 Quy trình hoàn thành' : '🚫 Quy trình bị từ chối'}
                        </p>
                        {instance.completedAt && (
                          <p className="text-xs text-gray-400">
                            {new Date(instance.completedAt).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
