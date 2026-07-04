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
  const period = searchParams.get('period')

  const records = await prisma.kpiRecord.findMany({
    where: {
      ...(orgCtx ? { organizationId: orgCtx.id } : {}),
      ...(period ? { period } : {}),
    },
    include: {
      user: { select: { id: true, name: true, role: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })
  const { orgCtx } = check

  const body = await req.json()
  const { userId, period, targets, overallScore, rating, reviewedBy } = body

  if (!userId || !period) {
    return NextResponse.json({ error: 'userId và period là bắt buộc' }, { status: 400 })
  }

  // Upsert: nếu đã có record cho user+period thì update, ngược lại create
  const existing = await prisma.kpiRecord.findFirst({
    where: {
      userId,
      period,
      ...(orgCtx ? { organizationId: orgCtx.id } : {}),
    },
  })

  let record
  if (existing) {
    record = await prisma.kpiRecord.update({
      where: { id: existing.id },
      data: {
        targets: targets ?? [],
        overallScore: overallScore ?? null,
        rating: rating ?? null,
        reviewedBy: reviewedBy ?? null,
        reviewedAt: new Date(),
      },
    })
  } else {
    record = await prisma.kpiRecord.create({
      data: {
        userId,
        period,
        targets: targets ?? [],
        overallScore: overallScore ?? null,
        rating: rating ?? null,
        reviewedBy: reviewedBy ?? null,
        reviewedAt: new Date(),
        organizationId: orgCtx?.id ?? null,
      },
    })
  }

  return NextResponse.json({ success: true, record })
}
