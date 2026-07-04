import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CURRENT_ORG_COOKIE } from '@/lib/current-org'

/**
 * POST /api/auth/switch-org
 * Body: { organizationId: string }
 *
 * Verifies the authenticated user belongs to the requested org,
 * then sets the avab-current-org cookie to scope subsequent requests.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  const userId = (session.user as { id?: string })?.id ?? ''
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Không xác định được người dùng' }, { status: 401 })
  }

  const body = await req.json() as { organizationId?: string }
  const { organizationId } = body

  if (!organizationId?.trim()) {
    return NextResponse.json({ success: false, error: 'organizationId là bắt buộc' }, { status: 400 })
  }

  // Security: verify the user actually belongs to this org
  const orgUser = await prisma.organizationUser.findFirst({
    where: { userId, organizationId },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, isActive: true, deletedAt: true },
      },
    },
  })

  if (!orgUser) {
    return NextResponse.json(
      { success: false, error: 'Bạn không có quyền truy cập tổ chức này' },
      { status: 403 },
    )
  }

  const org = orgUser.organization
  if (!org.isActive || org.deletedAt) {
    return NextResponse.json(
      { success: false, error: 'Tổ chức này không còn hoạt động' },
      { status: 403 },
    )
  }

  // Set the cookie
  const response = NextResponse.json({
    success: true,
    org: { id: org.id, name: org.name, slug: org.slug },
  })

  response.cookies.set(CURRENT_ORG_COOKIE, org.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Session cookie — expires when browser is closed
    // To make persistent: maxAge: 60 * 60 * 24 * 30  (30 days)
  })

  return response
}
