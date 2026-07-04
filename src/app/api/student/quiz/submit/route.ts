import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SubmitAnswer {
  questionId: string
  selectedAnswer: string
}

interface SubmitBody {
  courseId: string
  answers: SubmitAnswer[]
  timeTaken?: number
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  try {
    const body: SubmitBody = await req.json()
    const { courseId, answers, timeTaken = 0 } = body

    if (!courseId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      )
    }

    // Verify active enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (!enrollment || !['ACTIVE', 'APPROVED'].includes(enrollment.status)) {
      return NextResponse.json(
        { success: false, error: 'Bạn chưa đăng ký khoá học này' },
        { status: 403 }
      )
    }

    // Fetch all questions in one query
    const questionIds = answers.map(a => a.questionId)
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        subjectId: true,
        correctAnswer: true,
        questionType: true,
        points: true,
      },
    })
    const questionMap = new Map(questions.map(q => [q.id, q]))

    // Evaluate answers
    let correctCount = 0
    const upsertOps: Array<{
      userId: string
      questionId: string
      subjectId: string
      answer: string
      isCorrect: boolean
      score: number
    }> = []

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId)
      if (!q) continue

      const isCorrect =
        (ans.selectedAnswer ?? '').trim().toLowerCase() ===
        q.correctAnswer.trim().toLowerCase()

      if (isCorrect) correctCount++

      upsertOps.push({
        userId,
        questionId: ans.questionId,
        subjectId: q.subjectId,
        answer: ans.selectedAnswer ?? '',
        isCorrect,
        score: isCorrect ? q.points : 0,
      })
    }

    // Upsert all student answers
    await Promise.all(
      upsertOps.map(record =>
        prisma.studentAnswer.upsert({
          where: {
            userId_questionId: {
              userId,
              questionId: record.questionId,
            },
          },
          update: {
            answer: record.answer,
            isCorrect: record.isCorrect,
            score: record.score,
          },
          create: record,
        })
      )
    )

    const total = upsertOps.length
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0
    const xpEarned = correctCount * 20

    // Update UserStats (upsert to handle first-time users)
    const updatedStats = await prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        xp: xpEarned,
        totalAnswers: total,
        correctAnswers: correctCount,
      },
      update: {
        xp: { increment: xpEarned },
        totalAnswers: { increment: total },
        correctAnswers: { increment: correctCount },
      },
    })

    // ── Badge check ──────────────────────────────────────────────────────────
    const badgesEarned: Array<{ name: string; icon: string; xpReward: number }> = []

    const [allBadges, existingBadges] = await Promise.all([
      prisma.badge.findMany({ where: { isActive: true } }),
      prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      }),
    ])

    const earnedBadgeIds = new Set(existingBadges.map(b => b.badgeId))
    const newBadgeXP = { total: 0 }

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue

      const condition = badge.condition as {
        type?: string
        count?: number
        pct?: number
      } | null

      if (!condition?.type) continue

      let earned = false

      switch (condition.type) {
        case 'first_answer':
          earned = updatedStats.totalAnswers >= 1
          break
        case 'correct_answers':
          earned =
            typeof condition.count === 'number' &&
            updatedStats.correctAnswers >= condition.count
          break
        case 'perfect_quiz':
          earned = pct === 100 && total >= 5
          break
        case 'quiz_complete':
          earned = true
          break
        case 'answers_total':
          earned =
            typeof condition.count === 'number' &&
            updatedStats.totalAnswers >= condition.count
          break
        default:
          break
      }

      if (earned) {
        const created = await prisma.userBadge
          .create({ data: { userId, badgeId: badge.id } })
          .catch(() => null) // guard against race condition duplicates

        if (created) {
          badgesEarned.push({
            name: badge.name,
            icon: badge.icon,
            xpReward: badge.xpReward,
          })
          if (badge.xpReward > 0) {
            newBadgeXP.total += badge.xpReward
          }
        }
      }
    }

    // Award badge XP in a single update
    if (newBadgeXP.total > 0) {
      await prisma.userStats.update({
        where: { userId },
        data: { xp: { increment: newBadgeXP.total } },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        score: correctCount,
        total,
        pct,
        xpEarned,
        badgesEarned,
        timeTaken,
      },
    })
  } catch (error) {
    console.error('[student/quiz/submit] error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi server' }, { status: 500 })
  }
}
