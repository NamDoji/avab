import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function isAdmin(role?: string) {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role ?? '')
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin((session.user as { role?: string })?.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('organizationId')
  const status = searchParams.get('status')
  const orders = await prisma.uniformOrder.findMany({
    where: {
      ...(orgId ? { organizationId: orgId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      uniformItem: { select: { name: true, code: true, type: true } },
      user: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { orderedAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin((session.user as { role?: string })?.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const order = await prisma.uniformOrder.create({
    data: {
      ...body,
      totalPrice: body.totalPrice ?? 0,
      updatedAt: new Date(),
    },
    include: {
      uniformItem: { select: { name: true } },
      user: { select: { name: true, phone: true } },
    },
  })
  return NextResponse.json(order)
}
