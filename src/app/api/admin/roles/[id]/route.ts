import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) return null
  return session
}

type Params = { params: Promise<{ id: string }> }

// GET /api/admin/roles/[id] — role detail with permissions + userRoles
export async function GET(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        include: { permission: true },
        orderBy: { permission: { key: 'asc' } },
      },
      userRoles: {
        include: {
          user: { select: { id: true, name: true, phone: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!role) {
    return NextResponse.json({ success: false, error: 'Role không tồn tại' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: role })
}

// PUT /api/admin/roles/[id] — update role
export async function PUT(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, description, color, level } = body as {
    name?: string
    description?: string
    color?: string
    level?: string
  }

  const role = await prisma.role.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(level !== undefined ? { level } : {}),
    },
  })

  return NextResponse.json({ success: true, data: role })
}

// DELETE /api/admin/roles/[id] — delete non-system role
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    return NextResponse.json({ success: false, error: 'Role không tồn tại' }, { status: 404 })
  }
  if (role.isSystem) {
    return NextResponse.json({ success: false, error: 'Không thể xóa system role' }, { status: 403 })
  }

  await prisma.role.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
