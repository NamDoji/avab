import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import GradingTable from './GradingTable'

export const metadata = { title: 'Chấm bài — AvaB Giáo viên' }

export default async function TeacherGradingPage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || (role !== 'TEACHER' && role !== 'ADMIN')) {
    redirect('/dang-nhap')
  }

  const userId = (session.user as { id: string }).id

  // Subjects this teacher has ever taught (via SessionFeedback)
  const mySubjectLinks = await prisma.sessionFeedback.findMany({
    where: { createdBy: userId },
    select: { subjectId: true },
    distinct: ['subjectId'],
  })
  const mySubjectIds = mySubjectLinks.map(s => s.subjectId)

  // Pending submissions for those subjects
  const pendingSubmissions = await prisma.homeworkSubmission.findMany({
    where: {
      subjectId: { in: mySubjectIds },
      status: 'submitted',
    },
    include: {
      student: { select: { id: true, name: true, phone: true } },
      subject: { select: { id: true, name: true } },
    },
    orderBy: { submittedAt: 'desc' },
  })

  // Graded submissions count for this teacher (for the stats card)
  const gradedCount = await prisma.homeworkSubmission.count({
    where: { subjectId: { in: mySubjectIds }, status: 'graded' },
  })

  const rows = pendingSubmissions.map(s => ({
    id: s.id,
    studentName: s.student.name ?? 'Không tên',
    studentPhone: s.student.phone,
    subjectName: s.subject.name,
    content: s.content,
    submittedAt: s.submittedAt.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/giao-vien"
              className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-black text-gray-900 text-lg flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-600" />
                Chấm bài
              </h1>
              <p className="text-xs text-gray-400">Bài tập chờ chấm của các chuyên đề bạn dạy</p>
            </div>
          </div>

          {pendingSubmissions.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full min-w-[28px] text-center">
              {pendingSubmissions.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Chuyên đề phụ trách</p>
            <p className="text-2xl font-black text-teal-700">{mySubjectIds.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Chờ chấm</p>
            <p className="text-2xl font-black text-amber-600">{pendingSubmissions.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:col-span-1 col-span-2">
            <p className="text-xs text-gray-500 mb-1">Đã chấm</p>
            <p className="text-2xl font-black text-green-600">{gradedCount}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          {rows.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-400 text-sm">
                Không có bài nào chờ chấm.
              </p>
              {mySubjectIds.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Bạn chưa ghi nhận buổi học nào. Hệ thống lấy chuyên đề từ nhật ký buổi học.
                </p>
              )}
            </div>
          ) : (
            <GradingTable submissions={rows} />
          )}
        </div>
      </div>
    </main>
  )
}
