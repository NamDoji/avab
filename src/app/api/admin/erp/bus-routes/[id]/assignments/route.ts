import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function isAdmin(role?: string) {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role ?? '')
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session || !isAdmin((session.user as { role?: string })?.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: busRouteId } = await params
  const { userId, note } = await req.json()
  const assignment = await prisma.busAssignment.upsert({
    where: { busRouteId_userId: { busRouteId, userId } },
    create: { busRouteId, userId, note },
    update: { note },
  })
  return NextResponse.json(assignment)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session || !isAdmin((session.user as { role?: string })?.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: busRouteId } = await params
  const { userId } = await req.json()
  await prisma.busAssignment.deleteMany({ where: { busRouteId, userId } })
  return NextResponse.json({ ok: true })
}
