import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'
import { checkModuleAccess } from '@/lib/module-gate'

// ─── GET — list projects scoped to org ────────────────────────────────────

export async function GET(req: NextRequest) {

  // ── Module gate: org phải có module 'ai' ─────────────────────────────
  const gate = await checkModuleAccess(req, 'ai')
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 })

    // Get org context — scope all queries to current org
    const orgCtx = await getOrganizationContext(userId)
    // orgCtx = null → platform super admin (no filter, see all projects)
    const whereOrg = orgCtx ? { organizationId: orgCtx.id } : {}

    const { searchParams } = new URL(req.url)
    const status  = searchParams.get('status') ?? undefined
    const grade   = searchParams.get('grade') ?? undefined
    const subject = searchParams.get('subject') ?? undefined
    const q       = searchParams.get('q') ?? undefined

    const projects = await prisma.aIProject.findMany({
      where: {
        ...whereOrg,
        ...(status  ? { status }  : {}),
        ...(grade   ? { grade }   : {}),
        ...(subject ? { subject } : {}),
        ...(q       ? { OR: [
          { title:   { contains: q, mode: 'insensitive' } },
          { topic:   { contains: q, mode: 'insensitive' } },
          { chapter: { contains: q, mode: 'insensitive' } },
        ]} : {}),
      },
      include: {
        steps: { orderBy: { stepNum: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ success: true, projects })
  } catch (err) {
    console.error('[AI Studio] GET projects error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST — create new project with org context ───────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 })

    // Get org context to tag the project
    const orgCtx = await getOrganizationContext(userId)

    const body = await req.json()
    const { title, curriculum, grade, subject, subjectName, chapter, topic, objective, difficulty } = body

    if (!title?.trim() || !grade || !subject || !topic?.trim()) {
      return NextResponse.json({ error: 'Missing required fields: title, grade, subject, topic' }, { status: 400 })
    }

    const project = await prisma.aIProject.create({
      data: {
        title:          title.trim(),
        curriculum:     curriculum  ?? 'K12-VN',
        grade,
        subject,
        subjectName:    subjectName ?? null,
        chapter:        chapter?.trim()   ?? null,
        topic:          topic.trim(),
        objective:      objective?.trim() ?? null,
        difficulty:     difficulty ?? 'medium',
        status:         'draft',
        createdBy:      userId,
        organizationId: orgCtx?.id ?? null,
        // Create step 1 (Setup) as already done
        steps: {
          create: {
            stepNum:  1,
            stepType: 'setup',
            status:   'done',
            content:  `Project: ${title}\nGrade: ${grade}\nSubject: ${subjectName ?? subject}\nTopic: ${topic}`,
            doneAt:   new Date(),
          },
        },
      },
      include: { steps: true },
    })

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (err) {
    console.error('[AI Studio] POST project error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
