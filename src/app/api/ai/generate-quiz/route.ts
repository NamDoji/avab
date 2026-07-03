import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { Prisma } from '@prisma/client'

// GET: check current gen count for current user + subject
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }
  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get('subjectId')
  if (!subjectId) {
    return NextResponse.json({ success: false, error: 'Thiếu subjectId' }, { status: 400 })
  }

  const log = await prisma.aIQuizGenLog.findUnique({
    where: { userId_subjectId: { userId, subjectId } },
  }).catch(() => null)

  return NextResponse.json({ success: true, genCount: log?.genCount ?? 0, lastScore: log?.lastScore ?? 0 })
}

// POST: generate a new AI quiz
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }
  const userId = (session.user as any).id
  const userRole = (session.user as any).role
  const isAdmin = userRole === 'ADMIN'

  try {
    const body = await req.json()
    const { subjectId, subjectName } = body

    if (!subjectId || !subjectName) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin' }, { status: 400 })
    }

    // Lấy log hiện tại (dùng cho title và lưu sau)
    const log = await prisma.aIQuizGenLog.findUnique({
      where: { userId_subjectId: { userId, subjectId } },
    }).catch(() => null)

    // Check gen count — admin bỏ qua giới hạn
    if (!isAdmin && log && log.genCount >= 3) {
      return NextResponse.json({ success: false, error: 'Đã đạt giới hạn 3 lần tạo bài AI' }, { status: 403 })
    }

    // Get subject + sample questions for context
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        questions: { take: 10, orderBy: { order: 'asc' } },
      },
    })
    if (!subject) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy chuyên đề' }, { status: 404 })
    }

    const sampleQuestions = subject.questions.map(q =>
      `- [${q.questionType ?? 'OPEN'}] ${q.content} | Đáp án: ${q.correctAnswer}`
    ).join('\n')

    const prompt = `Bạn là giáo viên tạo bài tập cho học sinh.
Chủ đề: ${subjectName}
Các câu hỏi gốc (để tham khảo mức độ):
${sampleQuestions || 'Chưa có câu hỏi gốc — hãy tự tạo phù hợp chủ đề.'}

Tạo 30 câu hỏi mới với:
- Độ khó tăng dần, tư duy hơn, đa dạng loại câu (OPEN, MULTIPLE_CHOICE, TRUE_FALSE)
- Cùng chủ đề/chuyên đề đang học
- Trả về JSON array: [{"order":1,"questionType":"OPEN","content":"...","correctAnswer":"...","explanation":"...","options":null,"points":1}]
- questionType: "OPEN" | "MULTIPLE_CHOICE" | "TRUE_FALSE"
- Với MULTIPLE_CHOICE: options = [{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}], correctAnswer = "A"/"B"/"C"/"D"
- Với TRUE_FALSE: options = null, correctAnswer = "Đúng" hoặc "Sai"
- Với OPEN: options = null, correctAnswer là đáp số ngắn gọn

Trả về ONLY valid JSON array, không thêm text khác.`

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Bạn là giáo viên giỏi, chuyên tạo bài tập toán và tư duy cho trẻ em. Trả về JSON thuần tuý, không markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 6000,
    })

    const rawJson = completion.choices[0]?.message?.content ?? '[]'

    // Parse JSON
    let questionsData: Array<{
      order: number; questionType: string; content: string
      correctAnswer: string; explanation?: string
      options?: any; points?: number
    }>
    try {
      // Strip potential markdown code blocks
      const cleaned = rawJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
      questionsData = JSON.parse(cleaned)
      if (!Array.isArray(questionsData)) throw new Error('Not an array')
    } catch {
      return NextResponse.json({ success: false, error: 'AI trả về dữ liệu không hợp lệ, vui lòng thử lại' }, { status: 500 })
    }

    // Get next HomeworkSet order
    const setCount = await prisma.homeworkSet.count({ where: { subjectId } })

    // Create HomeworkSet
    const homeworkSet = await prisma.homeworkSet.create({
      data: {
        subjectId,
        title: `Bài AI tự sinh #${(log?.genCount ?? 0) + 1} — ${subjectName}`,
        order: setCount + 1,
        isAIGenerated: true,
        aiGeneratorId: userId,
      },
    })

    // Insert questions into the HomeworkSet
    const questionCreateData = questionsData.slice(0, 30).map((q, idx) => ({
      subjectId,
      homeworkSetId: homeworkSet.id,
      order: q.order ?? idx + 1,
      questionType: ['OPEN', 'MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(q.questionType?.toUpperCase?.())
        ? q.questionType.toUpperCase() as any
        : 'OPEN',
      content: q.content ?? '',
      correctAnswer: q.correctAnswer ?? '',
      explanation: q.explanation ?? null,
      options: q.options
        ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options)
        : Prisma.JsonNull,
      points: q.points ?? 1,
    }))

    await prisma.question.createMany({ data: questionCreateData })

    // Update or create AIQuizGenLog
    await prisma.aIQuizGenLog.upsert({
      where: { userId_subjectId: { userId, subjectId } },
      create: { userId, subjectId, genCount: 1, lastScore: 0 },
      update: { genCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true, homeworkSetId: homeworkSet.id })
  } catch (error) {
    console.error('Generate quiz error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo bài AI, vui lòng thử lại' }, { status: 500 })
  }
}
