import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin()
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const orgCtx = await getOrganizationContext(check.userId)
  const { id } = await params

  // Verify org ownership before update
  const existing = await prisma.registration.findUnique({
    where: { id },
    select: { organizationId: true },
  })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 })
  }
  if (orgCtx && existing.organizationId !== orgCtx.id) {
    return NextResponse.json({ success: false, error: 'Không có quyền truy cập dữ liệu này' }, { status: 403 })
  }

  const body = await req.json()
  const { status, note2 } = body

  const updated = await prisma.registration.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(note2 !== undefined ? { note2 } : {}),
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin()
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const orgCtx = await getOrganizationContext(check.userId)
  const { id } = await params

  // Verify org ownership before delete
  const existing = await prisma.registration.findUnique({
    where: { id },
    select: { organizationId: true },
  })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 })
  }
  if (orgCtx && existing.organizationId !== orgCtx.id) {
    return NextResponse.json({ success: false, error: 'Không có quyền truy cập dữ liệu này' }, { status: 403 })
  }

  await prisma.registration.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
