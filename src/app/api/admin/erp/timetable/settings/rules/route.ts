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

async function getOrgId(): Promise<string> {
  const org = await prisma.organization.findFirst({ where: { slug: 'ob-school' } })
  return org?.id ?? 'ob-school'
}

export async function GET() {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const organizationId = await getOrgId()
    const rules = await prisma.timetableRule.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: rules })
  } catch (error) {
    console.error('[timetable/settings/rules] GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải quy tắc' }, { status: 500 })
  }
}

interface RuleBody {
  ruleType: string
  ruleScope?: string
  scopeValue?: string | null
  value: Record<string, unknown>
  description?: string
  campusId?: string | null
  isActive?: boolean
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const body = await request.json() as RuleBody

    if (!body.ruleType || !body.value) {
      return NextResponse.json({ success: false, error: 'ruleType và value là bắt buộc' }, { status: 400 })
    }

    const organizationId = await getOrgId()

    const rule = await prisma.timetableRule.create({
      data: {
        organizationId,
        campusId: body.campusId ?? null,
        ruleType: body.ruleType,
        ruleScope: body.ruleScope ?? 'all',
        scopeValue: body.scopeValue ?? null,
        value: body.value as import('@prisma/client').Prisma.InputJsonValue,
        description: body.description ?? null,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json({ success: true, data: rule })
  } catch (error) {
    console.error('[timetable/settings/rules] POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo quy tắc' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const body = await request.json() as { id: string; isActive: boolean }

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id là bắt buộc' }, { status: 400 })
    }

    const organizationId = await getOrgId()
    const existing = await prisma.timetableRule.findFirst({
      where: { id: body.id, organizationId },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy quy tắc' }, { status: 404 })
    }

    const rule = await prisma.timetableRule.update({
      where: { id: body.id },
      data: { isActive: body.isActive },
    })

    return NextResponse.json({ success: true, data: rule })
  } catch (error) {
    console.error('[timetable/settings/rules] PUT error:', error)
    return NextResponse.json({ success: false, error: 'Không thể cập nhật quy tắc' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id là bắt buộc' }, { status: 400 })
    }

    const organizationId = await getOrgId()
    const existing = await prisma.timetableRule.findFirst({
      where: { id, organizationId },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy quy tắc' }, { status: 404 })
    }

    await prisma.timetableRule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[timetable/settings/rules] DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Không thể xóa quy tắc' }, { status: 500 })
  }
}
