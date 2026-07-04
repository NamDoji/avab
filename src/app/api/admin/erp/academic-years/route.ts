import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'

function isAdmin(role?: string) { return ['ADMIN','SUPER_ADMIN'].includes(role ?? '') }

export async function GET() {
  const session = await auth()
  if (!session || !isAdmin((session.user as any)?.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any)?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  const years = await prisma.academicYear.findMany({
    where: orgCtx?.id ? { organizationId: orgCtx.id } : {},
    orderBy: { startDate: 'desc' },
  })
  return NextResponse.json(years)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin((session.user as any)?.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any)?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  if (!orgCtx?.id) return NextResponse.json({ error: 'No org' }, { status: 400 })
  const { name, startDate, endDate, isCurrent } = await req.json()
  if (isCurrent) {
    await prisma.academicYear.updateMany({ where: { organizationId: orgCtx.id }, data: { isCurrent: false } })
  }
  const year = await prisma.academicYear.create({
    data: { organizationId: orgCtx.id, name, startDate: new Date(startDate), endDate: new Date(endDate), isCurrent: !!isCurrent },
  })
  return NextResponse.json(year)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || !isAdmin((session.user as any)?.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any)?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  const { id, isCurrent } = await req.json()
  if (isCurrent && orgCtx?.id) {
    await prisma.academicYear.updateMany({ where: { organizationId: orgCtx.id }, data: { isCurrent: false } })
  }
  const year = await prisma.academicYear.update({ where: { id }, data: { isCurrent: !!isCurrent } })
  return NextResponse.json(year)
}
