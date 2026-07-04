import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Lớp học — AvaB ERP' }

// ── Subject colour map ────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, { gradient: string; emoji: string; label: string }> = {
  THINKING_MATH: { gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', emoji: '🧠', label: 'Toán Tư Duy' },
  MATH:          { gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', emoji: '📐', label: 'Toán' },
  ENGLISH:       { gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)', emoji: '🇬🇧', label: 'Tiếng Anh' },
  VIETNAMESE:    { gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', emoji: '📖', label: 'Tiếng Việt' },
  SCIENCE:       { gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', emoji: '🔬', label: 'Khoa học' },
  CODING:        { gradient: 'linear-gradient(135deg, #0f766e 0%, #065f46 100%)', emoji: '💻', label: 'Lập trình' },
  PYTHON:        { gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', emoji: '🐍', label: 'Python' },
  ALGO:          { gradient: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)', emoji: '🤖', label: 'Thuật toán' },
  SCRATCH:       { gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', emoji: '🐱', label: 'Scratch' },
  CPP:           { gradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)', emoji: '⚡', label: 'C++' },
  IELTS:         { gradient: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)', emoji: '📝', label: 'IELTS' },
  CAMBRIDGE:     { gradient: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)', emoji: '🎓', label: 'Cambridge' },
  PHYSICS:       { gradient: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)', emoji: '⚛️', label: 'Vật lý' },
  CHEMISTRY:     { gradient: 'linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%)', emoji: '🧪', label: 'Hóa học' },
  BIOLOGY:       { gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', emoji: '🧬', label: 'Sinh học' },
  GENERAL:       { gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)', emoji: '📚', label: 'Tổng hợp' },
}

function getSubjectMeta(subjectCode: string) {
  return SUBJECT_COLORS[subjectCode] ?? SUBJECT_COLORS.GENERAL
}

// ── Grade label ───────────────────────────────────────────────────
function gradeLabel(grade: string | null): string {
  if (!grade) return 'Tất cả lớp'
  if (grade === 'preschool' || grade === '0') return 'Mầm non'
  return `Lớp ${grade}`
}

// ── Avatar stack ──────────────────────────────────────────────────
function AvatarStack({
  users,
  extra,
}: {
  users: { name: string | null }[]
  extra: number
}) {
  const colors = ['#0f766e', '#0369a1', '#7c3aed']
  return (
    <div className="flex items-center gap-1">
      {users.map((u, i) => {
        const letter = u.name?.trim()[0]?.toUpperCase() ?? '?'
        return (
          <div
            key={i}
            title={u.name ?? '?'}
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: colors[i % colors.length], marginLeft: i > 0 ? -8 : 0 }}
          >
            {letter}
          </div>
        )
      })}
      {extra > 0 && (
        <div
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white flex-shrink-0"
          style={{ background: '#6b7280', marginLeft: -8 }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}

// ── Grade filter options ──────────────────────────────────────────
const GRADE_FILTERS = [
  { value: '', label: 'Tất cả khối' },
  { value: '0', label: 'Mầm non' },
  ...Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: `Lớp ${i + 1}` })),
]

type SearchParams = Promise<{ grade?: string }>

// ── Page ──────────────────────────────────────────────────────────
export default async function ClassesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const { grade: gradeFilter } = await searchParams

  const courses = await prisma.course.findMany({
    where: {
      isActive: true,
      isPublic: false, // only org-specific classes in ERP view
      ...(gradeFilter !== undefined && gradeFilter !== ''
        ? { grade: gradeFilter === '0' ? '0' : gradeFilter }
        : {}),
    },
    include: {
      _count: { select: { enrollments: true, subjects: true } },
      enrollments: {
        where: { status: 'ACTIVE' },
        take: 3,
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
    orderBy: [{ grade: 'asc' }, { name: 'asc' }],
  })

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0)

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-violet-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">ERP</Link>
            <span>/</span>
            <span>Lớp học</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">📋 Lớp học</h1>
              <p className="text-violet-200 text-sm">
                {courses.length} lớp · {totalStudents} học viên
              </p>
            </div>
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 self-start"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              ➕ Tạo lớp mới
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* ── Grade filter bar ── */}
        <div className="bg-white rounded-2xl p-3 shadow-sm mb-6 flex flex-wrap gap-1.5 overflow-x-auto">
          {GRADE_FILTERS.map((gf) => {
            const isActive = (gradeFilter ?? '') === gf.value
            return (
              <Link
                key={gf.value}
                href={gf.value ? `/admin/erp/classes?grade=${gf.value}` : '/admin/erp/classes'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                style={
                  isActive
                    ? { background: '#7c3aed', color: '#fff' }
                    : { background: '#f3f4f6', color: '#6b7280' }
                }
              >
                {gf.label}
              </Link>
            )
          })}
        </div>

        {/* ── Grid ── */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-700 font-bold text-lg mb-1">Chưa có lớp học</p>
            <p className="text-gray-400 text-sm mb-5">
              Tạo khóa học mới để bắt đầu quản lý lớp học.
            </p>
            <Link
              href="/admin/courses"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              ➕ Tạo khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const meta = getSubjectMeta(course.subjectCode)
              const shownUsers = course.enrollments.slice(0, 3).map((e) => e.user)
              const extraUsers = Math.max(0, course._count.enrollments - shownUsers.length)

              return (
                <div
                  key={course.id}
                  className="rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  {/* Card header (colored) */}
                  <div
                    className="relative p-5 text-white"
                    style={{ background: meta.gradient }}
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                      style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(30%, -40%)' }}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-2xl mb-1">{meta.emoji}</div>
                        <h3 className="font-black text-lg leading-tight">{course.name}</h3>
                      </div>
                      {course.grade && (
                        <span
                          className="text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                        >
                          {gradeLabel(course.grade)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {course.subjectName ?? meta.label}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="bg-white p-4">
                    {/* Stats row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AvatarStack users={shownUsers} extra={extraUsers} />
                        <span className="text-sm font-semibold text-gray-700">
                          {course._count.enrollments} học viên
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {course._count.subjects} chuyên đề
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/courses/${course.id}/students`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-colors"
                        style={{ background: '#f0fdf4', color: '#166534' }}
                      >
                        👥 Học viên
                      </Link>
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-colors"
                        style={{ background: '#f3f4f6', color: '#374151' }}
                      >
                        ✏️ Quản lý
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
