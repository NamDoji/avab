import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const body = await request.json() as { missionId?: string }
    const { missionId } = body

    if (!missionId) {
      return NextResponse.json({ error: 'missionId is required' }, { status: 400 })
    }

    // Find the UserMission
    const userMission = await prisma.userMission.findUnique({
      where: { userId_missionId: { userId, missionId } },
      include: { mission: true },
    })

    if (!userMission) {
      return NextResponse.json({ error: 'Mission not found for this user' }, { status: 404 })
    }

    if (!userMission.completed) {
      return NextResponse.json({ error: 'Mission not completed yet' }, { status: 400 })
    }

    if (userMission.claimedAt) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    const xpGained = userMission.mission.xpReward
    const coinGained = userMission.mission.coinReward

    // Claim reward in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark as claimed
      await tx.userMission.update({
        where: { id: userMission.id },
        data: { claimedAt: new Date() },
      })

      // Add XP and Coin to UserStats
      await tx.userStats.upsert({
        where: { userId },
        update: {
          xp: { increment: xpGained },
          coin: { increment: coinGained },
          level: Math.floor(((await tx.userStats.findUnique({ where: { userId } }))?.xp ?? 0 + xpGained) / 500) + 1,
        },
        create: {
          userId,
          xp: xpGained,
          coin: coinGained,
          level: Math.floor(xpGained / 500) + 1,
        },
      })

      // Log XP
      if (xpGained > 0) {
        await tx.xPLog.create({
          data: {
            userId,
            amount: xpGained,
            reason: 'mission_complete',
            metadata: { missionId, missionKey: userMission.mission.key },
          },
        })
      }
    })

    return NextResponse.json({
      success: true,
      xpGained,
      coinGained,
    })
  } catch (err) {
    console.error('[gamification/claim] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
