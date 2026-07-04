import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'
import { LeadsImportWrapper } from './LeadsImportWrapper'
import LeadsTable from './LeadsTable'
import QuickActionsBar from './QuickActionsBar'
import PageHeader from '@/components/admin/PageHeader'

export const metadata = { title: 'CRM — AvaB EOS' }

type SearchParams = Promise<{
  search?: string
  page?: string
  pageSize?: string
}>

export default async function CRMPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { search, page, pageSize } = await searchParams

  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const pageSizeNum = parseInt(pageSize ?? '50', 10)
  const validPageSize = [20, 50, 100, 200].includes(pageSizeNum) ? pageSizeNum : 50

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  // Monday-start week
  const dow = now.getDay()
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  thisWeekStart.setHours(0, 0, 0, 0)

  const whereSearch = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const [
    total,
    newLeads,
    processing,
    wonAll,
    lostAll,
    thisWeekAdded,
    thisWeekConverted,
    thisWeekLost,
    leadsData,
    leadsTotal,
  ] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: 'NEW' } }),
    prisma.registration.count({ where: { status: 'FOLLOWUP' } }),
    prisma.registration.count({ where: { status: 'WON' } }),
    prisma.registration.count({ where: { status: 'LOST' } }),
    prisma.registration.count({ where: { createdAt: { gte: thisWeekStart } } }),
    prisma.registration.count({ where: { status: 'WON', updatedAt: { gte: thisWeekStart } } }),
    prisma.registration.count({ where: { status: 'LOST', updatedAt: { gte: thisWeekStart } } }),
    prisma.registration.findMany({
      where: whereSearch,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * validPageSize,
      take: validPageSize,
    }),
    prisma.registration.count({ where: whereSearch }),
  ])

  const conversionRate = total > 0 ? Math.round((wonAll / total) * 100) : 0

  // Funnel: proportional widths based on each stage count vs total
  const funnelMax = Math.max(total, 1)
  const funnelStages = [
    { key: 'NEW',      label: 'Mới',         count: newLeads,   color: '#1d4ed8', icon: '🆕' },
    { key: 'FOLLOWUP', label: 'Đang tư vấn', count: processing, color: '#854d0e', icon: '💬' },
    { key: 'WON',      label: 'Đã đăng ký',  count: wonAll,     color: '#166534', icon: '✅' },
    { key: 'LOST',     label: 'Không ĐK',    count: lostAll,    color: '#991b1b', icon: '❌' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="CRM"
        icon="📊"
        subtitle={`Quản lý khách hàng & tuyển sinh · ${total} leads`}
        gradient="linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)"
        breadcrumb={[{ label: 'Admin', href: '/admin' }]}
        actions={
          <>
            <Link
              href="/admin/crm/leads/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              ➕ Thêm Lead
            </Link>
            <LeadsImportWrapper />
          </>
        }
      />

      <div className="container-custom py-6 space-y-6">

        {/* ── Quick Actions Row ─────────────────────────────────────── */}
        <QuickActionsBar />

        {/* ── Summary Stats ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Leads mới (NEW)',  value: newLeads,          icon: '🆕', bg: '#dbeafe', color: '#1d4ed8' },
            { label: 'Đang tư vấn',      value: processing,         icon: '💬', bg: '#fef9c3', color: '#854d0e' },
            { label: 'Đã đăng ký',       value: wonAll,             icon: '✅', bg: '#dcfce7', color: '#166534' },
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

        {/* ── Funnel + This Week ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Conversion Funnel */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-black text-gray-800 mb-4">🔻 Conversion Funnel</h2>
            <div className="space-y-3">
              {funnelStages.map((stage) => {
                const pct = Math.max(6, Math.round((stage.count / funnelMax) * 100))
                return (
                  <div key={stage.key} className="flex items-center gap-3">
                    <span
                      className="w-28 text-xs font-bold shrink-0 text-right"
                      style={{ color: stage.color }}
                    >
                      {stage.icon} {stage.label}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden relative">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: stage.color, transition: 'width 0.4s ease' }}
                      />
                      <span
                        className="absolute inset-y-0 right-2 flex items-center text-xs font-black"
                        style={{ color: stage.color }}
                      >
                        {stage.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-gray-500">Tổng <strong className="text-gray-800">{total}</strong> leads</span>
              <span
                className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#f3e8ff', color: '#7e22ce' }}
              >
                {conversionRate}% tỷ lệ chuyển đổi
              </span>
            </div>
          </div>

          {/* This Week Activity */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-black text-gray-800 mb-4">📅 Hoạt động tuần này</h2>
            <div className="space-y-3">
              {[
                { label: 'Leads mới thêm vào',    value: thisWeekAdded,     icon: '➕', color: '#1d4ed8', bg: '#dbeafe' },
                { label: 'Đã chuyển đổi (WON)',   value: thisWeekConverted, icon: '✅', color: '#166534', bg: '#dcfce7' },
                { label: 'Không đăng ký (LOST)',  value: thisWeekLost,      icon: '❌', color: '#991b1b', bg: '#fee2e2' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5"
                  style={{ background: item.bg }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-semibold" style={{ color: item.color }}>
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xl font-black" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
              Từ đầu tuần (Thứ 2) đến hôm nay
            </div>
          </div>

        </div>

        {/* ── CTA Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/crm/pipeline"
            className="relative overflow-hidden rounded-2xl p-5 text-white hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)' }}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full pointer-events-none"
              style={{ transform: 'translate(30%, -40%)' }}
            />
            <div className="relative">
              <span className="text-3xl leading-none">📋</span>
              <h3 className="text-base font-black mt-2">Pipeline Kanban</h3>
              <p className="text-xs text-white/75 mt-0.5">Kéo thả lead qua từng giai đoạn</p>
            </div>
          </Link>

          <Link
            href="/admin/crm/campaigns"
            className="relative overflow-hidden rounded-2xl p-5 text-white hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full pointer-events-none"
              style={{ transform: 'translate(30%, -40%)' }}
            />
            <div className="relative">
              <span className="text-3xl leading-none">📣</span>
              <h3 className="text-base font-black mt-2">Campaigns</h3>
              <p className="text-xs text-white/75 mt-0.5">Email · SMS · Zalo · Social Media</p>
            </div>
          </Link>

          <Link
            href="/admin/crm/leads/new"
            className="relative overflow-hidden rounded-2xl p-5 text-white hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)' }}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full pointer-events-none"
              style={{ transform: 'translate(30%, -40%)' }}
            />
            <div className="relative">
              <span className="text-3xl leading-none">➕</span>
              <h3 className="text-base font-black mt-2">Thêm Lead</h3>
              <p className="text-xs text-white/75 mt-0.5">Thêm khách hàng tiềm năng</p>
            </div>
          </Link>
        </div>

        {/* ── Leads DataTable ───────────────────────────────────────── */}
        <Suspense
          fallback={<div className="bg-white rounded-2xl p-4 shadow-sm h-64 animate-pulse" />}
        >
          <LeadsTable
            data={leadsData.map((l) => ({
              id: l.id,
              name: l.name,
              phone: l.phone,
              email: l.email,
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
