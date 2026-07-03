import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ courseId: string }> }

type ApprovalStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived'

const VALID_STATUSES: ApprovalStatus[] = ['draft', 'review', 'approved', 'published', 'archived']

// ─── PATCH — update approval status ──────────────────────────────────────────

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params
    const body = await req.json() as { approvalStatus: ApprovalStatus }
    const { approvalStatus } = body

    if (!VALID_STATUSES.includes(approvalStatus)) {
      return NextResponse.json(
        { error: `Invalid approvalStatus. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data:  { approvalStatus },
    })

    return NextResponse.json({ success: true, approvalStatus: course.approvalStatus })
  } catch (err) {
    console.error('[Approval] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
