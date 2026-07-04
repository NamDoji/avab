import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SettingsTabs from './SettingsTabs'

export const metadata = { title: 'Cấu hình Thời khóa biểu — School ERP' }

const DEFAULT_LEVEL_CONFIGS = [
  {
    level: 'MN',
    levelName: 'Mầm non',
    periodsPerDay: 4,
    periodDuration: 30,
    breakAfterPeriod: 2,
    startTime: '07:30',
    workingDays: [1, 2, 3, 4, 5, 6],
    periodSchedule: [] as Array<{ period: number; start: string; end: string }>,
    subjectsPerWeek: {} as Record<string, number>,
  },
  {
    level: 'TH',
    levelName: 'Tiểu học',
    periodsPerDay: 5,
    periodDuration: 40,
    breakAfterPeriod: 3,
    startTime: '07:30',
    workingDays: [1, 2, 3, 4, 5, 6],
    periodSchedule: [] as Array<{ period: number; start: string; end: string }>,
    subjectsPerWeek: {} as Record<string, number>,
  },
  {
    level: 'THCS',
    levelName: 'THCS',
    periodsPerDay: 5,
    periodDuration: 45,
    breakAfterPeriod: null,
    startTime: '07:30',
    workingDays: [1, 2, 3, 4, 5],
    periodSchedule: [] as Array<{ period: number; start: string; end: string }>,
    subjectsPerWeek: {} as Record<string, number>,
  },
  {
    level: 'THPT',
    levelName: 'THPT',
    periodsPerDay: 5,
    periodDuration: 45,
    breakAfterPeriod: null,
    startTime: '07:30',
    workingDays: [1, 2, 3, 4, 5],
    periodSchedule: [] as Array<{ period: number; start: string; end: string }>,
    subjectsPerWeek: {} as Record<string, number>,
  },
]

interface PeriodSlot {
  period: number
  start: string
  end: string
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export default async function TimetableSettingsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const org = await prisma.organization.findFirst({ where: { slug: 'ob-school' } })
  const organizationId = org?.id ?? 'ob-school'

  // Fetch configs from DB
  const [dbLevelConfigs, dbHolidays, dbRules, dbTeachers, teacherSubjectRules] = await Promise.all([
    prisma.educationLevelConfig.findMany({
      where: { organizationId },
      orderBy: { level: 'asc' },
    }),
    prisma.holidayCalendar.findMany({
      where: { organizationId },
      orderBy: { startDate: 'asc' },
    }),
    prisma.timetableRule.findMany({
      where: { organizationId, ruleType: { not: 'teacher_subjects' } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: { id: true, name: true },
      take: 100,
    }),
    prisma.timetableRule.findMany({
      where: { organizationId, ruleType: 'teacher_subjects' },
    }),
  ])

  // Build level configs: merge DB with defaults
  const levelMap = new Map(dbLevelConfigs.map(c => [c.level, c]))
  const levelConfigs = DEFAULT_LEVEL_CONFIGS.map(def => {
    const db = levelMap.get(def.level)
    if (!db) return def
    return {
      id: db.id,
      level: db.level,
      levelName: db.levelName,
      periodsPerDay: db.periodsPerDay,
      periodDuration: db.periodDuration,
      breakAfterPeriod: db.breakAfterPeriod ?? null,
      startTime: db.startTime,
      workingDays: Array.isArray(db.workingDays) ? (db.workingDays as JsonValue[]).map(Number) : def.workingDays,
      periodSchedule: Array.isArray(db.periodSchedule) ? (db.periodSchedule as unknown as PeriodSlot[]) : [],
      subjectsPerWeek: (db.subjectsPerWeek && typeof db.subjectsPerWeek === 'object' && !Array.isArray(db.subjectsPerWeek))
        ? (db.subjectsPerWeek as Record<string, number>)
        : {},
    }
  })

  // Build teacher-subject map
  const teacherSubjectMap = new Map<string, string>(
    teacherSubjectRules.map(r => {
      const val = r.value as { subjects?: string[] }
      return [r.scopeValue ?? '', (val.subjects ?? []).join(', ')]
    })
  )

  const teachers = dbTeachers.map(t => ({
    id: t.id,
    name: t.name,
    subjects: teacherSubjectMap.get(t.id) ?? '',
  }))

  // Serialize holidays to plain objects for client
  const holidays = dbHolidays.map(h => ({
    id: h.id,
    name: h.name,
    startDate: h.startDate.toISOString(),
    endDate: h.endDate.toISOString(),
    type: h.type,
    campusId: h.campusId,
    isRecurring: h.isRecurring,
  }))

  const rules = dbRules.map(r => ({
    id: r.id,
    ruleType: r.ruleType,
    ruleScope: r.ruleScope,
    scopeValue: r.scopeValue,
    value: r.value as Record<string, unknown>,
    isActive: r.isActive,
    description: r.description,
  }))

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(25%, -50%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.2)', transform: 'translate(-25%, 50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-indigo-300 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <Link href="/admin/erp/timetable" className="hover:text-white transition-colors">Thời khóa biểu</Link>
            <span>/</span>
            <span>Cấu hình</span>
          </div>
          <h1 className="text-3xl font-black mb-2">⚙️ Cấu hình Thời khóa biểu</h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            Định nghĩa tiết học, ngày nghỉ và quy tắc theo trường — AI sẽ dùng dữ liệu này để xếp TKB
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <SettingsTabs
          levelConfigs={levelConfigs}
          holidays={holidays}
          rules={rules}
          teachers={teachers}
        />
      </div>
    </div>
  )
}
