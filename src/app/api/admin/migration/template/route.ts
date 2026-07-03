import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') return null
  return session
}

const TEMPLATES: Record<string, string[]> = {
  students: ['Họ và tên', 'Số điện thoại', 'Email', 'Tên phụ huynh', 'SĐT phụ huynh', 'Mã khóa học'],
  teachers: ['Họ và tên', 'Số điện thoại', 'Email', 'Chuyên môn'],
  courses:  ['Mã khóa học', 'Tên khóa học', 'Khối lớp', 'Môn học', 'Học phí'],
  rooms:    ['Tên phòng', 'Sức chứa', 'Loại phòng', 'Tầng', 'Tòa nhà'],
  questions:['Tên chuyên đề', 'Nội dung câu hỏi', 'Đáp án đúng', 'Giải thích', 'Loại câu hỏi'],
}

const MODULE_LABELS: Record<string, string> = {
  students: 'hoc-sinh',
  teachers: 'giao-vien',
  courses: 'khoa-hoc',
  rooms: 'phong-hoc',
  questions: 'cau-hoi',
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const module = searchParams.get('module') ?? 'students'

    const headers = TEMPLATES[module] ?? TEMPLATES.students

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers])

    // Style header row (column widths)
    ws['!cols'] = headers.map(() => ({ wch: 20 }))

    XLSX.utils.book_append_sheet(wb, ws, 'Template')

    const xlsxBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
    // Convert to Uint8Array for NextResponse compatibility
    const body = new Uint8Array(xlsxBuf)

    const slug = MODULE_LABELS[module] ?? module
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="avab-template-${slug}.xlsx"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[migration/template:GET]', err)
    return NextResponse.json({ success: false, error: 'Tạo template thất bại' }, { status: 500 })
  }
}
