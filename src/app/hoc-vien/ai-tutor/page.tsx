'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Send, Bot, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  { label: '💡 Giải thích cho tôi', text: 'Giải thích cho tôi bài học gần nhất' },
  { label: '🤔 Tôi không hiểu', text: 'Tôi không hiểu phần này, bạn giải thích theo cách khác được không?' },
  { label: '📝 Cho ví dụ', text: 'Cho tôi một ví dụ minh hoạ cụ thể hơn' },
  { label: '📋 Tóm tắt', text: 'Tóm tắt những điểm quan trọng nhất tôi cần nhớ' },
  { label: '🎯 Cho tôi làm quiz', text: 'Cho tôi làm 1 câu hỏi ôn tập ngay bây giờ' },
]

function formatContent(text: string): string {
  // Basic markdown: **bold**, `code`, newlines → <br>
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/\n/g, '<br />')
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Xin chào! Tôi là gia sư AI của bạn tại AvaB! 🎓\n\nTôi biết bạn đang học những môn gì và có thể giúp bạn:\n• **Giải thích** các bài học khó\n• **Cho ví dụ** minh hoạ cụ thể\n• **Ra quiz** ôn tập\n• **Tóm tắt** nội dung chương\n\nBạn muốn ôn bài gì hôm nay? 😊',
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)

    try {
      const res = await fetch('/api/student/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json() as { reply?: string; error?: string }
      const reply = data.reply ?? data.error ?? 'Xin lỗi, có lỗi xảy ra.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Không thể kết nối AI. Vui lòng thử lại.' },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, input, loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50 pt-16 pb-0 flex flex-col">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/hoc-vien"
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 text-sm leading-none">Gia sư AI</h1>
              <p className="text-xs text-green-500 font-semibold mt-0.5">● Đang hoạt động</p>
            </div>
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  role: 'assistant',
                  content: 'Cuộc trò chuyện mới bắt đầu! 🚀 Bạn muốn học gì hôm nay?',
                },
              ])
            }
            className="text-xs text-gray-400 hover:text-red-500 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition"
          >
            Xoá chat
          </button>
        </div>
      </div>

      {/* ── Message list ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                }`}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Quick prompts ────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp.label}
                onClick={() => void send(qp.text)}
                disabled={loading}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition disabled:opacity-40"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Input ────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 pb-safe pb-4">
          <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi gia sư AI bất cứ điều gì…"
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
            />
            <button
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
