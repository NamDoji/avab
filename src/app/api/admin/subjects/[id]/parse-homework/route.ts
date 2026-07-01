import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

// Parse Word/PDF file for questions
// File format expected:
// Line: "Câu 1: [content]" or "1. [content]"  
// Answer line: "Đáp án 1: [answer]" or "ĐA 1: [answer]"

function parseHomeworkText(text: string): Array<{ order: number; content: string; correctAnswer: string; explanation: string }> {
  const questions: Array<{ order: number; content: string; correctAnswer: string; explanation: string }> = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  const questionMap = new Map<number, { content: string; correctAnswer: string; explanation: string }>()

  for (const line of lines) {
    // Câu hỏi: "Câu 1:", "1.", "1)"
    const qMatch = line.match(/^(?:Câu\s*)?(\d+)[.:)]\s*(.+)$/i)
    if (qMatch) {
      const num = parseInt(qMatch[1])
      const content = qMatch[2].trim()
      const lower = line.toLowerCase()
      if (!lower.startsWith('đáp án') && !lower.startsWith('đa ') && !lower.startsWith('lời giải') && !lower.startsWith('lg ')) {
        if (!questionMap.has(num)) questionMap.set(num, { content, correctAnswer: '', explanation: '' })
        else questionMap.get(num)!.content = content
      }
    }

    // Đáp án: "Đáp án 1:", "ĐA 1:"
    const aMatch = line.match(/^(?:Đáp án|ĐA|Đ\/A|Answer)\s*(\d+)[.:)]\s*(.+)$/i)
    if (aMatch) {
      const num = parseInt(aMatch[1])
      const answer = aMatch[2].trim()
      if (!questionMap.has(num)) questionMap.set(num, { content: '', correctAnswer: answer, explanation: '' })
      else questionMap.get(num)!.correctAnswer = answer
    }

    // Lời giải: "Lời giải 1:", "LG 1:", "Giải 1:"
    const eMatch = line.match(/^(?:Lời giải|LG|Giải|Hướng dẫn)\s*(\d+)[.:)]\s*(.+)$/i)
    if (eMatch) {
      const num = parseInt(eMatch[1])
      const explanation = eMatch[2].trim()
      if (!questionMap.has(num)) questionMap.set(num, { content: '', correctAnswer: '', explanation })
      else questionMap.get(num)!.explanation = explanation
    }
  }

  for (const [order, q] of questionMap) {
    if (q.content) {
      questions.push({ order, content: q.content, correctAnswer: q.correctAnswer, explanation: q.explanation })
    }
  }

  return questions.sort((a, b) => a.order - b.order)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id: subjectId } = await params

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const shouldSave = formData.get('save') === 'true'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''

    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      // pdf-parse may have issues with newer Next.js — use dynamic import
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = (await import('pdf-parse') as any).default || (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      // Plain text fallback
      text = buffer.toString('utf-8')
    }

    const parsed = parseHomeworkText(text)

    if (shouldSave && parsed.length > 0) {
      // Save questions to DB (replace all)
      await prisma.question.deleteMany({ where: { subjectId } })
      await prisma.question.createMany({
        data: parsed.map((q) => ({ subjectId, order: q.order, content: q.content, correctAnswer: q.correctAnswer, explanation: q.explanation || null, points: 1 })),
      })
    }

    return NextResponse.json({
      success: true,
      data: { parsed: parsed.length, questions: parsed },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Parse failed' }, { status: 500 })
  }
}
