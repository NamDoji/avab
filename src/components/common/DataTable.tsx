'use client'

// NOTE: Virtual scrolling not yet implemented.
// For very large in-memory datasets, consider react-virtual or @tanstack/react-virtual.
// Current implementation uses server-side pagination which keeps DOM rows ≤ pageSize.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Pagination from './Pagination'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T = Record<string, unknown>> {
  key: string
  header: string
  render?: (row: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: number
  minWidth?: number
  /** 'left' | 'right' to freeze column; legacy boolean treated as 'left' */
  sticky?: 'left' | 'right' | boolean
  /** Whether this column can be hidden via the column-visibility dropdown */
  hideable?: boolean
  /** Hidden by default (legacy: hide) */
  defaultHidden?: boolean
  /** @deprecated use defaultHidden */
  hide?: boolean
  align?: 'left' | 'center' | 'right'
  className?: string
}

export interface BulkAction {
  label: string
  icon?: string
  onClick: (selectedRows: unknown[]) => void
  variant?: 'default' | 'danger'
  /** @deprecated use variant: 'danger' */
  danger?: boolean
}

/** @deprecated use BulkAction */
export type BulkActionDef = BulkAction

export interface DataTableProps<T = Record<string, unknown>> {
  columns: ColumnDef<T>[]
  data: T[]
  /** Alias for getRowId: field name to use as row key (default 'id') */
  keyField?: string
  /** Function to get a unique string key per row (takes priority over keyField) */
  getRowId?: (row: T) => string

  // Server-side pagination
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  /** localStorage key to persist pageSize preference (passed to Pagination) */
  pageSizeKey?: string

  // Search & Filter
  searchValue?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
  /** Custom filter dropdowns rendered right after search bar */
  filterNode?: React.ReactNode

  // Sort
  sortColumn?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (col: string, order: 'asc' | 'desc') => void

  // Selection
  /** Show checkbox column. Default true for backward compat. */
  selectable?: boolean
  onSelectionChange?: (rows: T[]) => void
  bulkActions?: BulkAction[]

  // Row actions
  rowActions?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void

  // Export
  exportFileName?: string
  onExportExcel?: () => void
  onExportCSV?: () => void

  // UI
  title?: string
  headerActions?: React.ReactNode
  isLoading?: boolean
  /** Rich empty state node (takes priority over emptyMessage/emptyIcon) */
  emptyState?: React.ReactNode
  emptyMessage?: string
  emptyIcon?: string
  compact?: boolean
  stickyHeader?: boolean
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

function getColAlign(col: { align?: 'left' | 'center' | 'right' }): string {
  switch (col.align) {
    case 'center': return 'text-center'
    case 'right':  return 'text-right'
    default:       return 'text-left'
  }
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols, compact }: { cols: number; compact?: boolean }) {
  const py = compact ? 'py-2' : 'py-3'
  return (
    <tr>
      <td className={`px-4 ${py}`}>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      </td>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className={`px-4 ${py}`}>
          <div
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: `${55 + (i * 17) % 40}%` }}
          />
        </td>
      ))}
      <td className={`px-4 ${py}`}>
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
  columns: Array<{ key: string; header: string; hideable?: boolean }>
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

  // Only show hideables (hideable !== false)
  const hideableCols = columns.filter((c) => c.hideable !== false)
  if (hideableCols.length === 0) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        aria-label="Cột hiển thị"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Cột hiển thị ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
          {hideableCols.map((col) => (
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
              📊 Excel (.xlsx)
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

function SortIcon({
  column,
  sortColumn,
  sortOrder,
}: {
  column: string
  sortColumn?: string
  sortOrder?: 'asc' | 'desc'
}) {
  if (column !== sortColumn) {
    return <span className="text-gray-300 ml-1">↕</span>
  }
  return <span className="text-blue-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

interface CtxMenuState {
  x: number
  y: number
  rowData: string
}

function ContextMenu({
  state,
  onClose,
}: {
  state: CtxMenuState
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    onClose()
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed z-[200] bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-44 text-sm"
      style={{ left: state.x, top: state.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
        onClick={() => copyText(state.rowData)}
      >
        📋 Copy dòng (JSON)
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
        onClick={() => {
          // Parse JSON and turn to TSV-ish
          try {
            const obj = JSON.parse(state.rowData) as Record<string, unknown>
            const flat = Object.values(obj).map((v) => String(v ?? '')).join('\t')
            copyText(flat)
          } catch {
            copyText(state.rowData)
          }
        }}
      >
        📄 Copy dòng (tab-separated)
      </button>
    </div>
  )
}

// ─── In-memory CSV export ─────────────────────────────────────────────────────

function exportCSVFromData(
  data: Record<string, unknown>[],
  columns: Array<{ key: string; header: string }>,
  filename: string,
) {
  const headers = columns.map((c) => c.header)
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key]
      return `"${String(val ?? '').replace(/"/g, '""')}"`
    }),
  )
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main DataTable ───────────────────────────────────────────────────────────

export default function DataTable<T>({
  data,
  columns,
  getRowId,
  keyField = 'id',
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeKey,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filterNode,
  sortColumn,
  sortOrder,
  onSortChange,
  selectable = true,
  onSelectionChange,
  onRowClick,
  rowActions,
  bulkActions,
  exportFileName,
  onExportExcel,
  onExportCSV,
  isLoading = false,
  emptyState,
  emptyMessage = 'Không có dữ liệu',
  emptyIcon = '📭',
  title,
  headerActions,
  compact = false,
  stickyHeader = false,
}: DataTableProps<T>) {

  // ── Column visibility ─────────────────────────────────────────────────────
  const colVisKey = pageSizeKey ? `colvis_${pageSizeKey}` : null

  const [hiddenCols, setHiddenCols] = useState<Set<string>>(() => {
    // Load from localStorage
    if (colVisKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(colVisKey)
        if (stored) return new Set(JSON.parse(stored) as string[])
      } catch {}
    }
    return new Set(
      columns.filter((c) => c.defaultHidden || c.hide).map((c) => c.key),
    )
  })

  const toggleColumn = useCallback(
    (key: string) => {
      setHiddenCols((prev) => {
        const next = new Set(prev)
        next.has(key) ? next.delete(key) : next.add(key)
        if (colVisKey) {
          try {
            localStorage.setItem(colVisKey, JSON.stringify([...next]))
          } catch {}
        }
        return next
      })
    },
    [colVisKey],
  )

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
      return String((row as Record<string, unknown>)[keyField] ?? '')
    },
    [getRowId, keyField],
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allPageIds = useMemo(() => data.map(getId), [data, getId])
  const isAllSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id))
  const isSomeSelected = allPageIds.some((id) => selectedIds.has(id)) && !isAllSelected

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (isAllSelected) {
        allPageIds.forEach((id) => next.delete(id))
      } else {
        allPageIds.forEach((id) => next.add(id))
      }
      return next
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

  // Fire onSelectionChange
  useEffect(() => {
    if (!onSelectionChange) return
    onSelectionChange(data.filter((row) => selectedIds.has(getId(row))))
  }, [selectedIds, data, getId, onSelectionChange])

  // ── Sort: 3-cycle (none → asc → desc → none) ──────────────────────────────
  const handleSort = useCallback(
    (col: ColumnDef<T>) => {
      if (!col.sortable || !onSortChange) return
      if (sortColumn !== col.key) {
        onSortChange(col.key, 'asc')
      } else if (sortOrder === 'asc') {
        onSortChange(col.key, 'desc')
      } else {
        // Third click: remove sort (signal with empty string)
        onSortChange('', 'asc')
      }
    },
    [sortColumn, sortOrder, onSortChange],
  )

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const selectedCount = selectedIds.size
  const hasBulk = bulkActions && bulkActions.length > 0
  const showCheckbox = selectable || hasBulk

  // ── Context menu ──────────────────────────────────────────────────────────
  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null)

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, row: T) => {
      e.preventDefault()
      const plain: Record<string, unknown> = {}
      columns.forEach((c) => {
        plain[c.key] = (row as Record<string, unknown>)[c.key]
      })
      setCtxMenu({
        x: e.clientX,
        y: e.clientY,
        rowData: JSON.stringify(plain, null, 0),
      })
    },
    [columns],
  )

  // ── In-memory export fallback ─────────────────────────────────────────────
  const effectiveOnExportCSV = onExportCSV ?? (
    data.length > 0
      ? () => exportCSVFromData(
          data as Record<string, unknown>[],
          visibleColumns,
          exportFileName ?? `export-${new Date().toISOString().split('T')[0]}.csv`,
        )
      : undefined
  )

  // ── Padding ───────────────────────────────────────────────────────────────
  const cellPy = compact ? 'py-2' : 'py-3'

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
                className="pl-8 pr-8 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-52"
              />
              {localSearch && (
                <button
                  onClick={() => { setLocalSearch(''); onSearchChange('') }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 leading-none"
                  aria-label="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Custom filters */}
          {filterNode}

          {/* Column visibility */}
          <ColumnVisibilityDropdown
            columns={columns}
            hidden={hiddenCols}
            onToggle={toggleColumn}
          />

          {/* Export */}
          <ExportDropdown
            onExportExcel={onExportExcel}
            onExportCSV={effectiveOnExportCSV}
          />
        </div>
      </div>

      {/* ── Selected count badge ── */}
      {showCheckbox && selectedCount > 0 && (
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
          <thead className={stickyHeader ? 'sticky top-0 z-20' : ''}>
            <tr style={{ background: '#f8fafc' }}>
              {/* Checkbox */}
              {showCheckbox && (
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
              )}

              {/* Data columns */}
              {visibleColumns.map((col) => {
                const isLeftSticky = col.sticky === true || col.sticky === 'left'
                const isRightSticky = col.sticky === 'right'
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider whitespace-nowrap ${getColAlign(col)} ${
                      col.sortable ? 'cursor-pointer hover:text-gray-800 select-none' : ''
                    } ${isLeftSticky || isRightSticky ? 'sticky z-10 bg-gray-50' : ''} ${col.className ?? ''}`}
                    style={{
                      width: col.width,
                      minWidth: col.minWidth ?? 80,
                      left: isLeftSticky ? (showCheckbox ? 48 : 0) : undefined,
                      right: isRightSticky ? 0 : undefined,
                    }}
                    onClick={() => col.sortable && handleSort(col)}
                  >
                    {col.header}
                    {col.sortable && (
                      <SortIcon column={col.key} sortColumn={sortColumn} sortOrder={sortOrder} />
                    )}
                  </th>
                )
              })}

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
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={visibleColumns.length} compact={compact} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length +
                    (showCheckbox ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  className="px-4 py-16 text-center"
                >
                  {emptyState ?? (
                    <div>
                      <div className="text-4xl mb-2">{emptyIcon}</div>
                      <p className="text-gray-500 font-semibold">{emptyMessage}</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const id = getId(row)
                const isSelected = selectedIds.has(id)
                return (
                  <tr
                    key={id || rowIndex}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onContextMenu={(e) => handleContextMenu(e, row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-blue-50' : 'hover:bg-blue-50/40'}`}
                  >
                    {/* Checkbox */}
                    {showCheckbox && (
                      <td
                        className={`px-4 ${cellPy} w-10 sticky left-0 z-10 ${isSelected ? 'bg-blue-100' : 'bg-white'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          className="rounded text-blue-600 focus:ring-blue-400 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {visibleColumns.map((col) => {
                      const isLeftSticky = col.sticky === true || col.sticky === 'left'
                      const isRightSticky = col.sticky === 'right'
                      return (
                        <td
                          key={col.key}
                          className={`px-4 ${cellPy} ${getColAlign(col)} ${
                            isLeftSticky || isRightSticky ? 'sticky z-10' : ''
                          } ${isSelected
                            ? (isLeftSticky || isRightSticky) ? 'bg-blue-100' : ''
                            : (isLeftSticky || isRightSticky) ? 'bg-white' : ''
                          } ${col.className ?? ''}`}
                          style={{
                            width: col.width,
                            minWidth: col.minWidth ?? 80,
                            left: isLeftSticky ? (showCheckbox ? 48 : 0) : undefined,
                            right: isRightSticky ? 0 : undefined,
                          }}
                        >
                          {col.render
                            ? col.render(row, rowIndex)
                            : String((row as Record<string, unknown>)[col.key] ?? '—')}
                        </td>
                      )
                    })}

                    {/* Row actions */}
                    {rowActions && (
                      <td
                        className={`px-4 ${cellPy} text-right`}
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
        storageKey={pageSizeKey}
      />

      {/* ── Bulk action floating bar ── */}
      {hasBulk && selectedCount > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-gray-700"
          style={{ background: '#1f2937', color: '#fff' }}
        >
          <span className="text-sm font-bold">{selectedCount} đã chọn</span>
          <div className="w-px h-5 bg-gray-600" />
          {bulkActions!.map((action, i) => {
            const isDanger = action.variant === 'danger' || action.danger
            return (
              <button
                key={i}
                onClick={() => {
                  const selectedRows = data.filter((row) => selectedIds.has(getId(row)))
                  action.onClick(selectedRows as unknown[])
                  setSelectedIds(new Set())
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            )
          })}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-1 text-gray-400 hover:text-gray-200 text-xs"
            aria-label="Bỏ chọn tất cả"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Context Menu ── */}
      {ctxMenu && (
        <ContextMenu state={ctxMenu} onClose={() => setCtxMenu(null)} />
      )}
    </div>
  )
}
