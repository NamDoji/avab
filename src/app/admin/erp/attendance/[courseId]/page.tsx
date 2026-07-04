import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AttendanceSheet from './AttendanceSheet'

export const metadata = { title: 'Điểm danh lớp — AvaB ERP' }

export default async function AttendanceCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { courseId } = await params

  const [course, enrollments] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId, isActive: true },
      select: { id: true, name: true, grade: true, subjectName: true, subjectCode: true },
    }),
    prisma.enrollment.findMany({
      where: { courseId, status: 'ACTIVE' },
      include: {
        user: { select: { id: true, name: true, phone: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  if (!course) notFound()

  const students = enrollments.map((e) => ({
    id: e.user.id,
    name: e.user.name,
    phone: e.user.phone,
  }))

  const gradeLabel =
    !course.grade
      ? ''
      : course.grade === '0' || course.grade === 'preschool'
      ? 'Mầm non'
      : `Lớp ${course.grade}`

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-8"
        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
      >
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">ERP</Link>
            <span>/</span>
            <Link href="/admin/erp/attendance" className="hover:text-white transition-colors">Điểm danh</Link>
            <span>/</span>
            <span>{course.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mb-0.5 break-words">✅ {course.name}</h1>
          <p className="text-green-200 text-sm">
            {gradeLabel && `${gradeLabel} · `}
            {course.subjectName ?? ''} · {students.length} học sinh
          </p>
        </div>
      </div>

      <div className="container-custom py-6 max-w-3xl">
        {students.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-700 font-bold mb-1">Chưa có học sinh trong lớp này</p>
            <p className="text-gray-400 text-sm mb-5">
              Ghi danh học sinh vào khóa học để bắt đầu điểm danh.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/admin/courses/${courseId}`}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
              >
                ➕ Ghi danh học sinh
              </Link>
              <Link
                href="/admin/erp/attendance"
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ← Chọn lớp khác
              </Link>
            </div>
          </div>
        ) : (
          <AttendanceSheet
            students={students}
            courseId={courseId}
            courseName={course.name}
          />
        )}
      </div>
    </div>
  )
}
