import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// AI cá nhân hoá lộ trình học — đề xuất thứ tự chuyên đề tối ưu
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  try {
    const userId = (session.user as any).id

    // Lấy tiến độ học của học sinh
    const answers = await prisma.studentAnswer.findMany({
      where: { userId },
      select: { subjectId: true, isCorrect: true, score: true },
    })

    // Nhóm theo chuyên đề
    const subjectStats: Record<string, { total: number; correct: number }> = {}
    for (const a of answers) {
      if (!subjectStats[a.subjectId]) subjectStats[a.subjectId] = { total: 0, correct: 0 }
      subjectStats[a.subjectId].total++
      if (a.isCorrect) subjectStats[a.subjectId].correct++
    }

    // Lấy tất cả chuyên đề
    const allSubjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true, order: true, icon: true },
    })

    const subjectProgress = allSubjects.map((s) => {
      const stats = subjectStats[s.id]
      const accuracy = stats ? Math.round((stats.correct / stats.total) * 100) : null
      return {
        id: s.id,
        name: s.name,
        order: s.order,
        icon: s.icon,
        attempted: !!stats,
        accuracy,
        status: !stats ? 'not_started' : accuracy! >= 80 ? 'mastered' : accuracy! >= 50 ? 'in_progress' : 'needs_review',
      }
    })

    const mastered = subjectProgress.filter((s) => s.status === 'mastered').length
    const inProgress = subjectProgress.filter((s) => s.status === 'in_progress')
    const notStarted = subjectProgress.filter((s) => s.status === 'not_started').slice(0, 5)
    const needsReview = subjectProgress.filter((s) => s.status === 'needs_review')

    const prompt = `Học sinh đã học:
- Hoàn thành tốt (≥80%): ${mastered} chuyên đề
- Đang học (50-79%): ${inProgress.map((s) => s.name).join(', ') || 'Chưa có'}
- Cần ôn lại (<50%): ${needsReview.map((s) => s.name).join(', ') || 'Chưa có'}
- Chưa bắt đầu: ${notStarted.map((s) => s.name).join(', ') || 'Đã học hết'}

Đề xuất lộ trình JSON (không markdown):
{
  "nextStep": "Chuyên đề nên học ngay bây giờ và lý do (1-2 câu)",
  "weekPlan": ["Ngày 1-2: ...", "Ngày 3-4: ...", "Ngày 5-7: ..."],
  "priority": ["Tên chuyên đề ưu tiên 1", "Tên chuyên đề ưu tiên 2", "Tên chuyên đề ưu tiên 3"],
  "tip": "Mẹo học tập cụ thể cho tuần này, phù hợp với lứa tuổi và môn học",
  "milestone": "Mục tiêu ngắn hạn (1-2 tuần)"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AVAB_SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 350,
      temperature: 0.5,
    })

    const raw = completion.choices[0].message.content || '{}'
    const pathway = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      success: true,
      data: {
        subjectProgress,
        totalSubjects: allSubjects.length,
        masteredCount: mastered,
        completionPct: Math.round((mastered / allSubjects.length) * 100),
        ...pathway,
      },
    })
  } catch (err) {
    console.error('AI pathway error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}
