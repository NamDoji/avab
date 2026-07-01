import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin()
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id } = await params
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

  const { id } = await params
  await prisma.registration.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
