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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const students = links.map((link) => {
      const s = link.student
      const weekAnswers = s.answers.filter((a) => new Date(a.createdAt) >= weekAgo)
      const weekCorrect = weekAnswers.filter((a) => a.isCorrect).length
      const weekPct = weekAnswers.length > 0 ? Math.round((weekCorrect / weekAnswers.length) * 100) : null
      const lastSession = s.sessionRecords[0] ?? null

      return {
        id: s.id,
        name: s.name,
        phone: s.phone,
        avatar: s.avatar,
        isActive: s.isActive,
        linkedAt: link.createdAt,
        enrollments: s.enrollments,
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
      }
    })

    return NextResponse.json({ success: true, data: students })
  } catch (error) {
    console.error('[GET /api/parent/students]', error)
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
