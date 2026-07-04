import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// xlsx is a CommonJS module — import as namespace
import * as XLSX from 'xlsx'

const DAY_LABELS: Record<number, string> = {
  1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 7: 'Chủ nhật',
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

// GET ?versionId=xxx&format=xlsx&groupBy=class|teacher
export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { searchParams } = new URL(request.url)
  const versionId = searchParams.get('versionId')
  const format = searchParams.get('format') ?? 'xlsx'
  const groupBy = (searchParams.get('groupBy') ?? 'class') as 'class' | 'teacher' | 'room'

  if (!versionId) {
    return NextResponse.json({ success: false, error: 'versionId là bắt buộc' }, { status: 400 })
  }

  // Load version
  const version = await prisma.timetableVersion.findUnique({ where: { id: versionId } })
  if (!version) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy phiên bản TKB' }, { status: 404 })
  }

  // Load slots
  const slots = await prisma.timetableSlot.findMany({
    where: { versionId },
    select: {
      id: true, courseId: true, teacherId: true, roomId: true, dayOfWeek: true, period: true,
    },
    orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
  })

  // Load reference data
  const courseIds = [...new Set(slots.map(s => s.courseId))]
  const teacherIds = [...new Set(slots.map(s => s.teacherId).filter(Boolean) as string[])]
  const roomIds = [...new Set(slots.map(s => s.roomId).filter(Boolean) as string[])]

  const [courses, teachers, rooms] = await Promise.all([
    courseIds.length > 0 ? prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, name: true, code: true, subjectName: true },
    }) : [],
    teacherIds.length > 0 ? prisma.user.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, name: true },
    }) : [],
    roomIds.length > 0 ? prisma.classRoom.findMany({
      where: { id: { in: roomIds } },
      select: { id: true, name: true },
    }) : [],
  ])

  const courseMap = new Map(courses.map(c => [c.id, c]))
  const teacherMap = new Map(teachers.map(t => [t.id, t.name ?? t.id]))
  const roomMap = new Map(rooms.map(r => [r.id, r.name]))

  if (format !== 'xlsx') {
    return NextResponse.json({ success: false, error: 'Chỉ hỗ trợ format xlsx hiện tại' }, { status: 400 })
  }

  // Build Excel workbook
  const wb = XLSX.utils.book_new()

  // Sheet 1: Tổng hợp (all slots)
  const summaryData = slots.map(s => ({
    'Lớp học': courseMap.get(s.courseId)?.name ?? s.courseId,
    'Mã lớp': courseMap.get(s.courseId)?.code ?? '',
    'Môn học': courseMap.get(s.courseId)?.subjectName ?? '',
    'Giáo viên': s.teacherId ? (teacherMap.get(s.teacherId) ?? s.teacherId) : '—',
    'Phòng học': s.roomId ? (roomMap.get(s.roomId) ?? s.roomId) : '—',
    'Ngày': DAY_LABELS[s.dayOfWeek] ?? `T${s.dayOfWeek}`,
    'Tiết': s.period,
  }))
  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng hợp')

  if (groupBy === 'class') {
    // Group by course → one sheet per course
    const grouped = new Map<string, typeof slots>()
    for (const s of slots) {
      if (!grouped.has(s.courseId)) grouped.set(s.courseId, [])
      grouped.get(s.courseId)!.push(s)
    }
    for (const [courseId, cSlots] of grouped) {
      const course = courseMap.get(courseId)
      const sheetName = (course?.name ?? courseId).slice(0, 31) // Excel sheet name max 31 chars

      // Build TKB grid: rows = periods, cols = days
      const workingDays = [...new Set(cSlots.map(s => s.dayOfWeek))].sort((a, b) => a - b)
      const maxPeriod = Math.max(...cSlots.map(s => s.period), 5)
      const header = ['Tiết', ...workingDays.map(d => DAY_LABELS[d] ?? `T${d}`)]
      const rows: (string | number)[][] = [header]

      for (let p = 1; p <= maxPeriod; p++) {
        const row: (string | number)[] = [`Tiết ${p}`]
        for (const d of workingDays) {
          const slot = cSlots.find(s => s.dayOfWeek === d && s.period === p)
          if (slot) {
            const teacher = slot.teacherId ? (teacherMap.get(slot.teacherId) ?? '') : ''
            const room = slot.roomId ? (roomMap.get(slot.roomId) ?? '') : ''
            row.push([course?.subjectName ?? '', teacher, room].filter(Boolean).join(' | '))
          } else {
            row.push('')
          }
        }
        rows.push(row)
      }

      const ws = XLSX.utils.aoa_to_sheet(rows)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    }
  } else if (groupBy === 'teacher') {
    // Group by teacher → one sheet per teacher
    const grouped = new Map<string, typeof slots>()
    for (const s of slots) {
      if (!s.teacherId) continue
      if (!grouped.has(s.teacherId)) grouped.set(s.teacherId, [])
      grouped.get(s.teacherId)!.push(s)
    }

    // Workload summary sheet
    const workloadData: Record<string, string | number>[] = []
    for (const [teacherId, tSlots] of grouped) {
      const name = teacherMap.get(teacherId) ?? teacherId
      const perDay: Record<string, number> = {}
      for (const d of [1, 2, 3, 4, 5, 6, 7]) {
        perDay[DAY_LABELS[d] ?? `T${d}`] = tSlots.filter(s => s.dayOfWeek === d).length
      }
      workloadData.push({ 'Giáo viên': name, 'Tổng tiết': tSlots.length, ...perDay })
    }
    const workloadSheet = XLSX.utils.json_to_sheet(workloadData)
    XLSX.utils.book_append_sheet(wb, workloadSheet, 'Workload GV')

    for (const [teacherId, tSlots] of grouped) {
      const name = teacherMap.get(teacherId) ?? teacherId
      const sheetName = name.slice(0, 31)
      const workingDays = [...new Set(tSlots.map(s => s.dayOfWeek))].sort((a, b) => a - b)
      const maxPeriod = Math.max(...tSlots.map(s => s.period), 5)
      const header = ['Tiết', ...workingDays.map(d => DAY_LABELS[d] ?? `T${d}`)]
      const rows: (string | number)[][] = [header]

      for (let p = 1; p <= maxPeriod; p++) {
        const row: (string | number)[] = [`Tiết ${p}`]
        for (const d of workingDays) {
          const slot = tSlots.find(s => s.dayOfWeek === d && s.period === p)
          if (slot) {
            const course = courseMap.get(slot.courseId)
            const room = slot.roomId ? (roomMap.get(slot.roomId) ?? '') : ''
            row.push([course?.name ?? slot.courseId, room].filter(Boolean).join(' | '))
          } else {
            row.push('')
          }
        }
        rows.push(row)
      }

      const ws = XLSX.utils.aoa_to_sheet(rows)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    }
  } else {
    // Room view
    const grouped = new Map<string, typeof slots>()
    for (const s of slots) {
      if (!s.roomId) continue
      if (!grouped.has(s.roomId)) grouped.set(s.roomId, [])
      grouped.get(s.roomId)!.push(s)
    }
    for (const [roomId, rSlots] of grouped) {
      const roomName = roomMap.get(roomId) ?? roomId
      const sheetName = roomName.slice(0, 31)
      const workingDays = [...new Set(rSlots.map(s => s.dayOfWeek))].sort((a, b) => a - b)
      const maxPeriod = Math.max(...rSlots.map(s => s.period), 5)
      const header = ['Tiết', ...workingDays.map(d => DAY_LABELS[d] ?? `T${d}`)]
      const rows: (string | number)[][] = [header]

      for (let p = 1; p <= maxPeriod; p++) {
        const row: (string | number)[] = [`Tiết ${p}`]
        for (const d of workingDays) {
          const slot = rSlots.find(s => s.dayOfWeek === d && s.period === p)
          if (slot) {
            const course = courseMap.get(slot.courseId)
            const teacher = slot.teacherId ? (teacherMap.get(slot.teacherId) ?? '') : ''
            row.push([course?.name ?? slot.courseId, teacher].filter(Boolean).join(' | '))
          } else {
            row.push('')
          }
        }
        rows.push(row)
      }

      const ws = XLSX.utils.aoa_to_sheet(rows)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    }
  }

  // Generate buffer
  const rawBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as unknown
  const nodeBuffer = Buffer.from(rawBuffer as Uint8Array)
  const blob = new Blob([nodeBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const safeVersionName = version.name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s_-]/g, '').trim()
  const fileName = `TKB_${safeVersionName}_${groupBy}.xlsx`

  return new NextResponse(blob, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Cache-Control': 'no-cache',
    },
  })
}
