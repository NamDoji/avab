import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import RecentExports from './RecentExports'
import BatchExportForm from './BatchExportForm'
import ExportButton from './ExportButton'

export const metadata = { title: 'Publishing Center — AvaB' }

// Material types we export
const MATERIAL_TYPES = [
  { key: 'THEORY',        label: 'Lý thuyết',   icon: '📖', exportType: 'lessons' },
  { key: 'HOMEWORK',      label: 'Bài tập',      icon: '📝', exportType: 'homework' },
  { key: 'ANSWER_KEY',    label: 'Đáp án',       icon: '✅', exportType: 'answers' },
  { key: 'QUIZ',          label: 'Kiểm tra',     icon: '📊', exportType: 'quiz' },
  { key: 'TEACHER_GUIDE', label: 'Giáo án GV',   icon: '👩‍🏫', exportType: 'teacher-guide' },
  { key: 'VIDEO_SCRIPT',  label: 'Video Script', icon: '🎬', exportType: 'video-script' },
]

export default async function PublishingPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  // ── Fetch courses with their material type counts ───────────────────────
  const rawCourses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      subjects: {
        include: {
          materials: {
            where: {
              type: {
                in: ['THEORY', 'HOMEWORK', 'ANSWER_KEY', 'QUIZ', 'TEACHER_GUIDE', 'VIDEO_SCRIPT'],
              },
            },
            select: { type: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })

  // Flatten counts per course
  const courses = rawCourses.map(course => {
    const typeCounts: Record<string, number> = {}
    for (const sub of course.subjects) {
      for (const mat of sub.materials) {
        typeCounts[mat.type] = (typeCounts[mat.type] ?? 0) + 1
      }
    }
    const total = Object.values(typeCounts).reduce((a, b) => a + b, 0)
    return {
      id: course.id,
      name: course.name,
      code: course.code,
      grade: course.grade,
      subjectName: course.subjectName ?? course.subjectCode,
      typeCounts,
      total,
    }
  })

  const coursesWithContent = courses.filter(c => c.total > 0)
  const batchCourses = coursesWithContent.map(c => ({ id: c.id, name: c.name, code: c.code }))

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-10"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">📤 Publishing Center</h1>
              <p className="text-blue-200 text-sm mt-1">
                Xuất học liệu ra Word DOCX từ khoá học đã có nội dung
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-200 text-sm font-semibold">
                {coursesWithContent.length} khóa học có nội dung
              </span>
              <Link
                href="/admin/ai-studio/course-generator"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition shadow-md"
              >
                🚀 Course Generator
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* ── Section 1: Courses list with per-type export ───────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-gray-800 text-lg">📤 Xuất bản từ Course Generator</h2>
              <p className="text-sm text-gray-500 mt-0.5">Chọn khóa học và loại nội dung để xuất DOCX</p>
            </div>
          </div>

          {coursesWithContent.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 px-6 py-14 text-center shadow-sm">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-bold text-gray-700">Chưa có khóa học nào có nội dung</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">
                Tạo khóa học và sinh nội dung trong Course Generator trước
              </p>
              <Link
                href="/admin/ai-studio/course-generator"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)' }}
              >
                🚀 Đến Course Generator
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {coursesWithContent.map(course => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Course header row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Course info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/ai-studio/course-generator/${course.id}`}
                          className="font-black text-gray-900 text-sm hover:text-blue-700 transition truncate"
                        >
                          {course.name}
                        </Link>
                        {course.grade && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            Lớp {course.grade}
                          </span>
                        )}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {course.code}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {course.subjectName} · {course.total} materials
                      </p>
                    </div>

                    {/* Export ALL button */}
                    <ExportButton
                      courseId={course.id}
                      courseName={course.name}
                      exportType="all"
                      exportLabel="Tất cả"
                      variant="primary"
                    />
                  </div>

                  {/* Per-type chips */}
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {MATERIAL_TYPES.map(mt => {
                      const count = course.typeCounts[mt.key] ?? 0
                      if (count === 0) return null
                      return (
                        <div key={mt.key} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5 border border-gray-100">
                          <span className="text-sm">{mt.icon}</span>
                          <span className="text-xs font-semibold text-gray-700">{mt.label}</span>
                          <span className="text-xs text-gray-400 font-medium">({count})</span>
                          <ExportButton
                            courseId={course.id}
                            courseName={course.name}
                            exportType={mt.exportType}
                            exportLabel={mt.label}
                            variant="ghost"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Section 2: Recent Exports ───────────────────────────────────── */}
        <section>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-gray-900 text-lg">📋 Lịch sử xuất bản</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lưu trên trình duyệt này · Tối đa 20 file
                </p>
              </div>
            </div>
            <RecentExports />
          </div>
        </section>

        {/* ── Section 3: Batch Export ─────────────────────────────────────── */}
        <section>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-black text-gray-900 text-lg">📚 Xuất Batch</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Chọn nhiều khóa học cùng loại, xuất cùng lúc
              </p>
            </div>
            <BatchExportForm courses={batchCourses} />
          </div>
        </section>

        {/* ── Tips ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
        >
          <h3 className="font-black mb-3">💡 Hướng dẫn</h3>
          <ol className="space-y-2 text-sm text-blue-100">
            <li><span className="font-bold text-white">1.</span> Khóa học cần có nội dung từ Course Generator (Lý thuyết / Bài tập / Giáo án…)</li>
            <li><span className="font-bold text-white">2.</span> Nhấn <strong className="text-white">Xuất ALL</strong> để tải toàn bộ hoặc chọn từng loại riêng lẻ</li>
            <li><span className="font-bold text-white">3.</span> Dùng <strong className="text-white">Xuất Batch</strong> để tải nhiều khóa học cùng lúc</li>
            <li><span className="font-bold text-white">4.</span> File Word (.docx) tải về tự động — mở bằng Microsoft Word hoặc Google Docs</li>
          </ol>
        </div>

      </div>
    </main>
  )
}
