import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

export interface NotificationItem {
  type: 'enrollment' | 'contact' | 'payment'
  message: string
  time: string  // ISO string
  link: string
}

/**
 * GET /api/admin/notifications/count
 * Returns total count of actionable items + 5 most recent notifications.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id ?? ''
    const cookieOrgId = getCurrentOrgFromRequest(req)
    const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)

    // Org-scoped where clauses
    const whereEnrollOrg = orgCtx ? { course: { organizationId: orgCtx.id } } : {}
    const whereContactOrg = orgCtx ? { organizationId: orgCtx.id } : {}
    const wherePaymentOrg = orgCtx ? { enrollment: { course: { organizationId: orgCtx.id } } } : {}

    const overdueThreshold = new Date(Date.now() - 30 * 86_400_000) // 30 days ago

    const [pendingEnrollments, newContacts, overduePayments] = await Promise.all([
      prisma.enrollment.findMany({
        where: { ...whereEnrollOrg, status: 'PENDING' },
        include: {
          user: { select: { name: true } },
          course: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.registration.findMany({
        where: { ...whereContactOrg, status: 'NEW' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.tuitionPayment.findMany({
        where: { ...wherePaymentOrg, isPaid: false, isFree: false, createdAt: { lt: overdueThreshold } },
        include: { enrollment: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ])

    const overdueCount = await prisma.tuitionPayment.count({
      where: { ...wherePaymentOrg, isPaid: false, isFree: false, createdAt: { lt: overdueThreshold } },
    })

    const count =
      pendingEnrollments.length +
      newContacts.length +
      Math.min(overdueCount, 99)

    // Build recent list (up to 5 items, most urgent first)
    const recent: NotificationItem[] = [
      ...pendingEnrollments.map<NotificationItem>((e) => ({
        type: 'enrollment',
        message: `${e.user?.name ?? 'Học viên'} đăng ký "${e.course?.name ?? 'khoá học'}"`,
        time: e.createdAt.toISOString(),
        link: '/admin/enrollments',
      })),
      ...newContacts.map<NotificationItem>((c) => ({
        type: 'contact',
        message: `Liên hệ mới: ${(c as { name?: string }).name ?? 'Khách hàng'}`,
        time: c.createdAt.toISOString(),
        link: '/admin/contacts',
      })),
      ...overduePayments.map<NotificationItem>((p) => ({
        type: 'payment',
        message: `Học phí quá hạn: ${p.enrollment?.user?.name ?? 'Học viên'}`,
        time: p.createdAt.toISOString(),
        link: '/admin/finance',
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)

    return NextResponse.json({ count, recent })
  } catch (err) {
    console.error('[admin/notifications/count] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
