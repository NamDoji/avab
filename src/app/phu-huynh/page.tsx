import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Phone } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface WeekSlot {
  dayOfWeek: number
  period: number
  time: string
  courseName: string
  teacherName: string | null
  teacherPhone: string | null
  roomId: string | null
}

interface ChildData {
  id: string
  name: string | null
  phone: string
  avatar: string | null
  isActive: boolean
  // Enrollments
  enrollments: Array<{
    id: string
    courseId: string
    courseName: string
    courseCode: string
    courseType: string
    status: string
  }>
  // Schedule this week
  weekSlots: WeekSlot[]
  // Today's attendance
  todayAttendance: 'present' | 'absent' | 'unknown'
  // Recent homework
  recentHomework: {
    subjectName: string
    status: string
    submittedAt: Date
    score: number | null
  } | null
  // Gamification
  xp: number
  level: number
  streak: number
  // Payment
  paymentStatus: 'paid' | 'unpaid' | 'unknown'
  monthPaymentAmount: number
  monthPaidAmount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const PERIOD_TIMES: Record<number, string> = {
  1: '07:00', 2: '07:50', 3: '08:45', 4: '09:35', 5: '10:25',
  6: '13:00', 7: '13:50', 8: '14:45', 9: '15:35', 10: '16:25',
}

const DAY_LABELS: Record<number, string> = {
  1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7',
}

function AvatarInitial({ name, size = 48 }: { name: string | null; size?: number }) {
  const letter = (name ?? '?')[0]?.toUpperCase() ?? '?'
  const bgs = ['#0f766e', '#0369a1', '#7c3aed', '#db2777', '#ea580c']
  const bg = bgs[(letter.charCodeAt(0) ?? 0) % bgs.length]
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, fontWeight: 900, color: '#fff', flexShrink: 0,
      }}
    >
      {letter}
    </div>
  )
}

// ── Child card ────────────────────────────────────────────────────────────────
function ChildCard({ child }: { child: ChildData }) {
  const todayDow = new Date(Date.now() + 7 * 60 * 60 * 1000).getUTCDay()

  // Slots grouped by day
  const slotsByDay = child.weekSlots.reduce<Record<number, WeekSlot[]>>((acc, s) => {
    ;(acc[s.dayOfWeek] ??= []).push(s)
    return acc
  }, {})

  // Payment helpers
  const totalAmount = child.monthPaymentAmount
  const paidAmount = child.monthPaidAmount
  const unpaidAmount = totalAmount - paidAmount
  const isPaid = child.paymentStatus === 'paid'
  const hasPaymentInfo = child.paymentStatus !== 'unknown'

  return (
    <div style={{
      background: 'linear-gradient(160deg,#1e293b 0%,#0f172a 100%)',
      borderRadius: 24, overflow: 'hidden',
      border: '1px solid #334155',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        padding: '20px 22px 18px',
        background: 'linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(15,23,42,0) 100%)',
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <AvatarInitial name={child.name} size={50} />
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: '#f1f5f9', margin: 0 }}>
              {child.name ?? 'Học sinh'}
            </h3>
            <p style={{ color: '#64748b', fontSize: 13, margin: '3px 0 0' }}>{child.phone}</p>
          </div>
        </div>

        {/* Level + streak */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            background: 'rgba(99,102,241,0.2)', borderRadius: 10,
            padding: '4px 10px', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 4,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#a5b4fc' }}>
              {child.level >= 10 ? '🏆' : child.level >= 5 ? '⭐' : '🌱'} Lv.{child.level}
            </div>
          </div>
          {child.streak > 0 && (
            <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>
              🔥 {child.streak} ngày
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── Today's attendance badge ─────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Hôm nay:</span>
          {child.todayAttendance === 'present' ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(34,197,94,0.12)', borderRadius: 8, padding: '4px 10px',
              border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontWeight: 700, fontSize: 13,
            }}>✅ Có mặt</span>
          ) : child.todayAttendance === 'absent' ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(239,68,68,0.12)', borderRadius: 8, padding: '4px 10px',
              border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 700, fontSize: 13,
            }}>❌ Vắng mặt</span>
          ) : (
            <span style={{ color: '#475569', fontSize: 12 }}>Chưa có dữ liệu điểm danh</span>
          )}
        </div>

        {/* ── Weekly schedule ──────────────────────────────── */}
        {Object.keys(slotsByDay).length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📅 Lịch học tuần này
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1, 2, 3, 4, 5, 6].filter(d => slotsByDay[d]).map(day => (
                <div key={day} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{
                    minWidth: 56, fontSize: 11, fontWeight: 700,
                    color: day === todayDow ? '#818cf8' : '#64748b',
                    paddingTop: 2,
                  }}>
                    {day === todayDow ? `📌 ${DAY_LABELS[day]}` : DAY_LABELS[day]}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1 }}>
                    {slotsByDay[day]!.map((slot, i) => (
                      <span key={i} style={{
                        background: day === todayDow ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${day === todayDow ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 8, padding: '3px 8px', fontSize: 12,
                        color: day === todayDow ? '#a5b4fc' : '#94a3b8',
                        fontWeight: 600,
                      }}>
                        {slot.time} — {slot.courseName}
                        {slot.teacherName && (
                          <span style={{ color: '#64748b', fontWeight: 400 }}>
                            {' '}· GV: {slot.teacherName}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Teacher contact ──────────────────────────────── */}
        {child.weekSlots.some(s => s.teacherPhone) && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📞 Liên hệ giáo viên
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {/* Deduplicate by teacherPhone */}
              {[...new Map(
                child.weekSlots
                  .filter(s => s.teacherPhone)
                  .map(s => [s.teacherPhone, s])
              ).values()].slice(0, 3).map((slot, i) => (
                <a
                  key={i}
                  href={`tel:${slot.teacherPhone}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(20,184,166,0.1)', borderRadius: 10,
                    padding: '6px 12px', border: '1px solid rgba(20,184,166,0.25)',
                    color: '#5eead4', fontWeight: 700, fontSize: 12, textDecoration: 'none',
                  }}
                >
                  📞 {slot.teacherName ?? 'Giáo viên'}: {slot.teacherPhone}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent homework ──────────────────────────────── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📝 Bài tập gần nhất
          </p>
          {child.recentHomework ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.05)', borderRadius: 12,
              padding: '10px 14px', border: '1px solid #1e293b',
            }}>
              <span style={{ fontSize: 18 }}>
                {child.recentHomework.status === 'graded' ? '✅' : child.recentHomework.status === 'submitted' ? '📬' : '📝'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                  {child.recentHomework.subjectName}
                </p>
                <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                  Nộp: {new Date(child.recentHomework.submittedAt).toLocaleDateString('vi-VN')}
                  {child.recentHomework.score !== null && ` · Điểm: ${child.recentHomework.score}%`}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                background: child.recentHomework.status === 'graded'
                  ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                color: child.recentHomework.status === 'graded' ? '#4ade80' : '#a5b4fc',
              }}>
                {child.recentHomework.status === 'graded'
                  ? 'Đã chấm'
                  : child.recentHomework.status === 'submitted'
                  ? 'Chờ chấm'
                  : 'Đã nộp'}
              </span>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#475569' }}>Chưa có bài tập nào được nộp</p>
          )}
        </div>

        {/* ── Payment section ──────────────────────────────── */}
        {hasPaymentInfo && (
          <div style={{
            background: isPaid
              ? 'rgba(34,197,94,0.07)'
              : 'rgba(239,68,68,0.07)',
            borderRadius: 14,
            padding: '14px 16px',
            border: `1px solid ${isPaid ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: isPaid ? '#4ade80' : '#f87171', margin: 0 }}>
                  {isPaid ? '✅ Học phí tháng này đã đóng' : '⚠️ Còn học phí chưa đóng'}
                </p>
                {!isPaid && unpaidAmount > 0 && (
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                    Cần đóng:{' '}
                    <span style={{ color: '#fca5a5', fontWeight: 700 }}>
                      {unpaidAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </p>
                )}
                {isPaid && totalAmount > 0 && (
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                    Đã đóng: {totalAmount.toLocaleString('vi-VN')}₫
                  </p>
                )}
              </div>
              {!isPaid && (
                <button
                  style={{
                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    padding: '8px 14px', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', flexShrink: 0,
                  }}
                  title="Tính năng thanh toán online đang phát triển"
                >
                  💳 Thanh toán online
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Enrolled courses ─────────────────────────────── */}
        {child.enrollments.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📚 Lớp đang học ({child.enrollments.length})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {child.enrollments.slice(0, 4).map(e => (
                <span key={e.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(99,102,241,0.12)', borderRadius: 8,
                  padding: '5px 10px', fontSize: 12, fontWeight: 600,
                  color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)',
                }}>
                  📚 {e.courseCode}
                </span>
              ))}
              {child.enrollments.length > 4 && (
                <span style={{ fontSize: 12, color: '#475569', alignSelf: 'center' }}>
                  +{child.enrollments.length - 4} lớp khác
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href={`/phu-huynh/hoc-sinh/${child.id}`}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', borderRadius: 12, textDecoration: 'none',
              background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}
          >
            👁️ Xem chi tiết
          </Link>
          <Link
            href={`/admin/erp/students/${child.id}/analytics`}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', borderRadius: 12, textDecoration: 'none',
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8', fontWeight: 700, fontSize: 13,
              border: '1px solid #334155',
            }}
          >
            📊 Analytics
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default async function PhuHuynhPage() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const parentId = (session.user as { id: string }).id
  const role = (session.user as { role?: string }).role
  if (role !== 'PARENT' && role !== 'ADMIN') redirect('/dang-nhap')

  const parentName = session.user.name ?? 'Phụ huynh'

  // Vietnam time refs
  const vietnamNow = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const monthStart = new Date(
    Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth(), 1) - 7 * 3600 * 1000,
  )
  const todayStart = new Date(
    Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth(), vietnamNow.getUTCDate()) -
      7 * 3600 * 1000,
  )
  const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000)

  // ── 1. Get parent's linked students ─────────────────────────
  const links = await prisma.parentStudentLink.findMany({
    where: { parentId },
    include: {
      student: {
        select: {
          id: true, name: true, phone: true, avatar: true, isActive: true,
          enrollments: {
            where: { status: { in: ['ACTIVE', 'APPROVED'] } },
            include: {
              course: { select: { id: true, name: true, code: true, courseType: true } },
              tuitionPayments: {
                where: { createdAt: { gte: monthStart } },
                select: { isPaid: true, amount: true, isFree: true },
              },
            },
          },
          userStats: { select: { xp: true, level: true, streak: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (links.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', paddingTop: 80 }}>
        <div style={{
          background: 'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)',
          padding: '36px 24px',
        }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px' }}>
              Xin chào, {parentName}! 👨‍👩‍👧‍👦
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
              Hãy liên kết tài khoản con để bắt đầu theo dõi.
            </p>
          </div>
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
          <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>
            Chưa có học sinh nào được liên kết
          </p>
          <p style={{ color: '#475569', fontSize: 14, margin: '0 0 28px' }}>
            Nhập số điện thoại của con để bắt đầu theo dõi tiến độ học tập
          </p>
          <Link href="/phu-huynh/lien-ket" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#6366f1', color: '#fff', padding: '14px 28px',
            borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}>
            🔗 Liên kết con ngay
          </Link>
        </div>
      </div>
    )
  }

  // ── 2. Gather all courseIds and studentIds ───────────────────
  const allStudents = links.map(l => l.student)
  const studentIds = allStudents.map(s => s.id)
  const allEnrollments = allStudents.flatMap(s => s.enrollments)
  const allCourseIds = [...new Set(allEnrollments.map(e => e.course.id))]

  // ── 3. Parallel data fetch ───────────────────────────────────
  const publishedVersion = await prisma.timetableVersion.findFirst({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: { id: true },
  })

  const [allTimetableSlots, todayAttendanceRecords, recentHomeworkSubmissions] = await Promise.all([
    // Timetable for all courses
    allCourseIds.length > 0
      ? prisma.timetableSlot.findMany({
          where: {
            courseId: { in: allCourseIds },
            status: 'active',
            ...(publishedVersion ? { versionId: publishedVersion.id } : {}),
          },
          orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
        })
      : Promise.resolve([] as Awaited<ReturnType<typeof prisma.timetableSlot.findMany>>),

    // Today's attendance
    studentIds.length > 0
      ? prisma.studentSessionRecord.findMany({
          where: {
            userId: { in: studentIds },
            createdAt: { gte: todayStart, lt: todayEnd },
          },
          select: { userId: true, attendance: true },
        })
      : Promise.resolve([] as Awaited<ReturnType<typeof prisma.studentSessionRecord.findMany>>),

    // Recent homework per student
    studentIds.length > 0
      ? prisma.homeworkSubmission.findMany({
          where: {
            studentId: { in: studentIds },
          },
          orderBy: { submittedAt: 'desc' },
          take: studentIds.length * 3,
          include: {
            subject: { select: { name: true } },
          },
        })
      : Promise.resolve([] as Awaited<ReturnType<typeof prisma.homeworkSubmission.findMany>>),
  ])

  // ── 4. Enrich with teacher info ──────────────────────────────
  const teacherIds = [
    ...new Set(allTimetableSlots.map(s => s.teacherId).filter(Boolean) as string[]),
  ]
  const teachers =
    teacherIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: teacherIds } },
          select: { id: true, name: true, phone: true },
        })
      : []
  const teacherMap = new Map(teachers.map(t => [t.id, t]))

  // ── 5. Map data per student ──────────────────────────────────
  const childDataList: ChildData[] = allStudents.map(student => {
    // Enrolled courses for this student
    const studentCourseIds = new Set(student.enrollments.map(e => e.course.id))
    const enrollments = student.enrollments.map(e => ({
      id: e.id,
      courseId: e.course.id,
      courseName: e.course.name,
      courseCode: e.course.code,
      courseType: e.course.courseType,
      status: 'ACTIVE',
    }))

    // Weekly slots for this student's courses
    const weekSlots: WeekSlot[] = allTimetableSlots
      .filter(slot => studentCourseIds.has(slot.courseId))
      .map(slot => {
        const teacher = slot.teacherId ? (teacherMap.get(slot.teacherId) ?? null) : null
        const courseName =
          student.enrollments.find(e => e.course.id === slot.courseId)?.course.name ?? 'Lớp học'
        return {
          dayOfWeek: slot.dayOfWeek,
          period: slot.period,
          time: PERIOD_TIMES[slot.period] ?? `Tiết ${slot.period}`,
          courseName,
          teacherName: teacher?.name ?? null,
          teacherPhone: teacher?.phone ?? null,
          roomId: slot.roomId,
        }
      })

    // Today's attendance
    const todayRecords = todayAttendanceRecords.filter(r => r.userId === student.id)
    let todayAttendance: 'present' | 'absent' | 'unknown' = 'unknown'
    if (todayRecords.length > 0) {
      todayAttendance = todayRecords.some(r => r.attendance) ? 'present' : 'absent'
    }

    // Recent homework
    const studentHW = recentHomeworkSubmissions.filter(s => s.studentId === student.id)
    const recentHomework = studentHW[0]
      ? {
          subjectName: studentHW[0].subjectId,
          status: studentHW[0].status,
          submittedAt: studentHW[0].submittedAt,
          score: studentHW[0].score,
        }
      : null

    // Payment status
    const allPayments = student.enrollments.flatMap(e => e.tuitionPayments ?? [])
    const hasUnpaid = allPayments.some(p => !p.isPaid && !p.isFree)
    const paymentStatus: 'paid' | 'unpaid' | 'unknown' =
      allPayments.length === 0 ? 'unknown' : hasUnpaid ? 'unpaid' : 'paid'
    const monthPaymentAmount = allPayments.reduce((acc, p) => acc + p.amount, 0)
    const monthPaidAmount = allPayments
      .filter(p => p.isPaid || p.isFree)
      .reduce((acc, p) => acc + p.amount, 0)

    return {
      id: student.id,
      name: student.name,
      phone: student.phone,
      avatar: student.avatar,
      isActive: student.isActive,
      enrollments,
      weekSlots,
      todayAttendance,
      recentHomework,
      xp: student.userStats?.xp ?? 0,
      level: student.userStats?.level ?? 1,
      streak: student.userStats?.streak ?? 0,
      paymentStatus,
      monthPaymentAmount,
      monthPaidAmount,
    }
  })

  const totalUnpaid = childDataList.filter(c => c.paymentStatus === 'unpaid').length
  const todayStr = vietnamNow.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#030712', paddingTop: 80 }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a5f 0%,#1a1a4e 50%,#0f172a 100%)',
        padding: '36px 24px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Góc phụ huynh · AvaB
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px' }}>
            Xin chào, {parentName}! 👨‍👩‍👧‍👦
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 14px', textTransform: 'capitalize' }}>
            {todayStr}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
            Đang theo dõi <strong style={{ color: '#a5b4fc' }}>{childDataList.length} học sinh</strong>.
          </p>

          {totalUnpaid > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 14, padding: '8px 16px', borderRadius: 12,
              background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)',
              color: '#fca5a5', fontWeight: 700, fontSize: 13,
            }}>
              ⚠️ {totalUnpaid} học sinh chưa đóng học phí tháng này
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        {/* ── Quick actions ──────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28,
        }}>
          <Link href="/phu-huynh/lien-ket" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#1e293b', borderRadius: 16, padding: '14px 16px',
            border: '1px solid #334155', textDecoration: 'none',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🔗</div>
            <div>
              <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, margin: 0 }}>Liên kết con</p>
              <p style={{ color: '#475569', fontSize: 12, margin: '2px 0 0' }}>Thêm học sinh</p>
            </div>
          </Link>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#1e293b', borderRadius: 16, padding: '14px 16px',
            border: '1px solid #334155',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>👨‍👩‍👧</div>
            <div>
              <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, margin: 0 }}>
                {childDataList.length} học sinh
              </p>
              <p style={{ color: '#475569', fontSize: 12, margin: '2px 0 0' }}>Đang theo dõi</p>
            </div>
          </div>
        </div>

        {/* ── Child cards ────────────────────────────────────── */}
        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>👨‍👩‍👧</span> Học sinh của tôi
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))',
          gap: 22,
        }}>
          {childDataList.map(child => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      </div>
    </div>
  )
}
