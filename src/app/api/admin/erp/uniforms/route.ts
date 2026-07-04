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
  const items = await prisma.uniformItem.findMany({
    where: { ...(orgId ? { organizationId: orgId } : {}), isActive: true },
    include: { _count: { select: { orders: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin((session.user as { role?: string })?.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const item = await prisma.uniformItem.create({ data: body })
  return NextResponse.json(item)
}
