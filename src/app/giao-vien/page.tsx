import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TeacherDashboard() {
  const session = await auth()
  if (!session) redirect('/dang-nhap')
  const userId = (session.user as { id: string }).id
  const userRole = (session.user as { role?: string }).role

  const now = new Date()
  // Week start (Monday)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)
  // Month start
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Load tất cả sessions (với records) để tính stats + recent 5
  const [allSessions, sessionsThisWeek, sessionsThisMonth] = await Promise.all([
    prisma.sessionFeedback.findMany({
      where: { createdBy: userId },
      orderBy: { sessionDate: 'desc' },
      include: {
        subject: true,
        records: { select: { id: true, aiComment: true, attendance: true } },
      },
    }),
    prisma.sessionFeedback.count({
      where: { createdBy: userId, sessionDate: { gte: weekStart } },
    }),
    prisma.sessionFeedback.count({
      where: { createdBy: userId, sessionDate: { gte: monthStart } },
    }),
  ])

  const recentSessions = allSessions.slice(0, 5)
  const totalSessions = allSessions.length
  const totalStudentsReviewed = allSessions.reduce(
    (acc, s) => acc + s.records.filter((r) => r.attendance).length,
    0
  )
  const totalAIComments = allSessions.reduce(
    (acc, s) => acc + s.records.filter((r) => r.aiComment).length,
    0
  )

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          Xin chào, {session!.user!.name}! 👋
        </h1>
        <p className="text-gray-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
          <p className="text-2xl font-black text-teal-600">{sessionsThisWeek}</p>
          <p className="text-xs text-gray-500 mt-1">Buổi dạy tuần này</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
          <p className="text-2xl font-black text-teal-600">{sessionsThisMonth}</p>
          <p className="text-xs text-gray-500 mt-1">Buổi dạy tháng này</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-teal-600">{totalStudentsReviewed}</p>
          <p className="text-xs text-gray-500 mt-1">Lượt nhận xét</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-teal-600">{totalAIComments}</p>
          <p className="text-xs text-gray-500 mt-1">Nhận xét AI</p>
        </div>
      </div>

      {/* Upcoming schedule placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-black text-gray-900 mb-2 flex items-center gap-2">
          📅 Lịch dạy tuần này
        </h2>
        <p className="text-sm text-gray-400 italic">Lịch dạy tuần này đang được phát triển. Vui lòng kiểm tra lại sau.</p>
        {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
          <Link
            href="/admin/erp/attendance"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            ✅ Ghi điểm danh ngay →
          </Link>
        )}
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">📚 Buổi học gần đây</h2>
          <Link
            href="/giao-vien/buoi-hoc"
            className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
          >
            Xem tất cả →
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold">Chưa có buổi học nào</p>
            <p className="text-sm mt-1">Admin sẽ tạo buổi học và phân công cho bạn</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentSessions.map((s) => {
              const present = s.records.filter((r) => r.attendance).length
              const aiCount = s.records.filter((r) => r.aiComment).length
              const date = new Date(s.sessionDate).toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'short',
              })
              return (
                <Link
                  key={s.id}
                  href={`/giao-vien/buoi-hoc/${s.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-teal-50 transition group"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-lg shrink-0">
                    {s.subject.icon ?? '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {s.subject.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {date} · {present}/{s.records.length} có mặt · {aiCount} nhận xét AI
                    </p>
                  </div>
                  <span className="text-gray-300 group-hover:text-teal-500 transition text-sm">→</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
