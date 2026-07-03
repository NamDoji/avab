import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BADGES = [
  { key: 'first-login',   name: 'Chào mừng!',               icon: '👋', color: 'blue',   xpReward: 50,   coinReward: 10,  description: 'Đăng nhập lần đầu tiên' },
  { key: 'first-correct', name: 'Câu trả lời đầu tiên',     icon: '✅', color: 'green',  xpReward: 30,   coinReward: 5,   description: 'Trả lời đúng câu hỏi đầu tiên' },
  { key: 'perfect-quiz',  name: 'Hoàn hảo!',                icon: '💯', color: 'yellow', xpReward: 200,  coinReward: 50,  description: 'Đạt 100% trong một bài kiểm tra' },
  { key: 'streak-3',      name: 'Kiên trì 3 ngày',          icon: '🔥', color: 'orange', xpReward: 100,  coinReward: 20,  description: 'Học liên tiếp 3 ngày' },
  { key: 'streak-7',      name: 'Tuần học tốt!',            icon: '🌟', color: 'gold',   xpReward: 300,  coinReward: 100, description: 'Học liên tiếp 7 ngày' },
  { key: 'streak-30',     name: 'Tháng kiên trì',           icon: '🏆', color: 'purple', xpReward: 1000, coinReward: 500, description: 'Học liên tiếp 30 ngày' },
  { key: '10-correct',    name: 'Chăm chỉ',                 icon: '📚', color: 'teal',   xpReward: 150,  coinReward: 30,  description: 'Trả lời đúng 10 câu hỏi' },
  { key: '50-correct',    name: 'Học giỏi',                 icon: '🎯', color: 'indigo', xpReward: 500,  coinReward: 100, description: 'Trả lời đúng 50 câu hỏi' },
  { key: '100-correct',   name: 'Thần đồng',                icon: '🧠', color: 'violet', xpReward: 1500, coinReward: 300, description: 'Trả lời đúng 100 câu hỏi' },
  { key: 'speed-master',  name: 'Tốc độ ánh sáng',          icon: '⚡', color: 'cyan',   xpReward: 200,  coinReward: 50,  description: 'Trả lời 10 câu liên tiếp trong 5 phút' },
  { key: 'top-3-week',    name: 'Top 3 tuần này',           icon: '🥉', color: 'amber',  xpReward: 400,  coinReward: 150, description: 'Lọt top 3 Bảng vàng trong tuần' },
  { key: 'top-1-week',    name: 'Quán quân!',               icon: '👑', color: 'gold',   xpReward: 1000, coinReward: 500, description: 'Đứng số 1 Bảng vàng trong tuần' },
]

const MISSIONS = [
  // Daily
  { key: 'daily-login',     name: 'Điểm danh hàng ngày',        icon: '📅', type: 'daily',       metric: 'login',              target: 1,   xpReward: 20,   coinReward: 5   },
  { key: 'daily-5-ans',     name: 'Trả lời 5 câu hỏi',          icon: '✏️', type: 'daily',       metric: 'questions_answered', target: 5,   xpReward: 50,   coinReward: 10  },
  { key: 'daily-3-correct', name: 'Đúng 3 câu liên tiếp',       icon: '🎯', type: 'daily',       metric: 'correct_streak',     target: 3,   xpReward: 80,   coinReward: 15  },
  // Weekly
  { key: 'weekly-30-ans',   name: 'Trả lời 30 câu trong tuần',  icon: '📊', type: 'weekly',      metric: 'questions_answered', target: 30,  xpReward: 200,  coinReward: 50  },
  { key: 'weekly-perfect',  name: 'Đạt 1 bài 100% trong tuần',  icon: '💯', type: 'weekly',      metric: 'perfect_quiz',       target: 1,   xpReward: 300,  coinReward: 100 },
  // Achievement
  { key: 'ach-100-ans',     name: 'Trả lời 100 câu tổng cộng',  icon: '🏅', type: 'achievement', metric: 'total_answers',      target: 100, xpReward: 500,  coinReward: 200 },
  { key: 'ach-500-ans',     name: 'Chiến binh 500 câu',          icon: '⚔️', type: 'achievement', metric: 'total_answers',      target: 500, xpReward: 2000, coinReward: 1000 },
]

async function main() {
  console.log('🎮 Seeding Gamification data...\n')

  // ── Badges ──────────────────────────────────────────────────────────────────
  console.log('🏅 Seeding Badges...')
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        name: badge.name,
        icon: badge.icon,
        color: badge.color,
        xpReward: badge.xpReward,
        coinReward: badge.coinReward,
        description: badge.description,
        isActive: true,
      },
      create: {
        key: badge.key,
        name: badge.name,
        icon: badge.icon,
        color: badge.color,
        xpReward: badge.xpReward,
        coinReward: badge.coinReward,
        description: badge.description,
        isActive: true,
      },
    })
    console.log(`  ✅ Badge: ${badge.icon} ${badge.name}`)
  }

  // ── Missions ─────────────────────────────────────────────────────────────────
  console.log('\n🎯 Seeding Missions...')
  for (const mission of MISSIONS) {
    await prisma.mission.upsert({
      where: { key: mission.key },
      update: {
        name: mission.name,
        icon: mission.icon,
        type: mission.type,
        metric: mission.metric,
        target: mission.target,
        xpReward: mission.xpReward,
        coinReward: mission.coinReward,
        isActive: true,
      },
      create: {
        key: mission.key,
        name: mission.name,
        icon: mission.icon,
        type: mission.type,
        metric: mission.metric,
        target: mission.target,
        xpReward: mission.xpReward,
        coinReward: mission.coinReward,
        isActive: true,
      },
    })
    console.log(`  ✅ Mission: ${mission.icon} ${mission.name} (${mission.type})`)
  }

  console.log(`\n✨ Done! Seeded ${BADGES.length} badges + ${MISSIONS.length} missions.`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
