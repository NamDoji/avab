import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const contracts = await prisma.contract.findMany({
    where: status ? { status } : undefined,
    include: {
      employee: { select: { id: true, name: true, role: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ contracts })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, type, startDate, endDate, salary, position, notes } = body

  if (!userId || !type || !startDate) {
    return NextResponse.json({ error: 'userId, type, startDate là bắt buộc' }, { status: 400 })
  }

  const contract = await prisma.contract.create({
    data: {
      userId,
      type,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      salary: salary ? Number(salary) : null,
      position: position ?? null,
      notes: notes ?? null,
      status: 'active',
    },
    include: {
      employee: { select: { id: true, name: true, role: true, phone: true } },
    },
  })

  return NextResponse.json({ success: true, contract })
}
