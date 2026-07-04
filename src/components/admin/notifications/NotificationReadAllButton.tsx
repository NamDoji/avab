'use client'

import { useState } from 'react'

export default function NotificationReadAllButton() {
  const [done, setDone] = useState(false)

  return (
    <button
      onClick={() => setDone(true)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition"
      style={{
        background: done ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      {done ? '✅ Đã đánh dấu tất cả' : '✓ Đánh dấu tất cả đã đọc'}
    </button>
  )
}
