/**
 * GET /api/v1/courses
 * Returns paginated active courses for the organisation associated with the API key.
 *
 * Required permission: courses.read
 *
 * Query params:
 *   page   — page number (1-indexed, default 1)
 *   limit  — items per page (default 20, max 100)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, requirePermission } from '../middleware'

export async function GET(req: NextRequest) {
  // 1. Auth
  const auth = await validateApiKey(req)
  if (!auth.ok) return auth.response

  // 2. Permission
  const permErr = requirePermission(auth, 'courses.read')
  if (permErr) return permErr

  // 3. Pagination
  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const skip  = (page - 1) * limit

  // 4. Query
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: {
        organizationId: auth.orgId,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        thumbnail: true,
        price: true,
        subjectCode: true,
        subjectName: true,
        grade: true,
        gradeMin: true,
        gradeMax: true,
        paymentType: true,
        isPublic: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.course.count({
      where: { organizationId: auth.orgId, isActive: true },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
