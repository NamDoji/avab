import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import MarkPaidButton from '@/components/admin/finance/MarkPaidButton'

export const metadata = { title: 'Chi tiết đợt thu — AvaB' }

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const fmtDate = (d: Date | null): string => {
  if (!d) return '—'
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const { id } = await params

  const collection = await prisma.tuitionCollection.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, name: true, grade: true } },
      payments: {
        include: {
          enrollment: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { payments: true } },
    },
  })

  if (!collection) notFound()

  const paidPayments = collection.payments.filter((p) => p.isPaid)
  const unpaidPayments = collection.payments.filter((p) => !p.isPaid)
  const totalCollected = paidPayments.reduce((s, p) => s + p.amount, 0)
  const totalPending = unpaidPayments.reduce((s, p) => s + p.amount, 0)
  const rate =
    collection._count.payments > 0
      ? Math.round((paidPayments.length / collection._count.payments) * 100)
      : 0

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-2 text-emerald-300 text-xs mb-2">
            <Link href="/admin/finance" className="hover:text-white transition">
              Finance Dashboard
            </Link>
            <span>›</span>
            <Link href="/admin/finance/invoices" className="hover:text-white transition">
              Invoices
            </Link>
            <span>›</span>
            <span className="text-white font-semibold truncate max-w-[200px]">
              {collection.title}
            </span>
          </nav>
          <h1 className="text-2xl font-black text-white">{collection.title}</h1>
          <p className="text-emerald-200 text-sm mt-0.5">
            Khóa học:{' '}
            <Link
              href={`/admin/courses/${collection.course.id}`}
              className="text-white font-semibold hover:underline"
            >
              {collection.course.name}
            </Link>
            {collection.course.grade && ` · Lớp ${collection.course.grade}`}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">👥 Tổng học sinh</p>
            <p className="text-3xl font-black">{collection._count.payments}</p>
          </div>
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">✅ Đã đóng</p>
            <p className="text-3xl font-black">{paidPayments.length}</p>
            <p className="text-xs opacity-75 mt-1">{fmtVND(totalCollected)}</p>
          </div>
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{
              background:
                unpaidPayments.length > 0
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">🔴 Chưa đóng</p>
            <p className="text-3xl font-black">{unpaidPayments.length}</p>
            <p className="text-xs opacity-75 mt-1">{fmtVND(totalPending)}</p>
          </div>
          <div
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1">📊 Tỷ lệ thu</p>
            <p className="text-3xl font-black">{rate}%</p>
            <div className="mt-1.5 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">📄 Danh sách hóa đơn</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {collection._count.payments} học sinh trong đợt thu này
            </p>
          </div>

          {collection.payments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500">Chưa có hóa đơn nào trong đợt thu này</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                    <th className="text-left px-6 py-3">Học sinh</th>
                    <th className="text-left px-4 py-3">SĐT</th>
                    <th className="text-right px-4 py-3">Số tiền</th>
                    <th className="text-center px-4 py-3">Trạng thái</th>
                    <th className="text-center px-4 py-3">Ngày đóng</th>
                    <th className="text-center px-6 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {collection.payments.map((payment) => {
                    const student = payment.enrollment.user
                    const name = student.name ?? student.phone
                    return (
                      <tr
                        key={payment.id}
                        className={`hover:bg-gray-50/50 transition ${payment.isFree ? 'opacity-60' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{name}</p>
                          {payment.isFree && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold">
                              Miễn phí
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-500">{student.phone}</td>
                        <td className="px-4 py-4 text-right font-bold text-gray-800">
                          {fmtVND(payment.amount)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {payment.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                              ✅ Đã thu
                            </span>
                          ) : payment.isFree ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                              🎁 Miễn phí
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                              🔴 Chưa thu
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-xs text-gray-500">
                          {fmtDate(payment.paidAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {!payment.isFree && (
                            <MarkPaidButton
                              paymentId={payment.id}
                              isPaid={payment.isPaid}
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick link to course tuition */}
        <div className="flex justify-end">
          <Link
            href={`/admin/courses/${collection.course.id}/tuition`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
          >
            ⚙️ Quản lý đợt thu trong Course
          </Link>
        </div>
      </div>
    </main>
  )
}
