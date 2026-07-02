import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, name: true, code: true } },
        materials: { orderBy: { createdAt: 'asc' } },
        questions: { orderBy: { order: 'asc' } },
        homeworkSets: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { questions: true } },
            questions: { orderBy: { order: 'asc' } },
          },
        },
        _count: { select: { questions: true } },
      },
    })

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy chuyên đề' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: subject })
  } catch (error) {
    console.error('Admin get subject error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải chuyên đề' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, icon, order, isActive, isPreview } = body

    const subject = await prisma.subject.update({
      where: { id },
      data: { name, description, icon, order, isActive, ...(isPreview !== undefined ? { isPreview } : {}) },
    })

    return NextResponse.json({ success: true, data: subject })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy chuyên đề' },
        { status: 404 }
      )
    }
    console.error('Admin update subject error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật chuyên đề' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    await prisma.subject.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Đã xoá chuyên đề' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy chuyên đề' },
        { status: 404 }
      )
    }
    console.error('Admin delete subject error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xoá chuyên đề' },
      { status: 500 }
    )
  }
}

// POST: Add a material to a subject
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { type, title, content, fileUrl, fileName } = body

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Thiếu loại tài liệu' },
        { status: 400 }
      )
    }

    const material = await prisma.subjectMaterial.create({
      data: {
        subjectId: id,
        type,
        title: title ?? null,
        content: content ?? null,   // ← bởi vậy HTML từ parse-theory không được lưu
        fileUrl: fileUrl ?? null,
        fileName: fileName ?? null,
      },
    })

    return NextResponse.json({ success: true, data: material })
  } catch (error) {
    console.error('Admin add material error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể thêm tài liệu' },
      { status: 500 }
    )
  }
}

// PATCH: Delete a material from a subject
export async function PATCH(
  request: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const body = await request.json()
    const { materialId } = body

    if (!materialId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu materialId' },
        { status: 400 }
      )
    }

    await prisma.subjectMaterial.delete({ where: { id: materialId } })
    return NextResponse.json({ success: true, message: 'Đã xoá tài liệu' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tài liệu' },
        { status: 404 }
      )
    }
    console.error('Admin delete material error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xoá tài liệu' },
      { status: 500 }
    )
  }
}
