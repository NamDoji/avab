import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'
import bcrypt from 'bcryptjs'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  const role = (session.user as any).role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return { session, userId, orgCtx }
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json(
      { success: false, error: check.error },
      { status: check.status }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    // Scope users to org via OrganizationUser join; null orgCtx = super-admin (no filter)
    const orgFilter = check.orgCtx
      ? { organizationUsers: { some: { organizationId: check.orgCtx.id } } }
      : {}

    const users = await prisma.user.findMany({
      where: {
        ...orgFilter,
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
      take: 500,
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
  const check = await requireAdmin(req)
  if ('error' in check) {
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

    // Ownership check: ADMIN chỉ thác tác user trong org của mình
    if (check.orgCtx) {
      const member = await prisma.organizationUser.findFirst({
        where: { userId, organizationId: check.orgCtx.id },
      })
      if (!member) return NextResponse.json({ success: false, error: 'Người dùng không thuộc tổ chức này' }, { status: 403 })
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

// PUT — cập nhật thông tin user
export async function PUT(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const { userId, name, phone, email, role, isActive } = await req.json()
    if (!userId) return NextResponse.json({ success: false, error: 'Thiếu userId' }, { status: 400 })

    // Ownership check: ADMIN chỉ sửa user trong org của mình
    if (check.orgCtx) {
      const member = await prisma.organizationUser.findFirst({
        where: { userId, organizationId: check.orgCtx.id },
      })
      if (!member) return NextResponse.json({ success: false, error: 'Người dùng không thuộc tổ chức này' }, { status: 403 })
    }

    // Kiểm tra trùng sĐT / email (ngoại trừ chính user đang sửa)
    if (phone || email) {
      const conflict = await prisma.user.findFirst({
        where: {
          NOT: { id: userId },
          OR: [
            ...(phone ? [{ phone }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      })
      if (conflict) {
        return NextResponse.json({
          success: false,
          error: conflict.phone === phone ? 'Số điện thoại đã được dùng.' : 'Email đã được dùng.',
        }, { status: 409 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name: name || null } : {}),
        ...(phone ? { phone } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
        ...(role ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      select: { id: true, name: true, phone: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { enrollments: true, answers: true } } },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 })
    console.error('Admin update user error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật' }, { status: 500 })
  }
}

// DELETE — xóa user
export async function DELETE(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ success: false, error: 'Thiếu userId' }, { status: 400 })

    // Ownership check: ADMIN chỉ xóa user trong org của mình
    if (check.orgCtx) {
      const member = await prisma.organizationUser.findFirst({
        where: { userId, organizationId: check.orgCtx.id },
      })
      if (!member) return NextResponse.json({ success: false, error: 'Người dùng không thuộc tổ chức này' }, { status: 403 })
      // Chỉ xóa khỏi org, không xóa user khỏi hệ thống (an toàn hơn)
      await prisma.organizationUser.deleteMany({ where: { userId, organizationId: check.orgCtx.id } })
      return NextResponse.json({ success: true })
    }

    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 })
    console.error('Admin delete user error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xóa người dùng' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check) {
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

    // Gắn user vào org của admin (nếu có org context)
    if (check.orgCtx) {
      await prisma.organizationUser.upsert({
        where: { organizationId_userId: { organizationId: check.orgCtx.id, userId: user.id } },
        create: {
          organizationId: check.orgCtx.id,
          userId: user.id,
          orgRole: 'MEMBER',
          isDefault: true,
        },
        update: {},
      })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Admin create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo người dùng' },
      { status: 500 }
    )
  }
}
