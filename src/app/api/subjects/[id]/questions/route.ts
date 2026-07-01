import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập' },
        { status: 401 }
      )
    }

    const { id } = await params

    const questions = await prisma.question.findMany({
      where: { subjectId: id },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        content: true,
        imageUrl: true,
        points: true,
        // Không trả correctAnswer cho client
      },
    })

    return NextResponse.json({ success: true, data: questions })
  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải câu hỏi' },
      { status: 500 }
    )
  }
}
