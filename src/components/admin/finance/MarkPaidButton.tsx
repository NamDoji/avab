'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MarkPaidButtonProps {
  paymentId: string
  isPaid: boolean
}

export default function MarkPaidButton({ paymentId, isPaid }: MarkPaidButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(isPaid)
  const router = useRouter()

  const handleMark = async () => {
    if (done || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/finance/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: true }),
      })
      if (res.ok) {
        setDone(true)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        ✅ Đã thu
      </span>
    )
  }

  return (
    <button
      onClick={handleMark}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
    >
      {loading ? (
        <>
          <span
            className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full inline-block"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
          Đang lưu...
        </>
      ) : (
        <>💰 Đánh dấu đã thu</>
      )}
    </button>
  )
}
