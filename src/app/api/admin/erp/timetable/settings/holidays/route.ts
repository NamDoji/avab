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

async function getOrgId(): Promise<string> {
  const org = await prisma.organization.findFirst({ where: { slug: 'ob-school' } })
  return org?.id ?? 'ob-school'
}

export async function GET() {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const organizationId = await getOrgId()
    const holidays = await prisma.holidayCalendar.findMany({
      where: { organizationId },
      orderBy: { startDate: 'asc' },
    })
    return NextResponse.json({ success: true, data: holidays })
  } catch (error) {
    console.error('[timetable/settings/holidays] GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải ngày nghỉ' }, { status: 500 })
  }
}

interface HolidayBody {
  name: string
  startDate: string
  endDate: string
  type?: string
  campusId?: string | null
  isRecurring?: boolean
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const body = await request.json() as HolidayBody

    if (!body.name || !body.startDate || !body.endDate) {
      return NextResponse.json({ success: false, error: 'name, startDate, endDate là bắt buộc' }, { status: 400 })
    }

    const organizationId = await getOrgId()

    const holiday = await prisma.holidayCalendar.create({
      data: {
        organizationId,
        campusId: body.campusId ?? null,
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        type: body.type ?? 'holiday',
        isRecurring: body.isRecurring ?? false,
      },
    })

    return NextResponse.json({ success: true, data: holiday })
  } catch (error) {
    console.error('[timetable/settings/holidays] POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo ngày nghỉ' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id là bắt buộc' }, { status: 400 })
    }

    const organizationId = await getOrgId()
    const existing = await prisma.holidayCalendar.findFirst({
      where: { id, organizationId },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy ngày nghỉ' }, { status: 404 })
    }

    await prisma.holidayCalendar.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[timetable/settings/holidays] DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xóa ngày nghỉ' }, { status: 500 })
  }
}
