import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  try {
    if (userId) {
      const record = await prisma.healthRecord.findUnique({ where: { userId } })
      return NextResponse.json({ success: true, data: record })
    }

    const records = await prisma.healthRecord.findMany({
      orderBy: { lastUpdated: 'desc' },
    })
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('Health GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải hồ sơ sức khỏe' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      userId: string
      bloodType?: string
      allergies?: string
      conditions?: string
      medications?: string
      emergencyContact?: string
      emergencyPhone?: string
      insuranceNo?: string
      insuranceProvider?: string
      insuranceExpiry?: string
    }

    if (!body.userId) {
      return NextResponse.json({ success: false, error: 'userId là bắt buộc' }, { status: 400 })
    }

    const record = await prisma.healthRecord.upsert({
      where: { userId: body.userId },
      update: {
        bloodType: body.bloodType ?? null,
        allergies: body.allergies ?? null,
        conditions: body.conditions ?? null,
        medications: body.medications ?? null,
        emergencyContact: body.emergencyContact ?? null,
        emergencyPhone: body.emergencyPhone ?? null,
        insuranceNo: body.insuranceNo ?? null,
        insuranceProvider: body.insuranceProvider ?? null,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
        lastUpdated: new Date(),
      },
      create: {
        userId: body.userId,
        bloodType: body.bloodType ?? null,
        allergies: body.allergies ?? null,
        conditions: body.conditions ?? null,
        medications: body.medications ?? null,
        emergencyContact: body.emergencyContact ?? null,
        emergencyPhone: body.emergencyPhone ?? null,
        insuranceNo: body.insuranceNo ?? null,
        insuranceProvider: body.insuranceProvider ?? null,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
      },
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('Health PUT error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật hồ sơ' }, { status: 500 })
  }
}
