import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function adminOnly(session: any) {
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// PATCH: mark an installment item as paid or update status
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const body = await req.json()
  const { id } = await context.params

  const plan = await prisma.installmentPlan.findUnique({ where: { id } })
  if (!plan) return NextResponse.json({ error: 'Không tìm thấy kế hoạch' }, { status: 404 })

  interface InstallmentItem {
    dueDate: string
    amount: number
    isPaid: boolean
    paidAt: string | null
  }

  let installments = plan.installments as unknown as unknown as InstallmentItem[]

  // Mark specific installment paid
  if (body.installmentIndex !== undefined) {
    const idx = Number(body.installmentIndex)
    installments = installments.map((item, i) =>
      i === idx ? { ...item, isPaid: true, paidAt: new Date().toISOString() } : item
    )
    // Auto-complete if all paid
    const allPaid = installments.every(i => i.isPaid)
    const updated = await prisma.installmentPlan.update({
      where: { id },
      data: {
        installments: installments as object[],
        status: allPaid ? 'completed' : plan.status,
      },
    })
    return NextResponse.json({ plan: updated })
  }

  // Update status directly
  if (body.status !== undefined) {
    const updated = await prisma.installmentPlan.update({
      where: { id },
      data: { status: body.status },
    })
    return NextResponse.json({ plan: updated })
  }

  return NextResponse.json({ error: 'Không có thay đổi hợp lệ' }, { status: 400 })
}
