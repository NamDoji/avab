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

export async function GET() {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  // Get org context:
  // - Super admin (orgCtx = null) → see ALL organizations
  // - Org admin (orgCtx = non-null) → see only their own organization
  const orgCtx = await getOrganizationContext(check.userId)

  try {
    const whereClause = orgCtx
      ? { id: orgCtx.id, deletedAt: null }
      : { deletedAt: null }

    const orgs = await prisma.organization.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            campuses: { where: { isActive: true } },
            organizationUsers: true,
            courses: true,
          },
        },
      },
    })
    return NextResponse.json({ success: true, data: orgs })
  } catch (error) {
    console.error('GET /api/admin/organizations error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách tổ chức' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  // Only super admin (orgCtx = null) can create new organizations
  const orgCtx = await getOrganizationContext(check.userId)
  if (orgCtx !== null) {
    return NextResponse.json(
      { success: false, error: 'Chỉ platform super admin mới có thể tạo tổ chức mới' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { name, slug, type, modules, settings } = body

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Tên và slug là bắt buộc' }, { status: 400 })
    }

    const validTypes = ['SCHOOL', 'CENTER', 'CHAIN']
    const finalType = type && validTypes.includes(type) ? type : 'CENTER'

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        type: finalType,
        modules: modules ?? [],
        settings: settings ?? {},
      },
    })

    return NextResponse.json({ success: true, data: org }, { status: 201 })
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Slug đã tồn tại' }, { status: 409 })
    }
    console.error('POST /api/admin/organizations error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo tổ chức' }, { status: 500 })
  }
}
