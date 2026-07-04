import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'
import { TeachersImportWrapper } from './TeachersImportWrapper'
import TeachersTable from './TeachersTable'

export const metadata = { title: 'Giáo viên — AvaB ERP' }

type SearchParams = Promise<{
  search?: string
  sort?: string
  sortOrder?: string
  page?: string
  pageSize?: string
}>

export default async function TeachersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { search, sort, sortOrder, page, pageSize } = await searchParams

  // Pagination
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const pageSizeNum = parseInt(pageSize ?? '50', 10)
  const validPageSize = [20, 50, 100, 200].includes(pageSizeNum) ? pageSizeNum : 50

  // Search
  const whereSearch = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const baseWhere = {
    role: 'TEACHER' as const,
    isActive: true,
    ...whereSearch,
  }

  // Sort
  const orderBy =
    sort === 'name'
      ? { name: (sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc' }
      : sort === 'createdAt'
      ? { createdAt: (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc' }
      : { createdAt: 'desc' as const }

  const [teachers, totalCount, totalCampuses] = await Promise.all([
    prisma.user.findMany({
      where: baseWhere,
      include: {
        campusUsers: {
          include: { campus: { select: { id: true, name: true, code: true } } },
        },
        _count: { select: { sessionRecords: true } },
      },
      orderBy,
      skip: (currentPage - 1) * validPageSize,
      take: validPageSize,
    }),
    prisma.user.count({ where: baseWhere }),
    // Count distinct campuses from all active teachers (for header stat)
    prisma.campusUser.findMany({
      where: { user: { role: 'TEACHER', isActive: true } },
      select: { campusId: true },
      distinct: ['campusId'],
    }).then((r) => r.length),
  ])

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sky-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin
            </Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">
              ERP
            </Link>
            <span>/</span>
            <span>Giáo viên</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-1">👨‍🏫 Giáo viên</h1>
              <p className="text-sky-200 text-sm">
                {totalCount.toLocaleString('vi-VN')} giáo viên · {totalCampuses} cơ sở
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/admin/users?create=teacher"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                ➕ Thêm GV
              </Link>
              <TeachersImportWrapper />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl p-4 shadow-sm h-64 animate-pulse" />
          }
        >
          <TeachersTable
            data={teachers.map((t) => ({
              id: t.id,
              name: t.name,
              phone: t.phone,
              email: t.email,
              avatar: t.avatar,
              createdAt: t.createdAt,
              campusUsers: t.campusUsers.map((cu) => ({
                id: cu.id,
                campus: {
                  id: cu.campus.id,
                  name: cu.campus.name,
                  code: cu.campus.code,
                },
              })),
              _count: { sessionRecords: t._count.sessionRecords },
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
    </div>
  )
}
