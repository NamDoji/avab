import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'
import { LeadsImportWrapper } from './LeadsImportWrapper'
import LeadsTable from './LeadsTable'

export const metadata = { title: 'CRM — AvaB EOS' }

type SearchParams = Promise<{
  search?: string
  page?: string
  pageSize?: string
}>

export default async function CRMPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const { search, page, pageSize } = await searchParams

  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const pageSizeNum = parseInt(pageSize ?? '50', 10)
  const validPageSize = [20, 50, 100, 200].includes(pageSizeNum) ? pageSizeNum : 50

  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const whereSearch = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const [total, newLeads, processing, converted, leadsData, leadsTotal] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: 'NEW' } }),
    prisma.registration.count({ where: { status: 'FOLLOWUP' } }),
    prisma.registration.count({ where: { status: 'WON', createdAt: { gte: thisMonthStart } } }),
    prisma.registration.findMany({
      where: whereSearch,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * validPageSize,
      take: validPageSize,
    }),
    prisma.registration.count({ where: whereSearch }),
  ])

  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-orange-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span>CRM</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">📊 CRM</h1>
              <p className="text-orange-200 text-sm">Quản lý khách hàng &amp; tuyển sinh</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/admin/crm/leads/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                ➕ Thêm Lead
              </Link>
              <LeadsImportWrapper />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Leads mới', value: newLeads, icon: '🆕', bg: '#dbeafe', color: '#1d4ed8' },
            { label: 'Đang tư vấn', value: processing, icon: '💬', bg: '#fef9c3', color: '#854d0e' },
            { label: 'Đã đăng ký tháng này', value: converted, icon: '✅', bg: '#dcfce7', color: '#166534' },
            { label: 'Tỷ lệ chuyển đổi', value: `${conversionRate}%`, icon: '📈', bg: '#fae8ff', color: '#7e22ce' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: s.bg, border: `1px solid ${s.color}22` }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: s.color }}>{s.icon} {s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* CTA cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/crm/pipeline"
            className="relative overflow-hidden rounded-2xl p-6 text-white hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)' }}
          >
            <div
              className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full pointer-events-none"
              style={{ transform: 'translate(30%, -40%)' }}
            />
            <div className="relative">
              <span className="text-4xl leading-none">📋</span>
              <h3 className="text-lg font-black mt-3">Xem Pipeline</h3>
              <p className="text-sm text-white/75 mt-1">Kanban board — kéo thả lead qua từng giai đoạn</p>
            </div>
          </Link>

          <Link
            href="/admin/crm/leads/new"
            className="relative overflow-hidden rounded-2xl p-6 text-white hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)' }}
          >
            <div
              className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full pointer-events-none"
              style={{ transform: 'translate(30%, -40%)' }}
            />
            <div className="relative">
              <span className="text-4xl leading-none">➕</span>
              <h3 className="text-lg font-black mt-3">Thêm Lead</h3>
              <p className="text-sm text-white/75 mt-1">Thêm khách hàng tiềm năng vào pipeline</p>
            </div>
          </Link>
        </div>

        {/* Leads DataTable */}
        <Suspense fallback={<div className="bg-white rounded-2xl p-4 shadow-sm h-64 animate-pulse" />}>
          <LeadsTable
            data={leadsData.map((l) => ({
              id: l.id,
              name: l.name,
              phone: l.phone,
              email: null,
              note: l.note,
              status: l.status,
              createdAt: l.createdAt,
            }))}
            totalCount={leadsTotal}
            currentPage={currentPage}
            pageSize={validPageSize}
            searchValue={search ?? ''}
          />
        </Suspense>
      </div>
    </div>
  )
}
