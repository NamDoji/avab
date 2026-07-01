import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const subject = await prisma.subject.create({ data: body })
  return NextResponse.json({ success: true, data: subject })
}
