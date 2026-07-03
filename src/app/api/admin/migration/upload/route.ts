import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') return null
  return session
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const module = formData.get('module') as string | null

    if (!file || !module) {
      return NextResponse.json({ success: false, error: 'Thiếu file hoặc module' }, { status: 400 })
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse with XLSX
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    // Convert to array of objects
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: false,
    })

    const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : []
    const previewRows = rawRows.slice(0, 5)
    const totalRows = rawRows.length

    // Create MigrationLog with analyzing status
    const log = await prisma.migrationLog.create({
      data: {
        module,
        format: file.name.endsWith('.csv') ? 'csv' : 'excel',
        fileName: file.name,
        fileSize: buffer.length,
        totalRows,
        status: 'analyzing',
        importedBy: (session.user as any)?.id ?? null,
      },
    })

    // GPT-4o AI mapping
    let suggestedMapping: Record<string, string | null> = {}
    try {
      const prompt = `Phân tích headers của file Excel/CSV và đề xuất mapping sang schema AvaB.

Headers tìm thấy: ${headers.join(', ')}
Module target: ${module}

Đề xuất mapping theo format JSON:
{
  "sourceHeader": "targetField",
  ...
}

Các field AvaB theo module:
- students: name, phone, email, password, parentName, parentPhone, courseCode
- teachers: name, phone, email, password, specialization  
- courses: code, name, description, gradeMin, subjectCode, price
- classes: courseName, studentPhone (bulk enrollment)
- rooms: name, capacity, type, floor, building
- questions: subjectName, content, correctAnswer, explanation, questionType

Nếu không chắc chắn, để giá trị là null. Trả về JSON thuần túy, không có markdown.`

      const aiResp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500,
      })

      const raw = aiResp.choices[0]?.message?.content?.trim() ?? '{}'
      // Strip possible markdown code fences
      const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
      suggestedMapping = JSON.parse(cleaned)
    } catch (aiErr) {
      console.error('[migration/upload] AI mapping failed:', aiErr)
      // Continue without AI mapping
      headers.forEach(h => { suggestedMapping[h] = null })
    }

    // Update log status to mapping
    await prisma.migrationLog.update({
      where: { id: log.id },
      data: { status: 'mapping', mapping: suggestedMapping },
    })

    return NextResponse.json({
      success: true,
      migrationId: log.id,
      headers,
      preview: previewRows,
      allRows: rawRows,
      suggestedMapping,
      totalRows,
    })
  } catch (err) {
    console.error('[migration/upload:POST]', err)
    return NextResponse.json({ success: false, error: 'Upload thất bại' }, { status: 500 })
  }
}
