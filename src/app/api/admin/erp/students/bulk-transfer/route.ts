import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { studentIds, targetCourseId, note } = await req.json()
  if (!studentIds?.length || !targetCourseId) {
    return NextResponse.json({ error: 'Missing studentIds or targetCourseId' }, { status: 400 })
  }

  // Verify target course exists
  const targetCourse = await prisma.course.findUnique({ where: { id: targetCourseId } })
  if (!targetCourse) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const results = await Promise.allSettled(
    studentIds.map(async (userId: string) => {
      // Deactivate current enrollments for these users in same org
      await prisma.enrollment.updateMany({
        where: { userId, status: 'ACTIVE', organizationId: targetCourse.organizationId ?? undefined },
        data: { status: 'REMOVED', note: `Chuyển sang ${targetCourse.name}` },
      })
      // Create new enrollment
      return prisma.enrollment.create({
        data: {
          userId,
          courseId: targetCourseId,
          organizationId: targetCourse.organizationId,
          campusId: targetCourse.campusId,
          status: 'ACTIVE',
          note: note ?? 'Chuyển lớp hàng loạt',
        },
      })
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed    = results.filter(r => r.status === 'rejected').length
  return NextResponse.json({ succeeded, failed })
}
