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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { questionType, content, imageUrl, audioUrl, options, correctAnswer, explanation, points, order } = body

    const updateData: any = {}
    if (questionType !== undefined) updateData.questionType = questionType
    if (content !== undefined) updateData.content = content
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl
    if (options !== undefined) updateData.options = options
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer
    if (explanation !== undefined) updateData.explanation = explanation
    if (points !== undefined) updateData.points = points
    if (order !== undefined) updateData.order = order

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: question })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Không tìm thấy câu hỏi' }, { status: 404 })
    }
    console.error('Update question error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật câu hỏi' }, { status: 500 })
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

  try {
    const { id } = await params
    await prisma.question.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Đã xoá câu hỏi' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Không tìm thấy câu hỏi' }, { status: 404 })
    }
    console.error('Delete question error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xoá câu hỏi' }, { status: 500 })
  }
}
