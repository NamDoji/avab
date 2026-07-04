'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import DataTable, { ColumnDef } from '@/components/common/DataTable'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeacherCampus {
  id: string
  campus: {
    id: string
    name: string
    code: string | null
  }
}

export interface TeacherRow {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  avatar: string | null
  createdAt: Date
  campusUsers: TeacherCampus[]
  _count: { sessionRecords: number }
}

interface TeachersTableProps {
  data: TeacherRow[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchValue: string
  sortColumn: string
  sortOrder: 'asc' | 'desc'
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }: { name: string | null; size?: number }) {
  const letter = name ? name.trim()[0]?.toUpperCase() ?? '?' : '?'
  const colors = ['#0c4a6e', '#0369a1', '#7c3aed', '#db2777', '#ea580c', '#65a30d']
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

const columns: ColumnDef<TeacherRow>[] = [
  {
    key: 'name',
    header: 'Giáo viên',
    sortable: true,
    minWidth: 200,
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} size={36} />
        <div>
          <div className="font-semibold text-gray-900 text-sm">{row.name ?? '—'}</div>
          <div className="text-xs text-gray-400">
            {row.phone}
            {row.email && (
              <span className="ml-2 text-gray-300">· {row.email}</span>
            )}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'campusUsers',
    header: 'Cơ sở',
    minWidth: 160,
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.campusUsers.length === 0 ? (
          <span className="text-xs text-gray-400">Chưa phân công</span>
        ) : (
          row.campusUsers.map((cu) => (
            <span
              key={cu.id}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#e0f2fe', color: '#0369a1' }}
            >
              {cu.campus.code ?? cu.campus.name}
            </span>
          ))
        )}
      </div>
    ),
  },
  {
    key: '_count',
    header: 'Số buổi dạy',
    sortable: false,
    width: 130,
    align: 'right',
    render: (row) => (
      <span className="font-semibold text-gray-700">
        {row._count.sessionRecords.toLocaleString('vi-VN')}
        <span className="text-xs text-gray-400 ml-1">buổi</span>
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
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeachersTable({
  data,
  totalCount,
  currentPage,
  pageSize,
  searchValue,
  sortColumn,
  sortOrder,
}: TeachersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pushParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') params.delete(key)
        else params.set(key, String(value))
      }
      router.push(`/admin/erp/teachers?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleExportCSV = useCallback(() => {
    const headers = ['Họ tên', 'SĐT', 'Email', 'Cơ sở', 'Số buổi dạy', 'Ngày tham gia']
    const rows = data.map((t) => [
      t.name ?? '',
      t.phone ?? '',
      t.email ?? '',
      t.campusUsers.map((cu) => cu.campus.name).join('; '),
      String(t._count.sessionRecords),
      new Date(t.createdAt).toLocaleDateString('vi-VN'),
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `giao-vien-${new Date().toISOString().split('T')[0]}.csv`
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
      pageSizeKey="teachers_pageSize"
      searchValue={searchValue}
      onSearchChange={(v) => pushParams({ search: v, page: 1 })}
      searchPlaceholder="Tìm theo tên, SĐT, email..."
      sortColumn={sortColumn}
      sortOrder={sortOrder}
      onSortChange={(col, order) => pushParams({ sort: col, sortOrder: order, page: 1 })}
      title={`${totalCount.toLocaleString('vi-VN')} giáo viên`}
      onExportCSV={handleExportCSV}
      rowActions={(row) => (
        <Link
          href={`/admin/erp/teachers/${row.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}
        >
          Xem hồ sơ →
        </Link>
      )}
      emptyMessage="Chưa có giáo viên nào"
      emptyIcon="👨‍🏫"
    />
  )
}
