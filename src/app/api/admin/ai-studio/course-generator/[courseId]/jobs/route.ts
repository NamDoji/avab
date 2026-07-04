import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ courseId: string }> }

// ─── GET — list jobs for a course ─────────────────────────────────────────────

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params

    const jobs = await prisma.jobQueue.findMany({
      where:   { courseId },
      orderBy: { createdAt: 'desc' },
      take:    50,
    })

    return NextResponse.json({ success: true, jobs })
  } catch (err) {
    console.error('[Jobs] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST — create a new job ──────────────────────────────────────────────────

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params
    const body = await req.json() as { jobType: string; subjectId?: string }
    const { jobType, subjectId } = body

    if (!jobType) {
      return NextResponse.json({ error: 'jobType is required' }, { status: 400 })
    }

    const job = await prisma.jobQueue.create({
      data: {
        courseId,
        subjectId: subjectId ?? null,
        jobType,
        status:    'running',
        progress:  0,
        total:     0,
        done:      0,
        createdBy: session.user?.email ?? null,
        startedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, job })
  } catch (err) {
    console.error('[Jobs] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PATCH — update job status / progress ────────────────────────────────────

export async function PATCH(req: NextRequest, _context: RouteContext) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      jobId:    string
      status?:  string
      done?:    number
      total?:   number
      error?:   string
      progress?: number
    }
    const { jobId, status, done, total, error, progress } = body

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const isTerminal = status === 'completed' || status === 'failed'

    const job = await prisma.jobQueue.update({
      where: { id: jobId },
      data: {
        ...(status   !== undefined ? { status }   : {}),
        ...(done     !== undefined ? { done }     : {}),
        ...(total    !== undefined ? { total }    : {}),
        ...(error    !== undefined ? { error }    : {}),
        ...(progress !== undefined ? { progress } : {}),
        ...(isTerminal ? { completedAt: new Date() } : {}),
      },
    })

    return NextResponse.json({ success: true, job })
  } catch (err) {
    console.error('[Jobs] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
