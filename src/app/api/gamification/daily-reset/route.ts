import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/gamification/daily-reset
 * Cron-style endpoint (call from admin or scheduler).
 * Resets all daily UserMissions whose resetAt < today's midnight.
 */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Start of today (local server midnight)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Collect ids of daily missions
    const dailyMissions = await prisma.mission.findMany({
      where: { type: 'daily', isActive: true },
      select: { id: true },
    })

    if (dailyMissions.length === 0) {
      return NextResponse.json({ success: true, count: 0 })
    }

    const dailyMissionIds = dailyMissions.map((m) => m.id)

    // Reset UserMissions that have progress or were completed before today
    const result = await prisma.userMission.updateMany({
      where: {
        missionId: { in: dailyMissionIds },
        AND: [
          {
            OR: [
              { resetAt: null },
              { resetAt: { lt: todayStart } },
            ],
          },
          {
            OR: [
              { completed: true },
              { progress: { gt: 0 } },
            ],
          },
        ],
      },
      data: {
        progress: 0,
        completed: false,
        claimedAt: null,
        resetAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (err) {
    console.error('[gamification/daily-reset] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
