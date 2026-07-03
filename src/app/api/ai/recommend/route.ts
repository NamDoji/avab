import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// AI gợi ý bài tập phù hợp với trình độ hiện tại
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  try {
    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get('subjectId')

    // Lấy lịch sử câu trả lời sai
    const wrongAnswers = await prisma.studentAnswer.findMany({
      where: {
        userId,
        isCorrect: false,
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        question: {
          select: { content: true, correctAnswer: true, order: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Lấy chuyên đề chưa làm hoặc làm kém
    const subjectScores = await prisma.studentAnswer.groupBy({
      by: ['subjectId'],
      where: { userId },
      _avg: { score: true },
      _count: { score: true },
    })

    const weakSubjects = subjectScores
      .filter((s) => (s._avg.score || 0) < 0.6)
      .map((s) => s.subjectId)

    const subjects = await prisma.subject.findMany({
      where: weakSubjects.length > 0 ? { id: { in: weakSubjects } } : {},
      take: 3,
      select: { name: true, icon: true },
    })

    // Thêm context về độ chính xác tổng thể
    const allAnswers = await prisma.studentAnswer.findMany({
      where: { userId },
      select: { isCorrect: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    const totalAcc = allAnswers.length > 0
      ? Math.round(allAnswers.filter(a => a.isCorrect).length / allAnswers.length * 100)
      : 0
    const supportLevel = totalAcc < 50 ? 'high' : totalAcc < 70 ? 'medium' : 'low'

    const prompt = `Học sinh luyện thi học bổng lớp 1. Nhiệm vụ: Khuyến nghị can thiệp sư phạm toàn diện theo hướng aware recommendation.

BỐI CẢNH HỌC TẬP:
- Độ chính xác tổng: ${totalAcc}%
- Mức hỗ trợ cần thiết: ${supportLevel}
- Số câu sai gần đây: ${wrongAnswers.length}

${wrongAnswers.length > 0 ? `Câu sai điển hình:\n${wrongAnswers.slice(0, 5).map((a) => `- "${a.question.content}" (đáp án đúng: ${a.question.correctAnswer})`).join('\n')}` : ''}

Chuyên đề còn yếu: ${subjects.map((s) => s.name).join(', ') || 'Chưa xác định'}

Khuyến nghị can thiệp JSON (không markdown):
{
  "teachingStrategy": "Chiến lược sư phạm phù hợp nhất với tình trạng hiện tại",
  "supportLevel": "${supportLevel}",
  "supportGuidance": "Hướng dẫn thực hiện mức hỗ trợ này cụ thể",
  "exercises": [
    {
      "type": "Loại bài tập",
      "description": "Mô tả cụ thể",
      "difficulty": "Dễ/Trung bình/Khó",
      "example": "Ví dụ mẫu",
      "pedagogicalReason": "Lý do sư phạm cụ thể"
    }
  ],
  "selfStudyStrategy": "Chiến lược tự học phù hợp cho trẻ 5-6 tuổi",
  "resourceRecommendations": ["Nguồn tài nguyên 1", "Nguồn tài nguyên 2"],
  "teacherActions": ["Hành động của giáo viên 1", "Hành động 2"],
  "parentActions": ["Hành động của phụ huynh tại nhà 1", "Hành động 2"],
  "dailyGoal": "Mục tiêu cụ thể mỗi ngày",
  "motivation": "Câu động viên phù hợp trẻ 5-6 tuổi"
}
Gợi ý 3 bài tập phù hợp.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AVAB_SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.6,
    })

    const raw = completion.choices[0].message.content || '{}'
    const recommendations = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({ success: true, data: { ...recommendations, supportLevel } })
  } catch (err) {
    console.error('AI recommend error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}
