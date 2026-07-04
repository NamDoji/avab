import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

/** POST /api/admin/organizations/[id]/members
 *  Body: { phone: string, orgRole: string }
 *  → Find user by phone, add to org.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const { phone, orgRole = 'MEMBER' } = await request.json() as { phone: string; orgRole?: string }

    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Số điện thoại không được để trống' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { phone: phone.trim() },
      select: { id: true, name: true, email: true, phone: true, avatar: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng với số điện thoại này' }, { status: 404 })
    }

    // Check already a member
    const existing = await prisma.organizationUser.findUnique({
      where: { organizationId_userId: { organizationId: id, userId: user.id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Người dùng đã là thành viên của tổ chức này' }, { status: 409 })
    }

    const ou = await prisma.organizationUser.create({
      data: { organizationId: id, userId: user.id, orgRole, isDefault: false },
    })

    return NextResponse.json({
      member: {
        id:      ou.id,
        orgRole: ou.orgRole,
        joinedAt: ou.joinedAt.toISOString(),
        user: {
          id:     user.id,
          name:   user.name ?? '',
          email:  user.email ?? '',
          phone:  user.phone,
          avatar: user.avatar ?? '',
        },
      },
    })
  } catch (err) {
    console.error('[POST members]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

/** GET /api/admin/organizations/[id]/members */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  const { id } = await params
  const members = await prisma.organizationUser.findMany({
    where: { organizationId: id },
    orderBy: { joinedAt: 'asc' },
    include: { user: { select: { id: true, name: true, email: true, phone: true, avatar: true } } },
  })

  return NextResponse.json({ members: members.map(m => ({
    id:      m.id,
    orgRole: m.orgRole,
    joinedAt: m.joinedAt.toISOString(),
    user: {
      id:     m.user.id,
      name:   m.user.name ?? '',
      email:  m.user.email ?? '',
      phone:  m.user.phone,
      avatar: m.user.avatar ?? '',
    },
  })) })
}
