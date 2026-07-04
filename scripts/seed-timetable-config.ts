/**
 * Seed: Timetable Configuration cho OB School
 * Seeds:
 *  - EducationLevelConfig (MN, TH, THCS, THPT)
 *  - HolidayCalendar (ngày nghỉ năm học 2025-2026)
 *  - TimetableRule (quy tắc mặc định)
 *
 * Chạy:
 *   export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/seed-timetable-config.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: [] })

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function generateSchedule(
  startTime: string,
  periodsPerDay: number,
  periodDuration: number,
  breakAfterPeriod?: number | null
): Array<{ period: number; start: string; end: string }> {
  const slots = []
  let current = startTime
  for (let i = 1; i <= periodsPerDay; i++) {
    const start = current
    const end = addMinutes(current, periodDuration)
    slots.push({ period: i, start, end })
    const gap = breakAfterPeriod && i === breakAfterPeriod ? 20 : 5
    current = addMinutes(end, gap)
  }
  return slots
}

const LEVEL_CONFIGS = [
  {
    level: 'MN',
    levelName: 'Mầm non',
    periodsPerDay: 4,
    periodDuration: 30,
    breakAfterPeriod: 2,
    startTime: '07:30',
    workingDays: [1, 2, 3, 4, 5, 6], // T2-T7
    subjectsPerWeek: {
      GENERAL: 4,
      MUSIC: 2,
      ART: 2,
      PE: 2,
    },
  },
  {
    level: 'TH',
    levelName: 'Tiểu học',
    periodsPerDay: 5,
    periodDuration: 40,
    breakAfterPeriod: 3,
    startTime: '07:30',
    workingDays: [1, 2, 3, 4, 5, 6], // T2-T7
    subjectsPerWeek: {
      MATH: 5,
      VIET: 5,
      ENGLISH: 4,
      SCIENCE: 2,
      ART: 1,
      MUSIC: 1,
      PE: 2,
    },
  },
  {
    level: 'THCS',
    levelName: 'THCS',
    periodsPerDay: 5,
    periodDuration: 45,
    breakAfterPeriod: null,
    startTime: '07:30',
    workingDays: [1, 2, 3, 4, 5], // T2-T6
    subjectsPerWeek: {
      MATH: 5,
      LIT: 4,
      ENGLISH: 4,
      PHYSICS: 3,
      CHEMISTRY: 2,
      BIOLOGY: 2,
      HISTORY: 2,
      GEO: 2,
      PE: 2,
    },
  },
  {
    level: 'THPT',
    levelName: 'THPT',
    periodsPerDay: 5,
    periodDuration: 45,
    breakAfterPeriod: null,
    startTime: '07:30',
    workingDays: [1, 2, 3, 4, 5], // T2-T6
    subjectsPerWeek: {
      MATH: 5,
      LIT: 4,
      ENGLISH: 4,
      PHYSICS: 3,
      CHEMISTRY: 3,
      BIOLOGY: 2,
      HISTORY: 2,
      GEO: 2,
      PE: 2,
      CIVIC: 1,
    },
  },
]

const DEFAULT_HOLIDAYS = [
  { name: 'Tết Dương lịch', start: '2026-01-01', end: '2026-01-01', type: 'holiday' },
  { name: 'Tết Nguyên Đán', start: '2026-01-26', end: '2026-02-01', type: 'holiday' },
  { name: 'Nghỉ giữa học kỳ II', start: '2026-03-02', end: '2026-03-06', type: 'holiday' },
  { name: 'Giỗ Tổ Hùng Vương', start: '2026-04-16', end: '2026-04-16', type: 'holiday' },
  { name: '30/4 - 1/5', start: '2026-04-30', end: '2026-05-01', type: 'holiday' },
  { name: 'Thi cuối kỳ II', start: '2026-05-18', end: '2026-05-29', type: 'exam' },
  { name: 'Quốc khánh', start: '2026-09-02', end: '2026-09-02', type: 'holiday' },
  { name: 'Khai giảng năm học mới', start: '2026-09-05', end: '2026-09-05', type: 'event' },
  { name: 'Nghỉ giữa học kỳ I', start: '2026-10-12', end: '2026-10-16', type: 'holiday' },
  { name: 'Thi cuối kỳ I', start: '2026-12-14', end: '2026-12-25', type: 'exam' },
]

const DEFAULT_RULES = [
  {
    ruleType: 'teacher_max_periods',
    ruleScope: 'all',
    value: { maxPeriods: 6 },
    description: 'Giáo viên không dạy quá 6 tiết/ngày',
  },
  {
    ruleType: 'no_double_subject',
    ruleScope: 'all',
    value: { enabled: true, subjects: ['MATH', 'LIT', 'VIET'] },
    description: 'Không xếp 2 tiết Toán/Văn liên tiếp trong ngày',
  },
  {
    ruleType: 'prefer_morning_core',
    ruleScope: 'all',
    value: { preferMorning: true, coreSubjects: ['MATH', 'LIT', 'VIET', 'ENGLISH'] },
    description: 'Ưu tiên tiết đầu buổi sáng cho môn chính (Toán, Văn, Anh)',
  },
  {
    ruleType: 'separate_exam_days',
    ruleScope: 'all',
    value: { enabled: true },
    description: 'Tách môn thi theo ngày khác nhau — không thi 2 môn cùng ngày',
  },
  {
    ruleType: 'no_split_sessions',
    ruleScope: 'all',
    value: { enabled: true },
    description: 'Giáo viên không dạy cả buổi sáng lẫn chiều cùng ngày',
  },
  {
    ruleType: 'mn_max_time',
    ruleScope: 'level',
    scopeValue: 'MN',
    value: { maxTime: '11:30' },
    description: 'Lớp mầm non không học sau 11:30',
  },
]

async function main() {
  console.log('🏫  Seeding Timetable Configuration for OB School...\n')

  // Find org
  const org = await prisma.organization.findFirst({ where: { slug: 'ob-school' } })
  if (!org) {
    console.error('❌ Không tìm thấy OB School org. Chạy seed-ob-school.ts trước.')
    process.exit(1)
  }

  const organizationId = org.id
  console.log(`✅ Org: ${org.name} (${organizationId})`)

  // 1. Seed EducationLevelConfig
  console.log('\n📚 Seeding EducationLevelConfig...')
  for (const lc of LEVEL_CONFIGS) {
    const periodSchedule = generateSchedule(lc.startTime, lc.periodsPerDay, lc.periodDuration, lc.breakAfterPeriod)
    await prisma.educationLevelConfig.upsert({
      where: { organizationId_level: { organizationId, level: lc.level } },
      create: {
        organizationId,
        level: lc.level,
        levelName: lc.levelName,
        periodsPerDay: lc.periodsPerDay,
        periodDuration: lc.periodDuration,
        breakAfterPeriod: lc.breakAfterPeriod ?? null,
        startTime: lc.startTime,
        workingDays: lc.workingDays,
        periodSchedule,
        subjectsPerWeek: lc.subjectsPerWeek,
      },
      update: {
        levelName: lc.levelName,
        periodsPerDay: lc.periodsPerDay,
        periodDuration: lc.periodDuration,
        breakAfterPeriod: lc.breakAfterPeriod ?? null,
        startTime: lc.startTime,
        workingDays: lc.workingDays,
        periodSchedule,
        subjectsPerWeek: lc.subjectsPerWeek,
      },
    })
    console.log(`   ✅ ${lc.levelName} (${lc.level}): ${lc.periodsPerDay} tiết/ngày, ${lc.periodDuration} phút/tiết`)
  }

  // 2. Seed HolidayCalendar
  console.log('\n📅 Seeding HolidayCalendar...')
  let holidayCount = 0
  for (const h of DEFAULT_HOLIDAYS) {
    // Check if exists (by name + org)
    const existing = await prisma.holidayCalendar.findFirst({
      where: { organizationId, name: h.name },
    })
    if (!existing) {
      await prisma.holidayCalendar.create({
        data: {
          organizationId,
          name: h.name,
          startDate: new Date(h.start),
          endDate: new Date(h.end),
          type: h.type,
          isRecurring: false,
        },
      })
      holidayCount++
      console.log(`   ✅ ${h.name}: ${h.start} → ${h.end} (${h.type})`)
    } else {
      console.log(`   ⏭️  ${h.name}: đã có`)
    }
  }
  console.log(`   📊 Tạo mới: ${holidayCount} / ${DEFAULT_HOLIDAYS.length}`)

  // 3. Seed TimetableRules
  console.log('\n📏 Seeding TimetableRules...')
  let ruleCount = 0
  for (const rule of DEFAULT_RULES) {
    const existing = await prisma.timetableRule.findFirst({
      where: { organizationId, ruleType: rule.ruleType, scopeValue: rule.scopeValue ?? null },
    })
    if (!existing) {
      await prisma.timetableRule.create({
        data: {
          organizationId,
          ruleType: rule.ruleType,
          ruleScope: rule.ruleScope,
          scopeValue: rule.scopeValue ?? null,
          value: rule.value,
          description: rule.description,
          isActive: true,
        },
      })
      ruleCount++
      console.log(`   ✅ ${rule.description}`)
    } else {
      console.log(`   ⏭️  ${rule.ruleType}: đã có`)
    }
  }
  console.log(`   📊 Tạo mới: ${ruleCount} / ${DEFAULT_RULES.length}`)

  // Summary
  const [totalLevels, totalHolidays, totalRules] = await Promise.all([
    prisma.educationLevelConfig.count({ where: { organizationId } }),
    prisma.holidayCalendar.count({ where: { organizationId } }),
    prisma.timetableRule.count({ where: { organizationId } }),
  ])

  console.log('\n🎉 Timetable Configuration seeded successfully!')
  console.log(`   📚 Level configs: ${totalLevels}`)
  console.log(`   📅 Holidays: ${totalHolidays}`)
  console.log(`   📏 Rules: ${totalRules}`)
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
