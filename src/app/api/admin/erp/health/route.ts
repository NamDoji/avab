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
  const studentId = searchParams.get('studentId')

  try {
    if (studentId) {
      const record = await prisma.healthRecord.findUnique({
        where: { studentId },
        include: { student: { select: { id: true, name: true, phone: true } } },
      })
      return NextResponse.json({ success: true, data: record })
    }

    const records = await prisma.healthRecord.findMany({
      include: { student: { select: { id: true, name: true, phone: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('Health GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải hồ sơ sức khỏe' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      studentId: string
      organizationId?: string
      bloodType?: string
      allergies?: string
      conditions?: string
      emergencyContact?: string
      emergencyPhone?: string
      insuranceNo?: string
      insuranceExpiry?: string
      lastCheckup?: string
      notes?: string
    }

    if (!body.studentId) {
      return NextResponse.json({ success: false, error: 'studentId là bắt buộc' }, { status: 400 })
    }

    const record = await prisma.healthRecord.upsert({
      where: { studentId: body.studentId },
      create: {
        studentId: body.studentId,
        organizationId: body.organizationId ?? null,
        bloodType: body.bloodType ?? null,
        allergies: body.allergies ?? null,
        conditions: body.conditions ?? null,
        emergencyContact: body.emergencyContact ?? null,
        emergencyPhone: body.emergencyPhone ?? null,
        insuranceNo: body.insuranceNo ?? null,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
        lastCheckup: body.lastCheckup ? new Date(body.lastCheckup) : null,
        notes: body.notes ?? null,
      },
      update: {
        organizationId: body.organizationId ?? null,
        bloodType: body.bloodType ?? null,
        allergies: body.allergies ?? null,
        conditions: body.conditions ?? null,
        emergencyContact: body.emergencyContact ?? null,
        emergencyPhone: body.emergencyPhone ?? null,
        insuranceNo: body.insuranceNo ?? null,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
        lastCheckup: body.lastCheckup ? new Date(body.lastCheckup) : null,
        notes: body.notes ?? null,
      },
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('Health POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể lưu hồ sơ sức khỏe' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
}
