'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orgId: string
  isActive: boolean
}

export default function SuspendOrgButton({ orgId, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction() {
    const action = isActive ? 'suspend' : 'activate'
    const confirmMsg = isActive
      ? 'Xác nhận tạm ngưng tổ chức này? Người dùng sẽ không thể đăng nhập.'
      : 'Kích hoạt lại tổ chức này?'

    if (!confirm(confirmMsg)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/platform/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Có lỗi xảy ra')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
        isActive
          ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
      }`}
    >
      {loading ? '...' : isActive ? '🔒 Tạm ngưng' : '▶️ Kích hoạt'}
    </button>
  )
}
