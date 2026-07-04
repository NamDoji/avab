import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  try {
    const transfers = await prisma.classTransfer.findMany({
      where: status ? { status } : {},
      include: {
        student: { select: { id: true, name: true } },
        fromCourse: { select: { id: true, name: true } },
        toCourse: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: transfers })
  } catch (error) {
    console.error('Transfers GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách chuyển lớp' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      studentId: string
      fromCourseId: string
      toCourseId: string
      organizationId?: string
      reason?: string
      transferDate?: string
    }

    if (!body.studentId || !body.fromCourseId || !body.toCourseId) {
      return NextResponse.json(
        { success: false, error: 'studentId, fromCourseId, toCourseId là bắt buộc' },
        { status: 400 },
      )
    }

    const transfer = await prisma.classTransfer.create({
      data: {
        studentId: body.studentId,
        fromCourseId: body.fromCourseId,
        toCourseId: body.toCourseId,
        organizationId: body.organizationId ?? null,
        reason: body.reason ?? null,
        transferDate: body.transferDate ? new Date(body.transferDate) : new Date(),
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, data: transfer })
  } catch (error) {
    console.error('Transfers POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo yêu cầu chuyển lớp' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      id: string
      status: 'approved' | 'rejected'
      approvedBy?: string
    }

    if (!body.id || !body.status) {
      return NextResponse.json({ success: false, error: 'id và status là bắt buộc' }, { status: 400 })
    }

    const transfer = await prisma.classTransfer.update({
      where: { id: body.id },
      data: {
        status: body.status,
        approvedBy: body.approvedBy ?? null,
      },
    })

    return NextResponse.json({ success: true, data: transfer })
  } catch (error) {
    console.error('Transfers PATCH error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật trạng thái' }, { status: 500 })
  }
}
