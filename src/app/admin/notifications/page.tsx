import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import NotificationReadAllButton from '@/components/admin/notifications/NotificationReadAllButton'

export const metadata = { title: 'Notification Center — AvaB' }

type NotificationItem = {
  id: string
  type: 'enrollment' | 'contact'
  icon: string
  message: string
  link: string
  time: Date
  badge: string
  badgeColor: string
}

const relativeTime = (date: Date): string => {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

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

  const notifications: NotificationItem[] = [
    ...pendingEnrollments.map((e) => ({
      id: `enrollment-${e.id}`,
      type: 'enrollment' as const,
      icon: '🎓',
      message: `Đăng ký mới: ${e.user.name ?? e.user.phone} — ${e.course.name}`,
      link: '/admin/enrollments',
      time: e.createdAt,
      badge: 'Chờ duyệt',
      badgeColor: '#f97316',
    })),
    ...newContacts.map((c) => ({
      id: `contact-${c.id}`,
      type: 'contact' as const,
      icon: '📞',
      message: `Liên hệ mới: ${c.name ?? 'Khách'} — ${c.phone}`,
      link: '/admin/contacts',
      time: c.createdAt,
      badge: 'Liên hệ',
      badgeColor: '#0284c7',
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime())

  const totalUnread = notifications.length + (overdueCount > 0 ? 1 : 0)

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">🔔 Notification Center</h1>
              <p className="text-indigo-200 text-sm mt-0.5">
                {totalUnread > 0 ? (
                  <span className="font-bold text-white">{totalUnread} thông báo chưa đọc</span>
                ) : (
                  'Không có thông báo mới'
                )}
              </p>
            </div>
            <NotificationReadAllButton />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Overdue payments alert */}
        {overdueCount > 0 && (
          <Link
            href="/admin/finance"
            className="flex items-center gap-4 p-4 rounded-2xl text-white hover:opacity-90 transition shadow-md"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
          >
            <span className="text-3xl flex-shrink-0">💰</span>
            <div className="flex-1">
              <p className="font-bold">
                {overdueCount} học phí quá hạn chưa thu (&gt; 30 ngày)
              </p>
              <p className="text-sm text-red-200 mt-0.5">
                Xem Finance Dashboard để xử lý
              </p>
            </div>
            <span className="text-white/70">→</span>
          </Link>
        )}

        {/* Notification Feed */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900 text-lg">📬 Thông báo</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {notifications.length} thông báo mới nhất
              </p>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-bold text-gray-700">Tất cả đã được xử lý!</p>
              <p className="text-sm text-gray-500 mt-1">
                Không có đăng ký hay liên hệ nào đang chờ
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif, idx) => (
                <div
                  key={notif.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition"
                >
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ background: 'rgba(79,70,229,0.08)' }}
                    >
                      {notif.icon}
                    </div>
                    {idx < notifications.length - 1 && (
                      <div
                        className="absolute left-1/2 top-10 w-0.5 h-4 -translate-x-1/2 bg-gray-100"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: notif.badgeColor }}
                      >
                        {notif.badge}
                      </span>
                      <span className="text-xs text-gray-400">{relativeTime(notif.time)}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <Link
                    href={notif.link}
                    className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                  >
                    Xem
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
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
          </Link>
        </div>
      </div>
    </main>
  )
}
