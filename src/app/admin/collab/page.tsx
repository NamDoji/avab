import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Collaboration — AvaB Admin' }

const COLLAB_MODULES = [
  { href: '/admin/collab/tasks',    icon: '✅', label: 'Tasks',    desc: 'Công việc, deadline',       color: '#059669' },
  { href: '/admin/collab/calendar', icon: '📅', label: 'Calendar', desc: 'Lịch học, sự kiện',         color: '#0369a1' },
  { href: '/admin/collab/meetings', icon: '🎥', label: 'Meeting',  desc: 'Cuộc họp, biên bản AI',     color: '#7c3aed' },
  { href: '/admin/collab/workflow', icon: '🔄', label: 'Workflow', desc: 'Phê duyệt quy trình',       color: '#d97706' },
]

export default async function CollabPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  // ── Stats ──────────────────────────────────────────────────────────────────
  const now = new Date()
  const sevenDaysLater = new Date(now.getTime() + 7 * 86400000)

  const [pendingTaskCount, upcomingEventCount, totalTaskCount, recentMeetingCount] = await Promise.all([
    // Pending tasks (on_hold = Todo column)
    prisma.workflowInstance.count({
      where: { status: 'on_hold' },
    }),
    // Upcoming holidays in next 7 days
    prisma.holidayCalendar.count({
      where: {
        startDate: { gte: now, lte: sevenDaysLater },
      },
    }),
    // All active tasks
    prisma.workflowInstance.count({
      where: { status: { in: ['on_hold', 'running'] } },
    }),
    // Recent session feedbacks (as meeting proxy)
    prisma.sessionFeedback.count({
      where: {
        sessionDate: {
          gte: new Date(now.getTime() - 7 * 86400000),
        },
      },
    }),
  ])

  const stats = [
    { label: 'Task đang làm',    value: totalTaskCount,      icon: '🔄', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Task chờ xử lý',   value: pendingTaskCount,    icon: '📋', color: '#d97706', bg: '#fef9ee' },
    { label: 'Sự kiện 7 ngày',   value: upcomingEventCount,  icon: '📅', color: '#0369a1', bg: '#f0f9ff' },
    { label: 'Buổi họp/học',     value: recentMeetingCount,  icon: '🎥', color: '#7c3aed', bg: '#faf5ff' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-teal-200 text-sm font-semibold mb-3 hover:text-white transition-colors"
          >
            ← Admin Dashboard
          </Link>
          <p className="text-teal-200 text-sm font-semibold mb-1">🤝 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-1">Collaboration</h1>
          <p className="text-teal-100 text-sm">Task, Calendar, Meeting, Approval</p>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">📊 Tổng quan</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: stat.bg }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p
                    className="text-2xl font-black"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────────────── */}
        {(pendingTaskCount > 0 || upcomingEventCount > 0) && (
          <div className="space-y-3">
            {pendingTaskCount > 0 && (
              <Link
                href="/admin/collab/tasks"
                className="flex items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition"
              >
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <p className="font-bold text-amber-800 text-sm">
                    {pendingTaskCount} task đang chờ xử lý
                  </p>
                  <p className="text-amber-600 text-xs mt-0.5">Nhấn để xem Kanban board</p>
                </div>
                <span className="text-amber-400">›</span>
              </Link>
            )}
            {upcomingEventCount > 0 && (
              <Link
                href="/admin/collab/calendar"
                className="flex items-center gap-4 p-4 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition"
              >
                <span className="text-2xl">📅</span>
                <div className="flex-1">
                  <p className="font-bold text-blue-800 text-sm">
                    {upcomingEventCount} sự kiện trong 7 ngày tới
                  </p>
                  <p className="text-blue-600 text-xs mt-0.5">Nhấn để xem lịch</p>
                </div>
                <span className="text-blue-400">›</span>
              </Link>
            )}
          </div>
        )}

        {/* ── Module Cards ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🗂️ Phân hệ Collaboration</p>
          <div className="grid grid-cols-2 gap-4">
            {COLLAB_MODULES.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all flex flex-col gap-3"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: mod.color + '18' }}
                >
                  {mod.icon}
                </div>
                <div>
                  <h2 className="font-black text-gray-900 group-hover:text-teal-700 transition-colors">{mod.label}</h2>
                  <p className="text-gray-400 text-xs mt-0.5">{mod.desc}</p>
                </div>
                <div className="mt-auto text-xs font-bold" style={{ color: mod.color }}>
                  Xem chi tiết →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Quick nav ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/collab/tasks"
            className="flex items-center gap-2 bg-teal-600 text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm"
          >
            ✅ Xem tất cả Tasks
            {pendingTaskCount > 0 && (
              <span className="bg-white/25 text-white text-xs font-black px-1.5 py-0.5 rounded-full">
                {pendingTaskCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/collab/meetings"
            className="flex items-center gap-2 bg-white text-gray-700 rounded-2xl px-5 py-3 text-sm font-bold border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm"
          >
            🤖 AI Biên bản họp
          </Link>
          <Link
            href="/admin/workflow"
            className="flex items-center gap-2 bg-white text-gray-700 rounded-2xl px-5 py-3 text-sm font-bold border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all shadow-sm"
          >
            🔄 Workflow Engine
          </Link>
        </div>
      </div>
    </div>
  )
}
