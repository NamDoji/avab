/**
 * GET /api/v1/students
 * Returns student count and basic info for the organisation.
 * PII (email, phone) is only returned when `students.write` permission is present.
 *
 * Required permission: students.read
 *
 * Query params:
 *   page, limit — pagination (default 20, max 100)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, requirePermission } from '../middleware'

export async function GET(req: NextRequest) {
  // 1. Auth
  const auth = await validateApiKey(req)
  if (!auth.ok) return auth.response

  // 2. Permission
  const permErr = requirePermission(auth, 'students.read')
  if (permErr) return permErr

  const hasPII = auth.permissions.includes('students.write')

  // 3. Pagination
  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const skip  = (page - 1) * limit

  // 4. Query — only students that have enrollments in this org's courses
  const orgCourseIds = await prisma.course.findMany({
    where: { organizationId: auth.orgId },
    select: { id: true },
  }).then((r) => r.map((c) => c.id))

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'STUDENT',
        enrollments: {
          some: { courseId: { in: orgCourseIds } },
        },
      },
      select: {
        id: true,
        name: true,
        // PII only with elevated permission
        ...(hasPII ? { phone: true, email: true } : {}),
        createdAt: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({
      where: {
        role: 'STUDENT',
        enrollments: {
          some: { courseId: { in: orgCourseIds } },
        },
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    meta: {
      piiIncluded: hasPII,
    },
  })
}
