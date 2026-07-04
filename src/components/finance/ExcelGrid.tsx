'use client'

// NOTE: Virtual scrolling not implemented yet. For very large datasets (>1000 rows),
// consider react-virtual. Current implementation handles typical finance batch sizes (≤500).

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  KeyboardEvent,
  MouseEvent,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExcelColumn {
  key: string
  header: string
  type: 'text' | 'number' | 'currency' | 'date' | 'select' | 'readonly'
  options?: string[]
  width?: number
  formula?: string // e.g. "=SUM(colKey)"
}

export interface ExcelRow {
  id: string
  [key: string]: unknown
  _changed?: boolean
  _error?: string
}

export interface ExcelGridProps {
  columns: ExcelColumn[]
  initialData: ExcelRow[]
  onSave: (changedRows: ExcelRow[]) => Promise<void>
  readonlyColumns?: string[]
  frozenColumns?: number // default 2
}

// ─── History ──────────────────────────────────────────────────────────────────

interface HistoryEntry {
  data: ExcelRow[]
}

const HISTORY_LIMIT = 50

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCurrency = (v: unknown): string => {
  const n = Number(v)
  if (isNaN(n)) return String(v ?? '')
  return new Intl.NumberFormat('vi-VN').format(n)
}

const fmtDate = (v: unknown): string => {
  if (!v) return ''
  try {
    const d = new Date(v as string)
    if (isNaN(d.getTime())) return String(v)
    return d.toLocaleDateString('vi-VN')
  } catch {
    return String(v)
  }
}

function displayValue(col: ExcelColumn, value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  switch (col.type) {
    case 'currency':
      return fmtCurrency(value)
    case 'date':
      return fmtDate(value)
    default:
      return String(value)
  }
}

function editValue(col: ExcelColumn, value: unknown): string {
  if (value === null || value === undefined) return ''
  if (col.type === 'date' && value) {
    try {
      const d = new Date(value as string)
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0] // YYYY-MM-DD for input[type=date]
      }
    } catch {}
  }
  return String(value)
}

function parseValue(col: ExcelColumn, raw: string): unknown {
  switch (col.type) {
    case 'number':
      return raw === '' ? null : Number(raw.replace(/[^0-9.\-]/g, ''))
    case 'currency':
      return raw === '' ? null : Number(raw.replace(/[^0-9.\-]/g, ''))
    case 'date':
      return raw === '' ? null : raw
    default:
      return raw
  }
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

interface ContextMenuState {
  x: number
  y: number
  rowIndex: number
}

function ContextMenu({
  menu,
  onInsertAbove,
  onInsertBelow,
  onDeleteRow,
  onClose,
}: {
  menu: ContextMenuState
  onInsertAbove: (i: number) => void
  onInsertBelow: (i: number) => void
  onDeleteRow: (i: number) => void
  onClose: () => void
}) {
  useEffect(() => {
    const handler = () => onClose()
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      className="fixed z-[100] bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-40"
      style={{ left: menu.x, top: menu.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        onClick={() => { onInsertAbove(menu.rowIndex); onClose() }}
      >
        ↑ Thêm hàng phía trên
      </button>
      <button
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        onClick={() => { onInsertBelow(menu.rowIndex); onClose() }}
      >
        ↓ Thêm hàng phía dưới
      </button>
      <div className="my-1 border-t border-gray-100" />
      <button
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        onClick={() => { onDeleteRow(menu.rowIndex); onClose() }}
      >
        🗑️ Xóa hàng
      </button>
    </div>
  )
}

// ─── Main ExcelGrid ───────────────────────────────────────────────────────────

export default function ExcelGrid({
  columns,
  initialData,
  onSave,
  readonlyColumns = [],
  frozenColumns = 2,
}: ExcelGridProps) {
  const [rows, setRows] = useState<ExcelRow[]>(() =>
    initialData.map((r) => ({ ...r, _changed: false })),
  )
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [rangeStart, setRangeStart] = useState<{ row: number; col: number } | null>(null)
  const [editing, setEditing] = useState<{ row: number; col: number } | null>(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Undo/Redo stacks
  const [history, setHistory] = useState<HistoryEntry[]>([{ data: initialData }])
  const [historyIdx, setHistoryIdx] = useState(0)

  const gridRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null)

  // ── Derived state ─────────────────────────────────────────────────────────

  const changedRows = useMemo(() => rows.filter((r) => r._changed), [rows])
  const changedCount = changedRows.length

  // ── History management ────────────────────────────────────────────────────

  const pushHistory = useCallback((newRows: ExcelRow[]) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIdx + 1)
      const next = [...truncated, { data: newRows }]
      if (next.length > HISTORY_LIMIT) next.shift()
      return next
    })
    setHistoryIdx((prev) => Math.min(prev + 1, HISTORY_LIMIT - 1))
  }, [historyIdx])

  const undo = useCallback(() => {
    if (historyIdx <= 0) return
    const idx = historyIdx - 1
    setRows(history[idx].data.map((r) => ({ ...r })))
    setHistoryIdx(idx)
  }, [history, historyIdx])

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return
    const idx = historyIdx + 1
    setRows(history[idx].data.map((r) => ({ ...r })))
    setHistoryIdx(idx)
  }, [history, historyIdx])

  // ── Update cell ───────────────────────────────────────────────────────────

  const updateCell = useCallback(
    (rowIndex: number, colKey: string, value: unknown) => {
      setRows((prev) => {
        const next = prev.map((r, i) =>
          i === rowIndex
            ? { ...r, [colKey]: value, _changed: true }
            : r,
        )
        pushHistory(next)
        return next
      })
      // Auto-save debounce
      if (autoSaveTimer) clearTimeout(autoSaveTimer)
      const timer = setTimeout(() => {
        // Will call onSave with changed rows via effect
      }, 2000)
      setAutoSaveTimer(timer)
    },
    [pushHistory, autoSaveTimer],
  )

  // ── Is readonly ───────────────────────────────────────────────────────────

  const isReadonly = useCallback(
    (col: ExcelColumn) => col.type === 'readonly' || readonlyColumns.includes(col.key),
    [readonlyColumns],
  )

  // ── Selection helpers ─────────────────────────────────────────────────────

  const getRange = useCallback(() => {
    if (!selected || !rangeStart) return null
    return {
      r1: Math.min(selected.row, rangeStart.row),
      r2: Math.max(selected.row, rangeStart.row),
      c1: Math.min(selected.col, rangeStart.col),
      c2: Math.max(selected.col, rangeStart.col),
    }
  }, [selected, rangeStart])

  const inRange = useCallback(
    (row: number, col: number) => {
      const r = getRange()
      if (!r) return selected?.row === row && selected?.col === col
      return row >= r.r1 && row <= r.r2 && col >= r.c1 && col <= r.c2
    },
    [getRange, selected],
  )

  // ── Commit edit ───────────────────────────────────────────────────────────

  const commitEdit = useCallback(() => {
    if (!editing) return
    const col = columns[editing.col]
    if (!col || isReadonly(col)) { setEditing(null); return }
    const parsed = parseValue(col, editVal)
    updateCell(editing.row, col.key, parsed)
    setEditing(null)
  }, [editing, columns, editVal, isReadonly, updateCell])

  // ── Start editing ─────────────────────────────────────────────────────────

  const startEdit = useCallback(
    (row: number, col: number, initialChar?: string) => {
      const colDef = columns[col]
      if (!colDef || isReadonly(colDef)) return
      setEditing({ row, col })
      const currentVal = editValue(colDef, rows[row]?.[colDef.key])
      setEditVal(initialChar !== undefined ? initialChar : currentVal)
      setTimeout(() => inputRef.current?.focus(), 0)
    },
    [columns, isReadonly, rows],
  )

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!selected) return

      // While editing
      if (editing) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setEditing(null)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          commitEdit()
          setSelected({ row: Math.min(selected.row + 1, rows.length - 1), col: selected.col })
        } else if (e.key === 'Tab') {
          e.preventDefault()
          commitEdit()
          if (e.shiftKey) {
            setSelected({ row: selected.row, col: Math.max(0, selected.col - 1) })
          } else {
            setSelected({ row: selected.row, col: Math.min(columns.length - 1, selected.col + 1) })
          }
        }
        return
      }

      // Ctrl combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault()
            undo()
            return
          case 'y':
            e.preventDefault()
            redo()
            return
          case 'c':
            e.preventDefault()
            handleCopy()
            return
          case 'v':
            e.preventDefault()
            handlePaste()
            return
          case 'd':
            e.preventDefault()
            handleFillDown()
            return
        }
      }

      // Navigation
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setSelected((s) => s ? { ...s, row: Math.max(0, s.row - 1) } : null)
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelected((s) => s ? { ...s, row: Math.min(rows.length - 1, s.row + 1) } : null)
          break
        case 'ArrowLeft':
          e.preventDefault()
          setSelected((s) => s ? { ...s, col: Math.max(0, s.col - 1) } : null)
          break
        case 'ArrowRight':
          e.preventDefault()
          setSelected((s) => s ? { ...s, col: Math.min(columns.length - 1, s.col + 1) } : null)
          break
        case 'Enter':
          e.preventDefault()
          startEdit(selected.row, selected.col)
          break
        case 'Tab':
          e.preventDefault()
          if (e.shiftKey) {
            setSelected({ row: selected.row, col: Math.max(0, selected.col - 1) })
          } else {
            setSelected({ row: selected.row, col: Math.min(columns.length - 1, selected.col + 1) })
          }
          break
        case 'Escape':
          setSelected(null)
          break
        case 'Delete':
        case 'Backspace': {
          const col = columns[selected.col]
          if (col && !isReadonly(col)) updateCell(selected.row, col.key, null)
          break
        }
        default:
          // Start typing → start edit
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            startEdit(selected.row, selected.col, e.key)
          }
      }
    },
    [selected, editing, rows.length, columns, commitEdit, undo, redo, startEdit, isReadonly, updateCell],
  )

  // ── Copy ──────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(() => {
    const r = getRange()
    if (!r) return
    const lines: string[] = []
    for (let ri = r.r1; ri <= r.r2; ri++) {
      const cells: string[] = []
      for (let ci = r.c1; ci <= r.c2; ci++) {
        const col = columns[ci]
        if (!col) continue
        cells.push(displayValue(col, rows[ri]?.[col.key]))
      }
      lines.push(cells.join('\t'))
    }
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {})
  }, [getRange, columns, rows])

  // ── Paste ─────────────────────────────────────────────────────────────────

  const handlePaste = useCallback(() => {
    if (!selected) return
    navigator.clipboard.readText().then((text) => {
      const lines = text.split('\n').map((l) => l.split('\t'))
      setRows((prev) => {
        const next = [...prev.map((r) => ({ ...r }))]
        lines.forEach((cells, ri) => {
          const rowIdx = selected.row + ri
          if (rowIdx >= next.length) return
          cells.forEach((cellVal, ci) => {
            const colIdx = selected.col + ci
            const col = columns[colIdx]
            if (!col || isReadonly(col)) return
            next[rowIdx] = {
              ...next[rowIdx],
              [col.key]: parseValue(col, cellVal.trim()),
              _changed: true,
            }
          })
        })
        pushHistory(next)
        return next
      })
    }).catch(() => {})
  }, [selected, columns, isReadonly, pushHistory])

  // ── Fill Down (Ctrl+D) ────────────────────────────────────────────────────

  const handleFillDown = useCallback(() => {
    const r = getRange()
    if (!r || !selected) return
    const topRow = rows[r.r1]
    if (!topRow) return
    setRows((prev) => {
      const next = [...prev.map((row) => ({ ...row }))]
      for (let ri = r.r1 + 1; ri <= r.r2; ri++) {
        for (let ci = r.c1; ci <= r.c2; ci++) {
          const col = columns[ci]
          if (!col || isReadonly(col)) continue
          next[ri] = { ...next[ri], [col.key]: topRow[col.key], _changed: true }
        }
      }
      pushHistory(next)
      return next
    })
  }, [getRange, rows, columns, isReadonly, pushHistory, selected])

  // ── Row operations ────────────────────────────────────────────────────────

  const insertRowAbove = useCallback((idx: number) => {
    const newRow: ExcelRow = { id: `new-${Date.now()}-${Math.random()}`, _changed: true }
    setRows((prev) => {
      const next = [...prev.slice(0, idx), newRow, ...prev.slice(idx)]
      pushHistory(next)
      return next
    })
  }, [pushHistory])

  const insertRowBelow = useCallback((idx: number) => {
    const newRow: ExcelRow = { id: `new-${Date.now()}-${Math.random()}`, _changed: true }
    setRows((prev) => {
      const next = [...prev.slice(0, idx + 1), newRow, ...prev.slice(idx + 1)]
      pushHistory(next)
      return next
    })
  }, [pushHistory])

  const deleteRow = useCallback((idx: number) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      pushHistory(next)
      return next
    })
    setSelected(null)
  }, [pushHistory])

  // ── Context menu ──────────────────────────────────────────────────────────

  const handleContextMenu = useCallback((e: MouseEvent, rowIndex: number) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, rowIndex })
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (changedRows.length === 0) return
    setSaving(true)
    try {
      await onSave(changedRows)
      setRows((prev) =>
        prev.map((r) => (r._changed ? { ...r, _changed: false } : r)),
      )
    } finally {
      setSaving(false)
    }
  }, [changedRows, onSave])

  // ── Formula row (SUM) ─────────────────────────────────────────────────────

  const columnSums = useMemo(() => {
    const sums: Record<string, number | null> = {}
    columns.forEach((col) => {
      if (col.type === 'number' || col.type === 'currency') {
        const sum = rows.reduce((acc, r) => {
          const v = Number(r[col.key])
          return isNaN(v) ? acc : acc + v
        }, 0)
        sums[col.key] = sum
      } else {
        sums[col.key] = null
      }
    })
    return sums
  }, [rows, columns])

  // ── Global keyboard handler ───────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (!selected || editing) return
      if (e.key === 'Escape') setSelected(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selected, editing])

  // ── Focus input when editing ──────────────────────────────────────────────

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [editing])

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <button
          onClick={handleSave}
          disabled={saving || changedCount === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
        >
          {saving ? (
            <>
              <span
                className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}
              />
              Đang lưu...
            </>
          ) : (
            <>💾 Lưu</>
          )}
        </button>

        <button
          onClick={undo}
          disabled={historyIdx <= 0}
          title="Ctrl+Z"
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          ↩️ Hoàn tác
        </button>

        <button
          onClick={redo}
          disabled={historyIdx >= history.length - 1}
          title="Ctrl+Y"
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          ↪️ Làm lại
        </button>

        {changedCount > 0 && (
          <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            ✏️ Đã sửa: {changedCount} hàng
          </span>
        )}
      </div>

      {/* ── Grid ── */}
      <div
        ref={gridRef}
        className="overflow-auto outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ maxHeight: '70vh' }}
      >
        <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
          {/* Colgroup for width */}
          <colgroup>
            <col style={{ width: 40 }} />
            {columns.map((col, ci) => (
              <col key={ci} style={{ width: col.width ?? 140 }} />
            ))}
          </colgroup>

          {/* Header */}
          <thead className="sticky top-0 z-20">
            <tr style={{ background: '#f1f5f9' }}>
              {/* Row number header */}
              <th className="border border-gray-200 px-2 py-2 text-xs text-gray-400 font-semibold text-center w-10" />
              {columns.map((col, ci) => (
                <th
                  key={ci}
                  className={`border border-gray-200 px-2 py-2 text-xs font-bold text-gray-600 text-left truncate ${
                    ci < frozenColumns ? 'sticky z-30' : ''
                  }`}
                  style={{
                    left: ci < frozenColumns
                      ? `${40 + columns.slice(0, ci).reduce((a, c) => a + (c.width ?? 140), 0)}px`
                      : undefined,
                    background: ci < frozenColumns ? '#f1f5f9' : undefined,
                  }}
                >
                  {String.fromCharCode(65 + ci)} — {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.id}
                onContextMenu={(e) => handleContextMenu(e, ri)}
                className={row._changed ? 'bg-amber-50/60' : ''}
              >
                {/* Row number */}
                <td className="border border-gray-200 px-2 py-1.5 text-xs text-gray-400 text-center select-none bg-gray-50">
                  {ri + 1}
                </td>

                {columns.map((col, ci) => {
                  const isEditingThis = editing?.row === ri && editing?.col === ci
                  const isSelectedThis = selected?.row === ri && selected?.col === ci
                  const isInRange = inRange(ri, ci)
                  const readonly = isReadonly(col)
                  const cellValue = row[col.key]
                  const hasError = ri === ri && row._error

                  return (
                    <td
                      key={ci}
                      className={`border px-0 py-0 relative ${
                        ci < frozenColumns ? 'sticky z-10' : ''
                      } ${
                        isSelectedThis
                          ? 'border-blue-500 border-2 outline-none ring-0'
                          : isInRange
                          ? 'bg-blue-50 border-blue-200'
                          : 'border-gray-200'
                      } ${row._changed && cellValue !== initialData[ri]?.[col.key] ? 'bg-amber-100' : ''}`}
                      style={{
                        left: ci < frozenColumns
                          ? `${40 + columns.slice(0, ci).reduce((a, c) => a + (c.width ?? 140), 0)}px`
                          : undefined,
                        background:
                          ci < frozenColumns && !isInRange && !isSelectedThis
                            ? (row._changed ? '#fef9c3' : '#fff')
                            : undefined,
                      }}
                      onClick={(e) => {
                        if (e.shiftKey && selected) {
                          setRangeStart(selected)
                          setSelected({ row: ri, col: ci })
                        } else {
                          setRangeStart(null)
                          setSelected({ row: ri, col: ci })
                        }
                        gridRef.current?.focus()
                      }}
                      onDoubleClick={() => !readonly && startEdit(ri, ci)}
                    >
                      {isEditingThis ? (
                        col.type === 'select' ? (
                          <select
                            ref={inputRef as React.RefObject<HTMLSelectElement>}
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') { e.stopPropagation(); setEditing(null) }
                              if (e.key === 'Enter') { e.stopPropagation(); commitEdit() }
                            }}
                            className="w-full h-full px-2 py-1.5 text-sm outline-none border-0 bg-white"
                          >
                            <option value="">—</option>
                            {col.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type={col.type === 'date' ? 'date' : col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') { e.stopPropagation(); setEditing(null) }
                              if (e.key === 'Enter') { e.stopPropagation(); commitEdit() }
                              if (e.key === 'Tab') { e.stopPropagation(); commitEdit() }
                            }}
                            className="w-full h-full px-2 py-1.5 text-sm outline-none border-0 bg-white"
                          />
                        )
                      ) : (
                        <div
                          className={`px-2 py-1.5 truncate min-h-[32px] ${
                            readonly ? 'text-gray-500 bg-gray-50/80' : ''
                          } ${
                            col.type === 'number' || col.type === 'currency' ? 'text-right font-mono' : ''
                          }`}
                          title={displayValue(col, cellValue)}
                        >
                          {displayValue(col, cellValue) || (
                            <span className="text-gray-300 italic text-xs">—</span>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>

          {/* Formula / SUM row */}
          <tfoot className="sticky bottom-0 z-20">
            <tr style={{ background: '#f8fafc' }}>
              <td className="border border-gray-200 px-2 py-2 text-xs font-bold text-gray-500 text-center">
                Σ
              </td>
              {columns.map((col, ci) => {
                const sum = columnSums[col.key]
                return (
                  <td
                    key={ci}
                    className="border border-gray-200 px-2 py-2 text-xs font-bold text-gray-700 text-right"
                  >
                    {sum !== null
                      ? col.type === 'currency'
                        ? fmtCurrency(sum)
                        : sum.toLocaleString('vi-VN')
                      : ''}
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <ContextMenu
          menu={contextMenu}
          onInsertAbove={insertRowAbove}
          onInsertBelow={insertRowBelow}
          onDeleteRow={deleteRow}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* ── Keyboard hints ── */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3 text-xs text-gray-400">
        <span>↵ Sửa</span>
        <span>ESC Thoát</span>
        <span>Ctrl+C/V Sao chép/Dán</span>
        <span>Ctrl+D Điền xuống</span>
        <span>Ctrl+Z/Y Hoàn tác/Làm lại</span>
        <span>Chuột phải → Thêm/Xóa hàng</span>
      </div>
    </div>
  )
}
