'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Context label per page section
function useContextLabel(pathname: string): { label: string; icon: string; color: string } {
  if (pathname.includes('/ai-studio/course-generator')) return { label: 'Course Generator', icon: '🚀', color: 'from-emerald-500 to-teal-600' }
  if (pathname.includes('/ai-studio'))    return { label: 'AI Studio',         icon: '✨', color: 'from-violet-500 to-purple-600' }
  if (pathname.includes('/roles') || pathname.includes('/permissions') || pathname.includes('/audit'))
                                          return { label: 'RBAC',              icon: '🛡️', color: 'from-indigo-500 to-blue-600' }
  if (pathname.includes('/courses'))      return { label: 'Courses',           icon: '📚', color: 'from-purple-500 to-indigo-600' }
  if (pathname.includes('/analytics'))   return { label: 'Analytics',         icon: '📊', color: 'from-orange-500 to-amber-600' }
  if (pathname.includes('/finance'))     return { label: 'Finance',           icon: '💰', color: 'from-green-500 to-emerald-600' }
  if (pathname.includes('/users'))       return { label: 'Users',             icon: '👥', color: 'from-teal-500 to-cyan-600' }
  return                                          { label: 'Admin',            icon: '🧭', color: 'from-violet-500 to-purple-600' }
}

// Quick commands per page section
function useQuickCommands(pathname: string): { label: string; text: string }[] {
  if (pathname.includes('/ai-studio/course-generator')) {
    return [
      { label: '📖 Gen lý thuyết',   text: 'Generate lý thuyết bài giảng' },
      { label: '📝 Gen bài tập',     text: 'Tạo bài tập về nhà 30 câu' },
      { label: '📊 Gen quiz',        text: 'Tạo đề kiểm tra' },
      { label: '🎬 Gen video',       text: 'Tạo kịch bản video bài giảng' },
      { label: '🚀 Full pipeline',   text: 'Generate tất cả nội dung' },
    ]
  }
  if (pathname.includes('/ai-studio')) {
    return [
      { label: '🆕 Tạo project',     text: 'Cách tạo project AI mới?' },
      { label: '📋 Course Generator',text: 'Course Generator hoạt động thế nào?' },
    ]
  }
  if (pathname.includes('/roles')) {
    return [
      { label: '🛡️ Tạo role',       text: 'Cách tạo role mới?' },
      { label: '🔑 Gán permission',  text: 'Cách gán permission cho role?' },
      { label: '👤 Gán user',        text: 'Cách gán user vào role?' },
    ]
  }
  return [
    { label: '🗺️ Tính năng',       text: 'Giới thiệu các tính năng chính của AvaB' },
    { label: '🤖 AI Studio',        text: 'Hướng dẫn sử dụng AI Studio' },
    { label: '📊 Analytics',        text: 'Xem Analytics ở đâu?' },
  ]
}

export function GlobalAIChat() {
  const pathname                   = usePathname()
  const ctx                        = useContextLabel(pathname)
  const quickCommands              = useQuickCommands(pathname)
  const [open,     setOpen]        = useState(false)
  const [messages, setMessages]    = useState<Message[]>([])
  const [input,    setInput]       = useState('')
  const [loading,  setLoading]     = useState(false)
  const [unread,   setUnread]      = useState(0)
  const bottomRef                  = useRef<HTMLDivElement>(null)
  const inputRef                   = useRef<HTMLInputElement>(null)

  // Reset conversation when navigating to a new section
  const prevPathRef = useRef(pathname)
  useEffect(() => {
    const prevSection = prevPathRef.current.split('/')[2] ?? ''
    const newSection  = pathname.split('/')[2] ?? ''
    if (prevSection !== newSection) {
      setMessages([])
    }
    prevPathRef.current = pathname
  }, [pathname])

  // Welcome message when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Xin chào! Tôi đang hỗ trợ bạn trong **${ctx.label}**.\n\nBạn cần giúp gì?`,
      }])
    }
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res  = await fetch('/api/admin/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, pathname, history }),
      })
      const data = await res.json() as { reply?: string }
      const reply = data.reply ?? '⚠️ Không có phản hồi.'

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])

      if (!open) setUnread(n => n + 1)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Lỗi kết nối. Thử lại nhé.' }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, pathname, open])

  // Don't render on non-admin pages
  if (!pathname.startsWith('/admin')) return null

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br ${ctx.color} text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center text-2xl`}
        title={`AI Assistant — ${ctx.label}`}
      >
        {open ? '✕' : '🤖'}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[560px] flex flex-col rounded-3xl shadow-2xl border border-white/20 overflow-hidden bg-white">

          {/* header */}
          <div className={`bg-gradient-to-r ${ctx.color} px-4 py-3 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg flex-shrink-0">
              {ctx.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-none">AI Assistant</p>
              <p className="text-white/70 text-xs mt-0.5 truncate">{ctx.label}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors text-lg flex-shrink-0">✕</button>
          </div>

          {/* quick commands */}
          {quickCommands.length > 0 && (
            <div className="px-3 pt-2.5 pb-2.5 flex flex-wrap gap-1.5 border-b border-gray-100">
              {quickCommands.map(cmd => (
                <button
                  key={cmd.text}
                  onClick={() => send(cmd.text)}
                  disabled={loading}
                  className="text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors disabled:opacity-40 font-medium"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          )}

          {/* messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? `bg-gradient-to-br ${ctx.color} text-white rounded-br-sm`
                    : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin" />
                    Đang suy nghĩ...
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Nhập câu hỏi hoặc lệnh..."
                disabled={loading}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors disabled:opacity-60 placeholder:text-gray-400"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ctx.color} text-white flex items-center justify-center transition-opacity disabled:opacity-40 flex-shrink-0 text-base font-bold hover:opacity-90`}
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
