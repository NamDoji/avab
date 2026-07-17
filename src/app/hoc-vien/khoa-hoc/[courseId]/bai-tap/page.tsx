import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import HomeworkList from './HomeworkList'

export const metadata = { title: 'Bài tập về nhà — AvaB' }

export default async function StudentHomeworkPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const { courseId } = await params
  const userId = (session.user as { id: string }).id

  // Auth: must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!enrollment || !['ACTIVE', 'APPROVED'].includes(enrollment.status)) {
    redirect(`/khoa-hoc/${courseId}`)
  }

  // Load course with subjects + homework materials
  const course = await prisma.course.findFirst({
    where: { id: courseId, isActive: true },
    include: {
      subjects: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          materials: {
            where: { type: 'HOMEWORK' },
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      },
    },
  })

  if (!course) notFound()

  // Load existing submissions for all subjects in this course
  const subjectIds = course.subjects.map(s => s.id)
  const submissions = await prisma.homeworkSubmission.findMany({
    where: { studentId: userId, subjectId: { in: subjectIds } },
    select: {
      id: true,
      subjectId: true,
      status: true,
      score: true,
      feedback: true,
      submittedAt: true,
      gradedAt: true,
    },
  })

  const submissionBySubjectId = new Map(submissions.map(s => [s.subjectId, s]))

  // Stats
  const totalSubjects = course.subjects.length
  const submittedCount = submissions.length
  const gradedCount = submissions.filter(s => s.status === 'graded').length

  // Build list for client component
  const subjectItems = course.subjects.map(s => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    materialId: s.materials[0]?.id,
    submission: submissionBySubjectId.has(s.id)
      ? {
          ...submissionBySubjectId.get(s.id)!,
          submittedAt: submissionBySubjectId.get(s.id)!.submittedAt.toISOString(),
          gradedAt: submissionBySubjectId.get(s.id)!.gradedAt?.toISOString() ?? null,
        }
      : null,
  }))

  return (
    <main className="min-h-screen bg-gradient-to-b from-cherry-50 to-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-cherry-600 to-cherry-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href={`/hoc-vien/khoa-hoc/${courseId}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition"
          >
            <ArrowLeft size={16} />
            Quay lại khoá học
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
              📝
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black leading-tight">
                Bài tập về nhà
              </h1>
              <p className="text-white/75 text-sm mt-1 line-clamp-1">{course.name}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="bg-white/20 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black">{totalSubjects}</p>
              <p className="text-xs text-white/70 mt-0.5">Chuyên đề</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black">{submittedCount}</p>
              <p className="text-xs text-white/70 mt-0.5">Đã nộp</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black text-green-300">{gradedCount}</p>
              <p className="text-xs text-white/70 mt-0.5">Đã chấm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {totalSubjects === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">Khoá học chưa có bài tập</p>
          </div>
        ) : (
          <HomeworkList subjects={subjectItems} />
        )}
      </div>
    </main>
  )
}
