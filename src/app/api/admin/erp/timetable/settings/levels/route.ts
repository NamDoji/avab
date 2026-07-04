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
    const configs = await prisma.educationLevelConfig.findMany({
      where: { organizationId },
      orderBy: { level: 'asc' },
    })
    return NextResponse.json({ success: true, data: configs })
  } catch (error) {
    console.error('[timetable/settings/levels] GET error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải cấu hình cấp học' }, { status: 500 })
  }
}

interface LevelConfigBody {
  level: string
  levelName: string
  periodsPerDay?: number
  periodDuration?: number
  breakAfterPeriod?: number | null
  startTime?: string
  workingDays?: number[]
  periodSchedule?: Array<{ period: number; start: string; end: string }>
  subjectsPerWeek?: Record<string, number>
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  try {
    const body = await request.json() as LevelConfigBody

    if (!body.level || !body.levelName) {
      return NextResponse.json({ success: false, error: 'level và levelName là bắt buộc' }, { status: 400 })
    }

    const organizationId = await getOrgId()

    const config = await prisma.educationLevelConfig.upsert({
      where: { organizationId_level: { organizationId, level: body.level } },
      create: {
        organizationId,
        level: body.level,
        levelName: body.levelName,
        periodsPerDay: body.periodsPerDay ?? 5,
        periodDuration: body.periodDuration ?? 45,
        breakAfterPeriod: body.breakAfterPeriod ?? null,
        startTime: body.startTime ?? '07:30',
        workingDays: body.workingDays ?? [1, 2, 3, 4, 5],
        periodSchedule: body.periodSchedule ?? undefined,
        subjectsPerWeek: body.subjectsPerWeek ?? undefined,
      },
      update: {
        levelName: body.levelName,
        periodsPerDay: body.periodsPerDay ?? 5,
        periodDuration: body.periodDuration ?? 45,
        breakAfterPeriod: body.breakAfterPeriod ?? null,
        startTime: body.startTime ?? '07:30',
        workingDays: body.workingDays ?? [1, 2, 3, 4, 5],
        periodSchedule: body.periodSchedule ?? undefined,
        subjectsPerWeek: body.subjectsPerWeek ?? undefined,
      },
    })

    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('[timetable/settings/levels] POST error:', error)
    return NextResponse.json({ success: false, error: 'Không thể lưu cấu hình cấp học' }, { status: 500 })
  }
}
