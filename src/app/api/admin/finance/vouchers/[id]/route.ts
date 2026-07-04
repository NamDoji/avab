import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function adminOnly(session: any) {
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const body = await req.json()
  const { id } = await context.params

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
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const { id } = await context.params

  await prisma.voucher.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
