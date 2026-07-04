import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return { session, userId, orgCtx }
}

// PATCH /api/admin/finance/payments/[id] — mark payment as paid
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin(req)
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id } = await params
  const body = await req.json()
  const { isPaid } = body

  if (typeof isPaid !== 'boolean') {
    return NextResponse.json(
      { success: false, error: 'isPaid phải là boolean' },
      { status: 400 },
    )
  }

  // Validate org ownership before mutating
  if (check.orgCtx) {
    const existing = await prisma.tuitionPayment.findUnique({
      where: { id },
      select: { enrollment: { select: { course: { select: { organizationId: true } } } } },
    })
    if (!existing || existing.enrollment.course.organizationId !== check.orgCtx.id) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hóa đơn' }, { status: 404 })
    }
  }

  const payment = await prisma.tuitionPayment.update({
    where: { id },
    data: {
      isPaid,
      paidAt: isPaid ? new Date() : null,
    },
  })

  return NextResponse.json({ success: true, data: payment })
}
