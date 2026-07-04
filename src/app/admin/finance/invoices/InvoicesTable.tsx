'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import DataTable, { ColumnDef } from '@/components/common/DataTable'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollectionRow {
  id: string
  title: string
  totalAmount: number
  createdAt: Date
  course: { id: string; name: string; grade: string | null }
  paidCount: number
  totalPayments: number
  paidAmount: number
  rate: number
}

interface InvoicesTableProps {
  data: CollectionRow[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchValue: string
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<CollectionRow>[] = [
  {
    key: 'title',
    header: 'Tiêu đề đợt thu',
    sortable: true,
    minWidth: 200,
    render: (row) => (
      <div>
        <p className="font-semibold text-gray-800">{row.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{fmtVND(row.totalAmount)} / học sinh</p>
      </div>
    ),
  },
  {
    key: 'course',
    header: 'Khóa học',
    minWidth: 160,
    render: (row) => (
      <div>
        <Link
          href={`/admin/courses/${row.course.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 transition text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {row.course.name}
        </Link>
        {row.course.grade && (
          <p className="text-xs text-gray-400">Lớp {row.course.grade}</p>
        )}
      </div>
    ),
  },
  {
    key: 'totalPayments',
    header: 'Số HĐ',
    width: 80,
    render: (row) => (
      <span className="font-bold text-gray-700 text-center block">{row.totalPayments}</span>
    ),
  },
  {
    key: 'paidCount',
    header: 'Đã thu / Tổng',
    width: 140,
    render: (row) => (
      <div className="text-center">
        <span className="font-bold text-emerald-600">{row.paidCount}</span>
        <span className="text-gray-400"> / {row.totalPayments}</span>
        <p className="text-xs text-gray-400 mt-0.5">{fmtVND(row.paidAmount)}</p>
      </div>
    ),
  },
  {
    key: 'rate',
    header: 'Tiến độ',
    minWidth: 130,
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${row.rate}%`,
              background: row.rate >= 80 ? '#059669' : row.rate >= 50 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
        <span
          className="text-xs font-bold w-8 text-right"
          style={{
            color: row.rate >= 80 ? '#059669' : row.rate >= 50 ? '#d97706' : '#dc2626',
          }}
        >
          {row.rate}%
        </span>
      </div>
    ),
  },
  {
    key: 'createdAt',
    header: 'Ngày tạo',
    sortable: true,
    width: 110,
    render: (row) => (
      <span className="text-xs text-gray-500">{fmtDate(row.createdAt)}</span>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoicesTable({
  data,
  totalCount,
  currentPage,
  pageSize,
  searchValue,
}: InvoicesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pushParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') params.delete(key)
        else params.set(key, String(value))
      }
      router.push(`/admin/finance/invoices?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleExportCSV = useCallback(() => {
    const headers = ['Tiêu đề', 'Khóa học', 'Số HĐ', 'Đã thu', 'Chưa thu', 'Tiến độ', 'Ngày tạo']
    const rows = data.map((c) => [
      c.title,
      c.course.name,
      String(c.totalPayments),
      String(c.paidCount),
      String(c.totalPayments - c.paidCount),
      `${c.rate}%`,
      fmtDate(c.createdAt),
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hoa-don-${new Date().toISOString().split('T')[0]}.csv`
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
      searchPlaceholder="Tìm theo tiêu đề, khóa học..."
      title="📋 Danh sách đợt thu"
      onExportCSV={handleExportCSV}
      rowActions={(row) => (
        <Link
          href={`/admin/finance/invoices/${row.id}`}
          className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          Chi tiết
        </Link>
      )}
      emptyState={
        <div className="px-6 py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 font-semibold">Chưa có đợt thu nào</p>
          <Link
            href="/admin/courses"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            + Tạo đợt thu mới
          </Link>
        </div>
      }
    />
  )
}
