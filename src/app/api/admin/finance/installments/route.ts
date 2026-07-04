import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function adminOnly(session: any) {
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

interface InstallmentItem {
  dueDate: string
  amount: number
  isPaid: boolean
  paidAt: string | null
}

export async function GET(req: NextRequest) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId') ?? undefined
  const status = searchParams.get('status') ?? undefined

  const plans = await prisma.installmentPlan.findMany({
    where: {
      ...(organizationId ? { organizationId } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  // Enrich with payment info
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

  const enriched = plans.map(plan => {
    const payment = paymentMap.get(plan.paymentId)
    const installments = plan.installments as unknown as unknown as InstallmentItem[]
    const paidCount = installments.filter(i => i.isPaid).length
    const paidAmount = installments.filter(i => i.isPaid).reduce((s, i) => s + i.amount, 0)

    // Check if overdue
    const now = new Date()
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
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }
  })

  return NextResponse.json({ plans: enriched })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const body = await req.json()
  const { paymentId, totalAmount, installments, organizationId } = body

  if (!paymentId || !totalAmount || !installments) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  // Verify payment exists
  const payment = await prisma.tuitionPayment.findUnique({ where: { id: paymentId } })
  if (!payment) {
    return NextResponse.json({ error: 'Hóa đơn không tồn tại' }, { status: 404 })
  }

  const plan = await prisma.installmentPlan.create({
    data: {
      paymentId,
      totalAmount: Number(totalAmount),
      installments,
      organizationId: organizationId ?? null,
      status: 'active',
    },
  })

  return NextResponse.json({ plan }, { status: 201 })
}
