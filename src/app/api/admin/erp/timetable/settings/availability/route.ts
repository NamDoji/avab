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

// GET ?teacherId=xxx  → list availability slots for a teacher
export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { searchParams } = new URL(request.url)
  const teacherId = searchParams.get('teacherId')

  if (!teacherId) {
    return NextResponse.json({ success: false, error: 'teacherId là bắt buộc' }, { status: 400 })
  }

  try {
    const rows = await prisma.teacherAvailability.findMany({
      where: { teacherId },
      orderBy: [{ dayOfWeek: 'asc' }, { periodFrom: 'asc' }],
    })
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('[availability] GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải lịch sẵn sàng' }, { status: 500 })
  }
}

interface AvailabilityBody {
  teacherId: string
  dayOfWeek: number
  periodFrom: number
  periodTo: number
  campusId?: string | null
  note?: string | null
}

// POST { teacherId, dayOfWeek, periodFrom, periodTo, campusId?, note? }
export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const body = await request.json() as AvailabilityBody
    const { teacherId, dayOfWeek, periodFrom, periodTo } = body

    if (!teacherId || !dayOfWeek || !periodFrom || !periodTo) {
      return NextResponse.json(
        { success: false, error: 'teacherId, dayOfWeek, periodFrom, periodTo là bắt buộc' },
        { status: 400 }
      )
    }

    if (periodFrom > periodTo) {
      return NextResponse.json(
        { success: false, error: 'periodFrom phải ≤ periodTo' },
        { status: 400 }
      )
    }

    // Upsert: if same day already exists for this teacher+campus, update it
    const existing = await prisma.teacherAvailability.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        campusId: body.campusId ?? null,
      },
    })

    let row
    if (existing) {
      row = await prisma.teacherAvailability.update({
        where: { id: existing.id },
        data: {
          periodFrom,
          periodTo,
          note: body.note ?? null,
        },
      })
    } else {
      row = await prisma.teacherAvailability.create({
        data: {
          teacherId,
          dayOfWeek,
          periodFrom,
          periodTo,
          campusId: body.campusId ?? null,
          note: body.note ?? null,
        },
      })
    }

    return NextResponse.json({ success: true, data: row })
  } catch (error) {
    console.error('[availability] POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể lưu lịch sẵn sàng' }, { status: 500 })
  }
}

// DELETE ?id=xxx
export async function DELETE(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ success: false, error: 'id là bắt buộc' }, { status: 400 })
  }

  try {
    await prisma.teacherAvailability.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[availability] DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xóa lịch sẵn sàng' }, { status: 500 })
  }
}
