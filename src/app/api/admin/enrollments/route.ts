import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) return null
  return session
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const status = searchParams.get('status') as any

  const enrollments = await prisma.enrollment.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true } },
      course: { select: { id: true, name: true, code: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: enrollments })
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { enrollmentId, status } = await req.json()

  const updated = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status },
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function POST(req: NextRequest) {
  // Manually add user to course by phone
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { phone, courseId } = await req.json()

  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy tài khoản với SĐT này.' }, { status: 404 })
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { status: 'APPROVED' },
    create: { userId: user.id, courseId, status: 'APPROVED' },
  })

  return NextResponse.json({ success: true, data: enrollment })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { enrollmentId } = await req.json()
  await prisma.enrollment.delete({ where: { id: enrollmentId } })
  return NextResponse.json({ success: true })
}
