import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Action = 'suspend' | 'activate' | 'delete'

interface RequestBody {
  action: Action
}

/**
 * PATCH /api/admin/platform/organizations/[id]
 * Body: { action: 'suspend' | 'activate' | 'delete' }
 *
 * Super-admin only. Sets org.isActive or soft-deletes it, and records
 * an AuditLog entry.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role
  const userId   = (session?.user as { id?: string })?.id ?? ''

  if (!session || userRole !== 'ADMIN' || !userId) {
    return NextResponse.json(
      { success: false, error: 'Không có quyền truy cập' },
      { status: 403 },
    )
  }

  const { id } = await params

  const body = await req.json() as RequestBody
  const { action } = body

  if (!['suspend', 'activate', 'delete'].includes(action)) {
    return NextResponse.json(
      { success: false, error: 'action không hợp lệ. Dùng: suspend | activate | delete' },
      { status: 400 },
    )
  }

  // Fetch org first for audit log
  const org = await prisma.organization.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, name: true, slug: true, isActive: true },
  })

  if (!org) {
    return NextResponse.json(
      { success: false, error: 'Tổ chức không tồn tại hoặc đã bị xóa' },
      { status: 404 },
    )
  }

  // Apply mutation
  let updateData: { isActive?: boolean; deletedAt?: Date } = {}
  let auditAction: string
  let auditSummary: string

  switch (action) {
    case 'suspend':
      updateData = { isActive: false }
      auditAction = 'org_suspended'
      auditSummary = `Tổ chức "${org.name}" (${org.slug}) đã bị tạm ngưng bởi super admin`
      break

    case 'activate':
      updateData = { isActive: true }
      auditAction = 'org_activated'
      auditSummary = `Tổ chức "${org.name}" (${org.slug}) đã được kích hoạt lại bởi super admin`
      break

    case 'delete':
      updateData = { isActive: false, deletedAt: new Date() }
      auditAction = 'org_deleted'
      auditSummary = `Tổ chức "${org.name}" (${org.slug}) đã bị xóa bởi super admin`
      break
  }

  await prisma.$transaction([
    prisma.organization.update({
      where: { id },
      data: updateData,
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: auditAction,
        entityType: 'organization',
        entityId: id,
        summary: auditSummary,
        before: { isActive: org.isActive },
        after: updateData,
      },
    }),
  ])

  return NextResponse.json({ success: true, action, orgId: id })
}
