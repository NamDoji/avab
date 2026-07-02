import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile } from '@/lib/supabase'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML Table Parser — dùng chung logic với parse-homework
// Phát hiện file có cấu trúc bảng (Câu N / Đáp án / Lời giải)
// ─────────────────────────────────────────────────────────────────────────────
function parseTableDocument(html: string): Array<{
  order: number
  content: string
  correctAnswer: string
  explanation: string
}> | null {
  const plain = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || []
  if (tables.length < 3) return null

  const questions: Array<{ order: number; content: string; correctAnswer: string; explanation: string }> = []
  let order = 1

  for (const table of tables) {
    if (!/câu\s*\d+/i.test(plain(table))) continue
    const rows = table.match(/<tr[\s\S]*?<\/tr>/gi) || []
    if (!rows[0]) continue

    const row1Html = rows[0]
      .replace(/<\/?tr[^>]*>/gi, '').replace(/<td[^>]*>/gi, '').replace(/<\/td>/gi, '')
      .replace(/<th[^>]*>/gi, '').replace(/<\/th>/gi, '').trim()
    const contentHtml = row1Html
      .replace(/<strong>Câu\s*\d+[:.\\s]*<\/strong>/i, '')
      .replace(/Câu\s*\d+[:.\\s]*/i, '').trim()

    const cells = (rows[1] || '').match(/<td[\s\S]*?<\/td>/gi) || []
    let correctAnswer = ''
    let row2DiagramHtml = ''

    if (cells.length >= 2) {
      const leftLines: string[] = plain(cells[0] ?? '').split(/\s{2,}|\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0)
      const ansLine: string = leftLines.find((l: string) => /đáp án|đáp số/i.test(l)) ?? leftLines[0] ?? ''
      const aM = ansLine.match(/(?:Đáp án|Đáp số)[:\s]*(.+)/i)
      correctAnswer = (aM ? (aM[1] ?? '') : ansLine).replace(/\s*Mức độ[:\s].*/i, '').trim()
      const rightContent = cells[1].replace(/<\/?td[^>]*>/gi, '').trim()
      if (rightContent.includes('<img')) {
        row2DiagramHtml = `<div style="text-align:center;margin:12px 0">${rightContent}</div>`
      }
    } else if (cells.length === 1) {
      const aM = plain(cells[0]).match(/(?:Đáp án|Đáp số)[:\s]*(.+)/i)
      correctAnswer = aM ? aM[1].replace(/\s*Mức độ.*/i, '').trim() : ''
    }

    const stepsHtml = rows.slice(2).map(r =>
      r.replace(/<\/?tr[^>]*>/gi, '').replace(/<td[^>]*>/gi, '').replace(/<\/td>/gi, '').trim()
    ).join('\n').trim()
    const explanationHtml = [row2DiagramHtml, stepsHtml].filter(Boolean).join('\n')

    if (contentHtml.trim()) {
      questions.push({ order: order++, content: contentHtml, correctAnswer, explanation: explanationHtml })
    }
  }

  return questions.length >= 3 ? questions : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Tạo HTML cards giống Tab Đáp Án — inline styles để render ở mọi nơi
// ─────────────────────────────────────────────────────────────────────────────
function buildCardHtml(questions: Array<{ order: number; content: string; correctAnswer: string; explanation: string }>): string {
  const cards = questions.map(q => `
<div style="border:1px solid #99f6e4;border-radius:16px;padding:20px;background:white;margin-bottom:16px">
  <!-- Đề bài -->
  <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
    <span style="min-width:36px;height:36px;background:#0d9488;color:white;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex-shrink:0">${q.order}</span>
    <div style="font-weight:700;color:#111827;font-size:15px;line-height:1.6">${q.content}</div>
  </div>
  <!-- Đáp án -->
  ${q.correctAnswer ? `
  <div style="background:#f0fdf4;border-radius:12px;padding:10px 16px;margin-bottom:8px">
    <div style="font-size:11px;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Đáp án</div>
    <div style="font-weight:900;color:#166534;font-size:17px">${q.correctAnswer}</div>
  </div>` : ''}
  <!-- Lời giải -->
  ${q.explanation ? `
  <div style="background:#eff6ff;border-radius:12px;padding:10px 16px">
    <div style="font-size:11px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">📝 Lời giải</div>
    <div style="color:#1e3a8a;font-size:14px;line-height:1.6">${q.explanation}</div>
  </div>` : ''}
</div>`).join('')

  return `<div style="font-family:inherit">${cards}</div>`
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/subjects/[id]/parse-theory
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  await params

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let html = ''

    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const mammoth = await import('mammoth')

      const result = await mammoth.convertToHtml(
        { buffer },
        {
          convertImage: mammoth.images.imgElement(async (image) => {
            try {
              const imgBuf = await image.read()
              const contentType = image.contentType || 'image/png'
              // Try Supabase upload; fallback to base64
              let src: string
              try {
                const ext = contentType.split('/')[1] || 'png'
                const imgPath = `theory-images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
                src = await uploadFile('avab-materials', imgPath, Buffer.from(imgBuf), contentType)
              } catch {
                src = `data:${contentType};base64,${Buffer.from(imgBuf).toString('base64')}`
              }
              return { src, style: 'max-width:100%;border-radius:8px;margin:8px 0;display:block' }
            } catch {
              return { src: '' }
            }
          }),
        }
      )

      // Thử parse dạng bảng (Câu/Đáp án/Lời giải)
      const tableQuestions = parseTableDocument(result.value)
      if (tableQuestions && tableQuestions.length >= 3) {
        // File có cấu trúc bảng → tạo HTML cards
        html = buildCardHtml(tableQuestions)
      } else {
        // File prose thông thường → dùng HTML gốc từ mammoth
        html = result.value
          .replace(/<p><\/p>/g, '')
          .trim()
      }

    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      html = data.text
        .split('\n').map((l: string) => l.trim()).filter((l: string) => l)
        .map((l: string) => `<p>${l.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
        .join('\n')
    } else {
      return NextResponse.json({ success: false, error: 'Chỉ hỗ trợ .docx và .pdf' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: { html, fileName: file.name, size: file.size },
    })
  } catch (err) {
    console.error('[parse-theory]', err)
    return NextResponse.json({ success: false, error: 'Parse thất bại' }, { status: 500 })
  }
}
