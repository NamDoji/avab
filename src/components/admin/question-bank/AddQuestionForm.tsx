'use client'

import { useState } from 'react'
import {
  PlusCircle, X, RefreshCw, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react'

// ─── Constants ─────────────────────────────────────────────────────────────────

export const ADD_Q_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm (A/B/C/D)' },
  { value: 'OPEN',            label: 'Tự luận' },
  { value: 'FILL_BLANK',      label: 'Điền khuyết' },
  { value: 'TRUE_FALSE',      label: 'Đúng/Sai' },
  { value: 'SHORT_ANSWER',    label: 'Trả lời ngắn' },
]

const DIFFICULTY_MAP: Record<string, number> = {
  easy:   1,
  medium: 2,
  hard:   4,
}

const DIFFICULTY_LABELS = [
  { value: 'easy',   label: '🟢 Dễ',       points: 1 },
  { value: 'medium', label: '🟡 Trung bình', points: 2 },
  { value: 'hard',   label: '🔴 Khó',       points: 4 },
]

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AddQuestionFormProps {
  subjectId: string
  onSaved:   () => void
  onCancel?: () => void
  /** When true, renders in a collapsible card; when false, always visible */
  collapsible?: boolean
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AddQuestionForm({
  subjectId,
  onSaved,
  onCancel,
  collapsible = true,
}: AddQuestionFormProps) {
  const [expanded, setExpanded]       = useState(!collapsible)
  const [qType,    setQType]          = useState('MULTIPLE_CHOICE')
  const [content,  setContent]        = useState('')
  const [optA,     setOptA]           = useState('')
  const [optB,     setOptB]           = useState('')
  const [optC,     setOptC]           = useState('')
  const [optD,     setOptD]           = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('A')
  const [difficulty,    setDifficulty]    = useState('easy')
  const [explanation,   setExplanation]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const isMultipleChoice = qType === 'MULTIPLE_CHOICE'
  const isTrueFalse      = qType === 'TRUE_FALSE'

  function reset() {
    setQType('MULTIPLE_CHOICE')
    setContent('')
    setOptA('')
    setOptB('')
    setOptC('')
    setOptD('')
    setCorrectAnswer('A')
    setDifficulty('easy')
    setExplanation('')
    setError('')
    if (collapsible) setExpanded(false)
  }

  async function handleSave() {
    if (!content.trim()) { setError('Nội dung câu hỏi không được để trống'); return }
    if (!correctAnswer.trim()) { setError('Đáp án đúng không được để trống'); return }
    if (isMultipleChoice && (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim())) {
      setError('Vui lòng điền đủ 4 lựa chọn A/B/C/D')
      return
    }

    setSaving(true)
    setError('')

    let options: { key: string; text: string }[] | undefined
    if (isMultipleChoice) {
      options = [
        { key: 'A', text: optA.trim() },
        { key: 'B', text: optB.trim() },
        { key: 'C', text: optC.trim() },
        { key: 'D', text: optD.trim() },
      ]
    } else if (isTrueFalse) {
      options = [
        { key: 'A', text: 'Đúng' },
        { key: 'B', text: 'Sai'  },
      ]
    }

    try {
      const res = await fetch('/api/admin/questions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          subjectId,
          questionType:  qType,
          content:       content.trim(),
          options:       options ?? null,
          correctAnswer: correctAnswer.trim(),
          explanation:   explanation.trim() || null,
          points:        DIFFICULTY_MAP[difficulty] ?? 1,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Lỗi không xác định')
      onSaved()
      reset()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }

  // ── Collapsed trigger ─────────────────────────────────────────────────────

  if (collapsible && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 font-semibold hover:border-green-400 hover:text-green-600 transition-colors group"
      >
        <PlusCircle size={16} className="text-gray-400 group-hover:text-green-500 transition" />
        Thêm câu hỏi mới
      </button>
    )
  }

  // ── Expanded form ─────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border-2 border-green-200 shadow-md p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
          <PlusCircle size={16} className="text-green-500" />
          Thêm câu hỏi mới
        </h3>
        <button
          onClick={() => { reset(); onCancel?.() }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>

      {/* Row 1: type + difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Loại câu hỏi *</label>
          <select
            value={qType}
            onChange={e => {
              const v = e.target.value
              setQType(v)
              setCorrectAnswer(v === 'MULTIPLE_CHOICE' || v === 'TRUE_FALSE' ? 'A' : '')
            }}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
          >
            {ADD_Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Độ khó</label>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
          >
            {DIFFICULTY_LABELS.map(d => (
              <option key={d.value} value={d.value}>{d.label} ({d.points}đ)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Nội dung câu hỏi *</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          placeholder="Nhập nội dung câu hỏi..."
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
        />
      </div>

      {/* Multiple choice options */}
      {isMultipleChoice && (
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-2">Lựa chọn A/B/C/D *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              { key: 'A', val: optA, set: setOptA },
              { key: 'B', val: optB, set: setOptB },
              { key: 'C', val: optC, set: setOptC },
              { key: 'D', val: optD, set: setOptD },
            ] as const).map(({ key, val, set }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-600 flex-shrink-0">
                  {key}
                </span>
                <input
                  type="text"
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder={`Lựa chọn ${key}...`}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correct answer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Đáp án đúng *</label>
          {isMultipleChoice ? (
            <select
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
            >
              {['A', 'B', 'C', 'D'].map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          ) : isTrueFalse ? (
            <select
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
            >
              <option value="A">Đúng</option>
              <option value="B">Sai</option>
            </select>
          ) : (
            <input
              type="text"
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              placeholder="Nhập đáp án đúng..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          )}
        </div>

        {/* Explanation */}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Giải thích (tuỳ chọn)</label>
          <input
            type="text"
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder="Lời giải / gợi ý..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm flex items-start gap-2">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={() => { reset(); onCancel?.() }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition min-h-[40px]"
        >
          Huỷ
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition disabled:opacity-60 min-h-[40px] flex items-center justify-center gap-2"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />}
          {saving ? 'Đang lưu...' : 'Thêm câu hỏi'}
        </button>
      </div>
    </div>
  )
}
