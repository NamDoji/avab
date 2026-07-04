import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Thống kê học tập — AvaB' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayKey(date: Date): string {
  return date.toISOString().split('T')[0]!
}

function getVietnamDate(utcDate: Date): Date {
  return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000)
}

// Badge color map
const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  yellow: { bg: '#fef9c3', text: '#854d0e', border: '#fde68a' },
  blue:   { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  green:  { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  purple: { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
  red:    { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  orange: { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
  teal:   { bg: '#ccfbf1', text: '#134e4a', border: '#5eead4' },
}

function getBadgeStyle(color: string) {
  return BADGE_COLORS[color] ?? BADGE_COLORS.yellow!
}

function statusLabel(status: string) {
  if (status === 'graded') return { text: 'Đã chấm', bg: '#dcfce7', color: '#166534' }
  if (status === 'returned') return { text: 'Trả lại', bg: '#dbeafe', color: '#1e40af' }
  return { text: 'Chờ chấm', bg: '#fef9c3', color: '#854d0e' }
}

// ─── Accuracy Ring ────────────────────────────────────────────────────────────

function AccuracyRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const stroke = 5
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dashArr = `${(pct / 100) * circ} ${circ}`
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={dashArr} strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HocVienThongKePage() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const userId = (session.user as { id?: string }).id!

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000)

  // ── Parallel data fetch ──────────────────────────────────────
  const [answers, submissions, badges, stats, enrollments] = await Promise.all([
    prisma.studentAnswer.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: {
        id: true,
        subjectId: true,
        isCorrect: true,
        score: true,
        createdAt: true,
        question: { select: { subjectId: true, content: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.homeworkSubmission.findMany({
      where: { studentId: userId },
      include: {
        subject: { select: { id: true, name: true, course: { select: { id: true, name: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 20,
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    }),
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.enrollment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { course: { select: { id: true, name: true, courseType: true } } },
    }),
  ])

  // ── Map subjectId → courseId ────────────────────────────────
  const subjectIds = [...new Set(answers.map(a => a.subjectId).filter(Boolean))]
  const subjects = subjectIds.length > 0
    ? await prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, name: true, courseId: true, course: { select: { id: true, name: true } } },
      })
    : []
  const subjectCourseMap = new Map(subjects.map(s => [s.id, { courseId: s.courseId, courseName: s.course.name }]))

  // ── Accuracy per course ─────────────────────────────────────
  const courseAccuracy: Map<string, { name: string; correct: number; total: number }> = new Map()
  for (const a of answers) {
    const mapped = subjectCourseMap.get(a.subjectId)
    if (!mapped) continue
    const { courseId, courseName } = mapped
    const existing = courseAccuracy.get(courseId) ?? { name: courseName, correct: 0, total: 0 }
    existing.total++
    if (a.isCorrect) existing.correct++
    courseAccuracy.set(courseId, existing)
  }
  const courseAccuracyList = [...courseAccuracy.entries()]
    .map(([courseId, data]) => ({
      courseId,
      name: data.name,
      correct: data.correct,
      total: data.total,
      pct: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)

  // ── Activity calendar (30 days) ─────────────────────────────
  const activeDays = new Set<string>()
  for (const a of answers) {
    const vnDate = getVietnamDate(new Date(a.createdAt))
    activeDays.add(getDayKey(vnDate))
  }

  const calendarDays: { key: string; label: string; active: boolean }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = getVietnamDate(new Date(Date.now() - i * 86_400_000))
    const key = getDayKey(d)
    calendarDays.push({
      key,
      label: d.getUTCDate().toString(),
      active: activeDays.has(key),
    })
  }
  const activeCount = activeDays.size

  // ── Overall stats ───────────────────────────────────────────
  const totalAnswers30d = answers.length
  const correctAnswers30d = answers.filter(a => a.isCorrect).length
  const accuracy30d = totalAnswers30d > 0
    ? Math.round((correctAnswers30d / totalAnswers30d) * 100)
    : 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/hoc-vien" className="hover:text-purple-600 transition-colors">← Học viên</Link>
          <span>/</span>
          <span className="text-gray-600 font-semibold">Thống kê</span>
        </div>

        <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 rounded-3xl p-7 text-white mb-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
          <div className="relative">
            <p className="text-white/70 text-sm font-semibold mb-1">📊 Thống kê học tập của tôi</p>
            <h1 className="text-2xl md:text-3xl font-black mb-4">{session.user.name}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Câu đã làm (30 ngày)', value: totalAnswers30d.toLocaleString('vi-VN'), icon: '📝' },
                { label: 'Độ chính xác', value: `${accuracy30d}%`, icon: '🎯' },
                { label: 'Ngày hoạt động', value: `${activeCount}/30`, icon: '📅' },
                { label: 'Huy hiệu', value: badges.length.toString(), icon: '🏅' },
              ].map(item => (
                <div key={item.label} className="bg-white/20 backdrop-blur rounded-2xl px-4 py-3 text-center">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-xl font-black">{item.value}</div>
                  <div className="text-white/70 text-xs mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity Calendar ───────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">📅</span>
            <div>
              <h2 className="text-lg font-black text-gray-900">Hoạt động 30 ngày qua</h2>
              <p className="text-xs text-gray-400">Mỗi ô xanh = ngày có làm bài tập</p>
            </div>
            <div className="ml-auto">
              <span className="text-sm font-bold text-purple-600">
                {activeCount} / 30 ngày
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {calendarDays.map(day => (
              <div
                key={day.key}
                title={day.key}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                style={day.active
                  ? { background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }
                  : { background: '#f3f4f6', color: '#9ca3af' }
                }
              >
                {day.label}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              Có làm bài
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gray-200" />
              Không hoạt động
            </div>
          </div>
        </div>

        {/* ── Accuracy per course ─────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">🎯</span>
            <h2 className="text-lg font-black text-gray-900">Độ chính xác theo khóa học</h2>
          </div>

          {courseAccuracyList.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-gray-500">Chưa có dữ liệu trong 30 ngày qua</p>
              <p className="text-gray-400 text-sm mt-1">Hãy làm bài tập để xem thống kê!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courseAccuracyList.map(item => (
                <div key={item.courseId} className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <AccuracyRing pct={item.pct} size={56} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black text-gray-700">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.pct}%`,
                            background: item.pct >= 80
                              ? 'linear-gradient(90deg,#10b981,#059669)'
                              : item.pct >= 60
                              ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                              : 'linear-gradient(90deg,#ef4444,#dc2626)',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {item.correct}/{item.total} câu đúng
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Submission History ──────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">📝</span>
            <div>
              <h2 className="text-lg font-black text-gray-900">Lịch sử nộp bài</h2>
              <p className="text-xs text-gray-400">{submissions.length} bài tập đã nộp</p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-500">Chưa có bài tập nào được nộp</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide rounded-l-xl">
                      Môn học
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Khóa học
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Điểm
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Trạng thái
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide rounded-r-xl">
                      Ngày nộp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map(sub => {
                    const st = statusLabel(sub.status)
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-3 py-3">
                          <span className="font-semibold text-gray-800">{sub.subject.name}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-gray-500 text-xs">{sub.subject.course.name}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {sub.score !== null ? (
                            <span className={`font-black text-sm ${
                              sub.score >= 80 ? 'text-green-600' :
                              sub.score >= 60 ? 'text-yellow-600' :
                              'text-red-500'
                            }`}>
                              {sub.score}%
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background: st.bg, color: st.color }}
                          >
                            {st.text}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="text-xs text-gray-400">
                            {new Date(sub.submittedAt).toLocaleDateString('vi-VN', {
                              day: 'numeric', month: 'numeric', year: 'numeric'
                            })}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Badge Collection ────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">🏅</span>
            <div>
              <h2 className="text-lg font-black text-gray-900">Bộ sưu tập huy hiệu</h2>
              <p className="text-xs text-gray-400">
                {badges.length > 0
                  ? `${badges.length} huy hiệu đã đạt được`
                  : 'Chưa có huy hiệu nào'}
              </p>
            </div>
          </div>

          {badges.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-gray-500 font-semibold">Chưa có huy hiệu nào</p>
              <p className="text-gray-400 text-sm mt-1">
                Tiếp tục học tập và hoàn thành thử thách để nhận huy hiệu!
              </p>
              <Link
                href="/hoc-vien/gamification"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition"
              >
                🎮 Xem nhiệm vụ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {badges.map(ub => {
                const style = getBadgeStyle(ub.badge.color)
                return (
                  <div
                    key={ub.id}
                    className="flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-transform hover:scale-105"
                    style={{ background: style.bg, borderColor: style.border }}
                  >
                    <div className="text-4xl mb-2">{ub.badge.icon}</div>
                    <p className="font-black text-sm leading-tight mb-1" style={{ color: style.text }}>
                      {ub.badge.name}
                    </p>
                    {ub.badge.description && (
                      <p className="text-xs opacity-70 leading-snug" style={{ color: style.text }}>
                        {ub.badge.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1">
                      {ub.badge.xpReward > 0 && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: 'rgba(0,0,0,0.08)', color: style.text }}
                        >
                          +{ub.badge.xpReward} XP
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-50 mt-1" style={{ color: style.text }}>
                      {new Date(ub.earnedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Gamification Stats ──────────────────────────────── */}
        {stats && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">⭐</span>
              <h2 className="text-lg font-black text-gray-900">Điểm tích lũy</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'XP tổng', value: stats.xp.toLocaleString('vi-VN'), icon: '⚡', color: '#7c3aed' },
                { label: 'Level', value: `Lv.${stats.level}`, icon: '🏆', color: '#0f766e' },
                { label: 'Streak', value: `${stats.streak} ngày`, icon: '🔥', color: '#ea580c' },
                { label: 'Xu', value: stats.coin.toLocaleString('vi-VN'), icon: '💰', color: '#d97706' },
              ].map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4 text-center border"
                  style={{ background: `${item.color}10`, borderColor: `${item.color}30` }}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xl font-black" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick Actions ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link
            href="/hoc-vien"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all group"
          >
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-gray-700 text-sm group-hover:text-purple-700 transition-colors">
              Dashboard
            </span>
          </Link>
          <Link
            href="/hoc-vien/gamification"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all group"
          >
            <span className="text-2xl">🎮</span>
            <span className="font-bold text-gray-700 text-sm group-hover:text-purple-700 transition-colors">
              Nhiệm vụ
            </span>
          </Link>
          <Link
            href="/bang-vang"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all group"
          >
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-gray-700 text-sm group-hover:text-purple-700 transition-colors">
              Bảng xếp hạng
            </span>
          </Link>
        </div>

      </div>
    </main>
  )
}
