'use client'

import { useState } from 'react'
import { Edit3, X, RefreshCw, AlertCircle } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Question {
  id:            string
  order:         number
  questionType:  string
  content:       string
  correctAnswer: string
  options:       unknown
  explanation:   string | null
  points:        number
  imageUrl:      string | null
  createdAt:     string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const Q_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  MULTIPLE_CHOICE: { label: 'Trắc nghiệm',    color: 'bg-blue-100 text-blue-700'     },
  OPEN:            { label: 'Tự luận',          color: 'bg-purple-100 text-purple-700'  },
  TRUE_FALSE:      { label: 'Đúng/Sai',         color: 'bg-green-100 text-green-700'    },
  MATCHING:        { label: 'Nối đáp',           color: 'bg-orange-100 text-orange-700'  },
  FILL_BLANK:      { label: 'Điền khuyết',       color: 'bg-teal-100 text-teal-700'      },
  NUMBER_INPUT:    { label: 'Số học',            color: 'bg-red-100 text-red-700'        },
  SHORT_ANSWER:    { label: 'Trả lời ngắn',      color: 'bg-indigo-100 text-indigo-700'  },
  SORT_WORDS:      { label: 'Sắp xếp từ',        color: 'bg-pink-100 text-pink-700'      },
  GROUP_CLASSIFY:  { label: 'Phân loại',          color: 'bg-yellow-100 text-yellow-700'  },
  MULTI_BLANK:     { label: 'Nhiều chỗ trống',   color: 'bg-cyan-100 text-cyan-700'      },
}

const DIFFICULTY_LABELS = [
  { value: 'easy',   label: '🟢 Dễ',       points: 1 },
  { value: 'medium', label: '🟡 Trung bình', points: 2 },
  { value: 'hard',   label: '🔴 Khó',       points: 4 },
]

function pointsToDifficulty(points: number): string {
  if (points <= 1) return 'easy'
  if (points <= 3) return 'medium'
  return 'hard'
}

const DIFFICULTY_POINTS: Record<string, number> = {
  easy:   1,
  medium: 2,
  hard:   4,
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface EditQuestionModalProps {
  question: Question
  onClose:  () => void
  onSaved:  () => void
}

export default function EditQuestionModal({ question, onClose, onSaved }: EditQuestionModalProps) {
  // Parse options
  const rawOptions = Array.isArray(question.options)
    ? (question.options as { key: string; text: string }[])
    : []

  const [content,       setContent]       = useState(question.content)
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer)
  const [explanation,   setExplanation]   = useState(question.explanation ?? '')
  const [difficulty,    setDifficulty]    = useState(pointsToDifficulty(question.points))
  const [options,       setOptions]       = useState<{ key: string; text: string }[]>(
    rawOptions.length > 0
      ? rawOptions
      : [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ]
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const isMultipleChoice = question.questionType === 'MULTIPLE_CHOICE'
  const isTrueFalse      = question.questionType === 'TRUE_FALSE'

  function updateOption(key: string, text: string) {
    setOptions(prev => prev.map(o => o.key === key ? { ...o, text } : o))
  }

  async function handleSave() {
    if (!content.trim() || !correctAnswer.trim()) {
      setError('Nội dung và đáp án không được để trống')
      return
    }
    if (isMultipleChoice && options.some(o => !o.text.trim())) {
      setError('Vui lòng điền đủ 4 lựa chọn A/B/C/D')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/questions/${question.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          content:       content.trim(),
          correctAnswer: correctAnswer.trim(),
          explanation:   explanation.trim() || null,
          points:        DIFFICULTY_POINTS[difficulty] ?? 1,
          options:       isMultipleChoice
            ? options.map(o => ({ key: o.key, text: o.text.trim() }))
            : isTrueFalse
              ? [{ key: 'A', text: 'Đúng' }, { key: 'B', text: 'Sai' }]
              : null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Lỗi không xác định')
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-gray-900 flex items-center gap-2 text-sm">
            <Edit3 size={16} className="text-blue-500" />
            Chỉnh sửa câu hỏi
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type badge (read-only) + difficulty */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${Q_TYPE_BADGE[question.questionType]?.color ?? 'bg-gray-100 text-gray-700'}`}>
              {Q_TYPE_BADGE[question.questionType]?.label ?? question.questionType}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs font-semibold text-gray-500">Độ khó:</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold"
              >
                {DIFFICULTY_LABELS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
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

          {/* Multiple choice options */}
          {isMultipleChoice && (
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">Lựa chọn A/B/C/D *</label>
              <div className="space-y-2">
                {options.map(opt => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-600 flex-shrink-0">
                      {opt.key}
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => updateOption(opt.key, e.target.value)}
                      placeholder={`Lựa chọn ${opt.key}...`}
                      className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        opt.key === correctAnswer
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct answer */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Đáp án đúng *</label>
            {isMultipleChoice ? (
              <select
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              >
                {['A', 'B', 'C', 'D'].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            ) : isTrueFalse ? (
              <select
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
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
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            )}
          </div>

          {/* Explanation */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Giải thích (tuỳ chọn)</label>
            <textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              rows={2}
              placeholder="Lời giải / gợi ý cho học viên..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
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
