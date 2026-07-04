import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MissionClaimButton from './MissionClaimButton'

export const metadata = { title: 'Thành tích — AvaB Học viên' }

// ── Level Helpers ────────────────────────────────────────────────────────────
function computeLevel(xp: number) {
  const level = Math.floor(xp / 500) + 1
  const currentLevelXP = (level - 1) * 500
  const nextLevelXP = level * 500
  const xpProgress = xp - currentLevelXP
  const xpRequired = nextLevelXP - currentLevelXP
  return { level, xpProgress, xpRequired, nextLevelXP }
}

// ── Badge color map ──────────────────────────────────────────────────────────
const BADGE_COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  blue:   { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  green:  { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  yellow: { bg: '#fefce8', border: '#fde68a', text: '#a16207' },
  gold:   { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  amber:  { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  orange: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
  purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
  violet: { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  indigo: { bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3' },
  teal:   { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
  cyan:   { bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490' },
  red:    { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' },
}

function getColorStyle(color: string) {
  return BADGE_COLOR_MAP[color] ?? BADGE_COLOR_MAP.blue
}

export default async function GamificationPage() {
  const session = await auth()
  if (!session) redirect('/dang-nhap')

  const userId = (session.user as { id: string }).id

  // ── Data fetch ──────────────────────────────────────────────────────────
  const [rawStats, userBadges, userMissions, allBadges] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    }),
    prisma.userMission.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.badge.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
  ])

  // If no stats, use defaults
  const stats = rawStats ?? {
    xp: 0, coin: 0, level: 1, streak: 0,
    totalAnswers: 0, correctAnswers: 0, lessonsViewed: 0,
  }

  const { level, xpProgress, xpRequired } = computeLevel(stats.xp)

  // Rank by xp
  const usersAbove = await prisma.userStats.count({ where: { xp: { gt: stats.xp } } })
  const rank = usersAbove + 1

  // ── Leaderboard: top 5 by XP ─────────────────────────────────────────
  const topStats = await prisma.userStats.findMany({
    orderBy: { xp: 'desc' },
    take: 5,
    include: { user: { select: { name: true, avatar: true } } },
  })

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId))

  // Mission tab groups
  const missionsByType = {
    daily:       userMissions.filter((um) => um.mission.type === 'daily'),
    weekly:      userMissions.filter((um) => um.mission.type === 'weekly'),
    achievement: userMissions.filter((um) => um.mission.type === 'achievement'),
  }

  const xpPct = Math.round((xpProgress / xpRequired) * 100)

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 space-y-6">

        {/* ── Hero Card ─────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-6 text-white relative overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #1d4ed8 100%)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative">
            {/* Level badge + XP */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black shadow-inner">
                {level}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-0.5 rounded-full">
                    Level {level}
                  </span>
                  <span className="text-white/70 text-xs">Xếp hạng #{rank}</span>
                </div>
                <p className="text-white/80 text-sm">{stats.xp.toLocaleString('vi-VN')} XP tổng cộng</p>
              </div>
            </div>

            {/* XP Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>{xpProgress.toLocaleString()} XP</span>
                <span>{xpRequired.toLocaleString()} XP → Level {level + 1}</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${xpPct}%`,
                    background: 'linear-gradient(90deg, #fde68a, #f59e0b)',
                  }}
                />
              </div>
            </div>

            {/* Coin + Streak */}
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-4 py-2">
                <span>💰</span>
                <span className="font-black text-sm">{stats.coin.toLocaleString('vi-VN')} xu</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-4 py-2">
                <span>🔥</span>
                <span className="font-black text-sm">Streak {stats.streak} ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '📝', label: 'Tổng câu đúng',  value: stats.correctAnswers.toLocaleString('vi-VN'), sub: `/ ${stats.totalAnswers}` },
            { icon: '📚', label: 'Bài học đã xem',  value: stats.lessonsViewed.toLocaleString('vi-VN'),  sub: 'bài học' },
            { icon: '🔥', label: 'Streak hiện tại', value: `${stats.streak}`,                            sub: 'ngày liên tiếp' },
            { icon: '🏅', label: 'Số huy hiệu',     value: `${userBadges.length}`,                       sub: `/ ${allBadges.length}` },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl mb-1">{card.icon}</div>
              <div className="text-2xl font-black text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5 font-semibold">{card.label}</div>
              <div className="text-[10px] text-gray-300">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Badges Section ────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🏅</span>
            <h2 className="text-xl font-black text-gray-900">Huy hiệu</h2>
            <span className="ml-auto text-sm text-gray-400 font-semibold">
              {userBadges.length} / {allBadges.length} đạt được
            </span>
          </div>

          {/* Earned badges */}
          {userBadges.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Chưa đạt huy hiệu nào. Hãy bắt đầu học! 💪</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-5">
              {userBadges.map((ub) => {
                const cs = getColorStyle(ub.badge.color)
                return (
                  <div
                    key={ub.id}
                    className="flex flex-col items-center text-center p-3 rounded-2xl border-2 transition hover:scale-105"
                    style={{ backgroundColor: cs.bg, borderColor: cs.border }}
                  >
                    <span className="text-3xl mb-1">{ub.badge.icon}</span>
                    <p className="text-xs font-black leading-tight" style={{ color: cs.text }}>{ub.badge.name}</p>
                    <p className="text-[10px] mt-1 text-gray-400">
                      Đã nhận {new Date(ub.earnedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: '2-digit' })}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Locked badges */}
          {allBadges.filter((b) => !earnedBadgeIds.has(b.id)).length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-400 mb-3">🔒 Chưa đạt được</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {allBadges
                  .filter((b) => !earnedBadgeIds.has(b.id))
                  .map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col items-center text-center p-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 opacity-50"
                    >
                      <span className="text-3xl mb-1" style={{ filter: 'grayscale(100%)' }}>{b.icon}</span>
                      <p className="text-xs font-semibold text-gray-400 leading-tight">{b.name}</p>
                      <span className="text-gray-300 text-sm mt-1">🔒</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* ── Missions Section ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🎯</span>
            <h2 className="text-xl font-black text-gray-900">Nhiệm vụ hôm nay</h2>
          </div>

          {/* Mission groups */}
          {(['daily', 'weekly', 'achievement'] as const).map((type) => {
            const missions = missionsByType[type]
            if (missions.length === 0) return null
            const labels = { daily: '📅 Hàng ngày', weekly: '📊 Hàng tuần', achievement: '🏅 Thành tựu' }

            return (
              <div key={type} className="mb-6 last:mb-0">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{labels[type]}</p>
                <div className="space-y-0.5">
                  {missions.map((um) => {
                    const pct = Math.min(100, Math.round((um.progress / um.mission.target) * 100))
                    const canClaim = um.completed && !um.claimedAt

                    return (
                      <div
                        key={um.id}
                        className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-2xl shrink-0">{um.mission.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 leading-tight">{um.mission.name}</p>
                          {um.mission.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{um.mission.description}</p>
                          )}
                          {/* Progress bar */}
                          <div className="mt-1.5 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: um.completed
                                  ? 'linear-gradient(90deg, #34d399, #10b981)'
                                  : 'linear-gradient(90deg, #a78bfa, #6366f1)',
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {um.progress}/{um.mission.target} · +{um.mission.xpReward} XP · +{um.mission.coinReward} xu
                          </p>
                        </div>

                        {/* Claim / status */}
                        {canClaim ? (
                          <MissionClaimButton missionId={um.missionId} missionName={um.mission.name} />
                        ) : um.claimedAt ? (
                          <span className="shrink-0 text-xs text-green-600 font-bold">✅ Đã nhận</span>
                        ) : (
                          <span className="shrink-0 text-xs text-gray-400 font-semibold">{pct}%</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {userMissions.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">
              Chưa có nhiệm vụ nào. Hãy học và hoàn thành nhiệm vụ! 🎮
            </p>
          )}
        </div>

        {/* ── Leaderboard Mini ──────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🏆</span>
            <h2 className="text-xl font-black text-gray-900">Bảng xếp hạng</h2>
            <span className="ml-auto text-sm text-gray-400 font-semibold">Top 5 · Toàn hệ thống</span>
          </div>

          {topStats.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Chưa có dữ liệu xếp hạng</p>
          ) : (
            <div className="space-y-2">
              {topStats.map((ts, idx) => {
                const isMe = ts.userId === userId
                const { level: lv } = computeLevel(ts.xp)
                const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`
                const name = ts.user?.name ?? 'Học viên'

                return (
                  <div
                    key={ts.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                      isMe
                        ? 'bg-violet-50 border-2 border-violet-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center text-lg font-black">{rankEmoji}</div>

                    {/* Avatar */}
                    {ts.user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ts.user.avatar} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isMe ? 'text-violet-700' : 'text-gray-800'}`}>
                        {name} {isMe && <span className="text-xs font-semibold text-violet-500">(bạn)</span>}
                      </p>
                      <p className="text-[10px] text-gray-400">Level {lv}</p>
                    </div>

                    {/* XP */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-violet-600">{ts.xp.toLocaleString('vi-VN')}</p>
                      <p className="text-[10px] text-gray-400">XP</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
