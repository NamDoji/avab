import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  const role = (session.user as { role?: string }).role ?? ''
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role))
    return { error: 'Không có quyền', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return { session, userId, orgCtx }
}

export async function GET(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const status   = searchParams.get('status') as any

  // Org-scope: filter via course.organizationId; null orgCtx = super-admin (no filter)
  const whereOrg = check.orgCtx
    ? { course: { organizationId: check.orgCtx.id } }
    : {}

  const enrollments = await prisma.enrollment.findMany({
    where: {
      ...whereOrg,
      ...(courseId ? { courseId } : {}),
      ...(status   ? { status }   : {}),
    },
    include: {
      user:   { select: { id: true, name: true, phone: true, email: true } },
      course: { select: { id: true, name: true, code: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: enrollments })
}

export async function PATCH(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { enrollmentId, status } = await req.json()

  // Validate org ownership before mutating
  if (check.orgCtx) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { select: { organizationId: true } } },
    })
    if (!enrollment || enrollment.course.organizationId !== check.orgCtx.id) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy enrollment' }, { status: 404 })
    }
  }

  const updated = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status },
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function POST(req: NextRequest) {
  // Manually add user to course by phone
  const check = await requireAdmin(req)
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { phone, courseId } = await req.json()

  // Validate org ownership of the target course
  if (check.orgCtx) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { organizationId: true },
    })
    if (!course || course.organizationId !== check.orgCtx.id) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy khoá học trong tổ chức của bạn.' }, { status: 404 })
    }
  }

  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy tài khoản với SĐT này.' }, { status: 404 })
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { status: 'APPROVED' },
    create: { userId: user.id, courseId, status: 'APPROVED' },
  })

  return NextResponse.json({ success: true, data: enrollment })
}

export async function DELETE(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { enrollmentId } = await req.json()

  // Validate org ownership before deletion
  if (check.orgCtx) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { select: { organizationId: true } } },
    })
    if (!enrollment || enrollment.course.organizationId !== check.orgCtx.id) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy enrollment' }, { status: 404 })
    }
  }

  await prisma.enrollment.delete({ where: { id: enrollmentId } })
  return NextResponse.json({ success: true })
}
