'use client'

import React, { useState, useEffect, use } from 'react'
import { GRADE_OPTIONS, SUBJECTS } from '@/lib/constants/education'
import Link from 'next/link'
import {
  Sparkles, RefreshCw, Eye, CheckSquare, Upload, History,
  Settings, Loader2, ChevronLeft, Clock, FileText,
  BookOpen, Zap, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react'

// ─── Education Data (from shared constants) ────────────────────────────────────
const ALL_SUBJECT_LABELS = SUBJECTS.map(s => `${s.emoji} ${s.label}`)
const ALL_GRADE_LABELS   = GRADE_OPTIONS.map(g => g.label)
const GRADE_RANGE_LABELS = ['Mầm non', 'Lớp 1-3', 'Lớp 4-5', 'Lớp 6-9', 'Lớp 10-12', 'Đại học', 'Toàn cấp']

// ─── Module Registry ───────────────────────────────────────────────────────────
const MODULES: Record<string, {
  name: string; icon: string; desc: string; status: 'active' | 'beta' | 'soon'
  version: string; gradient: string; color: string; badge: string
  inputs: string[]; outputs: string[]; workflow: string[]
  fields: FormField[]
}> = {
  'education-standard': {
    name: 'Education Standard', icon: '📚',
    desc: 'Sinh và quản lý tiêu chuẩn giáo dục toàn hệ thống AvaB',
    status: 'active', version: '1.0', gradient: 'from-purple-500 to-purple-700',
    color: 'purple', badge: 'bg-purple-100 text-purple-700',
    inputs: ['Subject domain', 'Grade level', 'Framework type', 'Competency focus'],
    outputs: ['Standard document', 'Competency matrix', 'Assessment criteria', 'Implementation guide'],
    workflow: ['Define Scope', '→', 'AI Draft', '→', 'Expert Review', '→', 'Finalize', '→', 'Publish'],
    fields: [
      { id: 'subject', label: 'Môn học', type: 'select', options: ALL_SUBJECT_LABELS, required: true },
      { id: 'framework', label: 'Framework', type: 'select', options: ['Bloom Taxonomy', 'CEFR', 'STEAM', 'Custom AvaB'], required: true },
      { id: 'gradeRange', label: 'Phạm vi khối lớp', type: 'select', options: GRADE_RANGE_LABELS, required: true },
      { id: 'requirements', label: 'Yêu cầu đặc biệt', type: 'textarea', placeholder: 'Nhập các yêu cầu cụ thể...' },
    ],
  },
  'curriculum': {
    name: 'Curriculum Generator', icon: '🗂️',
    desc: 'Sinh chương trình học tự động theo tiêu chuẩn AvaB',
    status: 'active', version: '1.2', gradient: 'from-blue-500 to-blue-700',
    color: 'blue', badge: 'bg-blue-100 text-blue-700',
    inputs: ['Subject', 'Grade', 'Academic year', 'Weekly hours', 'Learning objectives'],
    outputs: ['Curriculum outline', 'Unit plan', 'Topic sequence', 'Time allocation', 'Resource list'],
    workflow: ['Input Parameters', '→', 'AI Generate', '→', 'Validate Standard', '→', 'Review', '→', 'Export'],
    fields: [
      { id: 'subject', label: 'Môn học', type: 'select', options: ALL_SUBJECT_LABELS, required: true },
      { id: 'grade', label: 'Khối lớp', type: 'select', options: ALL_GRADE_LABELS, required: true },
      { id: 'weeks', label: 'Số tuần học', type: 'number', placeholder: '35', required: true },
      { id: 'hoursPerWeek', label: 'Tiết/tuần', type: 'number', placeholder: '4' },
      { id: 'requirements', label: 'Mục tiêu đặc biệt', type: 'textarea', placeholder: 'Mục tiêu, yêu cầu đặc thù...' },
    ],
  },
  'lesson': {
    name: 'Lesson Generator', icon: '📖',
    desc: 'Tạo bài học đầy đủ theo chuẩn AvaB với nội dung, hoạt động, đánh giá',
    status: 'beta', version: '0.9', gradient: 'from-teal-500 to-teal-700',
    color: 'teal', badge: 'bg-teal-100 text-teal-700',
    inputs: ['Subject', 'Grade', 'Topic', 'Duration', 'Difficulty', 'Special requirements'],
    outputs: ['Lesson plan', 'Teaching notes', 'Student worksheet', 'Assessment rubric', 'Slide outline'],
    workflow: ['Define Topic', '→', 'AI Draft', '→', 'Add Activities', '→', 'QA Check', '→', 'Finalize'],
    fields: [
      { id: 'subject', label: 'Môn học', type: 'select', options: ALL_SUBJECT_LABELS, required: true },
      { id: 'grade', label: 'Khối lớp', type: 'select', options: ALL_GRADE_LABELS, required: true },
      { id: 'topic', label: 'Chủ đề / Topic', type: 'text', placeholder: 'VD: Phép nhân có nhớ trong bảng 6', required: true },
      { id: 'lessonCount', label: 'Số bài học', type: 'number', placeholder: '1' },
      { id: 'duration', label: 'Thời lượng (phút)', type: 'select', options: ['30', '45', '60', '90'], required: true },
      { id: 'difficulty', label: 'Độ khó', type: 'select', options: ['Cơ bản', 'Trung bình', 'Nâng cao', 'Hỗn hợp'] },
      { id: 'requirements', label: 'Yêu cầu đặc biệt', type: 'textarea', placeholder: 'VD: Tập trung vào tư duy trực quan, nhiều ví dụ thực tế...' },
    ],
  },
  'homework': {
    name: 'Homework Generator', icon: '✏️',
    desc: 'Sinh bài tập phong phú với đáp án chi tiết và lời giải từng bước',
    status: 'active', version: '1.5', gradient: 'from-green-500 to-green-700',
    color: 'green', badge: 'bg-green-100 text-green-700',
    inputs: ['Subject', 'Grade', 'Topic', 'Question count', 'Difficulty mix', 'Question types'],
    outputs: ['Question set', 'Answer key', 'Step-by-step solutions', 'Difficulty map', 'Rubric'],
    workflow: ['Set Parameters', '→', 'Generate Questions', '→', 'Add Solutions', '→', 'QA Validate', '→', 'Export'],
    fields: [
      { id: 'subject', label: 'Môn học', type: 'select', options: ALL_SUBJECT_LABELS, required: true },
      { id: 'grade', label: 'Khối lớp', type: 'select', options: ALL_GRADE_LABELS, required: true },
      { id: 'topic', label: 'Chủ đề', type: 'text', placeholder: 'VD: Phân số, Hình học không gian...', required: true },
      { id: 'count', label: 'Số câu hỏi', type: 'number', placeholder: '10', required: true },
      { id: 'difficulty', label: 'Phân bổ độ khó', type: 'select', options: ['Dễ 80% / Khó 20%', 'Đều 33/33/34%', 'Khó 60% / Dễ 40%', 'Tùy chỉnh'] },
      { id: 'types', label: 'Loại câu hỏi', type: 'select', options: ['Trắc nghiệm', 'Điền khuyết', 'Tự luận', 'Hỗn hợp'] },
      { id: 'requirements', label: 'Yêu cầu thêm', type: 'textarea', placeholder: 'VD: Có hình minh họa, bài tập thực tế...' },
    ],
  },
  'qa': {
    name: 'QA Engine', icon: '✅',
    desc: 'Kiểm định chất lượng học liệu theo chuẩn AvaB với 20+ tiêu chí',
    status: 'beta', version: '0.7', gradient: 'from-orange-500 to-orange-700',
    color: 'orange', badge: 'bg-orange-100 text-orange-700',
    inputs: ['Content file', 'Content type', 'Standard reference', 'QA level'],
    outputs: ['QA report', 'Score breakdown', 'Issue list', 'Fix suggestions', 'Pass/Fail verdict'],
    workflow: ['Upload Content', '→', 'Parse & Analyze', '→', 'Check Standards', '→', 'Score', '→', 'Report'],
    fields: [
      { id: 'contentType', label: 'Loại nội dung', type: 'select', options: ['Lesson Plan', 'Homework Set', 'Curriculum', 'Full Course'], required: true },
      { id: 'standard', label: 'Chuẩn đối chiếu', type: 'select', options: ['AvaB Education Standard', 'AvaB Lesson Standard', 'AvaB Homework Standard', 'All Standards'] },
      { id: 'level', label: 'Mức độ kiểm tra', type: 'select', options: ['Quick (5 tiêu chí)', 'Standard (15 tiêu chí)', 'Deep (20+ tiêu chí)'] },
      { id: 'contentId', label: 'ID nội dung / URL', type: 'text', placeholder: 'lesson_xxx hoặc paste URL...' },
      { id: 'notes', label: 'Ghi chú QA', type: 'textarea', placeholder: 'Chú ý đặc biệt cần kiểm tra...' },
    ],
  },
  'publishing': {
    name: 'Publishing Engine', icon: '📤',
    desc: 'Xuất bản học liệu đa định dạng: PDF, DOCX, JSON, Web, LMS',
    status: 'beta', version: '0.5', gradient: 'from-pink-500 to-pink-700',
    color: 'pink', badge: 'bg-pink-100 text-pink-700',
    inputs: ['Content source', 'Target formats', 'Template', 'Distribution channels'],
    outputs: ['PDF document', 'DOCX file', 'JSON data', 'Web page', 'LMS package'],
    workflow: ['Select Content', '→', 'Choose Format', '→', 'Apply Template', '→', 'Render', '→', 'Distribute'],
    fields: [
      { id: 'contentType', label: 'Loại nội dung', type: 'select', options: ['Lesson Plan', 'Homework Set', 'Curriculum', 'Full Course'], required: true },
      { id: 'format', label: 'Định dạng xuất', type: 'select', options: ['PDF', 'DOCX', 'JSON', 'HTML', 'All Formats'] },
      { id: 'template', label: 'Template', type: 'select', options: ['AvaB Standard', 'Minimal', 'Rich Print', 'Digital Interactive'] },
      { id: 'contentId', label: 'ID nội dung', type: 'text', placeholder: 'lesson_xxx, homework_xxx...', required: true },
      { id: 'notes', label: 'Ghi chú', type: 'textarea', placeholder: 'Yêu cầu đặc biệt về format, watermark...' },
    ],
  },
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FormField {
  id: string; label: string; type: 'select' | 'text' | 'number' | 'textarea'
  options?: string[]; placeholder?: string; required?: boolean
}

interface GenerateResult {
  id: string; jobId: string; createdAt: string; status: 'generated' | 'qa_pass' | 'published' | 'failed'
  params: Record<string, string>; preview?: string
}

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-700 border-green-200',
  beta: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  soon: 'bg-gray-100 text-gray-500 border-gray-200',
}
const STATUS_LABEL = { active: 'Active', beta: 'Beta', soon: 'Coming Soon' }

const RESULT_STATUS: Record<string, { icon: any; label: string; cls: string }> = {
  generated: { icon: CheckCircle2, label: 'Generated', cls: 'text-blue-600 bg-blue-50' },
  qa_pass: { icon: CheckSquare, label: 'QA Pass', cls: 'text-green-600 bg-green-50' },
  published: { icon: Upload, label: 'Published', cls: 'text-purple-600 bg-purple-50' },
  failed: { icon: XCircle, label: 'Failed', cls: 'text-red-600 bg-red-50' },
}

const TABS = ['Overview', 'Generate', 'Results', 'Standard', 'History', 'Settings']

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ModuleWorkspacePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleId } = use(params)
  const mod = MODULES[moduleId] ?? MODULES['lesson']

  const [activeTab, setActiveTab] = useState('Overview')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lastResult, setLastResult] = useState<GenerateResult | null>(null)
  const [results, setResults] = useState<GenerateResult[]>([])
  const [standardContent, setStandardContent] = useState('')
  const [loadingStandard, setLoadingStandard] = useState(false)

  // Load mock results from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`ai-gen-${moduleId}`)
      if (stored) setResults(JSON.parse(stored))
    } catch {}
  }, [moduleId])

  const saveResult = (r: GenerateResult) => {
    const updated = [r, ...results].slice(0, 20)
    setResults(updated)
    try { localStorage.setItem(`ai-gen-${moduleId}`, JSON.stringify(updated)) } catch {}
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)
    setActiveTab('Generate')

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return p }
        return p + Math.random() * 15
      })
    }, 400)

    try {
      const res = await fetch('/api/admin/ai-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: moduleId, params: formData }),
      })
      const data = await res.json()
      clearInterval(interval)
      setProgress(100)

      const result: GenerateResult = {
        id: `gen_${Date.now()}`,
        jobId: data.jobId ?? `job_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'generated',
        params: { ...formData },
        preview: `✅ Generated successfully — Job ${data.jobId}. Nội dung đã được tạo theo tham số: ${JSON.stringify(formData, null, 2)}`,
      }
      setLastResult(result)
      saveResult(result)

      setTimeout(() => {
        setIsGenerating(false)
        setProgress(0)
      }, 800)
    } catch {
      clearInterval(interval)
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const loadStandard = async () => {
    if (standardContent) return
    setLoadingStandard(true)
    try {
      const res = await fetch('/api/admin/standards')
      const data = await res.json()
      const matched = (data.files ?? []).find((f: { name: string }) =>
        f.name.toLowerCase().includes(moduleId.replace('-', '').toLowerCase().slice(0, 6))
      )
      if (matched) {
        const r2 = await fetch(`/api/admin/standards/${encodeURIComponent(matched.name)}`)
        const d2 = await r2.json()
        setStandardContent(d2.content ?? '# No standard document found')
      } else {
        setStandardContent(`# Standard — ${mod.name}\n\nChưa có tài liệu chuẩn cho module này.`)
      }
    } catch {
      setStandardContent('# Error\nKhông thể tải tài liệu chuẩn.')
    }
    setLoadingStandard(false)
  }

  // ── Action buttons ────────────────────────────────────────────────────────
  const ACTION_BUTTONS = [
    {
      icon: Sparkles, label: 'Generate', sublabel: 'AI tạo ngay',
      cls: `bg-gradient-to-br ${mod.gradient} text-white shadow-lg hover:opacity-90 hover:scale-105`,
      onClick: () => { setActiveTab('Generate'); setTimeout(handleGenerate, 300) },
      primary: true,
    },
    { icon: RefreshCw, label: 'Regenerate', sublabel: 'Tạo lại', cls: 'bg-gray-100 text-gray-700 hover:bg-gray-200', onClick: handleGenerate },
    { icon: Eye, label: 'Preview', sublabel: 'Xem trước', cls: 'bg-gray-100 text-gray-700 hover:bg-gray-200', onClick: () => setActiveTab('Results') },
    { icon: CheckSquare, label: 'QA Check', sublabel: 'Kiểm định', cls: 'bg-orange-50 text-orange-700 hover:bg-orange-100', onClick: () => { } },
    { icon: Upload, label: 'Export', sublabel: 'Xuất file', cls: 'bg-gray-100 text-gray-700 hover:bg-gray-200', onClick: () => { } },
    { icon: History, label: 'History', sublabel: 'Lịch sử', cls: 'bg-gray-100 text-gray-700 hover:bg-gray-200', onClick: () => setActiveTab('History') },
    { icon: Settings, label: 'Settings', sublabel: 'Cấu hình', cls: 'bg-transparent text-gray-500 hover:bg-gray-100 border border-gray-200', onClick: () => setActiveTab('Settings') },
  ]

  // ── Render Tabs ───────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      {/* What this module does */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-black text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen size={16} className="text-gray-500" /> Module này dùng để làm gì?
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          <strong>{mod.name}</strong> là module AI chuyên biệt trong hệ sinh thái AvaB. {mod.desc}.
          Module hoạt động trong pipeline giáo dục, nhận input từ người dùng và tạo ra nội dung chất lượng cao theo tiêu chuẩn AvaB.
        </p>
      </div>

      {/* I/O */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4">
          <h4 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs">↓</span>
            Input nhận vào
          </h4>
          <div className="flex flex-wrap gap-2">
            {mod.inputs.map(i => (
              <span key={i} className="bg-white text-blue-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-blue-200">
                {i}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <h4 className="font-bold text-green-800 text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs">↑</span>
            Output tạo ra
          </h4>
          <div className="flex flex-wrap gap-2">
            {mod.outputs.map(o => (
              <span key={o} className="bg-white text-green-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-green-200">
                {o}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h4 className="font-bold text-gray-700 text-sm mb-3">🔄 Workflow</h4>
        <div className="flex flex-wrap items-center gap-2">
          {mod.workflow.map((step, i) =>
            step === '→' ? (
              <span key={i} className="text-gray-400 font-bold">→</span>
            ) : (
              <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${mod.badge} border border-current/20`}>
                {step}
              </span>
            )
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Phiên bản', value: `v${mod.version}` },
          { label: 'Trạng thái', value: STATUS_LABEL[mod.status] },
          { label: 'Items tạo ra', value: results.length.toString() },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-lg font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderGenerate = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles size={16} className={`text-${mod.color}-600`} />
          Tham số Generate
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mod.fields.map(field => (
            <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-gray-50"
                  value={formData[field.id] ?? ''}
                  onChange={e => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                >
                  <option value="">— Chọn —</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-gray-50 resize-none"
                  placeholder={field.placeholder}
                  value={formData[field.id] ?? ''}
                  onChange={e => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                />
              ) : (
                <input
                  type={field.type}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-gray-50"
                  placeholder={field.placeholder}
                  value={formData[field.id] ?? ''}
                  onChange={e => setFormData(d => ({ ...d, [field.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        {/* Generate button */}
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all shadow-md
              bg-gradient-to-r ${mod.gradient} text-white
              hover:opacity-90 hover:scale-[1.01] hover:shadow-lg
              disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed`}
          >
            {isGenerating
              ? <><Loader2 size={22} className="animate-spin" /> Đang tạo nội dung…</>
              : <><Sparkles size={22} /> 🚀 Generate với AI</>
            }
          </button>

          {/* Progress bar */}
          {isGenerating && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Đang xử lý…</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${mod.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview result */}
      {lastResult && !isGenerating && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-green-600" />
            <span className="font-bold text-green-800">Generate thành công!</span>
            <span className="text-xs text-green-600 ml-auto">Job: {lastResult.jobId}</span>
          </div>
          <pre className="text-xs text-green-700 bg-green-100 rounded-xl p-3 whitespace-pre-wrap font-mono">
            {lastResult.preview}
          </pre>
          <div className="flex gap-2 mt-3">
            <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700">
              👁️ Preview
            </button>
            <button className="text-xs bg-white text-green-700 border border-green-300 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-50">
              ✅ Run QA
            </button>
            <button className="text-xs bg-white text-green-700 border border-green-300 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-50">
              📤 Export
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderResults = () => (
    <div className="space-y-4">
      {results.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Chưa có kết quả nào</p>
          <p className="text-sm mt-1">Nhấn Generate để tạo nội dung đầu tiên</p>
          <button onClick={() => setActiveTab('Generate')} className={`mt-4 px-4 py-2 bg-gradient-to-r ${mod.gradient} text-white rounded-xl text-sm font-bold`}>
            → Đến Generate
          </button>
        </div>
      ) : (
        results.map(r => {
          const st = RESULT_STATUS[r.status] ?? RESULT_STATUS.generated
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.cls}`}>
                <st.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm truncate">{r.jobId}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.createdAt).toLocaleString('vi-VN')}
                  {r.params?.subject && ` · ${r.params.subject}`}
                  {r.params?.grade && ` · ${r.params.grade}`}
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
              <div className="flex gap-1.5">
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">View</button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">Export</button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )

  const renderStandard = () => (
    <div>
      {!standardContent && !loadingStandard && (
        <div className="text-center py-10">
          <button
            onClick={loadStandard}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
          >
            📖 Load Standard Document
          </button>
        </div>
      )}
      {loadingStandard && (
        <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span>Đang tải tài liệu chuẩn…</span>
        </div>
      )}
      {standardContent && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 prose prose-sm max-w-none">
          {standardContent.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-black text-purple-800 mt-4 mb-2 pb-1 border-b border-purple-200">{line.slice(2)}</h1>
            if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-purple-700 mt-4 mb-1">{line.slice(3)}</h2>
            if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-gray-800 mt-3 mb-1">{line.slice(4)}</h3>
            if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 text-sm text-gray-700">{line.slice(2)}</li>
            if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-purple-300 pl-3 text-sm text-purple-700 bg-purple-50 my-2 py-1">{line.slice(2)}</blockquote>
            if (line.trim() === '') return <div key={i} className="h-2" />
            const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            return <p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: bold }} />
          })}
        </div>
      )}
    </div>
  )

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Clock size={16} /> Version History
        </h3>
        {[
          { ver: `v${mod.version}`, date: '2025-07-01', note: 'Current version — Production ready' },
          { ver: 'v0.9', date: '2025-06-15', note: 'Added QA integration, improved prompts' },
          { ver: 'v0.8', date: '2025-06-01', note: 'Beta release — core generation' },
          { ver: 'v0.5', date: '2025-05-01', note: 'Alpha — proof of concept' },
        ].map(v => (
          <div key={v.ver} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg shrink-0">{v.ver}</span>
            <div>
              <div className="text-sm font-semibold text-gray-800">{v.note}</div>
              <div className="text-xs text-gray-400">{v.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <h3 className="font-black text-gray-900 mb-2">⚙️ Module Settings</h3>
      {[
        { label: 'AI Model', value: 'GPT-5.5 (OpenAI)', desc: 'Model dùng để generate' },
        { label: 'Quality Level', value: 'High', desc: 'Mức chất lượng output' },
        { label: 'Auto QA', value: 'Disabled', desc: 'Tự động chạy QA sau generate' },
        { label: 'Save Results', value: 'Local Storage', desc: 'Nơi lưu kết quả' },
      ].map(s => (
        <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
          <div>
            <div className="text-sm font-bold text-gray-800">{s.label}</div>
            <div className="text-xs text-gray-400">{s.desc}</div>
          </div>
          <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{s.value}</span>
        </div>
      ))}
    </div>
  )

  const TAB_CONTENT: Record<string, () => React.ReactElement> = {
    Overview: renderOverview,
    Generate: renderGenerate,
    Results: renderResults,
    Standard: renderStandard,
    History: renderHistory,
    Settings: renderSettings,
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-14 bg-gradient-to-br from-gray-50 via-gray-50 to-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${mod.gradient} text-white py-8 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 mb-4 text-white/60 text-sm">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/ai-generator" className="hover:text-white transition-colors">AI Generator</Link>
            <span>/</span>
            <span className="text-white">{mod.name}</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{mod.icon}</div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black">{mod.name}</h1>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[mod.status]} bg-white/90 text-gray-700`}>
                    {STATUS_LABEL[mod.status]}
                  </span>
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">v{mod.version}</span>
                </div>
                <p className="text-white/70 text-sm max-w-lg">{mod.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <Clock size={12} />
              Last updated: hôm nay
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* ── Action Panel ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6">
          <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-1.5">
            <Zap size={12} className="text-purple-500" /> Quick Actions
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {ACTION_BUTTONS.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                disabled={isGenerating && btn.label === 'Generate'}
                className={`rounded-2xl p-4 flex flex-col items-center gap-2 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${btn.cls} ${btn.primary ? 'shadow-lg col-span-1' : ''}`}
              >
                {isGenerating && btn.label === 'Generate'
                  ? <Loader2 size={22} className="animate-spin" />
                  : <btn.icon size={22} />
                }
                <span className="leading-tight text-center">{btn.label}</span>
                <span className={`text-[10px] opacity-70 font-normal ${btn.primary ? '' : ''}`}>{btn.sublabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-5 pt-3">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    if (tab === 'Standard') loadStandard()
                  }}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab
                    ? `border-b-2 border-purple-600 text-purple-700 bg-purple-50/50`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {tab}
                  {tab === 'Results' && results.length > 0 && (
                    <span className="ml-1.5 bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full">{results.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {(TAB_CONTENT[activeTab] ?? renderOverview)()}
          </div>
        </div>
      </div>
    </div>
  )
}
