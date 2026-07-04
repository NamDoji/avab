import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) return null
  return session
}

// GET /api/admin/roles — list all roles with _count
export async function GET(_req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const roles = await prisma.role.findMany({
    include: {
      _count: { select: { rolePermissions: true, userRoles: true } },
    },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json({ success: true, data: roles })
}

// POST /api/admin/roles — create role
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, slug, description, level, color, permissions } = body as {
    name: string
    slug?: string
    description?: string
    level: string
    color?: string
    permissions?: string[]
  }

  if (!name || !level) {
    return NextResponse.json({ success: false, error: 'name và level là bắt buộc' }, { status: 400 })
  }

  const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // Check unique slug
  const existing = await prisma.role.findUnique({ where: { slug: generatedSlug } })
  if (existing) {
    return NextResponse.json({ success: false, error: 'Slug đã tồn tại' }, { status: 409 })
  }

  // If permissions provided, resolve permissionIds
  let permissionIds: string[] = []
  if (permissions && permissions.length > 0) {
    const perms = await prisma.permission.findMany({
      where: { key: { in: permissions } },
      select: { id: true },
    })
    permissionIds = perms.map(p => p.id)
  }

  const role = await prisma.role.create({
    data: {
      name,
      slug: generatedSlug,
      description,
      level,
      color: color || 'gray',
      isSystem: false,
      ...(permissionIds.length > 0
        ? {
            rolePermissions: {
              create: permissionIds.map(permissionId => ({ permissionId })),
            },
          }
        : {}),
    },
    include: {
      _count: { select: { rolePermissions: true, userRoles: true } },
    },
  })

  return NextResponse.json({ success: true, data: role }, { status: 201 })
}
