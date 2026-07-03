import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'
import mammoth from 'mammoth'
import * as pdfParse from 'pdf-parse'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

function xlsxToText(buffer: Buffer): string {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const lines: string[] = []
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(ws)
    lines.push(`=== Sheet: ${sheetName} ===\n${csv}`)
  }
  return lines.join('\n\n')
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const subjectId = formData.get('subjectId') as string | null
    const grade = formData.get('grade') as string | null
    const subject = formData.get('subject') as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''
    let sourceType = ext

    if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (ext === 'pdf') {
      const pdfMod = pdfParse as unknown as (b: Buffer) => Promise<{text: string}>; const result = await pdfMod(buffer)
      text = result.text
    } else if (ext === 'xlsx' || ext === 'xls') {
      text = xlsxToText(buffer)
      sourceType = 'xlsx'
    } else if (ext === 'csv') {
      text = buffer.toString('utf8')
    } else if (ext === 'txt') {
      text = buffer.toString('utf8')
    } else {
      text = buffer.toString('utf8')
    }

    const textPreview = text.slice(0, 3000)

    const aiPrompt = `Phân tích nội dung học liệu sau và trả về JSON:

Nội dung:
${textPreview}

Trả về JSON với format:
{
  "detectedType": "lesson|homework|quiz|answer_key|slide|reference|unknown",
  "detectedSubject": "MATH|ENGLISH|SCIENCE|CODING|VIETNAMESE|HISTORY|GEOGRAPHY|null",
  "detectedGrade": "1-12 hoặc preschool hoặc null",
  "title": "tiêu đề đề xuất",
  "summary": "tóm tắt ngắn nội dung (2-3 câu)",
  "questionsFound": số câu hỏi tìm thấy hoặc 0,
  "questionTypes": ["MULTIPLE_CHOICE","OPEN","FILL_IN","MATCHING"],
  "confidence": 0.0-1.0,
  "suggestedMapping": {
    "targetModule": "subject_material|question_bank|homework_set",
    "contentType": "THEORY|HOMEWORK|QUIZ|ANSWER_KEY|VIDEO_SCRIPT|TEACHER_GUIDE",
    "reason": "lý do ngắn"
  }
}

Chỉ trả về JSON thuần, không có markdown hay text khác.`

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Bạn là AI chuyên phân tích tài liệu giáo dục. Chỉ trả về JSON hợp lệ.' },
        { role: 'user', content: aiPrompt },
      ],
      temperature: 0.1,
      max_tokens: 800,
    })

    const rawJson = aiResponse.choices[0].message.content ?? '{}'
    let analysis: Record<string, unknown> = {}
    try {
      const cleaned = rawJson.replace(/```json\n?|\n?```/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch {
      analysis = { detectedType: 'unknown', confidence: 0, error: 'parse_failed' }
    }

    const importLog = await prisma.materialImportLog.create({
      data: {
        sourceType,
        sourceName: fileName,
        sourceSize: buffer.length,
        detectedType: (analysis.detectedType as string) ?? null,
        detectedSubject: (analysis.detectedSubject as string) ?? null,
        detectedGrade: grade ?? (analysis.detectedGrade as string) ?? null,
        targetModule: (analysis.suggestedMapping as any)?.targetModule ?? null,
        mappingData: analysis as any,
        status: 'analyzing',
        questionsFound: (analysis.questionsFound as number) ?? 0,
        aiAnalysis: JSON.stringify(analysis),
        importedBy: (session.user as any)?.id ?? null,
        subjectId: subjectId ?? null,
        canRollback: true,
      },
    })

    return NextResponse.json({
      success: true,
      importId: importLog.id,
      analysis,
      textPreview: text.slice(0, 500),
      fileName,
      fileSize: buffer.length,
      // store full text in response for client to hold temporarily
      _fullText: text,
    })
  } catch (err: unknown) {
    console.error('[material-import/upload]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
