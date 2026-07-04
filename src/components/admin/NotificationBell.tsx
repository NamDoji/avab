'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

interface NotificationItem {
  type: 'enrollment' | 'contact' | 'payment'
  message: string
  time: string
  link: string
}

interface Props {
  /** Server-rendered initial count to avoid layout shift */
  initialCount: number
  /** Server-rendered initial recent items */
  initialRecent?: NotificationItem[]
}

const TYPE_ICON: Record<string, string> = {
  enrollment: '📋',
  contact:    '💬',
  payment:    '💰',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'Vừa xong'
  if (mins  < 60) return `${mins} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

export default function NotificationBell({ initialCount, initialRecent = [] }: Props) {
  const [count,  setCount]  = useState(initialCount)
  const [recent, setRecent] = useState<NotificationItem[]>(initialRecent)
  const [open,   setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchCount = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/notifications/count', { cache: 'no-store' })
      const data = await res.json() as { count?: number; recent?: NotificationItem[] }
      if (typeof data.count === 'number') setCount(data.count)
      if (Array.isArray(data.recent))     setRecent(data.recent)
    } catch { /* silent */ }
  }, [])

  // Refresh on open + every 2 min when mounted
  useEffect(() => {
    if (open) fetchCount()
  }, [open, fetchCount])

  useEffect(() => {
    const id = setInterval(fetchCount, 120_000)
    return () => clearInterval(id)
  }, [fetchCount])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        aria-label="Thông báo"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown overlay */}
      {open && (
        <div className="fixed top-[60px] right-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9997]" style={{ width: 'min(320px, calc(100vw - 16px))', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-black text-gray-800 text-sm">🔔 Thông báo</span>
            {count > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {count} mới
              </span>
            )}
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {recent.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Không có thông báo mới</p>
            ) : (
              recent.map((item, i) => (
                <Link
                  key={i}
                  href={item.link}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg mt-0.5">{TYPE_ICON[item.type] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-semibold leading-snug line-clamp-2">
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{relativeTime(item.time)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5">
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
            >
              Xem tất cả →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
