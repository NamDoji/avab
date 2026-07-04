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

interface ConflictDetail {
  type: 'teacher_conflict' | 'room_conflict' | 'class_conflict' | 'consecutive_overflow' | 'availability_violation'
  severity: 'hard' | 'soft'
  description: string
  slots?: SlotAssignment[]
}

interface GeneratedVersion {
  name: string
  strategy: string
  score: number
  hardScore: number
  softScore: number
  conflicts: number
  tradeoffs: string[]
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

// ─── Conflict Detection ──────────────────────────────────────────────────────

function detectConflicts(
  slots: SlotAssignment[],
  availabilityMap?: Map<string, Map<number, { from: number; to: number }>>
): { count: number; details: ConflictDetail[] } {
  const details: ConflictDetail[] = []

  // 1. Teacher double booking (same teacher, same day, same period)
  const teacherSlotMap = new Map<string, SlotAssignment[]>()
  for (const s of slots) {
    if (!s.teacherId) continue
    const key = `${s.teacherId}-${s.dayOfWeek}-${s.period}`
    if (!teacherSlotMap.has(key)) teacherSlotMap.set(key, [])
    teacherSlotMap.get(key)!.push(s)
  }
  for (const [, group] of teacherSlotMap) {
    if (group.length > 1) {
      details.push({
        type: 'teacher_conflict',
        severity: 'hard',
        description: `GV ${group[0].teacherId} trùng tiết T${group[0].dayOfWeek} tiết ${group[0].period}`,
        slots: group,
      })
    }
  }

  // 2. Room double booking
  const roomSlotMap = new Map<string, SlotAssignment[]>()
  for (const s of slots) {
    if (!s.roomId) continue
    const key = `${s.roomId}-${s.dayOfWeek}-${s.period}`
    if (!roomSlotMap.has(key)) roomSlotMap.set(key, [])
    roomSlotMap.get(key)!.push(s)
  }
  for (const [, group] of roomSlotMap) {
    if (group.length > 1) {
      details.push({
        type: 'room_conflict',
        severity: 'hard',
        description: `Phòng ${group[0].roomId} trùng T${group[0].dayOfWeek} tiết ${group[0].period}`,
        slots: group,
      })
    }
  }

  // 3. Class double booking (same course, same day, same period)
  const classSlotMap = new Map<string, SlotAssignment[]>()
  for (const s of slots) {
    const key = `${s.courseId}-${s.dayOfWeek}-${s.period}`
    if (!classSlotMap.has(key)) classSlotMap.set(key, [])
    classSlotMap.get(key)!.push(s)
  }
  for (const [, group] of classSlotMap) {
    if (group.length > 1) {
      details.push({
        type: 'class_conflict',
        severity: 'hard',
        description: `Lớp ${group[0].courseId} trùng T${group[0].dayOfWeek} tiết ${group[0].period}`,
        slots: group,
      })
    }
  }

  // 4. Teacher consecutive > 3 periods
  const teacherDaySlots = new Map<string, number[]>()
  for (const s of slots) {
    if (!s.teacherId) continue
    const key = `${s.teacherId}-${s.dayOfWeek}`
    if (!teacherDaySlots.has(key)) teacherDaySlots.set(key, [])
    teacherDaySlots.get(key)!.push(s.period)
  }
  for (const [key, periods] of teacherDaySlots) {
    const sorted = [...new Set(periods)].sort((a, b) => a - b)
    let consecutive = 1
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        consecutive++
        if (consecutive > 3) {
          const [teacherId, day] = key.split('-')
          details.push({
            type: 'consecutive_overflow',
            severity: 'hard',
            description: `GV ${teacherId} dạy liên tiếp >3 tiết ngày T${day}`,
          })
          break
        }
      } else {
        consecutive = 1
      }
    }
  }

  // 5. Teacher availability violations
  if (availabilityMap) {
    for (const s of slots) {
      if (!s.teacherId) continue
      const dayMap = availabilityMap.get(s.teacherId)
      if (!dayMap) continue
      const avail = dayMap.get(s.dayOfWeek)
      if (!avail) {
        details.push({
          type: 'availability_violation',
          severity: 'hard',
          description: `GV ${s.teacherId} không có lịch ngày T${s.dayOfWeek} nhưng bị xếp tiết ${s.period}`,
          slots: [s],
        })
      } else if (s.period < avail.from || s.period > avail.to) {
        details.push({
          type: 'availability_violation',
          severity: 'hard',
          description: `GV ${s.teacherId} xếp tiết ${s.period} ngoài khung T${s.dayOfWeek} (${avail.from}-${avail.to})`,
          slots: [s],
        })
      }
    }
  }

  return { count: details.length, details }
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

    // 6. Load TeacherAvailability
    const teacherIds = allStaff.map(t => t.id)
    const availabilities = teacherIds.length > 0
      ? await prisma.teacherAvailability.findMany({
          where: {
            teacherId: { in: teacherIds },
            OR: [{ campusId }, { campusId: null }],
          },
          orderBy: [{ teacherId: 'asc' }, { dayOfWeek: 'asc' }],
        })
      : []

    // Build availability map: teacherId → day → {from, to}
    const availabilityMap = new Map<string, Map<number, { from: number; to: number }>>()
    for (const a of availabilities) {
      if (!availabilityMap.has(a.teacherId)) availabilityMap.set(a.teacherId, new Map())
      availabilityMap.get(a.teacherId)!.set(a.dayOfWeek, { from: a.periodFrom, to: a.periodTo })
    }

    // Build name map for availability text
    const teacherNameMap = new Map(allStaff.map(t => [t.id, t.name]))

    if (courses.length === 0) {
      return NextResponse.json(
        { error: 'Không có lớp học nào tại campus này. Vui lòng thêm lớp học trước.' },
        { status: 422 }
      )
    }

    // 7. Build working days
    const baseDays = [1, 2, 3, 4, 5]
    if (includeSaturday) baseDays.push(6)
    if (includeSunday) baseDays.push(7)

    // 8. Build context strings
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

    const teacherAvailabilityText = availabilities.length > 0
      ? availabilities
          .map(a => {
            const name = teacherNameMap.get(a.teacherId) ?? a.teacherId
            return `- GV ${name}: T${a.dayOfWeek} tiết ${a.periodFrom}-${a.periodTo}${a.note ? ` (${a.note})` : ''}${a.campusId ? ` [CS ${a.campusId}]` : ''}`
          })
          .join('\n')
      : 'Không có ràng buộc đặc biệt về lịch GV'

    // 9. Enhanced system prompt
    const systemPrompt = `Bạn là chuyên gia xếp thời khóa biểu cho trường học Việt Nam với 20 năm kinh nghiệm.

CẤU HÌNH CẤP HỌC:
${levelConfigText}

Nguyên tắc xếp TKB theo khoa học giáo dục:
1. [HARD] Không trùng GV, phòng, lớp cùng tiết
2. [HARD] GV không dạy quá 3 tiết liên tiếp
3. [HARD] Tuân thủ khung giờ cấp học (MN kết thúc trước 11:30)
4. [HARD] GV chỉ dạy trong giờ đã đăng ký (TeacherAvailability)
5. [SOFT] Toán, Văn, Tiếng Anh → tiết 1-3 buổi sáng (HS tỉnh táo nhất)
6. [SOFT] Thể dục, Nhạc, Mỹ thuật → tiết 4-5 (cuối buổi)
7. [SOFT] Tin học, Khoa học thực hành → 2 tiết liên tiếp
8. [SOFT] Thứ 2 tiết 1 → Chào cờ/Sinh hoạt (không xếp môn học chính)
9. [SOFT] Cân bằng số tiết GV mỗi ngày (không dồn 1 ngày, thưa ngày khác)
10. [SOFT] Phân bổ môn học đều trong tuần (Toán không học 2 ngày liên tiếp)

QUY TẮC RIÊNG CỦA TRƯỜNG:
${rules.length > 0
  ? rules.map(r => `- [${(r.isHard as boolean) ? 'HARD' : 'SOFT'}] ${r.description ?? r.ruleType}`).join('\n')
  : '- Không có quy tắc đặc biệt (dùng quy tắc mặc định)'}

LỊCH SẴN SÀNG CỦA GIÁO VIÊN:
${teacherAvailabilityText}

NGÀY NGHỈ TRONG KỲ:
${holidays.length > 0
  ? holidays.map(h => `- ${h.name}: ${h.startDate.toLocaleDateString('vi-VN')} → ${h.endDate.toLocaleDateString('vi-VN')}`).join('\n')
  : '- Không có ngày nghỉ trong kỳ'}

Danh sách lớp học (courseId: tên):
${courses.map(c => `- ${c.id}: ${c.code} - ${c.name} (${c.subjectName ?? 'Chung'})`).join('\n')}

Giáo viên (${allStaff.length}):
${allStaff.map(t => `- ${t.id}: ${t.name}`).join('\n')}

Phòng học (${rooms.length}):
${rooms.map(r => `- ${r.id}: ${r.name} (sức chứa: ${r.capacity ?? 30})`).join('\n')}

Tạo ${numVersions} phương án TKB với chiến lược khác nhau:
- Phương án 1: Tối ưu hard constraints 100%, soft constraints tốt nhất có thể
- Phương án 2: Ưu tiên phân bổ đều workload GV
${numVersions >= 3 ? '- Phương án 3: Ưu tiên theo tâm lý học sinh (môn khó sáng, môn nhẹ chiều)' : ''}

Với mỗi phương án:
1. Giải thích ngắn WHY đây là phương án tốt (strategy)
2. Liệt kê bất kỳ soft constraint nào phải bỏ qua và lý do (tradeoffs)
3. Tính điểm: hard_score (0-50) + soft_score (0-50) = total (0-100)

Ràng buộc định dạng:
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
      "strategy": "Tối ưu cân bằng",
      "score": 95,
      "hardScore": 48,
      "softScore": 47,
      "conflicts": 0,
      "tradeoffs": ["Một số lớp không đạt được SOFT: môn nhẹ chiều do thiếu GV"],
      "description": "Lý do đây là phương án tốt nhất",
      "slots": [{"courseId": "...", "teacherId": "...", "roomId": "...", "dayOfWeek": 1, "period": 1, "levelCode": "TH"}]
    }
  ]
}`

    // 10. Call GPT-4o
    let versions: GeneratedVersion[] = []

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Tạo ${numVersions} phương án TKB theo cấu hình trên.` },
        ],
        temperature: 0.3,
        max_tokens: 10000,
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
        versions = obj.versions as GeneratedVersion[]
      } else if (Array.isArray(parsed)) {
        versions = [{
          name: 'Phương án 1 — Tự động',
          strategy: 'Tự động',
          score: 80,
          hardScore: 40,
          softScore: 40,
          conflicts: 0,
          tradeoffs: [],
          description: 'TKB được tạo tự động',
          slots: parsed as SlotAssignment[],
        }]
      }

      // Validate slots per version
      const validCourseIds = new Set(courses.map(c => c.id))
      versions = versions.map(v => ({
        ...v,
        strategy: v.strategy ?? 'Tổng hợp',
        hardScore: v.hardScore ?? 40,
        softScore: v.softScore ?? 40,
        tradeoffs: Array.isArray(v.tradeoffs) ? v.tradeoffs : [],
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
      const aiError = err instanceof Error ? err.message : 'GPT-4o call failed'
      return NextResponse.json(
        { error: 'AI generation failed', details: aiError, hint: 'Kiểm tra OPENAI_API_KEY và thử lại' },
        { status: 502 }
      )
    }

    // 11. Save TimetableVersion records + slots for each version
    const savedVersions = []

    for (let vi = 0; vi < versions.length; vi++) {
      const v = versions[vi]
      const slots = v.slots ?? []
      const { count: conflicts } = detectConflicts(slots, availabilityMap)
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
        strategy: v.strategy ?? 'Tổng hợp',
        slots: slots.length,
        conflicts,
        score,
        hardScore: v.hardScore ?? 40,
        softScore: v.softScore ?? 40,
        tradeoffs: v.tradeoffs ?? [],
        description: v.description ?? '',
        status: 'draft',
      })
    }

    return NextResponse.json({
      success: true,
      numVersions: savedVersions.length,
      versions: savedVersions,
      // Backward compat for single-version callers
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
