/**
 * Shared gamification progress utility.
 * Called server-side from API routes — avoids internal HTTP round-trips.
 */
import { prisma } from '@/lib/prisma'

export interface ProgressResult {
  missionsCompleted: number
  badgesEarned: Array<{ name: string; icon: string; xpReward: number }>
  xpEarned: number
}

/**
 * Record progress for a metric (e.g. 'questions_answered', 'login').
 * Updates all active UserMissions whose mission.metric matches.
 * Awards XP and badges as appropriate.
 */
export async function recordGamificationProgress(
  userId: string,
  metric: string,
  value = 1,
): Promise<ProgressResult> {
  let xpEarned = 0

  // ── 1. Login streak ──────────────────────────────────────────────────────
  if (metric === 'login') {
    xpEarned += await handleLoginStreak(userId)
  }

  // ── 2. Update matching UserMissions ─────────────────────────────────────
  const missions = await prisma.mission.findMany({
    where: { metric, isActive: true },
  })

  const missionsCompletedIds: string[] = []

  for (const mission of missions) {
    // Find or create the user's mission row
    const existing = await prisma.userMission.findUnique({
      where: { userId_missionId: { userId, missionId: mission.id } },
    })

    // If already completed (and not yet reset), skip
    if (existing?.completed) continue

    const currentProgress = existing?.progress ?? 0
    const newProgress = Math.min(currentProgress + value, mission.target)
    const completed = newProgress >= mission.target

    if (existing) {
      await prisma.userMission.update({
        where: { id: existing.id },
        data: { progress: newProgress, completed },
      })
    } else {
      await prisma.userMission.create({
        data: {
          userId,
          missionId: mission.id,
          progress: newProgress,
          completed,
        },
      })
    }

    if (completed) {
      missionsCompletedIds.push(mission.id)
    }
  }

  // ── 3. Badge check ───────────────────────────────────────────────────────
  const badgesEarned = await checkAndAwardBadges(userId, metric)

  const badgeXP = badgesEarned.reduce((sum, b) => sum + b.xpReward, 0)
  if (badgeXP > 0) {
    await prisma.userStats.upsert({
      where: { userId },
      create: { userId, xp: badgeXP },
      update: { xp: { increment: badgeXP } },
    })
    xpEarned += badgeXP
  }

  return {
    missionsCompleted: missionsCompletedIds.length,
    badgesEarned,
    xpEarned,
  }
}

// ── Streak helper ────────────────────────────────────────────────────────────

async function handleLoginStreak(userId: string): Promise<number> {
  const stats = await prisma.userStats.findUnique({ where: { userId } })

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  // Already checked in today → no update, no XP
  if (stats?.lastLoginAt && new Date(stats.lastLoginAt) >= todayStart) {
    return 0
  }

  let newStreak = 1
  if (stats?.lastLoginAt) {
    const lastLogin = new Date(stats.lastLoginAt)
    if (lastLogin >= yesterdayStart) {
      // Consecutive login → extend streak
      newStreak = (stats.streak ?? 0) + 1
    }
    // else: gap > 1 day → reset to 1
  }

  const STREAK_XP = 10
  await prisma.userStats.upsert({
    where: { userId },
    create: { userId, streak: newStreak, lastLoginAt: now, xp: STREAK_XP },
    update: { streak: newStreak, lastLoginAt: now, xp: { increment: STREAK_XP } },
  })

  return STREAK_XP
}

// ── Badge check helper ───────────────────────────────────────────────────────

type BadgeCondition = {
  type?: string
  count?: number
  days?: number
  pct?: number
}

async function checkAndAwardBadges(
  userId: string,
  metric: string,
): Promise<Array<{ name: string; icon: string; xpReward: number }>> {
  const [stats, allBadges, existingBadges] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.badge.findMany({ where: { isActive: true } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ])

  const earnedIds = new Set(existingBadges.map((b) => b.badgeId))
  const awarded: Array<{ name: string; icon: string; xpReward: number }> = []

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue

    const cond = badge.condition as BadgeCondition | null
    if (!cond?.type) continue

    let earned = false

    switch (cond.type) {
      case 'streak':
        if (metric === 'login') {
          earned =
            typeof cond.days === 'number' && (stats?.streak ?? 0) >= cond.days
        }
        break
      case 'login_first':
        if (metric === 'login') earned = true
        break
      case 'correct_answers':
        if (metric === 'questions_answered') {
          earned =
            typeof cond.count === 'number' &&
            (stats?.correctAnswers ?? 0) >= cond.count
        }
        break
      default:
        break
    }

    if (earned) {
      const created = await prisma.userBadge
        .create({ data: { userId, badgeId: badge.id } })
        .catch(() => null)

      if (created) {
        awarded.push({ name: badge.name, icon: badge.icon, xpReward: badge.xpReward })
      }
    }
  }

  return awarded
}
