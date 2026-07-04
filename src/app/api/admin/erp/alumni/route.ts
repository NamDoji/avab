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
  const year = searchParams.get('year')

  try {
    const alumni = await prisma.alumniRecord.findMany({
      where: year ? { graduationYear: parseInt(year) } : {},
      include: { user: { select: { id: true, name: true, phone: true, avatar: true } } },
      orderBy: { graduationYear: 'desc' },
    })
    return NextResponse.json({ success: true, data: alumni })
  } catch (error) {
    console.error('Alumni GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách alumni' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      userId: string
      organizationId?: string
      graduationYear: number
      finalGrade?: string
      nextSchool?: string
      achievements?: string
      contactEmail?: string
    }

    if (!body.userId || !body.graduationYear) {
      return NextResponse.json(
        { success: false, error: 'userId và graduationYear là bắt buộc' },
        { status: 400 },
      )
    }

    const record = await prisma.alumniRecord.upsert({
      where: { userId: body.userId },
      create: {
        userId: body.userId,
        organizationId: body.organizationId ?? null,
        graduationYear: body.graduationYear,
        finalGrade: body.finalGrade ?? null,
        nextSchool: body.nextSchool ?? null,
        achievements: body.achievements ?? null,
        contactEmail: body.contactEmail ?? null,
      },
      update: {
        organizationId: body.organizationId ?? null,
        graduationYear: body.graduationYear,
        finalGrade: body.finalGrade ?? null,
        nextSchool: body.nextSchool ?? null,
        achievements: body.achievements ?? null,
        contactEmail: body.contactEmail ?? null,
      },
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('Alumni POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể lưu alumni' }, { status: 500 })
  }
}
