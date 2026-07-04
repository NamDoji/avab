import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'
import { StaffImportWrapper } from './StaffImportWrapper'
import StaffTable from './StaffTable'

export const metadata = { title: 'Nhân viên — HRM — AvaB Admin' }

type SearchParams = Promise<{
  search?: string
  page?: string
  pageSize?: string
}>

export default async function HRMStaffPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  const orgUserFilter = orgCtx?.id
    ? { organizationUsers: { some: { organizationId: orgCtx.id } } }
    : {}

  const { search, page, pageSize } = await searchParams

  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const pageSizeNum = parseInt(pageSize ?? '50', 10)
  const validPageSize = [20, 50, 100, 200].includes(pageSizeNum) ? pageSizeNum : 50

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
    role: { in: ['ADMIN', 'TEACHER'] },
    ...whereSearch,
  }

  const [staff, totalCount, adminCount, teacherCount] = await Promise.all([
    prisma.user.findMany({
      where: baseWhere,
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      include: {
        campusUsers: {
          include: { campus: { select: { name: true } } },
          take: 1,
          where: { isPrimary: true },
        },
      },
      skip: (currentPage - 1) * validPageSize,
      take: validPageSize,
    }),
    prisma.user.count({ where: baseWhere }),
    prisma.user.count({ where: { role: 'ADMIN', ...orgUserFilter } }),
    prisma.user.count({ where: { role: 'TEACHER', ...orgUserFilter } }),
  ])

  const rows = staff.map((person) => ({
    id: person.id,
    name: person.name,
    email: person.email,
    phone: person.phone,
    role: person.role,
    avatar: person.avatar,
    createdAt: person.createdAt,
    primaryCampus: person.campusUsers[0]?.campus?.name ?? null,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #4a044e 0%, #7e22ce 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-purple-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">Nhân viên</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">👥 Danh sách nhân viên</h1>
              <p className="text-purple-100 text-sm">
                {totalCount} nhân viên · {adminCount} Admin · {teacherCount} Giáo viên
              </p>
            </div>
            <div className="flex gap-2">
              <StaffImportWrapper />
              <Link
                href="/admin/users"
                className="flex items-center gap-2 bg-purple-600 text-white rounded-2xl px-4 py-2.5 text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
              >
                <span>+</span> Thêm nhân viên
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* ── Stats badges ── */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full">
            👥 {totalCount} nhân viên
          </span>
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full">
            🛡️ {adminCount} Admin
          </span>
          <span className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full">
            👨‍🏫 {teacherCount} Giáo viên
          </span>
        </div>

        {/* ── DataTable ── */}
        <Suspense fallback={<div className="bg-white rounded-2xl p-4 shadow-sm h-64 animate-pulse" />}>
          <StaffTable
            data={rows}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={validPageSize}
            searchValue={search ?? ''}
          />
        </Suspense>
      </div>
    </div>
  )
}
