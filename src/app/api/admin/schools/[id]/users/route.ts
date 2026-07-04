import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) return null
  return session
}

type Params = { params: Promise<{ id: string }> }

// GET /api/admin/schools/[id]/users — list users in school
export async function GET(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id: schoolId } = await params
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '50')
  const skip = (page - 1) * limit

  const where = search
    ? {
        schoolId,
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      }
    : { schoolId }

  const [schoolUsers, total] = await Promise.all([
    prisma.schoolUser.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            avatar: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
      skip,
      take: limit,
    }),
    prisma.schoolUser.count({ where }),
  ])

  return NextResponse.json({ success: true, data: schoolUsers, total, page, limit })
}

// POST /api/admin/schools/[id]/users — add user to school
export async function POST(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id: schoolId } = await params
  const body = await req.json() as { userId: string; role?: string }
  const { userId, role = 'STUDENT' } = body

  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId là bắt buộc' }, { status: 400 })
  }

  // Check school exists
  const school = await prisma.school.findUnique({ where: { id: schoolId } })
  if (!school) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy trường' }, { status: 404 })
  }

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy user' }, { status: 404 })
  }

  const schoolUser = await prisma.schoolUser.upsert({
    where: { schoolId_userId: { schoolId, userId } },
    update: { role },
    create: { schoolId, userId, role },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  })

  return NextResponse.json({ success: true, data: schoolUser }, { status: 201 })
}

// DELETE /api/admin/schools/[id]/users — remove user from school
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id: schoolId } = await params
  const body = await req.json() as { userId: string }
  const { userId } = body

  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId là bắt buộc' }, { status: 400 })
  }

  const existing = await prisma.schoolUser.findUnique({
    where: { schoolId_userId: { schoolId, userId } },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: 'User không thuộc trường này' }, { status: 404 })
  }

  await prisma.schoolUser.delete({
    where: { schoolId_userId: { schoolId, userId } },
  })

  return NextResponse.json({ success: true, message: 'Đã xóa user khỏi trường' })
}
