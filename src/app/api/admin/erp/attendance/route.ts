import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')
  const date = searchParams.get('date')

  try {
    const where: Record<string, unknown> = {}
    if (courseId) where.courseId = courseId
    if (date) {
      const d = new Date(date)
      where.date = d
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: [{ date: 'desc' }, { courseId: 'asc' }],
      take: 200,
    })

    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải dữ liệu điểm danh' }, { status: 500 })
  }
}

interface AttendanceRecord {
  userId: string
  status: string
  note?: string
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as { courseId: string; date: string; records: AttendanceRecord[] }
    const { courseId, date, records } = body

    if (!courseId || !date || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const dateObj = new Date(date)
    const adminId = (check.session.user as { id?: string }).id

    const upserts = await Promise.all(
      records.map((r: AttendanceRecord) =>
        prisma.attendance.upsert({
          where: {
            courseId_userId_date: {
              courseId,
              userId: r.userId,
              date: dateObj,
            },
          },
          update: {
            status: r.status,
            note: r.note ?? null,
            markedBy: adminId ?? null,
          },
          create: {
            courseId,
            userId: r.userId,
            date: dateObj,
            status: r.status,
            note: r.note ?? null,
            markedBy: adminId ?? null,
          },
        })
      )
    )

    return NextResponse.json({ success: true, data: upserts, count: upserts.length })
  } catch (error) {
    console.error('Attendance POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể lưu điểm danh' }, { status: 500 })
  }
}
