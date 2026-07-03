import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Hóa đơn học phí — AvaB' }

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const fmtDate = (d: Date) =>
  d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default async function InvoicesPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const collections = await prisma.tuitionCollection.findMany({
    include: {
      course: { select: { id: true, name: true, grade: true, campusId: true } },
      payments: {
        include: {
          enrollment: { include: { user: { select: { name: true, phone: true } } } },
        },
      },
      _count: { select: { payments: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Stats
  const totalCollections = collections.length
  const totalInvoices = collections.reduce((acc, c) => acc + c._count.payments, 0)
  const totalPaid = collections.reduce(
    (acc, c) => acc + c.payments.filter((p) => p.isPaid).length,
    0,
  )
  const totalUnpaid = totalInvoices - totalPaid

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {/* Breadcrumb */}
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
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition shadow"
            >
              <span>+</span> Tạo đợt thu mới
            </Link>
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
            <p className="text-3xl font-black">{totalInvoices}</p>
          </div>
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">✅ Đã thu</p>
            <p className="text-3xl font-black">{totalPaid}</p>
          </div>
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{
              background:
                totalUnpaid > 0
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">🔴 Chưa thu</p>
            <p className="text-3xl font-black">{totalUnpaid}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900 text-lg">📋 Danh sách đợt thu</h2>
              <p className="text-xs text-gray-500 mt-0.5">50 đợt thu gần nhất</p>
            </div>
          </div>

          {collections.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 font-semibold">Chưa có đợt thu nào</p>
              <p className="text-sm text-gray-400 mt-1">
                Chọn một khóa học để tạo đợt thu học phí
              </p>
              <Link
                href="/admin/courses"
                className="inline-block mt-4 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
              >
                + Tạo đợt thu mới
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                    <th className="text-left px-6 py-3">Tiêu đề đợt thu</th>
                    <th className="text-left px-4 py-3">Khóa học</th>
                    <th className="text-center px-4 py-3">Số HĐ</th>
                    <th className="text-center px-4 py-3">Đã thu / Tổng</th>
                    <th className="text-left px-4 py-3 min-w-[120px]">Tiến độ</th>
                    <th className="text-left px-4 py-3">Ngày tạo</th>
                    <th className="text-center px-6 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {collections.map((col) => {
                    const paidCount = col.payments.filter((p) => p.isPaid).length
                    const total = col._count.payments
                    const rate = total > 0 ? Math.round((paidCount / total) * 100) : 0
                    const paidAmount = col.payments
                      .filter((p) => p.isPaid)
                      .reduce((s, p) => s + p.amount, 0)

                    return (
                      <tr key={col.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{col.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmtVND(col.totalAmount)} / học sinh
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/courses/${col.course.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 transition"
                          >
                            {col.course.name}
                          </Link>
                          {col.course.grade && (
                            <p className="text-xs text-gray-400">Lớp {col.course.grade}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-gray-700">
                          {total}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-emerald-600">{paidCount}</span>
                          <span className="text-gray-400"> / {total}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{fmtVND(paidAmount)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${rate}%`,
                                  background:
                                    rate >= 80
                                      ? '#059669'
                                      : rate >= 50
                                      ? '#f59e0b'
                                      : '#ef4444',
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-bold w-8 text-right"
                              style={{
                                color:
                                  rate >= 80
                                    ? '#059669'
                                    : rate >= 50
                                    ? '#d97706'
                                    : '#dc2626',
                              }}
                            >
                              {rate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs">
                          {fmtDate(col.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/admin/finance/invoices/${col.id}`}
                            className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
                            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                          >
                            Chi tiết
                          </Link>
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
    </main>
  )
}
