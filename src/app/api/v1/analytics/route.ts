/**
 * GET /api/v1/analytics
 * Returns summary analytics for the organisation.
 *
 * Required permission: analytics.read
 *
 * Response:
 *   { students, courses, enrollments, revenue, activeEnrollments }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, requirePermission } from '../middleware'

export async function GET(req: NextRequest) {
  // 1. Auth
  const auth = await validateApiKey(req)
  if (!auth.ok) return auth.response

  // 2. Permission
  const permErr = requirePermission(auth, 'analytics.read')
  if (permErr) return permErr

  // 3. Fetch org course IDs for scoped queries
  const orgCourseIds = await prisma.course.findMany({
    where: { organizationId: auth.orgId },
    select: { id: true },
  }).then((r) => r.map((c) => c.id))

  const [
    courses,
    enrollments,
    activeEnrollments,
    revenue,
    students,
  ] = await Promise.all([
    prisma.course.count({ where: { organizationId: auth.orgId, isActive: true } }),
    prisma.enrollment.count({ where: { courseId: { in: orgCourseIds } } }),
    prisma.enrollment.count({ where: { courseId: { in: orgCourseIds }, status: 'ACTIVE' } }),
    prisma.tuitionPayment
      .aggregate({
        _sum: { amount: true },
        where: { isPaid: true, enrollment: { course: { organizationId: auth.orgId } } },
      })
      .then((r) => r._sum.amount ?? 0)
      .catch(() => 0),
    prisma.user.count({
      where: {
        role: 'STUDENT',
        enrollments: { some: { courseId: { in: orgCourseIds } } },
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      students,
      courses,
      enrollments,
      activeEnrollments,
      revenue,
    },
    generatedAt: new Date().toISOString(),
  })
}
