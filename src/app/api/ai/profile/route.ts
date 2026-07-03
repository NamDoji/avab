import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Lấy hồ sơ người học (P_i + G_i trong A2PLM)
export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  const userId = (session.user as any).id
  const profile = await prisma.learnerProfile.findUnique({ where: { userId } }).catch(() => null)

  return NextResponse.json({ success: true, data: profile })
}

// Tạo / cập nhật hồ sơ người học
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id
    const body = await req.json()

    const {
      backgroundLevel,
      learningStyle,
      selfStudyCapacity,
      parentInvolvement,
      weeklyHours,
      targetSchool,
      targetDate,
      targetGoal,
      additionalNotes,
    } = body

    const profile = await prisma.learnerProfile.upsert({
      where: { userId },
      create: {
        userId,
        backgroundLevel: backgroundLevel ?? 'BEGINNER',
        learningStyle: learningStyle ?? 'MIXED',
        selfStudyCapacity: selfStudyCapacity ?? 'MEDIUM',
        parentInvolvement: parentInvolvement ?? 'MEDIUM',
        weeklyHours: weeklyHours ? Number(weeklyHours) : 5,
        targetSchool: targetSchool ?? null,
        targetDate: targetDate ? new Date(targetDate) : null,
        targetGoal: targetGoal ?? 'SCHOLARSHIP',
        additionalNotes: additionalNotes ?? null,
      },
      update: {
        ...(backgroundLevel !== undefined && { backgroundLevel }),
        ...(learningStyle !== undefined && { learningStyle }),
        ...(selfStudyCapacity !== undefined && { selfStudyCapacity }),
        ...(parentInvolvement !== undefined && { parentInvolvement }),
        ...(weeklyHours !== undefined && { weeklyHours: Number(weeklyHours) }),
        ...(targetSchool !== undefined && { targetSchool }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(targetGoal !== undefined && { targetGoal }),
        ...(additionalNotes !== undefined && { additionalNotes }),
      },
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (err) {
    console.error('Profile update error:', err)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật hồ sơ' }, { status: 500 })
  }
}
