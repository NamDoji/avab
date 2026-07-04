import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import NotificationList, { type NotifItem } from '@/components/admin/notifications/NotificationList'

export const metadata = { title: 'Notification Center — AvaB' }

export default async function NotificationsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const [pendingEnrollments, newContacts, overdueCount] = await Promise.all([
    prisma.enrollment.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { name: true, phone: true } },
        course: { select: { name: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.registration.findMany({
      where: { status: 'NEW' },
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tuitionPayment.count({
      where: {
        isPaid: false,
        isFree: false,
        createdAt: { lt: new Date(Date.now() - 30 * 86400000) },
      },
    }),
  ])

  // Build unified notification items
  const notifications: NotifItem[] = [
    ...pendingEnrollments.map((e) => ({
      id: `enrollment-${e.id}`,
      type: 'enrollment' as const,
      icon: '🎓',
      message: `Đăng ký mới: ${e.user.name ?? e.user.phone} — ${e.course.name}`,
      link: '/admin/enrollments',
      timeMs: e.createdAt.getTime(),
      badge: 'Chờ duyệt',
      badgeColor: '#f97316',
    })),
    ...newContacts.map((c) => ({
      id: `contact-${c.id}`,
      type: 'contact' as const,
      icon: '📞',
      message: `Liên hệ mới: ${c.name ?? 'Khách'} — ${c.phone}`,
      link: '/admin/contacts',
      timeMs: c.createdAt.getTime(),
      badge: 'Liên hệ',
      badgeColor: '#0284c7',
    })),
  ].sort((a, b) => b.timeMs - a.timeMs)

  const totalCount = notifications.length + (overdueCount > 0 ? 1 : 0)

  return (
    <main className="min-h-screen bg-gray-50 pt-14">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-indigo-300 text-sm mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <span className="text-white">Notifications</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">🔔 Notification Center</h1>
              <p className="text-indigo-200 text-sm mt-0.5">
                {totalCount > 0 ? (
                  <span className="font-bold text-white">{totalCount} thông báo</span>
                ) : (
                  'Không có thông báo mới'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Client notification list with filter + mark-as-read */}
        <NotificationList
          notifications={notifications}
          overdueCount={overdueCount}
        />

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/admin/enrollments"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
          >
            🎓 Duyệt đăng ký
            {pendingEnrollments.length > 0 && (
              <span className="bg-white/30 text-white text-xs font-black px-1.5 py-0.5 rounded-full ml-1">
                {pendingEnrollments.length}
              </span>
            )}
          </Link>
          <Link
            href="/admin/contacts"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
          >
            📞 Xem liên hệ
            {newContacts.length > 0 && (
              <span className="bg-white/30 text-white text-xs font-black px-1.5 py-0.5 rounded-full ml-1">
                {newContacts.length}
              </span>
            )}
          </Link>
          <Link
            href="/admin/finance"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            💰 Finance
            {overdueCount > 0 && (
              <span className="bg-white/30 text-white text-xs font-black px-1.5 py-0.5 rounded-full ml-1">
                {overdueCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </main>
  )
}
