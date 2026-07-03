import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Điểm danh — AvaB ERP' }

// ── Grade label helper ────────────────────────────────────────────
function gradeLabel(grade: string | null): string {
  if (!grade) return ''
  if (grade === '0' || grade === 'preschool') return 'Mầm non'
  return `Lớp ${grade}`
}

// ── Subject colour map (small subset for cards) ───────────────────
const SUBJECT_COLORS: Record<string, string> = {
  THINKING_MATH: '#7c3aed',
  MATH:          '#2563eb',
  ENGLISH:       '#059669',
  VIETNAMESE:    '#dc2626',
  SCIENCE:       '#0891b2',
  PYTHON:        '#0d9488',
  ALGO:          '#ca8a04',
  SCRATCH:       '#ea580c',
  CPP:           '#9333ea',
  IELTS:         '#0369a1',
  CAMBRIDGE:     '#be123c',
  GENERAL:       '#4b5563',
}

function subjectColor(code: string): string {
  return SUBJECT_COLORS[code] ?? SUBJECT_COLORS.GENERAL
}

// ── Page ──────────────────────────────────────────────────────────
export default async function AttendanceSelectorPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: { _count: { select: { enrollments: true } } },
    orderBy: [{ grade: 'asc' }, { name: 'asc' }],
  })

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0)

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">ERP</Link>
            <span>/</span>
            <span>Điểm danh</span>
          </div>
          <h1 className="text-3xl font-black mb-1">✅ Điểm danh</h1>
          <p className="text-green-200 text-sm">
            {courses.length} lớp · {totalStudents} học viên — Chọn lớp để điểm danh nhanh
          </p>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-700">Chọn lớp điểm danh</h2>
          <Link
            href="/admin/erp/attendance/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
          >
            ✏️ Điểm danh tuỳ chỉnh
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-700 font-bold text-lg mb-1">Chưa có lớp học</p>
            <p className="text-gray-400 text-sm mb-5">
              Tạo khóa học và ghi danh học sinh để bắt đầu điểm danh.
            </p>
            <Link
              href="/admin/courses"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
            >
              ➕ Tạo khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const color = subjectColor(course.subjectCode)
              const gl = gradeLabel(course.grade)
              return (
                <Link
                  key={course.id}
                  href={`/admin/erp/attendance/${course.id}`}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] flex items-start gap-4"
                >
                  {/* Color dot */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    style={{ background: color }}
                  >
                    ✅
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 leading-tight truncate">{course.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {gl && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#166534' }}>
                          {gl}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {course._count.enrollments} học viên
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold" style={{ color }}>
                      Điểm danh ngay →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
