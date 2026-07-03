'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star, Flame, Coins, Medal, Target, Lock } from 'lucide-react'

interface Badge {
  id: string
  key: string
  name: string
  icon: string
  color: string
  xpReward: number
  coinReward: number
  description: string | null
  isActive: boolean
}

interface UserBadge {
  id: string
  badgeId: string
  earnedAt: string
  badge: Badge
}

interface Mission {
  id: string
  key: string
  name: string
  icon: string
  type: string
  target: number
  metric: string
  xpReward: number
  coinReward: number
}

interface UserMission {
  id: string
  missionId: string
  progress: number
  completed: boolean
  claimedAt: string | null
  mission: Mission
}

interface GamificationStats {
  xp: number
  coin: number
  level: number
  currentLevelXP: number
  nextLevelXP: number
  xpProgress: number
  xpRequired: number
  streak: number
  totalAnswers: number
  correctAnswers: number
  lessonsViewed: number
  rank: number
  badges: UserBadge[]
  missions: UserMission[]
}

// Color map for badge colors → Tailwind classes
const BADGE_COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-100 border-blue-200 text-blue-600',
  green:  'bg-green-100 border-green-200 text-green-600',
  yellow: 'bg-yellow-100 border-yellow-200 text-yellow-600',
  orange: 'bg-orange-100 border-orange-200 text-orange-600',
  gold:   'bg-amber-100 border-amber-200 text-amber-600',
  purple: 'bg-purple-100 border-purple-200 text-purple-600',
  teal:   'bg-teal-100 border-teal-200 text-teal-600',
  indigo: 'bg-indigo-100 border-indigo-200 text-indigo-600',
  violet: 'bg-violet-100 border-violet-200 text-violet-600',
  cyan:   'bg-cyan-100 border-cyan-200 text-cyan-600',
  amber:  'bg-amber-100 border-amber-200 text-amber-600',
  red:    'bg-red-100 border-red-200 text-red-600',
}

function BadgeCard({ userBadge }: { userBadge: UserBadge }) {
  const colorClass = BADGE_COLOR_MAP[userBadge.badge.color] ?? BADGE_COLOR_MAP.blue
  return (
    <div className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 ${colorClass} transition hover:scale-105`}>
      <span className="text-3xl mb-1">{userBadge.badge.icon}</span>
      <p className="text-xs font-black leading-tight">{userBadge.badge.name}</p>
      <p className="text-[10px] mt-1 opacity-70">
        {new Date(userBadge.earnedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: '2-digit' })}
      </p>
    </div>
  )
}

function LockedBadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className="flex flex-col items-center text-center p-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 opacity-50 relative">
      <span className="text-3xl mb-1 grayscale">{badge.icon}</span>
      <p className="text-xs font-semibold text-gray-400 leading-tight">{badge.name}</p>
      <Lock className="w-3 h-3 text-gray-300 mt-1" />
    </div>
  )
}

function MissionRow({
  userMission,
  onClaim,
}: {
  userMission: UserMission
  onClaim: (missionId: string) => void
}) {
  const pct = Math.min(100, Math.round((userMission.progress / userMission.mission.target) * 100))
  const canClaim = userMission.completed && !userMission.claimedAt

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-2xl shrink-0">{userMission.mission.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 leading-tight">{userMission.mission.name}</p>
        <div className="mt-1.5 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${userMission.completed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-purple-400 to-indigo-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {userMission.progress}/{userMission.mission.target} · +{userMission.mission.xpReward} XP · +{userMission.mission.coinReward} xu
        </p>
      </div>
      {canClaim ? (
        <button
          onClick={() => onClaim(userMission.missionId)}
          className="shrink-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition"
        >
          Nhận thưởng!
        </button>
      ) : userMission.claimedAt ? (
        <span className="shrink-0 text-xs text-green-600 font-bold">✅ Đã nhận</span>
      ) : (
        <span className="shrink-0 text-xs text-gray-400">{pct}%</span>
      )}
    </div>
  )
}

export default function GamificationPage() {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [missionTab, setMissionTab] = useState<'daily' | 'weekly' | 'achievement'>('daily')
  const [claimMsg, setClaimMsg] = useState<string | null>(null)

  async function loadData() {
    const [statsRes, badgesRes] = await Promise.all([
      fetch('/api/gamification/stats').then((r) => r.json()),
      fetch('/api/gamification/badges').then((r) => r.json()).catch(() => ({ data: [] })),
    ])
    if (statsRes.success) setStats(statsRes.data)
    if (badgesRes.data) setAllBadges(badgesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleClaim(missionId: string) {
    const res = await fetch('/api/gamification/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId }),
    }).then((r) => r.json())

    if (res.success) {
      setClaimMsg(`🎉 Nhận +${res.xpGained} XP · +${res.coinGained} xu!`)
      setTimeout(() => setClaimMsg(null), 3000)
      loadData()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  if (!stats) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-24 text-gray-400">
          <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
        </div>
      </main>
    )
  }

  const earnedBadgeIds = new Set(stats.badges.map((ub) => ub.badgeId))
  const filteredMissions = stats.missions.filter((um) => um.mission.type === missionTab)

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 pt-20 pb-16">
      {/* Toast */}
      {claimMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-sm px-6 py-3 rounded-full shadow-xl animate-bounce">
          {claimMsg}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <h1 className="text-3xl font-black text-gray-900">🏆 Thành tích của tôi</h1>
          <p className="text-gray-500 text-sm mt-1">Xếp hạng #{stats.rank} toàn hệ thống</p>
        </div>

        {/* Row 1 — XP & Level Hero Card */}
        <div
          className="rounded-3xl p-6 text-white mb-6 relative overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
                {stats.level}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">
                    Level {stats.level}
                  </span>
                  <Star className="w-4 h-4 text-yellow-300" />
                </div>
                <p className="text-white/80 text-sm mt-0.5">
                  {stats.xp.toLocaleString()} XP tổng cộng
                </p>
              </div>
            </div>

            {/* XP Progress bar */}
            <div className="mb-1.5">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>{stats.xpProgress} XP</span>
                <span>{stats.xpRequired} XP để lên Level {stats.level + 1}</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full transition-all"
                  style={{ width: `${Math.round((stats.xpProgress / stats.xpRequired) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
                <Coins className="w-4 h-4 text-yellow-300" />
                <span className="font-black text-sm">{stats.coin.toLocaleString()} xu</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="font-black text-sm">Streak {stats.streak} ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 — Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: '📝', label: 'Tổng câu đúng',  value: stats.correctAnswers.toLocaleString(), sub: `/ ${stats.totalAnswers} câu` },
            { icon: '📚', label: 'Bài học đã xem',  value: stats.lessonsViewed.toLocaleString(),  sub: 'bài học' },
            { icon: '🔥', label: 'Streak hiện tại', value: `${stats.streak}`,                     sub: 'ngày liên tiếp' },
            { icon: '🏅', label: 'Số huy hiệu',     value: `${stats.badges.length}`,              sub: 'huy hiệu đạt được' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{card.icon}</div>
              <div className="text-2xl font-black text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{card.label}</div>
              <div className="text-[10px] text-gray-300">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Row 3 — Badges */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-black text-gray-900">🏅 Huy hiệu đã đạt</h2>
            <span className="ml-auto text-sm text-gray-400">{stats.badges.length} / {allBadges.length > 0 ? allBadges.length : '?'}</span>
          </div>

          {stats.badges.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">Chưa đạt huy hiệu nào. Hãy bắt đầu học! 💪</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {stats.badges.map((ub) => (
                <BadgeCard key={ub.id} userBadge={ub} />
              ))}
            </div>
          )}

          {/* Locked badges */}
          {allBadges.length > 0 && (
            <>
              <p className="text-sm font-bold text-gray-600 mb-2 mt-2">Chưa đạt được:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {allBadges
                  .filter((b) => !earnedBadgeIds.has(b.id))
                  .map((b) => (
                    <LockedBadgeCard key={b.id} badge={b} />
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Row 4 — Missions */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-black text-gray-900">🎯 Nhiệm vụ</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {(['daily', 'weekly', 'achievement'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMissionTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-black transition ${
                  missionTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {tab === 'daily' ? '📅 Hàng ngày' : tab === 'weekly' ? '📊 Hàng tuần' : '🏅 Thành tựu'}
              </button>
            ))}
          </div>

          {filteredMissions.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              Chưa có nhiệm vụ nào. Hãy học và hoàn thành nhiệm vụ! 🎮
            </p>
          ) : (
            <div>
              {filteredMissions.map((um) => (
                <MissionRow key={um.id} userMission={um} onClaim={handleClaim} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
