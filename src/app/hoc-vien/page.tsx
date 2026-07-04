import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookOpen, Trophy, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AIDashboard } from '@/components/ai/AIDashboard'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const COURSE_TYPE_META: Record<string, { emoji: string; label: string; gradient: string }> = {
  TOAN:                 { emoji: '📐', label: 'Toán',             gradient: 'from-purple-500 to-indigo-600' },
  TIENG_ANH:            { emoji: '🇬🇧', label: 'Tiếng Anh',       gradient: 'from-green-400 to-teal-600' },
  LAP_TRINH_THUAT_TOAN: { emoji: '🤖', label: 'Lập trình tư duy', gradient: 'from-yellow-400 to-orange-500' },
  LAP_TRINH_SCRATCH:    { emoji: '🐱', label: 'Scratch',          gradient: 'from-orange-400 to-pink-500' },
  LAP_TRINH_PYTHON:     { emoji: '🐍', label: 'Python',           gradient: 'from-teal-400 to-cyan-600' },
  LAP_TRINH_CPP:        { emoji: '⚡', label: 'C++',              gradient: 'from-violet-500 to-purple-700' },
  THINKING_MATH: { emoji: '🧠', label: 'Toán Tư Duy',  gradient: 'from-purple-500 to-indigo-600' },
  MATH:          { emoji: '📐', label: 'Toán',          gradient: 'from-blue-500 to-indigo-600' },
  VIETNAMESE:    { emoji: '📖', label: 'Tiếng Việt',    gradient: 'from-red-500 to-orange-500' },
  ENGLISH:       { emoji: '🇬🇧', label: 'Tiếng Anh',    gradient: 'from-green-400 to-teal-600' },
  SCIENCE:       { emoji: '🔬', label: 'Khoa học',      gradient: 'from-cyan-500 to-teal-600' },
  PHYSICS:       { emoji: '⚛️', label: 'Vật lý',        gradient: 'from-violet-500 to-indigo-700' },
  CHEMISTRY:     { emoji: '🧪', label: 'Hóa học',       gradient: 'from-lime-500 to-green-600' },
  BIOLOGY:       { emoji: '🧬', label: 'Sinh học',      gradient: 'from-emerald-500 to-teal-600' },
  HISTORY:       { emoji: '🏰', label: 'Lịch sử',       gradient: 'from-amber-500 to-orange-600' },
  GEOGRAPHY:     { emoji: '🌍', label: 'Địa lý',        gradient: 'from-emerald-400 to-cyan-600' },
  INFORMATICS:   { emoji: '💻', label: 'Tin học',       gradient: 'from-sky-500 to-blue-600' },
  CIVIC:         { emoji: '⚖️', label: 'GDCD',          gradient: 'from-indigo-500 to-blue-600' },
  ALGO:          { emoji: '🤖', label: 'Thuật toán',    gradient: 'from-yellow-400 to-orange-500' },
  SCRATCH:       { emoji: '🐱', label: 'Scratch',       gradient: 'from-orange-400 to-pink-500' },
  PYTHON:        { emoji: '🐍', label: 'Python',        gradient: 'from-teal-400 to-cyan-600' },
  CPP:           { emoji: '⚡', label: 'C++',            gradient: 'from-violet-500 to-purple-700' },
  IELTS:         { emoji: '📝', label: 'IELTS',         gradient: 'from-sky-500 to-blue-600' },
  CAMBRIDGE:     { emoji: '🎓', label: 'Cambridge',     gradient: 'from-rose-500 to-pink-600' },
  GENERAL:       { emoji: '📚', label: 'Tổng hợp',      gradient: 'from-gray-500 to-slate-600' },
}

// Day labels for timetable
const DAY_LABELS: Record<number, string> = {
  1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 0: 'Chủ nhật',
}

// Default period times when no org config available
const DEFAULT_PERIOD_TIMES: Record<number, string> = {
  1: '07:00', 2: '07:50', 3: '08:45', 4: '09:35', 5: '10:25',
  6: '13:00', 7: '13:50', 8: '14:45', 9: '15:35', 10: '16:25',
}

async function getStudentData(userId: string) {
  const [enrollments, answers, sessionRecords, userStats] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true, name: true, code: true, courseType: true, subjectCode: true,
            thumbnail: true,
            _count: { select: { subjects: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentAnswer.findMany({
      where: { userId },
      select: { score: true, isCorrect: true, subjectId: true },
    }),
    // Nhận xét buổi học từ giáo viên
    prisma.studentSessionRecord.findMany({
      where: { userId, aiComment: { not: null } },
      include: {
        feedback: {
          include: {
            subject: {
              select: {
                id: true, name: true, icon: true,
                course: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { feedback: { sessionDate: 'desc' } },
      take: 20,
    }),
    prisma.userStats.findUnique({ where: { userId } }),
  ])

  const totalScore       = answers.reduce((sum, a) => sum + a.score, 0)
  const correctAnswers   = answers.filter(a => a.isCorrect).length
  const totalAnswers     = answers.length
  return { enrollments, totalScore, correctAnswers, totalAnswers, sessionRecords, userStats }
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof CheckCircle; label: string; classes: string }> = {
    ACTIVE:   { icon: CheckCircle, label: 'Đang học',   classes: 'bg-green-50 text-green-700 border-green-200' },
    APPROVED: { icon: CheckCircle, label: 'Đang học',   classes: 'bg-green-50 text-green-700 border-green-200' },
    PENDING:  { icon: AlertCircle, label: 'Chờ duyệt',  classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    PAUSED:   { icon: AlertCircle, label: 'Tạm nghỉ',   classes: 'bg-orange-50 text-orange-600 border-orange-200' },
    EXPIRED:  { icon: XCircle,     label: 'Hết hạn',    classes: 'bg-gray-100 text-gray-500 border-gray-200' },
    REJECTED: { icon: XCircle,     label: 'Từ chối',    classes: 'bg-red-50 text-red-700 border-red-200' },
    REMOVED:  { icon: XCircle,     label: 'Đã xóa',     classes: 'bg-gray-100 text-gray-400 border-gray-200' },
  }
  const cfg = config[status] ?? config.PENDING
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.classes}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  )
}

export default async function HocVienPage() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const userId = (session.user as { id?: string }).id as string
  const { enrollments, totalScore, correctAnswers, totalAnswers, sessionRecords, userStats } =
    await getStudentData(userId)

  const approvedEnrollments = enrollments.filter(e => ['ACTIVE', 'APPROVED'].includes(e.status))
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
  const globalStars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

  // ── Today's Schedule ────────────────────────────────────────
  // Vietnam time = UTC+7
  const vietnamNow   = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const todayDay     = vietnamNow.getUTCDay()     // 0=Sun, 1=Mon…6=Sat
  const timetableDay = todayDay === 0 ? null : todayDay  // TKB: 1=Mon…6=Sat, no Sunday
  const todayDateStr = vietnamNow.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric',
  })

  let todaySlots: {
    period: number
    time: string
    courseName: string
    teacherName: string | null
    roomName: string | null
    subjectName: string | null
  }[] = []

  // Published TKB version (shared across schedule + quiz sections)
  const publishedVersion = await prisma.timetableVersion.findFirst({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: { id: true },
  })

  if (timetableDay !== null && approvedEnrollments.length > 0) {
    const courseIds = approvedEnrollments.map(e => e.course.id)


    const rawSlots = await prisma.timetableSlot.findMany({
      where: {
        courseId: { in: courseIds },
        dayOfWeek: timetableDay,
        status: 'active',
        ...(publishedVersion ? { versionId: publishedVersion.id } : {}),
      },
      orderBy: { period: 'asc' },
    })

    if (rawSlots.length > 0) {
      // Fetch teachers and rooms in parallel
      const teacherIds = [...new Set(rawSlots.map(s => s.teacherId).filter(Boolean) as string[])]
      const roomIds    = [...new Set(rawSlots.map(s => s.roomId).filter(Boolean) as string[])]

      const [teachers, rooms, subjects] = await Promise.all([
        teacherIds.length > 0
          ? prisma.user.findMany({ where: { id: { in: teacherIds } }, select: { id: true, name: true } })
          : Promise.resolve([]),
        roomIds.length > 0
          ? prisma.classRoom.findMany({ where: { id: { in: roomIds } }, select: { id: true, name: true } })
          : Promise.resolve([]),
        rawSlots.some(s => s.subjectId)
          ? prisma.subject.findMany({
              where: { id: { in: rawSlots.map(s => s.subjectId).filter(Boolean) as string[] } },
              select: { id: true, name: true },
            })
          : Promise.resolve([]),
      ])

      const teacherMap = new Map(teachers.map(t => [t.id, t.name]))
      const roomMap    = new Map(rooms.map(r => [r.id, r.name]))
      const subjectMap = new Map(subjects.map(s => [s.id, s.name]))

      // Get course names from enrollments
      const courseMap = new Map(approvedEnrollments.map(e => [e.course.id, e.course.name]))

      todaySlots = rawSlots.map(s => ({
        period:      s.period,
        time:        DEFAULT_PERIOD_TIMES[s.period] ?? `Tiết ${s.period}`,
        courseName:  courseMap.get(s.courseId) ?? 'Lớp học',
        teacherName: s.teacherId ? (teacherMap.get(s.teacherId) ?? null) : null,
        roomName:    s.roomId ? (roomMap.get(s.roomId) ?? null) : null,
        subjectName: s.subjectId ? (subjectMap.get(s.subjectId) ?? null) : null,
      }))
    }
  }

  // ── Quick Quiz — find first subject with questions ───────────
  let quizTarget: { courseId: string; subjectId: string; subjectName: string; totalQuestions: number } | null = null
  let todayAnswerCount = 0
  let todayCorrectCount = 0

  // Upcoming slots with subjectId in next 7 days (for tests badge)
  let upcomingSubjectSlots: { dayOfWeek: number; period: number; subjectName: string; courseName: string }[] = []

  if (approvedEnrollments.length > 0) {
    const d1 = new Date(Date.now() - 86_400_000)
    const firstCourseId = approvedEnrollments[0].course.id
    const courseIds = approvedEnrollments.map(e => e.course.id)

    const [firstSubject, todayAnswers, todayCorrect, weekSubjectSlots] = await Promise.all([
      prisma.subject.findFirst({
        where: { courseId: firstCourseId, isActive: true, questions: { some: {} } },
        orderBy: { order: 'asc' },
        include: { _count: { select: { questions: true } } },
      }),
      prisma.studentAnswer.count({
        where: { userId, createdAt: { gte: d1 } },
      }),
      prisma.studentAnswer.count({
        where: { userId, createdAt: { gte: d1 }, isCorrect: true },
      }),
      // Upcoming TKB with subjectId (next 7 days — all days)
      ...(publishedVersion
        ? [prisma.timetableSlot.findMany({
            where: {
              courseId: { in: courseIds },
              subjectId: { not: null },
              status: 'active',
              versionId: publishedVersion.id,
            },
            take: 5,
          })]
        : [Promise.resolve([] as Awaited<ReturnType<typeof prisma.timetableSlot.findMany>>)]),
    ])

    if (firstSubject) {
      quizTarget = {
        courseId: firstCourseId,
        subjectId: firstSubject.id,
        subjectName: firstSubject.name,
        totalQuestions: firstSubject._count.questions,
      }
    }
    todayAnswerCount = todayAnswers
    todayCorrectCount = todayCorrect

    // Enrich upcoming slots with subject names
    if (weekSubjectSlots.length > 0) {
      const slotSubjectIds = [...new Set(weekSubjectSlots.map(s => s.subjectId).filter(Boolean) as string[])]
      const upcomingSubjects = slotSubjectIds.length > 0
        ? await prisma.subject.findMany({
            where: { id: { in: slotSubjectIds } },
            select: { id: true, name: true },
          })
        : []
      const subjectNameMap = new Map(upcomingSubjects.map(s => [s.id, s.name]))
      const courseNameMap = new Map(approvedEnrollments.map(e => [e.course.id, e.course.name]))

      // Only show slots AFTER today (by dayOfWeek compared to todayDay)
      upcomingSubjectSlots = weekSubjectSlots
        .filter(s => s.dayOfWeek > todayDay || (s.dayOfWeek === todayDay && true))
        .slice(0, 3)
        .map(s => ({
          dayOfWeek: s.dayOfWeek,
          period: s.period,
          subjectName: s.subjectId ? (subjectNameMap.get(s.subjectId) ?? 'Bài học') : 'Bài học',
          courseName: courseNameMap.get(s.courseId) ?? 'Lớp học',
        }))
    }
  }

  // Progress ring constants
  const DAILY_TARGET = 20
  const ringPct = todayAnswerCount > 0 ? Math.min(100, Math.round((todayCorrectCount / Math.max(1, todayAnswerCount)) * 100)) : 0

  // ── Mini Leaderboard — top 5 cùng lớp ───────────────────────
  let leaderboard: {
    userId: string
    name: string | null
    xp: number
    level: number
    isMe: boolean
  }[] = []

  if (approvedEnrollments.length > 0) {
    const courseIds = approvedEnrollments.map(e => e.course.id)

    const classmateEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        status: { in: ['ACTIVE', 'APPROVED'] },
        NOT: { userId },
      },
      include: { user: { include: { userStats: true } } },
      take: 20,
    })

    // Deduplicate by userId and pick max XP
    const classmateMap: Record<string, { name: string | null; xp: number; level: number }> = {}
    for (const e of classmateEnrollments) {
      const uid = e.user.id
      const xp  = e.user.userStats?.xp ?? 0
      if (!classmateMap[uid] || xp > classmateMap[uid].xp) {
        classmateMap[uid] = { name: e.user.name, xp, level: e.user.userStats?.level ?? 1 }
      }
    }

    // Include self
    const myXP    = userStats?.xp ?? 0
    const myLevel = userStats?.level ?? 1
    classmateMap[userId] = { name: session.user.name ?? null, xp: myXP, level: myLevel }

    // Sort by XP and take top 5
    leaderboard = Object.entries(classmateMap)
      .map(([uid, s]) => ({ userId: uid, name: s.name, xp: s.xp, level: s.level, isMe: uid === userId }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Hero welcome card ──────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 rounded-3xl p-7 text-white mb-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/10 rounded-full translate-y-8" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm font-semibold mb-1">Bảng điều khiển học viên</p>
              <h1 className="text-2xl md:text-3xl font-black mb-3">
                Xin chào, {session.user.name ?? 'Học viên'}! 👋
              </h1>
              <p className="text-white/80">
                {approvedEnrollments.length > 0
                  ? `Bạn đang học ${approvedEnrollments.length} khoá học. Cố lên nào! 💪`
                  : 'Đăng ký khoá học để bắt đầu hành trình học tập nhé!'}
              </p>
              {todaySlots.length > 0 && (
                <p className="text-white/70 text-sm mt-1">
                  📅 Hôm nay bạn có <strong className="text-white">{todaySlots.length} tiết học</strong>
                </p>
              )}
            </div>
            {/* Progress ring */}
            <div className="hidden md:flex flex-col items-center gap-1 shrink-0">
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: 80, height: 80,
                  background: `conic-gradient(from -90deg, #3b82f6 0%, #10b981 ${ringPct}%, rgba(255,255,255,0.15) ${ringPct}%)`,
                }}
              >
                <div
                  className="rounded-full flex flex-col items-center justify-center"
                  style={{
                    width: 62, height: 62,
                    background: 'rgba(79,46,220,0.55)',
                  }}
                >
                  <span className="text-base font-black text-white leading-none">{ringPct}%</span>
                  <span className="text-white/60" style={{ fontSize: 9 }}>chính xác</span>
                </div>
              </div>
              <span className="text-white/60" style={{ fontSize: 10 }}>Hôm nay</span>
            </div>
          </div>
          {totalAnswers > 0 && (
            <div className="relative mt-5 flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                <div className="text-2xl font-black">{totalScore}</div>
                <div className="text-white/70 text-xs">Tổng điểm</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                <div className="text-2xl font-black">{accuracy}%</div>
                <div className="text-white/70 text-xs">Chính xác</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                <div className="text-2xl font-black">{correctAnswers}</div>
                <div className="text-white/70 text-xs">Câu đúng</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                {[1, 2, 3].map(s => (
                  <span key={s} className={`text-xl ${s <= globalStars ? 'text-yellow-300' : 'text-white/20'}`}>⭐</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── TODAY'S SCHEDULE ──────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📅</span>
            <div>
              <h2 className="text-lg font-black text-gray-900">Lịch học hôm nay</h2>
              <p className="text-xs text-gray-400 capitalize">{todayDateStr}</p>
            </div>
          </div>

          {todaySlots.length > 0 ? (
            <div className="space-y-3">
              {todaySlots.map(slot => (
                <div
                  key={`${slot.period}`}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-purple-100"
                  style={{ background: 'linear-gradient(135deg,#faf5ff 0%,#f5f3ff 100%)' }}
                >
                  <div className="text-center min-w-[48px]">
                    <div className="text-sm font-black text-purple-700">{slot.time}</div>
                    <div className="text-xs text-purple-400">Tiết {slot.period}</div>
                  </div>
                  <div className="w-px bg-purple-200 self-stretch" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm">{slot.subjectName ?? slot.courseName}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {slot.teacherName && (
                        <span className="text-xs text-purple-600 font-semibold">
                          👩‍🏫 {slot.teacherName}
                        </span>
                      )}
                      {slot.roomName && (
                        <span className="text-xs text-gray-500 font-semibold">
                          🚪 {slot.roomName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : timetableDay === null ? (
            <div className="text-center py-6">
              <span className="text-4xl mb-2 block">🌞</span>
              <p className="text-gray-500 font-semibold">Hôm nay là Chủ nhật — nghỉ học nào!</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl mb-2 block">📋</span>
              <p className="text-gray-500 font-semibold">Lịch học đang được cập nhật</p>
              <p className="text-gray-400 text-sm">Liên hệ giáo viên hoặc quản lý để biết lịch học</p>
            </div>
          )}
        </div>

        {/* ── STREAK + UPCOMING TESTS ─────────────────────── */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Streak reminder */}
          {userStats && userStats.streak > 0 ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-orange-50 border border-orange-200">
              <span className="text-2xl">🔥</span>
              <div className="flex-1">
                <p className="font-black text-orange-800 text-sm">
                  Streak <span className="text-orange-600">{userStats.streak} ngày</span> — Đừng bỏ lỡ hôm nay!
                </p>
                <p className="text-xs text-orange-500">Tiếp tục học để duy trì streak của bạn</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="text-2xl">💪</span>
              <p className="font-semibold text-purple-700 text-sm">
                Hãy bắt đầu streak hôm nay — học đều đặn mỗi ngày!
              </p>
            </div>
          )}

          {/* Upcoming tests/sessions badge */}
          {upcomingSubjectSlots.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-50 border border-indigo-200">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <p className="font-black text-indigo-800 text-sm">
                  Bạn có {upcomingSubjectSlots.length} buổi học sắp tới
                </p>
                <p className="text-xs text-indigo-500 mt-0.5">
                  {upcomingSubjectSlots
                    .map(s => `${s.subjectName}`)
                    .join(' · ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── QUICK QUIZ ────────────────────────────────────── */}
        {quizTarget && (
          <div
            className="rounded-3xl p-6 mb-6 overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#312e81 0%,#1e1b4b 100%)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎯</span>
                  <h2 className="font-black text-white text-lg">Luyện tập ngay</h2>
                </div>
                <p className="text-indigo-300 text-sm mb-1">
                  {quizTarget.subjectName}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="bg-white/10 rounded-xl px-3 py-1.5">
                    <span className="text-white text-sm font-bold">
                      📝 {todayAnswerCount} câu hôm nay
                    </span>
                  </div>
                  {quizTarget.totalQuestions > 0 && (
                    <div className="bg-white/10 rounded-xl px-3 py-1.5">
                      <span className="text-indigo-200 text-sm font-semibold">
                        {quizTarget.totalQuestions} câu hỏi
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/khoa-hoc/${quizTarget.courseId}`}
                className="shrink-0 bg-white text-indigo-700 font-black px-5 py-3 rounded-2xl text-sm hover:bg-indigo-50 transition"
              >
                Vào học →
              </Link>
            </div>

            {/* Progress bar */}
            {quizTarget.totalQuestions > 0 && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-indigo-300 mb-1.5">
                  <span>Hôm nay</span>
                  <span>{todayAnswerCount}/{Math.min(quizTarget.totalQuestions, 20)} câu</span>
                </div>
                <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all"
                    style={{ width: `${Math.min(100, (todayAnswerCount / Math.min(quizTarget.totalQuestions, 20)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ENROLLED COURSES ──────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Khoá học của tôi
            </h2>
            <Link href="/khoa-hoc" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
              + Thêm khoá học
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-gray-500 font-semibold mb-2">Chưa có khoá học nào</p>
              <p className="text-gray-400 text-sm mb-5">Đăng ký khoá học để bắt đầu học tập!</p>
              <Link href="/khoa-hoc" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition">
                📚 Xem khoá học ngay
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrollments.map(enrollment => {
                const subjectCode = (enrollment.course as { subjectCode?: string }).subjectCode as string | null
                const cType = ((enrollment.course as { courseType?: string }).courseType as CourseType) ?? 'TOAN'
                const meta = (subjectCode && COURSE_TYPE_META[subjectCode])
                  ? COURSE_TYPE_META[subjectCode]
                  : (COURSE_TYPE_META[cType] ?? COURSE_TYPE_META.TOAN)
                return (
                  <div key={enrollment.id} className="relative rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-purple-200 transition group">
                    <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-xl shadow-sm shrink-0`}>
                            {meta.emoji}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-mono">{enrollment.course.code}</p>
                            <h3 className="font-black text-gray-800 text-sm leading-snug line-clamp-2">
                              {enrollment.course.name}
                            </h3>
                          </div>
                        </div>
                        <StatusBadge status={enrollment.status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{enrollment.course._count.subjects} chuyên đề</span>
                        {['ACTIVE', 'APPROVED'].includes(enrollment.status) ? (
                          <Link href={`/khoa-hoc/${enrollment.course.id}`}
                            className={`text-xs font-black px-3 py-1.5 rounded-full bg-gradient-to-r ${meta.gradient} text-white hover:opacity-90 transition`}>
                            Vào học →
                          </Link>
                        ) : enrollment.status === 'PENDING' ? (
                          <span className="text-xs text-amber-600 font-semibold">⏳ Chờ duyệt</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── MINI LEADERBOARD ──────────────────────────────── */}
        {leaderboard.length > 1 && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <h2 className="text-xl font-black text-gray-900">Bảng xếp hạng lớp</h2>
                <p className="text-xs text-gray-400">Top 5 học sinh cùng lớp theo XP</p>
              </div>
            </div>

            <div className="space-y-2">
              {leaderboard.map((item, idx) => {
                const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
                const initials  = item.name?.[0]?.toUpperCase() ?? '?'
                const bgColors  = ['#0f766e', '#0369a1', '#7c3aed', '#db2777', '#ea580c']
                const avatarBg  = bgColors[(initials.charCodeAt(0) ?? 0) % bgColors.length]
                return (
                  <div
                    key={item.userId}
                    className="flex items-center gap-3 p-3 rounded-2xl transition"
                    style={{
                      background: item.isMe
                        ? 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 100%)'
                        : '#f8fafc',
                      border: item.isMe ? '2px solid #a78bfa' : '1px solid #f1f5f9',
                    }}
                  >
                    <span className="text-xl w-8 text-center">{rankEmoji}</span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                      style={{ background: avatarBg }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {item.name ?? 'Học sinh'}{item.isMe && <span className="text-purple-600 ml-1 text-xs">(Bạn)</span>}
                      </p>
                      <p className="text-xs text-gray-400">Level {item.level}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-sm text-yellow-600">{item.xp.toLocaleString('vi-VN')} XP</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <Link
              href="/bang-vang"
              className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 py-2"
            >
              Xem bảng xếp hạng đầy đủ →
            </Link>
          </div>
        )}

        {/* ── Nhận xét của giáo viên ────────────────────────── */}
        {sessionRecords.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">📋</span>
              <div>
                <h2 className="text-xl font-black text-gray-900">Nhận xét của giáo viên</h2>
                <p className="text-xs text-gray-400">Cập nhật sau mỗi buổi học — {sessionRecords.length} nhận xét</p>
              </div>
            </div>

            <div className="space-y-4">
              {sessionRecords.map(record => {
                const sessionDate = new Date(record.feedback.sessionDate)
                const subject     = record.feedback.subject
                const lines       = (record.aiComment ?? '').split('\n\n').filter(Boolean)
                const overview    = lines.find(l => l.includes('Tổng quan'))?.replace(/\*\*/g, '').replace('📋 Tổng quan:', '').trim()
                const strengths   = lines.find(l => l.includes('Điểm mạnh'))?.replace(/\*\*/g, '').replace('✨ Điểm mạnh:', '').trim()
                const parentNote  = lines.find(l => l.includes('Gửi phụ huynh'))?.replace(/\*\*/g, '').replace('👨‍👩‍👧 Gửi phụ huynh:', '').trim()

                return (
                  <div key={record.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
                      <span className="text-xl shrink-0">{subject.icon ?? '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{subject.name}</p>
                        <p className="text-xs text-gray-400">{subject.course.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-purple-600">
                          {sessionDate.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                        </p>
                        {record.hwScore !== null && (
                          <p className="text-xs text-gray-400">BTVN: {record.hwScore}%</p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${record.attendance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          {record.attendance ? '✅ Có mặt' : '❌ Vắng'}
                        </span>
                        {record.comprehension != null && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                            📚 Hiểu bài: {['', '🔴', '🟠', '🟡', '🟢', '🌟'][record.comprehension]}/5
                          </span>
                        )}
                        {record.focusLevel != null && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                            🧠 Tập trung: {record.focusLevel}/5
                          </span>
                        )}
                        {record.emotionState && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-semibold">
                            {record.emotionState === 'great' ? '🤩 Hứng khởi' : record.emotionState === 'good' ? '😊 Vui vẻ' : record.emotionState === 'neutral' ? '😐 Bình thường' : record.emotionState === 'tired' ? '😴 Mệt mỏi' : '😤 Chán'}
                          </span>
                        )}
                      </div>
                      {overview && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-gray-500 mb-0.5">📋 Tổng quan</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{overview}</p>
                        </div>
                      )}
                      {strengths && (
                        <div className="bg-teal-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-teal-600 mb-0.5">✨ Điểm mạnh</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{strengths}</p>
                        </div>
                      )}
                      {parentNote && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-amber-600 mb-0.5">👨‍👩‍👧 Giáo viên gửi phụ huynh</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{parentNote}</p>
                        </div>
                      )}
                      <details className="group">
                        <summary className="text-xs text-purple-600 font-semibold cursor-pointer hover:text-purple-700 list-none flex items-center gap-1">
                          <span className="group-open:hidden">▶ Xem nhận xét đầy đủ</span>
                          <span className="hidden group-open:inline">▼ Ẩn bớt</span>
                        </summary>
                        <div className="mt-2 bg-purple-50 rounded-xl px-3 py-3 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                          {record.aiComment}
                        </div>
                      </details>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── AI Dashboard ──────────────────────────────────── */}
        <AIDashboard userId={userId} />

        {/* ── Quick Links ───────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { href: '/khoa-hoc',     label: 'Khám phá khoá học', emoji: '📚', gradient: 'from-purple-500 to-indigo-600' },
            { href: '/bang-vang',    label: 'Bảng xếp hạng',    emoji: '🏆', gradient: 'from-yellow-400 to-orange-500' },
            { href: '/tin-tuc',      label: 'Tin tức',           emoji: '📰', gradient: 'from-teal-400 to-cyan-600' },
            { href: '/doi-mat-khau', label: 'Đổi mật khẩu',     emoji: '🔑', gradient: 'from-gray-500 to-gray-700' },
          ].map(({ href, label, emoji, gradient }) => (
            <Link key={href} href={href}
              className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:opacity-90 active:scale-95 transition`}>
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-black leading-snug">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
