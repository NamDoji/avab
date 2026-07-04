import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function adminOnly(session: any) {
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId') ?? undefined

  const vouchers = await prisma.voucher.findMany({
    where: organizationId ? { organizationId } : {},
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ vouchers })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const body = await req.json()
  const {
    code,
    name,
    type,
    value,
    minOrderAmount,
    maxUses,
    validFrom,
    validTo,
    organizationId,
  } = body

  if (!code || !name || !type || value === undefined) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  if (!['percent', 'fixed'].includes(type)) {
    return NextResponse.json({ error: 'type phải là percent hoặc fixed' }, { status: 400 })
  }

  // Check unique code
  const existing = await prisma.voucher.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: 'Mã voucher đã tồn tại' }, { status: 409 })
  }

  const voucher = await prisma.voucher.create({
    data: {
      code: code.toUpperCase().trim(),
      name,
      type,
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
      organizationId: organizationId ?? null,
      isActive: true,
    },
  })

  return NextResponse.json({ voucher }, { status: 201 })
}
