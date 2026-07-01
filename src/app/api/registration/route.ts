import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, note } = await req.json()

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập số điện thoại.' }, { status: 400 })
    }

    await prisma.registration.create({
      data: { name, phone, email, note },
    })

    return NextResponse.json({
      success: true,
      message: 'Đã nhận đăng ký! Chúng tôi sẽ liên hệ sớm.',
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
