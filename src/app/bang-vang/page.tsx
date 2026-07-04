'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Trophy, Star } from 'lucide-react'
import { useSession } from 'next-auth/react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar: string | null
  xp: number
  level: number
  badge: { icon: string; name: string; color: string } | null
  isReal: boolean
}

type Period = 'all' | 'week' | 'month'

// ── Level badge colors ─────────────────────────────────────────────────────────

function levelBadgeStyle(level: number): React.CSSProperties {
  if (level >= 20) return { background: '#fbbf24', color: '#92400e' }
  if (level >= 10) return { background: '#7c3aed', color: '#fff' }
  if (level >= 5)  return { background: '#2563eb', color: '#fff' }
  return { background: '#e0e7ff', color: '#4338ca' }
}

function levelEmoji(level: number): string {
  if (level >= 20) return '👑'
  if (level >= 10) return '⭐'
  if (level >= 5)  return '🔥'
  return '🌱'
}

// ── XP bar ─────────────────────────────────────────────────────────────────────

function XpBar({ xp, level }: { xp: number; level: number }) {
  const currentLevelXP = (level - 1) * 500
  const nextLevelXP    = level * 500
  const progress  = Math.max(0, xp - currentLevelXP)
  const required  = nextLevelXP - currentLevelXP
  const pct       = Math.min(100, Math.round((progress / required) * 100))
  return (
    <div className="w-24">
      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-purple-200 mt-0.5 text-right font-semibold">
        {xp.toLocaleString()} XP
      </p>
    </div>
  )
}

// ── Medal icons ────────────────────────────────────────────────────────────────

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: 22 }}>🥇</span>
  if (rank === 2) return <span style={{ fontSize: 22 }}>🥈</span>
  if (rank === 3) return <span style={{ fontSize: 22 }}>🥉</span>
  return (
    <span style={{
      fontSize: 13, fontWeight: 900, color: '#9ca3af',
      width: 28, textAlign: 'center', display: 'inline-block',
    }}>
      #{rank}
    </span>
  )
}

// ── Avatar circle ──────────────────────────────────────────────────────────────

function Avatar({
  name, avatar, size = 40, gold = false,
}: {
  name: string; avatar: string | null; size?: number; gold?: boolean
}) {
  return avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatar} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        border: gold ? '3px solid #fbbf24' : '2px solid rgba(255,255,255,0.3)',
        flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: gold
        ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
        : 'linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))',
      border: gold ? '3px solid #fbbf24' : '2px solid rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: size * 0.38,
      color: gold ? '#92400e' : '#fff',
    }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

// ── Inner component (uses useSearchParams) ─────────────────────────────────────

function LeaderboardInner() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const { data: session } = useSession()

  const paramPeriod   = searchParams.get('period') as Period | null
  const period: Period = ['week','month','all'].includes(paramPeriod ?? '') ? paramPeriod! : 'all'

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading]         = useState(true)
  const [ownEntry, setOwnEntry]       = useState<LeaderboardEntry | null>(null)

  const currentUserId = (session?.user as { id?: string })?.id ?? null

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?period=${period}`)
      .then(r => r.json())
      .then((data: { success: boolean; data: LeaderboardEntry[] }) => {
        if (data.success) {
          setLeaderboard(data.data)
          // Find own position
          if (currentUserId) {
            const own = data.data.find(e => e.userId === currentUserId) ?? null
            setOwnEntry(own)
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period, currentUserId])

  function setPeriod(p: Period) {
    router.push(`/bang-vang?period=${p}`, { scroll: false })
  }

  const top3 = leaderboard.slice(0, 3)
  const rest  = leaderboard.slice(3)

  const TABS: { key: Period; label: string }[] = [
    { key: 'week',  label: '📅 Tuần này' },
    { key: 'month', label: '📆 Tháng này' },
    { key: 'all',   label: '🏆 Tất cả' },
  ]

  // Podium order: 2nd · 1st · 3rd
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3

  return (
    <main className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: 'linear-gradient(160deg,#4c1d95 0%,#7c3aed 45%,#2563eb 100%)' }}
    >
      <div className="max-w-3xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Trophy className="w-14 h-14 text-yellow-400 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">🏆 Bảng Vàng</h1>
          <p className="text-purple-200 text-sm">
            Top học sinh xuất sắc · Cập nhật theo XP · Level badges
          </p>
        </div>

        {/* ── Period Tabs ─────────────────────────────────────────── */}
        <div className="flex justify-center gap-2 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className="px-5 py-2.5 rounded-full text-sm font-black transition"
              style={{
                background: period === tab.key
                  ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                  : 'rgba(255,255,255,0.15)',
                color: period === tab.key ? '#92400e' : '#fff',
                boxShadow: period === tab.key ? '0 4px 12px rgba(251,191,36,0.4)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Own position banner ─────────────────────────────────── */}
        {ownEntry && currentUserId && (
          <div
            className="mb-6 rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1.5px solid rgba(251,191,36,0.5)' }}
          >
            <span style={{ fontSize: 22 }}>📍</span>
            <div className="flex-1">
              <p className="text-yellow-300 font-black text-sm">Vị trí của bạn</p>
              <p className="text-white font-bold text-xs mt-0.5">
                Hạng #{ownEntry.rank} · Lv.{ownEntry.level} · {ownEntry.xp.toLocaleString()} XP
              </p>
            </div>
            <Avatar name={ownEntry.name} avatar={ownEntry.avatar} size={36} />
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-purple-300 border-t-yellow-400 rounded-full animate-spin" style={{ borderWidth: 3 }} />
          </div>
        )}

        {/* ── Podium Top 3 ────────────────────────────────────────── */}
        {!loading && top3.length >= 3 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-3 sm:gap-5">
              {podiumOrder.map((entry, podIdx) => {
                const isChampion = entry.rank === 1
                const heights   = ['h-20','h-28','h-14']    // podium heights 2nd/1st/3rd
                const avatarSz  = [68, 84, 60]
                const podiumBg  = [
                  'linear-gradient(135deg,#9ca3af,#6b7280)',
                  'linear-gradient(135deg,#fbbf24,#f59e0b)',
                  'linear-gradient(135deg,#d97706,#b45309)',
                ]

                return (
                  <div key={entry.userId} className="flex flex-col items-center" style={{ flex: isChampion ? '0 0 auto' : '0 0 auto', width: isChampion ? 120 : 96 }}>
                    {/* Crown for #1 */}
                    {isChampion && (
                      <span style={{ fontSize: 24, marginBottom: 4 }}>👑</span>
                    )}
                    <Avatar
                      name={entry.name}
                      avatar={entry.avatar}
                      size={avatarSz[podIdx]}
                      gold={isChampion}
                    />
                    <p className="text-white font-black text-xs mt-1.5 text-center truncate w-full px-1">
                      {entry.name.split(' ').slice(-1)[0]}
                    </p>
                    {entry.badge && <span className="text-base mt-0.5">{entry.badge.icon}</span>}
                    <div style={{
                      fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 20, marginTop: 4,
                      ...levelBadgeStyle(entry.level),
                    }}>
                      {levelEmoji(entry.level)} Lv.{entry.level}
                    </div>
                    <p style={{ color: isChampion ? '#fde68a' : '#d1d5db', fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                      {entry.xp.toLocaleString()} XP
                    </p>
                    {/* Podium block */}
                    <div
                      className={`w-full rounded-t-xl mt-2 flex items-center justify-center font-black text-white text-xl ${heights[podIdx]}`}
                      style={{ background: podiumBg[podIdx] }}
                    >
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Full list (rank 4+) ──────────────────────────────────── */}
        {!loading && leaderboard.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.95)' }}
          >
            {/* Top entries header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-black text-gray-700">Bảng xếp hạng đầy đủ</span>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {leaderboard.length} học sinh
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {/* Show top3 first (compact) then rest */}
              {leaderboard.map(entry => {
                const isOwn = entry.userId === currentUserId
                return (
                  <div
                    key={entry.userId}
                    className="flex items-center gap-3 px-4 py-3 transition-colors"
                    style={{
                      background: isOwn
                        ? 'linear-gradient(90deg,#fef3c7,#fffbeb)'
                        : entry.rank <= 3
                          ? '#f5f3ff'
                          : undefined,
                      opacity: entry.isReal ? 1 : 0.65,
                    }}
                  >
                    {/* Rank */}
                    <div className="w-8 flex justify-center shrink-0">
                      <RankDisplay rank={entry.rank} />
                    </div>

                    {/* Avatar */}
                    <div className="shrink-0">
                      <Avatar name={entry.name} avatar={entry.avatar} size={38} gold={entry.rank === 1} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-black text-gray-900 text-sm truncate">
                          {entry.name}
                          {isOwn && <span className="ml-1 text-[10px] text-amber-600 font-bold">(bạn)</span>}
                        </p>
                        {entry.badge && <span className="text-sm shrink-0">{entry.badge.icon}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
                          ...levelBadgeStyle(entry.level),
                        }}>
                          {levelEmoji(entry.level)} Lv.{entry.level}
                        </span>
                        {!entry.isReal && (
                          <span className="text-[10px] text-gray-400 italic">ẩn danh</span>
                        )}
                      </div>
                    </div>

                    {/* XP bar */}
                    <div className="shrink-0"
                      style={{ '--xp-purple': '#7c3aed' } as React.CSSProperties}
                    >
                      <div className="w-20">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.round(((entry.xp - (entry.level - 1) * 500) / 500) * 100))}%`,
                              background: 'linear-gradient(90deg,#7c3aed,#2563eb)',
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 text-right font-semibold">
                          {entry.xp.toLocaleString()} XP
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-16 text-purple-300">
            <Trophy className="w-14 h-14 mx-auto mb-4 opacity-50" />
            <p className="font-bold">Chưa có dữ liệu bảng xếp hạng</p>
          </div>
        )}

        {/* Note */}
        <p className="text-center text-purple-300 text-xs mt-5">
          * Học sinh ẩn danh được thêm để tạo không khí cạnh tranh lành mạnh
        </p>
      </div>
    </main>
  )
}

// ── Exported page (Suspense boundary for useSearchParams) ─────────────────────

export default function BangVangPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#4c1d95 0%,#7c3aed 45%,#2563eb 100%)' }}
      >
        <div className="text-center text-white">
          <Trophy className="w-14 h-14 mx-auto mb-4 text-yellow-400 animate-pulse" />
          <p className="font-bold text-lg">Đang tải bảng vàng...</p>
        </div>
      </main>
    }>
      <LeaderboardInner />
    </Suspense>
  )
}
