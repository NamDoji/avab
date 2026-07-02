import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile } from '@/lib/supabase'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/subjects/[id]/parse-theory
// Parse DOCX/PDF bài giảng → HTML để hiển thị đẹp trên frontend
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  await params // consume params

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
          styleMap: [
            "p[style-name='Heading 1'] => h2.heading-1:fresh",
            "p[style-name='Heading 2'] => h3.heading-2:fresh",
            "p[style-name='Heading 3'] => h4.heading-3:fresh",
            "b => strong",
            "i => em",
          ],
          convertImage: mammoth.images.imgElement(async (image) => {
            try {
              const imgBuf = await image.read()
              const contentType = image.contentType || 'image/png'
              // Try Supabase upload; fallback to base64 data URI
              let src: string
              try {
                const ext = contentType.split('/')[1] || 'png'
                const imgPath = `theory-images/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
                src = await uploadFile('avab-materials', imgPath, Buffer.from(imgBuf), contentType)
              } catch {
                src = `data:${contentType};base64,${Buffer.from(imgBuf).toString('base64')}`
              }
              return { src, style: 'max-width:100%;border-radius:8px;margin:12px 0;display:block' }
            } catch {
              return { src: '' }
            }
          }),
        }
      )

      // Làm sạch HTML: bỏ style inline, giữ cấu trúc
      html = result.value
        .replace(/<p><\/p>/g, '')        // bỏ đoạn rỗng
        .replace(/\n{3,}/g, '\n\n')
        .trim()

    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      // Convert plain text → simple HTML paragraphs
      html = data.text
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
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
