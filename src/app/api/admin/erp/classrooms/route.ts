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

export async function GET() {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const classrooms = await prisma.classRoom.findMany({
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
