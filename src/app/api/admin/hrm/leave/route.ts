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
  const status = searchParams.get('status')
  const userId = searchParams.get('userId')

  try {
    const requests = await prisma.leaveRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const userIds = [
      ...new Set([
        ...requests.map((r) => r.userId),
        ...requests.filter((r) => r.approvedBy).map((r) => r.approvedBy!),
      ]),
    ]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true, role: true },
    })
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    const data = requests.map((r) => ({
      ...r,
      user: userMap[r.userId] ?? null,
      approver: r.approvedBy ? (userMap[r.approvedBy] ?? null) : null,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET leave error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách nghỉ phép' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const body = (await request.json()) as {
      userId: string
      type: string
      startDate: string
      endDate: string
      days: number
      reason?: string
      organizationId?: string
    }

    const { userId, type, startDate, endDate, days, reason, organizationId } = body
    if (!userId || !type || !startDate || !endDate || days == null)
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 })

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason: reason ?? undefined,
        organizationId: organizationId ?? undefined,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, data: leaveRequest }, { status: 201 })
  } catch (error) {
    console.error('POST leave error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo đơn nghỉ phép' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const body = (await request.json()) as {
      id: string
      status: 'approved' | 'rejected'
      approvedBy?: string
    }

    const { id, status, approvedBy } = body
    if (!id || !['approved', 'rejected'].includes(status))
      return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ' }, { status: 400 })

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: approvedBy ?? undefined,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH leave error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật đơn nghỉ phép' }, { status: 500 })
  }
}
