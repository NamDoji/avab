import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ScholarshipsClient from './ScholarshipsClient'

export const metadata = { title: 'Học Bổng — AvaB Finance' }

export default async function ScholarshipsPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  // Load scholarships with enrichment
  const scholarships = await prisma.scholarship.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const studentIds = [...new Set(scholarships.map(s => s.studentId))]
  const courseIds = [...new Set(scholarships.filter(s => s.courseId).map(s => s.courseId!))]

  const [students, courses, allCourses] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, phone: true, email: true },
    }),
    courseIds.length > 0
      ? prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    prisma.course.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const studentMap = new Map(students.map(s => [s.id, s]))
  const courseMap = new Map(courses.map(c => [c.id, c]))

  const enriched = scholarships.map(s => ({
    ...s,
    startDate: s.startDate?.toISOString() ?? null,
    endDate: s.endDate?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    student: studentMap.get(s.studentId) ?? null,
    course: s.courseId ? (courseMap.get(s.courseId) ?? null) : null,
  }))

  const activeCount = enriched.filter(s => s.status === 'active').length
  const totalFixed = enriched
    .filter(s => s.type === 'fixed' && s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <main className="min-h-screen bg-gray-50 pt-14">
      {/* Header */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/finance"
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white">🎓 Học Bổng</h1>
                <p className="text-blue-200 text-sm mt-0.5">
                  Quản lý học bổng và hỗ trợ học phí
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-4">
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-blue-200 text-xs font-semibold">Đang hoạt động</p>
                <p className="text-white font-black text-xl">{activeCount}</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-blue-200 text-xs font-semibold">Tổng hỗ trợ (cố định)</p>
                <p className="text-white font-black text-xl">
                  {new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(totalFixed)}
                </p>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-blue-200 text-xs font-semibold">Tổng học bổng</p>
                <p className="text-white font-black text-xl">{enriched.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScholarshipsClient initialScholarships={enriched} courses={allCourses} />
    </main>
  )
}
