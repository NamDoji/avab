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

// PATCH /api/admin/finance/payments/batch
// Body: { updates: [{ id, isPaid?, isFree?, paidAt?, note? }] }
export async function PATCH(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check)
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status },
    )

  const body = (await req.json()) as {
    updates: Array<{
      id: string
      isPaid?: boolean
      isFree?: boolean
      paidAt?: string | null
      note?: string | null
    }>
  }

  const { updates } = body

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json(
      { success: false, error: 'updates phải là mảng không rỗng' },
      { status: 400 },
    )
  }

  let updated = 0

  // Pre-validate org ownership of all payment IDs (avoid cross-org mutation)
  if (check.orgCtx) {
    const ids = updates.map(u => u.id).filter(Boolean)
    const payments = await prisma.tuitionPayment.findMany({
      where: { id: { in: ids } },
      select: { id: true, enrollment: { select: { course: { select: { organizationId: true } } } } },
    })
    const orgId = check.orgCtx.id
    const allOwned = payments.every(p => p.enrollment.course.organizationId === orgId)
    if (!allOwned) {
      return NextResponse.json(
        { success: false, error: 'Một hoặc nhiều hóa đơn không thuộc tổ chức của bạn' },
        { status: 403 },
      )
    }
  }

  for (const u of updates) {
    if (!u.id) continue

    const data: {
      isPaid?: boolean
      isFree?: boolean
      paidAt?: Date | null
      note?: string | null
    } = {}

    if (u.isPaid !== undefined) data.isPaid = u.isPaid
    if (u.isFree !== undefined) data.isFree = u.isFree
    if (u.note !== undefined) data.note = u.note

    // paidAt resolution:
    // 1. If explicitly provided in payload, use it
    // 2. If marking isPaid=true and no paidAt, auto-set to now
    // 3. If marking isPaid=false and no paidAt, clear it
    if (u.paidAt !== undefined) {
      data.paidAt = u.paidAt ? new Date(u.paidAt) : null
    } else if (u.isPaid === true) {
      data.paidAt = new Date()
    } else if (u.isPaid === false) {
      data.paidAt = null
    }

    await prisma.tuitionPayment.update({
      where: { id: u.id },
      data,
    })
    updated++
  }

  return NextResponse.json({ success: true, updated })
}
