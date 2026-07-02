import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import * as XLSX from 'xlsx'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

// POST /api/admin/courses/[id]/students/import - Import học viên từ XLS
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id: courseId } = await params

    // Lấy thông tin khoá học
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy khoá học' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Vui lòng chọn file XLS/XLSX' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const wb = XLSX.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<any>(ws, { header: 1 })

    // Bỏ qua dòng header (row[0])
    const dataRows = rows.slice(1).filter((row: any[]) => row.length > 0 && (row[1] || row[2] || row[3]))

    let added = 0
    let skipped = 0
    let created = 0

    const hashedPassword = await bcrypt.hash('123456', 10)
    const expiresAt = course.paymentType === 'PER_COURSE'
      ? new Date(Date.now() + course.courseDurationMonths * 30 * 24 * 60 * 60 * 1000)
      : null

    for (const row of dataRows) {
      // Cột: STT(0), Họ tên(1), SĐT(2), Mail(3)
      const name = row[1] ? String(row[1]).trim() : ''
      const phone = row[2] ? String(row[2]).trim() : ''
      const email = row[3] ? String(row[3]).trim() : ''

      if (!phone && !email) {
        skipped++
        continue
      }

      // Tìm user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(phone ? [{ phone }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      })

      if (!user) {
        // Tạo user mới
        user = await prisma.user.create({
          data: {
            phone: phone || '',
            email: email || null,
            name: name || phone || email || 'Học viên',
            password: hashedPassword,
            role: 'STUDENT',
          },
        })
        created++
      }

      // Kiểm tra enrollment
      const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
      })

      if (existing) {
        if (existing.status === 'REMOVED') {
          // Kích hoạt lại
          await prisma.enrollment.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE', expiresAt },
          })
          added++
        } else {
          skipped++
        }
        continue
      }

      // Tạo enrollment mới
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId,
          status: 'ACTIVE',
          isFree: false,
          expiresAt,
        },
      })
      added++
    }

    return NextResponse.json({ success: true, data: { added, skipped, created } })
  } catch (error) {
    console.error('Import students error:', error)
    return NextResponse.json({ success: false, error: 'Không thể import học viên' }, { status: 500 })
  }
}
