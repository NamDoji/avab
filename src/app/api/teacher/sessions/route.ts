import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }
  if ((session.user as any).role !== 'TEACHER') {
    return NextResponse.json({ success: false, error: 'Không có quyền' }, { status: 403 })
  }

  const userId = (session.user as any).id as string

  const sessions = await prisma.sessionFeedback.findMany({
    where: { createdBy: userId },
    orderBy: { sessionDate: 'desc' },
    include: {
      subject: true,
      records: { select: { id: true, attendance: true, aiComment: true } },
    },
  })

  return NextResponse.json({ success: true, data: sessions })
}
