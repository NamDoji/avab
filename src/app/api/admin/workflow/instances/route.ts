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

// GET /api/admin/workflow/instances — list instances (scoped to org)
// Query: ?status=running|completed|rejected  ?assignedTo=me
export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  // Get org context — filter workflow instances by org
  const orgCtx = await getOrganizationContext(check.userId)
  // orgCtx = null → super admin sees all instances
  const whereOrg = orgCtx ? { organizationId: orgCtx.id } : {}

  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const assignedToParam = searchParams.get('assignedTo')

    const where: Record<string, unknown> = { ...whereOrg }
    if (statusParam) where.status = statusParam
    if (assignedToParam === 'me') where.assignedTo = check.userId

    const instances = await prisma.workflowInstance.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            module: true,
            steps: true,
          },
        },
        _count: { select: { history: true } },
      },
    })

    return NextResponse.json({ success: true, data: instances })
  } catch (error) {
    console.error('GET /api/admin/workflow/instances error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải instances' }, { status: 500 })
  }
}
