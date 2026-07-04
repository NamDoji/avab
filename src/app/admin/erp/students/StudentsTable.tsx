'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import DataTable, { ColumnDef, BulkAction } from '@/components/common/DataTable'
import Link from 'next/link'
import CampusFilter from './CampusFilter'

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

interface Campus {
  id: string
  name: string
  code: string | null
}

interface StudentsTableProps {
  data: StudentRow[]
  totalCount: number
  currentPage: number
  pageSize: number
  searchValue: string
  sortColumn: string
  sortOrder: 'asc' | 'desc'
  campuses?: Campus[]
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

// ─── Bulk Transfer Modal ──────────────────────────────────────────────────────

function BulkTransferModal({
  students,
  onClose,
}: {
  students: StudentRow[]
  onClose: () => void
}) {
  if (students.length === 0) return null
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🔄</span>
          <div>
            <h2 className="text-lg font-black text-gray-900">Chuyển lớp hàng loạt</h2>
            <p className="text-sm text-gray-400">{students.length} học sinh được chọn</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="text-sm text-amber-700 font-semibold">
            ⚠️ Tính năng đang phát triển
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Chuyển lớp hàng loạt sẽ cho phép di chuyển tất cả học sinh đã chọn sang một lớp học khác trong cùng cơ sở.
          </p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Học sinh được chọn ({students.length})
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {students.slice(0, 10).map(s => (
              <div key={s.id} className="flex items-center gap-2 text-sm text-gray-700">
                <Avatar name={s.name} size={24} />
                <span>{s.name ?? '—'}</span>
                {s.phone && <span className="text-gray-400 text-xs">{s.phone}</span>}
              </div>
            ))}
            {students.length > 10 && (
              <p className="text-xs text-gray-400 pl-7">...và {students.length - 10} học sinh khác</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            Đóng
          </button>
          <button
            disabled
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition opacity-50 cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#0f766e,#0369a1)' }}
          >
            🔄 Chuyển lớp (sắp có)
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Notification Modal ───────────────────────────────────────────────────────

function NotifyModal({
  count,
  onClose,
}: {
  count: number
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📧</span>
          <div>
            <h2 className="text-lg font-black text-gray-900">Gửi thông báo</h2>
            <p className="text-sm text-gray-400">{count} học sinh được chọn</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <p className="text-sm text-blue-700 font-semibold">
            📣 Tính năng đang phát triển
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Gửi thông báo hàng loạt đến học sinh và phụ huynh qua SMS, email và thông báo trong app.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
        >
          Đóng
        </button>
      </div>
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
  campuses = [],
}: StudentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [transferStudents, setTransferStudents] = useState<StudentRow[]>([])
  const [notifyCount, setNotifyCount] = useState<number | null>(null)

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

  const handleExportCSV = useCallback(
    (rows?: StudentRow[]) => {
      const source = rows && rows.length > 0 ? rows : data
      const headers = ['Họ tên', 'SĐT', 'Email', 'Số câu', 'Ngày tham gia', 'Trạng thái', 'Khóa học']
      const csvRows = source.map((s) => [
        s.name ?? '',
        s.phone ?? '',
        s.email ?? '',
        String(s._count.answers),
        new Date(s.createdAt).toLocaleDateString('vi-VN'),
        s.enrollments.length > 0 ? 'Đang học' : 'Chưa có lớp',
        s.enrollments.map(e => e.course.name).join(' | '),
      ])
      const csv = [headers, ...csvRows].map((r) => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hoc-sinh-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },
    [data],
  )

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: 'Gửi thông báo',
      icon: '📧',
      onClick: (rows) => {
        setNotifyCount((rows as StudentRow[]).length)
      },
    },
    {
      label: 'Xuất CSV',
      icon: '📦',
      onClick: (rows) => {
        handleExportCSV(rows as StudentRow[])
      },
    },
    {
      label: 'Chuyển lớp',
      icon: '🔄',
      onClick: (rows) => {
        setTransferStudents(rows as StudentRow[])
      },
    },
  ]

  return (
    <>
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
        bulkActions={bulkActions}
        filterNode={campuses.length > 0 ? <CampusFilter campuses={campuses} /> : undefined}
        rowActions={(row) => (
          <Link
            href={`/admin/erp/students/${row.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}
          >
            Xem →
          </Link>
        )}
        onExportCSV={() => handleExportCSV()}
        title={`${totalCount.toLocaleString('vi-VN')} học sinh`}
      />

      {/* Bulk Transfer Modal */}
      {transferStudents.length > 0 && (
        <BulkTransferModal
          students={transferStudents}
          onClose={() => setTransferStudents([])}
        />
      )}

      {/* Notify Modal */}
      {notifyCount !== null && (
        <NotifyModal
          count={notifyCount}
          onClose={() => setNotifyCount(null)}
        />
      )}
    </>
  )
}
