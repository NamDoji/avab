import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

interface ExtractedQuestion {
  content: string
  questionType: 'MULTIPLE_CHOICE' | 'OPEN' | 'FILL_IN' | 'MATCHING'
  options: Array<{ key: string; text: string }> | null
  correctAnswer: string
  explanation: string | null
  order: number
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      importId: string
      extractQuestions: boolean
      fullText?: string
    }

    const { importId, extractQuestions, fullText } = body

    if (!importId) {
      return NextResponse.json({ success: false, error: 'importId required' }, { status: 400 })
    }

    const importLog = await prisma.materialImportLog.findUnique({
      where: { id: importId },
    })
    if (!importLog) {
      return NextResponse.json({ success: false, error: 'Import log not found' }, { status: 404 })
    }

    // Use provided fullText (passed from client after upload) or fallback to aiAnalysis summary
    const textContent = fullText ?? importLog.aiAnalysis ?? ''

    if (!extractQuestions) {
      return NextResponse.json({ success: true, questions: [], total: 0 })
    }

    const aiPrompt = `Trích xuất toàn bộ câu hỏi từ tài liệu sau.

Nội dung:
${textContent.slice(0, 12000)}

Trả về JSON array (không có markdown, chỉ JSON thuần):
[
  {
    "content": "nội dung câu hỏi",
    "questionType": "MULTIPLE_CHOICE|OPEN|FILL_IN|MATCHING",
    "options": [{"key":"A","text":"..."},...] hoặc null,
    "correctAnswer": "đáp án đúng",
    "explanation": "lời giải (nếu có) hoặc null",
    "order": số thứ tự bắt đầu từ 1
  }
]

Nếu không tìm thấy câu hỏi, trả về mảng rỗng [].`

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Bạn là AI chuyên trích xuất câu hỏi từ tài liệu giáo dục. Chỉ trả về JSON array hợp lệ.' },
        { role: 'user', content: aiPrompt },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    })

    const rawJson = aiResponse.choices[0].message.content ?? '[]'
    let questions: ExtractedQuestion[] = []
    try {
      const cleaned = rawJson.replace(/```json\n?|\n?```/g, '').trim()
      questions = JSON.parse(cleaned)
      if (!Array.isArray(questions)) questions = []
    } catch {
      questions = []
    }

    // Update questionsFound
    await prisma.materialImportLog.update({
      where: { id: importId },
      data: { questionsFound: questions.length, status: 'mapping' },
    })

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
    })
  } catch (err: unknown) {
    console.error('[material-import/extract]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
