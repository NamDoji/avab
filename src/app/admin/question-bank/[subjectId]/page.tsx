'use client'

import { useState, useEffect, useMemo, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Search, Filter, Trash2, Edit3, Sparkles,
  RefreshCw, ChevronDown, ChevronUp, X, CheckCircle, Circle,
  BookOpen, Layers, AlertCircle
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  id: string
  order: number
  questionType: string
  content: string
  correctAnswer: string
  options: any
  explanation: string | null
  points: number
  imageUrl: string | null
  createdAt: string
}

interface Subject {
  id: string
  name: string
  icon: string | null
  course: { id: string; name: string; code: string; grade: string | null }
}

interface Stats {
  total: number
  byType: Record<string, number>
  easy: number
  medium: number
  hard: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const Q_TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'OPEN', label: 'Tự luận' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm' },
  { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
  { value: 'MATCHING', label: 'Nối đáp' },
  { value: 'FILL_BLANK', label: 'Điền chỗ trống' },
  { value: 'NUMBER_INPUT', label: 'Số học' },
  { value: 'SHORT_ANSWER', label: 'Trả lời ngắn' },
  { value: 'SORT_WORDS', label: 'Sắp xếp từ' },
  { value: 'GROUP_CLASSIFY', label: 'Phân loại' },
  { value: 'MULTI_BLANK', label: 'Nhiều chỗ trống' },
]

const DIFF_OPTIONS = [
  { value: '', label: 'Tất cả độ khó' },
  { value: 'easy', label: '🟢 Dễ (1đ)' },
  { value: 'medium', label: '🟡 Trung bình (2-3đ)' },
  { value: 'hard', label: '🔴 Khó (4đ+)' },
]

const Q_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  MULTIPLE_CHOICE: { label: 'Trắc nghiệm', color: 'bg-blue-100 text-blue-700' },
  OPEN: { label: 'Tự luận', color: 'bg-purple-100 text-purple-700' },
  TRUE_FALSE: { label: 'Đúng/Sai', color: 'bg-green-100 text-green-700' },
  MATCHING: { label: 'Nối đáp', color: 'bg-orange-100 text-orange-700' },
  FILL_BLANK: { label: 'Điền chỗ trống', color: 'bg-teal-100 text-teal-700' },
  NUMBER_INPUT: { label: 'Số học', color: 'bg-red-100 text-red-700' },
  SHORT_ANSWER: { label: 'Trả lời ngắn', color: 'bg-indigo-100 text-indigo-700' },
  SORT_WORDS: { label: 'Sắp xếp từ', color: 'bg-pink-100 text-pink-700' },
  GROUP_CLASSIFY: { label: 'Phân loại', color: 'bg-yellow-100 text-yellow-700' },
  MULTI_BLANK: { label: 'Nhiều chỗ trống', color: 'bg-cyan-100 text-cyan-700' },
}

function diffLabel(points: number) {
  if (points <= 1) return { label: 'Dễ', color: 'bg-green-100 text-green-700', dot: '🟢' }
  if (points <= 3) return { label: 'TB', color: 'bg-yellow-100 text-yellow-700', dot: '🟡' }
  return { label: 'Khó', color: 'bg-red-100 text-red-700', dot: '🔴' }
}

// ─── Edit Modal ─────────────────────────────────────────────────────────────────

function EditModal({
  question,
  onClose,
  onSaved,
}: {
  question: Question
  onClose: () => void
  onSaved: () => void
}) {
  const [content, setContent] = useState(question.content)
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer)
  const [explanation, setExplanation] = useState(question.explanation ?? '')
  const [points, setPoints] = useState(String(question.points))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!content.trim() || !correctAnswer.trim()) {
      setError('Nội dung và đáp án không được để trống')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          correctAnswer: correctAnswer.trim(),
          explanation: explanation.trim() || null,
          points: Number(points) || 1,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Lỗi không xác định')
      onSaved()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-3xl p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Edit3 size={18} className="text-blue-500" />
            Chỉnh sửa câu hỏi
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Question type badge (read-only) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Loại câu hỏi</label>
            <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${Q_TYPE_BADGE[question.questionType]?.color ?? 'bg-gray-100 text-gray-700'}`}>
              {Q_TYPE_BADGE[question.questionType]?.label ?? question.questionType}
            </span>
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nội dung câu hỏi *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          {/* Correct answer */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Đáp án đúng *</label>
            <input
              type="text"
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Explanation */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Giải thích (tuỳ chọn)</label>
            <textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              placeholder="Lời giải / gợi ý..."
            />
          </div>

          {/* Points */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Điểm</label>
            <select
              value={points}
              onChange={e => setPoints(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              {[1, 2, 3, 4, 5].map(p => (
                <option key={p} value={p}>{p} điểm</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white rounded-b-3xl p-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition min-h-[44px]"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition disabled:opacity-60 min-h-[44px] flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Question Row ───────────────────────────────────────────────────────────────

function QuestionRow({
  question,
  index,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  question: Question
  index: number
  selected: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const typeBadge = Q_TYPE_BADGE[question.questionType] ?? { label: question.questionType, color: 'bg-gray-100 text-gray-700' }
  const diff = diffLabel(question.points)

  return (
    <div className={`bg-white rounded-2xl border transition-all ${selected ? 'border-blue-400 shadow-md' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
      <div className="p-4 flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggleSelect}
          className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-blue-500 transition"
        >
          {selected ? <CheckCircle size={18} className="text-blue-500" /> : <Circle size={18} />}
        </button>

        {/* Order */}
        <span className="flex-shrink-0 w-6 text-xs font-black text-gray-400 mt-0.5">{index + 1}.</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-gray-900 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
            {question.content}
          </p>
          {question.content.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center gap-1"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}

          {expanded && (
            <div className="mt-2 space-y-1.5">
              {/* Show options for multiple choice */}
              {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {(Array.isArray(question.options) ? question.options : []).map((opt: any) => (
                    <div
                      key={opt.key}
                      className={`text-xs px-2.5 py-1.5 rounded-lg ${opt.key === question.correctAnswer ? 'bg-green-50 text-green-700 font-semibold border border-green-200' : 'bg-gray-50 text-gray-600'}`}
                    >
                      {opt.key}. {opt.text}
                    </div>
                  ))}
                </div>
              )}
              {/* Explanation */}
              {question.explanation && (
                <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700">
                  💡 {question.explanation}
                </div>
              )}
            </div>
          )}

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge.color}`}>
              {typeBadge.label}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diff.color}`}>
              {diff.dot} {diff.label}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Đáp án: <strong className="text-gray-700">{question.correctAnswer}</strong>
            </span>
            <span className="text-xs text-gray-400">{question.points}đ</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Chỉnh sửa"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Xoá"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function QuestionBankSubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = use(params)

  const [subject, setSubject] = useState<Subject | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [diffFilter, setDiffFilter] = useState('')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals
  const [editingQ, setEditingQ] = useState<Question | null>(null)
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const [aiGenerating, setAiGenerating] = useState(false)

  // Toast
  const [toast, setToast] = useState('')
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (diffFilter) params.set('difficulty', diffFilter)
      const res = await fetch(`/api/admin/question-bank/${subjectId}?${params}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setSubject(data.data.subject)
      setQuestions(data.data.questions)
      setStats(data.data.stats)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [subjectId, typeFilter, diffFilter])

  // Client-side search
  const filteredQuestions = useMemo(() => {
    if (!search) return questions
    return questions.filter(q =>
      q.content.toLowerCase().includes(search.toLowerCase()) ||
      q.correctAnswer.toLowerCase().includes(search.toLowerCase())
    )
  }, [questions, search])

  async function handleDelete(ids: string[]) {
    if (!confirm(`Xoá ${ids.length} câu hỏi? Hành động này không thể hoàn tác.`)) return
    setDeletingIds(ids)
    try {
      await Promise.all(ids.map(id =>
        fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
      ))
      showToast(`✅ Đã xoá ${ids.length} câu hỏi`)
      setSelectedIds(new Set())
      fetchData()
    } catch {
      showToast('❌ Xoá thất bại, thử lại sau')
    } finally {
      setDeletingIds([])
    }
  }

  async function handleAIGenerate() {
    if (!subject) return
    if (!confirm('Sinh 30 câu hỏi AI cho chủ đề này?')) return
    setAiGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, subjectName: subject.name }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Lỗi AI')
      showToast('✅ Đã sinh 30 câu hỏi AI mới!')
      fetchData()
    } catch (e: any) {
      showToast(`❌ ${e.message}`)
    } finally {
      setAiGenerating(false)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)))
    }
  }

  const grade = subject?.course?.grade
    ? subject.course.grade.split(',').map(g => `Lớp ${g.trim()}`).join(', ')
    : 'Tất cả lớp'

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-lg font-semibold text-sm">
          {toast}
        </div>
      )}

      {/* Edit Modal */}
      {editingQ && (
        <EditModal
          question={editingQ}
          onClose={() => setEditingQ(null)}
          onSaved={() => { fetchData(); showToast('✅ Đã lưu câu hỏi') }}
        />
      )}

      {/* Header */}
      <div className="bg-gray-900 text-white py-10">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-3 text-sm">
            <Link href="/admin" className="text-gray-400 hover:text-white transition">← Admin</Link>
            <span className="text-gray-600">/</span>
            <Link href="/admin/question-bank" className="text-gray-400 hover:text-white transition">Question Bank</Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 truncate max-w-[200px]">{subject?.name ?? '...'}</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black mb-1 flex items-center gap-3">
                <span>{subject?.icon ?? '📚'}</span>
                {subject?.name ?? 'Đang tải...'}
              </h1>
              {subject && (
                <p className="text-gray-400 text-sm">
                  {subject.course.name} · {grade}
                  {stats && ` · ${stats.total} câu hỏi`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/subjects/${subjectId}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-semibold hover:bg-gray-600 transition min-h-[44px]"
              >
                <BookOpen size={15} />
                Quản lý chủ đề
              </Link>
              <button
                onClick={handleAIGenerate}
                disabled={aiGenerating}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-60 min-h-[44px]"
              >
                {aiGenerating ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {aiGenerating ? 'Đang sinh...' : 'AI Sinh câu hỏi'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-2xl font-black text-purple-600">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-0.5">Tổng câu</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-2xl font-black text-green-600">{stats.easy}</div>
              <div className="text-xs text-gray-500 mt-0.5">🟢 Dễ</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-2xl font-black text-yellow-600">{stats.medium}</div>
              <div className="text-xs text-gray-500 mt-0.5">🟡 Trung bình</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-2xl font-black text-red-600">{stats.hard}</div>
              <div className="text-xs text-gray-500 mt-0.5">🔴 Khó</div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm câu hỏi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[40px]"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[40px] bg-white"
          >
            {Q_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Difficulty filter */}
          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[40px] bg-white"
          >
            {DIFF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {(search || typeFilter || diffFilter) && (
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setDiffFilter('') }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition min-h-[40px]"
            >
              <X size={14} /> Xoá lọc
            </button>
          )}

          <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <Layers size={12} />
            {filteredQuestions.length} câu
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-blue-700">
              Đã chọn {selectedIds.size} câu
            </span>
            <button
              onClick={() => handleDelete(Array.from(selectedIds))}
              disabled={deletingIds.length > 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition disabled:opacity-60 min-h-[32px]"
            >
              <Trash2 size={13} />
              Xoá {selectedIds.size} câu
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 transition min-h-[32px]"
            >
              <X size={13} />
              Bỏ chọn
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-2xl p-4 mb-4 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-purple-400" />
          </div>
        )}

        {/* Question list header */}
        {!loading && filteredQuestions.length > 0 && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition"
            >
              {selectedIds.size === filteredQuestions.length
                ? <CheckCircle size={14} className="text-blue-500" />
                : <Circle size={14} />
              }
              {selectedIds.size === filteredQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <span className="text-xs text-gray-400">{filteredQuestions.length} câu hỏi</span>
          </div>
        )}

        {/* Question list */}
        {!loading && (
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                question={q}
                index={idx}
                selected={selectedIds.has(q.id)}
                onToggleSelect={() => toggleSelect(q.id)}
                onEdit={() => setEditingQ(q)}
                onDelete={() => handleDelete([q.id])}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-black text-gray-900 text-lg mb-2">Không có câu hỏi nào</h3>
            <p className="text-gray-500 text-sm mb-4">
              {search || typeFilter || diffFilter
                ? 'Thử thay đổi bộ lọc'
                : 'Chủ đề này chưa có câu hỏi nào'}
            </p>
            {!search && !typeFilter && !diffFilter && (
              <button
                onClick={handleAIGenerate}
                disabled={aiGenerating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-60"
              >
                <Sparkles size={15} />
                Sinh câu hỏi AI ngay
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
