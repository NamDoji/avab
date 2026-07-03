import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') return null
  return session
}

type Params = { params: Promise<{ id: string }> }

// GET /api/admin/roles/[id]/users — list users with this role
export async function GET(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const userRoles = await prisma.userRole.findMany({
    where: { roleId: id },
    include: {
      user: { select: { id: true, name: true, phone: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: userRoles })
}

// POST /api/admin/roles/[id]/users — assign user to role
export async function POST(req: NextRequest, { params }: Params) {
  const adminSession = await requireAdmin()
  if (!adminSession) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { userId, scopeType, scopeId, expiresAt } = body as {
    userId: string
    scopeType?: string
    scopeId?: string
    expiresAt?: string
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId là bắt buộc' }, { status: 400 })
  }

  // Check role exists
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    return NextResponse.json({ success: false, error: 'Role không tồn tại' }, { status: 404 })
  }

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ success: false, error: 'User không tồn tại' }, { status: 404 })
  }

  const grantedBy = (adminSession.user as { id?: string })?.id

  const userRole = await prisma.userRole.create({
    data: {
      userId,
      roleId: id,
      scopeType: scopeType || null,
      scopeId: scopeId || null,
      grantedBy: grantedBy || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
    include: {
      user: { select: { id: true, name: true, phone: true, role: true } },
    },
  })

  return NextResponse.json({ success: true, data: userRole }, { status: 201 })
}

// DELETE /api/admin/roles/[id]/users — remove user from role
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { userId } = body as { userId: string }

  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId là bắt buộc' }, { status: 400 })
  }

  await prisma.userRole.deleteMany({
    where: { roleId: id, userId },
  })

  return NextResponse.json({ success: true })
}
