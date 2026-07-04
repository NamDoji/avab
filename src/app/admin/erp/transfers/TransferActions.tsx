'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  transferId: string
  currentStatus: string
}

export default function TransferActions({ transferId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (currentStatus !== 'pending') {
    if (currentStatus === 'approved') {
      return (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: '#dcfce7', color: '#166534' }}
        >
          ✅ Đã duyệt
        </span>
      )
    }
    if (currentStatus === 'rejected') {
      return (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: '#fee2e2', color: '#dc2626' }}
        >
          ❌ Từ chối
        </span>
      )
    }
    return (
      <span className="text-xs text-gray-400">{currentStatus}</span>
    )
  }

  async function handleAction(status: 'approved' | 'rejected') {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/erp/transfers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transferId, status }),
      })
      if (!res.ok) throw new Error('Lỗi cập nhật')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction('approved')}
        disabled={loading}
        className="text-xs font-bold px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
        style={{ background: '#dcfce7', color: '#166534' }}
      >
        ✅ Duyệt
      </button>
      <button
        onClick={() => handleAction('rejected')}
        disabled={loading}
        className="text-xs font-bold px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
        style={{ background: '#fee2e2', color: '#dc2626' }}
      >
        ❌ Từ chối
      </button>
    </div>
  )
}
