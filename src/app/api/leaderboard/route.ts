import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Random names cho bảng vàng (thay đổi theo ngày)
const SAMPLE_NAMES = [
  'Nguyễn Minh Anh','Trần Bảo Châu','Lê Hoàng Nam','Phạm Thùy Linh','Hoàng Đức Khôi',
  'Vũ Ngọc Hân','Đặng Minh Tuấn','Bùi Thu Hà','Ngô Quang Huy','Đinh Lan Anh',
  'Lý Gia Bảo','Mai Thanh Tâm','Trịnh Khánh Linh','Phan Nhật Minh','Cao Bích Ngọc',
  'Dương Quốc Toản','Tô Bảo Châu','Hồ Minh Khoa','Lâm Thảo Nguyên','Đoàn Gia Hân',
  'Nguyễn Bảo Long','Trần Minh Phúc','Lê Thu Hương','Phạm Đức Anh','Võ Ngọc Mai',
]

function dailySeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export async function GET() {
  try {
    // Real students from DB
    const scores = await prisma.studentAnswer.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
      take: 15,
    })

    const userIds = scores.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    })

    const realEntries = scores.map((s, idx) => {
      const user = users.find((u) => u.id === s.userId)
      return {
        rank: idx + 1,
        userId: s.userId,
        name: user?.name || 'Học viên',
        totalScore: s._sum.score || 0,
        isReal: true,
      }
    })

    // Pad with daily-random fake students to reach 15
    const rng = seededRandom(dailySeed())
    const usedNames = new Set(realEntries.map(e => e.name))
    const available = SAMPLE_NAMES.filter(n => !usedNames.has(n))

    // Shuffle available names with daily seed
    const shuffled = [...available].sort(() => rng() - 0.5)

    const fakeEntries: Array<{rank:number;userId:string;name:string;totalScore:number;isReal:boolean}> = []
    let maxScore = realEntries.length > 0
      ? Math.max(...realEntries.map(e => e.totalScore), 80)
      : 200

    for (let i = realEntries.length; i < 15 && fakeEntries.length < (15 - realEntries.length); i++) {
      const name = shuffled[fakeEntries.length] || `Học viên ${i + 1}`
      // Score decreases from top, with daily variation
      const baseScore = Math.max(10, maxScore - (i * (5 + Math.floor(rng() * 15))))
      fakeEntries.push({
        rank: i + 1,
        userId: `fake-${i}`,
        name,
        totalScore: baseScore,
        isReal: false,
      })
    }

    const leaderboard = [...realEntries, ...fakeEntries]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 15)
      .map((e, idx) => ({ ...e, rank: idx + 1 }))

    return NextResponse.json({ success: true, data: leaderboard })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
