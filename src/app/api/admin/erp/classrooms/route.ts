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
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  // ClassRoom has no direct organizationId field — we use schoolId to scope by campus.
  // orgCtx.campusIds = campuses the user belongs to; schoolId on ClassRoom = campusId when set.
  // Super admin (orgCtx = null) sees all classrooms.
  const orgCtx = await getOrganizationContext(check.userId)

  try {
    // Build where clause: filter by campusIds if org admin has assigned campuses
    const where: Record<string, unknown> = {}
    if (orgCtx && orgCtx.campusIds.length > 0) {
      where.schoolId = { in: orgCtx.campusIds }
    }
    // If org admin has no campusIds, they see all (graceful fallback)

    const classrooms = await prisma.classRoom.findMany({
      where,
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json({ success: true, data: classrooms })
  } catch (error) {
    console.error('Classrooms GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách phòng học' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  // Org context used to validate the schoolId belongs to this org's campuses
  const orgCtx = await getOrganizationContext(check.userId)

  try {
    const body = await request.json() as {
      name: string
      capacity?: number
      type?: string
      floor?: number
      building?: string
      schoolId?: string
    }

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Tên phòng học là bắt buộc' }, { status: 400 })
    }

    // Validate schoolId (campusId) belongs to this org if provided
    if (orgCtx && body.schoolId && !orgCtx.campusIds.includes(body.schoolId)) {
      return NextResponse.json(
        { success: false, error: 'schoolId không thuộc tổ chức của bạn' },
        { status: 403 }
      )
    }

    const classroom = await prisma.classRoom.create({
      data: {
        name: body.name,
        capacity: body.capacity ?? 30,
        type: body.type ?? 'standard',
        floor: body.floor ?? null,
        building: body.building ?? null,
        schoolId: body.schoolId ?? null,
      },
    })

    return NextResponse.json({ success: true, data: classroom }, { status: 201 })
  } catch (error) {
    console.error('Classroom POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo phòng học' }, { status: 500 })
  }
}
