import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

export async function GET(req: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const type   = searchParams.get('type')   || undefined

  const contacts = await prisma.registration.findMany({
    where: { ...(status ? { status } : {}), ...(type ? { type } : {}) },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: contacts })
}
