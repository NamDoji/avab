import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function isAdmin(role?: string) {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role ?? '')
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session || !isAdmin((session.user as { role?: string })?.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const route = await prisma.busRoute.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { user: { select: { id: true, name: true, phone: true } } },
        orderBy: { enrolledAt: 'desc' },
      },
    },
  })
  if (!route) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(route)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session || !isAdmin((session.user as { role?: string })?.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const route = await prisma.busRoute.update({ where: { id }, data: body })
  return NextResponse.json(route)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session || !isAdmin((session.user as { role?: string })?.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.busRoute.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
