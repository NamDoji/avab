import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Trả Góp — AvaB Finance' }

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

interface InstallmentItem {
  dueDate: string
  amount: number
  isPaid: boolean
  paidAt: string | null
}

function StatusBadge({ status, hasOverdue }: { status: string; hasOverdue: boolean }) {
  if (hasOverdue) return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">⚠️ Quá hạn</span>
  )
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: '🔄 Đang trả', cls: 'bg-blue-100 text-blue-700' },
    completed: { label: '✅ Hoàn tất', cls: 'bg-green-100 text-green-700' },
    overdue: { label: '⚠️ Quá hạn', cls: 'bg-red-100 text-red-600' },
  }
  const m = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.cls}`}>{m.label}</span>
}

export default async function InstallmentsPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const plans = await prisma.installmentPlan.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Enrich with payment/student/course data
  const paymentIds = plans.map(p => p.paymentId)
  const payments = paymentIds.length > 0
    ? await prisma.tuitionPayment.findMany({
        where: { id: { in: paymentIds } },
        include: {
          enrollment: {
            include: {
              user: { select: { id: true, name: true, phone: true } },
              course: { select: { id: true, name: true } },
            },
          },
        },
      })
    : []

  const paymentMap = new Map(payments.map(p => [p.id, p]))
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const enriched = plans.map(plan => {
    const payment = paymentMap.get(plan.paymentId)
    const installments = plan.installments as unknown as unknown as InstallmentItem[]
    const paidCount = installments.filter(i => i.isPaid).length
    const paidAmount = installments.filter(i => i.isPaid).reduce((s, i) => s + i.amount, 0)
    const hasOverdue = installments.some(i => !i.isPaid && new Date(i.dueDate) < now)
    const nextDue = installments
      .filter(i => !i.isPaid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] ?? null

    return {
      ...plan,
      installments,
      paidCount,
      paidAmount,
      hasOverdue,
      nextDue,
      student: payment?.enrollment?.user ?? null,
      course: payment?.enrollment?.course ?? null,
    }
  })

  // Upcoming dues in next 7 days
  const upcomingDues = enriched
    .filter(p => p.status === 'active')
    .flatMap(p =>
      p.installments
        .filter(i => !i.isPaid && new Date(i.dueDate) >= now && new Date(i.dueDate) <= in7Days)
        .map(i => ({
          planId: p.id,
          student: p.student,
          course: p.course,
          dueDate: i.dueDate,
          amount: i.amount,
        }))
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const activeCount = enriched.filter(p => p.status === 'active').length
  const overdueCount = enriched.filter(p => p.hasOverdue).length
  const completedCount = enriched.filter(p => p.status === 'completed').length

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/finance"
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white">📋 Trả Góp</h1>
                <p className="text-amber-200 text-sm mt-0.5">
                  Kế hoạch trả góp học phí
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-4">
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-amber-200 text-xs font-semibold">Đang trả</p>
                <p className="text-white font-black text-xl">{activeCount}</p>
              </div>
              {overdueCount > 0 && (
                <div className="bg-red-500/20 rounded-2xl px-4 py-2 text-center">
                  <p className="text-red-200 text-xs font-semibold">Quá hạn</p>
                  <p className="text-white font-black text-xl">{overdueCount}</p>
                </div>
              )}
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-amber-200 text-xs font-semibold">Hoàn tất</p>
                <p className="text-white font-black text-xl">{completedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Upcoming dues */}
        {upcomingDues.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-2">
              <span className="text-lg">⏰</span>
              <h2 className="font-black text-amber-900">Đến hạn trong 7 ngày tới ({upcomingDues.length})</h2>
            </div>
            <div className="divide-y divide-amber-100">
              {upcomingDues.map((due, idx) => {
                const daysLeft = Math.ceil((new Date(due.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={idx} className="px-6 py-4 flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                      style={{
                        background: daysLeft <= 1
                          ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                          : daysLeft <= 3
                          ? 'linear-gradient(135deg, #d97706, #b45309)'
                          : 'linear-gradient(135deg, #059669, #047857)',
                      }}
                    >
                      {daysLeft}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 text-sm">
                        {due.student?.name ?? due.student?.phone ?? 'Học viên'}
                      </p>
                      <p className="text-xs text-amber-700">
                        {due.course?.name ?? 'N/A'} · Hạn: {new Date(due.dueDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-amber-900">{fmtVND(due.amount)}</p>
                      <p className="text-xs text-amber-600">
                        {daysLeft === 0 ? 'Hôm nay' : daysLeft === 1 ? 'Ngày mai' : `${daysLeft} ngày nữa`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Plans list */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">Tất cả kế hoạch trả góp</h2>
          </div>

          {enriched.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-400 text-sm">
              <p className="text-4xl mb-3">📋</p>
              <p>Chưa có kế hoạch trả góp nào.</p>
              <p className="text-xs mt-2 text-gray-400">Tạo kế hoạch trả góp từ API installments.</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-50">
              {enriched.map(plan => {
                const progress = plan.totalAmount > 0
                  ? Math.round((plan.paidAmount / plan.totalAmount) * 100)
                  : 0

                return (
                  <div key={plan.id} className="px-6 py-5 hover:bg-gray-50/50 transition">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">
                            {plan.student?.name ?? plan.student?.phone ?? 'Học viên N/A'}
                          </p>
                          <StatusBadge status={plan.status} hasOverdue={plan.hasOverdue} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {plan.course?.name ?? 'N/A'} · Tạo: {new Date(plan.createdAt).toLocaleDateString('vi-VN')}
                        </p>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Đã đóng {plan.paidCount}/{plan.installments.length} kỳ</span>
                            <span className="font-semibold">
                              {fmtVND(plan.paidAmount)} / {fmtVND(plan.totalAmount)}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${progress}%`,
                                background: plan.status === 'completed'
                                  ? 'linear-gradient(90deg, #059669, #047857)'
                                  : plan.hasOverdue
                                  ? 'linear-gradient(90deg, #dc2626, #b91c1c)'
                                  : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{progress}% hoàn thành</p>
                        </div>

                        {/* Installment detail grid */}
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {plan.installments.map((inst, idx) => {
                            const isDue = !inst.isPaid && new Date(inst.dueDate) < now
                            const isUpcoming = !inst.isPaid && new Date(inst.dueDate) >= now && new Date(inst.dueDate) <= in7Days
                            return (
                              <div
                                key={idx}
                                className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium ${
                                  inst.isPaid
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : isDue
                                    ? 'bg-red-50 border-red-200 text-red-700'
                                    : isUpcoming
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-500'
                                }`}
                              >
                                Kỳ {idx + 1}: {fmtVND(inst.amount)}
                                <span className="ml-1 opacity-70">
                                  {inst.isPaid
                                    ? '✓'
                                    : isDue
                                    ? '⚠'
                                    : new Date(inst.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-gray-900 text-lg">{fmtVND(plan.totalAmount)}</p>
                        {plan.nextDue && (
                          <p className="text-xs text-gray-400 mt-1">
                            Kỳ tới: {new Date(plan.nextDue.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
