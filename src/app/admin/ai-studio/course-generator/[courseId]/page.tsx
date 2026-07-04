import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Plus } from 'lucide-react'
import CourseActions from './CourseActions'
import AIChatPanel from './AIChatPanel'
import ApprovalBadge from './ApprovalBadge'
import JobQueuePanel from './JobQueuePanel'
import ReviewTab from './ReviewTab'
import TabsClient from './TabsClient'
import ContentVersionHistory from '@/components/admin/ContentVersionHistory'

export const metadata = { title: 'Course Preview — AI Studio' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeLabel(gradeMin: number | null): string {
  if (gradeMin === null) return 'Đa khối'
  if (gradeMin === 0)    return 'Mầm non'
  return `Lớp ${gradeMin}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CourseGeneratorResultPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where:   { id: courseId },
    include: {
      subjects: {
        orderBy: { order: 'asc' },
        include: {
          materials: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  })

  if (!course) redirect('/admin/ai-studio')

  // Subjects with only lesson-outline for the structure tab
  const subjectsWithOutlines = course.subjects.map(s => ({
    ...s,
    materials: s.materials.filter(m => m.type === 'lesson-outline'),
  }))

  // Subjects with all materials for review tab
  const subjectsForReview = course.subjects.map(s => ({
    id:        s.id,
    name:      s.name,
    materials: s.materials.map(m => ({
      id:      m.id,
      type:    m.type,
      title:   m.title,
      content: m.content,
    })),
  }))

  const totalLessons = subjectsWithOutlines.reduce((acc, s) => acc + s.materials.length, 0)

  const approvalStatus = (course.approvalStatus ?? 'draft') as
    'draft' | 'review' | 'approved' | 'published' | 'archived'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/10 to-blue-50/10">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-900 to-gray-900 text-white py-8">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm mb-4 text-gray-400">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/ai-studio" className="hover:text-white transition-colors">AI Studio</Link>
            <span>/</span>
            <Link href="/admin/ai-studio/course-generator" className="hover:text-white transition-colors">Course Generator</Link>
            <span>/</span>
            <span className="text-gray-200">Kết quả</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/admin/ai-studio"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black">{course.name}</h1>
                  {course.isActive ? (
                    <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">✅ Đã xuất bản</span>
                  ) : (
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">⏳ Chưa xuất bản</span>
                  )}
                </div>
                <p className="text-emerald-300 text-sm">{course.subjectName} · {gradeLabel(course.gradeMin)} · Mã: {course.code}</p>
              </div>
            </div>
          </div>

          {/* Approval status */}
          <div className="mb-4">
            <ApprovalBadge courseId={courseId} approvalStatus={approvalStatus} />
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-black">{course.subjects.length}</div>
              <div className="text-xs text-gray-400">Chuyên đề</div>
            </div>
            <div className="w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400">{totalLessons}</div>
              <div className="text-xs text-gray-400">Bài học</div>
            </div>
            <div className="w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-blue-400">{course.curriculumId ?? 'K12-VN'}</div>
              <div className="text-xs text-gray-400">Chương trình</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Description */}
          {course.description && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                <BookOpen size={16} />
                Mô tả khóa học
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
              <ContentVersionHistory
                entityId={course.id}
                entityType="course"
                currentContent={course.description}
              />
            </div>
          )}

          {/* Actions */}
          <CourseActions courseId={courseId} isActive={course.isActive} isPublic={course.isPublic} />

          {/* Job Queue Panel */}
          <JobQueuePanel courseId={courseId} />

          {/* ── Tab Navigation ─────────────────────────────────────────── */}
          <TabsClient
            courseId={courseId}
            structureTab={
              <div>
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                  🗂️ Cấu trúc khóa học — {course.subjects.length} chuyên đề
                </h2>

                <div className="space-y-4">
                  {subjectsWithOutlines.map((subject, idx) => (
                    <div
                      key={subject.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      {/* Subject header */}
                      <div className="flex items-start gap-4 p-5 border-b border-gray-50">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-xl">
                          {subject.icon ?? '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-500 uppercase">Chuyên đề {idx + 1}</span>
                            <h3 className="font-black text-gray-900 text-sm">{subject.name}</h3>
                          </div>
                          {subject.description && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{subject.description}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          <Link
                            href={`/admin/ai-studio/new?subject=${course.subjectCode}&grade=${course.gradeMin ?? ''}&curriculum=${course.curriculumId ?? 'K12-VN'}&topic=${encodeURIComponent(subject.name)}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold hover:bg-purple-200 transition-colors whitespace-nowrap"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Plus size={12} />
                            Generate Lessons
                          </Link>
                        </div>
                      </div>

                      {/* Lesson list */}
                      {subject.materials.length > 0 && (
                        <div className="p-4">
                          <p className="text-sm font-bold text-gray-600 mb-2">
                            📝 {subject.materials.length} bài học
                          </p>
                          <ol className="space-y-1.5">
                            {subject.materials.map((mat, lessonIdx) => (
                              <li key={mat.id} className="flex items-start gap-2.5 text-sm text-gray-600">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold mt-0.5">
                                  {lessonIdx + 1}
                                </span>
                                <span className="leading-relaxed">{mat.title}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            }
            reviewTab={
              <ReviewTab
                subjects={subjectsForReview}
                courseId={courseId}
                approvalStatus={approvalStatus}
              />
            }
            publishTab={
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  🚀 Xuất bản & Phê duyệt
                </h2>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">Trạng thái phê duyệt</p>
                  <ApprovalBadge courseId={courseId} approvalStatus={approvalStatus} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">Xuất file DOCX</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { type: 'lessons',        label: '📖 Lý thuyết' },
                      { type: 'homework',       label: '📝 Bài tập' },
                      { type: 'answers',        label: '✅ Đáp án' },
                      { type: 'quiz',           label: '📊 Đề kiểm tra' },
                      { type: 'teacher-guide',  label: '👩‍🏫 Hướng dẫn GV' },
                      { type: 'video-script',   label: '🎬 Kịch bản' },
                      { type: 'all',            label: '📦 Full' },
                    ].map(exp => (
                      <a
                        key={exp.type}
                        href={`/api/admin/ai-studio/course-generator/${courseId}/export?format=docx&type=${exp.type}`}
                        download
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100"
                      >
                        ⬇️ {exp.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            }
          />

          {/* Footer nav */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/admin/ai-studio"
              className="flex-1 text-center py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
            >
              ← Về AI Studio
            </Link>
            <Link
              href="/admin/ai-studio/course-generator"
              className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm"
            >
              🚀 Tạo khóa học mới
            </Link>
          </div>

        </div>
      </div>

      {/* ── AI Chat (floating) ───────────────────────────────────────── */}
      <AIChatPanel courseId={courseId} />

    </div>
  )
}
