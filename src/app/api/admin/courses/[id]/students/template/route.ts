import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

// GET /api/admin/courses/[id]/students/template - Download file mẫu
export async function GET(_request: NextRequest) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const wb = XLSX.utils.book_new()
    const wsData = [
      ['STT', 'Họ tên', 'SĐT', 'Mail'],
      [1, 'Nguyễn Văn A', '0901234567', 'nguyenvana@example.com'],
      [2, 'Trần Thị B', '0912345678', 'tranthib@example.com'],
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học viên')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="mau_import_hoc_vien.xlsx"',
      },
    })
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo file mẫu' }, { status: 500 })
  }
}
