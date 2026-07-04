'use client'

// NOTE: Virtual scrolling not yet implemented.
// For very large in-memory datasets, consider react-virtual or @tanstack/react-virtual.
// Current implementation uses server-side pagination which keeps DOM rows ≤ pageSize.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Pagination from './Pagination'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: number
  minWidth?: number
  sticky?: boolean   // freeze column (left-sticky)
  hide?: boolean     // hidden by default
}

export interface BulkActionDef {
  label: string
  icon?: string
  onClick: (selectedIds: string[]) => void
  danger?: boolean
}

export interface DataTableProps<T> {
  // Data
  data: T[]
  columns: ColumnDef<T>[]
  getRowId?: (row: T) => string

  // Server-side
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void

  // Search/Filter
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  // Sort
  sortColumn?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (column: string, order: 'asc' | 'desc') => void

  // Actions
  onRowClick?: (row: T) => void
  rowActions?: (row: T) => React.ReactNode
  bulkActions?: BulkActionDef[]

  // Export
  onExportExcel?: () => void
  onExportCSV?: () => void

  // UI
  isLoading?: boolean
  emptyState?: React.ReactNode
  title?: string
  headerActions?: React.ReactNode
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      </td>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
      </td>
    </tr>
  )
}

// ─── Column Visibility Dropdown ──────────────────────────────────────────────

function ColumnVisibilityDropdown({
  columns,
  hidden,
  onToggle,
}: {
  columns: ColumnDef<unknown>[]
  hidden: Set<string>
  onToggle: (key: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Cột ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
          {columns.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={!hidden.has(col.key)}
                onChange={() => onToggle(col.key)}
                className="rounded text-blue-600 focus:ring-blue-400"
              />
              {col.header}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Export Dropdown ──────────────────────────────────────────────────────────

function ExportDropdown({
  onExportExcel,
  onExportCSV,
}: {
  onExportExcel?: () => void
  onExportCSV?: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!onExportExcel && !onExportCSV) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Xuất ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
          {onExportExcel && (
            <button
              onClick={() => { onExportExcel(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 text-left"
            >
              📊 Excel
            </button>
          )}
          {onExportCSV && (
            <button
              onClick={() => { onExportCSV(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 text-left"
            >
              📄 CSV
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ column, sortColumn, sortOrder }: { column: string; sortColumn?: string; sortOrder?: 'asc' | 'desc' }) {
  if (column !== sortColumn) {
    return <span className="text-gray-300 ml-1">↕</span>
  }
  return <span className="text-blue-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
}

// ─── Main DataTable ───────────────────────────────────────────────────────────

export default function DataTable<T>({
  data,
  columns,
  getRowId,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  sortColumn,
  sortOrder,
  onSortChange,
  onRowClick,
  rowActions,
  bulkActions,
  onExportExcel,
  onExportCSV,
  isLoading = false,
  emptyState,
  title,
  headerActions,
}: DataTableProps<T>) {
  // ── Column visibility ─────────────────────────────────────────────────────
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.hide).map((c) => c.key)),
  )

  const toggleColumn = useCallback((key: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols],
  )

  // ── Search debounce ───────────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState(searchValue)
  const debouncedSearch = useDebounce(localSearch, 350)

  useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  useEffect(() => {
    if (debouncedSearch !== searchValue && onSearchChange) {
      onSearchChange(debouncedSearch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // ── Row selection ─────────────────────────────────────────────────────────
  const getId = useCallback(
    (row: T): string => {
      if (getRowId) return getRowId(row)
      return (row as Record<string, unknown>)['id'] as string ?? ''
    },
    [getRowId],
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allPageIds = useMemo(() => data.map(getId), [data, getId])
  const isAllSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id))
  const isSomeSelected = allPageIds.some((id) => selectedIds.has(id)) && !isAllSelected

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (isAllSelected) {
        const next = new Set(prev)
        allPageIds.forEach((id) => next.delete(id))
        return next
      } else {
        const next = new Set(prev)
        allPageIds.forEach((id) => next.add(id))
        return next
      }
    })
  }, [isAllSelected, allPageIds])

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // Clear selection on page/data change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [currentPage, data])

  // ── Sort ──────────────────────────────────────────────────────────────────
  const handleSort = useCallback(
    (col: ColumnDef<T>) => {
      if (!col.sortable || !onSortChange) return
      const nextOrder =
        sortColumn === col.key && sortOrder === 'asc' ? 'desc' : 'asc'
      onSortChange(col.key, nextOrder)
    },
    [sortColumn, sortOrder, onSortChange],
  )

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const selectedCount = selectedIds.size

  const hasBulk = bulkActions && bulkActions.length > 0

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Title + header actions left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {title && (
            <h2 className="font-black text-gray-900 text-base truncate">{title}</h2>
          )}
          {headerActions}
        </div>

        {/* Search + controls right */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          {onSearchChange && (
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-52"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Column visibility */}
          <ColumnVisibilityDropdown
            columns={columns as ColumnDef<unknown>[]}
            hidden={hiddenCols}
            onToggle={toggleColumn}
          />

          {/* Export */}
          <ExportDropdown onExportExcel={onExportExcel} onExportCSV={onExportCSV} />
        </div>
      </div>

      {/* ── Selected count badge ── */}
      {selectedCount > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-sm text-blue-700 font-semibold">
          <span>✓ Đã chọn {selectedCount} bản ghi</span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-2 text-blue-400 hover:text-blue-600 text-xs"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {/* Checkbox */}
              <th className="px-4 py-3 w-10 sticky left-0 bg-gray-50 z-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected
                  }}
                  onChange={toggleAll}
                  className="rounded text-blue-600 focus:ring-blue-400 cursor-pointer"
                  aria-label="Chọn tất cả"
                />
              </th>

              {/* Data columns */}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:text-gray-800 select-none' : ''
                  } ${col.sticky ? 'sticky z-10 bg-gray-50' : ''}`}
                  style={{
                    width: col.width,
                    minWidth: col.minWidth ?? 80,
                    left: col.sticky ? 48 : undefined,
                  }}
                  onClick={() => col.sortable && handleSort(col)}
                >
                  {col.header}
                  {col.sortable && (
                    <SortIcon column={col.key} sortColumn={sortColumn} sortOrder={sortOrder} />
                  )}
                </th>
              ))}

              {/* Actions column */}
              {rowActions && (
                <th className="text-right px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider w-32">
                  Hành động
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: pageSize > 10 ? 8 : pageSize }).map((_, i) => (
                <SkeletonRow key={i} cols={visibleColumns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (rowActions ? 2 : 1)} className="px-4 py-16 text-center">
                  {emptyState ?? (
                    <div>
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-gray-500 font-semibold">Không có dữ liệu</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = getId(row)
                const isSelected = selectedIds.has(id)
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-blue-50' : 'hover:bg-blue-50/40'}`}
                  >
                    {/* Checkbox */}
                    <td
                      className={`px-4 py-3 w-10 sticky left-0 z-10 ${isSelected ? 'bg-blue-100' : 'bg-white'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        className="rounded text-blue-600 focus:ring-blue-400 cursor-pointer"
                      />
                    </td>

                    {/* Data cells */}
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${col.sticky ? 'sticky z-10' : ''} ${
                          isSelected
                            ? col.sticky ? 'bg-blue-100' : ''
                            : col.sticky ? 'bg-white' : ''
                        }`}
                        style={{
                          width: col.width,
                          minWidth: col.minWidth ?? 80,
                          left: col.sticky ? 48 : undefined,
                        }}
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}

                    {/* Row actions */}
                    {rowActions && (
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* ── Bulk action floating bar ── */}
      {hasBulk && selectedCount > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-gray-200"
          style={{ background: '#1f2937', color: '#fff' }}
        >
          <span className="text-sm font-bold">{selectedCount} đã chọn</span>
          <div className="w-px h-5 bg-gray-600" />
          {bulkActions!.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                action.onClick([...selectedIds])
                setSelectedIds(new Set())
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                action.danger
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </button>
          ))}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-1 text-gray-400 hover:text-gray-200 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
