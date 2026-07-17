'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import DataTable, { ColumnDef } from '@/components/common/DataTable'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffRow {
  id: string
  name: string | null
  email: string | null
  phone: string
  role: string
  avatar: string | null
  createdAt: Date
  primaryCampus: string | null
}

interface StaffTableProps {
  data: StaffRow[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchValue: string
}

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:   { label: 'Quản trị viên', color: '#951F3D', bg: '#FFF7F9' },
  TEACHER: { label: 'Giáo viên',     color: '#0369a1', bg: '#e0f2fe' },
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<StaffRow>[] = [
  {
    key: 'name',
    header: 'Nhân viên',
    sortable: true,
    minWidth: 200,
    render: (row) => {
      const avatarChar = (row.name ?? row.phone).charAt(0).toUpperCase()
      return (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #951F3D, #4f46e5)' }}
          >
            {row.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.avatar} alt={row.name ?? ''} className="w-full h-full object-cover" />
            ) : (
              avatarChar
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate text-sm">{row.name ?? '(Chưa đặt tên)'}</p>
            {row.email && <p className="text-gray-400 text-xs truncate">{row.email}</p>}
          </div>
        </div>
      )
    },
  },
  {
    key: 'phone',
    header: 'Số điện thoại',
    width: 140,
    render: (row) => <span className="text-sm text-gray-600">{row.phone}</span>,
  },
  {
    key: 'role',
    header: 'Vai trò',
    width: 140,
    render: (row) => {
      const cfg = ROLE_CONFIG[row.role] ?? { label: row.role, color: '#6b7280', bg: '#f3f4f6' }
      return (
        <span
          className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}
        >
          {cfg.label}
        </span>
      )
    },
  },
  {
    key: 'primaryCampus',
    header: 'Cơ sở',
    minWidth: 140,
    render: (row) => (
      <span className="text-sm text-gray-600 truncate">{row.primaryCampus ?? '—'}</span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Ngày vào',
    sortable: true,
    width: 110,
    render: (row) => (
      <span className="text-xs text-gray-400">
        {new Date(row.createdAt).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </span>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function StaffTable({
  data,
  totalCount,
  currentPage,
  pageSize,
  searchValue,
}: StaffTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pushParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') params.delete(key)
        else params.set(key, String(value))
      }
      router.push(`/admin/hrm/staff?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleExportCSV = useCallback(() => {
    const headers = ['Họ tên', 'SĐT', 'Email', 'Vai trò', 'Cơ sở', 'Ngày vào']
    const rows = data.map((s) => [
      s.name ?? '',
      s.phone,
      s.email ?? '',
      ROLE_CONFIG[s.role]?.label ?? s.role,
      s.primaryCampus ?? '',
      new Date(s.createdAt).toLocaleDateString('vi-VN'),
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nhan-vien-${new Date().toISOString().split('T')[0]}.csv`
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
      onPageChange={(p) => pushParams({ page: p })}
      onPageSizeChange={(s) => pushParams({ page: 1, pageSize: s })}
      searchValue={searchValue}
      onSearchChange={(v) => pushParams({ search: v, page: 1 })}
      searchPlaceholder="Tìm theo tên, SĐT, email..."
      title={`👥 ${totalCount} nhân viên`}
      onExportCSV={handleExportCSV}
      rowActions={() => (
        <Link
          href="/admin/users"
          className="text-xs font-bold text-cherry-600 hover:text-cherry-800 transition-colors"
        >
          Xem →
        </Link>
      )}
      emptyState={
        <div>
          <div className="text-5xl mb-3">👤</div>
          <h3 className="font-black text-gray-700 mb-1">Chưa có nhân viên</h3>
          <p className="text-gray-400 text-sm">Thêm Admin hoặc Teacher trong phần quản lý người dùng</p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 mt-4 bg-cherry-600 text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-cherry-700 transition-colors"
          >
            + Quản lý người dùng
          </Link>
        </div>
      }
    />
  )
}
