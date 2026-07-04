import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const org = await prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: {
        campuses: { where: { isActive: true }, orderBy: { name: 'asc' } },
        _count: {
          select: {
            organizationUsers: true,
            courses: true,
            campuses: { where: { isActive: true } },
          },
        },
      },
    })

    if (!org) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tổ chức' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: org })
  } catch (error) {
    console.error('GET /api/admin/organizations/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Lỗi server' }, { status: 500 })
  }
}

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
    const body = await request.json()
    const { name, logo, domain, type, modules, settings, description } = body

    // Merge settings (description can come as top-level convenience field)
    let mergedSettings = settings
    if (description !== undefined) {
      const existing = await prisma.organization.findUnique({ where: { id }, select: { settings: true } })
      const existingSettings = (existing?.settings && typeof existing.settings === 'object' && !Array.isArray(existing.settings))
        ? (existing.settings as Record<string, unknown>)
        : {}
      mergedSettings = { ...existingSettings, description, ...(settings ?? {}) }
    }

    const org = await prisma.organization.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(logo !== undefined && { logo }),
        ...(domain !== undefined && { domain }),
        ...(type !== undefined && { type }),
        ...(modules !== undefined && { modules }),
        ...(mergedSettings !== undefined && { settings: mergedSettings }),
      },
    })

    return NextResponse.json({ success: true, data: org })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tổ chức' }, { status: 404 })
    }
    console.error('PUT /api/admin/organizations/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật tổ chức' }, { status: 500 })
  }
}

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
    const org = await prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: org })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tổ chức' }, { status: 404 })
    }
    console.error('DELETE /api/admin/organizations/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xóa tổ chức' }, { status: 500 })
  }
}
