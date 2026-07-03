import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from 'docx'

type RouteContext = { params: Promise<{ courseId: string }> }

// Map query `type` param → DB material type(s)
const TYPE_MAP: Record<string, string[]> = {
  lessons:        ['THEORY', 'lesson-outline'],
  homework:       ['HOMEWORK'],
  answers:        ['ANSWER_KEY'],
  quiz:           ['QUIZ'],
  'teacher-guide':['TEACHER_GUIDE'],
  'video-script': ['VIDEO_SCRIPT'],
  all:            ['THEORY', 'lesson-outline', 'HOMEWORK', 'ANSWER_KEY', 'QUIZ', 'TEACHER_GUIDE', 'VIDEO_SCRIPT'],
}

/** Strip most markdown syntax to plain text */
function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')    // headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g,    '$1') // italic
    .replace(/`(.+?)`/g,      '$1') // inline code
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[(.+?)\]\(.*?\)/g, '$1') // links
    .replace(/^[-*+]\s+/gm, '• ')   // bullet lists
    .replace(/^\d+\.\s+/gm, '')     // ordered lists
    .replace(/^>{1,}\s*/gm, '')     // blockquotes
    .replace(/---+/g, '')            // hr
    .trim()
}

/** Split text into paragraph chunks (by double newline) */
function toParagraphs(text: string): Paragraph[] {
  return text
    .split(/\n{2,}/)
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(chunk =>
      new Paragraph({
        children: [new TextRun({ text: chunk, size: 24 })],
        spacing:  { after: 160 },
      })
    )
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') ?? 'docx'
    const type   = searchParams.get('type')   ?? 'all'

    if (format !== 'docx') {
      return NextResponse.json({ error: 'Only format=docx is supported' }, { status: 400 })
    }

    const allowedTypes = TYPE_MAP[type]
    if (!allowedTypes) {
      return NextResponse.json(
        { error: `Invalid type. Use: ${Object.keys(TYPE_MAP).join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch course + subjects + filtered materials
    const course = await prisma.course.findUnique({
      where:   { id: courseId },
      include: {
        subjects: {
          where:   { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            materials: {
              where:   { type: { in: allowedTypes } },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const exportDate = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })

    const gradeLabel = course.gradeMin != null
      ? (course.gradeMin === 0 ? 'Mầm non' : `Lớp ${course.gradeMin}`)
      : 'Đa khối'

    // ── Build DOCX ────────────────────────────────────────────────────────────

    const children: Paragraph[] = []

    // Cover page
    children.push(
      new Paragraph({
        children: [new TextRun({ text: course.name, bold: true, size: 48 })],
        heading:  HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing:  { before: 2000, after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `${course.subjectName ?? course.subjectCode} · ${gradeLabel}`, size: 28 })],
        alignment: AlignmentType.CENTER,
        spacing:  { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Xuất ngày: ${exportDate}`, size: 24, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing:  { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Loại nội dung: ${type}`, size: 24, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing:  { after: 2000 },
      }),
      new Paragraph({ children: [new PageBreak()] }),
    )

    // Subjects + materials
    for (const subject of course.subjects) {
      if (subject.materials.length === 0) continue

      // Subject heading
      children.push(
        new Paragraph({
          children: [new TextRun({ text: subject.name, bold: true, size: 36 })],
          heading:  HeadingLevel.HEADING_1,
          spacing:  { before: 600, after: 200 },
        })
      )

      if (subject.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: subject.description, italics: true, size: 24, color: '555555' })],
            spacing:  { after: 300 },
          })
        )
      }

      // Each material
      for (const mat of subject.materials) {
        if (mat.title) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: mat.title, bold: true, size: 28 })],
              heading:  HeadingLevel.HEADING_2,
              spacing:  { before: 400, after: 160 },
            })
          )
        }

        if (mat.content) {
          const plain = stripMarkdown(mat.content)
          children.push(...toParagraphs(plain))
        }
      }

      // Page break after each subject
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    })

    const buffer = await Packer.toBuffer(doc)
    // NextResponse body requires a Uint8Array / ArrayBuffer, not Node Buffer
    const arrayBuffer: ArrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer

    const safeName = course.name
      .replace(/[^a-zA-Z0-9À-ỹ\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 50)

    const filename = `${safeName}-${type}.docx`

    return new NextResponse(arrayBuffer, {
      status:  200,
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[Export] GET error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
