import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) return null
  return session
}

type Params = { params: Promise<{ id: string }> }

// GET /api/admin/schools/[id]/courses — list courses in school
export async function GET(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id: schoolId } = await params
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  const where = search
    ? {
        schoolId,
        course: {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      }
    : { schoolId }

  const schoolCourses = await prisma.schoolCourse.findMany({
    where,
    include: {
      course: {
        select: {
          id: true,
          code: true,
          name: true,
          thumbnail: true,
          subjectName: true,
          subjectCode: true,
          gradeMin: true,
          gradeMax: true,
          isActive: true,
          approvalStatus: true,
          createdAt: true,
          _count: { select: { enrollments: true, subjects: true } },
        },
      },
    },
    orderBy: { course: { name: 'asc' } },
  })

  return NextResponse.json({ success: true, data: schoolCourses })
}

// POST /api/admin/schools/[id]/courses — add course to school
export async function POST(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id: schoolId } = await params
  const body = await req.json() as { courseId: string }
  const { courseId } = body

  if (!courseId) {
    return NextResponse.json({ success: false, error: 'courseId là bắt buộc' }, { status: 400 })
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } })
  if (!school) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy trường' }, { status: 404 })
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy khóa học' }, { status: 404 })
  }

  const schoolCourse = await prisma.schoolCourse.upsert({
    where: { schoolId_courseId: { schoolId, courseId } },
    update: {},
    create: { schoolId, courseId },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          name: true,
          thumbnail: true,
          subjectName: true,
          subjectCode: true,
          isActive: true,
          approvalStatus: true,
          createdAt: true,
          _count: { select: { enrollments: true, subjects: true } },
        },
      },
    },
  })

  return NextResponse.json({ success: true, data: schoolCourse }, { status: 201 })
}

// DELETE /api/admin/schools/[id]/courses — remove course from school
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id: schoolId } = await params
  const body = await req.json() as { courseId: string }
  const { courseId } = body

  if (!courseId) {
    return NextResponse.json({ success: false, error: 'courseId là bắt buộc' }, { status: 400 })
  }

  const existing = await prisma.schoolCourse.findUnique({
    where: { schoolId_courseId: { schoolId, courseId } },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Khóa học không thuộc trường này' }, { status: 404 })
  }

  await prisma.schoolCourse.delete({
    where: { schoolId_courseId: { schoolId, courseId } },
  })

  return NextResponse.json({ success: true, message: 'Đã xóa khóa học khỏi trường' })
}
