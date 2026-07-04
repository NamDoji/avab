import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — list slots for a version
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const versionId = searchParams.get('versionId')
    const campusId = searchParams.get('campusId')

    if (!versionId && !campusId) {
      return NextResponse.json({ error: 'versionId hoặc campusId là bắt buộc' }, { status: 400 })
    }

    const where: Record<string, unknown> = {}
    if (versionId) where.versionId = versionId
    if (campusId) where.campusId = campusId

    const slots = await prisma.timetableSlot.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    })

    // Enrich with course info
    const courseIds = [...new Set(slots.map((s) => s.courseId))]
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, code: true, name: true, subjectName: true },
    })
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]))

    // Enrich with teacher info
    const teacherIds = [...new Set(slots.map((s) => s.teacherId).filter(Boolean))] as string[]
    const teachers =
      teacherIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: teacherIds } },
            select: { id: true, name: true },
          })
        : []
    const teacherMap = Object.fromEntries(teachers.map((t) => [t.id, t]))

    // Enrich with room info
    const roomIds = [...new Set(slots.map((s) => s.roomId).filter(Boolean))] as string[]
    const rooms =
      roomIds.length > 0
        ? await prisma.classRoom.findMany({
            where: { id: { in: roomIds } },
            select: { id: true, name: true },
          })
        : []
    const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]))

    const enriched = slots.map((s) => ({
      ...s,
      course: courseMap[s.courseId] ?? null,
      teacher: s.teacherId ? (teacherMap[s.teacherId] ?? null) : null,
      room: s.roomId ? (roomMap[s.roomId] ?? null) : null,
    }))

    return NextResponse.json({ slots: enriched })
  } catch (err) {
    console.error('[timetable/slots GET] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH — update a slot (manual edit or lock)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const slotId = searchParams.get('slotId')

    if (!slotId) {
      return NextResponse.json({ error: 'slotId là bắt buộc' }, { status: 400 })
    }

    const body = await req.json()
    const allowedFields = ['teacherId', 'roomId', 'dayOfWeek', 'period', 'isLocked', 'status']
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field]
    }

    const updated = await prisma.timetableSlot.update({
      where: { id: slotId },
      data: updateData,
    })

    return NextResponse.json({ slot: updated })
  } catch (err) {
    console.error('[timetable/slots PATCH] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
