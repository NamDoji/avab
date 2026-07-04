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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })

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
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })
  const { orgCtx } = check

  const { id } = await params

  // Fetch first to verify org ownership
  const existing = await prisma.busRoute.findUnique({ where: { id }, select: { id: true, organizationId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (orgCtx && existing.organizationId !== orgCtx.id) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const body = await req.json()
  const route = await prisma.busRoute.update({ where: { id }, data: body })
  return NextResponse.json(route)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })
  const { orgCtx } = check

  const { id } = await params

  // Fetch first to verify org ownership
  const existing = await prisma.busRoute.findUnique({ where: { id }, select: { id: true, organizationId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (orgCtx && existing.organizationId !== orgCtx.id) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  await prisma.busRoute.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
