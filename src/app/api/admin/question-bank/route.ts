import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

// GET: Fetch all courses with subjects and question counts
export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const gradeFilter = searchParams.get('grade') // "1".."9" or null
    const typeFilter = searchParams.get('type')   // question type or null

    // Fetch courses with subjects and question counts
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        subjects: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Filter by grade if needed
    const filteredCourses = gradeFilter
      ? courses.filter(c => {
          if (!c.grade) return false
          const grades = c.grade.split(',').map(g => g.trim())
          return grades.includes(gradeFilter)
        })
      : courses

    // Aggregate stats
    const [totalQuestions, totalSubjects, questionTypeBreakdown] = await Promise.all([
      prisma.question.count(),
      prisma.subject.count({ where: { isActive: true } }),
      prisma.question.groupBy({
        by: ['questionType'],
        _count: { questionType: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        courses: filteredCourses,
        stats: {
          totalQuestions,
          totalSubjects,
          totalCourses: filteredCourses.length,
          byType: questionTypeBreakdown.map(t => ({
            type: t.questionType,
            count: t._count.questionType,
          })),
        },
      },
    })
  } catch (error) {
    console.error('Question bank fetch error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải dữ liệu' }, { status: 500 })
  }
}
