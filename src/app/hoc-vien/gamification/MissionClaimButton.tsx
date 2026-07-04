'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  missionId: string
  missionName: string
}

export default function MissionClaimButton({ missionId, missionName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  async function handleClaim() {
    setLoading(true)
    try {
      const res = await fetch('/api/gamification/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      })
      const data = await res.json()
      if (data.success) {
        setToast(`🎉 Nhận thưởng "${missionName}" · +${data.xpGained ?? 0} XP · +${data.coinGained ?? 0} xu!`)
        setTimeout(() => {
          setToast(null)
          router.refresh()
        }, 2500)
      } else {
        setToast('❌ Không thể nhận thưởng. Vui lòng thử lại.')
        setTimeout(() => setToast(null), 2500)
      }
    } catch {
      setToast('❌ Lỗi mạng. Vui lòng thử lại.')
      setTimeout(() => setToast(null), 2500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-sm px-6 py-3 rounded-full shadow-xl pointer-events-none">
          {toast}
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={loading}
        className="shrink-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition disabled:opacity-60"
      >
        {loading ? '...' : '🎁 Nhận thưởng'}
      </button>
    </>
  )
}
