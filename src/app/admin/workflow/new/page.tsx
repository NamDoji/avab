import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import WorkflowTemplateBuilder from '@/components/admin/workflow/WorkflowTemplateBuilder'
import type { WorkflowStep } from '@/components/admin/workflow/WorkflowTemplateBuilder'

export const metadata = { title: 'Tạo Workflow mới — AvaB Admin' }

type RouteContext = { searchParams: Promise<{ fromTemplate?: string }> }

export default async function NewWorkflowPage({ searchParams }: RouteContext) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { fromTemplate } = await searchParams

  // If a template id is provided, pre-fill from that template
  let initialName   = ''
  let initialDesc   = ''
  let initialModule = 'general'
  let initialSteps: WorkflowStep[] = []

  if (fromTemplate) {
    const tpl = await prisma.workflowDef.findUnique({
      where: { id: fromTemplate },
    })
    if (tpl) {
      initialName   = `${tpl.name} (copy)`
      initialDesc   = tpl.description ?? ''
      initialModule = tpl.module
      initialSteps  = (tpl.steps as unknown as WorkflowStep[]) ?? []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-8 px-6"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
      >
        <div className="container mx-auto max-w-3xl">
          <p className="text-indigo-200 text-sm font-semibold mb-1">
            <Link href="/admin" className="hover:underline">← Admin</Link>
            {' / '}
            <Link href="/admin/workflow" className="hover:underline">Workflow Engine</Link>
            {' / Tạo mới'}
          </p>
          <h1 className="text-2xl font-black">
            {fromTemplate ? '📋 Tạo từ Template' : '➕ Workflow mới'}
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Định nghĩa quy trình phê duyệt, xem xét hoặc xử lý tự động
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <WorkflowTemplateBuilder
          initialName={initialName}
          initialDesc={initialDesc}
          initialModule={initialModule}
          initialSteps={initialSteps}
        />
      </div>
    </div>
  )
}
