import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CURRENT_ORG_COOKIE } from '@/lib/current-org'

/**
 * POST /api/admin/platform/switch-org
 * Body: { organizationId } — or as form-data from the platform page.
 *
 * Super-admin only: sets the avab-current-org cookie to any org
 * without requiring them to be a member of that org.
 *
 * Guard: caller must have role=ADMIN and no current org context
 * (i.e. they arrived from the platform super-admin panel).
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role
  const userId   = (session?.user as { id?: string })?.id ?? ''

  if (!session || userRole !== 'ADMIN' || !userId) {
    return NextResponse.json(
      { success: false, error: 'Không có quyền truy cập' },
      { status: 403 },
    )
  }

  // Verify this is a super-admin call — no org context set yet
  const currentOrgCtx = req.cookies.get(CURRENT_ORG_COOKIE)?.value ?? null
  if (currentOrgCtx) {
    return NextResponse.json(
      { success: false, error: 'Bạn đã đăng nhập vào một tổ chức. Thoát org hiện tại trước.' },
      { status: 400 },
    )
  }

  // Support both JSON body and form-data (from the <form> submit)
  let organizationId: string | undefined
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await req.json() as { organizationId?: string }
    organizationId = body.organizationId
  } else {
    // form-data or application/x-www-form-urlencoded
    const formData = await req.formData()
    organizationId = formData.get('organizationId') as string | undefined
  }

  if (!organizationId?.trim()) {
    return NextResponse.json(
      { success: false, error: 'organizationId là bắt buộc' },
      { status: 400 },
    )
  }

  // Verify the org exists and is active
  const org = await prisma.organization.findFirst({
    where: { id: organizationId, deletedAt: null },
    select: { id: true, name: true, slug: true, isActive: true },
  })

  if (!org) {
    return NextResponse.json(
      { success: false, error: 'Tổ chức không tồn tại' },
      { status: 404 },
    )
  }

  if (!org.isActive) {
    return NextResponse.json(
      { success: false, error: 'Tổ chức đang bị tạm ngưng' },
      { status: 403 },
    )
  }

  // Audit log: super-admin entered org
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'super_admin_switch_org',
      entityType: 'organization',
      entityId: org.id,
      summary: `Super admin entered org: ${org.name} (${org.slug})`,
    },
  })

  // Set the cookie and redirect to /admin
  const redirectResponse = NextResponse.redirect(new URL('/admin', req.url))
  redirectResponse.cookies.set(CURRENT_ORG_COOKIE, org.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return redirectResponse
}
