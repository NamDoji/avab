'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import DataTable, { ColumnDef } from '@/components/common/DataTable'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeadRow {
  id: string
  name: string | null
  phone: string
  email: string | null
  note: string | null
  status: string
  createdAt: Date
}

interface LeadsTableProps {
  data: LeadRow[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchValue: string
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Mới',
  FOLLOWUP: 'Đang tư vấn',
  WON: '✅ Đã đăng ký',
  LOST: '❌ Không đăng ký',
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  NEW:      { bg: '#dbeafe', color: '#1d4ed8' },
  FOLLOWUP: { bg: '#fef9c3', color: '#854d0e' },
  WON:      { bg: '#dcfce7', color: '#166534' },
  LOST:     { bg: '#fee2e2', color: '#991b1b' },
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<LeadRow>[] = [
  {
    key: 'name',
    header: 'Tên khách hàng',
    sortable: true,
    minWidth: 160,
    render: (row) => (
      <span className="font-semibold text-gray-900">{row.name ?? '—'}</span>
    ),
  },
  {
    key: 'phone',
    header: 'SĐT',
    width: 130,
    render: (row) => <span className="text-gray-600">{row.phone}</span>,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    width: 150,
    render: (row) => {
      const st = STATUS_STYLE[row.status] ?? STATUS_STYLE['NEW']
      return (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: st.bg, color: st.color }}
        >
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      )
    },
  },
  {
    key: 'note',
    header: 'Ghi chú',
    minWidth: 200,
    render: (row) => (
      <span className="text-gray-400 text-xs truncate block max-w-xs">{row.note ?? '—'}</span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Thời gian',
    sortable: true,
    width: 120,
    render: (row) => (
      <span className="text-xs text-gray-500">
        {new Date(row.createdAt).toLocaleDateString('vi-VN')}
      </span>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeadsTable({
  data,
  totalCount,
  currentPage,
  pageSize,
  searchValue,
}: LeadsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pushParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') params.delete(key)
        else params.set(key, String(value))
      }
      router.push(`/admin/crm?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleExportCSV = useCallback(() => {
    const headers = ['Tên', 'SĐT', 'Trạng thái', 'Ghi chú', 'Ngày']
    const rows = data.map((l) => [
      l.name ?? '',
      l.phone,
      STATUS_LABEL[l.status] ?? l.status,
      l.note ?? '',
      new Date(l.createdAt).toLocaleDateString('vi-VN'),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
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
      searchPlaceholder="Tìm theo tên, SĐT..."
      title="🕐 Tất cả Leads"
      onExportCSV={handleExportCSV}
      emptyState={
        <div>
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500 font-semibold">Chưa có lead nào</p>
          <p className="text-gray-400 text-sm mt-1">Thêm lead đầu tiên để bắt đầu theo dõi</p>
        </div>
      }
    />
  )
}
