import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Instances — Workflow Engine — AvaB Admin' }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  running:   { label: 'Đang chạy',  color: '#2563eb', bg: '#dbeafe' },
  completed: { label: 'Hoàn thành', color: '#059669', bg: '#d1fae5' },
  rejected:  { label: 'Từ chối',    color: '#dc2626', bg: '#fee2e2' },
  cancelled: { label: 'Đã hủy',     color: '#6b7280', bg: '#f3f4f6' },
  on_hold:   { label: 'Tạm dừng',   color: '#d97706', bg: '#fef3c7' },
}

const TAB_FILTERS: { label: string; status?: string; key: string }[] = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'running',   label: 'Đang chạy',      status: 'running' },
  { key: 'pending',   label: 'Chờ tôi xử lý' },
  { key: 'completed', label: 'Hoàn thành',     status: 'completed' },
  { key: 'rejected',  label: 'Từ chối',        status: 'rejected' },
]

interface WorkflowStep {
  id: string
  name: string
  type: string
}

interface InstanceRow {
  id: string
  title: string
  entityType: string | null
  currentStep: string
  assignedTo: string | null
  dueAt: Date | null
  status: string
  createdAt: Date
  workflow: {
    id: string
    name: string
    module: string
    steps: unknown
  }
}

interface PageProps {
  searchParams: Promise<{ tab?: string; workflowId?: string }>
}

export default async function WorkflowInstancesPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const { tab = 'all', workflowId } = await searchParams
  const userId = (session.user as { id?: string }).id

  // Build where clause based on tab
  const where: Record<string, unknown> = {}
  if (workflowId) where.workflowId = workflowId

  const activeTab = TAB_FILTERS.find((t) => t.key === tab) ?? TAB_FILTERS[0]
  if (activeTab.status) {
    where.status = activeTab.status
  }
  if (tab === 'pending' && userId) {
    where.assignedTo = userId
    where.status = 'running'
  }

  const instances = await prisma.workflowInstance.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      workflow: {
        select: { id: true, name: true, module: true, steps: true },
      },
    },
  })

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
            {' / Instances'}
          </p>
          <h1 className="text-2xl font-black">🔄 Tất cả Instances</h1>
          <p className="text-indigo-200 text-sm mt-0.5">Theo dõi và quản lý tất cả quy trình đang chạy</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6">

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
          {TAB_FILTERS.map((t) => (
            <Link
              key={t.key}
              href={`/admin/workflow/instances?tab=${t.key}${workflowId ? `&workflowId=${workflowId}` : ''}`}
              className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        {instances.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-gray-500 text-sm">Không có instance nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Quy trình</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Tiêu đề</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3 hidden sm:table-cell">Bước</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3 hidden md:table-cell">Người xử lý</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3 hidden md:table-cell">Hạn</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Trạng thái</th>
                    <th className="text-left text-xs font-bold text-gray-500 px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(instances as InstanceRow[]).map((inst) => {
                    const steps = inst.workflow.steps as WorkflowStep[]
                    const currentStep = steps?.find((s) => s.id === inst.currentStep)
                    const st = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG.running
                    const isOverdue = inst.dueAt && inst.status === 'running' && new Date(inst.dueAt) < new Date()

                    return (
                      <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/workflow/instances/${inst.id}`} className="font-semibold text-indigo-600 hover:underline text-xs">
                            {inst.workflow.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-[160px] truncate">{inst.title}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                          {currentStep?.name ?? inst.currentStep}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">
                          {inst.assignedTo ?? '—'}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {inst.dueAt ? (
                            <span className={`text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                              {isOverdue && '⚠️ '}
                              {new Date(inst.dueAt).toLocaleDateString('vi-VN')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ color: st.color, background: st.bg }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/workflow/instances/${inst.id}`}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            Chi tiết →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">{instances.length} kết quả</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
