'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  detectedType: string
  detectedSubject: string | null
  detectedGrade: string | null
  title: string
  summary: string
  questionsFound: number
  questionTypes: string[]
  confidence: number
  suggestedMapping: {
    targetModule: string
    contentType: string
    reason: string
  }
}

interface ExtractedQuestion {
  content: string
  questionType: string
  options: Array<{ key: string; text: string }> | null
  correctAnswer: string
  explanation: string | null
  order: number
}

interface Subject {
  id: string
  name: string
  courseId: string
}

interface Course {
  id: string
  name: string
  subjects?: Subject[]
}

// URL import result
interface UrlParsedQuestion {
  content: string
  questionType: 'MULTIPLE_CHOICE' | 'OPEN' | 'FILL_IN'
  options: Array<{ key: string; text: string }> | null
  correctAnswer: string
  explanation: string | null
  order: number
}

interface UrlImportResult {
  platform: 'google_forms' | 'quizizz' | 'kahoot' | 'generic'
  title: string
  total: number
  questions: UrlParsedQuestion[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Upload' },
  { num: 2, label: 'AI Phân tích' },
  { num: 3, label: 'Review' },
  { num: 4, label: 'Import' },
  { num: 5, label: 'Kết quả' },
]

const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1))
const DETECTED_TYPE_LABELS: Record<string, string> = {
  lesson: '📖 Bài giảng',
  homework: '📝 Bài tập',
  quiz: '❓ Đề kiểm tra',
  answer_key: '✅ Đáp án',
  slide: '🖼️ Slide',
  reference: '📚 Tài liệu tham khảo',
  unknown: '❓ Chưa xác định',
}
const SUBJECT_LABELS: Record<string, string> = {
  MATH: 'Toán học',
  ENGLISH: 'Tiếng Anh',
  SCIENCE: 'Khoa học',
  CODING: 'Lập trình',
  VIETNAMESE: 'Tiếng Việt',
  HISTORY: 'Lịch sử',
  GEOGRAPHY: 'Địa lý',
}

const PLATFORM_LABELS: Record<string, string> = {
  google_forms: '📋 Google Forms',
  quizizz: '🎮 Quizizz',
  kahoot: '🟡 Kahoot',
  generic: '🌐 Web',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto">
      {STEPS.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all"
              style={{
                background: current === step.num
                  ? 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)'
                  : current > step.num ? '#d1fae5' : '#f3f4f6',
                color: current === step.num ? '#fff' : current > step.num ? '#065f46' : '#9ca3af',
              }}
            >
              {current > step.num ? '✓' : step.num}
            </div>
            <span
              className="text-xs mt-1 font-medium whitespace-nowrap"
              style={{ color: current === step.num ? '#7c3aed' : '#9ca3af' }}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className="w-10 h-0.5 mx-1 mb-5"
              style={{ background: current > step.num + 1 ? '#d1fae5' : '#e5e7eb' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MaterialImportNewPage() {
  // Tab switcher: 'file' = existing upload wizard | 'url' = new URL import
  const [tab, setTab] = useState<'file' | 'url'>('file')

  // ── File upload wizard state ──────────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [subjectId, setSubjectId] = useState('')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const [importId, setImportId] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [textPreview, setTextPreview] = useState('')
  const [fullText, setFullText] = useState('')

  const [importMode, setImportMode] = useState<'material' | 'questions' | 'both'>('both')
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([])

  const [resultMaterialId, setResultMaterialId] = useState<string | null>(null)
  const [resultQuestionsCreated, setResultQuestionsCreated] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoaded, setCoursesLoaded] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── URL import state ──────────────────────────────────────────────────────
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [urlResult, setUrlResult] = useState<UrlImportResult | null>(null)
  const [urlSubjectId, setUrlSubjectId] = useState('')
  const [urlImportMode, setUrlImportMode] = useState<'material' | 'questions' | 'both'>('questions')
  const [urlImporting, setUrlImporting] = useState(false)
  const [urlImportDone, setUrlImportDone] = useState(false)
  const [urlImportResultMaterialId, setUrlImportResultMaterialId] = useState<string | null>(null)
  const [urlImportQuestionsCreated, setUrlImportQuestionsCreated] = useState(0)

  // ── Shared helpers ────────────────────────────────────────────────────────

  // Load courses for subject dropdown
  const loadCourses = useCallback(async () => {
    if (coursesLoaded) return
    try {
      const res = await fetch('/api/admin/courses')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setCourses(json.data)
      }
    } catch { /* ignore */ }
    setCoursesLoaded(true)
  }, [coursesLoaded])

  // ── File wizard handlers ──────────────────────────────────────────────────

  // Step 1 → Step 2+3: Upload & analyze
  async function handleUpload() {
    if (!file) {
      setError('Vui lòng chọn file')
      return
    }
    setError('')
    setLoading(true)
    setStep(2)

    try {
      const formData = new FormData()
      if (file) formData.append('file', file)
      if (subjectId) formData.append('subjectId', subjectId)
      if (grade) formData.append('grade', grade)
      if (subject) formData.append('subject', subject)

      const res = await fetch('/api/admin/material-import/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()

      if (!json.success) throw new Error(json.error ?? 'Upload failed')

      setImportId(json.importId)
      setAnalysis(json.analysis)
      setTextPreview(json.textPreview ?? '')
      setFullText(json._fullText ?? '')
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  // Step 3 → Step 4+5: Confirm & import
  async function handleImport() {
    setError('')
    setLoading(true)
    setStep(4)

    try {
      let extractedQuestions: ExtractedQuestion[] = []

      // Extract questions if needed
      if (importMode === 'questions' || importMode === 'both') {
        const extRes = await fetch('/api/admin/material-import/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ importId, extractQuestions: true, fullText }),
        })
        const extJson = await extRes.json()
        if (extJson.success) {
          extractedQuestions = extJson.questions ?? []
          setQuestions(extractedQuestions)
        }
      }

      // Import
      const impRes = await fetch('/api/admin/material-import/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importId,
          subjectId: subjectId || undefined,
          contentType: analysis?.suggestedMapping?.contentType ?? 'THEORY',
          questions: extractedQuestions,
          importMode,
          title: analysis?.title,
          summary: analysis?.summary,
        }),
      })
      const impJson = await impRes.json()
      if (!impJson.success) throw new Error(impJson.error ?? 'Import failed')

      setResultMaterialId(impJson.materialId)
      setResultQuestionsCreated(impJson.questionsCreated ?? 0)
      setStep(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import thất bại')
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  function resetWizard() {
    setStep(1)
    setFile(null)
    setSubjectId('')
    setGrade('')
    setSubject('')
    setImportId('')
    setAnalysis(null)
    setTextPreview('')
    setFullText('')
    setImportMode('both')
    setQuestions([])
    setResultMaterialId(null)
    setResultQuestionsCreated(0)
    setError('')
  }

  // Drag & drop handlers
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }
  function onDragLeave() { setIsDragging(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  // ── URL import handlers ───────────────────────────────────────────────────

  async function handleUrlAnalyze() {
    if (!urlInput.trim()) {
      setUrlError('Vui lòng nhập URL')
      return
    }
    setUrlError('')
    setUrlResult(null)
    setUrlImportDone(false)
    setUrlLoading(true)

    try {
      const res = await fetch('/api/admin/material-import/url-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Phân tích thất bại')
      setUrlResult(json as UrlImportResult)
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setUrlLoading(false)
    }
  }

  async function handleUrlImport() {
    if (!urlResult) return
    if (!urlSubjectId) {
      setUrlError('Vui lòng chọn môn học trước khi import')
      return
    }
    setUrlError('')
    setUrlImporting(true)

    try {
      // For URL import we create a temporary import log first, then use the existing import API
      // Actually, the existing import API requires an importId from the DB
      // We'll call it differently: create a minimal importId via upload route with dummy, OR
      // use a direct question-bank creation endpoint
      // Best approach: call import API with a direct batch endpoint
      // Since existing /api/admin/material-import/import requires importId, let's use direct question creation
      const questionsToImport = urlResult.questions.map(q => ({
        content: q.content,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        order: q.order,
      }))

      // Try calling the question bank direct creation endpoint
      // First check if it exists, if not create questions via the import route after creating a log
      const batchRes = await fetch('/api/admin/questions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: urlSubjectId,
          questions: questionsToImport,
          source: 'url_import',
          sourceUrl: urlInput,
        }),
      })

      if (batchRes.ok) {
        const batchJson = await batchRes.json()
        if (batchJson.success) {
          setUrlImportQuestionsCreated(batchJson.created ?? questionsToImport.length)
          setUrlImportResultMaterialId(null)
          setUrlImportDone(true)
          return
        }
      }

      // Fallback: create import log then use existing import route
      const logRes = await fetch('/api/admin/material-import/url-import-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: urlResult.title,
          platform: urlResult.platform,
          sourceUrl: urlInput,
          subjectId: urlSubjectId,
          questionsFound: urlResult.total,
        }),
      })

      let tmpImportId: string | null = null
      if (logRes.ok) {
        const logJson = await logRes.json()
        tmpImportId = logJson.importId ?? null
      }

      if (tmpImportId) {
        const impRes = await fetch('/api/admin/material-import/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            importId: tmpImportId,
            subjectId: urlSubjectId,
            contentType: 'QUIZ',
            questions: urlImportMode !== 'material' ? questionsToImport : [],
            importMode: urlImportMode,
            title: urlResult.title,
            summary: `Imported from ${PLATFORM_LABELS[urlResult.platform] ?? urlResult.platform}: ${urlInput}`,
          }),
        })
        const impJson = await impRes.json()
        if (!impJson.success) throw new Error(impJson.error ?? 'Import thất bại')
        setUrlImportQuestionsCreated(impJson.questionsCreated ?? 0)
        setUrlImportResultMaterialId(impJson.materialId ?? null)
        setUrlImportDone(true)
      } else {
        throw new Error('Không thể tạo import log. Vui lòng thử lại.')
      }
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Import thất bại')
    } finally {
      setUrlImporting(false)
    }
  }

  function resetUrlImport() {
    setUrlInput('')
    setUrlResult(null)
    setUrlError('')
    setUrlImportDone(false)
    setUrlSubjectId('')
    setUrlImportMode('questions')
    setUrlImportResultMaterialId(null)
    setUrlImportQuestionsCreated(0)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-8"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}
      >
        <div className="container-custom relative flex items-center gap-4">
          <Link href="/admin/material-import" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
            ← Quay lại
          </Link>
          <div>
            <h1 className="text-2xl font-black">🚀 Import tài liệu mới</h1>
            <p className="text-indigo-200 text-sm">Upload → AI phân tích → Review → Import vào AvaB</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">

          {/* ── Tab Switcher ─────────────────────────────────────────────── */}
          <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
            <button
              onClick={() => setTab('file')}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all"
              style={tab === 'file'
                ? { background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)', color: '#fff' }
                : { background: 'transparent', color: '#6b7280' }}
            >
              📁 Upload File
            </button>
            <button
              onClick={() => setTab('url')}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all"
              style={tab === 'url'
                ? { background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)', color: '#fff' }
                : { background: 'transparent', color: '#6b7280' }}
            >
              🔗 Import từ URL
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/*  TAB: FILE UPLOAD WIZARD                                       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {tab === 'file' && (
            <>
              <StepIndicator current={step} />

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* ── STEP 1: Upload ────────────────────────────────────────── */}
              {step === 1 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-black text-gray-900 mb-6">📂 Bước 1 — Chọn tài liệu</h2>

                  {/* Drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className="relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-6"
                    style={{
                      borderColor: isDragging ? '#7c3aed' : '#e5e7eb',
                      background: isDragging ? 'rgba(124,58,237,0.05)' : '#fafafa',
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.pdf,.xlsx,.xls,.csv,.txt"
                      className="hidden"
                      onChange={e => setFile(e.target.files?.[0] ?? null)}
                    />
                    {file ? (
                      <div>
                        <div className="text-4xl mb-2">📄</div>
                        <p className="font-black text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{formatFileSize(file.size)}</p>
                        <button
                          onClick={e => { e.stopPropagation(); setFile(null) }}
                          className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          ✕ Xóa file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-5xl mb-3">☁️</div>
                        <p className="font-black text-gray-700 mb-1">Kéo thả file vào đây</p>
                        <p className="text-sm text-gray-400">hoặc click để chọn file</p>
                        <div className="flex justify-center gap-2 mt-4 flex-wrap">
                          {['.docx', '.pdf', '.xlsx', '.csv', '.txt'].map(ext => (
                            <span key={ext} className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-500 font-mono">{ext}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subject & Grade */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Môn học (tùy chọn)</label>
                      <select
                        value={subjectId}
                        onFocus={loadCourses}
                        onChange={e => setSubjectId(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                      >
                        <option value="">AI tự nhận diện</option>
                        {courses.map(c =>
                          (c.subjects ?? []).map(s => (
                            <option key={s.id} value={s.id}>{c.name} — {s.name}</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Khối lớp (tùy chọn)</label>
                      <select
                        value={grade}
                        onChange={e => setGrade(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                      >
                        <option value="">AI tự nhận diện</option>
                        <option value="preschool">Mầm non</option>
                        {GRADES.map(g => <option key={g} value={g}>Lớp {g}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}
                  >
                    🤖 Phân tích với AI →
                  </button>
                </div>
              )}

              {/* ── STEP 2: AI Analyzing ───────────────────────────────────── */}
              {step === 2 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="text-6xl mb-4 animate-pulse">🤖</div>
                  <h2 className="text-xl font-black text-gray-900 mb-2">AI đang phân tích tài liệu...</h2>
                  <p className="text-gray-500 text-sm mb-8">Có thể mất 10-30 giây tùy kích thước file</p>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)',
                          animation: `bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
                        }}
                      />
                    ))}
                  </div>
                  <style jsx>{`
                    @keyframes bounce {
                      0%, 100% { transform: translateY(0); opacity: 0.4; }
                      50% { transform: translateY(-10px); opacity: 1; }
                    }
                  `}</style>
                </div>
              )}

              {/* ── STEP 3: Review AI Result ───────────────────────────────── */}
              {step === 3 && analysis && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-black text-gray-900 mb-6">🎯 Bước 3 — Xem xét kết quả AI</h2>

                  {/* Analysis card */}
                  <div className="rounded-2xl border border-gray-100 overflow-hidden mb-6">
                    <div
                      className="px-4 py-3 text-white text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}
                    >
                      📊 Kết quả phân tích AI
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-sm w-32 shrink-0">📄 Tên file</span>
                        <span className="font-semibold text-gray-900 text-sm break-all">{file?.name}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-sm w-32 shrink-0">🎯 Loại</span>
                        <span className="font-semibold text-gray-900 text-sm">
                          {DETECTED_TYPE_LABELS[analysis.detectedType] ?? analysis.detectedType}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-sm w-32 shrink-0">📚 Môn học</span>
                        <span className="font-semibold text-gray-900 text-sm">
                          {analysis.detectedSubject ? (SUBJECT_LABELS[analysis.detectedSubject] ?? analysis.detectedSubject) : '—'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-sm w-32 shrink-0">🎓 Khối lớp</span>
                        <span className="font-semibold text-gray-900 text-sm">
                          {analysis.detectedGrade ? `Lớp ${analysis.detectedGrade}` : '—'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-sm w-32 shrink-0">📝 Tiêu đề</span>
                        <span className="font-semibold text-gray-900 text-sm">{analysis.title || '—'}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-sm w-32 shrink-0">💡 Tóm tắt</span>
                        <span className="text-gray-700 text-sm leading-relaxed">{analysis.summary || '—'}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-sm w-32 shrink-0">🔢 Câu hỏi</span>
                        <span className="font-bold text-gray-900 text-sm">{analysis.questionsFound} câu</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-sm w-32 shrink-0">🎯 Độ chính xác</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full w-24 overflow-hidden">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(analysis.confidence * 100).toFixed(0)}%`,
                                background: 'linear-gradient(90deg, #7c3aed, #0ea5e9)',
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900">{(analysis.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      {analysis.suggestedMapping?.reason && (
                        <div className="flex items-start gap-3">
                          <span className="text-gray-400 text-sm w-32 shrink-0">💬 Gợi ý</span>
                          <span className="text-gray-600 text-sm">{analysis.suggestedMapping.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text preview */}
                  {textPreview && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-500 mb-2">👁️ Xem trước nội dung</p>
                      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed max-h-28 overflow-y-auto font-mono">
                        {textPreview}...
                      </div>
                    </div>
                  )}

                  {/* Import mode selection */}
                  <div className="mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">📦 Chọn cách import</p>
                    <div className="space-y-2">
                      {[
                        { value: 'material', label: '📖 Import toàn bộ nội dung làm Bài giảng (SubjectMaterial)', desc: 'Lưu nội dung dưới dạng tài liệu học tập' },
                        { value: 'questions', label: '🔢 Trích xuất câu hỏi vào Question Bank', desc: 'AI tự động trích xuất và tạo câu hỏi' },
                        { value: 'both', label: '✅ Cả hai — Tài liệu + Câu hỏi', desc: 'Khuyến nghị cho đề kiểm tra và bài tập' },
                      ].map(opt => (
                        <label
                          key={opt.value}
                          className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                          style={{
                            borderColor: importMode === opt.value ? '#7c3aed' : '#e5e7eb',
                            background: importMode === opt.value ? 'rgba(124,58,237,0.05)' : '#fff',
                          }}
                        >
                          <input
                            type="radio"
                            name="importMode"
                            value={opt.value}
                            checked={importMode === opt.value}
                            onChange={e => setImportMode(e.target.value as typeof importMode)}
                            className="mt-0.5 accent-violet-600"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all hover:scale-[1.01] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}
                  >
                    ✅ Xác nhận và Import →
                  </button>
                </div>
              )}

              {/* ── STEP 4: Importing ──────────────────────────────────────── */}
              {step === 4 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h2 className="text-xl font-black text-gray-900 mb-2">Đang import...</h2>
                  <p className="text-gray-500 text-sm mb-8">
                    {importMode === 'questions' || importMode === 'both'
                      ? 'AI đang trích xuất câu hỏi và import vào hệ thống'
                      : 'Đang lưu tài liệu vào hệ thống'}
                  </p>
                  {/* Progress bar animation */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #7c3aed, #0ea5e9)',
                        animation: 'progress 3s ease-in-out infinite',
                        width: '70%',
                      }}
                    />
                  </div>
                  <style jsx>{`
                    @keyframes progress {
                      0% { width: 20%; }
                      50% { width: 85%; }
                      100% { width: 20%; }
                    }
                  `}</style>
                </div>
              )}

              {/* ── STEP 5: Result ─────────────────────────────────────────── */}
              {step === 5 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-xl font-black text-gray-900 mb-2">Import thành công!</h2>
                  <p className="text-gray-500 text-sm mb-8">Tài liệu đã được import vào AvaB</p>

                  <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8 space-y-3">
                    {(importMode === 'material' || importMode === 'both') && resultMaterialId && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Đã tạo tài liệu</p>
                          <p className="text-xs text-gray-400 font-mono">{resultMaterialId}</p>
                        </div>
                      </div>
                    )}
                    {(importMode === 'questions' || importMode === 'both') && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {resultQuestionsCreated} câu hỏi đã thêm vào Question Bank
                          </p>
                          <p className="text-xs text-gray-400">
                            {questions.length > 0 ? questions.map(q => q.questionType).join(', ') : ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center">
                    {resultMaterialId && (
                      <Link
                        href="/admin/subjects"
                        className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}
                      >
                        📖 Xem tài liệu
                      </Link>
                    )}
                    {resultQuestionsCreated > 0 && (
                      <Link
                        href="/admin/question-bank"
                        className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
                      >
                        🗃️ Xem Question Bank
                      </Link>
                    )}
                    <button
                      onClick={resetWizard}
                      className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      🚀 Import thêm
                    </button>
                    <Link
                      href="/admin/material-import"
                      className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      ← Về trang chính
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/*  TAB: URL IMPORT                                               */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {tab === 'url' && (
            <div className="space-y-6">

              {/* Platform badges */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { icon: '📋', label: 'Google Forms', color: '#4285f4' },
                  { icon: '🎮', label: 'Quizizz', color: '#8854d0' },
                  { icon: '🟡', label: 'Kahoot', color: '#e8a014' },
                  { icon: '🌐', label: 'Bất kỳ URL', color: '#0ea5e9' },
                ].map(p => (
                  <span
                    key={p.label}
                    className="text-xs px-3 py-1.5 rounded-full font-bold text-white"
                    style={{ background: p.color }}
                  >
                    {p.icon} {p.label}
                  </span>
                ))}
              </div>

              {/* Input card */}
              {!urlImportDone && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-lg font-black text-gray-900 mb-4">🔗 Nhập link quiz/form</h2>

                  <div className="mb-4">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => { setUrlInput(e.target.value); setUrlError('') }}
                      placeholder="https://docs.google.com/forms/d/... hoặc https://quizizz.com/admin/quiz/..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                      disabled={urlLoading}
                    />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[
                        'docs.google.com/forms',
                        'quizizz.com/admin/quiz/...',
                        'create.kahoot.it/share/...',
                      ].map(hint => (
                        <span key={hint} className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">
                          {hint}
                        </span>
                      ))}
                    </div>
                  </div>

                  {urlError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                      ⚠️ {urlError}
                    </div>
                  )}

                  <button
                    onClick={handleUrlAnalyze}
                    disabled={urlLoading || !urlInput.trim()}
                    className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}
                  >
                    {urlLoading ? '⏳ Đang phân tích...' : '🔍 Phân tích'}
                  </button>
                </div>
              )}

              {/* URL Loading state */}
              {urlLoading && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                  <div className="text-5xl mb-3 animate-pulse">🔍</div>
                  <p className="font-black text-gray-800 text-lg mb-1">Đang tải và phân tích...</p>
                  <p className="text-gray-400 text-sm">Quá trình này có thể mất 5-15 giây</p>
                </div>
              )}

              {/* Preview result */}
              {urlResult && !urlImportDone && !urlLoading && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  {/* Result header */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{urlResult.platform === 'google_forms' ? '📋' : urlResult.platform === 'quizizz' ? '🎮' : urlResult.platform === 'kahoot' ? '🟡' : '🌐'}</span>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{urlResult.title}</h3>
                      <p className="text-sm text-gray-500">
                        {PLATFORM_LABELS[urlResult.platform]} · {urlResult.total} câu hỏi
                      </p>
                    </div>
                  </div>

                  {/* Question preview list */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Xem trước câu hỏi</p>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {urlResult.questions.slice(0, 10).map((q, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-100 rounded-xl p-3 bg-gray-50"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                              style={{
                                background: q.questionType === 'MULTIPLE_CHOICE'
                                  ? '#7c3aed' : q.questionType === 'FILL_IN'
                                    ? '#0ea5e9' : '#6b7280',
                              }}
                            >
                              {q.questionType === 'MULTIPLE_CHOICE' ? 'MC' : q.questionType === 'FILL_IN' ? 'Điền' : 'Mở'}
                            </span>
                            <p className="text-sm text-gray-800 font-medium leading-snug">{q.content}</p>
                          </div>
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-2 gap-1 ml-1">
                              {q.options.map(opt => (
                                <div
                                  key={opt.key}
                                  className="text-xs px-2 py-1 rounded-lg"
                                  style={{
                                    background: opt.key === q.correctAnswer ? '#d1fae5' : '#f3f4f6',
                                    color: opt.key === q.correctAnswer ? '#065f46' : '#6b7280',
                                    fontWeight: opt.key === q.correctAnswer ? 700 : 400,
                                  }}
                                >
                                  {opt.key}. {opt.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {urlResult.total > 10 && (
                        <p className="text-xs text-center text-gray-400 py-2">
                          ... và {urlResult.total - 10} câu hỏi khác
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject picker */}
                  <div className="mb-5">
                    <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                      📚 Chọn môn học <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={urlSubjectId}
                      onFocus={loadCourses}
                      onChange={e => setUrlSubjectId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                    >
                      <option value="">— Chọn môn học —</option>
                      {courses.map(c =>
                        (c.subjects ?? []).map(s => (
                          <option key={s.id} value={s.id}>{c.name} — {s.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Import mode */}
                  <div className="mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">📦 Chọn cách import</p>
                    <div className="space-y-2">
                      {[
                        { value: 'questions', label: '🔢 Chỉ câu hỏi vào Question Bank', desc: 'Thêm câu hỏi trực tiếp, không tạo tài liệu' },
                        { value: 'material', label: '📖 Tạo Bài giảng từ tiêu đề', desc: 'Lưu dưới dạng SubjectMaterial' },
                        { value: 'both', label: '✅ Cả hai — Tài liệu + Câu hỏi', desc: 'Tạo tài liệu và thêm câu hỏi vào Question Bank' },
                      ].map(opt => (
                        <label
                          key={opt.value}
                          className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                          style={{
                            borderColor: urlImportMode === opt.value ? '#7c3aed' : '#e5e7eb',
                            background: urlImportMode === opt.value ? 'rgba(124,58,237,0.05)' : '#fff',
                          }}
                        >
                          <input
                            type="radio"
                            name="urlImportMode"
                            value={opt.value}
                            checked={urlImportMode === opt.value}
                            onChange={e => setUrlImportMode(e.target.value as typeof urlImportMode)}
                            className="mt-0.5 accent-violet-600"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {urlError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                      ⚠️ {urlError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={resetUrlImport}
                      className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      ← Nhập link khác
                    </button>
                    <button
                      onClick={handleUrlImport}
                      disabled={urlImporting || !urlSubjectId}
                      className="flex-1 py-3 rounded-2xl text-white font-black text-base transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}
                    >
                      {urlImporting ? '⏳ Đang import...' : '📥 Import vào hệ thống'}
                    </button>
                  </div>
                </div>
              )}

              {/* Import done state */}
              {urlImportDone && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-xl font-black text-gray-900 mb-2">Import thành công!</h2>
                  <p className="text-gray-500 text-sm mb-2">
                    {PLATFORM_LABELS[urlResult?.platform ?? 'generic']} → AvaB
                  </p>

                  <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8 space-y-3">
                    {(urlImportMode === 'material' || urlImportMode === 'both') && urlImportResultMaterialId && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Đã tạo tài liệu</p>
                          <p className="text-xs text-gray-400 font-mono">{urlImportResultMaterialId}</p>
                        </div>
                      </div>
                    )}
                    {(urlImportMode === 'questions' || urlImportMode === 'both') && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {urlImportQuestionsCreated} câu hỏi đã thêm vào Question Bank
                          </p>
                          <p className="text-xs text-gray-400">Từ: {urlResult?.title}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center">
                    {urlImportResultMaterialId && (
                      <Link
                        href="/admin/subjects"
                        className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}
                      >
                        📖 Xem tài liệu
                      </Link>
                    )}
                    {urlImportQuestionsCreated > 0 && (
                      <Link
                        href="/admin/question-bank"
                        className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.01]"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
                      >
                        🗃️ Xem Question Bank
                      </Link>
                    )}
                    <button
                      onClick={resetUrlImport}
                      className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      🔗 Import URL khác
                    </button>
                    <Link
                      href="/admin/material-import"
                      className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      ← Về trang chính
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
