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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('q') ?? ''

    const orgUsers = await prisma.organizationUser.findMany({
      where: {
        organizationId: id,
        ...(search
          ? {
              user: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { phone: { contains: search } },
                ],
              },
            }
          : {}),
      },
      orderBy: { joinedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            avatar: true,
            campusUsers: {
              include: { campus: { select: { id: true, name: true, code: true } } },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: orgUsers })
  } catch (error) {
    console.error('GET /api/admin/organizations/[id]/users error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách người dùng' }, { status: 500 })
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
    const { userId, orgRole } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId là bắt buộc' }, { status: 400 })
    }

    const validRoles = ['OWNER', 'ADMIN', 'MEMBER']
    const finalRole = orgRole && validRoles.includes(orgRole) ? orgRole : 'MEMBER'

    const orgUser = await prisma.organizationUser.upsert({
      where: { organizationId_userId: { organizationId: id, userId } },
      create: { organizationId: id, userId, orgRole: finalRole },
      update: { orgRole: finalRole },
      include: { user: { select: { id: true, name: true, phone: true, role: true } } },
    })

    return NextResponse.json({ success: true, data: orgUser }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/organizations/[id]/users error:', error)
    return NextResponse.json({ success: false, error: 'Không thể thêm người dùng vào tổ chức' }, { status: 500 })
  }
}

export async function DELETE(
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId là bắt buộc' }, { status: 400 })
    }

    await prisma.organizationUser.delete({
      where: { organizationId_userId: { organizationId: id, userId } },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Người dùng không thuộc tổ chức này' }, { status: 404 })
    }
    console.error('DELETE /api/admin/organizations/[id]/users error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xóa người dùng khỏi tổ chức' }, { status: 500 })
  }
}
