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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })
  const { orgCtx } = check

  const body = await req.json()
  const { id } = await context.params

  // Fetch first to verify org ownership
  const existing = await prisma.scholarship.findUnique({ where: { id }, select: { id: true, organizationId: true } })
  if (!existing) return NextResponse.json({ error: 'Không tìm thấy học bổng' }, { status: 404 })
  if (orgCtx && existing.organizationId !== orgCtx.id) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const scholarship = await prisma.scholarship.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.amount !== undefined && { amount: Number(body.amount) }),
      ...(body.reason !== undefined && { reason: body.reason }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
    },
  })

  return NextResponse.json({ scholarship })
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })
  const { orgCtx } = check

  const { id } = await context.params

  // Fetch first to verify org ownership
  const existing = await prisma.scholarship.findUnique({ where: { id }, select: { id: true, organizationId: true } })
  if (!existing) return NextResponse.json({ error: 'Không tìm thấy học bổng' }, { status: 404 })
  if (orgCtx && existing.organizationId !== orgCtx.id) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  await prisma.scholarship.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
