import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/supabase'
import { openai } from '@/lib/openai'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Strip HTML → plain text, giữ bảng biểu dưới dạng dễ đọc
// ─────────────────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<\/th>/gi, ' | ')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Gộp nhiều dòng trống
    .replace(/\n{3,}/g, '\n\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// OCR 1 ảnh bằng GPT-4o Vision
// ─────────────────────────────────────────────────────────────────────────────
async function ocrImage(imgBuf: Buffer, contentType: string): Promise<string> {
  try {
    const base64 = imgBuf.toString('base64')
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Đây là hình ảnh trong bài toán toán học tiếng Việt. Hãy mô tả ngắn gọn nội dung (biểu đồ, bảng, phép tính...) và trích xuất bất kỳ số liệu/ký hiệu nào có trong ảnh. Chỉ trả về text mô tả, không giải thích thêm.',
          },
          {
            type: 'image_url',
            image_url: { url: `data:${contentType};base64,${base64}`, detail: 'low' },
          },
        ],
      }],
    })
    return res.choices[0]?.message?.content?.trim() ?? ''
  } catch {
    return ''
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI PARSER — GPT-4o đọc toàn bộ document text → JSON Q&A
// Xử lý được mọi format: Câu 1. / Câu 1: / 1. / Question 1
//                         Đáp án: / ĐA: / Answer: / có hoặc không có số
//                         Lời giải có bảng biểu, hình ảnh, bullets
// ─────────────────────────────────────────────────────────────────────────────
async function aiParseDocument(
  text: string
): Promise<Array<{ order: number; content: string; correctAnswer: string; explanation: string }>> {
  const prompt = `Bạn là hệ thống trích xuất bài tập từ tài liệu giáo dục tiếng Việt.

Dưới đây là nội dung text đã trích xuất từ file bài tập về nhà (có thể bao gồm text từ OCR ảnh và bảng biểu).

NHIỆM VỤ: Trích xuất TẤT CẢ câu hỏi/bài tập và trả về JSON.

QUY TẮC:
- "order": số thứ tự câu (1, 2, 3...)
- "content": toàn bộ đề bài của câu đó (giữ nguyên, không tóm tắt)
- "correctAnswer": đáp án cuối cùng ngắn gọn (ví dụ: "5 bạn", "23 quả", "x=4; y=7")
- "explanation": toàn bộ lời giải, kể cả bảng biểu (format bảng thành dạng: Cột1: val | Cột2: val)
- Bỏ qua header/footer, chỉ lấy các câu bài tập
- Không tóm tắt, giữ nguyên nội dung gốc
- Trả về ĐÚNG JSON array, không có text nào khác

ĐỊNH DẠNG OUTPUT (chỉ JSON, không markdown):
[{"order":1,"content":"...","correctAnswer":"...","explanation":"..."},...]

NỘI DUNG TÀI LIỆU:
${text.substring(0, 12000)}`

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4000,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const raw = res.choices[0]?.message?.content ?? '{}'
  // GPT đôi khi trả về {"questions": [...]} hoặc {"data": [...]} hoặc [...]
  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  // Tìm array trong response
  const arr: any[] = Array.isArray(parsed)
    ? parsed
    : parsed.questions ?? parsed.data ?? parsed.items ?? Object.values(parsed).find(v => Array.isArray(v)) ?? []

  return arr
    .filter((q: any) => q.content)
    .map((q: any, i: number) => ({
      order: Number(q.order) || i + 1,
      content: String(q.content ?? '').trim(),
      correctAnswer: String(q.correctAnswer ?? q.answer ?? q.dapAn ?? '').trim(),
      explanation: String(q.explanation ?? q.loiGiai ?? q.giai ?? '').trim(),
    }))
    .sort((a, b) => a.order - b.order)
}

// ─────────────────────────────────────────────────────────────────────────────
// REGEX PARSER — nhanh, dùng cho file chuẩn theo mẫu
// ─────────────────────────────────────────────────────────────────────────────
function regexParseText(
  text: string
): Array<{ order: number; content: string; correctAnswer: string; explanation: string }> {
  const lines = text.split('\n').map(l => l.trim())
  type QEntry = { contentLines: string[]; correctAnswer: string; explanationLines: string[] }
  const questionMap = new Map<number, QEntry>()
  let currentNum: number | null = null
  let phase: 'content' | 'answer' | 'explanation' = 'content'

  for (const line of lines) {
    if (!line) continue

    // Câu N: hoặc Câu N.
    const qM = line.match(/^Câu\s*(\d+)\s*[.:)]\s*(.*)/i)
    if (qM) {
      currentNum = parseInt(qM[1])
      phase = 'content'
      const f = qM[2].trim()
      questionMap.set(currentNum, { contentLines: f ? [f] : [], correctAnswer: '', explanationLines: [] })
      continue
    }
    if (currentNum === null) continue
    const q = questionMap.get(currentNum)!

    // Đáp án N: hoặc Đáp án: (không có số) — strip leading |
    const aM = line.replace(/^\|+\s*/, '').match(/^(?:Đáp án|ĐA|Đ\/A|Answer|Đáp số)\s*\d*\s*[.:)]\s*(.*)/i)
    if (aM) { phase = 'answer'; q.correctAnswer = aM[1].trim(); continue }

    // Lời giải N: hoặc Lời giải: (không có số)
    const eM = line.replace(/^\|+\s*/, '').match(/^(?:Lời giải|LG|Giải|Hướng dẫn)\s*\d*\s*[.:)]\s*(.*)/i)
    if (eM) { phase = 'explanation'; const f = eM[1].trim(); if (f) q.explanationLines.push(f); continue }

    if (phase === 'content') q.contentLines.push(line)
    else if (phase === 'explanation') q.explanationLines.push(line)
  }

  const questions: Array<{ order: number; content: string; correctAnswer: string; explanation: string }> = []
  for (const [order, q] of questionMap) {
    if (q.contentLines.length > 0) {
      questions.push({
        order,
        content: q.contentLines.join('\n'),
        correctAnswer: q.correctAnswer,
        explanation: q.explanationLines.join('\n'),
      })
    }
  }
  return questions.sort((a, b) => a.order - b.order)
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/subjects/[id]/parse-homework
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
    const setTitle = (formData.get('setTitle') as string) || file?.name || 'BTVN'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''
    let imageCount = 0
    const imageUrls: string[] = []

    // ── Trích xuất text + ảnh ──
    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const mammoth = await import('mammoth')
      const ocrMap = new Map<string, string>()
      let imgIdx = 0

      const result = await mammoth.convertToHtml(
        { buffer },
        {
          convertImage: mammoth.images.imgElement(async (image) => {
            try {
              const imgBuf = await image.read()
              const ext = (image.contentType || 'image/png').split('/')[1] || 'png'
              const imgPath = `homework-images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
              const url = await uploadFile('avab-materials', imgPath, Buffer.from(imgBuf), image.contentType)
              imageUrls.push(url)
              imageCount++

              // OCR chỉ ảnh đầu tiên mỗi 3 ảnh để tiết kiệm (ảnh lặp lại trong file)
              imgIdx++
              if (imgIdx <= 5 || imgIdx % 3 === 0) {
                const ocr = await ocrImage(Buffer.from(imgBuf), image.contentType)
                if (ocr) ocrMap.set(url, ocr)
              }
              return { src: url }
            } catch {
              return { src: '' }
            }
          }),
        }
      )

      // Thay <img src="URL"> bằng [OCR text] trong text
      const processedHtml = result.value.replace(
        /<img[^>]+src="([^"]+)"[^>]*/gi,
        (_match: string, url: string) => {
          const ocr = ocrMap.get(url)
          return ocr ? `<span>[Hình: ${ocr}]</span>` : ''
        }
      )
      text = stripHtml(processedHtml)

    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      text = buffer.toString('utf-8')
    }

    // ── Parse: thử regex trước, nếu < 3 câu thì dùng AI ──
    let parsed = regexParseText(text)

    // Điều kiện dùng AI: ít câu được tìm thấy HOẶC có ảnh nhiều HOẶC đáp án bị thiếu nhiều
    const emptyAnswers = parsed.filter(q => !q.correctAnswer.trim()).length
    const needsAI = parsed.length < 3 || emptyAnswers > parsed.length * 0.5 || imageCount > 5

    if (needsAI) {
      try {
        const aiResult = await aiParseDocument(text)
        if (aiResult.length > parsed.length) parsed = aiResult
      } catch (err) {
        console.error('[AI Parser] failed:', err)
        // Giữ kết quả regex nếu AI thất bại
      }
    }

    // ── Lưu vào DB ──
    let homeworkSetId: string | null = null

    if (shouldSave && parsed.length > 0) {
      const existingCount = await prisma.homeworkSet.count({ where: { subjectId } })
      const newSet = await prisma.homeworkSet.create({
        data: { subjectId, title: setTitle, order: existingCount },
      })
      homeworkSetId = newSet.id

      await prisma.question.createMany({
        data: parsed.map(q => ({
          subjectId,
          homeworkSetId: newSet.id,
          order: q.order,
          content: q.content,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          points: 1,
        })),
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        parsed: parsed.length,
        questions: parsed,
        imageCount,
        usedAI: needsAI,
        homeworkSetId,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Parse failed' }, { status: 500 })
  }
}
