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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    const orgCtx = await getOrganizationContext(check.userId)

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        subjects: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { questions: true, materials: true } },
          },
        },
        enrollments: {
          include: { user: { select: { id: true, name: true, phone: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { enrollments: true } },
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }

    // Org admin can read their org's courses + platform courses (null orgId)
    if (orgCtx && course.organizationId !== null && course.organizationId !== orgCtx.id) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập khoá học này' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error('Admin get course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải khoá học' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    const orgCtx = await getOrganizationContext(check.userId)

    // Verify org ownership before update (write operations require strict ownership)
    const existing = await prisma.course.findUnique({
      where: { id },
      select: { organizationId: true },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }
    if (orgCtx && existing.organizationId !== orgCtx.id) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền chỉnh sửa khoá học này' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, name, description, thumbnail, price, pricePerSession, paymentType, grade, courseDurationMonths, isActive, courseType, subjectCode, subjectName, gradeMin, gradeMax, curriculumId } = body

    const validPaymentTypes = ['PER_COURSE', 'PER_SESSION']
    const updateData: Record<string, unknown> = { code, name, description, thumbnail, price, isActive }
    // Legacy courseType kept for backward compat
    if (courseType) updateData.courseType = courseType
    // K12 generic fields
    if (subjectCode !== undefined) updateData.subjectCode = subjectCode || 'GENERAL'
    if (subjectName !== undefined) updateData.subjectName = subjectName || null
    if (gradeMin !== undefined) updateData.gradeMin = gradeMin ?? null
    if (gradeMax !== undefined) updateData.gradeMax = gradeMax ?? null
    if (curriculumId !== undefined) updateData.curriculumId = curriculumId || null
    if (paymentType && validPaymentTypes.includes(paymentType)) {
      updateData.paymentType = paymentType
    }
    if (pricePerSession !== undefined) updateData.pricePerSession = pricePerSession
    if (grade !== undefined) updateData.grade = grade || null
    if (courseDurationMonths !== undefined) updateData.courseDurationMonths = courseDurationMonths

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: course })
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }
    console.error('Admin update course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật khoá học' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    const orgCtx = await getOrganizationContext(check.userId)

    // Verify org ownership before delete
    const existing = await prisma.course.findUnique({
      where: { id },
      select: { organizationId: true },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }
    if (orgCtx && existing.organizationId !== orgCtx.id) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền xoá khoá học này' },
        { status: 403 }
      )
    }

    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Đã xoá khoá học' })
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }
    console.error('Admin delete course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xoá khoá học' },
      { status: 500 }
    )
  }
}
