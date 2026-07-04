import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QuizPlayer from './QuizPlayer'

export const metadata = { title: 'Kiểm tra kiến thức — AvaB' }

export interface QuizQuestion {
  id: string
  content: string
  questionType: string
  options: Array<{ key: string; text: string }> | null
  correctAnswer: string
  explanation: string | null
  points: number
  subjectId: string
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const { courseId } = await params
  const userId = (session.user as { id: string }).id

  // Verify active enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!enrollment || !['ACTIVE', 'APPROVED'].includes(enrollment.status)) {
    redirect(`/khoa-hoc/${courseId}`)
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, isActive: true },
    include: {
      subjects: {
        where: { isActive: true },
        include: {
          questions: {
            take: 30,
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!course) notFound()

  const allQuestions = course.subjects.flatMap(s => s.questions)
  const shuffled = shuffleArray(allQuestions).slice(0, 20)

  const quizQuestions: QuizQuestion[] = shuffled.map(q => ({
    id: q.id,
    content: q.content,
    questionType: q.questionType,
    options: q.options as Array<{ key: string; text: string }> | null,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    points: q.points,
    subjectId: q.subjectId,
  }))

  if (quizQuestions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Chưa có câu hỏi</h1>
          <p className="text-gray-500 mb-6">Khoá học này chưa có câu hỏi kiểm tra nào.</p>
          <a
            href={`/hoc-vien/khoa-hoc/${courseId}`}
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-700 transition"
          >
            ← Về khoá học
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 pt-20">
      <QuizPlayer
        courseId={courseId}
        courseName={course.name}
        questions={quizQuestions}
      />
    </main>
  )
}
