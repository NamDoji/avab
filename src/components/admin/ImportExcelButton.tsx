'use client'

import { useRef, useState, useCallback } from 'react'

export type ImportEntityType = 'students' | 'teachers' | 'leads' | 'staff' | 'classes'

interface ImportExcelButtonProps {
  entityType: ImportEntityType
  label?: string
  onSuccess?: (count: number) => void
  /** 'dark' = white buttons for use on colored/dark header backgrounds (default)
   *  'light' = colored buttons for use on white/light toolbars */
  variant?: 'dark' | 'light'
}

interface ParsedRow {
  data: Record<string, string>
  hasError: boolean
  errorMsg?: string
}

// Required fields per entity type (must match template headers)
const REQUIRED_FIELDS: Record<ImportEntityType, string[]> = {
  students: ['Họ và tên (*)', 'Số điện thoại (*)'],
  teachers: ['Họ và tên (*)', 'Số điện thoại (*)'],
  leads:    ['Họ tên PH/HS (*)', 'Số điện thoại (*)'],
  staff:    ['Họ và tên (*)', 'Số điện thoại (*)'],
  classes:  ['Tên lớp (*)', 'Mã lớp (*)'],
}

const ENTITY_LABELS: Record<ImportEntityType, string> = {
  students: 'học sinh',
  teachers: 'giáo viên',
  leads:    'khách hàng',
  staff:    'nhân viên',
  classes:  'lớp học',
}

function validateRow(row: Record<string, string>, required: string[]): string | null {
  for (const field of required) {
    if (!row[field] || row[field].trim() === '') {
      return `Thiếu "${field}"`
    }
  }
  return null
}

export function ImportExcelButton({ entityType, label, onSuccess, variant = 'dark' }: ImportExcelButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showModal, setShowModal] = useState(false)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; failed: number; errors: { row: number; message: string }[] } | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const required = REQUIRED_FIELDS[entityType]
  const entityLabel = ENTITY_LABELS[entityType]

  const validRows = parsedRows.filter((r) => !r.hasError)
  const errorRows = parsedRows.filter((r) => r.hasError)

  const openFilePicker = () => {
    fileRef.current?.click()
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileError(null)
    setResult(null)
    setLoading(true)

    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]

      if (!ws) throw new Error('File trống hoặc không hợp lệ')

      const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

      if (rawData.length === 0) {
        setFileError('File không có dữ liệu. Vui lòng dùng template chuẩn.')
        setLoading(false)
        return
      }

      // Grab headers from first row keys
      const hdrs = Object.keys(rawData[0])
      setHeaders(hdrs)

      // Check that at least one required column exists
      const missingRequired = required.filter((r) => !hdrs.includes(r))
      if (missingRequired.length === required.length) {
        setFileError(
          `File không đúng format. Thiếu cột: ${missingRequired.join(', ')}. Vui lòng tải và dùng template chuẩn.`
        )
        setLoading(false)
        // Reset file input
        if (fileRef.current) fileRef.current.value = ''
        return
      }

      const parsed: ParsedRow[] = rawData.map((rawRow) => {
        const row: Record<string, string> = {}
        for (const [k, v] of Object.entries(rawRow)) {
          row[k] = String(v ?? '').trim()
        }
        const errMsg = validateRow(row, required)
        return { data: row, hasError: errMsg !== null, errorMsg: errMsg ?? undefined }
      })

      setParsedRows(parsed)
      setShowModal(true)
    } catch (err) {
      setFileError(`Lỗi đọc file: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
      // Reset input so same file can be picked again
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [required])

  const handleImport = async () => {
    if (validRows.length === 0) return
    setImporting(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: entityType,
          rows: validRows.map((r) => r.data),
          skipErrors: true,
        }),
      })

      const json = await res.json() as { success: boolean; imported?: number; failed?: number; errors?: { row: number; message: string }[]; error?: string }

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Import thất bại')
      }

      setResult({
        imported: json.imported ?? 0,
        failed: json.failed ?? 0,
        errors: json.errors ?? [],
      })

      if (json.imported && json.imported > 0) {
        onSuccess?.(json.imported)
      }
    } catch (err) {
      setResult({
        imported: 0,
        failed: validRows.length,
        errors: [{ row: 0, message: err instanceof Error ? err.message : String(err) }],
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setParsedRows([])
    setHeaders([])
    setResult(null)
    setFileError(null)
  }

  const previewHeaders = headers.slice(0, 5) // Show max 5 columns in preview
  const previewRows = parsedRows.slice(0, 5)  // Show first 5 rows

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {/* Download Template */}
        <a
          href={`/api/admin/migration/template?type=${entityType}`}
          download
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            background: variant === 'dark' ? 'rgba(255,255,255,0.15)' : '#f3f4f6',
            color: variant === 'dark' ? '#fff' : '#374151',
            textDecoration: 'none',
            transition: 'opacity 0.15s',
            border: variant === 'light' ? '1px solid #e5e7eb' : 'none',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          📄 Tải template
        </a>

        {/* Import Excel */}
        <button
          type="button"
          onClick={openFilePicker}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            background: variant === 'dark' ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #0f766e, #0369a1)',
            color: '#fff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}
          onMouseOver={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseOut={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          {loading ? '⏳ Đang đọc...' : `📥 ${label ?? `Import ${entityLabel}`}`}
        </button>
      </div>

      {/* File error toast (outside modal) */}
      {fileError && !showModal && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 20px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 9999,
            maxWidth: 480,
            textAlign: 'center',
          }}
        >
          ❌ {fileError}
          <button
            onClick={() => setFileError(null)}
            style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900, color: '#991b1b' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
            onClick={handleClose}
          />

          {/* Dialog */}
          <div
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: 20,
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              padding: 28,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#111827' }}>
                  📥 Import {entityLabel}
                </h2>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Xem trước dữ liệu trước khi import vào hệ thống
                </p>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9ca3af', padding: 4 }}
              >
                ×
              </button>
            </div>

            {/* File error inside modal */}
            {fileError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
                ❌ {fileError}
              </div>
            )}

            {/* Stats */}
            {!result && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 11, color: '#166534', fontWeight: 700, margin: 0 }}>✅ Hợp lệ</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: '#166534', margin: '4px 0 0' }}>{validRows.length}</p>
                </div>
                <div style={{ background: errorRows.length > 0 ? '#fef2f2' : '#f9fafb', border: `1px solid ${errorRows.length > 0 ? '#fecaca' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 16px', flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 11, color: errorRows.length > 0 ? '#991b1b' : '#6b7280', fontWeight: 700, margin: 0 }}>⚠️ Lỗi</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: errorRows.length > 0 ? '#dc2626' : '#9ca3af', margin: '4px 0 0' }}>{errorRows.length}</p>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 16px', flex: 1, minWidth: 120 }}>
                  <p style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 700, margin: 0 }}>📊 Tổng</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: '#1d4ed8', margin: '4px 0 0' }}>{parsedRows.length}</p>
                </div>
              </div>
            )}

            {/* Import result */}
            {result && (
              <div
                style={{
                  background: result.imported > 0 ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${result.imported > 0 ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 20,
                }}
              >
                <p style={{ fontWeight: 900, fontSize: 15, margin: '0 0 8px', color: result.imported > 0 ? '#166534' : '#991b1b' }}>
                  {result.imported > 0 ? `✅ Đã import ${result.imported} ${entityLabel}` : '❌ Import thất bại'}
                </p>
                {result.failed > 0 && (
                  <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 8px' }}>
                    ⚠️ {result.failed} dòng thất bại
                  </p>
                )}
                {result.errors.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#991b1b' }}>
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>Dòng {e.row}: {e.message}</li>
                    ))}
                    {result.errors.length > 5 && <li>... và {result.errors.length - 5} lỗi khác</li>}
                  </ul>
                )}
              </div>
            )}

            {/* Preview table */}
            {!result && parsedRows.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                  Xem trước (5 dòng đầu):
                </p>
                <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 700, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>#</th>
                        {previewHeaders.map((h) => (
                          <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 700, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                        {headers.length > 5 && <th style={{ padding: '8px 10px', color: '#9ca3af', borderBottom: '1px solid #e5e7eb' }}>...</th>}
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 700, borderBottom: '1px solid #e5e7eb' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr
                          key={idx}
                          style={{
                            background: row.hasError ? '#fef2f2' : '#fff',
                            borderTop: '1px solid #f1f5f9',
                          }}
                        >
                          <td style={{ padding: '6px 10px', color: '#9ca3af' }}>{idx + 2}</td>
                          {previewHeaders.map((h) => (
                            <td
                              key={h}
                              style={{
                                padding: '6px 10px',
                                color: '#374151',
                                maxWidth: 150,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {row.data[h] ?? '—'}
                            </td>
                          ))}
                          {headers.length > 5 && <td style={{ padding: '6px 10px', color: '#9ca3af' }}>…</td>}
                          <td style={{ padding: '6px 10px' }}>
                            {row.hasError ? (
                              <span style={{ color: '#dc2626', fontSize: 11, fontWeight: 700 }}>
                                ❌ {row.errorMsg}
                              </span>
                            ) : (
                              <span style={{ color: '#059669', fontSize: 11, fontWeight: 700 }}>✅ OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 5 && (
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                    ... và {parsedRows.length - 5} dòng khác
                  </p>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {result ? (
                <button
                  onClick={handleClose}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    background: 'linear-gradient(135deg, #0f766e, #0369a1)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
              ) : (
                <>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={openFilePicker}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer',
                    }}
                  >
                    📂 Chọn file khác
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || validRows.length === 0}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      background:
                        importing || validRows.length === 0
                          ? '#d1d5db'
                          : 'linear-gradient(135deg, #0f766e, #0369a1)',
                      color: importing || validRows.length === 0 ? '#9ca3af' : '#fff',
                      border: 'none',
                      cursor: importing || validRows.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {importing ? '⏳ Đang import...' : `✅ Xác nhận import ${validRows.length} dòng`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImportExcelButton
