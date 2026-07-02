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
// Strip HTML → plain text
// • Giữ lại ảnh dưới dạng [IMG:placeholder] để inject lại sau
// • Chuyển bảng thành markdown (| col | col |) để GPT-4o đọc được
// ─────────────────────────────────────────────────────────────────────────────
function stripHtmlKeepImages(html: string): string {
  return html
    // Ảnh → placeholder marker (src là placeholder như __IMG_0__)
    .replace(/<img[^>]+src="([^"]+)"[^>]*\/?>/gi, '\n[IMG:$1]\n')
    // Bảng → markdown style
    .replace(/<\/td>/gi, ' | ')
    .replace(/<\/th>/gi, ' | ')
    .replace(/<\/tr>/gi, '\n')
    // Block elements
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, '')
    // HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up
    .replace(/\n{3,}/g, '\n\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Sau khi GPT trả về content/explanation có [IMG:placeholder],
// thay thành HTML <img src="actual-url">
// ─────────────────────────────────────────────────────────────────────────────
function injectImageTags(text: string, placeholderToUrl: Map<string, string>): string {
  return text.replace(/\[IMG:([^\]]+)\]/g, (_, placeholder: string) => {
    const url = placeholderToUrl.get(placeholder.trim())
    if (!url) return ''
    return `<img src="${url}" alt="Hình minh họa" style="max-width:100%;border-radius:8px;margin:8px 0;display:block">`
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML TABLE PARSER — parse trực tiếp từ mammoth HTML output
// Xử lý: mỗi câu = 1 <table>, có 3 dòng: đề bài | đáp án + ảnh | lời giải
// Bảo toàn: những <img src="supabase-url"> được giữ nguyên
// ─────────────────────────────────────────────────────────────────────────────
function parseHtmlTables(
  html: string
): Array<{ order: number; content: string; correctAnswer: string; explanation: string; imageUrl?: string }> | null {
  const plain = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const innerHtml = (tag: string) =>
    tag.replace(/^<\w+[^>]*>/, '').replace(/<\/\w+>$/, '').trim()

  // Tách các <table>...</table>
  const tables: string[] = []
  const tableRe = /<table[\s\S]*?<\/table>/gi
  let tm: RegExpExecArray | null
  while ((tm = tableRe.exec(html)) !== null) tables.push(tm[0])

  if (tables.length < 3) return null // không phải file dạng table

  const questions: Array<{ order: number; content: string; correctAnswer: string; explanation: string; imageUrl?: string }> = []
  let order = 1

  for (const table of tables) {
    const tableText = plain(table)
    // Chỉ lấy bảng có chứa câu hỏi
    if (!/câu\s*\d+/i.test(tableText)) continue

    // Tách rows
    const rows: string[] = table.match(/<tr[\s\S]*?<\/tr>/gi) || []
    if (rows.length === 0) continue

    // Row 1: nội dung đề bài (HTML, giữ <strong>, <img>)
    const row1InnerHtml = rows[0]
      .replace(/<\/?tr[^>]*>/gi, '')
      .replace(/<td[^>]*>/gi, '').replace(/<\/td>/gi, '')
      .replace(/<th[^>]*>/gi, '').replace(/<\/th>/gi, '')
      .trim()
    // Xóa prefix "Câu N:" nếu có (giữ phần còn lại)
    const contentHtml = row1InnerHtml
      .replace(/<strong>Câu\s*\d+[:.\s]*<\/strong>/i, '')
      .replace(/Câu\s*\d+[:.\s]*/i, '')
      .trim()

    // Row 2: tách cells → đáp án + ảnh
    const cells: string[] = (rows[1] || '').match(/<td[\s\S]*?<\/td>/gi) || []

    let correctAnswer = ''
    let imageUrl: string | undefined

    // Row 2 cell phải: sơ đồ — sẽ đưa vào đầu lời giải
    let row2DiagramHtml = ''
    if (cells.length >= 2) {
      // Cột trái: đáp án
      const leftLines = plain(cells[0]).split(/\n|\s{2,}/).map(l => l.trim()).filter(Boolean)
      const ansLine = leftLines.find(l => /(?:đáp án|đáp số|answer)/i.test(l)) || leftLines[0] || ''
      const aMatch = ansLine.match(/(?:Đáp án|ĐA|đáp số|answer)[:\s]*(.+)/i)
      correctAnswer = (aMatch ? aMatch[1].trim() : ansLine.trim())
        .replace(/\s*Mức độ[:\s].*/i, '').trim()
      // Cột phải: sơ đồ → lưu HTML để nhúng vào lời giải
      const rightContent = cells[1].replace(/<\/?td[^>]*>/gi, '').trim()
      if (rightContent.includes('<img')) {
        row2DiagramHtml = `<div class="solution-diagram">${rightContent}</div>`
      }
    } else if (cells.length === 1) {
      const cellText = plain(cells[0])
      const aMatch = cellText.match(/(?:Đáp án|ĐA|đáp án|đáp số|answer)[:\s]*(.+)/i)
      correctAnswer = aMatch ? aMatch[1].trim() : ''
    }

    // Lời giải = sơ đồ (row 2 phải) + các bước (rows 3+)
    const stepsHtml = rows.slice(2).map(r =>
      r.replace(/<\/?tr[^>]*>/gi, '')
        .replace(/<td[^>]*>/gi, '').replace(/<\/td>/gi, '')
        .trim()
    ).join('\n').trim()
    const explanationHtml = [row2DiagramHtml, stepsHtml].filter(Boolean).join('\n')

    // Content = chỉ đề bài text (+ ảnh nếu có trong row 1)
    const finalContent = contentHtml
    imageUrl = undefined // không còn dùng imageUrl riêng

    if (finalContent.trim()) {
      questions.push({ order: order++, content: finalContent, correctAnswer, explanation: explanationHtml, imageUrl })
    }
  }

  return questions.length >= 3 ? questions : null
}

// ─────────────────────────────────────────────────────────────────────────────
// AI PARSER — GPT-4o đọc mọi format + giữ [IMG:] markers
// ─────────────────────────────────────────────────────────────────────────────
async function aiParseDocument(
  text: string
): Promise<Array<{ order: number; content: string; correctAnswer: string; explanation: string }>> {
  const prompt = `Bạn là hệ thống trích xuất bài tập từ tài liệu giáo dục tiếng Việt.

Dưới đây là nội dung đã trích xuất. Các marker [IMG:placeholder] là vị trí của hình ảnh.

NHIỆM VỤ: Trích xuất TẤT CẢ câu hỏi, trả về JSON object {"questions": [...]}.

QUY TẮC QUAN TRỌNG:
- "order": số thứ tự câu (1, 2, 3...)
- "content": toàn bộ đề bài, GIỮ NGUYÊN các marker [IMG:...] ở đúng vị trí
- "correctAnswer": đáp án cuối cùng ngắn gọn (ví dụ: "5 bạn", "23 quả")
- "explanation": toàn bộ lời giải, GIỮ NGUYÊN các marker [IMG:...] và bảng biểu
- KHÔNG được bỏ, sửa hay thay thế các marker [IMG:...]
- Bảng biểu giữ dạng: | Cột1 | Cột2 | ... (đã có sẵn trong text)
- Bỏ qua header/ghi chú đầu file, chỉ lấy câu bài tập

NỘI DUNG:
${text.substring(0, 14000)}`

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 6000,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const raw = res.choices[0]?.message?.content ?? '{}'
  let parsed: any
  try { parsed = JSON.parse(raw) } catch { return [] }

  const arr: any[] = Array.isArray(parsed)
    ? parsed
    : parsed.questions ?? parsed.data ?? parsed.items
      ?? (Object.values(parsed).find((v) => Array.isArray(v)) as any[])
      ?? []

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
// REGEX PARSER — nhanh cho file đúng mẫu
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
    const aM = line.replace(/^\|+\s*/, '').match(/^(?:Đáp án|ĐA|Đ\/A|Answer|Đáp số)\s*\d*\s*[.:)]\s*(.*)/i)
    if (aM) { phase = 'answer'; q.correctAnswer = aM[1].trim(); continue }
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

    if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''
    let imageCount = 0
    let docxHtmlWithUrls = '' // HTML gốc với URL ảnh thật (dùng cho table parser)
    const placeholderToUrl = new Map<string, string>()

    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const mammoth = await import('mammoth')
      let imgIdx = 0

      const result = await mammoth.convertToHtml(
        { buffer },
        {
          convertImage: mammoth.images.imgElement(async (image) => {
            try {
              const imgBuf = await image.read()
              const contentType = image.contentType || 'image/png'

              // Ưu tiên upload Supabase; nếu fail → dùng base64 data URI (luôn hoạt động)
              let url: string
              try {
                const ext = contentType.split('/')[1] || 'png'
                const imgPath = `homework-images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
                url = await uploadFile('avab-materials', imgPath, Buffer.from(imgBuf), contentType)
              } catch {
                // Fallback: base64 data URI
                url = `data:${contentType};base64,${Buffer.from(imgBuf).toString('base64')}`
              }

              const placeholder = `__IMG_${imgIdx++}__`
              placeholderToUrl.set(placeholder, url)
              imageCount++
              return { src: placeholder }
            } catch {
              return { src: '' }
            }
          }),
        }
      )

      // HTML với URL thật (thay placeholder bằng URL Supabase thật)
      docxHtmlWithUrls = result.value
      for (const [ph, url] of placeholderToUrl) {
        docxHtmlWithUrls = docxHtmlWithUrls.replaceAll(ph, url)
      }

      // Text cho regex/AI parser (giữ [IMG:ph] marker)
      text = stripHtmlKeepImages(result.value)

    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      text = buffer.toString('utf-8')
    }

    // ── Parse pipeline (3 tầng) ────────────────────────────────────────────────────────────────
    //   Tầng 1: HTML table parser (cho file dạng table với ảnh inline)
    //   Tầng 2: Regex parser (cho file văn bản chuẩn)
    //   Tầng 3: GPT-4o AI (cho mọi format lạ, có ảnh OCR)

    let parsed: Array<{ order: number; content: string; correctAnswer: string; explanation: string; imageUrl?: string }> = []
    let usedAI = false

    // Tầng 1: HTML table parser (file có cấu trúc table rõ ràng + ảnh)
    if (docxHtmlWithUrls) {
      const tableParsed = parseHtmlTables(docxHtmlWithUrls)
      if (tableParsed && tableParsed.length >= 3) {
        parsed = tableParsed
      }
    }

    // Tầng 2: Regex (nếu chưa có kết quả)
    if (parsed.length === 0) {
      parsed = regexParseText(text)
    }

    // Tầng 3: GPT-4o AI (nếu cần)
    if (parsed.length < 3 || parsed.filter(q => !q.correctAnswer.trim()).length > parsed.length * 0.5) {
      try {
        const aiResult = await aiParseDocument(text)
        if (aiResult.length > parsed.length) { parsed = aiResult; usedAI = true }
      } catch (err) {
        console.error('[AI Parser] failed:', err)
      }
    }

    // Inject ảnh placeholder vào content/explanation (cho AI parser output)
    if (!usedAI && imageCount > 0 && placeholderToUrl.size > 0) {
      parsed = parsed.map(q => ({
        ...q,
        content: injectImageTags(q.content, placeholderToUrl),
        explanation: injectImageTags(q.explanation, placeholderToUrl),
      }))
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
      data: { parsed: parsed.length, questions: parsed, imageCount, usedAI, homeworkSetId },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Parse failed' }, { status: 500 })
  }
}
