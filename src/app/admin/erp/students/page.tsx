import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'
import StudentFilters from './StudentFilters'
import { StudentsImportWrapper } from './StudentsImportWrapper'

export const metadata = { title: 'Học sinh — AvaB ERP' }

type SearchParams = Promise<{ search?: string; filter?: string; sort?: string }>

// ── Avatar helper ─────────────────────────────────────────────────
function Avatar({ name, size = 40 }: { name: string | null; size?: number }) {
  const letter = name ? name.trim()[0]?.toUpperCase() ?? '?' : '?'
  const colors = ['#0f766e', '#0369a1', '#7c3aed', '#db2777', '#ea580c', '#65a30d']
  const color  = colors[(letter.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={
        active
          ? { background: '#dcfce7', color: '#166534' }
          : { background: '#f3f4f6', color: '#6b7280' }
      }
    >
      {active ? 'Đang học' : 'Chưa có lớp'}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default async function StudentsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const { search, filter, sort } = await searchParams

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
      ? { name: 'asc' as const }
      : sort === 'active'
      ? { answers: { _count: 'desc' as const } }
      : { createdAt: 'desc' as const }

  const [students, totalCount, activeCount, inactiveCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
        ...whereFilter,
        ...whereSearch,
      },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            course: { select: { id: true, name: true, grade: true, subjectName: true } },
          },
          take: 3,
        },
        learnerProfile: true,
        _count: { select: { answers: true } },
      },
      orderBy,
    }),
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
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
                {totalCount} học sinh · {activeCount} đang học · {inactiveCount} chưa có lớp
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
        {/* ── Filters (client) ── */}
        <Suspense fallback={<div className="bg-white rounded-2xl p-4 shadow-sm mb-5 h-14 animate-pulse" />}>
          <StudentFilters total={students.length} />
        </Suspense>

        {/* ── Table ── */}
        {students.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-gray-700 font-bold text-lg mb-1">Không tìm thấy học sinh</p>
            <p className="text-gray-400 text-sm mb-5">
              Chưa có học sinh nào phù hợp. Import từ Excel hoặc thêm thủ công.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/admin/data-migration"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}
              >
                📦 Import Excel
              </Link>
              <Link
                href="/admin/users?create=student"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: '#374151' }}
              >
                ➕ Thêm thủ công
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">#</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Học sinh</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Khóa học</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Câu đã làm</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Ngày tham gia</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const isActive = student.enrollments.length > 0
                    const shownEnrollments = student.enrollments.slice(0, 2)
                    const extraCount = student.enrollments.length - shownEnrollments.length

                    return (
                      <tr
                        key={student.id}
                        style={{ borderTop: idx === 0 ? undefined : '1px solid #f1f5f9' }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>

                        {/* Avatar + Tên */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={student.name} size={36} />
                            <div>
                              <div className="font-semibold text-gray-900">
                                {student.name ?? '—'}
                              </div>
                              <div className="text-xs text-gray-400">{student.phone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Khóa học badges */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {shownEnrollments.map((enr) => (
                              <span
                                key={enr.id}
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: '#eff6ff', color: '#1d4ed8' }}
                              >
                                {enr.course.grade ? `Lớp ${enr.course.grade} · ` : ''}
                                {enr.course.subjectName ?? enr.course.name}
                              </span>
                            ))}
                            {extraCount > 0 && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: '#f3f4f6', color: '#6b7280' }}
                              >
                                +{extraCount}
                              </span>
                            )}
                            {student.enrollments.length === 0 && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>

                        {/* Số câu */}
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-700">
                            {student._count.answers.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">câu</span>
                        </td>

                        {/* Ngày tham gia */}
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(student.createdAt).toLocaleDateString('vi-VN')}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge active={isActive} />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/erp/students/${student.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)', color: '#fff' }}
                          >
                            Xem →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Hiển thị {students.length} / {totalCount} học sinh
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
