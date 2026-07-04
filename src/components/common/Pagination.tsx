'use client'

import { useState, useEffect, useCallback } from 'react'

const DEFAULT_PAGE_SIZE_KEY = 'dataTablePageSize'
const DEFAULT_PAGE_SIZES = [20, 50, 100, 200]

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  /** localStorage key for persisting pageSize preference */
  storageKey?: string
  className?: string
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = []
  pages.push(1)
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  storageKey,
  className = '',
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('')

  // ── Load preference from localStorage on mount ────────────────────────────
  useEffect(() => {
    const key = storageKey ?? DEFAULT_PAGE_SIZE_KEY
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const n = parseInt(stored, 10)
        if (!isNaN(n) && pageSizeOptions.includes(n) && n !== pageSize) {
          onPageSizeChange(n)
        }
      }
    } catch {}
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Persist page size when it changes ─────────────────────────────────────
  useEffect(() => {
    const key = storageKey ?? DEFAULT_PAGE_SIZE_KEY
    try {
      localStorage.setItem(key, String(pageSize))
    } catch {}
  }, [pageSize, storageKey])

  const handleJump = useCallback(() => {
    const n = parseInt(jumpValue, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      onPageChange(n)
      setJumpValue('')
    }
  }, [jumpValue, totalPages, onPageChange])

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)
  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 ${className}`}
    >
      {/* Left: page size + record range */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>Hiển thị</span>
        <select
          value={pageSize}
          onChange={(e) => {
            const size = Number(e.target.value)
            onPageSizeChange(size)
          }}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span>bản ghi</span>
        {totalCount > 0 && (
          <span className="text-gray-400">
            ({startItem.toLocaleString('vi-VN')}–{endItem.toLocaleString('vi-VN')} trong{' '}
            {totalCount.toLocaleString('vi-VN')} bản ghi)
          </span>
        )}
      </div>

      {/* Right: navigation */}
      <div className="flex items-center gap-1">
        {/* First |◀ */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang đầu"
          aria-label="Trang đầu"
        >
          «
        </button>
        {/* Prev ◀ */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
          aria-label="Trang trước"
        >
          ‹
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-gray-400 text-xs">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                p === currentPage ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={
                p === currentPage
                  ? { background: 'linear-gradient(135deg, #0f766e, #0369a1)' }
                  : {}
              }
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        {/* Next ▶ */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang sau"
          aria-label="Trang sau"
        >
          ›
        </button>
        {/* Last ▶| */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="px-2 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang cuối"
          aria-label="Trang cuối"
        >
          »
        </button>

        {/* Jump to page */}
        {totalPages > 5 && (
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-gray-400">Đến</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJump()}
              onBlur={handleJump}
              className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={String(currentPage)}
              aria-label="Nhảy đến trang"
            />
          </div>
        )}
      </div>
    </div>
  )
}
