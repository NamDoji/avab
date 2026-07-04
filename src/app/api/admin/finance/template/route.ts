import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') return null
  return session
}

const FINANCE_TEMPLATE = {
  headers: ['Mã HS (*)', 'Họ tên', 'Tên khóa học', 'Số tiền', 'Ghi chú'],
  example: [
    ['OB-HS-001', 'Nguyễn Văn An', 'Toán 5A - Quận 1', '16000000', 'Học kỳ 1'],
    ['OB-HS-002', 'Trần Thị Bình', 'Toán 5B - Quận 7', '16000000', 'Học kỳ 1'],
  ],
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    void req

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([FINANCE_TEMPLATE.headers, ...FINANCE_TEMPLATE.example])

    // Column widths
    ws['!cols'] = FINANCE_TEMPLATE.headers.map(() => ({ wch: 25 }))

    XLSX.utils.book_append_sheet(wb, ws, 'Học phí')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
    const body = new Uint8Array(buf)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template-hoc-phi.xlsx"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[finance/template:GET]', err)
    return NextResponse.json({ success: false, error: 'Tạo template thất bại' }, { status: 500 })
  }
}
