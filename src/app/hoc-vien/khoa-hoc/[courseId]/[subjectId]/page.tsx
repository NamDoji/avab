import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText, FileQuestion, ClipboardList } from 'lucide-react'
import SubjectHomeworkButton from './SubjectHomeworkButton'

export const metadata = { title: 'Nội dung chuyên đề — AvaB' }

const MATERIAL_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  THEORY:   { label: 'Lý thuyết',  icon: '📖' },
  HOMEWORK: { label: 'Bài tập',    icon: '📝' },
  QUIZ:     { label: 'Kiểm tra',   icon: '🎯' },
  VIDEO:    { label: 'Video',      icon: '🎬' },
  SLIDE:    { label: 'Slide',      icon: '🖼️' },
  PDF:      { label: 'Tài liệu',   icon: '📄' },
}

function getMaterialLabel(type: string) {
  return MATERIAL_TYPE_LABELS[type] ?? { label: type, icon: '📁' }
}

export default async function SubjectContentPage({
  params,
}: {
  params: Promise<{ courseId: string; subjectId: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const { courseId, subjectId } = await params
  const userId = (session.user as { id: string }).id

  // Auth: must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!enrollment || !['ACTIVE', 'APPROVED'].includes(enrollment.status)) {
    redirect(`/khoa-hoc/${courseId}`)
  }

  // Load subject with materials + questions + course
  const [subjectRaw, courseRaw] = await Promise.all([
    prisma.subject.findFirst({
      where: { id: subjectId, courseId },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, name: true },
    }),
  ])

  if (!subjectRaw || !courseRaw) notFound()

  const [materials, questions] = await Promise.all([
    prisma.subjectMaterial.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.question.findMany({
      where: { subjectId },
      orderBy: { order: 'asc' },
      take: 10,
      select: { id: true },
    }),
  ])

  // Existing submission for this subject
  const existingSubmission = await prisma.homeworkSubmission.findFirst({
    where: { studentId: userId, subjectId },
    select: { id: true, status: true, score: true, feedback: true },
  })

  const theoryMaterials = materials.filter(m => m.type === 'THEORY')
  const homeworkMaterial = materials.find(m => m.type === 'HOMEWORK')
  const otherMaterials = materials.filter(m => m.type !== 'THEORY' && m.type !== 'HOMEWORK')

  const theoryContent =
    theoryMaterials.length > 0
      ? theoryMaterials.map(m => m.content).filter(Boolean).join('\n\n')
      : null

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-cherry-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-4 flex-wrap">
            <Link href="/hoc-vien" className="hover:text-white transition">Học viên</Link>
            <span>/</span>
            <Link
              href={`/hoc-vien/khoa-hoc/${courseId}`}
              className="hover:text-white transition line-clamp-1"
            >
              {courseRaw.name}
            </Link>
            <span>/</span>
            <span className="text-white line-clamp-1">{subjectRaw.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
              {subjectRaw.icon ?? '📖'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-black leading-tight">{subjectRaw.name}</h1>
              {subjectRaw.description && (
                <p className="text-white/70 text-sm mt-1 line-clamp-2">{subjectRaw.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                  ❓ {questions.length} câu hỏi
                </span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                  📄 {materials.length} tài liệu
                </span>
                {existingSubmission && (
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      existingSubmission.status === 'graded'
                        ? 'bg-green-400/80 text-green-900'
                        : 'bg-amber-400/80 text-amber-900'
                    }`}
                  >
                    {existingSubmission.status === 'graded' ? '✅ Đã chấm' : '📤 Đã nộp bài'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Theory content */}
        {theoryContent ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Nội dung lý thuyết
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {theoryContent}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-gray-300" />
              <p className="font-semibold text-gray-400 text-sm">Chưa có nội dung lý thuyết</p>
            </div>
            <p className="text-xs text-gray-400 ml-6">Giáo viên sẽ bổ sung tài liệu sớm.</p>
          </div>
        )}

        {/* Actions: Homework + Quiz */}
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Homework CTA */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-cherry-500" />
              <h2 className="font-black text-gray-900 text-sm">Bài tập về nhà</h2>
            </div>

            {existingSubmission?.status === 'graded' && (
              <div className="bg-green-50 rounded-2xl p-3 border border-green-100 text-sm">
                <p className="font-bold text-green-700">
                  Điểm: {existingSubmission.score ?? '—'}/10
                </p>
                {existingSubmission.feedback && (
                  <p className="text-green-600 text-xs mt-1">{existingSubmission.feedback}</p>
                )}
              </div>
            )}

            <SubjectHomeworkButton
              subjectId={subjectRaw.id}
              subjectName={subjectRaw.name}
              materialId={homeworkMaterial?.id}
              existingStatus={existingSubmission?.status ?? null}
            />
          </div>

          {/* Quiz CTA */}
          <Link
            href={`/hoc-vien/khoa-hoc/${courseId}/quiz`}
            className="bg-gradient-to-br from-cherry-900 to-cherry-900 rounded-3xl p-5 flex flex-col gap-2 hover:opacity-95 active:scale-95 transition text-white"
          >
            <div className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-cherry-300" />
              <h2 className="font-black text-sm">Kiểm tra nhanh</h2>
            </div>
            <p className="text-xs text-cherry-300">
              {questions.length} câu hỏi • Toàn khoá học • Nhận XP
            </p>
            <span className="mt-1 text-sm font-black">🎯 Bắt đầu →</span>
          </Link>
        </div>

        {/* Materials list */}
        {(otherMaterials.length > 0 || homeworkMaterial) && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-500" />
              Tài liệu đính kèm
            </h2>
            <div className="space-y-2">
              {homeworkMaterial && (
                <MaterialRow
                  type={homeworkMaterial.type}
                  title={homeworkMaterial.title ?? 'Bài tập'}
                  fileUrl={homeworkMaterial.fileUrl}
                />
              )}
              {otherMaterials.map(m => (
                <MaterialRow
                  key={m.id}
                  type={m.type}
                  title={m.title ?? m.fileName ?? 'Tài liệu'}
                  fileUrl={m.fileUrl}
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <Link
            href={`/hoc-vien/khoa-hoc/${courseId}`}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} />
            Danh sách chuyên đề
          </Link>
          <Link
            href={`/hoc-vien/khoa-hoc/${courseId}/bai-tap`}
            className="flex items-center gap-2 text-sm font-semibold text-cherry-600 hover:text-cherry-700 transition"
          >
            📋 Xem tất cả bài tập
          </Link>
        </div>
      </div>
    </main>
  )
}

function MaterialRow({
  type,
  title,
  fileUrl,
}: {
  type: string
  title: string
  fileUrl: string | null
}) {
  const { label, icon } = getMaterialLabel(type)

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{title}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
        >
          Tải xuống →
        </a>
      )}
    </div>
  )
}
