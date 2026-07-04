import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') return null
  return session
}

interface TemplateConfig {
  headers: string[]
  example: string[][]
}

const TEMPLATES: Record<string, TemplateConfig> = {
  students: {
    headers: ['Họ và tên (*)', 'Số điện thoại (*)', 'Email', 'Lớp học (Course Code)', 'Ghi chú'],
    example: [['Nguyễn Văn An', '0901234567', 'an@gmail.com', 'OB-Q1-TH-1', '']],
  },
  teachers: {
    headers: ['Họ và tên (*)', 'Số điện thoại (*)', 'Email', 'Cơ sở (Campus Code)', 'Chuyên môn'],
    example: [['Trần Thị Bình', '0902345678', 'binh@ob.edu.vn', 'Q1', 'Toán']],
  },
  leads: {
    headers: ['Họ tên PH/HS (*)', 'Số điện thoại (*)', 'Email', 'Ghi chú', 'Loại (CONTACT/ENROLLMENT)'],
    example: [['Lê Văn Minh', '0903456789', '', 'Quan tâm lớp 5', 'CONTACT']],
  },
  staff: {
    headers: ['Họ và tên (*)', 'Số điện thoại (*)', 'Email', 'Chức vụ (ADMIN/TEACHER)', 'Cơ sở (Campus Code)'],
    example: [['Phạm Thị Hoa', '0904567890', 'hoa@ob.edu.vn', 'TEACHER', 'Q7']],
  },
  classes: {
    headers: ['Tên lớp (*)', 'Mã lớp (*)', 'Cấp học (MN/TH/THCS/THPT)', 'Cơ sở (Campus Code)', 'Học phí'],
    example: [['Toán 5A - Quận 1', 'OB-Q1-TH-1', 'TH', 'Q1', '4000000']],
  },
  // Legacy modules still supported
  courses: {
    headers: ['Mã khóa học (*)', 'Tên khóa học (*)', 'Khối lớp', 'Môn học', 'Học phí'],
    example: [['OB-TOAN-5', 'Toán lớp 5', '5', 'Toán', '4000000']],
  },
  rooms: {
    headers: ['Tên phòng (*)', 'Sức chứa', 'Loại phòng', 'Tầng', 'Tòa nhà'],
    example: [['Phòng A101', '30', 'standard', '1', 'Tòa A']],
  },
  questions: {
    headers: ['Tên chuyên đề (*)', 'Nội dung câu hỏi (*)', 'Đáp án đúng (*)', 'Giải thích', 'Loại câu hỏi'],
    example: [['Toán cơ bản', '2 + 2 = ?', '4', 'Phép cộng cơ bản', 'OPEN']],
  },
}

const MODULE_LABELS: Record<string, string> = {
  students: 'hoc-sinh',
  teachers: 'giao-vien',
  leads: 'khach-hang',
  staff: 'nhan-vien',
  classes: 'lop-hoc',
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
    // Support both ?type= (new) and ?module= (legacy)
    const type = searchParams.get('type') ?? searchParams.get('module') ?? 'students'

    const template = TEMPLATES[type] ?? TEMPLATES.students

    // Create workbook with header + example row
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([template.headers, ...template.example])

    // Column widths (25 chars each)
    ws['!cols'] = template.headers.map(() => ({ wch: 25 }))

    XLSX.utils.book_append_sheet(wb, ws, 'Template')

    const xlsxBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
    const body = new Uint8Array(xlsxBuf)

    const slug = MODULE_LABELS[type] ?? type
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="template-${slug}.xlsx"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[migration/template:GET]', err)
    return NextResponse.json({ success: false, error: 'Tạo template thất bại' }, { status: 500 })
  }
}
