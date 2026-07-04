import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'

// GET — list timetable versions (scoped to org)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id ?? ''
    const orgCtx = await getOrganizationContext(userId)

    const { searchParams } = new URL(req.url)
    const campusId = searchParams.get('campusId') ?? undefined

    // Build where: always filter by org, optionally by campus
    const whereOrg = orgCtx ? { organizationId: orgCtx.id } : {}
    const where = {
      ...whereOrg,
      ...(campusId ? { campusId } : {}),
    }

    const versions = await prisma.timetableVersion.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { generatedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ versions })
  } catch (err) {
    console.error('[timetable GET] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH — update version status (publish | archive | draft)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id ?? ''
    const orgCtx = await getOrganizationContext(userId)

    const { searchParams } = new URL(req.url)
    const versionId = searchParams.get('versionId')
    const action = searchParams.get('action')

    if (!versionId || !action) {
      return NextResponse.json({ error: 'versionId và action là bắt buộc' }, { status: 400 })
    }

    if (!['publish', 'archive', 'draft'].includes(action)) {
      return NextResponse.json({ error: 'action không hợp lệ' }, { status: 400 })
    }

    const existing = await prisma.timetableVersion.findUnique({ where: { id: versionId } })
    if (!existing) {
      return NextResponse.json({ error: 'Version không tồn tại' }, { status: 404 })
    }

    // Verify org ownership before modify
    if (orgCtx && existing.organizationId !== orgCtx.id) {
      return NextResponse.json({ error: 'Không có quyền chỉnh sửa version này' }, { status: 403 })
    }

    // If publishing, archive other published versions for same campus
    if (action === 'publish' && existing.campusId) {
      await prisma.timetableVersion.updateMany({
        where: {
          campusId: existing.campusId,
          status: 'published',
          id: { not: versionId },
        },
        data: { status: 'archived' },
      })
    }

    const statusMap: Record<string, string> = {
      publish: 'published',
      archive: 'archived',
      draft: 'draft',
    }

    const updated = await prisma.timetableVersion.update({
      where: { id: versionId },
      data: {
        status: statusMap[action],
        publishedAt: action === 'publish' ? new Date() : undefined,
      },
    })

    return NextResponse.json({ version: updated })
  } catch (err) {
    console.error('[timetable PATCH] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — delete a draft version and its slots
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id ?? ''
    const orgCtx = await getOrganizationContext(userId)

    const { searchParams } = new URL(req.url)
    const versionId = searchParams.get('versionId')

    if (!versionId) {
      return NextResponse.json({ error: 'versionId là bắt buộc' }, { status: 400 })
    }

    const existing = await prisma.timetableVersion.findUnique({ where: { id: versionId } })
    if (!existing) {
      return NextResponse.json({ error: 'Version không tồn tại' }, { status: 404 })
    }

    // Verify org ownership before delete
    if (orgCtx && existing.organizationId !== orgCtx.id) {
      return NextResponse.json({ error: 'Không có quyền xoá version này' }, { status: 403 })
    }

    if (existing.status === 'published') {
      return NextResponse.json(
        { error: 'Không thể xóa version đã publish. Hãy archive trước.' },
        { status: 422 }
      )
    }

    // Delete slots first
    await prisma.timetableSlot.deleteMany({ where: { versionId } })
    await prisma.timetableVersion.delete({ where: { id: versionId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[timetable DELETE] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
