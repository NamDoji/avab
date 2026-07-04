import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền', status: 403 as const }
  return { session }
}

/** PATCH /api/admin/organizations/[id]/members/[memberId] — change role */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const check = await requireAdmin()
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })

  const { memberId } = await params
  const { orgRole } = await request.json() as { orgRole: string }

  try {
    const updated = await prisma.organizationUser.update({
      where: { id: memberId },
      data: { orgRole },
    })
    return NextResponse.json({ success: true, orgRole: updated.orgRole })
  } catch (err) {
    console.error('[PATCH member]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

/** DELETE /api/admin/organizations/[id]/members/[memberId] — remove member */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const check = await requireAdmin()
  if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })

  const { memberId } = await params

  try {
    await prisma.organizationUser.delete({ where: { id: memberId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE member]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
