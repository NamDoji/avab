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

// POST /api/admin/courses/[id]/students/[userId]/reset-password
// Reset mật khẩu học viên về "123456"
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const { userId } = await params

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy học viên' }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash('123456', 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, message: 'Đã reset mật khẩu về 123456' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Không thể reset mật khẩu' }, { status: 500 })
  }
}
