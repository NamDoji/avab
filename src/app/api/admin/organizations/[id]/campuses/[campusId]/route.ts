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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campusId: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { campusId } = await params
    const body = await request.json()
    const { name, code, address, phone, email, isActive } = body

    const campus = await prisma.campus.update({
      where: { id: campusId },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ success: true, data: campus })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Không tìm thấy cơ sở' }, { status: 404 })
    }
    console.error('PUT /api/admin/organizations/[id]/campuses/[campusId] error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật cơ sở' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; campusId: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { campusId } = await params
    const campus = await prisma.campus.update({
      where: { id: campusId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, data: campus })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Không tìm thấy cơ sở' }, { status: 404 })
    }
    console.error('DELETE /api/admin/organizations/[id]/campuses/[campusId] error:', error)
    return NextResponse.json({ success: false, error: 'Không thể vô hiệu hóa cơ sở' }, { status: 500 })
  }
}
