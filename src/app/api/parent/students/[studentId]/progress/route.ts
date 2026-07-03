import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/parent/students/[studentId]/progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  const role = (session.user as any).role
  const parentId = (session.user as any).id as string
  const { studentId } = await params

  // Verify link (admin có thể xem tất cả)
  if (role !== 'ADMIN') {
    const link = await prisma.parentStudentLink.findUnique({
      where: { parentId_studentId: { parentId, studentId } },
    })
    if (!link) return NextResponse.json({ success: false, error: 'Không có quyền xem học sinh này' }, { status: 403 })
  }

  try {
    const [student, enrollments, answers, sessionRecords] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          createdAt: true,
          learnerProfile: true,
        },
      }),
      prisma.enrollment.findMany({
        where: { userId: studentId },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              courseType: true,
              subjects: {
                select: { id: true, name: true, icon: true, order: true },
                where: { isActive: true },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentAnswer.findMany({
        where: { userId: studentId },
        select: {
          id: true,
          subjectId: true,
          isCorrect: true,
          score: true,
          createdAt: true,
          question: {
            select: {
              content: true,
              subject: { select: { id: true, name: true, icon: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentSessionRecord.findMany({
        where: { userId: studentId },
        include: {
          feedback: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  course: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { feedback: { sessionDate: 'desc' } },
        take: 20,
      }),
    ])

    if (!student) return NextResponse.json({ success: false, error: 'Không tìm thấy học sinh' }, { status: 404 })

    // Tính progress theo chuyên đề
    const subjectProgressMap: Record<string, { total: number; correct: number; name: string; icon: string | null }> = {}
    for (const ans of answers) {
      const subId = ans.subjectId
      const subName = ans.question?.subject?.name ?? 'Không rõ'
      const subIcon = ans.question?.subject?.icon ?? null
      if (!subjectProgressMap[subId]) {
        subjectProgressMap[subId] = { total: 0, correct: 0, name: subName, icon: subIcon }
      }
      subjectProgressMap[subId].total++
      if (ans.isCorrect) subjectProgressMap[subId].correct++
    }

    const subjectProgress = Object.entries(subjectProgressMap).map(([id, v]) => ({
      subjectId: id,
      name: v.name,
      icon: v.icon,
      total: v.total,
      correct: v.correct,
      pct: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))

    // 10 câu gần nhất
    const recentAnswers = answers.slice(0, 10).map((a) => ({
      id: a.id,
      question: (a.question?.content ?? '').slice(0, 100),
      subject: a.question?.subject?.name ?? '',
      isCorrect: a.isCorrect,
      score: a.score,
      createdAt: a.createdAt,
    }))

    // Tổng stats
    const totalAnswers = answers.length
    const correctAnswers = answers.filter((a) => a.isCorrect).length
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

    // Tuần này
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weekAnswers = answers.filter((a) => new Date(a.createdAt) >= weekAgo)
    const weekCorrect = weekAnswers.filter((a) => a.isCorrect).length

    return NextResponse.json({
      success: true,
      data: {
        student,
        enrollments,
        stats: {
          totalAnswers,
          correctAnswers,
          accuracy,
          weekDone: weekAnswers.length,
          weekCorrect,
          weekPct: weekAnswers.length > 0 ? Math.round((weekCorrect / weekAnswers.length) * 100) : null,
        },
        subjectProgress,
        recentAnswers,
        sessionRecords: sessionRecords.map((r) => ({
          id: r.id,
          sessionDate: r.feedback.sessionDate,
          subjectName: r.feedback.subject.name,
          subjectIcon: r.feedback.subject.icon,
          courseName: r.feedback.subject.course.name,
          attendance: r.attendance,
          focusLevel: r.focusLevel,
          comprehension: r.comprehension,
          emotionState: r.emotionState,
          hwScore: r.hwScore,
          hwCorrect: r.hwCorrect,
          hwTotal: r.hwTotal,
          teacherNote: r.teacherNote,
          aiComment: r.aiComment,
          discipline: r.discipline,
          participationLevel: r.participationLevel,
        })),
      },
    })
  } catch (error) {
    console.error('[GET /api/parent/students/[studentId]/progress]', error)
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
