import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/platform/stats
 *
 * Public endpoint — no authentication required.
 * Returns real-time platform-level counts for the landing page.
 * Cached at CDN / Next.js Data Cache for 1 hour.
 */
export const revalidate = 3600

export async function GET() {
  const [orgs, students, courses] = await Promise.all([
    prisma.organization.count({ where: { isActive: true, deletedAt: null } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.course.count({ where: { isActive: true, approvalStatus: 'published' } }),
  ])

  return NextResponse.json(
    { orgs, students, courses },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
      },
    },
  )
}
