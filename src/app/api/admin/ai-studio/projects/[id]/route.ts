import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'

// ─── GET — single project + all steps ────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 })

    const orgCtx = await getOrganizationContext(userId)
    const { id } = await params

    // Verify org ownership: org admin can only access their org's projects
    const whereOrg = orgCtx ? { organizationId: orgCtx.id } : {}

    const project = await prisma.aIProject.findFirst({
      where: { id, ...whereOrg },
      include: { steps: { orderBy: { stepNum: 'asc' } } },
    })

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, project })
  } catch (err) {
    console.error('[AI Studio] GET project error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PUT — update project ─────────────────────────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 })

    const orgCtx = await getOrganizationContext(userId)
    const { id } = await params
    const body   = await req.json()

    // Verify org ownership before update
    const whereOrg = orgCtx ? { organizationId: orgCtx.id } : {}
    const existing = await prisma.aIProject.findFirst({ where: { id, ...whereOrg } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const allowed = ['title', 'curriculum', 'grade', 'subject', 'subjectName', 'chapter', 'topic', 'objective', 'difficulty', 'status']
    const data: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key]
    }

    const project = await prisma.aIProject.update({
      where: { id },
      data,
      include: { steps: { orderBy: { stepNum: 'asc' } } },
    })

    return NextResponse.json({ success: true, project })
  } catch (err) {
    console.error('[AI Studio] PUT project error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── DELETE — delete project ──────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 })

    const orgCtx = await getOrganizationContext(userId)
    const { id } = await params

    // Verify org ownership before delete
    const whereOrg = orgCtx ? { organizationId: orgCtx.id } : {}
    const existing = await prisma.aIProject.findFirst({ where: { id, ...whereOrg } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.aIProject.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[AI Studio] DELETE project error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
