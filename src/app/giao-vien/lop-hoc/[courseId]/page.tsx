import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Users, BookOpen, CalendarCheck } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
const PERIOD_TIMES: Record<number, string> = {
  1: '07:00', 2: '07:50', 3: '08:45', 4: '09:35', 5: '10:25',
  6: '13:00', 7: '13:50', 8: '14:45', 9: '15:35', 10: '16:25',
}

const DAY_LABELS: Record<number, string> = {
  1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7',
}

// Avatar initials component (server)
function AvatarInitial({ name, size = 36 }: { name: string | null; size?: number }) {
  const letter = (name ?? '?')[0]?.toUpperCase() ?? '?'
  const bgColors = ['bg-teal-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500']
  const bg = bgColors[(letter.charCodeAt(0) ?? 0) % bgColors.length]
  const px = size <= 32 ? 'text-xs' : 'text-sm'
  return (
    <div
      className={`${bg} rounded-full flex items-center justify-center text-white font-black shrink-0 ${px}`}
      style={{ width: size, height: size }}
    >
      {letter}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function TeacherClassViewPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const userId = (session.user as { id: string }).id
  const role = (session.user as { role?: string }).role
  if (role !== 'TEACHER' && role !== 'ADMIN') redirect('/dang-nhap')

  // ── Load course ──────────────────────────────────────────────
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      subjects: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, icon: true, order: true },
      },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!course) notFound()

  const studentCount = course.enrollments.length

  // ── Today's attendance for this course ───────────────────────
  const vietnamNow = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const todayStart = new Date(Date.UTC(
    vietnamNow.getUTCFullYear(),
    vietnamNow.getUTCMonth(),
    vietnamNow.getUTCDate(),
  ) - 7 * 3600 * 1000) // midnight Vietnam time in UTC

  const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000)
  const studentIds = course.enrollments.map((e) => e.user.id)

  // Get today's session feedbacks for this course subjects
  const subjectIds = course.subjects.map((s) => s.id)
  const todayFeedbacks = subjectIds.length > 0
    ? await prisma.sessionFeedback.findMany({
        where: {
          subjectId: { in: subjectIds },
          sessionDate: { gte: todayStart, lt: todayEnd },
        },
        include: {
          subject: { select: { name: true, icon: true } },
          records: {
            select: { userId: true, attendance: true },
          },
        },
        orderBy: { sessionDate: 'desc' },
        take: 3,
      })
    : []

  // Build today's attendance map: userId → present/absent
  const todayAttMap: Record<string, boolean> = {}
  for (const fb of todayFeedbacks) {
    for (const rec of fb.records) {
      if (!(rec.userId in todayAttMap)) {
        todayAttMap[rec.userId] = rec.attendance
      }
    }
  }

  // ── Recent session feedbacks for this course ─────────────────
  const recentFeedbacks = subjectIds.length > 0
    ? await prisma.sessionFeedback.findMany({
        where: { subjectId: { in: subjectIds } },
        include: {
          subject: { select: { name: true, icon: true } },
          records: { select: { id: true, attendance: true, aiComment: true } },
        },
        orderBy: { sessionDate: 'desc' },
        take: 5,
      })
    : []

  // ── Timetable slots for this course ─────────────────────────
  const publishedVersion = await prisma.timetableVersion.findFirst({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: { id: true },
  })

  const timetableSlots = await prisma.timetableSlot.findMany({
    where: {
      courseId,
      status: 'active',
      ...(publishedVersion ? { versionId: publishedVersion.id } : {}),
    },
    orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-500 px-6 py-7 shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/giao-vien"
            className="inline-flex items-center gap-1.5 text-teal-100 text-sm hover:text-white transition mb-4"
          >
            <ArrowLeft size={14} />
            Quay lại Dashboard
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider mb-1">
                Lớp học
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-white">{course.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {course.code}
                </span>
                {course.grade && (
                  <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Lớp {course.grade}
                  </span>
                )}
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {studentCount} học sinh
                </span>
              </div>
            </div>

            <Link
              href={`/giao-vien/buoi-hoc`}
              className="shrink-0 flex items-center gap-2 bg-white text-teal-700 font-black px-4 py-2.5 rounded-2xl text-sm hover:bg-teal-50 transition shadow-sm"
            >
              📝 Tạo nhận xét buổi học
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Student list + avatar stack ───────────────────────── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <Users size={18} className="text-teal-600" />
            <h2 className="font-black text-gray-900">Danh sách học sinh ({studentCount})</h2>

            {/* Avatar stack preview */}
            {studentCount > 0 && (
              <div className="ml-auto flex -space-x-2">
                {course.enrollments.slice(0, 5).map((e) => (
                  <AvatarInitial key={e.user.id} name={e.user.name} size={28} />
                ))}
                {studentCount > 5 && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                    +{studentCount - 5}
                  </div>
                )}
              </div>
            )}
          </div>

          {course.enrollments.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400">
              <p className="text-4xl mb-2">👥</p>
              <p className="font-semibold">Chưa có học sinh nào đăng ký</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {course.enrollments.map((enrollment) => {
                const student = enrollment.user
                const attToday = todayAttMap[student.id]
                const hasAtt = student.id in todayAttMap

                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition"
                  >
                    <AvatarInitial name={student.name} size={38} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {student.name ?? 'Học sinh'}
                      </p>
                      <p className="text-xs text-gray-400">{student.phone}</p>
                    </div>

                    {/* Today's attendance badge */}
                    {hasAtt ? (
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          attToday
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        {attToday ? '✅ Có mặt' : '❌ Vắng'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 font-medium">Chưa điểm danh</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Quick actions row */}
          <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-3">
            <Link
              href="/admin/erp/attendance"
              className="flex items-center gap-2 bg-teal-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-teal-700 transition"
            >
              <CalendarCheck size={14} />
              Điểm danh hôm nay
            </Link>
            <Link
              href={`/admin/erp/attendance`}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition"
            >
              <BookOpen size={14} />
              Lịch sử điểm danh
            </Link>
          </div>
        </section>

        {/* ── Timetable ────────────────────────────────────────── */}
        {timetableSlots.length > 0 && (
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <span className="text-xl">📅</span>
              <h2 className="font-black text-gray-900">Lịch dạy lớp này</h2>
            </div>
            <div className="p-5">
              <div className="grid sm:grid-cols-2 gap-2">
                {timetableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-100 rounded-xl"
                  >
                    <span className="text-sm font-black text-teal-700 min-w-[60px]">
                      {DAY_LABELS[slot.dayOfWeek] ?? `Ngày ${slot.dayOfWeek}`}
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-sm font-semibold text-gray-700">
                      Tiết {slot.period} · {PERIOD_TIMES[slot.period] ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Recent session feedbacks ─────────────────────────── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-900">📋 Nhận xét buổi học gần đây</h2>
            <Link
              href="/giao-vien/buoi-hoc"
              className="text-xs text-teal-600 font-bold hover:underline"
            >
              Tất cả →
            </Link>
          </div>

          {recentFeedbacks.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="font-semibold">Chưa có nhận xét buổi học nào</p>
              <p className="text-sm mt-1">Tạo nhận xét đầu tiên cho lớp này</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentFeedbacks.map((fb) => {
                const present = fb.records.filter((r) => r.attendance).length
                const aiCount = fb.records.filter((r) => r.aiComment).length
                return (
                  <Link
                    key={fb.id}
                    href={`/giao-vien/buoi-hoc/${fb.id}`}
                    className="flex items-center gap-3 px-6 py-4 hover:bg-teal-50 transition group"
                  >
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {fb.subject.icon ?? '📖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {fb.subject.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(fb.sessionDate).toLocaleDateString('vi-VN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                        {' · '}
                        {present}/{fb.records.length} có mặt
                        {aiCount > 0 && ` · ${aiCount} nhận xét AI`}
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-teal-500 transition shrink-0">
                      →
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Subjects ─────────────────────────────────────────── */}
        {course.subjects.length > 0 && (
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <BookOpen size={18} className="text-purple-600" />
              <h2 className="font-black text-gray-900">
                Chuyên đề ({course.subjects.length})
              </h2>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-2">
              {course.subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-100 rounded-xl"
                >
                  <span className="text-lg">{sub.icon ?? '📖'}</span>
                  <p className="text-sm font-semibold text-gray-800 truncate">{sub.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center pb-4">
          <Link
            href="/giao-vien/buoi-hoc"
            className="flex items-center gap-2 bg-teal-600 text-white font-black px-6 py-3 rounded-2xl hover:bg-teal-700 transition shadow-sm"
          >
            📝 Tạo nhận xét buổi học
          </Link>
          <Link
            href="/admin/erp/attendance"
            className="flex items-center gap-2 bg-white border border-teal-200 text-teal-700 font-bold px-6 py-3 rounded-2xl hover:bg-teal-50 transition"
          >
            ✅ Điểm danh
          </Link>
          <Link
            href="/giao-vien"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 font-bold px-6 py-3 rounded-2xl hover:bg-gray-50 transition"
          >
            ← Về Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
