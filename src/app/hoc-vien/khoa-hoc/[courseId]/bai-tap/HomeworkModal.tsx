'use client'

import { useState } from 'react'
import { X, Send, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  subjectId: string
  subjectName: string
  materialId?: string
  onClose: () => void
  onSuccess: () => void
}

export default function HomeworkModal({
  subjectId,
  subjectName,
  materialId,
  onClose,
  onSuccess,
}: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bài làm.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/student/homework/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, materialId, content }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
        return
      }

      setDone(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-lg">📝 Nộp bài tập</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{subjectName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle className="w-14 h-14 text-green-500" />
              <p className="font-black text-gray-900 text-lg">Nộp bài thành công!</p>
              <p className="text-sm text-gray-500">Giáo viên sẽ chấm và phản hồi sớm nhất có thể.</p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Câu trả lời / Bài làm của bạn
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-2xl p-4 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-cherry-400 focus:border-transparent transition placeholder:text-gray-400"
                rows={8}
                placeholder="Viết câu trả lời, giải thích hoặc dán nội dung bài làm của bạn vào đây..."
                value={content}
                onChange={e => {
                  setContent(e.target.value)
                  if (error) setError('')
                }}
                disabled={loading}
              />

              {error && (
                <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
              )}

              <p className="mt-2 text-xs text-gray-400">
                {content.length} ký tự • Bạn có thể nộp lại bài trước khi giáo viên chấm.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="flex gap-3 p-5 pt-0">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="flex-1 py-3 rounded-2xl bg-cherry-600 text-white text-sm font-black hover:bg-cherry-700 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Đang nộp...</>
              ) : (
                <><Send size={16} /> Nộp bài</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
