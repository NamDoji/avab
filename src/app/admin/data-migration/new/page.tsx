'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ValidationError {
  row: number
  field: string
  value: string
  message: string
}

interface ImportError {
  row: number
  message: string
}

interface PollData {
  status: string
  successRows: number
  failedRows: number
  totalRows: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MODULE_OPTIONS = [
  { value: 'students', label: '👦 Học sinh' },
  { value: 'teachers', label: '👨‍🏫 Giáo viên' },
  { value: 'courses',  label: '📚 Khóa học' },
  { value: 'rooms',    label: '🚪 Phòng học' },
  { value: 'questions',label: '❓ Câu hỏi' },
]

const MODULE_FIELDS: Record<string, Array<{ value: string; label: string }>> = {
  students: [
    { value: 'name', label: 'Họ và tên' },
    { value: 'phone', label: 'Số điện thoại' },
    { value: 'email', label: 'Email' },
    { value: 'parentName', label: 'Tên phụ huynh' },
    { value: 'parentPhone', label: 'SĐT phụ huynh' },
    { value: 'courseCode', label: 'Mã khóa học' },
  ],
  teachers: [
    { value: 'name', label: 'Họ và tên' },
    { value: 'phone', label: 'Số điện thoại' },
    { value: 'email', label: 'Email' },
    { value: 'specialization', label: 'Chuyên môn' },
  ],
  courses: [
    { value: 'code', label: 'Mã khóa học' },
    { value: 'name', label: 'Tên khóa học' },
    { value: 'description', label: 'Mô tả' },
    { value: 'gradeMin', label: 'Khối lớp' },
    { value: 'subjectCode', label: 'Mã môn học' },
    { value: 'price', label: 'Học phí' },
  ],
  rooms: [
    { value: 'name', label: 'Tên phòng' },
    { value: 'capacity', label: 'Sức chứa' },
    { value: 'type', label: 'Loại phòng' },
    { value: 'floor', label: 'Tầng' },
    { value: 'building', label: 'Tòa nhà' },
  ],
  questions: [
    { value: 'subjectName', label: 'Tên chuyên đề' },
    { value: 'content', label: 'Nội dung câu hỏi' },
    { value: 'correctAnswer', label: 'Đáp án đúng' },
    { value: 'explanation', label: 'Giải thích' },
    { value: 'questionType', label: 'Loại câu hỏi' },
  ],
}

const STEPS = [
  'Upload',
  'Phân tích',
  'Mapping',
  'Kiểm tra',
  'Preview',
  'Import',
  'Kết quả',
]

// ─── Wizard Component ─────────────────────────────────────────────────────────

export default function DataMigrationNewPage() {
  const [step, setStep] = useState(1)
  const [module, setModule] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // After upload
  const [migrationId, setMigrationId] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [preview, setPreview] = useState<Record<string, unknown>[]>([])
  const [allRows, setAllRows] = useState<Record<string, unknown>[]>([])
  const [suggestedMapping, setSuggestedMapping] = useState<Record<string, string | null>>({})
  const [mapping, setMapping] = useState<Record<string, string | null>>({})
  const [totalRows, setTotalRows] = useState(0)

  // Validation
  const [validRows, setValidRows] = useState<Record<string, unknown>[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [validStats, setValidStats] = useState({ total: 0, validCount: 0, errorCount: 0 })
  const [skipErrors, setSkipErrors] = useState(false)

  // Import
  const [importResult, setImportResult] = useState<{ imported: number; failed: number; errors: ImportError[] } | null>(null)
  const [pollData, setPollData] = useState<PollData | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && /\.(xlsx|xls|csv)$/i.test(dropped.name)) {
      setFile(dropped)
      setError('')
    } else {
      setError('Chỉ hỗ trợ file .xlsx, .xls, .csv')
    }
  }, [])

  // ── Step 1 → 2 (Upload) ──────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!file || !module) {
      setError('Vui lòng chọn module và file')
      return
    }
    setError('')
    setStep(2)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('module', module)

      const res = await fetch('/api/admin/migration/upload', { method: 'POST', body: formData })
      const json = await res.json()

      if (!json.success) throw new Error(json.error ?? 'Upload thất bại')

      setMigrationId(json.migrationId)
      setHeaders(json.headers ?? [])
      setPreview(json.preview ?? [])
      setAllRows(json.allRows ?? [])
      setSuggestedMapping(json.suggestedMapping ?? {})
      setMapping(json.suggestedMapping ?? {})
      setTotalRows(json.totalRows ?? 0)

      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3 → 4 (Validate) ────────────────────────────────────────────────

  const handleValidate = async () => {
    setError('')
    setStep(4)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/migration/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migrationId, mapping, data: allRows }),
      })
      const json = await res.json()

      if (!json.success) throw new Error(json.error ?? 'Validation thất bại')

      setValidRows(json.valid ?? [])
      setValidationErrors(json.errors ?? [])
      setValidStats(json.stats ?? { total: 0, validCount: 0, errorCount: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 5 → 6 (Import) ──────────────────────────────────────────────────

  const handleImport = async () => {
    setError('')
    setStep(6)
    setLoading(true)

    const rowsToImport = skipErrors ? validRows : allRows

    try {
      const res = await fetch('/api/admin/migration/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migrationId, mapping, data: rowsToImport, skipErrors }),
      })
      const json = await res.json()

      if (!json.success) throw new Error(json.error ?? 'Import thất bại')

      setImportResult({ imported: json.imported, failed: json.failed, errors: json.errors ?? [] })
      setStep(7)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      setStep(5)
    } finally {
      setLoading(false)
    }
  }

  // Poll MigrationLog for progress while in step 6
  useEffect(() => {
    if (step === 6 && migrationId) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/admin/migration/${migrationId}`)
          const json = await res.json()
          if (json.success) {
            setPollData({
              status: json.data.status,
              successRows: json.data.successRows,
              failedRows: json.data.failedRows,
              totalRows: json.data.totalRows,
            })
            if (json.data.status === 'done' || json.data.status === 'failed') {
              if (pollRef.current) clearInterval(pollRef.current)
            }
          }
        } catch { /* silent */ }
      }, 2000)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [step, migrationId])

  const resetWizard = () => {
    setStep(1)
    setModule('')
    setFile(null)
    setMigrationId('')
    setHeaders([])
    setPreview([])
    setAllRows([])
    setSuggestedMapping({})
    setMapping({})
    setTotalRows(0)
    setValidRows([])
    setValidationErrors([])
    setValidStats({ total: 0, validCount: 0, errorCount: 0 })
    setSkipErrors(false)
    setImportResult(null)
    setPollData(null)
    setError('')
  }

  const fieldOptions = MODULE_FIELDS[module] ?? []

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
      >
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
        <div className="container-custom relative">
          <Link href="/admin/data-migration" className="text-sky-200 text-sm hover:text-white transition-colors">
            ← Data Migration Center
          </Link>
          <h1 className="text-3xl font-black mt-2">🚀 Import mới</h1>
          <p className="text-sky-200 text-sm mt-1">Wizard 7 bước — AI phân tích tự động</p>
        </div>
      </div>

      <div className="container-custom py-8 max-w-4xl">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, idx) => {
              const num = idx + 1
              const isActive = num === step
              const isDone = num < step
              return (
                <div key={label} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all
                      ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-400'}`}
                  >
                    {isDone ? '✓' : num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-indigo-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* connector line */}
          <div className="relative h-1 bg-gray-200 rounded-full -mt-5 mx-4 z-0">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              style={{
                width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
                background: 'linear-gradient(90deg, #22c55e, #6366f1)',
              }}
            />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* ── Step 1: Upload ────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-800 mb-1">📁 Bước 1 — Upload File</h2>
              <p className="text-sm text-gray-500">Chọn module đích và upload file Excel/CSV</p>
            </div>

            {/* Module select */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Chọn Module *</label>
              <select
                value={module}
                onChange={e => setModule(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="">-- Chọn module --</option>
                {MODULE_OPTIONS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Drag & drop zone */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">File dữ liệu *</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
                  ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setFile(f); setError('') }
                  }}
                />
                {file ? (
                  <div className="space-y-2">
                    <div className="text-4xl">📄</div>
                    <p className="font-bold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null) }}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Xóa file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-5xl">📂</div>
                    <div>
                      <p className="font-bold text-gray-600">Kéo thả file vào đây</p>
                      <p className="text-sm text-gray-400 mt-1">hoặc click để chọn file</p>
                    </div>
                    <p className="text-xs text-gray-400">Hỗ trợ: .xlsx, .xls, .csv</p>
                  </div>
                )}
              </div>
            </div>

            {/* Template download */}
            {module && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>💡 Chưa có file?</span>
                <a
                  href={`/api/admin/migration/template?module=${module}`}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  📥 Tải template mẫu
                </a>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!file || !module}
                className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
              >
                Phân tích →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: AI Analyzing ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center space-y-6">
            <div className="text-6xl animate-bounce">🤖</div>
            <div>
              <h2 className="text-xl font-black text-gray-800">AI đang phân tích cấu trúc file...</h2>
              <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
            </div>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <div className="text-xs text-gray-400">
              Đang xử lý file · Đọc cấu trúc · Gọi GPT-4o · Đề xuất mapping
            </div>
          </div>
        )}

        {/* ── Step 3: AI Mapping ────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-800">🗺️ Bước 3 — Xác nhận Mapping</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                AI đã đề xuất mapping · Xanh = tự động · Vàng = cần xác nhận
              </p>
            </div>

            <div className="p-6 space-y-3">
              {/* Legend */}
              <div className="flex gap-4 text-xs mb-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                  AI tự map được
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                  Cần xác nhận
                </span>
              </div>

              {/* Mapping rows */}
              {headers.map(header => {
                const aiVal = suggestedMapping[header] ?? null
                const isConfident = aiVal !== null
                return (
                  <div
                    key={header}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isConfident ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isConfident ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <span className="flex-1 text-sm font-mono text-gray-700 min-w-0 truncate">{header}</span>
                    <span className="text-gray-400 flex-shrink-0">→</span>
                    <select
                      value={mapping[header] ?? ''}
                      onChange={e => setMapping(prev => ({ ...prev, [header]: e.target.value || null }))}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="">-- Bỏ qua --</option>
                      {fieldOptions.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                )
              })}

              {/* Preview */}
              {preview.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Preview 5 dòng đầu</p>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="text-xs w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {headers.map(h => (
                            <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-t border-gray-50">
                            {headers.map(h => (
                              <td key={h} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[120px] truncate">
                                {String(row[h] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleValidate}
                className="px-6 py-3 rounded-xl font-bold text-white text-sm hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
              >
                ✅ Confirm Mapping →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Validation ────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-800">🔍 Bước 4 — Kiểm tra dữ liệu</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center space-y-4">
                <div className="text-5xl animate-spin inline-block">🔄</div>
                <p className="text-gray-600 font-medium">Đang kiểm tra dữ liệu...</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-black text-gray-700">{validStats.total}</div>
                    <div className="text-xs text-gray-400 mt-1">Tổng bản ghi</div>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4 text-center">
                    <div className="text-2xl font-black text-green-600">{validStats.validCount}</div>
                    <div className="text-xs text-green-500 mt-1">Hợp lệ ✓</div>
                  </div>
                  <div className="rounded-xl bg-red-50 p-4 text-center">
                    <div className="text-2xl font-black text-red-600">{validStats.errorCount}</div>
                    <div className="text-xs text-red-400 mt-1">Lỗi ✗</div>
                  </div>
                </div>

                {/* Errors list */}
                {validationErrors.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-red-600 mb-2">❌ Danh sách lỗi ({validationErrors.length})</p>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {validationErrors.slice(0, 50).map((e, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <span className="font-bold text-red-600 whitespace-nowrap">Dòng {e.row}</span>
                          <span className="text-gray-400">·</span>
                          <span className="font-semibold text-red-700">{e.field}</span>
                          <span className="text-gray-400">·</span>
                          <span className="font-mono text-gray-600 truncate">&quot;{e.value}&quot;</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-red-600">{e.message}</span>
                        </div>
                      ))}
                      {validationErrors.length > 50 && (
                        <p className="text-xs text-gray-400 text-center">...và {validationErrors.length - 50} lỗi khác</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Skip errors option */}
                {validationErrors.length > 0 && validStats.validCount > 0 && (
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <input
                      type="checkbox"
                      checked={skipErrors}
                      onChange={e => setSkipErrors(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-sm font-medium text-amber-800">
                      Bỏ qua các dòng lỗi, chỉ import {validStats.validCount} dòng hợp lệ
                    </span>
                  </label>
                )}

                {validStats.validCount === 0 && (
                  <div className="text-center py-4 text-red-600 font-medium">
                    ⚠️ Không có dòng nào hợp lệ để import
                  </div>
                )}
              </div>
            )}

            {!loading && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  ← Sửa mapping
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={validStats.validCount === 0 && !skipErrors}
                  className="px-6 py-3 rounded-xl font-bold text-white text-sm hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                >
                  Preview →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Preview ───────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-800">👀 Bước 5 — Preview</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {skipErrors ? validRows.length : allRows.length} bản ghi sẽ được import
                {validationErrors.length > 0 && skipErrors && ` (bỏ qua ${validationErrors.length > 0 ? validStats.errorCount : 0} dòng lỗi)`}
              </p>
            </div>

            <div className="p-4 overflow-x-auto">
              {(() => {
                const rowsToShow = (skipErrors ? validRows : allRows).slice(0, 20)
                const errorRowNums = new Set(validationErrors.map(e => e.row - 2))
                const activeFields = Object.values(mapping).filter((v): v is string => v !== null)
                const activeHeaders = headers.filter(h => mapping[h])

                return (
                  <table className="text-xs w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left text-gray-400">#</th>
                        {activeHeaders.map(h => (
                          <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold whitespace-nowrap">
                            {h}
                            <span className="ml-1 text-indigo-400 font-normal">→ {mapping[h]}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rowsToShow.map((row, i) => {
                        const isErrorRow = errorRowNums.has(i)
                        return (
                          <tr key={i} className={`border-t border-gray-50 ${isErrorRow ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-2 py-2 text-gray-400">{i + 2}</td>
                            {activeHeaders.map(h => (
                              <td key={h} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[150px] truncate">
                                {String(row[h] ?? '')}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )
              })()}

              {(skipErrors ? validRows : allRows).length > 20 && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Hiển thị 20/{(skipErrors ? validRows : allRows).length} bản ghi
                </p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-3 rounded-xl font-bold text-white text-sm hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #22c55e, #0ea5e9)' }}
              >
                🚀 Bắt đầu Import →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 6: Importing ─────────────────────────────────────────────── */}
        {step === 6 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center space-y-6">
            <div className="text-6xl animate-pulse">⚡</div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Đang import dữ liệu...</h2>
              <p className="text-sm text-gray-500 mt-1">
                {pollData
                  ? `${(pollData.successRows + pollData.failedRows).toLocaleString('vi-VN')} / ${pollData.totalRows.toLocaleString('vi-VN')} bản ghi`
                  : 'Đang xử lý...'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              {pollData && pollData.totalRows > 0 ? (
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((pollData.successRows + pollData.failedRows) / pollData.totalRows) * 100)}%`,
                    background: 'linear-gradient(90deg, #22c55e, #0ea5e9)',
                  }}
                />
              ) : (
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{ width: '60%', background: 'linear-gradient(90deg, #22c55e, #0ea5e9)' }}
                />
              )}
            </div>

            {pollData && (
              <div className="flex justify-center gap-6 text-sm">
                <span className="text-green-600 font-bold">✅ {pollData.successRows} thành công</span>
                {pollData.failedRows > 0 && (
                  <span className="text-red-500 font-bold">❌ {pollData.failedRows} thất bại</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 7: Result ────────────────────────────────────────────────── */}
        {step === 7 && importResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="px-6 py-8 text-center text-white"
              style={{ background: importResult.failed === 0 ? 'linear-gradient(135deg, #22c55e, #0ea5e9)' : 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              <div className="text-5xl mb-3">{importResult.failed === 0 ? '🎉' : '⚠️'}</div>
              <h2 className="text-2xl font-black">
                {importResult.failed === 0 ? 'Import thành công!' : 'Import hoàn tất với lỗi'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-green-50 p-5 text-center">
                  <div className="text-4xl font-black text-green-600">{importResult.imported}</div>
                  <div className="text-sm text-green-500 font-medium mt-1">✅ Bản ghi thành công</div>
                </div>
                <div className={`rounded-xl p-5 text-center ${importResult.failed > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`text-4xl font-black ${importResult.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>{importResult.failed}</div>
                  <div className={`text-sm font-medium mt-1 ${importResult.failed > 0 ? 'text-red-400' : 'text-gray-400'}`}>❌ Bản ghi thất bại</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-red-600 mb-2">Chi tiết lỗi:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.slice(0, 20).map((e, i) => (
                      <div key={i} className="text-xs bg-red-50 rounded-lg px-3 py-1.5 text-red-700">
                        Dòng {e.row}: {e.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <Link
                  href="/admin/data-migration"
                  className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  📋 Về Migration Center
                </Link>
                <button
                  onClick={resetWizard}
                  className="px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:scale-[1.02] transition-all"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                >
                  🆕 Import mới
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
