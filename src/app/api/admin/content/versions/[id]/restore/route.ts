import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/admin/content/versions/[id]/restore
// Restore a content version: update SubjectMaterial.content with the version's content
export async function POST(request: NextRequest, { params }: RouteContext) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params

    // Find the version
    const version = await prisma.contentVersion.findUnique({
      where: { id },
    })

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Phiên bản không tồn tại' },
        { status: 404 }
      )
    }

    // Restore: update the SubjectMaterial content
    // entityId is the SubjectMaterial id
    const updated = await prisma.subjectMaterial.update({
      where: { id: version.entityId },
      data: { content: version.content },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Đã khôi phục phiên bản ${version.label ?? version.version}`,
    })
  } catch (error) {
    console.error('[POST /api/admin/content/versions/[id]/restore]', error)
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
