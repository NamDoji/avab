import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Group student answers by userId, sum scores
    const scores = await prisma.studentAnswer.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
      take: 10,
    })

    const userIds = scores.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    })

    const leaderboard = scores.map((s: typeof scores[0], idx: number) => {
      const user = users.find((u: typeof users[0]) => u.id === s.userId)
      return {
        rank: idx + 1,
        userId: s.userId,
        name: user?.name || 'Học viên',
        totalScore: s._sum.score || 0,
      }
    })

    return NextResponse.json({ success: true, data: leaderboard })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
