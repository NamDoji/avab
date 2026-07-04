import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if (!['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? ''))
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const userId = searchParams.get('userId')

  try {
    const timesheets = await prisma.timesheet.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: 'desc' },
      take: 200,
    })

    const userIds = [...new Set(timesheets.map((t) => t.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true, role: true },
    })
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    const data = timesheets.map((t) => ({ ...t, user: userMap[t.userId] ?? null }))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET timesheets error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải dữ liệu chấm công' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const body = (await request.json()) as {
      userId?: string
      date?: string
      checkIn?: string
      checkOut?: string
      note?: string
      seed?: boolean
    }

    // ── Seed mode ───────────────────────────────────────────────────────
    if (body.seed) {
      const staff = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'TEACHER'] } },
        select: { id: true },
        take: 10,
      })
      if (staff.length === 0)
        return NextResponse.json({ success: false, error: 'Không có nhân viên để seed' }, { status: 400 })

      const today = new Date()
      const records = staff.slice(0, 10).map((u, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const ci = new Date(d)
        ci.setHours(8, Math.floor(Math.random() * 30), 0, 0)
        const co = new Date(d)
        co.setHours(17, Math.floor(Math.random() * 30), 0, 0)
        return {
          userId: u.id,
          date: d,
          checkIn: ci,
          checkOut: co,
          hoursWorked: Math.round(((co.getTime() - ci.getTime()) / 3_600_000) * 10) / 10,
          note: 'Dữ liệu mẫu',
        }
      })
      await prisma.timesheet.createMany({ data: records })
      return NextResponse.json({ success: true, message: `Đã seed ${records.length} bản ghi` })
    }

    // ── Normal create ────────────────────────────────────────────────────
    const { userId, date, checkIn, checkOut, note } = body
    if (!userId || !date)
      return NextResponse.json({ success: false, error: 'Thiếu userId hoặc date' }, { status: 400 })

    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)

    let hoursWorked: number | null = null
    if (checkIn && checkOut) {
      hoursWorked =
        Math.round(((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3_600_000) * 10) / 10
    }

    const timesheet = await prisma.timesheet.create({
      data: {
        userId,
        date: dateObj,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        hoursWorked: hoursWorked ?? undefined,
        note: note ?? undefined,
      },
    })

    return NextResponse.json({ success: true, data: timesheet }, { status: 201 })
  } catch (error) {
    console.error('POST timesheet error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo bản ghi chấm công' },
      { status: 500 },
    )
  }
}
