import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const course = await prisma.course.findUnique({
      where: { id, isPublic: true },
      include: {
        subjects: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { questions: true, materials: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khoá học' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải khoá học' },
      { status: 500 }
    )
  }
}
