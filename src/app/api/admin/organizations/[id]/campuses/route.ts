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
    const campuses = await prisma.campus.findMany({
      where: { organizationId: id },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { campusUsers: true } },
      },
    })

    return NextResponse.json({ success: true, data: campuses })
  } catch (error) {
    console.error('GET /api/admin/organizations/[id]/campuses error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách cơ sở' }, { status: 500 })
  }
}

export async function POST(
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
    const { name, code, address, phone, email } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Tên cơ sở là bắt buộc' }, { status: 400 })
    }

    // Verify org exists
    const org = await prisma.organization.findFirst({ where: { id, deletedAt: null } })
    if (!org) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tổ chức' }, { status: 404 })
    }

    const campus = await prisma.campus.create({
      data: {
        organizationId: id,
        name,
        code: code ?? null,
        address: address ?? null,
        phone: phone ?? null,
        email: email ?? null,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, data: campus }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/organizations/[id]/campuses error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo cơ sở' }, { status: 500 })
  }
}
