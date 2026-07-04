import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TeacherProfileTabs from './TeacherProfileTabs'

export const metadata = { title: 'Hồ sơ giáo viên — AvaB ERP' }

function Avatar({ name, size = 64 }: { name: string | null; size?: number }) {
  const letter = name ? name.trim()[0]?.toUpperCase() ?? '?' : '?'
  const colors = ['#0c4a6e', '#0369a1', '#7c3aed', '#db2777', '#ea580c', '#65a30d']
  const color  = colors[(letter.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {letter}
    </div>
  )
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { id } = await params

  const teacher = await prisma.user.findUnique({
    where: { id },
    include: {
      campusUsers: {
        include: { campus: { select: { id: true, name: true, code: true } } },
      },
      _count: { select: { sessionRecords: true } },
    },
  })

  if (!teacher || teacher.role !== 'TEACHER') notFound()

  // Fetch session feedbacks created by this teacher
  const sessionFeedbacks = await prisma.sessionFeedback.findMany({
    where: { createdBy: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      records: { select: { id: true } },
      subject: { select: { name: true, courseId: true, course: { select: { name: true } } } },
    },
  })

  // Unique students taught
  const sessionRecords = await prisma.studentSessionRecord.findMany({
    where: {
      feedback: { createdBy: id },
    },
    select: { userId: true },
  })
  const uniqueStudents = new Set(sessionRecords.map((r) => r.userId)).size

  // Serialize feedback data for client
  const feedbackData = sessionFeedbacks.map((sf) => ({
    id: sf.id,
    sessionDate: sf.sessionDate.toISOString(),
    sessionNote: sf.sessionNote,
    createdAt: sf.createdAt.toISOString(),
    studentsCount: sf.records.length,
    subjectName: sf.subject.name,
    courseName: sf.subject.course.name,
  }))

  const campusData = teacher.campusUsers.map((cu) => ({
    id: cu.id,
    campusId: cu.campus.id,
    campusName: cu.campus.name,
    campusCode: cu.campus.code,
    isPrimary: cu.isPrimary,
  }))

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-sky-200 text-sm mb-4">
            <Link href="/admin/erp/teachers" className="hover:text-white transition-colors">
              ← Giáo viên
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <Avatar name={teacher.name} size={72} />
            <div>
              <h1 className="text-2xl font-black">{teacher.name ?? 'Giáo viên'}</h1>
              <p className="text-sky-200 text-sm mt-1">
                {teacher.phone}
                {teacher.email && <span className="ml-3">{teacher.email}</span>}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {campusData.map((c) => (
                  <span
                    key={c.id}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                  >
                    {c.campusCode ?? c.campusName}
                    {c.isPrimary && ' ⭐'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 mt-6">
            <div>
              <div className="text-2xl font-black">{teacher._count.sessionRecords}</div>
              <div className="text-xs text-sky-200">Buổi dạy</div>
            </div>
            <div>
              <div className="text-2xl font-black">{uniqueStudents}</div>
              <div className="text-xs text-sky-200">Học sinh đã dạy</div>
            </div>
            <div>
              <div className="text-2xl font-black">{campusData.length}</div>
              <div className="text-xs text-sky-200">Cơ sở</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        <TeacherProfileTabs
          teacherId={id}
          feedbacks={feedbackData}
          campuses={campusData}
          sessionCount={teacher._count.sessionRecords}
          studentCount={uniqueStudents}
        />
      </div>
    </div>
  )
}
