'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  currentStatus: string
}

export default function LeaveActions({ id, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)

  if (currentStatus !== 'pending') return null

  async function handle(status: 'approved' | 'rejected') {
    setLoading(status)
    try {
      await fetch('/api/admin/hrm/leave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle('approved')}
        disabled={loading !== null}
        className="flex items-center gap-1 bg-green-100 text-green-700 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-50"
      >
        {loading === 'approved' ? '⏳' : '✅'} Duyệt
      </button>
      <button
        onClick={() => handle('rejected')}
        disabled={loading !== null}
        className="flex items-center gap-1 bg-red-100 text-red-700 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        {loading === 'rejected' ? '⏳' : '❌'} Từ chối
      </button>
    </div>
  )
}
