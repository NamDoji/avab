import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function adminOnly(session: any) {
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId') ?? undefined
  const studentId = searchParams.get('studentId') ?? undefined

  const scholarships = await prisma.scholarship.findMany({
    where: {
      ...(organizationId ? { organizationId } : {}),
      ...(studentId ? { studentId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  // Enrich with student and course info
  const studentIds = [...new Set(scholarships.map(s => s.studentId))]
  const courseIds = [...new Set(scholarships.filter(s => s.courseId).map(s => s.courseId!))]

  const [students, courses] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, phone: true },
    }),
    courseIds.length > 0
      ? prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ])

  const studentMap = new Map(students.map(s => [s.id, s]))
  const courseMap = new Map(courses.map(c => [c.id, c]))

  const enriched = scholarships.map(s => ({
    ...s,
    student: studentMap.get(s.studentId) ?? null,
    course: s.courseId ? (courseMap.get(s.courseId) ?? null) : null,
  }))

  return NextResponse.json({ scholarships: enriched })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const err = adminOnly(session)
  if (err) return err

  const body = await req.json()
  const { name, description, amount, type, studentId, courseId, reason, approvedBy, startDate, endDate, organizationId } = body

  if (!name || !amount || !type || !studentId) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }
  if (!['fixed', 'percent'].includes(type)) {
    return NextResponse.json({ error: 'type phải là fixed hoặc percent' }, { status: 400 })
  }

  // Check student exists
  const student = await prisma.user.findUnique({ where: { id: studentId } })
  if (!student) {
    return NextResponse.json({ error: 'Học sinh không tồn tại' }, { status: 404 })
  }

  const scholarship = await prisma.scholarship.create({
    data: {
      name,
      description: description ?? null,
      amount: Number(amount),
      type,
      studentId,
      courseId: courseId ?? null,
      reason: reason ?? null,
      approvedBy: approvedBy ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      organizationId: organizationId ?? null,
      status: 'active',
    },
  })

  return NextResponse.json({
    scholarship: {
      ...scholarship,
      student: { id: student.id, name: student.name, phone: student.phone },
      course: null,
    }
  }, { status: 201 })
}
