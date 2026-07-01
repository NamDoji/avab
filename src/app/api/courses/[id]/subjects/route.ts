import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const subjects = await prisma.subject.findMany({
      where: { courseId: id, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        materials: { orderBy: { createdAt: 'asc' } },
        _count: { select: { questions: true } },
      },
    })

    return NextResponse.json({ success: true, data: subjects })
  } catch (error) {
    console.error('Get subjects error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách chuyên đề' },
      { status: 500 }
    )
  }
}
