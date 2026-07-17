import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, Award, Clock, CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Lịch sử bài tập — AvaB Admin' }

function StatusBadge({ status }: { status: string }) {
  if (status === 'graded')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
        <CheckCircle2 size={11} /> Đã chấm
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
      <Clock size={11} /> Chờ chấm
    </span>
  )
}

export default async function StudentHomeworkHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
    redirect('/dang-nhap')
  }

  const { id: studentId } = await params

  // Verify student exists
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, phone: true, role: true },
  })

  if (!student) notFound()

  // All homework submissions for this student
  const submissions = await prisma.homeworkSubmission.findMany({
    where: { studentId },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          courseId: true,
          course: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
  })

  // Stats
  const total = submissions.length
  const graded = submissions.filter(s => s.status === 'graded')
  const pending = submissions.filter(s => s.status === 'submitted')
  const gradedWithScore = graded.filter(s => s.score !== null)
  const avgScore =
    gradedWithScore.length > 0
      ? (
          gradedWithScore.reduce((sum, s) => sum + (s.score ?? 0), 0) /
          gradedWithScore.length
        ).toFixed(1)
      : null

  // Score distribution: buckets 0-4, 5-6, 7-8, 9-10
  const buckets = [
    { label: '0–4', min: 0, max: 4.9, count: 0, color: 'bg-red-400' },
    { label: '5–6', min: 5, max: 6.9, count: 0, color: 'bg-amber-400' },
    { label: '7–8', min: 7, max: 8.9, count: 0, color: 'bg-blue-400' },
    { label: '9–10', min: 9, max: 10, count: 0, color: 'bg-green-500' },
  ]
  for (const s of gradedWithScore) {
    const score = s.score!
    const bucket = buckets.find(b => score >= b.min && score <= b.max)
    if (bucket) bucket.count++
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/admin/erp/students/${studentId}`}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-black text-gray-900 flex items-center gap-2 text-lg">
              <ClipboardList className="w-5 h-5 text-cherry-500" />
              Lịch sử bài tập
            </h1>
            <p className="text-xs text-gray-400">
              {student.name ?? student.phone}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-black text-gray-900">{total}</p>
            <p className="text-xs text-gray-500 mt-0.5">Tổng bài nộp</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-black text-green-600">{graded.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Đã chấm</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-black text-amber-600">{pending.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Chờ chấm</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-black text-cherry-600">
              {avgScore ?? '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Điểm trung bình</p>
          </div>
        </div>

        {/* Score distribution */}
        {gradedWithScore.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-900 text-base mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Phân bố điểm số
            </h2>
            <div className="space-y-3">
              {buckets.map(b => {
                const pct =
                  gradedWithScore.length > 0
                    ? Math.round((b.count / gradedWithScore.length) * 100)
                    : 0
                return (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-semibold text-gray-500">{b.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${b.color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-xs text-gray-500 text-right">
                      {b.count} bài ({pct}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Submissions list */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-black text-gray-900 text-base mb-5 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cherry-500" />
            Danh sách bài nộp ({total})
          </h2>

          {submissions.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">Học sinh chưa nộp bài nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map(s => (
                <div
                  key={s.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-900 text-sm line-clamp-1">
                        {s.subject.name}
                      </p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {s.subject.course.name} •{' '}
                      {new Date(s.submittedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                    {s.status === 'graded' && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {s.score !== null && (
                          <span className="text-sm font-black text-cherry-700">
                            Điểm: {s.score}/10
                          </span>
                        )}
                        {s.feedback && (
                          <span className="text-xs text-gray-600 bg-white rounded-xl px-3 py-1 border border-gray-200 line-clamp-1 max-w-xs">
                            💬 {s.feedback}
                          </span>
                        )}
                        {s.gradedAt && (
                          <span className="text-xs text-gray-400">
                            Chấm:{' '}
                            {new Date(s.gradedAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mini score badge */}
                  {s.score !== null && (
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                        s.score >= 9
                          ? 'bg-green-100 text-green-700'
                          : s.score >= 7
                          ? 'bg-blue-100 text-blue-700'
                          : s.score >= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {s.score}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
