'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import DataTable, { ColumnDef } from '@/components/common/DataTable'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentEnrollment {
  id: string
  course: {
    id: string
    name: string
    grade: string | null
    subjectName: string | null
  }
}

export interface StudentRow {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  avatar: string | null
  createdAt: Date
  enrollments: StudentEnrollment[]
  _count: { answers: number }
}

interface StudentsTableProps {
  data: StudentRow[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchValue: string
  sortColumn: string
  sortOrder: 'asc' | 'desc'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }: { name: string | null; size?: number }) {
  const letter = name ? name.trim()[0]?.toUpperCase() ?? '?' : '?'
  const colors = ['#0f766e', '#0369a1', '#7c3aed', '#db2777', '#ea580c', '#65a30d']
  const color = colors[(letter.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<StudentRow>[] = [
  {
    key: 'name',
    header: 'Học sinh',
    sortable: true,
    minWidth: 200,
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} size={32} />
        <div>
          <div className="font-semibold text-gray-900 text-sm">{row.name ?? '—'}</div>
          <div className="text-xs text-gray-400">{row.phone}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'enrollments',
    header: 'Khóa học',
    minWidth: 180,
    render: (row) => {
      const shown = row.enrollments.slice(0, 2)
      const extra = row.enrollments.length - shown.length
      return (
        <div className="flex flex-wrap gap-1">
          {shown.map((enr) => (
            <span
              key={enr.id}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#eff6ff', color: '#1d4ed8' }}
            >
              {enr.course.grade ? `Lớp ${enr.course.grade} · ` : ''}
              {enr.course.subjectName ?? enr.course.name}
            </span>
          ))}
          {extra > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              +{extra}
            </span>
          )}
          {row.enrollments.length === 0 && <span className="text-xs text-gray-400">—</span>}
        </div>
      )
    },
  },
  {
    key: '_count',
    header: 'Câu đã làm',
    sortable: false,
    width: 120,
    render: (row) => (
      <span className="font-semibold text-gray-700">
        {row._count.answers.toLocaleString('vi-VN')}
        <span className="text-xs text-gray-400 ml-1">câu</span>
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Ngày tham gia',
    sortable: true,
    width: 130,
    render: (row) => (
      <span className="text-xs text-gray-500">
        {new Date(row.createdAt).toLocaleDateString('vi-VN')}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    width: 130,
    render: (row) => {
      const active = row.enrollments.length > 0
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
    },
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentsTable({
  data,
  totalCount,
  currentPage,
  pageSize,
  searchValue,
  sortColumn,
  sortOrder,
}: StudentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pushParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      }
      router.push(`/admin/erp/students?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleExportCSV = useCallback(() => {
    const headers = ['Họ tên', 'SĐT', 'Số câu', 'Ngày tham gia', 'Trạng thái']
    const rows = data.map((s) => [
      s.name ?? '',
      s.phone ?? '',
      String(s._count.answers),
      new Date(s.createdAt).toLocaleDateString('vi-VN'),
      s.enrollments.length > 0 ? 'Đang học' : 'Chưa có lớp',
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hoc-sinh-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [data])

  return (
    <DataTable
      data={data}
      columns={columns}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => pushParams({ page })}
      onPageSizeChange={(size) => pushParams({ page: 1, pageSize: size })}
      searchValue={searchValue}
      onSearchChange={(v) => pushParams({ search: v, page: 1 })}
      searchPlaceholder="Tìm theo tên, SĐT..."
      sortColumn={sortColumn}
      sortOrder={sortOrder}
      onSortChange={(col, order) => pushParams({ sort: col, sortOrder: order, page: 1 })}
      rowActions={(row) => (
        <Link
          href={`/admin/erp/students/${row.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}
        >
          Xem →
        </Link>
      )}
      onExportCSV={handleExportCSV}
      title={`${totalCount.toLocaleString('vi-VN')} học sinh`}
    />
  )
}
