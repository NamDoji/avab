import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/admin/workflow/instances/[id] — instance detail + history
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params

    const instance = await prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            module: true,
            steps: true,
            description: true,
          },
        },
        history: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!instance) {
      return NextResponse.json({ success: false, error: 'Instance không tồn tại' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: instance })
  } catch (error) {
    console.error('GET /api/admin/workflow/instances/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải instance' }, { status: 500 })
  }
}
