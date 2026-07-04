import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// ── Period times ─────────────────────────────────────────────────────────────
const PERIOD_TIMES: Record<number, string> = {
  1: '07:00', 2: '07:50', 3: '08:45', 4: '09:35', 5: '10:25',
  6: '13:00', 7: '13:50', 8: '14:45', 9: '15:35', 10: '16:25',
}

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

// ── Quick action tile ─────────────────────────────────────────────────────────
function ActionTile({
  href,
  emoji,
  label,
  sub,
  badge,
  color,
}: {
  href: string
  emoji: string
  label: string
  sub: string
  badge?: number | null
  color: string
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 p-4 rounded-2xl border ${color} transition`}
    >
      {badge != null && badge > 0 && (
        <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white font-black px-1.5 py-0.5 rounded-full leading-none">
          {badge}
        </span>
      )}
      <span className="text-2xl shrink-0">{emoji}</span>
      <div>
        <p className="font-black text-sm text-gray-900 leading-snug">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </Link>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default async function TeacherHub() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const userId = (session.user as { id: string }).id
  const role = (session.user as { role?: string }).role
  if (role !== 'TEACHER' && role !== 'ADMIN') redirect('/dang-nhap')

  // Vietnam time
  const vietnamNow = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const todayDow = vietnamNow.getUTCDay() // 0=Sun, 1=Mon…6=Sat
  const isSunday = todayDow === 0
  const currentMinutes = vietnamNow.getUTCHours() * 60 + vietnamNow.getUTCMinutes()

  const todayStr = vietnamNow.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // Date ranges for stats
  const weekStart = new Date(vietnamNow)
  weekStart.setUTCDate(weekStart.getUTCDate() - ((todayDow + 6) % 7))
  weekStart.setUTCHours(-7, 0, 0, 0) // midnight Vietnam

  const monthStart = new Date(
    Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth(), 1) - 7 * 3600 * 1000,
  )

  // Published TKB version
  const publishedVersion = await prisma.timetableVersion.findFirst({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: { id: true },
  })

  // Subjects this teacher has taught (for HW grading)
  const mySubjectLinks = await prisma.sessionFeedback.findMany({
    where: { createdBy: userId },
    select: { subjectId: true },
    distinct: ['subjectId'],
  })
  const mySubjectIds = mySubjectLinks.map((s) => s.subjectId)

  // Parallel data fetch
  const [
    todaySlots,
    recentSessions,
    pendingSubmissions,
    pendingHWCount,
    weekSessions,
    monthSessions,
  ] = await Promise.all([
    // Today's TKB slots for this teacher
    isSunday
      ? Promise.resolve([] as Awaited<ReturnType<typeof prisma.timetableSlot.findMany>>)
      : prisma.timetableSlot.findMany({
          where: {
            teacherId: userId,
            dayOfWeek: todayDow,
            status: 'active',
            ...(publishedVersion ? { versionId: publishedVersion.id } : {}),
          },
          orderBy: { period: 'asc' },
        }),

    // 5 most recent session feedbacks
    prisma.sessionFeedback.findMany({
      where: { createdBy: userId },
      orderBy: { sessionDate: 'desc' },
      take: 5,
      include: {
        subject: { select: { name: true, icon: true } },
        records: { select: { id: true, attendance: true, aiComment: true } },
      },
    }),

    // 3 pending submissions to grade
    mySubjectIds.length > 0
      ? prisma.homeworkSubmission.findMany({
          where: { subjectId: { in: mySubjectIds }, status: 'submitted' },
          take: 3,
          orderBy: { submittedAt: 'desc' },
          include: {
            student: { select: { name: true } },
            subject: { select: { name: true } },
          },
        })
      : Promise.resolve([] as Awaited<ReturnType<typeof prisma.homeworkSubmission.findMany>>),

    // Total pending HW count
    mySubjectIds.length > 0
      ? prisma.homeworkSubmission.count({
          where: { subjectId: { in: mySubjectIds }, status: 'submitted' },
        })
      : Promise.resolve(0),

    // Session counts
    prisma.sessionFeedback.count({
      where: { createdBy: userId, sessionDate: { gte: weekStart } },
    }),
    prisma.sessionFeedback.count({
      where: { createdBy: userId, sessionDate: { gte: monthStart } },
    }),
  ])

  // Enrich today's slots with course names
  const courseIds = [...new Set(todaySlots.map((s) => s.courseId))]
  const courses =
    courseIds.length > 0
      ? await prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, name: true, grade: true },
        })
      : []
  const courseMap = new Map(courses.map((c) => [c.id, c]))

  // Classify slots: past, upcoming (≤2h), future
  const upcomingSlots = todaySlots.filter((slot) => {
    const t = PERIOD_TIMES[slot.period]
    if (!t) return false
    const m = parseTimeToMinutes(t)
    return m > currentMinutes && m <= currentMinutes + 120
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-500 px-4 sm:px-6 py-6 sm:py-8 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider mb-1">
            Cổng giáo viên · AvaB
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
            Xin chào, {session.user.name}! 👋
          </h1>
          <p className="text-teal-100 text-sm capitalize">{todayStr}</p>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { value: weekSessions, label: 'Buổi tuần này' },
              { value: monthSessions, label: 'Buổi tháng này' },
              { value: todaySlots.length, label: 'Tiết hôm nay' },
              { value: pendingHWCount, label: 'Bài chờ chấm', warn: pendingHWCount > 0 },
            ].map(({ value, label, warn }) => (
              <div
                key={label}
                className={`rounded-2xl px-4 py-2.5 text-center min-w-[80px] ${warn ? 'bg-orange-400/40' : 'bg-white/20'}`}
              >
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-teal-100 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Zone 1: Hôm nay ─────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <span className="text-xl">📅</span>
            <h2 className="font-black text-gray-900 text-lg">Hôm nay</h2>
            {upcomingSlots.length > 0 && (
              <span className="ml-auto bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full">
                ⏰ {upcomingSlots.length} tiết sắp diễn ra
              </span>
            )}
          </div>

          <div className="p-5 space-y-3">
            {/* TKB slots */}
            {isSunday ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-4xl mb-2">🌞</p>
                <p className="font-semibold">Chủ nhật — Nghỉ dạy!</p>
              </div>
            ) : todaySlots.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-semibold">Hôm nay không có tiết dạy</p>
              </div>
            ) : (
              todaySlots.map((slot) => {
                const course = courseMap.get(slot.courseId)
                const time = PERIOD_TIMES[slot.period] ?? `Tiết ${slot.period}`
                const slotMin = parseTimeToMinutes(time)
                const isPast = slotMin + 45 < currentMinutes
                const isNow = slotMin <= currentMinutes && slotMin + 45 >= currentMinutes
                const isUpcoming = !isPast && !isNow && slotMin <= currentMinutes + 120

                return (
                  <div
                    key={slot.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                      isNow
                        ? 'border-teal-300 bg-teal-50 shadow-sm'
                        : isUpcoming
                        ? 'border-teal-200 bg-teal-50/60'
                        : isPast
                        ? 'border-gray-100 bg-gray-50/50 opacity-55'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="text-center min-w-[56px]">
                      <p className="text-sm font-black text-teal-700">{time}</p>
                      <p className="text-xs text-gray-400">Tiết {slot.period}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">
                        {course?.name ?? 'Lớp học'}
                        {course?.grade && (
                          <span className="text-xs text-gray-400 ml-2 font-normal">
                            Lớp {course.grade}
                          </span>
                        )}
                      </p>
                      {isNow && (
                        <span className="text-xs text-teal-600 font-bold">🟢 Đang diễn ra</span>
                      )}
                      {isUpcoming && (
                        <span className="text-xs text-teal-600 font-semibold">⏰ Sắp diễn ra</span>
                      )}
                      {isPast && (
                        <span className="text-xs text-gray-400">✅ Đã kết thúc</span>
                      )}
                    </div>
                    {(isNow || isUpcoming) && (
                      <Link
                        href="/admin/erp/attendance"
                        className="shrink-0 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-teal-700 transition"
                      >
                        ✅ Điểm danh
                      </Link>
                    )}
                  </div>
                )
              })
            )}

            {/* Pending homework alert */}
            {pendingHWCount > 0 && (
              <Link
                href="/giao-vien/cham-bai"
                className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition group"
              >
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <p className="font-bold text-orange-800 text-sm">
                    {pendingHWCount} bài tập đang chờ chấm
                  </p>
                  <p className="text-xs text-orange-600">Nhấn để chấm bài ngay</p>
                </div>
                <span className="text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>
        </section>

        {/* ── Zone 2: Quick actions 2×3 ────────────────────────── */}
        <section>
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 px-1">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ActionTile
              href="/admin/erp/attendance"
              emoji="✅"
              label="Điểm danh"
              sub="Ghi nhận có mặt"
              color="bg-teal-50 border-teal-100 hover:bg-teal-100"
            />
            <ActionTile
              href="/giao-vien/buoi-hoc"
              emoji="📝"
              label="Nhận xét"
              sub="Buổi học hôm nay"
              color="bg-purple-50 border-purple-100 hover:bg-purple-100"
            />
            <ActionTile
              href="/giao-vien/cham-bai"
              emoji="📋"
              label="Chấm bài"
              sub={pendingHWCount > 0 ? `${pendingHWCount} bài chờ` : 'Tất cả đã chấm'}
              badge={pendingHWCount}
              color={
                pendingHWCount > 0
                  ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
              }
            />
            <ActionTile
              href="/admin/erp/timetable"
              emoji="📅"
              label="Lịch dạy"
              sub="Thời khóa biểu"
              color="bg-blue-50 border-blue-100 hover:bg-blue-100"
            />
            <ActionTile
              href="/admin/erp/students"
              emoji="👥"
              label="Học sinh"
              sub="Danh sách lớp"
              color="bg-indigo-50 border-indigo-100 hover:bg-indigo-100"
            />
            <ActionTile
              href="/giao-vien/dashboard"
              emoji="📊"
              label="Dashboard"
              sub="Thống kê của tôi"
              color="bg-pink-50 border-pink-100 hover:bg-pink-100"
            />
          </div>
        </section>

        {/* ── Zone 3: Recent activity ──────────────────────────── */}
        <section className="grid md:grid-cols-2 gap-5">
          {/* 5 recent session feedbacks */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-900">📚 Buổi học gần đây</h2>
              <Link
                href="/giao-vien/buoi-hoc"
                className="text-xs text-teal-600 font-bold hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm font-medium">Chưa có buổi học nào</p>
                <p className="text-xs mt-1">Tạo buổi học đầu tiên bên dưới</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentSessions.map((s) => {
                  const present = s.records.filter((r) => r.attendance).length
                  const aiCount = s.records.filter((r) => r.aiComment).length
                  return (
                    <Link
                      key={s.id}
                      href={`/giao-vien/buoi-hoc/${s.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-teal-50 transition group"
                    >
                      <span className="text-xl shrink-0">{s.subject.icon ?? '📖'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {s.subjectId}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(s.sessionDate).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                          {' · '}
                          {present}/{s.records.length} có mặt
                          {aiCount > 0 && ` · ${aiCount} NX AI`}
                        </p>
                      </div>
                      <span className="text-gray-300 group-hover:text-teal-500 transition text-sm shrink-0">
                        →
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* 3 pending submissions */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-900">
                📝 Bài nộp chờ chấm
                {pendingHWCount > 3 && (
                  <span className="ml-2 text-xs text-orange-600 font-semibold">
                    +{pendingHWCount - 3} thêm
                  </span>
                )}
              </h2>
              <Link
                href="/giao-vien/cham-bai"
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                Chấm ngay →
              </Link>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm font-medium">Tất cả bài đã được chấm!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingSubmissions.map((sub) => (
                  <Link
                    key={sub.id}
                    href="/giao-vien/cham-bai"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-orange-50 transition group"
                  >
                    <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-base shrink-0">
                      📝
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {sub.studentId ?? 'Học sinh'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{sub.subjectId}</p>
                    </div>
                    <span className="shrink-0 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                      Chờ chấm
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
