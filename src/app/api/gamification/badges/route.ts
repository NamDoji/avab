import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        key: true,
        name: true,
        icon: true,
        color: true,
        xpReward: true,
        coinReward: true,
        description: true,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, data: badges })
  } catch (err) {
    console.error('[gamification/badges] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
