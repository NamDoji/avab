import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, Bell, Calendar, ClipboardList, Trophy, Newspaper } from 'lucide-react'

export const metadata = { title: 'Thông báo — AvaB' }

// Period time labels
const PERIOD_TIMES: Record<number, string> = {
  1: '07:00', 2: '07:50', 3: '08:45', 4: '09:35', 5: '10:25',
  6: '13:00', 7: '13:50', 8: '14:45', 9: '15:35', 10: '16:25',
}

const DAY_LABELS: Record<number, string> = {
  1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 0: 'Chủ nhật',
}

export default async function ThongBaoPage() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const userId = (session.user as { id: string }).id

  // ── Active enrollments ───────────────────────────────────────────────
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { in: ['ACTIVE', 'APPROVED'] } },
    include: { course: { select: { id: true, name: true } } },
  })
  const enrolledCourseIds = enrollments.map(e => e.course.id)

  // ── Vietnam time ─────────────────────────────────────────────────────
  const vietnamNow = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const todayDay   = vietnamNow.getUTCDay() // 0=Sun, 1=Mon…6=Sat

  // ── Parallel data fetching ───────────────────────────────────────────
  const [upcomingSlots, pendingHomework, recentBadges, latestNews] = await Promise.all([
    // Upcoming timetable slots (today + next 6 days)
    enrolledCourseIds.length > 0
      ? prisma.timetableSlot.findMany({
          where: {
            courseId: { in: enrolledCourseIds },
            dayOfWeek: { gte: todayDay === 0 ? 1 : todayDay },
            status: 'active',
          },
          orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
          take: 5,
        })
      : Promise.resolve([] as Awaited<ReturnType<typeof prisma.timetableSlot.findMany>>),

    // Pending/ungraded homework submissions
    prisma.homeworkSubmission.count({
      where: {
        studentId: userId,
        status: 'submitted', // not yet graded
      },
    }),

    // Recent badges (last 7 days)
    prisma.userBadge.findMany({
      where: {
        userId,
        earnedAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
      },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 5,
    }),

    // Latest news (last 5)
    prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, summary: true, publishedAt: true, slug: true },
    }),
  ])

  // Enrich timetable slots with course names
  const courseNameMap = new Map(enrollments.map(e => [e.course.id, e.course.name]))

  // Enrich with subject names
  const slotSubjectIds = [...new Set(upcomingSlots.map(s => s.subjectId).filter(Boolean) as string[])]
  const subjects = slotSubjectIds.length > 0
    ? await prisma.subject.findMany({
        where: { id: { in: slotSubjectIds } },
        select: { id: true, name: true },
      })
    : []
  const subjectNameMap = new Map(subjects.map(s => [s.id, s.name]))

  const hasAnyNotif = upcomingSlots.length > 0 || pendingHomework > 0 || recentBadges.length > 0 || latestNews.length > 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/hoc-vien" className="p-2 rounded-xl hover:bg-white transition text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-500" />
              Thông báo
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {hasAnyNotif ? 'Cập nhật mới nhất cho bạn' : 'Không có thông báo mới'}
            </p>
          </div>
        </div>

        {!hasAnyNotif ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <span className="text-6xl block mb-4">🔔</span>
            <h2 className="text-xl font-black text-gray-800 mb-2">Tất cả đã cập nhật!</h2>
            <p className="text-gray-500 text-sm">Không có thông báo nào cần chú ý lúc này.</p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* ── 📅 Lịch học sắp tới ────────────────────────── */}
            {upcomingSlots.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900">Lịch học sắp tới</h2>
                    <p className="text-xs text-gray-400">{upcomingSlots.length} buổi học</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {upcomingSlots.map(slot => {
                    const dayLabel    = DAY_LABELS[slot.dayOfWeek] ?? `Ngày ${slot.dayOfWeek}`
                    const timeLabel   = PERIOD_TIMES[slot.period] ?? `Tiết ${slot.period}`
                    const courseName  = courseNameMap.get(slot.courseId) ?? 'Lớp học'
                    const subjectName = slot.subjectId ? subjectNameMap.get(slot.subjectId) : null

                    return (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100"
                      >
                        <div className="text-center min-w-[52px]">
                          <div className="text-xs font-black text-blue-700">{dayLabel}</div>
                          <div className="text-xs text-blue-500 font-semibold">{timeLabel}</div>
                        </div>
                        <div className="w-px bg-blue-200 self-stretch" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {subjectName ?? courseName}
                          </p>
                          {subjectName && (
                            <p className="text-xs text-gray-400 truncate">{courseName}</p>
                          )}
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full shrink-0">
                          Tiết {slot.period}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── 📝 Bài tập chờ nộp ─────────────────────────── */}
            {pendingHomework > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-black text-gray-900">Bài tập chờ chấm</h2>
                    <p className="text-sm text-amber-600 font-semibold mt-0.5">
                      Bạn có <strong>{pendingHomework} bài tập</strong> đang chờ giáo viên chấm điểm
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-100">
                  <p className="text-xs text-amber-700">
                    💡 Bài tập đã nộp sẽ được giáo viên chấm và phản hồi sớm. Hãy kiểm tra lại kết quả trong mục khoá học của bạn.
                  </p>
                </div>
              </div>
            )}

            {/* ── 🏅 Badge mới ───────────────────────────────── */}
            {recentBadges.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-yellow-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-yellow-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900">Badge mới nhận được</h2>
                    <p className="text-xs text-gray-400">7 ngày qua</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {recentBadges.map(ub => (
                    <div
                      key={ub.id}
                      className="flex items-center gap-2.5 bg-yellow-50 border border-yellow-100 rounded-2xl px-3 py-2.5"
                    >
                      <span className="text-2xl">{ub.badge.icon ?? '🏅'}</span>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{ub.badge.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(ub.earnedAt).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/hoc-vien/gamification"
                  className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-yellow-700 hover:text-yellow-800 py-2 rounded-xl hover:bg-yellow-50 transition"
                >
                  Xem tất cả thành tích →
                </Link>
              </div>
            )}

            {/* ── 📢 Tin tức / thông báo từ GV ───────────────── */}
            {latestNews.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-teal-100 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900">Tin tức & thông báo</h2>
                    <p className="text-xs text-gray-400">Từ AvaB</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {latestNews.map(news => (
                    <Link
                      key={news.id}
                      href={`/tin-tuc/${news.slug}`}
                      className="flex items-start gap-3 p-3 rounded-2xl hover:bg-teal-50 border border-transparent hover:border-teal-100 transition group"
                    >
                      <span className="text-xl shrink-0 mt-0.5">📢</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 group-hover:text-teal-700 line-clamp-2">
                          {news.title}
                        </p>
                        {news.summary && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{news.summary}</p>
                        )}
                        {news.publishedAt && (
                          <p className="text-xs text-gray-300 mt-1">
                            {new Date(news.publishedAt).toLocaleDateString('vi-VN', {
                              day: 'numeric',
                              month: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                      <span className="text-teal-400 text-xs shrink-0 mt-1">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
