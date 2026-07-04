import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { recordGamificationProgress } from '@/lib/gamification-progress'

/**
 * POST /api/gamification/progress
 * Body: { metric: string, value?: number }
 * Updates UserMissions matching the metric, checks badge conditions,
 * and returns { missionsCompleted, badgesEarned, xpEarned }.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  try {
    const body = await req.json() as { metric?: string; value?: number }
    const { metric, value = 1 } = body

    if (!metric) {
      return NextResponse.json({ error: 'metric is required' }, { status: 400 })
    }

    const result = await recordGamificationProgress(userId, metric, value)

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[gamification/progress] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
