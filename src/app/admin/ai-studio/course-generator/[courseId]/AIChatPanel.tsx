'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  action?: { type: string; contentType?: string }
  status?: 'pending' | 'running' | 'done' | 'error'
  result?: string
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  lessons:         '📖 Lý thuyết',
  homework:        '📝 Bài tập về nhà',
  answers:         '✅ Đáp án',
  quiz:            '📊 Đề kiểm tra',
  'teacher-guide': '👩‍🏫 Hướng dẫn GV',
  'video-script':  '🎬 Kịch bản video',
}

const QUICK_COMMANDS = [
  { label: '📖 Gen lý thuyết',  text: 'Generate lý thuyết bài giảng' },
  { label: '📝 Gen bài tập',    text: 'Tạo bài tập về nhà 30 câu' },
  { label: '✅ Gen đáp án',     text: 'Generate đáp án chi tiết' },
  { label: '📊 Gen quiz',       text: 'Tạo đề kiểm tra 45 phút' },
  { label: '👩‍🏫 Gen GV guide', text: 'Tạo hướng dẫn giảng dạy' },
  { label: '🎬 Gen video',      text: 'Tạo kịch bản video bài giảng' },
  { label: '🚀 Full pipeline',  text: 'Generate tất cả nội dung' },
]

export default function AIChatPanel({ courseId }: { courseId: string }) {
  const router       = useRouter()
  const [open,       setOpen]       = useState(false)
  const [messages,   setMessages]   = useState<Message[]>([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const bottomRef    = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Xin chào! Tôi có thể giúp bạn generate nội dung cho khóa học này. Ví dụ:\n• "Generate lý thuyết cho toàn bộ chuyên đề"\n• "Tạo bài tập 30 câu"\n• "Sinh kịch bản video"\n• "Chạy full pipeline"',
      }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const executeGenerate = async (msgIdx: number, contentType: string) => {
    setMessages(prev => prev.map((m, i) =>
      i === msgIdx ? { ...m, status: 'running' } : m
    ))

    try {
      const endpoint = contentType === 'all'
        ? null
        : `/api/admin/ai-studio/course-generator/${courseId}/generate-content`

      if (contentType === 'all') {
        // Run all in sequence
        const types = ['lessons', 'homework', 'answers', 'quiz', 'teacher-guide', 'video-script']
        let total = 0
        for (const t of types) {
          const res  = await fetch(`/api/admin/ai-studio/course-generator/${courseId}/generate-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentType: t }),
          })
          const data = await res.json() as { generated?: number }
          total += data.generated ?? 0
        }
        setMessages(prev => prev.map((m, i) =>
          i === msgIdx ? { ...m, status: 'done', result: `✅ Pipeline hoàn tất — ${total} items đã generate` } : m
        ))
      } else if (contentType === 'lessons') {
        const res  = await fetch(`/api/admin/ai-studio/course-generator/${courseId}/generate-lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        const data = await res.json() as { generated?: number; total?: number }
        setMessages(prev => prev.map((m, i) =>
          i === msgIdx ? { ...m, status: 'done', result: `✅ Đã generate ${data.generated}/${data.total} chuyên đề` } : m
        ))
      } else {
        const res  = await fetch(endpoint!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType }),
        })
        const data = await res.json() as { generated?: number; skipped?: number; total?: number }
        const label = CONTENT_TYPE_LABELS[contentType] ?? contentType
        setMessages(prev => prev.map((m, i) =>
          i === msgIdx ? { ...m, status: 'done', result: `✅ ${label}: ${data.generated} mới · ${data.skipped ?? 0} đã có` } : m
        ))
      }

      router.refresh()
    } catch (err) {
      setMessages(prev => prev.map((m, i) =>
        i === msgIdx ? { ...m, status: 'error', result: `❌ Lỗi: ${String(err)}` } : m
      ))
    }
  }

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res  = await fetch(`/api/admin/ai-studio/course-generator/${courseId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      })
      const data = await res.json() as { reply: string; action: { type: string; contentType?: string } }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply,
        action: data.action?.type !== 'chat_only' ? data.action : undefined,
        status: data.action?.type !== 'chat_only' ? 'pending' : undefined,
      }

      setMessages(prev => {
        const next = [...prev, assistantMsg]
        // Auto-execute the action
        if (data.action?.type === 'generate' && data.action.contentType) {
          const idx = next.length - 1
          setTimeout(() => executeGenerate(idx, data.action.contentType!), 300)
        } else if (data.action?.type === 'generate_all') {
          const idx = next.length - 1
          setTimeout(() => executeGenerate(idx, 'all'), 300)
        }
        return next
      })
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Có lỗi xảy ra. Vui lòng thử lại.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-cherry-500 to-cherry-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center text-2xl"
        title="AI Chat"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[540px] flex flex-col rounded-3xl shadow-2xl border border-cherry-100 overflow-hidden bg-white">

          {/* header */}
          <div className="bg-gradient-to-r from-cherry-600 to-cherry-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="text-white font-black text-sm">AI Assistant</p>
                <p className="text-cherry-200 text-xs">Course Generator</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-lg transition-colors">✕</button>
          </div>

          {/* quick commands */}
          <div className="px-3 pt-3 flex flex-wrap gap-1.5 border-b border-gray-100 pb-3">
            {QUICK_COMMANDS.map(cmd => (
              <button
                key={cmd.text}
                onClick={() => send(cmd.text)}
                disabled={loading}
                className="text-xs bg-cherry-50 text-cherry-700 border border-cherry-200 rounded-lg px-2.5 py-1 hover:bg-cherry-100 transition-colors disabled:opacity-40 font-medium"
              >
                {cmd.label}
              </button>
            ))}
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-cherry-500 to-cherry-600 text-white rounded-br-sm'
                    : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-line">{m.content}</p>

                  {/* action status */}
                  {m.action && (
                    <div className="mt-2 pt-2 border-t border-white/20 text-xs">
                      {m.status === 'pending' && (
                        <span className="flex items-center gap-1.5 text-cherry-300">
                          <span className="inline-block w-3 h-3 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                          Đang chuẩn bị...
                        </span>
                      )}
                      {m.status === 'running' && (
                        <span className="flex items-center gap-1.5 text-yellow-300">
                          <span className="inline-block w-3 h-3 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                          Đang generate...
                        </span>
                      )}
                      {(m.status === 'done' || m.status === 'error') && m.result && (
                        <span className={m.status === 'done' ? 'text-green-300' : 'text-red-300'}>
                          {m.result}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-cherry-500 rounded-full animate-spin" />
                    Đang suy nghĩ...
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Nhập lệnh hoặc câu hỏi..."
                disabled={loading}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cherry-400 focus:bg-white transition-colors disabled:opacity-60"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-cherry-500 to-cherry-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0 text-base"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
