import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function requireStudent() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  const userId = (session.user as { id?: string })?.id
  if (!userId) return { error: 'Phiên đăng nhập không hợp lệ', status: 401 as const }
  return { session, userId }
}

/**
 * GET /api/student/profile
 * Returns the current user's profile + learner profile
 */
export async function GET() {
  const check = await requireStudent()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const user = await prisma.user.findUnique({
      where:  { id: check.userId },
      select: {
        id:            true,
        name:          true,
        email:         true,
        phone:         true,
        avatar:        true,
        role:          true,
        createdAt:     true,
        learnerProfile: {
          select: {
            backgroundLevel:   true,
            learningStyle:     true,
            selfStudyCapacity: true,
            parentInvolvement: true,
            weeklyHours:       true,
            targetSchool:      true,
            targetGoal:        true,
            additionalNotes:   true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('GET /api/student/profile error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải hồ sơ' }, { status: 500 })
  }
}

/**
 * PUT /api/student/profile
 * Update name, avatar, phone, password, notification/learning preferences
 */
export async function PUT(request: NextRequest) {
  const check = await requireStudent()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      name?:              string
      avatar?:            string
      phone?:             string
      currentPassword?:   string
      newPassword?:       string
      // Learner profile fields
      backgroundLevel?:   string
      learningStyle?:     string
      weeklyHours?:       number
      targetSchool?:      string
      targetGoal?:        string
      additionalNotes?:   string
    }

    const userUpdate: Record<string, unknown> = {}
    if (body.name   !== undefined) userUpdate.name   = body.name.trim()
    if (body.avatar !== undefined) userUpdate.avatar = body.avatar.trim() || null
    if (body.phone  !== undefined) {
      // Validate phone
      if (!/^\+?[\d\s-]{9,15}$/.test(body.phone)) {
        return NextResponse.json(
          { success: false, error: 'Số điện thoại không hợp lệ' },
          { status: 400 }
        )
      }
      userUpdate.phone = body.phone.trim()
    }

    // Handle password change
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng nhập mật khẩu hiện tại' },
          { status: 400 }
        )
      }
      if (body.newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu mới phải có ít nhất 8 ký tự' },
          { status: 400 }
        )
      }

      const existing = await prisma.user.findUnique({
        where:  { id: check.userId },
        select: { password: true },
      })
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Người dùng không tồn tại' }, { status: 404 })
      }

      const valid = await bcrypt.compare(body.currentPassword, existing.password)
      if (!valid) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu hiện tại không chính xác' },
          { status: 400 }
        )
      }

      userUpdate.password = await bcrypt.hash(body.newPassword, 12)
    }

    // Learner profile upsert data
    const profileFields: Record<string, unknown> = {}
    if (body.backgroundLevel !== undefined) profileFields.backgroundLevel = body.backgroundLevel
    if (body.learningStyle   !== undefined) profileFields.learningStyle   = body.learningStyle
    if (body.weeklyHours     !== undefined) profileFields.weeklyHours     = Number(body.weeklyHours)
    if (body.targetSchool    !== undefined) profileFields.targetSchool    = body.targetSchool.trim() || null
    if (body.targetGoal      !== undefined) profileFields.targetGoal      = body.targetGoal
    if (body.additionalNotes !== undefined) profileFields.additionalNotes = body.additionalNotes.trim() || null

    // Run updates in transaction
    await prisma.$transaction(async tx => {
      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: check.userId },
          data:  userUpdate,
        })
      }

      if (Object.keys(profileFields).length > 0) {
        await tx.learnerProfile.upsert({
          where:  { userId: check.userId },
          update: profileFields,
          create: { userId: check.userId, ...profileFields },
        })
      }
    })

    return NextResponse.json({ success: true, message: 'Đã cập nhật hồ sơ' })
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { target?: string[] } }
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] ?? 'field'
      return NextResponse.json(
        { success: false, error: `${field} đã được sử dụng bởi tài khoản khác` },
        { status: 409 }
      )
    }
    console.error('PUT /api/student/profile error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật hồ sơ' }, { status: 500 })
  }
}
