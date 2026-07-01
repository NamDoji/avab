import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const recruitments = await prisma.recruitment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: recruitments })
  } catch (error) {
    console.error('Get recruitment error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải thông tin tuyển dụng' },
      { status: 500 }
    )
  }
}
