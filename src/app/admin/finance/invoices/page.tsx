import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'
import InvoicesTable from './InvoicesTable'

export const metadata = { title: 'Hóa đơn học phí — AvaB' }

type SearchParams = Promise<{
  search?: string
  page?: string
  pageSize?: string
}>

export default async function InvoicesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const { search, page, pageSize } = await searchParams

  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const pageSizeNum = parseInt(pageSize ?? '20', 10)
  const validPageSize = [20, 50, 100, 200].includes(pageSizeNum) ? pageSizeNum : 20

  const whereSearch = search
    ? { title: { contains: search, mode: 'insensitive' as const } }
    : {}

  const [collections, totalCount, allCollections] = await Promise.all([
    prisma.tuitionCollection.findMany({
      where: whereSearch,
      include: {
        course: { select: { id: true, name: true, grade: true } },
        payments: { select: { isPaid: true, amount: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * validPageSize,
      take: validPageSize,
    }),
    prisma.tuitionCollection.count({ where: whereSearch }),
    // Stats: always all data
    prisma.tuitionCollection.findMany({
      select: { _count: { select: { payments: true } }, payments: { select: { isPaid: true } } },
    }),
  ])

  // Global stats (all collections)
  const totalCollections = await prisma.tuitionCollection.count()
  const statsAgg = allCollections.reduce(
    (acc, c) => {
      const paid = c.payments.filter((p) => p.isPaid).length
      return {
        totalInvoices: acc.totalInvoices + c._count.payments,
        totalPaid: acc.totalPaid + paid,
      }
    },
    { totalInvoices: 0, totalPaid: 0 },
  )

  // Map to row format
  const rows = collections.map((col) => {
    const paidCount = col.payments.filter((p) => p.isPaid).length
    const total = col._count.payments
    const rate = total > 0 ? Math.round((paidCount / total) * 100) : 0
    const paidAmount = col.payments.filter((p) => p.isPaid).reduce((s, p) => s + p.amount, 0)
    return {
      id: col.id,
      title: col.title,
      totalAmount: col.totalAmount,
      createdAt: col.createdAt,
      course: { id: col.course.id, name: col.course.name, grade: col.course.grade },
      paidCount,
      totalPayments: total,
      paidAmount,
      rate,
    }
  })

  return (
    <main className="min-h-screen bg-gray-50 pt-14">
      {/* Header */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <nav className="flex items-center gap-2 text-emerald-300 text-xs mb-2">
                <Link href="/admin/finance" className="hover:text-white transition">
                  Finance Dashboard
                </Link>
                <span>›</span>
                <span className="text-white font-semibold">Invoices</span>
              </nav>
              <h1 className="text-2xl font-black text-white">📋 Hóa đơn học phí</h1>
              <p className="text-emerald-200 text-sm mt-0.5">
                Quản lý các đợt thu học phí theo khóa học
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/admin/finance/template"
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition shadow"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                📄 Tải template học phí
              </a>
              <Link
                href="/admin/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition shadow"
              >
                <span>+</span> Tạo đợt thu mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">📋 Tổng đợt thu</p>
            <p className="text-3xl font-black">{totalCollections}</p>
          </div>
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">📄 Tổng HĐ</p>
            <p className="text-3xl font-black">{statsAgg.totalInvoices}</p>
          </div>
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">✅ Đã thu</p>
            <p className="text-3xl font-black">{statsAgg.totalPaid}</p>
          </div>
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{
              background:
                statsAgg.totalInvoices - statsAgg.totalPaid > 0
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">🔴 Chưa thu</p>
            <p className="text-3xl font-black">{statsAgg.totalInvoices - statsAgg.totalPaid}</p>
          </div>
        </div>

        {/* Invoices DataTable — horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <Suspense fallback={<div className="bg-white rounded-2xl p-4 shadow-sm h-64 animate-pulse" />}>
          <InvoicesTable
            data={rows}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={validPageSize}
            searchValue={search ?? ''}
          />
        </Suspense>
        </div>
      </div>
    </main>
  )
}
