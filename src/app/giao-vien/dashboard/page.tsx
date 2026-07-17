import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Teacher Dashboard — AvaB Giáo viên' }

// Map dayOfWeek number → Vietnamese label
const DOW_LABEL: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
}

export default async function TeacherEnhancedDashboard() {
  const session = await auth()
  if (!session) redirect('/dang-nhap')

  const userRole = (session.user as { role?: string }).role
  if (userRole !== 'TEACHER' && userRole !== 'ADMIN') redirect('/giao-vien')

  const userId = (session.user as { id: string }).id
  const teacherName = session.user?.name ?? 'Giáo viên'

  const now = new Date()
  // AvaB convention: 1=T2 ... 7=CN; JS getDay(): 0=Sun, 1=Mon,...,6=Sat
  const jsDay = now.getDay() // 0–6
  const avabDay = jsDay === 0 ? 7 : jsDay // 7 = Sunday, 1–6 = Mon–Sat

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const [mySessions, sessionsThisWeek, sessionsThisMonth, upcomingSlots] = await Promise.all([
    // All session feedbacks (last 100) to compute unique students
    prisma.sessionFeedback.count({ where: { createdBy: userId } }),

    prisma.sessionFeedback.count({
      where: { createdBy: userId, sessionDate: { gte: weekStart } },
    }),

    prisma.sessionFeedback.count({
      where: { createdBy: userId, sessionDate: { gte: monthStart } },
    }),

    // Today's timetable slots for this teacher
    prisma.timetableSlot.findMany({
      where: {
        teacherId: userId,
        dayOfWeek: avabDay,
        status: 'active',
      },
      orderBy: { period: 'asc' },
    }),
  ])

  // Fetch course names for timetable slots (separate query — no direct relation)
  const slotCourseIds = [...new Set(upcomingSlots.map((s) => s.courseId))]
  const slotCourses = slotCourseIds.length > 0
    ? await prisma.course.findMany({
        where: { id: { in: slotCourseIds } },
        select: { id: true, name: true, code: true, grade: true },
      })
    : []
  const courseMap = new Map(slotCourses.map((c) => [c.id, c]))

  // Fetch subject names for timetable slots
  const slotSubjectIds = upcomingSlots.map((s) => s.subjectId).filter(Boolean) as string[]
  const uniqueSubjectIds = [...new Set(slotSubjectIds)]
  const slotSubjects = uniqueSubjectIds.length > 0
    ? await prisma.subject.findMany({
        where: { id: { in: uniqueSubjectIds } },
        select: { id: true, name: true, icon: true },
      })
    : []
  const subjectMap = new Map(slotSubjects.map((s) => [s.id, s]))

  // Recent 5 session feedbacks with subject info
  const recentSessions = await prisma.sessionFeedback.findMany({
    where: { createdBy: userId },
    orderBy: { sessionDate: 'desc' },
    take: 5,
    include: {
      subject: { select: { name: true, icon: true } },
      records: { select: { id: true, attendance: true, aiComment: true } },
    },
  })

  const todayLabel = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const slotCount = upcomingSlots.length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">

      {/* ── Header: Greeting ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl mb-6 p-6"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <p className="text-teal-100 text-xs font-semibold mb-1 relative z-10 capitalize">{todayLabel}</p>
        <h1 className="text-2xl font-black text-white relative z-10">
          Xin chào, {teacherName}! 👋
        </h1>
        <p className="text-teal-100 text-sm mt-1 relative z-10">
          Hôm nay bạn có{' '}
          <span className="font-black text-white">
            {slotCount} {slotCount === 1 ? 'tiết' : 'tiết'} dạy
          </span>{' '}
          {slotCount === 0 ? '— Không có tiết học hôm nay 🎉' : `(${DOW_LABEL[avabDay] ?? `Ngày ${avabDay}`})`}
        </p>
      </div>

      {/* ── Today's Schedule ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            📅 Lịch dạy hôm nay
          </h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full font-semibold">
            {DOW_LABEL[avabDay] ?? 'Hôm nay'}
          </span>
        </div>

        {upcomingSlots.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">
            <div className="text-4xl mb-2">☀️</div>
            <p className="font-semibold text-gray-600">Không có tiết dạy hôm nay</p>
            <p className="text-sm mt-1">Hãy nghỉ ngơi và chuẩn bị cho ngày mai!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcomingSlots.map((slot) => {
              const course = courseMap.get(slot.courseId)
              const subject = slot.subjectId ? subjectMap.get(slot.subjectId) : null
              return (
                <div key={slot.id} className="flex items-center gap-4 px-6 py-4 hover:bg-teal-50 transition-colors">
                  {/* Period badge */}
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <span className="text-xs font-bold opacity-75">Tiết</span>
                    <span className="text-lg font-black leading-none">{slot.period}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">
                      {subject ? (
                        <span>{subject.icon ?? '📖'} {subject.name}</span>
                      ) : (
                        <span>📚 Tiết {slot.period}</span>
                      )}
                    </p>
                    {course && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lớp: <span className="font-semibold text-gray-700">{course.name}</span>
                        {course.grade && ` · Lớp ${course.grade}`}
                      </p>
                    )}
                    {slot.campusId && (
                      <p className="text-xs text-gray-400 mt-0.5">Cơ sở: {slot.campusId}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                    slot.status === 'active'
                      ? 'bg-teal-50 text-teal-700'
                      : slot.status === 'cancelled'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {slot.status === 'active' ? '✅ Có lịch' :
                     slot.status === 'cancelled' ? '❌ Đã huỷ' : '🔄 Bù'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Quick Stats ────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-sm font-bold text-gray-700 mb-3">📊 Thống kê của tôi</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
            <p className="text-3xl font-black text-teal-600">{mySessions}</p>
            <p className="text-xs text-gray-500 mt-1">Tổng buổi dạy</p>
            <p className="text-xs text-gray-300 mt-0.5">Tất cả thời gian</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
            <p className="text-3xl font-black text-blue-600">{sessionsThisWeek}</p>
            <p className="text-xs text-gray-500 mt-1">Tuần này</p>
            <p className="text-xs text-gray-300 mt-0.5">Từ thứ 2</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-cherry-100 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-3xl font-black text-cherry-600">{sessionsThisMonth}</p>
            <p className="text-xs text-gray-500 mt-1">Tháng này</p>
            <p className="text-xs text-gray-300 mt-0.5">Từ đầu tháng</p>
          </div>
        </div>
      </div>

      {/* ── Recent Session Feedbacks ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">📚 Buổi học gần đây</h2>
          <Link
            href="/giao-vien/buoi-hoc"
            className="text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors"
          >
            Xem tất cả →
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold">Chưa có buổi học nào</p>
            <p className="text-sm mt-1">Ghi nhận buổi đầu tiên bằng nút bên dưới</p>
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
                    <p className="text-xs text-gray-400 mt-0.5">
                      {date}
                      {s.records.length > 0 && ` · ${present}/${s.records.length} có mặt`}
                      {aiCount > 0 && ` · ${aiCount} nhận xét AI`}
                    </p>
                  </div>
                  <span className="text-gray-300 group-hover:text-teal-500 transition text-sm">→</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-bold text-gray-700 mb-3">⚡ Thao tác nhanh</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/erp/attendance"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-5 py-3 text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            ✅ Điểm danh
          </Link>
          <Link
            href="/giao-vien/buoi-hoc"
            className="flex items-center gap-2 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-2xl px-5 py-3 text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            📝 Nhận xét buổi học
          </Link>
          <Link
            href="/giao-vien"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            🏠 Dashboard cũ
          </Link>
        </div>
      </div>

    </div>
  )
}
