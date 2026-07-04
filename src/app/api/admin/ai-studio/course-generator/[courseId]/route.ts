import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ courseId: string }> }

// ─── GET — fetch course details with subjects & lesson outlines ───────────────

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params

    const course = await prisma.course.findUnique({
      where:   { id: courseId },
      include: {
        subjects: {
          orderBy: { order: 'asc' },
          include: {
            materials: {
              where:   { type: 'lesson-outline' },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, course })
  } catch (err) {
    console.error('[Course Generator] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PATCH — publish / unpublish course ──────────────────────────────────────

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId }                   = await context.params
    const { action } = await req.json() as { action: 'publish' | 'unpublish' | 'make-public' | 'make-private' }

    if (!['publish','unpublish','make-public','make-private'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data:  action === 'publish' || action === 'unpublish'
        ? { isActive: action === 'publish' }
        : { isPublic: action === 'make-public' },
    })

    return NextResponse.json({ success: true, isActive: course.isActive, isPublic: course.isPublic })
  } catch (err) {
    console.error('[Course Generator] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
