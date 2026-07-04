import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  try {
    const { messages } = await req.json() as { messages: { role: string; content: string }[] }

    // ── Fetch context: enrolled courses + recent wrong answers ──────────
    const [enrollments, recentWrong] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId, status: { in: ['ACTIVE', 'APPROVED'] } },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              courseType: true,
              subjects: {
                select: { id: true, name: true },
                where: { isActive: true },
                orderBy: { order: 'asc' },
                take: 10,
              },
            },
          },
        },
        take: 5,
      }),
      prisma.studentAnswer.findMany({
        where: { userId, isCorrect: false },
        include: {
          question: {
            select: {
              content: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    // ── Build system prompt ──────────────────────────────────────────────
    const courseList = enrollments
      .map(e => {
        const subjectNames = e.course.subjects.map(s => s.name).join(', ')
        return `• ${e.course.name}${subjectNames ? ` (các chuyên đề: ${subjectNames})` : ''}`
      })
      .join('\n')

    const wrongList = recentWrong
      .slice(0, 5)
      .map(a => `• "${a.question.content.slice(0, 80)}..." (môn: ${a.question.subject?.name ?? 'không rõ'})`)
      .join('\n')

    const systemPrompt = `Bạn là gia sư AI thân thiện của AvaB — nền tảng giáo dục K12 tại Việt Nam.

${enrollments.length > 0
  ? `Học sinh đang học các khoá:\n${courseList}`
  : 'Học sinh chưa đăng ký khoá học nào.'}

${recentWrong.length > 0
  ? `Các câu học sinh làm sai gần đây:\n${wrongList}\n\nHãy chú ý ôn lại những phần này.`
  : ''}

Nguyên tắc:
- Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, phù hợp lứa tuổi học sinh
- Dùng emoji vui vẻ, khích lệ học sinh cố gắng
- Khi giải thích bài: chia nhỏ từng bước, dùng ví dụ cụ thể
- Khi học sinh không hiểu: đặt câu hỏi gợi mở thay vì giải thích lại y chang
- Luôn động viên, không bao giờ chê bai hay làm nản lòng
- Khi cho quiz: ra 1 câu mỗi lúc, chờ học sinh trả lời
- Tóm tắt chương: đưa ra 3–5 điểm cốt lõi dễ nhớ`

    // ── Call OpenAI ──────────────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 600,
      temperature: 0.6,
    })

    const reply = completion.choices[0]?.message?.content ?? 'Xin lỗi, tôi không thể trả lời lúc này.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('AI Tutor error:', err)
    return NextResponse.json({ error: 'AI không khả dụng, vui lòng thử lại.' }, { status: 500 })
  }
}
