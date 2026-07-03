import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─── GET — single project + all steps ────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    const { id } = await params

    const project = await prisma.aIProject.findFirst({
      where: { id, createdBy: userId! },
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
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    const { id } = await params
    const body   = await req.json()

    // Verify ownership
    const existing = await prisma.aIProject.findFirst({ where: { id, createdBy: userId! } })
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
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    const { id } = await params

    const existing = await prisma.aIProject.findFirst({ where: { id, createdBy: userId! } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.aIProject.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[AI Studio] DELETE project error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
