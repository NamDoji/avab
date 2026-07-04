import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Trophy, Medal, Target, Users, Zap, Coins } from 'lucide-react'

export const metadata = { title: 'Gamification — AvaB Admin' }

async function getGamificationData() {
  const [
    totalXPResult,
    badgesEarned,
    missionsCompleted,
    badges,
    missions,
    topUsers,
    totalBadges,
    totalMissions,
  ] = await Promise.all([
    // Total XP distributed
    prisma.xPLog.aggregate({ _sum: { amount: true } }),
    // Total badges earned
    prisma.userBadge.count(),
    // Total missions completed
    prisma.userMission.count({ where: { completed: true } }),
    // All badges with earned count
    prisma.badge.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { userBadges: true } },
      },
    }),
    // All missions with progress stats
    prisma.mission.findMany({
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { userMissions: true } },
        userMissions: {
          select: { progress: true, completed: true },
        },
      },
    }),
    // Top 10 users by XP
    prisma.userStats.findMany({
      orderBy: { xp: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    }),
    // Count all badges
    prisma.badge.count(),
    // Count all missions
    prisma.mission.count(),
  ])

  return {
    totalXP: totalXPResult._sum.amount ?? 0,
    badgesEarned,
    missionsCompleted,
    badges,
    missions,
    topUsers,
    totalBadges,
    totalMissions,
  }
}

function MissionTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    daily:       { label: 'Hàng ngày',  classes: 'bg-blue-100 text-blue-700' },
    weekly:      { label: 'Hàng tuần',  classes: 'bg-purple-100 text-purple-700' },
    achievement: { label: 'Thành tựu',  classes: 'bg-amber-100 text-amber-700' },
  }
  const cfg = config[type] ?? { label: type, classes: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.classes}`}>{cfg.label}</span>
  )
}

function computeLevel(xp: number): number {
  return Math.floor(xp / 500) + 1
}

export default async function AdminGamificationPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
    redirect('/dang-nhap')
  }

  const {
    totalXP,
    badgesEarned,
    missionsCompleted,
    badges,
    missions,
    topUsers,
    totalBadges,
    totalMissions,
  } = await getGamificationData()

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-10 text-white"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-amber-100 text-sm font-semibold mb-1">🎮 Admin</p>
          <h1 className="text-4xl font-black mb-1">Gamification</h1>
          <p className="text-amber-100 text-sm">XP · Badge · Mission · Leaderboard</p>
          <Link href="/admin" className="mt-4 inline-flex items-center gap-1 text-xs text-amber-200 hover:text-white transition">
            ← Về Dashboard
          </Link>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">

        {/* Section 1 — Overview Stats */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">📊 Tổng quan</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: <Zap className="w-5 h-5 text-yellow-500" />,   label: 'Tổng XP phát ra',   value: totalXP.toLocaleString(),          sub: 'XP' },
              { icon: <Medal className="w-5 h-5 text-amber-500" />,  label: 'Badges đã trao',    value: badgesEarned.toLocaleString(),     sub: 'lần trao' },
              { icon: <Target className="w-5 h-5 text-purple-500" />,label: 'Missions hoàn thành',value: missionsCompleted.toLocaleString(), sub: 'missions' },
              { icon: <Trophy className="w-5 h-5 text-indigo-500" />,label: 'Loại badge',         value: totalBadges.toString(),            sub: 'loại' },
              { icon: <Users className="w-5 h-5 text-teal-500" />,   label: 'Loại mission',       value: totalMissions.toString(),          sub: 'loại' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">{card.icon}<span className="text-xs text-gray-500 font-semibold">{card.label}</span></div>
                <div className="text-3xl font-black text-gray-900">{card.value}</div>
                <div className="text-xs text-gray-400">{card.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 — Badge Management */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🏅 Quản lý Huy hiệu ({badges.length})</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Huy hiệu</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Mô tả</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Đã trao</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">XP</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Xu</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {badges.map((badge) => (
                    <tr key={badge.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{badge.icon}</span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{badge.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{badge.key}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px]">
                        {badge.description ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-black text-purple-600">{badge._count.userBadges}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-yellow-600">+{badge.xpReward}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-amber-600">+{badge.coinReward}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {badge.isActive ? 'Hoạt động' : 'Tắt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3 — Mission Management */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🎯 Quản lý Nhiệm vụ ({missions.length})</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Nhiệm vụ</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Loại</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Metric</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Mục tiêu</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tham gia</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Hoàn thành</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tỉ lệ</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {missions.map((mission) => {
                    const total = mission._count.userMissions
                    const completed = mission.userMissions.filter((um) => um.completed).length
                    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
                    const avgProgress = total > 0
                      ? Math.round(mission.userMissions.reduce((s, um) => s + um.progress, 0) / total)
                      : 0

                    return (
                      <tr key={mission.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{mission.icon}</span>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{mission.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{mission.key}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <MissionTypeBadge type={mission.type} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{mission.metric}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-700">{mission.target}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-700">{total}</td>
                        <td className="px-4 py-3 text-right font-black text-green-600">{completed}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: `${rate}%` }} />
                            </div>
                            <span className="text-xs font-bold text-green-600">{rate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-yellow-600">+{mission.xpReward}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4 — Top 10 Users by XP */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">👑 Top 10 học viên theo XP</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {topUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có dữ liệu XP.</p>
                  <p className="text-xs mt-1">Hãy seed dữ liệu gamification và chờ học viên tương tác.</p>
                </div>
              ) : topUsers.map((stat, idx) => {
                const level = computeLevel(stat.xp)
                const currentLevelXP = (level - 1) * 500
                const nextLevelXP = level * 500
                const pct = Math.min(100, Math.round(((stat.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100))

                return (
                  <div key={stat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {idx === 0 ? <span className="text-xl">👑</span>
                       : idx === 1 ? <span className="text-xl">🥈</span>
                       : idx === 2 ? <span className="text-xl">🥉</span>
                       : <span className="text-sm font-black text-gray-400">#{idx + 1}</span>}
                    </div>
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-black text-base shrink-0">
                      {stat.user.name?.[0] ?? '?'}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm">{stat.user.name ?? 'Học viên'}</p>
                      <p className="text-xs text-gray-400">{stat.user.phone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">Lv.{level}</span>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Zap className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="font-black text-yellow-600 text-sm">{stat.xp.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">XP</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-black text-amber-600 text-sm">{stat.coin.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Xu</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-gray-700 text-sm">{stat.streak}</span>
                        <p className="text-[10px] text-gray-400">Streak</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">⚡ Thao tác nhanh</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/bang-vang" target="_blank"
              className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-4 hover:scale-[1.01] transition-transform shadow-sm">
              <div className="text-2xl mb-1.5">🏆</div>
              <h3 className="font-black text-sm">Xem Bảng Vàng</h3>
              <p className="text-white/70 text-xs mt-0.5">Leaderboard học viên</p>
            </Link>
            <Link href="/hoc-vien/gamification" target="_blank"
              className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-4 hover:scale-[1.01] transition-transform shadow-sm">
              <div className="text-2xl mb-1.5">🎮</div>
              <h3 className="font-black text-sm">Preview học viên</h3>
              <p className="text-white/70 text-xs mt-0.5">Trang Thành tích</p>
            </Link>
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center opacity-60">
              <div className="text-2xl mb-1.5">⚙️</div>
              <h3 className="font-black text-sm text-gray-500">Cấu hình (sắp ra)</h3>
              <p className="text-gray-400 text-xs mt-0.5">Chỉnh XP reward</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
