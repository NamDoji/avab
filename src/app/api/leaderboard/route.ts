import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Random names for padding the leaderboard (changes daily)
const SAMPLE_NAMES = [
  'Nguyễn Minh Anh', 'Trần Bảo Châu', 'Lê Hoàng Nam', 'Phạm Thùy Linh', 'Hoàng Đức Khôi',
  'Vũ Ngọc Hân', 'Đặng Minh Tuấn', 'Bùi Thu Hà', 'Ngô Quang Huy', 'Đinh Lan Anh',
  'Lý Gia Bảo', 'Mai Thanh Tâm', 'Trịnh Khánh Linh', 'Phan Nhật Minh', 'Cao Bích Ngọc',
  'Dương Quốc Toản', 'Tô Bảo Châu', 'Hồ Minh Khoa', 'Lâm Thảo Nguyên', 'Đoàn Gia Hân',
  'Nguyễn Bảo Long', 'Trần Minh Phúc', 'Lê Thu Hương', 'Phạm Đức Anh', 'Võ Ngọc Mai',
]

function dailySeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function computeLevel(xp: number): number {
  return Math.floor(xp / 500) + 1
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') ?? 'all' // all | week | month

    // Build date filter for XP logs when filtering by period
    let dateFilter: Date | undefined
    if (period === 'week') {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      dateFilter = d
    } else if (period === 'month') {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      dateFilter = d
    }

    let realEntries: Array<{
      rank: number
      userId: string
      name: string
      avatar: string | null
      xp: number
      level: number
      badge: { icon: string; name: string; color: string } | null
      isReal: boolean
    }>

    if (dateFilter) {
      // For week/month: aggregate XP from XPLog within the period
      const xpLogs = await prisma.xPLog.groupBy({
        by: ['userId'],
        _sum: { amount: true },
        where: { createdAt: { gte: dateFilter } },
        orderBy: { _sum: { amount: 'desc' } },
        take: 20,
      })

      const userIds = xpLogs.map((l) => l.userId)
      const [users, userStatsMap, userBadgesMap] = await Promise.all([
        prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, avatar: true },
        }),
        prisma.userStats.findMany({
          where: { userId: { in: userIds } },
          select: { userId: true, xp: true },
        }),
        prisma.userBadge.findMany({
          where: { userId: { in: userIds } },
          include: { badge: { select: { icon: true, name: true, color: true } } },
          orderBy: { earnedAt: 'desc' },
        }),
      ])

      const statsMap = new Map(userStatsMap.map((s) => [s.userId, s.xp]))
      const badgeMap = new Map<string, { icon: string; name: string; color: string } | null>()
      for (const ub of userBadgesMap) {
        if (!badgeMap.has(ub.userId)) badgeMap.set(ub.userId, ub.badge)
      }

      realEntries = xpLogs.map((l, idx) => {
        const user = users.find((u) => u.id === l.userId)
        const totalXp = statsMap.get(l.userId) ?? 0
        return {
          rank: idx + 1,
          userId: l.userId,
          name: user?.name ?? 'Học viên',
          avatar: user?.avatar ?? null,
          xp: l._sum.amount ?? 0,
          level: computeLevel(totalXp),
          badge: badgeMap.get(l.userId) ?? null,
          isReal: true,
        }
      })
    } else {
      // All-time: use UserStats.xp
      const statsRows = await prisma.userStats.findMany({
        orderBy: { xp: 'desc' },
        take: 20,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      })

      const userIds = statsRows.map((s) => s.userId)
      const userBadgesRaw = await prisma.userBadge.findMany({
        where: { userId: { in: userIds } },
        include: { badge: { select: { icon: true, name: true, color: true } } },
        orderBy: { earnedAt: 'desc' },
      })

      const badgeMap = new Map<string, { icon: string; name: string; color: string } | null>()
      for (const ub of userBadgesRaw) {
        if (!badgeMap.has(ub.userId)) badgeMap.set(ub.userId, ub.badge)
      }

      realEntries = statsRows.map((s, idx) => ({
        rank: idx + 1,
        userId: s.userId,
        name: s.user.name ?? 'Học viên',
        avatar: s.user.avatar ?? null,
        xp: s.xp,
        level: computeLevel(s.xp),
        badge: badgeMap.get(s.userId) ?? null,
        isReal: true,
      }))
    }

    // Pad with daily-random fake students to reach 15
    const rng = seededRandom(dailySeed())
    const usedNames = new Set(realEntries.map((e) => e.name))
    const available = SAMPLE_NAMES.filter((n) => !usedNames.has(n))
    const shuffled = [...available].sort(() => rng() - 0.5)

    const fakeEntries: typeof realEntries = []
    const maxXp = realEntries.length > 0
      ? Math.max(...realEntries.map((e) => e.xp), 500)
      : 2000

    for (let i = realEntries.length; i < 15 && fakeEntries.length < 15 - realEntries.length; i++) {
      const name = shuffled[fakeEntries.length] ?? `Học viên ${i + 1}`
      const fakeXp = Math.max(50, Math.floor(maxXp - i * (80 + rng() * 120)))
      fakeEntries.push({
        rank: i + 1,
        userId: `fake-${i}`,
        name,
        avatar: null,
        xp: fakeXp,
        level: computeLevel(fakeXp),
        badge: null,
        isReal: false,
      })
    }

    const leaderboard = [...realEntries, ...fakeEntries]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 15)
      .map((e, idx) => ({ ...e, rank: idx + 1 }))

    return NextResponse.json({ success: true, data: leaderboard, period })
  } catch (err) {
    console.error('[leaderboard] error:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
