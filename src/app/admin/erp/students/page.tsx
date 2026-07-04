import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'
import StudentsTable from './StudentsTable'
import { StudentsImportWrapper } from './StudentsImportWrapper'

export const metadata = { title: 'Học sinh — AvaB ERP' }

type SearchParams = Promise<{
  search?: string
  filter?: string
  sort?: string
  sortOrder?: string
  page?: string
  pageSize?: string
}>

export default async function StudentsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const { search, filter, sort, sortOrder, page, pageSize } = await searchParams

  // Pagination
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const pageSizeNum = parseInt(pageSize ?? '50', 10)
  const validPageSize = [20, 50, 100, 200].includes(pageSizeNum) ? pageSizeNum : 50

  // Build dynamic where clause
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const whereFilter =
    filter === 'active'
      ? ({ enrollments: { some: { status: 'ACTIVE' } } } as const)
      : filter === 'inactive'
      ? ({ enrollments: { none: { status: 'ACTIVE' } } } as const)
      : filter === 'new'
      ? ({ createdAt: { gte: sevenDaysAgo } } as const)
      : {}

  const whereSearch = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const orderBy =
    sort === 'name'
      ? { name: (sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc' }
      : sort === 'createdAt'
      ? { createdAt: (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc' }
      : { createdAt: 'desc' as const }

  const baseWhere = {
    role: 'STUDENT' as const,
    isActive: true,
    ...whereFilter,
    ...whereSearch,
  }

  const [students, totalCount, activeCount, inactiveCount] = await Promise.all([
    prisma.user.findMany({
      where: baseWhere,
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            course: { select: { id: true, name: true, grade: true, subjectName: true } },
          },
          take: 3,
        },
        _count: { select: { answers: true } },
      },
      orderBy,
      skip: (currentPage - 1) * validPageSize,
      take: validPageSize,
    }),
    prisma.user.count({ where: baseWhere }),
    prisma.user.count({ where: { role: 'STUDENT', isActive: true, enrollments: { some: { status: 'ACTIVE' } } } }),
    prisma.user.count({ where: { role: 'STUDENT', isActive: true, enrollments: { none: { status: 'ACTIVE' } } } }),
  ])

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-teal-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">ERP</Link>
            <span>/</span>
            <span>Học sinh</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">👥 Học sinh</h1>
              <p className="text-teal-200 text-sm">
                {totalCount.toLocaleString('vi-VN')} học sinh · {activeCount.toLocaleString('vi-VN')} đang học · {inactiveCount.toLocaleString('vi-VN')} chưa có lớp
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/admin/users?create=student"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                ➕ Thêm học sinh
              </Link>
              <StudentsImportWrapper />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* ── DataTable (client) ── */}
        <Suspense fallback={<div className="bg-white rounded-2xl p-4 shadow-sm h-64 animate-pulse" />}>
          <StudentsTable
            data={students.map((s) => ({
              ...s,
              enrollments: s.enrollments.map((e) => ({
                id: e.id,
                course: {
                  id: e.course.id,
                  name: e.course.name,
                  grade: e.course.grade,
                  subjectName: e.course.subjectName,
                },
              })),
            }))}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={validPageSize}
            searchValue={search ?? ''}
            sortColumn={sort ?? 'createdAt'}
            sortOrder={(sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'}
          />
        </Suspense>
      </div>
    </div>
  )
}
