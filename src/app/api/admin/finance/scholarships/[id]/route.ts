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
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const body = await req.json()
  const { id } = params

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
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  await prisma.scholarship.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
