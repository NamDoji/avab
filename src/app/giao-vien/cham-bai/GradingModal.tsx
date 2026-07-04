'use client'

import { useState } from 'react'
import { X, CheckCircle, Loader2 } from 'lucide-react'

interface Submission {
  id: string
  studentName: string
  subjectName: string
  content: string
  submittedAt: string
}

interface Props {
  submission: Submission
  onClose: () => void
  onSuccess: () => void
}

export default function GradingModal({ submission, onClose, onSuccess }: Props) {
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Parse content — may be JSON { text, answers }
  let displayContent = submission.content
  try {
    const parsed = JSON.parse(submission.content) as { text?: string; answers?: string[] }
    if (parsed.text) {
      displayContent = parsed.text
      if (parsed.answers?.length) {
        displayContent += '\n\nCâu trả lời:\n' + parsed.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')
      }
    }
  } catch {
    // plain text — fine
  }

  async function handleGrade() {
    const scoreNum = parseFloat(score)
    if (score && (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10)) {
      setError('Điểm phải từ 0 đến 10.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/homework/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submission.id,
          score: score ? scoreNum : undefined,
          feedback: feedback.trim() || undefined,
          status: 'graded',
        }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) {
        setError(data.error ?? 'Có lỗi xảy ra.')
        return
      }
      setDone(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1200)
    } catch {
      setError('Lỗi kết nối. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-lg">📋 Chấm bài</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {submission.studentName} — {submission.subjectName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <CheckCircle className="w-14 h-14 text-green-500" />
            <p className="font-black text-gray-900 text-lg">Chấm bài thành công!</p>
          </div>
        ) : (
          <>
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Submission info */}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>
                  Nộp lúc:{' '}
                  {new Date(submission.submittedAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Content */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Nội dung bài làm
                </p>
                <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-800 whitespace-pre-wrap border border-gray-100 max-h-60 overflow-y-auto">
                  {displayContent}
                </div>
              </div>

              {/* Score */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Điểm <span className="text-gray-400 font-normal">(0–10, để trống nếu chưa chấm điểm)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={score}
                  onChange={e => { setScore(e.target.value); if (error) setError('') }}
                  placeholder="VD: 8.5"
                  className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nhận xét / Phản hồi
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Nhập nhận xét chi tiết cho học sinh..."
                  className="w-full border border-gray-200 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleGrade}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-teal-600 text-white text-sm font-black hover:bg-teal-700 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Đang lưu...</>
                ) : (
                  '✅ Hoàn tất chấm bài'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
