'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  /** Pass true if lastLoginAt is already today (server-computed) */
  checkedInToday: boolean
  currentStreak: number
}

export default function DailyCheckinButton({ checkedInToday, currentStreak }: Props) {
  const router = useRouter()
  const [done, setDone]     = useState(checkedInToday)
  const [loading, setLoading] = useState(false)
  const [toast, setToast]   = useState<string | null>(null)

  async function handleCheckin() {
    if (done || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/gamification/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: 'login', value: 1 }),
      })
      const data = await res.json() as {
        success?: boolean
        xpEarned?: number
        missionsCompleted?: number
        badgesEarned?: Array<{ name: string; icon: string }>
      }

      if (data.success) {
        setDone(true)
        const badges = data.badgesEarned ?? []
        const badgeText = badges.length > 0 ? ` · 🏅 ${badges.map((b) => b.name).join(', ')}` : ''
        setToast(`🎉 Điểm danh thành công! +${data.xpEarned ?? 10} XP${badgeText}`)
        setTimeout(() => {
          setToast(null)
          router.refresh()
        }, 2800)
      } else {
        setToast('❌ Không thể điểm danh. Thử lại sau.')
        setTimeout(() => setToast(null), 2500)
      }
    } catch {
      setToast('❌ Lỗi mạng. Thử lại sau.')
      setTimeout(() => setToast(null), 2500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-black text-sm px-6 py-3 rounded-full shadow-2xl pointer-events-none animate-bounce">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Streak badge with fire animation */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <span
              className="text-xl"
              style={{ animation: 'flicker 1.2s ease-in-out infinite alternate' }}
            >
              🔥
            </span>
            <span className="text-sm font-black text-orange-600">
              {currentStreak} ngày
            </span>
          </div>
        )}

        <button
          onClick={handleCheckin}
          disabled={done || loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
            done
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90 active:scale-95 shadow-lg shadow-violet-200'
          }`}
        >
          {loading ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : done ? (
            <>✅ Đã điểm danh</>
          ) : (
            <>📅 Điểm danh hôm nay (+10 XP)</>
          )}
        </button>
      </div>

      {/* Flicker keyframe — inject once */}
      <style jsx global>{`
        @keyframes flicker {
          0%   { transform: scale(1) rotate(-3deg); }
          100% { transform: scale(1.15) rotate(3deg); }
        }
      `}</style>
    </>
  )
}
