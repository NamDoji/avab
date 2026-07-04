import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period')

  const records = await prisma.kpiRecord.findMany({
    where: period ? { period } : undefined,
    include: {
      user: { select: { id: true, name: true, role: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, period, targets, overallScore, rating, reviewedBy } = body

  if (!userId || !period) {
    return NextResponse.json({ error: 'userId và period là bắt buộc' }, { status: 400 })
  }

  // Upsert: nếu đã có record cho user+period thì update, ngược lại create
  const existing = await prisma.kpiRecord.findFirst({ where: { userId, period } })

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
      },
    })
  }

  return NextResponse.json({ success: true, record })
}
