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

    const prompt = `Học sinh có ${wrongAnswers.length} câu sai gần đây.

${wrongAnswers.length > 0 ? `Câu sai tiêu biểu:\n${wrongAnswers.slice(0, 5).map((a) => `- "${a.question.content}" (đáp án đúng: ${a.question.correctAnswer})`).join('\n')}` : ''}

Chuyên đề còn yếu: ${subjects.map((s) => s.name).join(', ') || 'Chưa xác định'}

Gợi ý bài tập JSON (không markdown):
{
  "exercises": [
    {
      "type": "Loại bài tập",
      "description": "Mô tả bài tập cụ thể",
      "difficulty": "Dễ/Trung bình/Khó",
      "example": "Ví dụ bài tập mẫu",
      "why": "Tại sao nên làm bài này (1 câu ngắn)"
    }
  ],
  "practiceMethod": "Phương pháp luyện tập hiệu quả nhất (1-2 câu)",
  "dailyGoal": "Mục tiêu số câu nên làm mỗi ngày",
  "motivation": "Câu động viên"
}
Gợi ý 3 bài tập cụ thể, phù hợp trẻ 5-6 tuổi.`

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

    return NextResponse.json({ success: true, data: recommendations })
  } catch (err) {
    console.error('AI recommend error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}
