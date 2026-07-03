import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// AI phân tích lỗi sai của học sinh theo chuyên đề/toàn bộ
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  try {
    const userId = (session.user as any).id
    const { subjectId } = await req.json()

    // Lấy lịch sử làm bài
    const answers = await prisma.studentAnswer.findMany({
      where: {
        userId,
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        question: { select: { content: true, correctAnswer: true, subjectId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    if (answers.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalQuestions: 0,
          correctCount: 0,
          accuracy: 0,
          analysis: 'Chưa có dữ liệu làm bài. Hãy làm thử một số câu hỏi trước nhé! 🚀',
          weakAreas: [],
          strengths: [],
          recommendation: 'Bắt đầu với Chuyên đề 1: Phép cộng, phép trừ có nhớ',
        },
      })
    }

    const correct = answers.filter((a) => a.isCorrect).length
    const accuracy = Math.round((correct / answers.length) * 100)

    const wrongAnswers = answers
      .filter((a) => !a.isCorrect)
      .slice(0, 10)
      .map((a) => ({
        question: a.question.content,
        correct: a.question.correctAnswer,
        student: a.answer,
      }))

    const prompt = `Học sinh đã làm ${answers.length} câu, đúng ${correct} câu (${accuracy}%).

${wrongAnswers.length > 0 ? `Các câu sai gần đây:\n${wrongAnswers.map((w, i) => `${i + 1}. Câu: "${w.question}" | Đúng: ${w.correct} | HS trả lời: ${w.student}`).join('\n')}` : 'Không có câu sai gần đây.'}

Phân tích và trả về JSON (không markdown):
{
  "summary": "Tóm tắt tổng quan 1-2 câu",
  "weakAreas": ["Dạng toán yếu 1", "Dạng toán yếu 2"],
  "strengths": ["Điểm mạnh 1"],
  "errorPatterns": ["Lỗi phổ biến 1 (giải thích ngắn)"],
  "recommendation": "Lời khuyên cụ thể tiếp theo",
  "encouragement": "Câu động viên cá nhân hoá, phù hợp với lứa tuổi và môn học"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AVAB_SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.4,
    })

    const raw = completion.choices[0].message.content || '{}'
    const analysis = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions: answers.length,
        correctCount: correct,
        accuracy,
        ...analysis,
      },
    })
  } catch (err) {
    console.error('AI analyze error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}
