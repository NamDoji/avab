import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return { session, userId, orgCtx }
}

// PATCH: mark an installment item as paid or update status
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })
  const { orgCtx } = check

  const body = await req.json()
  const { id } = await context.params

  const plan = await prisma.installmentPlan.findUnique({ where: { id } })
  if (!plan) return NextResponse.json({ error: 'Không tìm thấy kế hoạch' }, { status: 404 })

  // Org-scope check: ADMIN chỉ thao tác trên data của org mình
  if (orgCtx && plan.organizationId !== orgCtx.id) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  interface InstallmentItem {
    dueDate: string
    amount: number
    isPaid: boolean
    paidAt: string | null
  }

  let installments = plan.installments as unknown as InstallmentItem[]

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
