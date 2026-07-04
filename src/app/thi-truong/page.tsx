import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kho học liệu AvaB — Marketplace',
  description: 'Khám phá kho học liệu phong phú từ mầm non đến THPT. AI-powered, cập nhật liên tục.',
}

export const revalidate = 3600 // 1 giờ — marketplace catalog thay đổi chậm

// Filter labels
const GRADE_FILTERS = [
  { key: '',    label: 'Tất cả' },
  { key: '0',   label: 'Mầm non' },
  { key: '1-5', label: 'Tiểu học' },
  { key: '6-9', label: 'THCS' },
  { key: '10-12', label: 'THPT' },
]

const SUBJECT_FILTERS = [
  { key: '',            label: 'Tất cả môn' },
  { key: 'MATH',        label: '➕ Toán' },
  { key: 'ENGLISH',     label: '🇬🇧 Tiếng Anh' },
  { key: 'THINKING_MATH', label: '🧠 Tư duy' },
  { key: 'CODING',      label: '💻 Lập trình' },
  { key: 'SCIENCE',     label: '🔬 Khoa học' },
  { key: 'VIETNAMESE',  label: '📚 Tiếng Việt' },
]

function gradeLabel(grade: string | null): string {
  if (!grade) return 'Mọi lớp'
  const g = parseInt(grade)
  if (g === 0) return 'Mầm non'
  return `Lớp ${grade}`
}

function fmtPrice(price: number | null): string {
  if (!price || price === 0) return 'Miễn phí'
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M đ'
  if (price >= 1_000) return Math.round(price / 1_000) + 'K đ'
  return price + ' đ'
}

interface PageProps {
  searchParams: Promise<{ grade?: string; subject?: string; q?: string }>
}

export default async function ThiTruongPage({ searchParams }: PageProps) {
  const params = await searchParams
  const gradeFilter = params.grade ?? ''
  const subjectFilter = params.subject ?? ''
  const searchQuery = params.q ?? ''

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true, isPublic: true }

  if (gradeFilter === '0') {
    where.grade = '0'
  } else if (gradeFilter === '1-5') {
    where.grade = { in: ['1', '2', '3', '4', '5'] }
  } else if (gradeFilter === '6-9') {
    where.grade = { in: ['6', '7', '8', '9'] }
  } else if (gradeFilter === '10-12') {
    where.grade = { in: ['10', '11', '12'] }
  }

  if (subjectFilter) {
    where.subjectCode = subjectFilter
  }

  if (searchQuery) {
    where.name = { contains: searchQuery, mode: 'insensitive' }
  }

  const publicCourses = await prisma.course.findMany({
    where,
    include: {
      _count: { select: { enrollments: true, subjects: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 24,
  })

  const totalCount = await prisma.course.count({ where: { isActive: true, isPublic: true } })

  // Build filter URL helper
  function filterHref(overrides: Record<string, string>): string {
    const qs = new URLSearchParams({
      ...(gradeFilter   ? { grade: gradeFilter }     : {}),
      ...(subjectFilter ? { subject: subjectFilter } : {}),
      ...(searchQuery   ? { q: searchQuery }          : {}),
      ...overrides,
    })
    const str = qs.toString()
    return `/thi-truong${str ? `?${str}` : ''}`
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div
        className="px-6 py-12"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🛍️ Kho học liệu AvaB</h1>
          <p className="text-blue-200 text-sm mb-6">
            {totalCount} khóa học · AI-powered · Mầm non → THPT
          </p>

          {/* Search bar */}
          <form method="GET" action="/thi-truong" className="max-w-lg">
            <div className="relative">
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="Tìm khóa học, môn học…"
                className="w-full pl-5 pr-32 py-3.5 rounded-2xl text-sm font-medium text-gray-900 outline-none shadow-lg"
                style={{ border: '2px solid transparent' }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                🔍 Tìm
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Grade filter */}
          <div className="flex flex-wrap gap-1.5">
            {GRADE_FILTERS.map(f => (
              <Link
                key={f.key}
                href={filterHref(f.key ? { grade: f.key } : { grade: '' })}
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition"
                style={{
                  background: gradeFilter === f.key ? '#1e40af' : '#fff',
                  color: gradeFilter === f.key ? '#fff' : '#6b7280',
                  border: `1.5px solid ${gradeFilter === f.key ? '#1e40af' : '#e5e7eb'}`,
                }}
              >
                {f.label}
              </Link>
            ))}
          </div>

          <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

          {/* Subject filter */}
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_FILTERS.map(f => (
              <Link
                key={f.key}
                href={filterHref(f.key ? { subject: f.key } : { subject: '' })}
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition"
                style={{
                  background: subjectFilter === f.key ? '#7c3aed' : '#fff',
                  color: subjectFilter === f.key ? '#fff' : '#6b7280',
                  border: `1.5px solid ${subjectFilter === f.key ? '#7c3aed' : '#e5e7eb'}`,
                }}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Results header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500 font-medium">
            {publicCourses.length > 0
              ? `${publicCourses.length} khóa học${searchQuery ? ` cho "${searchQuery}"` : ''}`
              : 'Không có kết quả'}
          </p>
          {(gradeFilter || subjectFilter || searchQuery) && (
            <Link
              href="/thi-truong"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              ✕ Xóa bộ lọc
            </Link>
          )}
        </div>

        {/* ── Course grid ─────────────────────────────────────────────────── */}
        {publicCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 py-16 text-center shadow-sm">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-black text-gray-700 text-lg">Không tìm thấy khóa học nào</p>
            <p className="text-sm text-gray-400 mt-2 mb-6">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Link
              href="/thi-truong"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)' }}
            >
              Xem tất cả khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {publicCourses.map(course => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                {/* Thumbnail / placeholder */}
                <div
                  className="h-36 flex items-center justify-center text-5xl"
                  style={{
                    background: course.thumbnail
                      ? `url(${course.thumbnail}) center/cover`
                      : 'linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)',
                  }}
                >
                  {!course.thumbnail && '📚'}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {gradeLabel(course.grade)}
                    </span>
                    {course.subjectName && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 truncate max-w-[100px]">
                        {course.subjectName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                    {course.name}
                  </h3>

                  {course.description && (
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span>👥 {course._count.enrollments} học viên</span>
                    <span>📖 {course._count.subjects} chủ đề</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-base font-black"
                      style={{ color: course.price ? '#1e40af' : '#059669' }}
                    >
                      {fmtPrice(course.price)}
                    </span>
                    <Link
                      href={`/dang-ky?courseId=${course.id}`}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl text-white transition hover:opacity-90 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                    >
                      Đăng ký
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CTA banner ──────────────────────────────────────────────────── */}
        <div
          className="mt-12 rounded-3xl p-8 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
        >
          <p className="text-2xl font-black mb-2">🏫 Bạn là trường học hoặc trung tâm?</p>
          <p className="text-blue-200 mb-6 text-sm">
            Triển khai AvaB EOS cho toàn tổ chức — quản lý học viên, giáo viên, tài chính trong một hệ thống
          </p>
          <Link
            href="/dang-ky-to-chuc"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-900 font-black text-sm hover:bg-blue-50 transition shadow-lg"
          >
            🚀 Đăng ký tổ chức miễn phí →
          </Link>
        </div>

      </div>
    </main>
  )
}
