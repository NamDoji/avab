import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id: subjectId } = await params

  const quizSets = await prisma.quizSet.findMany({
    where: { subjectId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  })

  return NextResponse.json({ success: true, data: quizSets })
}
