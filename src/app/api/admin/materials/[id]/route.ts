import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

/**
 * PUT /api/admin/materials/[id]
 * Update SubjectMaterial content, title, or metadata
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const body  = await request.json() as {
      content?:  string
      title?:    string
      fileUrl?:  string
      fileName?: string
    }

    const updateData: Record<string, unknown> = {}
    if (body.content  !== undefined) updateData.content  = body.content
    if (body.title    !== undefined) updateData.title    = body.title
    if (body.fileUrl  !== undefined) updateData.fileUrl  = body.fileUrl
    if (body.fileName !== undefined) updateData.fileName = body.fileName

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không có trường nào để cập nhật' },
        { status: 400 }
      )
    }

    const material = await prisma.subjectMaterial.update({
      where: { id },
      data:  updateData,
    })

    return NextResponse.json({ success: true, data: material })
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tài liệu' },
        { status: 404 }
      )
    }
    console.error('Update material error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật tài liệu' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/materials/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    await prisma.subjectMaterial.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Đã xoá tài liệu' })
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tài liệu' },
        { status: 404 }
      )
    }
    console.error('Delete material error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xoá tài liệu' }, { status: 500 })
  }
}
