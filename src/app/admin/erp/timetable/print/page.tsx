import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PrintClient from './PrintClient'

export const metadata = { title: 'In Thời khóa biểu — School ERP' }

const DAY_LABELS = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
const MAX_PERIODS = 5

interface PageProps {
  searchParams: Promise<{ type?: string; id?: string; versionId?: string }>
}

export default async function PrintPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const params = await searchParams
  const viewType = (params.type ?? 'class') as 'class' | 'teacher' | 'room'
  const filterId = params.id ?? null

  // Find version
  const org = await prisma.organization.findFirst({ where: { slug: 'ob-school' } })
  const organizationId = org?.id ?? 'ob-school'

  const version = params.versionId
    ? await prisma.timetableVersion.findUnique({ where: { id: params.versionId } })
    : await prisma.timetableVersion.findFirst({
        where: { organizationId, status: 'published' },
        orderBy: { publishedAt: 'desc' },
      }) ?? await prisma.timetableVersion.findFirst({
        where: { organizationId },
        orderBy: { generatedAt: 'desc' },
      })

  const versions = await prisma.timetableVersion.findMany({
    where: { organizationId },
    orderBy: { generatedAt: 'desc' },
    take: 10,
    select: { id: true, name: true, status: true },
  })

  if (!version) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: 80, background: '#f8fafc' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', color: '#fff', padding: '48px 0' }}>
          <div className="container-custom">
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>🖨️ In Thời khóa biểu</h1>
          </div>
        </div>
        <div className="container-custom" style={{ padding: '48px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ color: '#1e293b', fontWeight: 800 }}>Chưa có TKB nào</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>Vui lòng tạo TKB trước khi in</p>
          <Link href="/admin/erp/timetable" style={{
            display: 'inline-block', marginTop: 16,
            padding: '10px 24px', borderRadius: 10,
            background: '#4338ca', color: '#fff', fontWeight: 700, textDecoration: 'none',
          }}>← Về trang TKB</Link>
        </div>
      </div>
    )
  }

  // Load all slots for this version
  const slots = await prisma.timetableSlot.findMany({
    where: { versionId: version.id },
    select: {
      id: true, courseId: true, teacherId: true, roomId: true, dayOfWeek: true, period: true,
    },
    orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
  })

  // Load courses
  const courseIds = [...new Set(slots.map(s => s.courseId))]
  const courses = courseIds.length > 0
    ? await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, name: true, code: true, subjectName: true },
      })
    : []
  const courseMap = new Map(courses.map(c => [c.id, c]))

  // Load teachers
  const teacherIds = [...new Set(slots.map(s => s.teacherId).filter(Boolean) as string[])]
  const teachers = teacherIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: teacherIds } },
        select: { id: true, name: true },
      })
    : []
  const teacherMap = new Map(teachers.map(t => [t.id, t.name ?? t.id]))

  // Load rooms
  const roomIds = [...new Set(slots.map(s => s.roomId).filter(Boolean) as string[])]
  const rooms = roomIds.length > 0
    ? await prisma.classRoom.findMany({
        where: { id: { in: roomIds } },
        select: { id: true, name: true },
      })
    : []
  const roomMap = new Map(rooms.map(r => [r.id, r.name]))

  // Build grid data depending on view type
  // Class view: group by courseId → grid[day][period] = { teacher, room, subject }
  // Teacher view: group by teacherId → grid[day][period] = { class, room, subject }
  // Room view: group by roomId → grid[day][period] = { class, teacher, subject }

  type CellData = {
    line1: string
    line2: string
    line3?: string
  }
  type Grid = Record<number, Record<number, CellData>>

  interface PrintGroup {
    id: string
    name: string
    grid: Grid
  }

  const groups: PrintGroup[] = []

  if (viewType === 'class') {
    const grouped = new Map<string, typeof slots>()
    for (const s of slots) {
      if (!grouped.has(s.courseId)) grouped.set(s.courseId, [])
      grouped.get(s.courseId)!.push(s)
    }
    for (const [courseId, cSlots] of grouped) {
      if (filterId && courseId !== filterId) continue
      const course = courseMap.get(courseId)
      const grid: Grid = {}
      for (const s of cSlots) {
        if (!grid[s.dayOfWeek]) grid[s.dayOfWeek] = {}
        grid[s.dayOfWeek][s.period] = {
          line1: course?.subjectName ?? course?.name ?? courseId,
          line2: s.teacherId ? (teacherMap.get(s.teacherId) ?? s.teacherId) : '—',
          line3: s.roomId ? (roomMap.get(s.roomId) ?? s.roomId) : undefined,
        }
      }
      groups.push({ id: courseId, name: course?.name ?? courseId, grid })
    }
  } else if (viewType === 'teacher') {
    const grouped = new Map<string, typeof slots>()
    for (const s of slots) {
      if (!s.teacherId) continue
      if (!grouped.has(s.teacherId)) grouped.set(s.teacherId, [])
      grouped.get(s.teacherId)!.push(s)
    }
    for (const [teacherId, tSlots] of grouped) {
      if (filterId && teacherId !== filterId) continue
      const name = teacherMap.get(teacherId) ?? teacherId
      const grid: Grid = {}
      for (const s of tSlots) {
        if (!grid[s.dayOfWeek]) grid[s.dayOfWeek] = {}
        const course = courseMap.get(s.courseId)
        grid[s.dayOfWeek][s.period] = {
          line1: course?.name ?? s.courseId,
          line2: s.roomId ? (roomMap.get(s.roomId) ?? s.roomId) : '—',
          line3: course?.subjectName ?? undefined,
        }
      }
      groups.push({ id: teacherId, name, grid })
    }
  } else {
    // room
    const grouped = new Map<string, typeof slots>()
    for (const s of slots) {
      if (!s.roomId) continue
      if (!grouped.has(s.roomId)) grouped.set(s.roomId, [])
      grouped.get(s.roomId)!.push(s)
    }
    for (const [roomId, rSlots] of grouped) {
      if (filterId && roomId !== filterId) continue
      const name = roomMap.get(roomId) ?? roomId
      const grid: Grid = {}
      for (const s of rSlots) {
        if (!grid[s.dayOfWeek]) grid[s.dayOfWeek] = {}
        const course = courseMap.get(s.courseId)
        grid[s.dayOfWeek][s.period] = {
          line1: course?.name ?? s.courseId,
          line2: s.teacherId ? (teacherMap.get(s.teacherId) ?? s.teacherId) : '—',
          line3: course?.subjectName ?? undefined,
        }
      }
      groups.push({ id: roomId, name, grid })
    }
  }

  groups.sort((a, b) => a.name.localeCompare(b.name, 'vi'))

  // Working days in this version
  const workingDays = [...new Set(slots.map(s => s.dayOfWeek))].sort((a, b) => a - b)
  if (workingDays.length === 0) for (let d = 1; d <= 5; d++) workingDays.push(d)

  // Serialize for client
  const serialized = {
    versionId: version.id,
    versionName: version.name,
    viewType,
    groups: groups.map(g => ({
      id: g.id,
      name: g.name,
      grid: g.grid,
    })),
    workingDays,
    maxPeriods: MAX_PERIODS,
    dayLabels: DAY_LABELS,
    versions: versions.map(v => ({ id: v.id, name: v.name, status: v.status })),
  }

  return <PrintClient data={serialized} />
}
