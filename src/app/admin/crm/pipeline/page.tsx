import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PipelineBoard from './PipelineBoard'

export const metadata = { title: 'CRM Pipeline — AvaB EOS' }

export default async function PipelinePage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const leads = await prisma.registration.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const serialized = leads.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    note: l.note,
    note2: l.note2,
    type: l.type,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-8"
        style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-orange-200 text-sm mb-2">
            <Link href="/admin/crm" className="hover:text-white transition-colors">CRM</Link>
            <span>/</span>
            <span>Pipeline</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black mb-1">📋 Lead Pipeline</h1>
              <p className="text-orange-200 text-sm">{leads.length} leads · kéo thả để chuyển giai đoạn</p>
            </div>
            <Link
              href="/admin/crm/leads/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              ➕ Thêm Lead
            </Link>
          </div>
        </div>
      </div>

      {/* Kanban: PipelineBoard auto-detects mobile vs desktop */}
      <div className="py-4 sm:py-6 px-4 sm:px-6 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <PipelineBoard leads={serialized} />
      </div>
    </div>
  )
}
