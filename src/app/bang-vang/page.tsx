'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal, Star } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar: string | null
  totalScore: number
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-500" />
  if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />
  if (rank === 3) return <Medal className="w-8 h-8 text-amber-600" />
  return <span className="text-xl font-bold text-gray-400 w-8 text-center">#{rank}</span>
}

export default function BangVangPage() {
  const { lang } = useLang()
  const vi = lang === 'vi'
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        if (data.success) setLeaderboard(data.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {vi ? 'Bảng Vàng' : 'Leaderboard'}
          </h1>
          <p className="text-purple-200">
            {vi ? 'Top 15 học sinh xuất sắc nhất — cập nhật mỗi ngày' : 'Top 15 outstanding students — updated daily'}
          </p>
        </div>

        {/* Top 3 Podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-2 sm:gap-4 mb-10">
            {/* 2nd place */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 mx-auto mb-2 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-600">
                {leaderboard[1]?.name?.[0] ?? '?'}
              </div>
              <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[80px] mx-auto">{leaderboard[1]?.name}</p>
              <p className="text-purple-200 text-xs">{leaderboard[1]?.totalScore} {vi ? 'điểm' : 'pts'}</p>
              <div className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-t-lg mt-2 h-14 sm:h-16 flex items-center justify-center">
                2
              </div>
            </div>
            {/* 1st place */}
            <div className="text-center">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-yellow-400 mx-auto mb-2 flex items-center justify-center text-2xl sm:text-3xl font-bold text-yellow-900">
                {leaderboard[0]?.name?.[0] ?? '?'}
              </div>
              <p className="text-white font-bold truncate max-w-[90px] mx-auto">{leaderboard[0]?.name}</p>
              <p className="text-yellow-300 text-sm font-semibold">{leaderboard[0]?.totalScore} {vi ? 'điểm' : 'pts'}</p>
              <div className="bg-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-t-lg mt-2 h-20 sm:h-24 flex items-center justify-center">
                1
              </div>
            </div>
            {/* 3rd place */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-300 mx-auto mb-2 flex items-center justify-center text-xl sm:text-2xl font-bold text-amber-800">
                {leaderboard[2]?.name?.[0] ?? '?'}
              </div>
              <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[80px] mx-auto">{leaderboard[2]?.name}</p>
              <p className="text-purple-200 text-xs">{leaderboard[2]?.totalScore} {vi ? 'điểm' : 'pts'}</p>
              <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-t-lg mt-2 h-10 flex items-center justify-center">
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
              <p>{vi ? 'Đang tải...' : 'Loading...'}</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{vi ? 'Chưa có dữ liệu bảng xếp hạng' : 'No leaderboard data yet'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-4 sm:px-6 py-4 ${entry.rank <= 3 ? 'bg-purple-50' : ''}`}
                >
                  <div className="w-10 flex justify-center shrink-0">
                    <RankIcon rank={entry.rank} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg flex-shrink-0">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      entry.name?.[0] ?? '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{entry.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">{entry.totalScore}</p>
                    <p className="text-xs text-gray-400">{vi ? 'điểm' : 'pts'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
