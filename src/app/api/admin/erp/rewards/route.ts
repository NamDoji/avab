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
  const type = searchParams.get('type') // reward | discipline

  try {
    const records = await prisma.rewardDiscipline.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Enrich with user info
    const userIds = [...new Set(records.map((r) => r.userId))]
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, phone: true },
        })
      : []
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    const enriched = records.map((r) => ({
      ...r,
      user: userMap[r.userId] ?? null,
    }))

    return NextResponse.json({ success: true, data: enriched })
  } catch (error) {
    console.error('Rewards GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải dữ liệu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      userId: string
      type: string
      category: string
      title: string
      description?: string
      date?: string
    }

    if (!body.userId || !body.type || !body.category || !body.title) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const adminId = (check.session.user as { id?: string }).id

    const record = await prisma.rewardDiscipline.create({
      data: {
        userId: body.userId,
        type: body.type,
        category: body.category,
        title: body.title,
        description: body.description ?? null,
        date: body.date ? new Date(body.date) : new Date(),
        issuedBy: adminId ?? null,
      },
    })

    return NextResponse.json({ success: true, data: record }, { status: 201 })
  } catch (error) {
    console.error('Rewards POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo bản ghi' }, { status: 500 })
  }
}
