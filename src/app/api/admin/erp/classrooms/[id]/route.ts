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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { id } = await params

  try {
    const body = await request.json() as {
      name?: string
      capacity?: number
      type?: string
      floor?: number
      building?: string
      isActive?: boolean
    }

    const classroom = await prisma.classRoom.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.floor !== undefined && { floor: body.floor }),
        ...(body.building !== undefined && { building: body.building }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json({ success: true, data: classroom })
  } catch (error) {
    console.error('Classroom PUT error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật phòng học' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { id } = await params

  try {
    await prisma.classRoom.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Classroom DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xoá phòng học' }, { status: 500 })
  }
}
