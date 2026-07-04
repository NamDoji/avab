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
  const existing = await prisma.voucher.findUnique({ where: { id }, select: { id: true, organizationId: true } })
  if (!existing) return NextResponse.json({ error: 'Không tìm thấy voucher' }, { status: 404 })
  if (orgCtx && existing.organizationId !== orgCtx.id) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const voucher = await prisma.voucher.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.value !== undefined && { value: Number(body.value) }),
      ...(body.minOrderAmount !== undefined && { minOrderAmount: body.minOrderAmount ? Number(body.minOrderAmount) : null }),
      ...(body.maxUses !== undefined && { maxUses: body.maxUses ? Number(body.maxUses) : null }),
      ...(body.validFrom !== undefined && { validFrom: body.validFrom ? new Date(body.validFrom) : null }),
      ...(body.validTo !== undefined && { validTo: body.validTo ? new Date(body.validTo) : null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })

  return NextResponse.json({ voucher })
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
  const existing = await prisma.voucher.findUnique({ where: { id }, select: { id: true, organizationId: true } })
  if (!existing) return NextResponse.json({ error: 'Không tìm thấy voucher' }, { status: 404 })
  if (orgCtx && existing.organizationId !== orgCtx.id) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  await prisma.voucher.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
