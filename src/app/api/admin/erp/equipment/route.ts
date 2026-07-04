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
  const campusId = searchParams.get('campusId')
  const category = searchParams.get('category')

  try {
    const equipment = await prisma.equipment.findMany({
      where: {
        ...(campusId ? { campusId } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json({ success: true, data: equipment })
  } catch (error) {
    console.error('Equipment GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách thiết bị' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      id?: string
      organizationId?: string
      campusId?: string
      name: string
      code?: string
      category: string
      quantity?: number
      status?: string
      location?: string
      purchaseDate?: string
      purchasePrice?: number
      notes?: string
    }

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Tên thiết bị là bắt buộc' }, { status: 400 })
    }

    if (body.id) {
      // Update
      const item = await prisma.equipment.update({
        where: { id: body.id },
        data: {
          name: body.name,
          code: body.code ?? null,
          category: body.category ?? 'other',
          quantity: body.quantity ?? 1,
          status: body.status ?? 'active',
          location: body.location ?? null,
          purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
          purchasePrice: body.purchasePrice ?? null,
          notes: body.notes ?? null,
          campusId: body.campusId ?? null,
          organizationId: body.organizationId ?? null,
        },
      })
      return NextResponse.json({ success: true, data: item })
    }

    // Create
    const item = await prisma.equipment.create({
      data: {
        organizationId: body.organizationId ?? null,
        campusId: body.campusId ?? null,
        name: body.name,
        code: body.code ?? null,
        category: body.category ?? 'other',
        quantity: body.quantity ?? 1,
        status: body.status ?? 'active',
        location: body.location ?? null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchasePrice: body.purchasePrice ?? null,
        notes: body.notes ?? null,
      },
    })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Equipment POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể lưu thiết bị' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: 'id là bắt buộc' }, { status: 400 })

  try {
    await prisma.equipment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Equipment DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xóa thiết bị' }, { status: 500 })
  }
}
