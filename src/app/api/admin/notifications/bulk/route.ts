import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { studentIds, title, message, type } = await req.json()
  if (!studentIds?.length || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Create in-app notifications for each student
  const data = studentIds.map((userId: string) => ({
    userId,
    type: type ?? 'INFO',
    title: title ?? 'Thông báo từ nhà trường',
    message,
  }))

  await prisma.notification.createMany({ data, skipDuplicates: true })
  return NextResponse.json({ sent: studentIds.length })
}
