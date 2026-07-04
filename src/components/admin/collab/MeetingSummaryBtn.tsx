'use client'

import { useState } from 'react'

interface ActionItem {
  action: string
  assignee: string
  deadline: string
}

interface SummaryResult {
  summary: string
  actionItems: ActionItem[]
}

export default function MeetingSummaryBtn() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    if (!content.trim()) { setError('Nhập nội dung cuộc họp trước'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/collab/meeting-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Không thể tóm tắt cuộc họp')
      } else {
        setResult(json.data as SummaryResult)
      }
    } catch {
      setError('Lỗi kết nối với AI')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setContent('')
    setResult(null)
    setError('')
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-purple-600 text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
      >
        🤖 AI Biên bản họp
      </button>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 text-white"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
      >
        <div>
          <h3 className="font-black">🤖 AI Meeting Summary</h3>
          <p className="text-purple-200 text-xs mt-0.5">Dán nội dung họp → AI tóm tắt + action items</p>
        </div>
        <button
          onClick={() => { setOpen(false); handleReset() }}
          className="text-purple-200 hover:text-white text-xl font-bold transition"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Input */}
        {!result && (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">
                📝 Nội dung cuộc họp
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dán nội dung cuộc họp, ghi chú, transcript... AI sẽ tóm tắt và trích xuất action items."
                rows={8}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-400 focus:outline-none text-sm resize-none font-mono text-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">{content.length} ký tự</p>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !content.trim()}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚙️</span> AI đang phân tích...
                </>
              ) : (
                <>🤖 Phân tích & Tóm tắt</>
              )}
            </button>
          </>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="bg-purple-50 rounded-2xl p-4">
              <h4 className="font-black text-purple-800 text-sm mb-2 flex items-center gap-1.5">
                📋 Tóm tắt cuộc họp
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
            </div>

            {/* Action items */}
            {result.actionItems.length > 0 && (
              <div>
                <h4 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                  ✅ Action Items ({result.actionItems.length})
                </h4>
                <div className="space-y-2">
                  {result.actionItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100"
                      style={{ background: '#f8fafc' }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                        style={{ background: '#7c3aed' }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800">{item.action}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {item.assignee && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              👤 {item.assignee}
                            </span>
                          )}
                          {item.deadline && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              📅 {item.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Redo */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
              >
                🔄 Phân tích cuộc họp khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
