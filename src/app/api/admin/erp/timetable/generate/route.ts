import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

interface SlotAssignment {
  courseId: string
  teacherId: string | null
  roomId: string | null
  dayOfWeek: number
  period: number
  levelCode?: string
}

interface VersionOutput {
  name: string
  score: number
  conflicts: number
  description: string
  slots: SlotAssignment[]
}

interface GenerateRequest {
  campusId: string
  semesterId?: string
  numVersions?: 1 | 2 | 3
  includeSaturday?: boolean
  includeSunday?: boolean
  constraints?: {
    periodsPerDay?: number
    daysPerWeek?: number
    maxPeriodsPerTeacher?: number
  }
}

function detectConflicts(slots: SlotAssignment[]): number {
  let conflicts = 0
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]
      const b = slots[j]
      if (a.dayOfWeek !== b.dayOfWeek || a.period !== b.period) continue
      if (a.teacherId && b.teacherId && a.teacherId === b.teacherId) conflicts++
      if (a.roomId && b.roomId && a.roomId === b.roomId) conflicts++
      if (a.courseId === b.courseId) conflicts++
    }
  }
  return conflicts
}

function calculateScore(slots: SlotAssignment[], conflicts: number): number {
  if (slots.length === 0) return 0
  const conflictPenalty = conflicts * 10
  const dayCounts: Record<number, number> = {}
  for (const s of slots) {
    dayCounts[s.dayOfWeek] = (dayCounts[s.dayOfWeek] ?? 0) + 1
  }
  const dayValues = Object.values(dayCounts)
  const avg = dayValues.reduce((a, b) => a + b, 0) / dayValues.length
  const variance = dayValues.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / dayValues.length
  const distributionScore = Math.max(0, 20 - variance)
  const base = 80
  const score = Math.max(0, Math.min(100, base + distributionScore - conflictPenalty))
  return Math.round(score * 10) / 10
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateRequest = await req.json()
    const { campusId, semesterId } = body
    const numVersions = Math.min(3, Math.max(1, body.numVersions ?? 1)) as 1 | 2 | 3
    const includeSaturday = body.includeSaturday ?? false
    const includeSunday = body.includeSunday ?? false

    if (!campusId) {
      return NextResponse.json({ error: 'campusId là bắt buộc' }, { status: 400 })
    }

    // 1. Fetch campus
    const campus = await prisma.campus.findUnique({ where: { id: campusId } })
    if (!campus) {
      return NextResponse.json({ error: 'Campus không tồn tại' }, { status: 404 })
    }

    // 2. Load EducationLevelConfig from DB
    const levelConfigs = await prisma.educationLevelConfig.findMany({
      where: { organizationId: campus.organizationId },
    })

    // 3. Load HolidayCalendar
    const now = new Date()
    const semesterEnd = new Date(now.getFullYear(), now.getMonth() + 6, 1)
    const holidays = await prisma.holidayCalendar.findMany({
      where: {
        organizationId: campus.organizationId,
        startDate: { lte: semesterEnd },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'asc' },
    })

    // 4. Load TimetableRules (active only, exclude teacher_subjects)
    const rules = await prisma.timetableRule.findMany({
      where: {
        organizationId: campus.organizationId,
        isActive: true,
        ruleType: { not: 'teacher_subjects' },
      },
    })

    // 5. Fetch courses, teachers, rooms
    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        OR: [
          { campusId },
          { organizationId: campus.organizationId, campusId: null },
        ],
      },
      select: { id: true, code: true, name: true, subjectName: true },
      take: 50,
    })

    const campusUsers = await prisma.campusUser.findMany({
      where: { campusId },
      include: { user: { select: { id: true, name: true, role: true } } },
      take: 30,
    })
    const teachers = campusUsers
      .filter(cu => cu.user.role === 'TEACHER' || cu.campusRole === 'TEACHER')
      .map(cu => ({ id: cu.user.id, name: cu.user.name ?? 'GV' }))
    const allStaff = teachers.length > 0
      ? teachers
      : campusUsers.map(cu => ({ id: cu.user.id, name: cu.user.name ?? 'Staff' }))

    const rooms = await prisma.classRoom.findMany({
      where: { isActive: true },
      select: { id: true, name: true, capacity: true },
      take: 20,
    })

    if (courses.length === 0) {
      return NextResponse.json(
        { error: 'Không có lớp học nào tại campus này. Vui lòng thêm lớp học trước.' },
        { status: 422 }
      )
    }

    // 6. Build working days
    const baseDays = [1, 2, 3, 4, 5]
    if (includeSaturday) baseDays.push(6)
    if (includeSunday) baseDays.push(7)

    // 7. Build system prompt with config context
    const levelConfigText = levelConfigs.length > 0
      ? levelConfigs.map(l => {
          const periodSchedule = Array.isArray(l.periodSchedule) ? l.periodSchedule : []
          const workingDays = Array.isArray(l.workingDays) ? (l.workingDays as JsonValue[]).map(Number) : baseDays
          const dayNames = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
          return `${l.levelName} (${l.level}):
  - Số tiết/ngày: ${l.periodsPerDay}
  - Thời lượng: ${l.periodDuration} phút/tiết
  - Ngày học: ${workingDays.map((d: number) => dayNames[d] ?? d).join(', ')}
  - Giờ học: ${JSON.stringify(periodSchedule)}`
        }).join('\n\n')
      : `Mặc định: 5 tiết/ngày, 45 phút/tiết, T2-T6`

    const holidayText = holidays.length > 0
      ? holidays.map(h => `${h.name}: ${h.startDate.toLocaleDateString('vi-VN')} đến ${h.endDate.toLocaleDateString('vi-VN')}`).join('\n')
      : 'Không có ngày nghỉ trong kỳ'

    const rulesText = rules.length > 0
      ? rules.map(r => `- ${r.description ?? r.ruleType}: ${JSON.stringify(r.value)}`).join('\n')
      : '- Không có quy tắc đặc biệt (dùng quy tắc mặc định)'

    const systemPrompt = `Bạn là chuyên gia xếp thời khóa biểu cho trường học Việt Nam.

CẤU HÌNH CẤP HỌC:
${levelConfigText}

NGÀY NGHỈ TRONG KỲ:
${holidayText}

QUY TẮC BẮT BUỘC:
${rulesText}

Tạo ${numVersions} phương án thời khóa biểu (phương án 1 tối ưu nhất, các phương án sau là phương án dự phòng).

Danh sách lớp học (courseId: tên):
${courses.map(c => `- ${c.id}: ${c.code} - ${c.name} (${c.subjectName ?? 'Chung'})`).join('\n')}

Giáo viên (${allStaff.length}):
${allStaff.map(t => `- ${t.id}: ${t.name}`).join('\n')}

Phòng học (${rooms.length}):
${rooms.map(r => `- ${r.id}: ${r.name} (sức chứa: ${r.capacity ?? 30})`).join('\n')}

Yêu cầu:
- dayOfWeek: 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7, 7=CN
- Ngày học hợp lệ: ${baseDays.join(', ')}
- KHÔNG trùng: giáo viên, phòng học, lớp học cùng tiết
- Mỗi lớp: 5 tiết/tuần
${allStaff.length === 0 ? '- Không có giáo viên — để teacherId là null' : ''}
${rooms.length === 0 ? '- Không có phòng học — để roomId là null' : ''}

Trả về JSON (chỉ JSON thuần túy, không markdown):
{
  "versions": [
    {
      "name": "Phương án 1 — Tối ưu",
      "score": 95,
      "conflicts": 0,
      "description": "Lý do đây là phương án tốt nhất",
      "slots": [{"courseId": "...", "teacherId": "..." , "roomId": "...", "dayOfWeek": 1, "period": 1, "levelCode": "TH"}]
    }
  ]
}`

    // 8. Call GPT-4o
    let versions: VersionOutput[] = []
    let aiError: string | null = null

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Tạo ${numVersions} phương án TKB theo cấu hình trên.` },
        ],
        temperature: 0.3,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
      })

      const rawContent = completion.choices[0]?.message?.content ?? '{}'
      let parsed: unknown
      try {
        parsed = JSON.parse(rawContent)
      } catch {
        const match = rawContent.match(/\{[\s\S]*\}/)
        if (match) parsed = JSON.parse(match[0])
        else throw new Error('Không thể parse JSON từ AI response')
      }

      const obj = parsed as Record<string, unknown>
      if (Array.isArray(obj.versions)) {
        versions = obj.versions as VersionOutput[]
      } else if (Array.isArray(parsed)) {
        // Fallback: single version as array of slots
        versions = [{
          name: 'Phương án 1 — Tự động',
          score: 80,
          conflicts: 0,
          description: 'TKB được tạo tự động',
          slots: parsed as SlotAssignment[],
        }]
      }

      // Validate slots per version
      const validCourseIds = new Set(courses.map(c => c.id))
      versions = versions.map(v => ({
        ...v,
        slots: (v.slots ?? []).filter(s =>
          s.courseId &&
          validCourseIds.has(s.courseId) &&
          s.dayOfWeek >= 1 &&
          s.dayOfWeek <= 7 &&
          baseDays.includes(s.dayOfWeek) &&
          s.period >= 1 &&
          s.period <= 10
        ),
      }))
    } catch (err) {
      aiError = err instanceof Error ? err.message : 'GPT-4o call failed'
      return NextResponse.json(
        { error: 'AI generation failed', details: aiError, hint: 'Kiểm tra OPENAI_API_KEY và thử lại' },
        { status: 502 }
      )
    }

    // 9. Save TimetableVersion records + slots for each version
    const savedVersions = []

    for (let vi = 0; vi < versions.length; vi++) {
      const v = versions[vi]
      const slots = v.slots ?? []
      const conflicts = detectConflicts(slots)
      const score = v.score ?? calculateScore(slots, conflicts)

      const versionName = v.name ?? (semesterId
        ? `TKB ${semesterId} - ${campus.name} v${vi + 1}`
        : `TKB ${new Date().toLocaleDateString('vi-VN')} - ${campus.name} v${vi + 1}`)

      const version = await prisma.timetableVersion.create({
        data: {
          organizationId: campus.organizationId,
          campusId,
          semesterId: semesterId ?? null,
          name: versionName,
          status: 'draft',
          score,
          conflicts,
          generatedAt: new Date(),
        },
      })

      if (slots.length > 0) {
        const slotData = slots.map(s => ({
          organizationId: campus.organizationId,
          campusId,
          versionId: version.id,
          courseId: s.courseId,
          teacherId: s.teacherId ?? null,
          roomId: s.roomId ?? null,
          dayOfWeek: s.dayOfWeek,
          period: s.period,
          semesterId: semesterId ?? null,
          status: 'active',
        }))
        const CHUNK = 100
        for (let i = 0; i < slotData.length; i += CHUNK) {
          await prisma.timetableSlot.createMany({ data: slotData.slice(i, i + CHUNK) })
        }
      }

      savedVersions.push({
        versionId: version.id,
        versionName: version.name,
        slots: slots.length,
        conflicts,
        score,
        description: v.description ?? '',
        status: 'draft',
      })
    }

    return NextResponse.json({
      success: true,
      numVersions: savedVersions.length,
      versions: savedVersions,
      // Keep backward compat for single-version callers
      versionId: savedVersions[0]?.versionId,
      versionName: savedVersions[0]?.versionName,
      slots: savedVersions[0]?.slots,
      conflicts: savedVersions[0]?.conflicts,
      score: savedVersions[0]?.score,
      status: 'draft',
    })
  } catch (err) {
    console.error('[timetable/generate] error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    )
  }
}
