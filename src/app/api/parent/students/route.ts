import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/parent/students — Danh sách học sinh đã liên kết
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  const role = (session.user as any).role
  if (role !== 'PARENT' && role !== 'ADMIN')
    return NextResponse.json({ success: false, error: 'Không có quyền' }, { status: 403 })

  const parentId = (session.user as any).id as string

  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const links = await prisma.parentStudentLink.findMany({
      where: { parentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            isActive: true,
            enrollments: {
              where: { status: { in: ['ACTIVE', 'APPROVED'] } },
              include: {
                course: {
                  select: { id: true, name: true, courseType: true, code: true },
                },
                tuitionPayments: {
                  where: { createdAt: { gte: monthStart } },
                  select: { isPaid: true, amount: true, isFree: true },
                },
              },
            },
            answers: {
              select: { isCorrect: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
            sessionRecords: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                feedback: {
                  select: { sessionDate: true, subject: { select: { name: true } } },
                },
              },
            },
            userStats: {
              select: { xp: true, level: true, streak: true, coin: true },
            },
            userBadges: {
              include: { badge: { select: { id: true, name: true, icon: true, color: true } } },
              orderBy: { earnedAt: 'desc' },
              take: 3,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch attendance records this month separately for each student
    const studentIds = links.map((l) => l.student.id)
    const attendanceRecords = studentIds.length > 0
      ? await prisma.studentSessionRecord.findMany({
          where: { userId: { in: studentIds }, createdAt: { gte: monthStart } },
          select: { userId: true, attendance: true },
        })
      : []

    // Group attendance by student
    const attendanceByStudent = attendanceRecords.reduce<
      Record<string, { present: number; total: number }>
    >((acc, r) => {
      if (!acc[r.userId]) acc[r.userId] = { present: 0, total: 0 }
      acc[r.userId].total += 1
      if (r.attendance) acc[r.userId].present += 1
      return acc
    }, {})

    const students = links.map((link) => {
      const s = link.student
      const weekAnswers = s.answers.filter((a) => new Date(a.createdAt) >= weekAgo)
      const weekCorrect = weekAnswers.filter((a) => a.isCorrect).length
      const weekPct = weekAnswers.length > 0 ? Math.round((weekCorrect / weekAnswers.length) * 100) : null
      const lastSession = s.sessionRecords[0] ?? null

      // Attendance this month
      const att = attendanceByStudent[s.id] ?? { present: 0, total: 0 }
      const monthAttendancePct =
        att.total > 0 ? Math.round((att.present / att.total) * 100) : null

      // Payment status: any unpaid tuition payment this month?
      const allPayments = s.enrollments.flatMap((e) => e.tuitionPayments ?? [])
      const hasUnpaid = allPayments.some((p) => !p.isPaid && !p.isFree)
      const paymentStatus: 'paid' | 'unpaid' | 'unknown' =
        allPayments.length === 0 ? 'unknown' : hasUnpaid ? 'unpaid' : 'paid'

      return {
        id: s.id,
        name: s.name,
        phone: s.phone,
        avatar: s.avatar,
        isActive: s.isActive,
        linkedAt: link.createdAt,
        enrollments: s.enrollments.map((e) => ({
          id: e.id,
          status: e.status,
          course: e.course,
        })),
        weekStats: {
          done: weekAnswers.length,
          pct: weekPct,
        },
        lastSession: lastSession
          ? {
              date: lastSession.feedback.sessionDate,
              subject: lastSession.feedback.subject.name,
            }
          : null,
        gamification: {
          xp: s.userStats?.xp ?? 0,
          level: s.userStats?.level ?? 1,
          streak: s.userStats?.streak ?? 0,
          badges: s.userBadges.map((ub) => ({
            id: ub.badge.id,
            name: ub.badge.name,
            icon: ub.badge.icon ?? '🏅',
            color: ub.badge.color ?? '#6366f1',
          })),
        },
        attendance: {
          monthPresent: att.present,
          monthTotal: att.total,
          pct: monthAttendancePct,
        },
        paymentStatus,
      }
    })

    return NextResponse.json({ success: true, data: students })
  } catch (error) {
    console.error('[GET /api/parent/students]', error)
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
