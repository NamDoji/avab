import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') return null
  return session
}

// GET /api/admin/permissions — list all permissions grouped by module
export async function GET(_req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
  })

  // Group by module
  const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = []
    acc[perm.module].push(perm)
    return acc
  }, {})

  return NextResponse.json({ success: true, data: { permissions, grouped } })
}

// POST /api/admin/permissions — create custom permission
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { key, module, action, name, description } = body as {
    key: string
    module: string
    action: string
    name: string
    description?: string
  }

  if (!key || !module || !action || !name) {
    return NextResponse.json({ success: false, error: 'key, module, action, name là bắt buộc' }, { status: 400 })
  }

  // Check unique key
  const existing = await prisma.permission.findUnique({ where: { key } })
  if (existing) {
    return NextResponse.json({ success: false, error: 'Key đã tồn tại' }, { status: 409 })
  }

  const permission = await prisma.permission.create({
    data: { key, module, action, name, description },
  })

  return NextResponse.json({ success: true, data: permission }, { status: 201 })
}
