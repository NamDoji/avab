import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const { action } = await req.json() as { action: 'open' | 'close' }

  if (action !== 'open' && action !== 'close') {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  }

  const updated = await prisma.quizSet.update({
    where: { id },
    data:
      action === 'open'
        ? { status: 'open', openedAt: new Date() }
        : { status: 'closed', closedAt: new Date() },
  })

  return NextResponse.json({ success: true, data: updated })
}
