'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, MoreHorizontal, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  id:        string
  stepNum:   number
  stepType:  string
  status:    string   // pending | running | done | error | skipped
  content:   string | null
  metadata:  Record<string, unknown> | null
  startedAt: string | null
  doneAt:    string | null
  error:     string | null
}

interface Project {
  id:          string
  title:       string
  curriculum:  string
  grade:       string
  subject:     string
  subjectName: string | null
  chapter:     string | null
  topic:       string
  objective:   string | null
  difficulty:  string
  status:      string
  steps:       Step[]
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, type: 'setup',      label: 'Setup',      icon: '⚙️',  desc: 'Thông tin dự án' },
  { num: 2, type: 'curriculum', label: 'Đề cương',   icon: '📋',  desc: 'Cấu trúc bài học' },
  { num: 3, type: 'lesson',     label: 'Bài học',    icon: '📖',  desc: 'Nội dung đầy đủ' },
  { num: 4, type: 'homework',   label: 'BTVN',       icon: '📝',  desc: '30 câu phân loại' },
  { num: 5, type: 'qa',         label: 'QA',         icon: '✅',  desc: 'Kiểm định chất lượng' },
  { num: 6, type: 'preview',    label: 'Preview',    icon: '👁️',  desc: 'Xem trước' },
  { num: 7, type: 'publish',    label: 'Xuất bản',   icon: '🚀',  desc: 'Đưa vào hệ thống' },
  { num: 8, type: 'done',       label: 'Hoàn thành', icon: '🎉',  desc: 'Đã xong!' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stepStatusIcon(status: string) {
  switch (status) {
    case 'done':    return '✅'
    case 'running': return '🔄'
    case 'error':   return '❌'
    default:        return '⬜'
  }
}

function gradeLabel(grade: string) {
  return grade === 'preschool' ? 'Mầm non' : `Lớp ${grade}`
}

function diffLabel(d: string) {
  return { easy: '🟢 Dễ', medium: '🟡 Trung bình', hard: '🔴 Khó' }[d] ?? d
}

// ─── MarkdownRenderer (simple) ───────────────────────────────────────────────

function MarkdownRenderer({ content }: { content: string }) {
  // Very simple — just split paragraphs + preserve headers
  const lines = content.split('\n')
  return (
    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('# '))    return <h1 key={i} className="text-xl font-black text-gray-900 mt-4 mb-2">{line.slice(2)}</h1>
        if (line.startsWith('## '))   return <h2 key={i} className="text-base font-black text-gray-800 mt-4 mb-2 border-b border-gray-100 pb-1">{line.slice(3)}</h2>
        if (line.startsWith('### '))  return <h3 key={i} className="text-sm font-bold text-gray-800 mt-3 mb-1">{line.slice(4)}</h3>
        if (line.startsWith('#### ')) return <h4 key={i} className="text-sm font-semibold text-gray-700 mt-2 mb-1">{line.slice(5)}</h4>
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 text-sm list-disc">{line.slice(2)}</li>
        }
        if (/^\d+\. /.test(line)) {
          const text = line.replace(/^\d+\. /, '')
          return <li key={i} className="ml-4 text-sm list-decimal">{text}</li>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-sm font-bold text-gray-800 mt-1">{line.slice(2, -2)}</p>
        }
        if (line.startsWith('---')) return <hr key={i} className="my-3 border-gray-200" />
        if (line.trim() === '')    return <br key={i} />
        // Inline bold
        const boldReplaced = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        return <p key={i} className="text-sm mb-1" dangerouslySetInnerHTML={{ __html: boldReplaced }} />
      })}
    </div>
  )
}

// ─── ContentPanel ─────────────────────────────────────────────────────────────

function ContentPanel({
  step, project, onGenerate, generating, onApprove, onEdit,
}: {
  step: typeof STEPS[number]
  project: Project
  onGenerate: (type: string) => void
  generating: boolean
  onApprove: (stepType: string) => void
  onEdit: (stepType: string, content: string) => void
}) {
  const dbStep = project.steps.find(s => s.stepType === step.type)
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState(dbStep?.content ?? '')

  // Sync edit text when dbStep content changes
  useEffect(() => {
    setEditText(dbStep?.content ?? '')
    setEditMode(false)
  }, [dbStep?.content])

  const subj = project.subjectName ?? project.subject
  const grade = gradeLabel(project.grade)

  // ── Step 1: Setup ────────────────────────────────────────────────────────
  if (step.type === 'setup') {
    return (
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4">⚙️ Thông tin dự án</h2>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Chương trình" value={project.curriculum} />
            <InfoRow label="Khối lớp" value={grade} />
            <InfoRow label="Môn học" value={subj} />
            <InfoRow label="Độ khó" value={diffLabel(project.difficulty)} />
          </div>
          {project.chapter && <InfoRow label="Chương" value={project.chapter} />}
          <InfoRow label="Chủ đề" value={project.topic} highlight />
          {project.objective && <InfoRow label="Mục tiêu" value={project.objective} />}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
          <p className="font-bold mb-1">🤖 AI Studio sẽ tự động:</p>
          <ol className="space-y-1 ml-4 list-decimal">
            <li>Sinh đề cương chi tiết (Step 2)</li>
            <li>Viết bài học hoàn chỉnh (Step 3)</li>
            <li>Tạo 30 câu BTVN phân loại (Step 4)</li>
            <li>Chạy QA kiểm định chất lượng (Step 5)</li>
            <li>Preview để duyệt (Step 6)</li>
            <li>Xuất bản vào hệ thống (Step 7)</li>
          </ol>
        </div>

        <button
          onClick={() => onApprove('setup')}
          className="mt-4 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
        >
          Bắt đầu → Sinh Đề cương
        </button>
      </div>
    )
  }

  // ── Steps 2–5: AI Generate steps ─────────────────────────────────────────
  const genSteps: Record<string, { label: string; btnLabel: string; apiType: string }> = {
    curriculum: { label: 'Đề cương bài học', btnLabel: '🤖 Sinh Đề cương', apiType: 'curriculum' },
    lesson:     { label: 'Bài học hoàn chỉnh', btnLabel: '🤖 Sinh Bài học', apiType: 'lesson' },
    homework:   { label: 'Bài tập về nhà (30 câu)', btnLabel: '🤖 Sinh BTVN (30 câu)', apiType: 'homework' },
    qa:         { label: 'QA Report', btnLabel: '✅ Chạy QA', apiType: 'qa' },
  }

  const genDef = genSteps[step.type]

  if (genDef) {
    const isRunning = dbStep?.status === 'running' || (generating && !dbStep?.content)
    const isDone    = dbStep?.status === 'done'
    const hasError  = dbStep?.status === 'error'

    return (
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-1">{step.icon} {step.label}</h2>
        <p className="text-gray-500 text-sm mb-5">{genDef.label}</p>

        {/* Not yet generated */}
        {!isDone && !isRunning && !hasError && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-3">{step.icon}</div>
            <p className="text-gray-500 text-sm mb-4">Chưa có nội dung — nhấn để AI sinh tự động</p>
            <button
              onClick={() => onGenerate(genDef.apiType)}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-60"
            >
              {genDef.btnLabel}
            </button>
          </div>
        )}

        {/* Running */}
        {isRunning && (
          <div className="text-center py-16 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="inline-block w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
            <p className="font-bold text-purple-700">🤖 AI đang sinh nội dung...</p>
            <p className="text-purple-500 text-sm mt-1">Thường mất 15–30 giây</p>
          </div>
        )}

        {/* Error */}
        {hasError && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="flex-1">Lỗi: {dbStep?.error ?? 'Không rõ nguyên nhân'}</span>
            </div>
            <button
              onClick={() => onGenerate(genDef.apiType)}
              disabled={generating}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all"
            >
              <RefreshCw size={14} /> Thử lại
            </button>
          </div>
        )}

        {/* Done — show content */}
        {isDone && dbStep?.content && (
          <div>
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setEditMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!editMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  👁️ Xem
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${editMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  ✏️ Chỉnh sửa
                </button>
              </div>
              <button
                onClick={() => onGenerate(genDef.apiType)}
                disabled={generating}
                className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 min-h-[36px]"
              >
                <RefreshCw size={12} /> Làm lại
              </button>
            </div>

            {/* Content */}
            {editMode ? (
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full h-96 border-2 border-gray-200 rounded-2xl p-4 text-sm font-mono focus:border-purple-400 focus:outline-none resize-none bg-gray-50"
              />
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 h-96 overflow-y-auto">
                <MarkdownRenderer content={dbStep.content} />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-4 flex-wrap">
              {editMode && (
                <button
                  onClick={() => onEdit(step.type, editText)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
                >
                  💾 Lưu thay đổi
                </button>
              )}
              <button
                onClick={() => onApprove(step.type)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
              >
                ✅ Duyệt & Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Step 6: Preview ───────────────────────────────────────────────────────
  if (step.type === 'preview') {
    const lessonStep   = project.steps.find(s => s.stepType === 'lesson'   && s.status === 'done')
    const homeworkStep = project.steps.find(s => s.stepType === 'homework' && s.status === 'done')
    const qaStep       = project.steps.find(s => s.stepType === 'qa'       && s.status === 'done')

    const lessonDone   = !!lessonStep
    const hwDone       = !!homeworkStep

    return (
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-1">👁️ Preview</h2>
        <p className="text-gray-500 text-sm mb-5">Xem toàn bộ học liệu trước khi xuất bản</p>

        {(!lessonDone && !hwDone) ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">Cần hoàn thành Bài học và BTVN trước (Steps 3–4)</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QA summary */}
            {qaStep?.content && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                <p className="font-bold text-green-800 mb-1">✅ QA Report Summary</p>
                <p className="text-green-700 line-clamp-3">{qaStep.content.slice(0, 300)}...</p>
              </div>
            )}

            {/* Lesson preview */}
            {lessonStep?.content && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">📖 Bài học</p>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 max-h-72 overflow-y-auto">
                  <MarkdownRenderer content={lessonStep.content} />
                </div>
              </div>
            )}

            {/* Homework preview */}
            {homeworkStep?.content && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">📝 BTVN (30 câu)</p>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 max-h-72 overflow-y-auto">
                  <MarkdownRenderer content={homeworkStep.content} />
                </div>
              </div>
            )}

            <button
              onClick={() => onApprove('preview')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              ✅ Approve Preview → Xuất bản
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Step 7: Publish ───────────────────────────────────────────────────────
  if (step.type === 'publish') {
    return (
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-1">🚀 Xuất bản</h2>
        <p className="text-gray-500 text-sm mb-5">Đưa học liệu vào hệ thống AvaB</p>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6">
            <p className="font-bold text-green-800 mb-3">📦 Nội dung sẵn sàng xuất bản:</p>
            <ul className="space-y-2 text-sm text-green-700">
              {project.steps.filter(s => s.status === 'done' && s.stepType !== 'setup').map(s => (
                <li key={s.id} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500" />
                  {STEPS.find(st => st.type === s.stepType)?.label ?? s.stepType}
                  {s.metadata && (s.metadata as { wordCount?: number }).wordCount && (
                    <span className="text-green-500 text-xs">
                      ({(s.metadata as { wordCount?: number }).wordCount} từ)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-bold mb-1">💡 Sau khi xuất bản:</p>
            <ul className="space-y-1 ml-4 list-disc text-xs">
              <li>Bài học sẽ được lưu vào Subject Bank</li>
              <li>30 câu BTVN sẽ vào Question Bank</li>
              <li>Admin có thể gán vào bất kỳ khoá học nào</li>
            </ul>
          </div>

          <button
            onClick={() => onApprove('publish')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-black text-base hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            🚀 Xuất bản học liệu!
          </button>
        </div>
      </div>
    )
  }

  // ── Step 8: Done ──────────────────────────────────────────────────────────
  if (step.type === 'done') {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Hoàn thành!</h2>
        <p className="text-gray-500 text-sm mb-6">Học liệu đã được tạo và xuất bản thành công</p>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 mb-6 text-left">
          <p className="font-bold text-purple-800 mb-3">📊 Tóm tắt:</p>
          <div className="space-y-2 text-sm text-purple-700">
            <p>📖 Bài học: {project.title}</p>
            <p>🏫 {gradeLabel(project.grade)} — {project.subjectName ?? project.subject}</p>
            <p>📝 30 câu BTVN (10 dễ + 10 TB + 10 khó)</p>
            <p>✅ Đã QA và xuất bản</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/admin/ai-studio/new"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm">
            ➕ Tạo dự án mới
          </Link>
          <Link href="/admin/ai-studio"
            className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
            📋 Danh sách dự án
          </Link>
        </div>
      </div>
    )
  }

  return null
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-semibold">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${highlight ? 'text-purple-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIStudioWorkspacePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params)

  const [project,     setProject]     = useState<Project | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [activeStep,  setActiveStep]  = useState(1)
  const [generating,  setGenerating]  = useState(false)
  const [error,       setError]       = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // ── Fetch project ───────────────────────────────────────────────────────
  const fetchProject = useCallback(async () => {
    try {
      const res  = await fetch(`/api/admin/ai-studio/projects/${projectId}`)
      const data = await res.json()
      if (data.success) {
        setProject(data.project)
        // Set active step to first non-done step
        const firstPending = data.project.steps.findIndex((s: Step) => s.status !== 'done')
        if (firstPending !== -1) {
          const stepNum = data.project.steps[firstPending].stepNum
          setActiveStep(Math.min(stepNum, 8))
        } else {
          setActiveStep(8)
        }
      }
    } catch {
      setError('Không tải được dự án')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchProject() }, [fetchProject])

  // ── Generate handler ────────────────────────────────────────────────────
  const handleGenerate = async (type: string) => {
    if (generating) return
    setGenerating(true)
    setError('')

    // Optimistically update step status
    setProject(prev => {
      if (!prev) return prev
      return {
        ...prev,
        steps: prev.steps.map(s => s.stepType === type ? { ...s, status: 'running' } : s),
      }
    })

    try {
      const res  = await fetch('/api/admin/ai-studio/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type, projectId }),
      })
      const data = await res.json()

      if (data.success) {
        await fetchProject()
      } else {
        setError(data.error ?? 'AI sinh thất bại')
        setProject(prev => {
          if (!prev) return prev
          return {
            ...prev,
            steps: prev.steps.map(s => s.stepType === type ? { ...s, status: 'error', error: data.error } : s),
          }
        })
      }
    } catch {
      setError('Lỗi kết nối server')
    } finally {
      setGenerating(false)
    }
  }

  // ── Approve step ────────────────────────────────────────────────────────
  const handleApprove = async (stepType: string) => {
    // Move to next step
    const cur = STEPS.find(s => s.type === stepType)
    if (!cur) return

    // If it's setup, move to step 2 and trigger curriculum generate
    if (stepType === 'setup') {
      setActiveStep(2)
      return
    }

    // If it's publish, mark project as published
    if (stepType === 'publish') {
      try {
        await fetch(`/api/admin/ai-studio/projects/${projectId}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: 'published' }),
        })
        await fetchProject()
        setActiveStep(8)
      } catch { /* ignore */ }
      return
    }

    // Move to next step
    const next = STEPS.find(s => s.num === cur.num + 1)
    if (next) setActiveStep(next.num)
  }

  // ── Edit step content ───────────────────────────────────────────────────
  const handleEdit = async (stepType: string, content: string) => {
    if (!project) return
    const step = project.steps.find(s => s.stepType === stepType)
    if (!step) return

    try {
      // We'll save via PUT on the project — for simplicity update local state
      // In a full implementation you'd have a step-update API
      setProject(prev => {
        if (!prev) return prev
        return {
          ...prev,
          steps: prev.steps.map(s => s.stepType === stepType ? { ...s, content } : s),
        }
      })
    } catch { /* ignore */ }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Đang tải dự án...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Không tìm thấy dự án</p>
          <Link href="/admin/ai-studio" className="text-purple-600 hover:underline">← Quay lại AI Studio</Link>
        </div>
      </div>
    )
  }

  const currentStep = STEPS.find(s => s.num === activeStep) ?? STEPS[0]

  const getStepStatus = (stepType: string) => {
    const dbStep = project.steps.find(s => s.stepType === stepType)
    return dbStep?.status ?? 'pending'
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 flex flex-col">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 sticky top-0 z-30" style={{ top: '4rem' }}>
        <Link href="/admin/ai-studio"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-gray-900 text-sm truncate">{project.title}</h1>
          <p className="text-xs text-gray-400">
            {gradeLabel(project.grade)} • {project.subjectName ?? project.subject} • {project.topic}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <AlertCircle size={12} /> {error}
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 text-xs font-bold"
            title="Toggle sidebar"
          >
            ☰
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* ── Mobile step bar ───────────────────────────────────────────────── */}
      <div className="md:hidden bg-white border-b border-gray-100 px-4 py-2 flex overflow-x-auto gap-1.5 flex-shrink-0">
        {STEPS.map(s => {
          const status = getStepStatus(s.type)
          const isActive = activeStep === s.num
          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl text-center text-xs transition-all min-h-[44px] ${
                isActive    ? 'bg-purple-600 text-white font-bold'
                : status === 'done' ? 'bg-green-50 text-green-700'
                : 'text-gray-400'
              }`}
            >
              <span className="text-sm">{status === 'done' ? '✅' : s.icon}</span>
              <span className="whitespace-nowrap leading-none">{s.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="hidden md:flex flex-col w-48 sm:w-56 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="p-4">
              <p className="text-sm font-bold text-gray-700 mb-3">STEPS</p>
              <div className="space-y-1">
                {STEPS.map(s => {
                  const status   = getStepStatus(s.type)
                  const isActive = activeStep === s.num
                  const icon     = stepStatusIcon(status)
                  return (
                    <button
                      key={s.num}
                      onClick={() => setActiveStep(s.num)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white font-bold shadow-sm'
                          : status === 'done'
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : status === 'running'
                          ? 'bg-blue-50 text-blue-700'
                          : status === 'error'
                          ? 'bg-red-50 text-red-700'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm flex-shrink-0">{isActive ? s.icon : icon}</span>
                      <div className="min-w-0">
                        <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : ''}`}>
                          {s.label}
                        </div>
                        <div className={`text-xs leading-tight truncate ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>
                          {s.desc}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Progress */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Tiến độ</span>
                  <span className="font-bold text-purple-600">
                    {project.steps.filter(s => s.status === 'done').length}/8
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${(project.steps.filter(s => s.status === 'done').length / 8) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">
              {/* Step header */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <span className="text-2xl">{currentStep.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                      Step {currentStep.num}/8
                    </span>
                    {generating && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={10} /> AI đang chạy...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ContentPanel
                step={currentStep}
                project={project}
                onGenerate={handleGenerate}
                generating={generating}
                onApprove={handleApprove}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
