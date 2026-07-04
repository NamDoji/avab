import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

interface TimetableConstraints {
  periodsPerDay: number
  daysPerWeek: number
  maxPeriodsPerTeacher: number
}

interface GenerateRequest {
  campusId: string
  semesterId?: string
  constraints?: Partial<TimetableConstraints>
}

interface SlotAssignment {
  courseId: string
  teacherId: string | null
  roomId: string | null
  dayOfWeek: number
  period: number
}

function detectConflicts(slots: SlotAssignment[]): number {
  let conflicts = 0
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]
      const b = slots[j]
      if (a.dayOfWeek !== b.dayOfWeek || a.period !== b.period) continue
      // Same teacher at same time
      if (a.teacherId && b.teacherId && a.teacherId === b.teacherId) conflicts++
      // Same room at same time
      if (a.roomId && b.roomId && a.roomId === b.roomId) conflicts++
      // Same course at same time
      if (a.courseId === b.courseId) conflicts++
    }
  }
  return conflicts
}

function calculateScore(slots: SlotAssignment[], conflicts: number): number {
  if (slots.length === 0) return 0
  const conflictPenalty = conflicts * 10
  // Reward even distribution across days
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateRequest = await req.json()
    const { campusId, semesterId } = body
    const constraints: TimetableConstraints = {
      periodsPerDay: body.constraints?.periodsPerDay ?? 8,
      daysPerWeek: body.constraints?.daysPerWeek ?? 5,
      maxPeriodsPerTeacher: body.constraints?.maxPeriodsPerTeacher ?? 6,
    }

    if (!campusId) {
      return NextResponse.json({ error: 'campusId là bắt buộc' }, { status: 400 })
    }

    // 1. Fetch campus
    const campus = await prisma.campus.findUnique({ where: { id: campusId } })
    if (!campus) {
      return NextResponse.json({ error: 'Campus không tồn tại' }, { status: 404 })
    }

    // 2. Fetch active courses at this campus (or org-wide)
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

    // 3. Fetch teachers (CampusUser with campusRole = TEACHER or any campusRole)
    const campusUsers = await prisma.campusUser.findMany({
      where: { campusId },
      include: { user: { select: { id: true, name: true, role: true } } },
      take: 30,
    })
    const teachers = campusUsers
      .filter((cu) => cu.user.role === 'TEACHER' || cu.campusRole === 'TEACHER')
      .map((cu) => ({ id: cu.user.id, name: cu.user.name ?? 'GV' }))

    // Fallback: all campusUsers as potential teachers
    const allStaff =
      teachers.length > 0
        ? teachers
        : campusUsers.map((cu) => ({ id: cu.user.id, name: cu.user.name ?? 'Staff' }))

    // 4. Fetch classrooms
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

    // 5. Build AI prompt
    const prompt = `Bạn là chuyên gia xếp thời khóa biểu giáo dục.
Tạo thời khóa biểu tối ưu cho ${courses.length} lớp học.

Danh sách lớp (courseId: tên):
${courses.map((c) => `- ${c.id}: ${c.code} - ${c.name} (${c.subjectName ?? 'Chung'})`).join('\n')}

Giáo viên (${allStaff.length}):
${allStaff.map((t) => `- ${t.id}: ${t.name}`).join('\n')}

Phòng học (${rooms.length}):
${rooms.map((r) => `- ${r.id}: ${r.name} (sức chứa: ${r.capacity ?? 30})`).join('\n')}

Yêu cầu:
- Mỗi lớp: 5 tiết/tuần
- Mỗi ngày: tối đa ${constraints.periodsPerDay} tiết (tiết từ 1 đến ${constraints.periodsPerDay})
- Tuần: ${constraints.daysPerWeek} ngày học (dayOfWeek: 1=T2, 2=T3, 3=T4, 4=T5, 5=T6)
- Giáo viên: tối đa ${constraints.maxPeriodsPerTeacher} tiết/ngày
- KHÔNG trùng: giáo viên, phòng học, lớp học cùng tiết (cùng dayOfWeek + period)
- Tối ưu hóa để giảm khoảng trống giữa các tiết trong ngày

${allStaff.length === 0 ? 'Không có giáo viên — để teacherId là null.' : ''}
${rooms.length === 0 ? 'Không có phòng học — để roomId là null.' : ''}

Trả về JSON array (chỉ JSON, không có markdown, không có giải thích):
[
  {
    "courseId": "...",
    "teacherId": "..." hoặc null,
    "roomId": "..." hoặc null,
    "dayOfWeek": 1,
    "period": 1
  }
]

Đảm bảo không có conflict. Mỗi slot phải có courseId hợp lệ từ danh sách trên.`

    // 6. Call GPT-4o
    let slots: SlotAssignment[] = []
    let aiError: string | null = null

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Bạn là chuyên gia xếp thời khóa biểu. Chỉ trả về JSON array thuần túy, không markdown.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })

      const rawContent = completion.choices[0]?.message?.content ?? '{}'
      let parsed: unknown
      try {
        parsed = JSON.parse(rawContent)
      } catch {
        // Fallback: try to extract JSON array from text
        const match = rawContent.match(/\[[\s\S]*\]/)
        if (match) {
          parsed = JSON.parse(match[0])
        } else {
          throw new Error('Không thể parse JSON từ AI response')
        }
      }

      // Handle both array and object with slots key
      if (Array.isArray(parsed)) {
        slots = parsed as SlotAssignment[]
      } else if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>
        const key = Object.keys(obj).find((k) => Array.isArray(obj[k]))
        if (key) {
          slots = obj[key] as SlotAssignment[]
        }
      }

      // Validate slots
      const validCourseIds = new Set(courses.map((c) => c.id))
      slots = slots.filter(
        (s) =>
          s.courseId &&
          validCourseIds.has(s.courseId) &&
          s.dayOfWeek >= 1 &&
          s.dayOfWeek <= 6 &&
          s.period >= 1 &&
          s.period <= 10
      )
    } catch (err) {
      aiError = err instanceof Error ? err.message : 'GPT-4o call failed'
      // Return error with details
      return NextResponse.json(
        {
          error: 'AI generation failed',
          details: aiError,
          hint: 'Kiểm tra OPENAI_API_KEY và thử lại',
        },
        { status: 502 }
      )
    }

    // 7. Calculate conflicts & score
    const conflicts = detectConflicts(slots)
    const score = calculateScore(slots, conflicts)

    // 8. Create TimetableVersion
    const versionName = semesterId
      ? `TKB ${semesterId} - ${campus.name}`
      : `TKB ${new Date().toLocaleDateString('vi-VN')} - ${campus.name}`

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

    // 9. Save TimetableSlot records in batches
    if (slots.length > 0) {
      const slotData = slots.map((s) => ({
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

      // Insert in chunks of 100
      const CHUNK = 100
      for (let i = 0; i < slotData.length; i += CHUNK) {
        await prisma.timetableSlot.createMany({ data: slotData.slice(i, i + CHUNK) })
      }
    }

    return NextResponse.json({
      versionId: version.id,
      versionName: version.name,
      slots: slots.length,
      conflicts,
      score,
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
