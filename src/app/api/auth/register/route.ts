import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

function generatePassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function sendWelcomeEmail(email: string, name: string, phone: string, password: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: '🎉 Chào mừng bạn đến với AvaB!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7C3AED, #14B8A6); border-radius: 16px; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🏆 AvaB</h1>
          <p style="margin: 8px 0 0; opacity: 0.8;">avab.vn — Luyện Thi Học Bổng Lớp 1</p>
        </div>
        <div style="padding: 24px 0;">
          <h2>Xin chào ${name}! 👋</h2>
          <p>Tài khoản AvaB của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:</p>
          <div style="background: #F5F3FF; border: 2px solid #A78BFA; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>🔑 Số điện thoại:</strong> ${phone}</p>
            <p style="margin: 4px 0;"><strong>🔐 Mật khẩu:</strong> <code style="background: white; padding: 2px 8px; border-radius: 4px; font-size: 16px; font-weight: bold;">${password}</code></p>
          </div>
          <p style="color: #666; font-size: 14px;">⚠️ Lưu ý: Đây là mật khẩu tự động tạo. Bạn có thể đổi mật khẩu sau khi đăng nhập.</p>
          <a href="https://avab.vn/dang-nhap" 
             style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Đăng nhập ngay 🚀
          </a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">© 2024 AvaB · avab.vn</p>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email } = await req.json()

    if (!phone || !email) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập số điện thoại và email.' }, { status: 400 })
    }

    // Check duplicate
    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    })
    if (existing) {
      return NextResponse.json({
        success: false,
        error: existing.phone === phone ? 'Số điện thoại đã được đăng ký.' : 'Email đã được sử dụng.',
      }, { status: 409 })
    }

    const password = "123456"  // Mật khẩu mặc định, phụ huynh đổi sau khi đăng nhập
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: { name, phone, email, password: hashedPassword, role: 'STUDENT' },
    })

    // Send welcome email (best-effort)
    try {
      await sendWelcomeEmail(email, name || 'bạn', phone, password)
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
      // Non-fatal — user created, just couldn't email
    }

    return NextResponse.json({
      success: true,
      message: `Tài khoản đã được tạo! Mật khẩu đã gửi đến email ${email}.`,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Lỗi server. Vui lòng thử lại.' }, { status: 500 })
  }
}
