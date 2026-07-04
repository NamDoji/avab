import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import TimetableGeneratePanel from './TimetableGeneratePanel'

export const metadata = { title: 'AI Timetable Engine — School ERP' }

export default async function TimetablePage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  // Fetch campuses
  const campuses = await prisma.campus.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  })

  const defaultCampusId = campuses[0]?.id ?? null

  // Fetch timetable versions
  const versions = await prisma.timetableVersion.findMany({
    orderBy: { generatedAt: 'desc' },
    take: 20,
  })

  // Fetch slots for published version (if any)
  const publishedVersion = versions.find((v) => v.status === 'published')
  let slots: {
    id: string
    courseId: string
    teacherId: string | null
    roomId: string | null
    dayOfWeek: number
    period: number
    status: string
    isLocked: boolean
    versionId: string | null
    course: { id: string; code: string; name: string; subjectName: string | null } | null
    teacher: { id: string; name: string | null } | null
    room: { id: string; name: string } | null
  }[] = []

  if (publishedVersion) {
    const rawSlots = await prisma.timetableSlot.findMany({
      where: { versionId: publishedVersion.id },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    })

    // Enrich
    const courseIds = [...new Set(rawSlots.map((s) => s.courseId))]
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, code: true, name: true, subjectName: true },
    })
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]))

    const teacherIds = [...new Set(rawSlots.map((s) => s.teacherId).filter(Boolean))] as string[]
    const teachers =
      teacherIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: teacherIds } },
            select: { id: true, name: true },
          })
        : []
    const teacherMap = Object.fromEntries(teachers.map((t) => [t.id, t]))

    const roomIds = [...new Set(rawSlots.map((s) => s.roomId).filter(Boolean))] as string[]
    const rooms =
      roomIds.length > 0
        ? await prisma.classRoom.findMany({
            where: { id: { in: roomIds } },
            select: { id: true, name: true },
          })
        : []
    const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]))

    slots = rawSlots.map((s) => ({
      id: s.id,
      courseId: s.courseId,
      teacherId: s.teacherId,
      roomId: s.roomId,
      dayOfWeek: s.dayOfWeek,
      period: s.period,
      status: s.status,
      isLocked: s.isLocked,
      versionId: s.versionId,
      course: courseMap[s.courseId] ?? null,
      teacher: s.teacherId ? (teacherMap[s.teacherId] ?? null) : null,
      room: s.roomId ? (roomMap[s.roomId] ?? null) : null,
    }))
  }

  // Serialise dates for client
  const serialisedVersions = versions.map((v) => ({
    id: v.id,
    name: v.name,
    status: v.status,
    score: v.score,
    conflicts: v.conflicts,
    generatedAt: v.generatedAt.toISOString(),
    publishedAt: v.publishedAt?.toISOString() ?? null,
  }))

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(25%, -50%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.2)', transform: 'translate(-25%, 50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-indigo-300 text-sm mb-2">
            <Link href="/admin/erp" className="hover:text-white transition-colors">
              School ERP
            </Link>
            <span>/</span>
            <span className="text-white">Thời khóa biểu</span>
          </div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-black">📅 AI Timetable Engine</h1>
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(250,204,21,1)', color: '#713f12' }}
            >
              AI-Powered
            </span>
          </div>
          <p className="text-indigo-200 text-sm max-w-xl">
            Xếp thời khóa biểu thông minh — không trùng giáo viên, không trùng phòng, tối ưu cân bằng tải
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-5 flex-wrap">
            <div>
              <div className="text-2xl font-black">{campuses.length}</div>
              <div className="text-indigo-300 text-xs">Campus</div>
            </div>
            <div>
              <div className="text-2xl font-black">{versions.length}</div>
              <div className="text-indigo-300 text-xs">Phiên bản TKB</div>
            </div>
            <div>
              <div className="text-2xl font-black">
                {versions.find((v) => v.status === 'published') ? '✅ Active' : '—'}
              </div>
              <div className="text-indigo-300 text-xs">TKB hiện tại</div>
            </div>
            {publishedVersion?.score != null && (
              <div>
                <div className="text-2xl font-black">{publishedVersion.score}/100</div>
                <div className="text-indigo-300 text-xs">Điểm tối ưu</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        <TimetableGeneratePanel
          campuses={campuses}
          initialVersions={serialisedVersions}
          initialSlots={slots}
          defaultCampusId={defaultCampusId}
        />
      </div>
    </div>
  )
}
