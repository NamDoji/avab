import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  // Get org context — verify ownership before update
  const orgCtx = await getOrganizationContext(check.userId)

  try {
    const { id } = await params

    // Verify org ownership
    const existing = await prisma.news.findUnique({
      where: { id },
      select: { organizationId: true, publishedAt: true },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết' },
        { status: 404 }
      )
    }
    // Org admin can only modify their org's news (not platform news with null orgId)
    if (orgCtx && existing.organizationId !== orgCtx.id) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền chỉnh sửa bài viết này' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, summary, content, thumbnail, isPublished } = body

    // Build update data selectively
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (summary !== undefined) updateData.summary = summary || null
    if (content !== undefined) updateData.content = content
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail || null
    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished)
      if (Boolean(isPublished)) {
        // Set publishedAt only when first publishing
        if (!existing.publishedAt) {
          updateData.publishedAt = new Date()
        }
      } else {
        updateData.publishedAt = null
      }
    }

    const article = await prisma.news.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: article })
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết' },
        { status: 404 }
      )
    }
    console.error('Admin update news error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật bài viết' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  // Get org context — verify ownership before delete
  const orgCtx = await getOrganizationContext(check.userId)

  try {
    const { id } = await params

    // Verify org ownership
    const existing = await prisma.news.findUnique({
      where: { id },
      select: { organizationId: true },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết' },
        { status: 404 }
      )
    }
    if (orgCtx && existing.organizationId !== orgCtx.id) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền xoá bài viết này' },
        { status: 403 }
      )
    }

    await prisma.news.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Đã xoá bài viết' })
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết' },
        { status: 404 }
      )
    }
    console.error('Admin delete news error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xoá bài viết' },
      { status: 500 }
    )
  }
}
