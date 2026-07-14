import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Strip HTML → plain text
// ─────────────────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<\/p>/gi, '\n').replace(/<\/li>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n').trim()
}

type QuizQParsed = {
  order: number
  content: string
  options: Array<{ key: string; text: string }> | null
  correctKey: string
  explanation: string
  difficulty: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse quiz DOCX text into questions
// Supports:
//   Format 1 (ABCD): Câu N / Ví dụ N → content → A. / B. / C. / D. → Đáp án: A → Lời giải:
//   Format 2 (open): Câu N / Ví dụ N → content → Đáp án: [text] → Lời giải:
// ─────────────────────────────────────────────────────────────────────────────
function parseQuizText(text: string): QuizQParsed[] {
  const lines = text.split('\n').map(l => l.trim())
  const questions: QuizQParsed[] = []

  let current: {
    order: number
    contentLines: string[]
    optionLines: Record<string, string>
    correctKey: string
    explanationLines: string[]
    difficulty: string
  } | null = null

  const flush = () => {
    if (!current || current.contentLines.length === 0) return
    const hasOptions = Object.keys(current.optionLines).length >= 2
    const opts = hasOptions
      ? (['A', 'B', 'C', 'D'] as const)
          .filter(k => current!.optionLines[k])
          .map(k => ({ key: k, text: current!.optionLines[k] }))
      : null
    questions.push({
      order: current.order,
      content: current.contentLines.join('\n').trim(),
      options: opts,
      correctKey: current.correctKey.trim(),
      explanation: current.explanationLines.join('\n').trim(),
      difficulty: current.difficulty,
    })
    current = null
  }

  let phase: 'content' | 'options' | 'answer' | 'explanation' = 'content'

  for (const line of lines) {
    if (!line) continue

    // New question: "Câu N:" or "Ví dụ N:"
    const qMatch = line.match(/^(?:Câu|Ví dụ)\s*(\d+)\s*[.:)]\s*(.*)/i)
    if (qMatch) {
      flush()
      const rest = qMatch[2].trim()
      current = {
        order: parseInt(qMatch[1]),
        contentLines: rest ? [rest] : [],
        optionLines: {},
        correctKey: '',
        explanationLines: [],
        difficulty: 'medium',
      }
      phase = 'content'
      continue
    }

    if (!current) continue

    // ABCD option: "A." "A)" or "A. text" or "(A) text"
    const optMatch = line.match(/^([A-D])[.)]\s+(.+)/) || line.match(/^\(([A-D])\)\s+(.+)/)
    if (optMatch) {
      current.optionLines[optMatch[1]] = optMatch[2].trim()
      phase = 'options'
      continue
    }

    // Đáp án / ĐA
    const ansMatch = line.match(/^(?:Đáp án|ĐA|Đ\/A|Answer|Đáp số)\s*[:\s]\s*(.*)/i)
    if (ansMatch) {
      current.correctKey = ansMatch[1].replace(/\s*Mức độ[:\s].*/i, '').trim()
      phase = 'answer'
      continue
    }

    // Mức độ
    const diffMatch = line.match(/^Mức độ\s*[:\s]\s*(.*)/i)
    if (diffMatch) {
      const d = diffMatch[1].toLowerCase()
      if (d.includes('dễ') || d.includes('de')) current.difficulty = 'easy'
      else if (d.includes('nâng') || d.includes('khó') || d.includes('kho')) current.difficulty = 'hard'
      else current.difficulty = 'medium'
      continue
    }

    // Lời giải / Giải / Hướng dẫn / Mẹo
    const explMatch = line.match(/^(?:Lời giải|LG|Giải|Hướng dẫn|Mẹo nhìn nhanh|Lời giải trực quan|Quan sát|Phân tích|Thực hiện|Kiểm tra|Kết luận)\s*[.:)]\s*(.*)/i)
    if (explMatch) {
      const rest = explMatch[1].trim()
      if (rest) current.explanationLines.push(rest)
      phase = 'explanation'
      continue
    }

    // "Học sinh ghi đáp số:" — skip line
    if (/học sinh ghi/i.test(line)) continue

    if (phase === 'content') {
      current.contentLines.push(line)
    } else if (phase === 'explanation') {
      current.explanationLines.push(line)
    }
  }

  flush()
  return questions.sort((a, b) => a.order - b.order)
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/subjects/[id]/parse-quizizz
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id: subjectId } = await params

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const shouldSave = formData.get('save') === 'true'
    const setTitle = (formData.get('setTitle') as string) || file?.name || 'Quizizz'

    if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''

    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.convertToHtml({ buffer })
      text = stripHtml(result.value)
    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      text = buffer.toString('utf-8')
    }

    const parsed = parseQuizText(text)

    // Lưu vào DB
    let quizSetId: string | null = null
    if (shouldSave && parsed.length > 0) {
      const quizSet = await prisma.quizSet.create({
        data: { subjectId, title: setTitle, sourceType: 'upload' },
      })
      quizSetId = quizSet.id

      await prisma.quizQuestion.createMany({
        data: parsed.map(q => ({
          quizSetId: quizSet.id,
          order: q.order,
          content: q.content,
          options: q.options ?? undefined,
          correctKey: q.correctKey,
          explanation: q.explanation || null,
          difficulty: q.difficulty,
        })),
      })
    }

    return NextResponse.json({
      success: true,
      data: { parsed: parsed.length, questions: parsed, quizSetId },
    })
  } catch (err) {
    console.error('[parse-quizizz]', err)
    return NextResponse.json({ success: false, error: 'Parse failed' }, { status: 500 })
  }
}
