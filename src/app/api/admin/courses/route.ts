import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

export async function GET() {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    // Use getOrganizationContext for consistent org scoping
    const orgCtx = await getOrganizationContext(check.userId)

    // Org admin → see their org's courses + AvaB public courses (isPublic = true)
    // Super admin (orgCtx = null) → see all
    const whereClause = orgCtx
      ? { OR: [{ organizationId: orgCtx.id }, { isPublic: true }] }
      : {}

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { subjects: true, enrollments: true } },
      },
    })

    return NextResponse.json({ success: true, data: courses })
  } catch (error) {
    console.error('Admin get courses error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải khoá học' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    // Get org context to tag the created course with its organization
    const orgCtx = await getOrganizationContext(check.userId)

    const body = await request.json()
    const { code, name, description, thumbnail, price, pricePerSession, paymentType, grade, courseType, subjectCode, subjectName, gradeMin, gradeMax, curriculumId, courseDurationMonths } = body

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Mã khoá học và tên là bắt buộc' },
        { status: 400 }
      )
    }

    // Legacy courseType kept for backward compat; new code should use subjectCode
    const validCourseTypes = ['TOAN', 'TIENG_ANH', 'LAP_TRINH_THUAT_TOAN', 'LAP_TRINH_SCRATCH', 'LAP_TRINH_PYTHON', 'LAP_TRINH_CPP']
    const finalCourseType = courseType && validCourseTypes.includes(courseType) ? courseType : (courseType || 'TOAN')
    const validPaymentTypes = ['PER_COURSE', 'PER_SESSION']
    const finalPaymentType = paymentType && validPaymentTypes.includes(paymentType) ? paymentType : 'PER_COURSE'

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description,
        thumbnail,
        price: price ?? 0,
        pricePerSession: pricePerSession ?? null,
        paymentType: finalPaymentType as 'PER_COURSE' | 'PER_SESSION',
        grade: grade || null,
        courseDurationMonths: courseDurationMonths ?? 18,
        courseType: finalCourseType,
        // K12 generic fields
        subjectCode: subjectCode || 'GENERAL',
        subjectName: subjectName || null,
        gradeMin: gradeMin ?? null,
        gradeMax: gradeMax ?? null,
        curriculumId: curriculumId || null,
        // Org scoping — null means AvaB platform course
        organizationId: orgCtx?.id ?? null,
      },
    })

    return NextResponse.json({ success: true, data: course }, { status: 201 })
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Mã khoá học đã tồn tại' },
        { status: 409 }
      )
    }
    console.error('Admin create course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo khoá học' },
      { status: 500 }
    )
  }
}
