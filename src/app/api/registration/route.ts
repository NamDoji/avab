import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, note, message, type } = await req.json()

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập số điện thoại.' }, { status: 400 })
    }

    await prisma.registration.create({
      data: {
        name,
        phone,
        email,
        note: note || message,
        type: type || 'CONTACT',
        status: 'NEW',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Đã nhận! Chúng tôi sẽ liên hệ sớm.',
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
