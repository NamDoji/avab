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
// OCR ảnh bằng GPT-4o Vision
// ─────────────────────────────────────────────────────────────────────────────
async function ocrImageBuffer(imgBuf: Buffer, contentType: string): Promise<string> {
  try {
    const base64 = imgBuf.toString('base64')
    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Đây là ảnh nội dung bài toán/lời giải tiếng Việt cho học sinh mầm non/lớp 1.
Hãy trích xuất TOÀN BỘ nội dung trong ảnh (text, phép tính, ký hiệu toán học, mô tả hình vẽ).
Chỉ trả về nội dung đã trích xuất, không giải thích thêm.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${contentType};base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    })
    return result.choices[0]?.message?.content?.trim() ?? ''
  } catch (err) {
    console.error('[OCR] Failed:', err)
    return ''
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Strip HTML → plain text (giữ ngắt dòng)
// ─────────────────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// ─────────────────────────────────────────────────────────────────────────────
// State-machine parser — hỗ trợ:
//   • Nội dung nhiều dòng (Cân 1, Cân 2...)
//   • Lời giải nhiều dòng (Bước 1, Bước 2, Sơ đồ...)
//   • Text trích xuất từ ảnh (via OCR placeholder)
//
// Cấu trúc file mong đợi:
//   Câu N: [dòng đầu]
//   [các dòng tiếp theo / OCR từ ảnh]
//   Đáp án N: [đáp án]
//   Lời giải N:
//   [các dòng lời giải / OCR từ ảnh]
//   Câu N+1: ...
// ─────────────────────────────────────────────────────────────────────────────
function parseHomeworkText(
  text: string
): Array<{ order: number; content: string; correctAnswer: string; explanation: string }> {
  const lines = text.split('\n').map((l) => l.trim())

  type QEntry = { contentLines: string[]; correctAnswer: string; explanationLines: string[] }
  const questionMap = new Map<number, QEntry>()

  let currentNum: number | null = null
  let phase: 'content' | 'answer' | 'explanation' = 'content'

  for (const line of lines) {
    if (!line) continue

    // ── Câu N: ... ──────────────────────────────────────────────────────────
    const qM = line.match(/^Câu\s*(\d+)\s*[.:)]\s*(.*)/i)
    if (qM) {
      currentNum = parseInt(qM[1])
      phase = 'content'
      const firstContent = qM[2].trim()
      questionMap.set(currentNum, {
        contentLines: firstContent ? [firstContent] : [],
        correctAnswer: '',
        explanationLines: [],
      })
      continue
    }

    if (currentNum === null) continue
    const q = questionMap.get(currentNum)!

    // ── Đáp án N: ... ───────────────────────────────────────────────────────
    const aM = line.match(/^(?:Đáp án|ĐA|Đ\/A|Answer)\s*(\d+)\s*[.:)]\s*(.*)/i)
    if (aM && parseInt(aM[1]) === currentNum) {
      phase = 'answer'
      q.correctAnswer = aM[2].trim()
      continue
    }

    // ── Lời giải N: ... (có thể trống cùng dòng) ────────────────────────────
    const eM = line.match(/^(?:Lời giải|LG|Giải|Hướng dẫn)\s*(\d+)\s*[.:)]\s*(.*)/i)
    if (eM && parseInt(eM[1]) === currentNum) {
      phase = 'explanation'
      const firstExpl = eM[2].trim()
      if (firstExpl) q.explanationLines.push(firstExpl)
      continue
    }

    // ── Append theo phase hiện tại ───────────────────────────────────────────
    if (phase === 'content') {
      q.contentLines.push(line)
    } else if (phase === 'explanation') {
      q.explanationLines.push(line)
    }
    // phase === 'answer': bỏ qua (đáp án chỉ 1 dòng)
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

    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const mammoth = await import('mammoth')

      // Map: imgUrl → ocr text (để inject vào đúng vị trí trong HTML)
      const ocrMap = new Map<string, string>()

      const result = await mammoth.convertToHtml(
        { buffer },
        {
          convertImage: mammoth.images.imgElement(async (image) => {
            try {
              const imgBuf = await image.read()
              const ext = (image.contentType || 'image/png').split('/')[1] || 'png'
              const imgId = `${Date.now()}_${Math.random().toString(36).slice(2)}`
              const imgPath = `homework-images/${imgId}.${ext}`

              // Upload ảnh lên Supabase để hiển thị
              const url = await uploadFile(
                'avab-materials',
                imgPath,
                Buffer.from(imgBuf),
                image.contentType
              )
              imageCount++

              // OCR ảnh để lấy text nội dung
              const ocrText = await ocrImageBuffer(Buffer.from(imgBuf), image.contentType)
              if (ocrText) ocrMap.set(url, ocrText)

              return { src: url }
            } catch (err) {
              console.error('[Image handler]', err)
              return { src: '' }
            }
          }),
        }
      )

      if (imageCount === 0) {
        // Không có ảnh → strip HTML bình thường
        text = stripHtml(result.value)
      } else {
        // Có ảnh → thay <img src="URL"> bằng text OCR (nếu có) trước khi strip
        const processedHtml = result.value.replace(
          /<img[^>]+src="([^"]+)"[^>]*/gi,
          (_match, url: string) => {
            const ocr = ocrMap.get(url)
            // Giữ lại ảnh + chèn OCR text dưới ảnh
            return ocr
              ? `<img src="${url}" />\n<span class="ocr-text">${ocr}</span>`
              : `<img src="${url}" />`
          }
        )
        text = stripHtml(processedHtml)
      }
    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      text = buffer.toString('utf-8')
    }

    const parsed = parseHomeworkText(text)

    let homeworkSetId: string | null = null

    if (shouldSave && parsed.length > 0) {
      // Đếm số set hiện có để auto-order
      const existingCount = await prisma.homeworkSet.count({ where: { subjectId } })

      const newSet = await prisma.homeworkSet.create({
        data: {
          subjectId,
          title: setTitle,
          order: existingCount,
        },
      })
      homeworkSetId = newSet.id

      await prisma.question.createMany({
        data: parsed.map((q) => ({
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
      data: { parsed: parsed.length, questions: parsed, imageCount, homeworkSetId },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Parse failed' }, { status: 500 })
  }
}
