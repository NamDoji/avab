import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true, isPublic: true },
      include: {
        _count: { select: { subjects: true, enrollments: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, data: courses })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const course = await prisma.course.create({ data: body })
    return NextResponse.json({ success: true, data: course })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
