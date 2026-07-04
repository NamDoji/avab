import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) return null
  return session
}

type Params = { params: Promise<{ id: string }> }

// PUT /api/admin/roles/[id]/permissions — replace all permissions for role
export async function PUT(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { permissionKeys } = body as { permissionKeys: string[] }

  if (!Array.isArray(permissionKeys)) {
    return NextResponse.json({ success: false, error: 'permissionKeys phải là mảng' }, { status: 400 })
  }

  // Check role exists
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    return NextResponse.json({ success: false, error: 'Role không tồn tại' }, { status: 404 })
  }

  // Resolve keys → ids
  const permissions = await prisma.permission.findMany({
    where: { key: { in: permissionKeys } },
    select: { id: true, key: true },
  })

  const permissionIds = permissions.map(p => p.id)

  // Replace: deleteMany then createMany in a transaction
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({ roleId: id, permissionId })),
      skipDuplicates: true,
    }),
  ])

  return NextResponse.json({
    success: true,
    data: { updated: permissionIds.length },
  })
}
