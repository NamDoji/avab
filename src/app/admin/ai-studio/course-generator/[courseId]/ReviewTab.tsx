'use client'

import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  CheckCircle, Edit3, Save, X, RefreshCw, FileText, ChevronDown, ChevronUp,
  Eye, EyeOff, BarChart2,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Material {
  id:      string
  type:    string
  title:   string | null
  content: string | null
}

interface SubjectWithMaterials {
  id:        string
  name:      string
  materials: Material[]
}

interface ReviewTabProps {
  subjects:       SubjectWithMaterials[]
  courseId:       string
  approvalStatus: string
}

type FilterType =
  | 'THEORY'
  | 'lesson-outline'
  | 'HOMEWORK'
  | 'ANSWER_KEY'
  | 'QUIZ'
  | 'TEACHER_GUIDE'
  | 'VIDEO_SCRIPT'

// ─── Constants ─────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { type: FilterType; label: string; icon: string }[] = [
  { type: 'THEORY',         label: 'Lý thuyết',     icon: '📖' },
  { type: 'lesson-outline', label: 'Outline',        icon: '📋' },
  { type: 'HOMEWORK',       label: 'Bài tập',        icon: '📝' },
  { type: 'ANSWER_KEY',     label: 'Đáp án',         icon: '✅' },
  { type: 'QUIZ',           label: 'Đề kiểm tra',    icon: '📊' },
  { type: 'TEACHER_GUIDE',  label: 'Hướng dẫn GV',  icon: '👩‍🏫' },
  { type: 'VIDEO_SCRIPT',   label: 'Kịch bản video', icon: '🎬' },
]

const APPROVAL_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Bản nháp',    color: '#6b7280', bg: '#f3f4f6' },
  review:    { label: 'Đang duyệt',  color: '#d97706', bg: '#fef3c7' },
  approved:  { label: 'Đã duyệt',    color: '#059669', bg: '#d1fae5' },
  published: { label: 'Đã xuất bản', color: '#2563eb', bg: '#dbeafe' },
  archived:  { label: 'Lưu trữ',     color: '#dc2626', bg: '#fee2e2' },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function countWords(text: string | null): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

function qualityScore(content: string | null): { score: number; label: string; color: string } {
  const words = countWords(content)
  if (words === 0) return { score: 0, label: 'Trống',      color: 'text-gray-400'  }
  if (words < 100) return { score: 1, label: 'Quá ngắn',   color: 'text-red-500'   }
  if (words < 300) return { score: 2, label: 'Đủ dùng',    color: 'text-yellow-500'}
  if (words < 800) return { score: 3, label: 'Tốt',        color: 'text-blue-500'  }
  return              { score: 4, label: 'Xuất sắc',    color: 'text-green-600' }
}

// ─── MaterialContent component ─────────────────────────────────────────────────

function MaterialContent({
  material,
  onSaved,
}: {
  material: Material
  onSaved:  (id: string, content: string) => void
}) {
  const [editing,      setEditing]      = useState(false)
  const [editedContent, setEditedContent] = useState(material.content ?? '')
  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState('')
  const [preview,      setPreview]      = useState(true)
  const [expanded,     setExpanded]     = useState(false)

  const wc = countWords(material.content)
  const qs = qualityScore(material.content)

  async function saveContent() {
    if (!material.id) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/admin/materials/${material.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content: editedContent }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) throw new Error(data.error ?? 'Lỗi lưu')
      onSaved(material.id, editedContent)
      setEditing(false)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }

  if (!material.content && !editing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-4xl mb-3">📄</p>
        <p className="font-bold text-gray-500 text-sm">Chưa có nội dung</p>
        <button
          onClick={() => setEditing(true)}
          className="mt-3 text-xs font-semibold text-cherry-600 hover:text-cherry-800 bg-cherry-50 px-3 py-1.5 rounded-lg transition"
        >
          ✏️ Nhập thủ công
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Quality */}
        <div className="flex items-center gap-1.5 text-xs">
          <BarChart2 size={12} className="text-gray-400" />
          <span className="text-gray-500">{wc.toLocaleString()} từ</span>
          <span className={`font-semibold ${qs.color}`}>· {qs.label}</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {!editing && (
            <>
              <button
                onClick={() => setPreview(v => !v)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition"
              >
                {preview ? <EyeOff size={12} /> : <Eye size={12} />}
                {preview ? 'Raw' : 'Preview'}
              </button>
              <button
                onClick={() => { setEditedContent(material.content ?? ''); setEditing(true) }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
              >
                <Edit3 size={12} />
                Sửa
              </button>
            </>
          )}
          {editing && (
            <>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg transition"
              >
                <X size={12} />
                Huỷ
              </button>
              <button
                onClick={saveContent}
                disabled={saving}
                className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg transition disabled:opacity-60"
              >
                {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </>
          )}
        </div>
      </div>

      {saveError && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">{saveError}</p>
      )}

      {/* Edit textarea */}
      {editing ? (
        <textarea
          value={editedContent}
          onChange={e => setEditedContent(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y bg-gray-50"
          placeholder="Nhập nội dung Markdown..."
        />
      ) : preview ? (
        /* Markdown preview */
        <div className="relative">
          <div
            className={`overflow-hidden transition-all ${expanded ? '' : 'max-h-[400px]'}`}
          >
            <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-gray-700 prose-li:text-gray-700">
              <ReactMarkdown>{material.content ?? ''}</ReactMarkdown>
            </div>
          </div>
          {(material.content?.length ?? 0) > 1000 && (
            <div className={`${expanded ? '' : 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white pt-8'}`}>
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-cherry-600 hover:text-cherry-800 mx-auto"
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expanded ? 'Thu gọn' : 'Xem toàn bộ'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Raw text */
        <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono">
          {material.content}
        </pre>
      )}
    </div>
  )
}

// ─── Main ReviewTab ────────────────────────────────────────────────────────────

export default function ReviewTab({
  subjects,
  courseId,
  approvalStatus: initialApprovalStatus,
}: ReviewTabProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id ?? '')
  const [filterType,        setFilterType]         = useState<FilterType>('THEORY')
  const [localSubjects,     setLocalSubjects]       = useState(subjects)
  const [approvalStatus,    setApprovalStatus]      = useState(initialApprovalStatus)
  const [approving,         setApproving]           = useState(false)
  const [approvalMsg,       setApprovalMsg]         = useState('')

  const selectedSubject   = localSubjects.find(s => s.id === selectedSubjectId)
  const selectedMaterial  = selectedSubject?.materials.find(m => m.type === filterType)
  const statusCfg = APPROVAL_STATUS_CONFIG[approvalStatus] ?? APPROVAL_STATUS_CONFIG.draft

  // Count filled materials for selected subject
  const filledCount = selectedSubject
    ? selectedSubject.materials.filter(m => m.content).length
    : 0
  const totalCount  = selectedSubject ? selectedSubject.materials.length : 0

  // Update local content after save
  const handleMaterialSaved = useCallback((id: string, content: string) => {
    setLocalSubjects(prev => prev.map(s => ({
      ...s,
      materials: s.materials.map(m => m.id === id ? { ...m, content } : m),
    })))
  }, [])

  // Approve course
  async function approveCourse() {
    const nextStatus: Record<string, string> = {
      draft:    'review',
      review:   'approved',
      approved: 'published',
    }
    const next = nextStatus[approvalStatus]
    if (!next) return

    setApproving(true)
    setApprovalMsg('')
    try {
      const res = await fetch(
        `/api/admin/ai-studio/course-generator/${courseId}/approval`,
        {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ approvalStatus: next }),
        }
      )
      const data = await res.json() as { success: boolean; approvalStatus?: string; error?: string }
      if (!data.success) throw new Error(data.error ?? 'Lỗi cập nhật')
      setApprovalStatus(data.approvalStatus ?? next)
      setApprovalMsg('✅ Cập nhật trạng thái thành công')
    } catch (e: unknown) {
      setApprovalMsg(`❌ ${e instanceof Error ? e.message : 'Lỗi'}`)
    } finally {
      setApproving(false)
      setTimeout(() => setApprovalMsg(''), 3000)
    }
  }

  const NEXT_ACTION_LABEL: Record<string, string> = {
    draft:    '🔍 Gửi Review',
    review:   '✅ Phê duyệt khoá học',
    approved: '🚀 Xuất bản',
  }
  const nextActionLabel = NEXT_ACTION_LABEL[approvalStatus]

  return (
    <div className="flex flex-col gap-4">

      {/* ── Approval bar ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ color: statusCfg.color, background: statusCfg.bg }}
        >
          {statusCfg.label}
        </span>

        {nextActionLabel && (
          <button
            onClick={approveCourse}
            disabled={approving}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {approving ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            {approving ? 'Đang xử lý...' : nextActionLabel}
          </button>
        )}

        {approvalMsg && (
          <span className="text-xs font-semibold text-gray-600">{approvalMsg}</span>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <FileText size={12} />
          {localSubjects.reduce((a, s) => a + s.materials.filter(m => m.content).length, 0)}/
          {localSubjects.reduce((a, s) => a + s.materials.length, 0)} học liệu có nội dung
        </div>
      </div>

      {/* ── Content area ───────────────────────────────────────────────── */}
      <div className="flex gap-4 min-h-[500px]">

        {/* Left sidebar */}
        <div className="w-52 flex-shrink-0">
          <p className="text-xs font-bold text-gray-500 mb-2 px-1 uppercase tracking-wide">
            Chuyên đề
          </p>
          <div className="flex flex-col gap-0.5">
            {localSubjects.map(subject => {
              const filled = subject.materials.filter(m => m.type === filterType && m.content).length
              const total  = subject.materials.filter(m => m.type === filterType).length
              const hasMaterial = filled > 0
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedSubjectId === subject.id
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${hasMaterial ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="flex-1 truncate">{subject.name}</span>
                  {total > 0 && (
                    <span className="text-xs text-gray-400 flex-shrink-0">{filled}/{total}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Subject stats */}
          {selectedSubject && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-700">{selectedSubject.name}</p>
              <p>{filledCount}/{totalCount} học liệu có nội dung</p>
              {filledCount === totalCount && totalCount > 0 && (
                <p className="text-emerald-600 font-semibold">✅ Hoàn chỉnh</p>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Type filter */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_OPTIONS.map(opt => {
              const hasContent = selectedSubject?.materials.some(m => m.type === opt.type && m.content)
              return (
                <button
                  key={opt.type}
                  onClick={() => setFilterType(opt.type)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    filterType === opt.type
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : hasContent
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {opt.icon} {opt.label}
                  {hasContent && filterType !== opt.type && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Content panel */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-y-auto max-h-[700px]">
            {selectedMaterial?.id ? (
              <div>
                {selectedMaterial.title && (
                  <h2 className="text-base font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">
                    {selectedMaterial.title}
                  </h2>
                )}
                <MaterialContent
                  material={selectedMaterial}
                  onSaved={handleMaterialSaved}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
                <div className="text-5xl mb-4">
                  {FILTER_OPTIONS.find(o => o.type === filterType)?.icon ?? '📄'}
                </div>
                <p className="font-bold text-gray-600 mb-1">Chưa có nội dung</p>
                <p className="text-sm text-gray-400">
                  {selectedSubject
                    ? `"${selectedSubject.name}" chưa có ${FILTER_OPTIONS.find(o => o.type === filterType)?.label ?? filterType}`
                    : 'Chọn một chuyên đề để xem nội dung'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
