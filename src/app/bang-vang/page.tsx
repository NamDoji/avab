'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal, Star, Crown } from 'lucide-react'

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

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-7 h-7 text-yellow-500" />
  if (rank === 2) return <Medal className="w-7 h-7 text-gray-400" />
  if (rank === 3) return <Medal className="w-7 h-7 text-amber-600" />
  return <span className="text-lg font-black text-gray-400 w-7 text-center">#{rank}</span>
}

function XpBar({ xp, level }: { xp: number; level: number }) {
  const currentLevelXP = (level - 1) * 500
  const nextLevelXP = level * 500
  const progress = xp - currentLevelXP
  const required = nextLevelXP - currentLevelXP
  const pct = Math.min(100, Math.round((progress / required) * 100))
  return (
    <div className="w-20">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5 text-right">{xp.toLocaleString()} XP</p>
    </div>
  )
}

export default function BangVangPage() {
  const [period, setPeriod] = useState<Period>('all')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setLeaderboard(data.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Trophy className="w-14 h-14 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Bảng Vàng</h1>
          <p className="text-purple-200 text-sm">Top 15 học sinh xuất sắc nhất — cập nhật theo XP</p>
        </div>

        {/* Period Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {([
            { key: 'week',  label: '📅 Tuần này' },
            { key: 'month', label: '📆 Tháng này' },
            { key: 'all',   label: '🏆 Tất cả' },
          ] as { key: Period; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-black transition ${
                period === tab.key
                  ? 'bg-yellow-400 text-yellow-900 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-2 sm:gap-4 mb-10">
            {/* 2nd place */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 mx-auto mb-2 flex items-center justify-center text-xl sm:text-2xl font-black text-gray-600">
                {leaderboard[1]?.name?.[0] ?? '?'}
              </div>
              <p className="text-white font-bold text-xs sm:text-sm truncate max-w-[80px] mx-auto">{leaderboard[1]?.name}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-purple-200" />
                <p className="text-purple-200 text-xs">Lv.{leaderboard[1]?.level}</p>
              </div>
              <p className="text-gray-300 text-xs">{leaderboard[1]?.xp.toLocaleString()} XP</p>
              {leaderboard[1]?.badge && (
                <span className="text-sm">{leaderboard[1].badge.icon}</span>
              )}
              <div className="bg-gray-400 text-white text-xs font-black px-3 py-1 rounded-t-lg mt-2 h-14 sm:h-16 flex items-center justify-center">
                2
              </div>
            </div>
            {/* 1st place */}
            <div className="text-center">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-yellow-400 mx-auto mb-2 flex items-center justify-center text-2xl sm:text-3xl font-black text-yellow-900">
                {leaderboard[0]?.name?.[0] ?? '?'}
              </div>
              <p className="text-white font-black truncate max-w-[90px] mx-auto">{leaderboard[0]?.name}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-yellow-300" />
                <p className="text-yellow-300 text-xs font-bold">Lv.{leaderboard[0]?.level}</p>
              </div>
              <p className="text-yellow-300 text-sm font-black">{leaderboard[0]?.xp.toLocaleString()} XP</p>
              {leaderboard[0]?.badge && (
                <span className="text-base">{leaderboard[0].badge.icon}</span>
              )}
              <div className="bg-yellow-500 text-white text-xs font-black px-4 py-1 rounded-t-lg mt-2 h-20 sm:h-24 flex items-center justify-center">
                1
              </div>
            </div>
            {/* 3rd place */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-300 mx-auto mb-2 flex items-center justify-center text-xl sm:text-2xl font-black text-amber-800">
                {leaderboard[2]?.name?.[0] ?? '?'}
              </div>
              <p className="text-white font-bold text-xs sm:text-sm truncate max-w-[80px] mx-auto">{leaderboard[2]?.name}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-purple-200" />
                <p className="text-purple-200 text-xs">Lv.{leaderboard[2]?.level}</p>
              </div>
              <p className="text-gray-300 text-xs">{leaderboard[2]?.xp.toLocaleString()} XP</p>
              {leaderboard[2]?.badge && (
                <span className="text-sm">{leaderboard[2].badge.icon}</span>
              )}
              <div className="bg-amber-600 text-white text-xs font-black px-3 py-1 rounded-t-lg mt-2 h-10 flex items-center justify-center">
                3
              </div>
            </div>
          </div>
        )}

        {/* Full List */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
              <p>Đang tải...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có dữ liệu bảng xếp hạng</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 ${entry.rank <= 3 ? 'bg-purple-50' : ''} ${!entry.isReal ? 'opacity-60' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-9 flex justify-center shrink-0">
                    <RankIcon rank={entry.rank} />
                  </div>
                  {/* Avatar */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-black text-base flex-shrink-0">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      entry.name?.[0] ?? '?'
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-gray-800 truncate text-sm">{entry.name}</p>
                      {entry.badge && (
                        <span className="text-sm shrink-0">{entry.badge.icon}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">
                        Lv.{entry.level}
                      </span>

                    </div>
                  </div>
                  {/* XP */}
                  <div className="text-right shrink-0">
                    <XpBar xp={entry.xp} level={entry.level} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note about fake entries */}
        <p className="text-center text-purple-300 text-xs mt-4">
          * Bảng xếp hạng được bổ sung học sinh ẩn danh để tạo không khí cạnh tranh
        </p>
      </div>
    </main>
  )
}
