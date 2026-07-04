import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return { session, userId, orgCtx }
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // reward | discipline

  try {
    // Scope: chỉ lấy records của users thuộc org hiện tại
    let allowedUserIds: string[] | null = null
    if (check.orgCtx) {
      const orgUsers = await prisma.organizationUser.findMany({
        where: { organizationId: check.orgCtx.id },
        select: { userId: true },
      })
      allowedUserIds = orgUsers.map(ou => ou.userId)
    }

    const records = await prisma.rewardDiscipline.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(allowedUserIds ? { userId: { in: allowedUserIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

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
  const check = await requireAdmin(request)
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

    // Ownership check: target user phải thuộc org của admin
    if (check.orgCtx) {
      const member = await prisma.organizationUser.findFirst({
        where: { userId: body.userId, organizationId: check.orgCtx.id },
      })
      if (!member) return NextResponse.json({ success: false, error: 'Học sinh không thuộc tổ chức này' }, { status: 403 })
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
