import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id

    // Get or create UserStats
    let stats = await prisma.userStats.findUnique({ where: { userId } })
    if (!stats) {
      stats = await prisma.userStats.create({
        data: { userId },
      })
    }

    // Compute level from XP: level = floor(xp / 500) + 1
    const level = Math.floor(stats.xp / 500) + 1
    const currentLevelXP = (level - 1) * 500
    const nextLevelXP = level * 500
    const xpProgress = stats.xp - currentLevelXP
    const xpRequired = nextLevelXP - currentLevelXP

    // Rank: position in UserStats sorted by xp desc
    const usersAbove = await prisma.userStats.count({
      where: { xp: { gt: stats.xp } },
    })
    const rank = usersAbove + 1

    // User badges (earned)
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    })

    // User missions
    const userMissions = await prisma.userMission.findMany({
      where: { userId },
      include: {
        mission: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        xp: stats.xp,
        coin: stats.coin,
        level,
        currentLevelXP,
        nextLevelXP,
        xpProgress,
        xpRequired,
        streak: stats.streak,
        totalAnswers: stats.totalAnswers,
        correctAnswers: stats.correctAnswers,
        lessonsViewed: stats.lessonsViewed,
        lastLoginAt: stats.lastLoginAt,
        rank,
        badges: userBadges,
        missions: userMissions,
      },
    })
  } catch (err) {
    console.error('[gamification/stats] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
