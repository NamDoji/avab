import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as cheerio from 'cheerio'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx'

type RouteContext = { params: Promise<{ subjectId: string }> }

// ── Font sizes (docx dùng half-point → 32 = 16pt, in A4 to, dễ đọc) ──────────
const SZ_TITLE = 40      // 20pt
const SZ_H1    = 34      // 17pt
const SZ_H2    = 32      // 16pt
const SZ_BODY  = 31      // ~15.5pt
const SZ_META  = 26      // 13pt

const PURPLE = '6B21A8'
const GRAY   = '555555'
const GREEN  = '15803D'

// ── Ordered content block: text hoặc ảnh, giữ đúng thứ tự xuất hiện ──────────
type Block = { kind: 'text'; value: string } | { kind: 'img'; src: string }

// ── Lấy kích thước ảnh từ header (PNG/JPEG/GIF) để giữ tỉ lệ ──────────────────
function sniffImageSize(buf: Uint8Array): { w: number; h: number } | null {
  // PNG
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    const w = (buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19]
    const h = (buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23]
    if (w > 0 && h > 0) return { w, h }
  }
  // GIF
  if (buf.length > 10 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    const w = buf[6] | (buf[7] << 8)
    const h = buf[8] | (buf[9] << 8)
    if (w > 0 && h > 0) return { w, h }
  }
  // JPEG — quét các SOF marker
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) { i++; continue }
      const marker = buf[i + 1]
      // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        const h = (buf[i + 5] << 8) | buf[i + 6]
        const w = (buf[i + 7] << 8) | buf[i + 8]
        if (w > 0 && h > 0) return { w, h }
        break
      }
      const len = (buf[i + 2] << 8) | buf[i + 3]
      if (len <= 0) break
      i += 2 + len
    }
  }
  return null
}

function imgType(buf: Uint8Array, src: string): 'png' | 'jpg' | 'gif' | 'bmp' {
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'png'
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg'
  if (buf[0] === 0x47 && buf[1] === 0x49) return 'gif'
  if (buf[0] === 0x42 && buf[1] === 0x4d) return 'bmp'
  if (/\.png/i.test(src)) return 'png'
  if (/\.gif/i.test(src)) return 'gif'
  return 'jpg'
}

// ── Tải 1 ảnh (URL http hoặc data URI) → ImageRun paragraph, lỗi thì null ────
async function imageParagraph(src: string): Promise<Paragraph | null> {
  try {
    let buf: Uint8Array
    if (src.startsWith('data:')) {
      const b64 = src.split(',')[1] ?? ''
      buf = new Uint8Array(Buffer.from(b64, 'base64'))
    } else if (/^https?:\/\//i.test(src)) {
      const res = await fetch(src, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) return null
      buf = new Uint8Array(await res.arrayBuffer())
    } else {
      return null
    }
    if (!buf.length) return null

    const MAX_W = 460 // px — vừa khổ A4 (lề ~1 inch mỗi bên)
    const size = sniffImageSize(buf)
    let w = MAX_W
    let h = Math.round(MAX_W * 0.62)
    if (size) {
      const ratio = size.h / size.w
      w = Math.min(MAX_W, size.w)
      h = Math.round(w * ratio)
    }

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 160 },
      children: [
        new ImageRun({
          data: buf,
          type: imgType(buf, src),
          transformation: { width: w, height: h },
        } as any),
      ],
    })
  } catch {
    return null
  }
}

// ── HTML content → blocks (giữ thứ tự text/ảnh) dùng cheerio ─────────────────
function htmlToBlocks(html: string): Block[] {
  const blocks: Block[] = []
  const $ = cheerio.load(html)
  let textBuf = ''
  const flush = () => {
    const t = textBuf.replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').trim()
    if (t) blocks.push({ kind: 'text', value: t })
    textBuf = ''
  }
  const walk = (node: any) => {
    node.contents().each((_: number, el: any) => {
      if (el.type === 'text') {
        textBuf += $(el).text()
      } else if (el.type === 'tag') {
        const tag = el.tagName?.toLowerCase()
        if (tag === 'img') {
          const src = $(el).attr('src')
          if (src) { flush(); blocks.push({ kind: 'img', src }) }
        } else if (['br'].includes(tag)) {
          textBuf += '\n'
        } else if (['p', 'div', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
          walk($(el))
          textBuf += '\n\n'
        } else {
          walk($(el))
        }
      }
    })
  }
  walk($('body').length ? $('body') : $.root())
  flush()
  return blocks
}

// ── Markdown/plain content → blocks (tách ảnh ![](url)) ──────────────────────
function markdownToBlocks(md: string): Block[] {
  const blocks: Block[] = []
  const re = /!\[[^\]]*\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  const pushText = (raw: string) => {
    const t = stripMarkdown(raw)
    if (t) blocks.push({ kind: 'text', value: t })
  }
  while ((m = re.exec(md)) !== null) {
    pushText(md.slice(last, m.index))
    blocks.push({ kind: 'img', src: m[1].trim() })
    last = re.lastIndex
  }
  pushText(md.slice(last))
  return blocks
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[(.+?)\]\([^)]*\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^>{1,}\s*/gm, '')
    .replace(/-{3,}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function contentToBlocks(content: string): Block[] {
  const isHtml = /<(img|table|br|p|strong|em|ul|ol|li|h[1-6]|div)\b/i.test(content)
  return isHtml ? htmlToBlocks(content) : markdownToBlocks(content)
}

// ── text (nhiều đoạn) → Paragraph[] ──────────────────────────────────────────
function textParagraphs(text: string, opts?: { color?: string; size?: number; italics?: boolean }): Paragraph[] {
  return text
    .split(/\n{2,}/)
    .map(c => c.trim())
    .filter(Boolean)
    .map(chunk => new Paragraph({
      children: chunk.split('\n').flatMap((line, i) => {
        const run = new TextRun({
          text: line,
          size: opts?.size ?? SZ_BODY,
          color: opts?.color,
          italics: opts?.italics,
          break: i > 0 ? 1 : undefined,
        })
        return [run]
      }),
      spacing: { after: 140, line: 300 },
    }))
}

// ── Chuẩn hoá options về [{key,text}] ────────────────────────────────────────
function normOptions(options: unknown): Array<{ key: string; text: string }> {
  if (!options) return []
  if (Array.isArray(options)) {
    return options
      .map((o: any, i: number) => {
        if (o == null) return null
        if (typeof o === 'string') return { key: String.fromCharCode(65 + i), text: o }
        if (o.left != null && o.right != null) return { key: String(o.left), text: String(o.right) }
        return { key: String(o.key ?? String.fromCharCode(65 + i)), text: String(o.text ?? '') }
      })
      .filter(Boolean) as Array<{ key: string; text: string }>
  }
  if (typeof options === 'object') {
    return Object.entries(options as Record<string, unknown>).map(([k, v]) => ({ key: k, text: String(v) }))
  }
  return []
}

const TYPE_TITLE: Record<string, string> = {
  lessons: 'BÀI GIẢNG',
  homework: 'BÀI TẬP VỀ NHÀ',
  answers: 'ĐÁP ÁN & LỜI GIẢI',
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    const role = (session?.user as { role?: string })?.role ?? ''
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subjectId } = await context.params
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? 'lessons'
    if (!TYPE_TITLE[type]) {
      return NextResponse.json(
        { error: `Invalid type. Use: ${Object.keys(TYPE_TITLE).join(', ')}` },
        { status: 400 }
      )
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        course: { select: { name: true } },
        materials: { orderBy: { type: 'asc' } },
        questions: { orderBy: { order: 'asc' } },
        homeworkSets: {
          orderBy: { order: 'asc' },
          include: { questions: { orderBy: { order: 'asc' } } },
        },
      },
    })
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const children: Paragraph[] = []

    // ── Tiêu đề tài liệu ──────────────────────────────────────────────────────
    children.push(
      new Paragraph({
        children: [new TextRun({ text: subject.course?.name ?? '', size: SZ_META, color: GRAY, bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: subject.name, bold: true, size: SZ_TITLE, color: PURPLE })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: TYPE_TITLE[type], bold: true, size: SZ_H2, color: GRAY })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 320 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'DDDDDD', space: 8 } },
      }),
    )

    // ── Helper: render 1 question (dùng cho homework & answers) ───────────────
    const renderQuestion = async (q: any, idx: number, withAnswer: boolean) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `Câu ${idx}. `, bold: true, size: SZ_BODY, color: PURPLE })],
        spacing: { before: 200, after: 60 },
        keepNext: true,
      }))
      // Nội dung câu hỏi (có thể chứa HTML/ảnh)
      for (const b of contentToBlocks(q.content || '')) {
        if (b.kind === 'text') children.push(...textParagraphs(b.value))
        else { const p = await imageParagraph(b.src); if (p) children.push(p) }
      }
      // Ảnh riêng của câu hỏi
      if (q.imageUrl) { const p = await imageParagraph(q.imageUrl); if (p) children.push(p) }
      // Các lựa chọn
      const opts = normOptions(q.options)
      const qType = String(q.questionType || 'OPEN').toUpperCase()
      if (opts.length && ['MULTIPLE_CHOICE', 'MULTI_SELECT', 'TRUE_FALSE'].includes(qType)) {
        for (const o of opts) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: `   ${o.key}. `, bold: true, size: SZ_BODY }),
              new TextRun({ text: o.text, size: SZ_BODY }),
            ],
            spacing: { after: 60 },
          }))
        }
      } else if (opts.length && qType === 'MATCHING') {
        for (const o of opts) {
          children.push(new Paragraph({
            children: [new TextRun({ text: `   • ${o.key} — ${o.text}`, size: SZ_BODY })],
            spacing: { after: 60 },
          }))
        }
      }
      // Đáp án + lời giải
      if (withAnswer) {
        if (q.correctAnswer) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: 'Đáp án: ', bold: true, size: SZ_BODY, color: GREEN }),
              new TextRun({ text: String(q.correctAnswer), bold: true, size: SZ_BODY, color: GREEN }),
            ],
            spacing: { before: 60, after: 60 },
          }))
        }
        if (q.explanation) {
          children.push(new Paragraph({
            children: [new TextRun({ text: 'Lời giải: ', bold: true, size: SZ_BODY, color: GRAY })],
            spacing: { before: 40, after: 40 },
          }))
          for (const b of contentToBlocks(q.explanation)) {
            if (b.kind === 'text') children.push(...textParagraphs(b.value, { color: GRAY }))
            else { const p = await imageParagraph(b.src); if (p) children.push(p) }
          }
        }
      }
    }

    if (type === 'lessons') {
      // ── BÀI GIẢNG: material type THEORY (+ fallback các loại text khác) ─────
      const lectures = subject.materials.filter(m =>
        ['THEORY', 'lesson-outline', 'LESSON', 'DOCUMENT'].includes(m.type) && (m.content || '').trim()
      )
      const pool = lectures.length ? lectures : subject.materials.filter(m => (m.content || '').trim())
      if (!pool.length) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Chưa có nội dung bài giảng.', italics: true, size: SZ_BODY, color: GRAY })],
        }))
      }
      for (const mat of pool) {
        if (mat.title) {
          children.push(new Paragraph({
            children: [new TextRun({ text: mat.title, bold: true, size: SZ_H1, color: PURPLE })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 140 },
          }))
        }
        for (const b of contentToBlocks(mat.content || '')) {
          if (b.kind === 'text') children.push(...textParagraphs(b.value))
          else { const p = await imageParagraph(b.src); if (p) children.push(p) }
        }
      }
    } else {
      // ── BTVN & ĐÁP ÁN: dùng questions, gom theo homeworkSets + orphan ──────
      const withAnswer = type === 'answers'
      const setQIds = new Set((subject.homeworkSets ?? []).flatMap((s: any) => s.questions.map((q: any) => q.id)))
      const orphans = subject.questions.filter((q: any) => !setQIds.has(q.id))
      const groups: Array<{ title: string | null; questions: any[] }> = [
        ...(subject.homeworkSets ?? []).map((s: any) => ({ title: s.title, questions: s.questions })),
        ...(orphans.length ? [{ title: (subject.homeworkSets?.length ? 'Bài tập chung' : null), questions: orphans }] : []),
      ]
      const allQ = groups.flatMap(g => g.questions)
      if (!allQ.length) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Chưa có câu hỏi nào.', italics: true, size: SZ_BODY, color: GRAY })],
        }))
      }
      let counter = 0
      for (const g of groups) {
        if (!g.questions.length) continue
        if (g.title) {
          children.push(new Paragraph({
            children: [new TextRun({ text: g.title, bold: true, size: SZ_H1, color: PURPLE })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 140 },
          }))
        }
        for (const q of g.questions) {
          counter++
          await renderQuestion(q, counter, withAnswer)
        }
      }
    }

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: 'Times New Roman', size: SZ_BODY } },
        },
      },
      sections: [{
        properties: {
          page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } }, // ~1 inch (A4)
        },
        children,
      }],
    })

    const buffer = await Packer.toBuffer(doc)
    const arrayBuffer: ArrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer

    const safeName = `${subject.name}-${TYPE_TITLE[type]}`
      .replace(/[^a-zA-Z0-9À-ỹ\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 60)

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeName)}.docx"`,
      },
    })
  } catch (err) {
    console.error('[SubjectExport] GET error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
