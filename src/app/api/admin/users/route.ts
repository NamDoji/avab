import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 }
  return { session }
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as any } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { enrollments: true, answers: true } },
      },
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Admin get users error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách người dùng' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { userId, action } = await req.json()

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Thiếu userId hoặc action' },
        { status: 400 }
      )
    }

    if (action === 'reset-password') {
      const hashedPassword = await bcrypt.hash('123456', 12)
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })
      return NextResponse.json({ success: true, message: 'Đã reset mật khẩu về "123456"' })
    }

    return NextResponse.json(
      { success: false, error: 'Action không hợp lệ' },
      { status: 400 }
    )
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }
    console.error('Admin patch user error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật người dùng' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { name, phone, email, role } = await req.json()

    if (!phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập số điện thoại và email' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    })
    if (existing) {
      return NextResponse.json({
        success: false,
        error: existing.phone === phone ? 'Số điện thoại đã được đăng ký.' : 'Email đã được sử dụng.',
      }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash('123456', 12)
    const user = await prisma.user.create({
      data: {
        name: name || null,
        phone,
        email,
        password: hashedPassword,
        role: role || 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Admin create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo người dùng' },
      { status: 500 }
    )
  }
}
