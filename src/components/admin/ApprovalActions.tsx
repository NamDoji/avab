'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApprovalActionsProps {
  instanceId: string
}

export default function ApprovalActions({ instanceId }: ApprovalActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      const res = await fetch(`/api/admin/workflow/instances/${instanceId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setDone(action === 'approve' ? 'approved' : 'rejected')
        router.refresh()
      } else {
        alert(data.error ?? 'Có lỗi xảy ra')
      }
    } catch {
      alert('Không thể thực hiện thao tác')
    } finally {
      setLoading(null)
    }
  }

  if (done === 'approved') {
    return (
      <span style={{
        fontSize: '12px', fontWeight: 700, color: '#059669',
        background: '#d1fae5', borderRadius: '8px', padding: '6px 10px',
      }}>
        ✅ Đã phê duyệt
      </span>
    )
  }

  if (done === 'rejected') {
    return (
      <span style={{
        fontSize: '12px', fontWeight: 700, color: '#dc2626',
        background: '#fee2e2', borderRadius: '8px', padding: '6px 10px',
      }}>
        ❌ Đã từ chối
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <button
        onClick={() => handleAction('approve')}
        disabled={loading !== null}
        style={{
          background: '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: loading !== null ? 'not-allowed' : 'pointer',
          opacity: loading === 'approve' ? 0.7 : 1,
          transition: 'opacity 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {loading === 'approve' ? '...' : '✅ Phê duyệt'}
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading !== null}
        style={{
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: loading !== null ? 'not-allowed' : 'pointer',
          opacity: loading === 'reject' ? 0.7 : 1,
          transition: 'opacity 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {loading === 'reject' ? '...' : '❌ Từ chối'}
      </button>
    </div>
  )
}
