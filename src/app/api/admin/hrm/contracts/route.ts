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

export async function GET(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })
  const { orgCtx } = check

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const contracts = await prisma.contract.findMany({
    where: {
      ...(orgCtx ? { organizationId: orgCtx.id } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      employee: { select: { id: true, name: true, role: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ contracts })
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })
  const { orgCtx } = check

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
      organizationId: orgCtx?.id ?? null,
    },
    include: {
      employee: { select: { id: true, name: true, role: true, phone: true } },
    },
  })

  return NextResponse.json({ success: true, contract })
}
