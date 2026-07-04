import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  // Attendance model has no direct organizationId — scope via courseId
  // Get courseIds belonging to this org first
  const orgCtx = await getOrganizationContext(check.userId)

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')
  const date = searchParams.get('date')

  try {
    const where: Record<string, unknown> = {}

    if (orgCtx) {
      if (courseId) {
        // Verify the requested courseId belongs to this org
        const course = await prisma.course.findFirst({
          where: { id: courseId, organizationId: orgCtx.id },
          select: { id: true },
        })
        if (!course) {
          return NextResponse.json({ success: false, error: 'Không có quyền truy cập lớp học này' }, { status: 403 })
        }
        where.courseId = courseId
      } else {
        // Filter attendance by all courses belonging to this org
        const orgCourses = await prisma.course.findMany({
          where: { organizationId: orgCtx.id },
          select: { id: true },
        })
        where.courseId = { in: orgCourses.map(c => c.id) }
      }
    } else {
      // Super admin — no org filter, apply requested courseId if any
      if (courseId) where.courseId = courseId
    }

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

  // Get org context to verify the courseId belongs to this org
  const orgCtx = await getOrganizationContext(check.userId)

  try {
    const body = await request.json() as { courseId: string; date: string; records: AttendanceRecord[] }
    const { courseId, date, records } = body

    if (!courseId || !date || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    // Verify the courseId belongs to this org (for org admins)
    if (orgCtx) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, organizationId: orgCtx.id },
        select: { id: true },
      })
      if (!course) {
        return NextResponse.json({ success: false, error: 'Không có quyền điểm danh lớp học này' }, { status: 403 })
      }
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
