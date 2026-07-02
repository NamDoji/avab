import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

// DELETE /api/admin/subjects/[id]/homework-sets/[setId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { setId } = await params
  try {
    // Cascade delete questions thuộc set này
    await prisma.question.deleteMany({ where: { homeworkSetId: setId } })
    await prisma.homeworkSet.delete({ where: { id: setId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 })
  }
}

// PATCH /api/admin/subjects/[id]/homework-sets/[setId] — đổi tên
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { setId } = await params
  const { title } = await req.json()
  try {
    const updated = await prisma.homeworkSet.update({
      where: { id: setId },
      data: { title },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
  }
}
