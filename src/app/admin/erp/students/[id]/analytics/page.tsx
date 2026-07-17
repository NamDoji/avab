import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Analytics học sinh — AvaB ERP' }

// ── Helpers ─────────────────────────────────────────────────────────
function Avatar({ name, size = 56 }: { name: string | null; size?: number }) {
  const letter = name ? name.trim()[0]?.toUpperCase() ?? '?' : '?'
  const colors = ['#0f766e', '#0369a1', '#951F3D', '#db2777', '#ea580c', '#65a30d']
  const bg = colors[(letter.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 900, color: '#fff', flexShrink: 0,
    }}>
      {letter}
    </div>
  )
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function weekLabel(isoDate: string): string {
  const d = new Date(isoDate)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

// ── Bar chart component ──────────────────────────────────────────────
function BarChart({
  items,
  maxPct,
  colorFn,
}: {
  items: { label: string; value: number; pct: number; count: number }[]
  maxPct: number
  colorFn: (pct: number) => string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>
              {item.value}% <span style={{ color: '#475569' }}>({item.count} câu)</span>
            </span>
          </div>
          <div style={{ background: '#1e293b', borderRadius: 99, height: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${maxPct > 0 ? (item.pct / maxPct) * 100 : 0}%`,
              background: colorFn(item.pct),
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Mini bar (for weekly trend) ──────────────────────────────────────
function MiniBarChart({
  weeks,
  valueKey,
  color,
}: {
  weeks: { label: string; present: number; total: number; correct: number; totalAns: number }[]
  valueKey: 'attendance' | 'accuracy'
  color: string
}) {
  const vals = weeks.map(w =>
    valueKey === 'attendance'
      ? (w.total > 0 ? Math.round(w.present / w.total * 100) : 0)
      : (w.totalAns > 0 ? Math.round(w.correct / w.totalAns * 100) : 0),
  )
  const maxVal = Math.max(...vals, 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 }}>
      {weeks.map((w, i) => (
        <div key={w.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{vals[i]}%</div>
          <div style={{
            width: '100%', minWidth: 20,
            height: `${maxVal > 0 ? (vals[i] / maxVal) * 44 : 2}px`,
            background: color, borderRadius: '4px 4px 0 0',
            minHeight: 2,
          }} />
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>{w.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default async function StudentAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { id } = await params

  // ── Parallel data fetch ─────────────────────────────────────────
  const [student, answers, sessionRecords, userBadges] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: { learnerProfile: true, userStats: true },
    }),
    prisma.studentAnswer.findMany({
      where: { userId: id },
      include: {
        question: {
          include: {
            subject: {
              include: {
                course: { select: { id: true, name: true, subjectName: true, subjectCode: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.studentSessionRecord.findMany({
      where: { userId: id },
      include: {
        feedback: {
          include: {
            subject: { select: { id: true, name: true, icon: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.userBadge.findMany({
      where: { userId: id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 10,
    }),
  ])

  if (!student || student.role !== 'STUDENT') notFound()

  // ── Overall stats ────────────────────────────────────────────────
  const totalAnswers   = answers.length
  const correctAnswers = answers.filter(a => a.isCorrect).length
  const accuracy       = totalAnswers > 0 ? Math.round(correctAnswers / totalAnswers * 100) : 0

  const now = Date.now()
  const d8w = new Date(now - 56 * 86_400_000) // 8 weeks back
  const d4w = new Date(now - 28 * 86_400_000) // 4 weeks back

  // ── Per-subject accuracy ─────────────────────────────────────────
  const subjectMap: Record<string, { name: string; correct: number; total: number }> = {}
  for (const a of answers) {
    const subj = a.question.subject
    const key = subj.id
    if (!subjectMap[key]) {
      subjectMap[key] = {
        name: subj.name,
        correct: 0,
        total: 0,
      }
    }
    subjectMap[key].total++
    if (a.isCorrect) subjectMap[key].correct++
  }

  const subjectStats = Object.entries(subjectMap)
    .map(([, s]) => ({
      label: s.name,
      value: s.total > 0 ? Math.round(s.correct / s.total * 100) : 0,
      pct:   s.total > 0 ? s.correct / s.total * 100 : 0,
      count: s.total,
    }))
    .filter(s => s.count >= 3)
    .sort((a, b) => b.value - a.value)

  const maxSubjectPct = subjectStats.length > 0 ? Math.max(...subjectStats.map(s => s.pct), 1) : 100

  // Strength (top 3) and Weakness (bottom 3)
  const strengths  = subjectStats.slice(0, 3)
  const weaknesses = [...subjectStats].reverse().slice(0, 3)

  // ── Weekly stats (last 8 weeks) ───────────────────────────────────
  const weeklyMap: Record<string, { present: number; total: number; correct: number; totalAns: number }> = {}

  // Session attendance
  const recentSessions = sessionRecords.filter(r => new Date(r.createdAt) >= d8w)
  for (const r of recentSessions) {
    const wk = getWeekKey(r.createdAt)
    if (!weeklyMap[wk]) weeklyMap[wk] = { present: 0, total: 0, correct: 0, totalAns: 0 }
    weeklyMap[wk].total++
    if (r.attendance) weeklyMap[wk].present++
  }

  // Answer accuracy by week (last 4 weeks)
  const recentAnswers = answers.filter(a => new Date(a.createdAt) >= d4w)
  for (const a of recentAnswers) {
    const wk = getWeekKey(a.createdAt)
    if (!weeklyMap[wk]) weeklyMap[wk] = { present: 0, total: 0, correct: 0, totalAns: 0 }
    weeklyMap[wk].totalAns++
    if (a.isCorrect) weeklyMap[wk].correct++
  }

  // Build sorted weeks (last 8)
  const allWeekKeys = Object.keys(weeklyMap).sort().slice(-8)
  const weeklyData = allWeekKeys.map(wk => ({
    label: weekLabel(wk),
    ...weeklyMap[wk],
  }))

  // Last 4 weeks for accuracy chart
  const last4WeeksData = allWeekKeys.slice(-4).map(wk => ({
    label: weekLabel(wk),
    ...weeklyMap[wk],
  }))

  // ── Attendance rate ───────────────────────────────────────────────
  const totalSessions   = sessionRecords.length
  const presentSessions = sessionRecords.filter(r => r.attendance).length
  const attendanceRate  = totalSessions > 0 ? Math.round(presentSessions / totalSessions * 100) : 0

  // ── Recent activity (last 10 answers + sessions) ─────────────────
  const recentActivity10 = answers.slice(0, 10)

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', paddingTop: 80 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#29050F 0%,#0f172a 100%)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Link
              href={`/admin/erp/students/${id}`}
              style={{ color: '#818cf8', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              ← Hồ sơ học sinh
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Avatar name={student.name} size={64} />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', margin: 0 }}>
                {student.name ?? 'Học sinh'}
              </h1>
              <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                📊 Learning Analytics · Phân tích học tập chi tiết
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'XP', value: student.userStats?.xp ?? 0, emoji: '⭐' },
                { label: 'Level', value: student.userStats?.level ?? 1, emoji: '🏅' },
                { label: 'Streak', value: `${student.userStats?.streak ?? 0}d`, emoji: '🔥' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.07)', borderRadius: 14,
                  padding: '10px 16px', textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: 20 }}>{stat.emoji}</div>
                  <div style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 18 }}>{stat.value}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Overall Stats Row ───────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Độ chính xác', value: `${accuracy}%`, emoji: '🎯', color: accuracy >= 70 ? '#4ade80' : accuracy >= 50 ? '#fbbf24' : '#f87171' },
            { label: 'Câu đã làm', value: totalAnswers, emoji: '📝', color: '#60a5fa' },
            { label: 'Câu đúng', value: correctAnswers, emoji: '✅', color: '#4ade80' },
            { label: 'Điểm danh', value: `${attendanceRate}%`, emoji: '📅', color: attendanceRate >= 80 ? '#4ade80' : attendanceRate >= 60 ? '#fbbf24' : '#f87171' },
            { label: 'Buổi học', value: totalSessions, emoji: '📚', color: '#DC607D' },
            { label: 'Huy hiệu', value: userBadges.length, emoji: '🏆', color: '#fbbf24' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#1e293b', borderRadius: 16, padding: '18px 16px',
              border: '1px solid #334155', textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.emoji}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Performance by Subject ──────────────────────────── */}
        {subjectStats.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 20, padding: 24, border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 16, margin: '0 0 20px' }}>
              📊 Độ chính xác theo môn học
            </h2>
            <BarChart
              items={subjectStats}
              maxPct={maxSubjectPct}
              colorFn={(pct) => pct >= 70 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'}
            />
          </div>
        )}

        {/* ── Strength / Weakness ─────────────────────────────── */}
        {subjectStats.length >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Strengths */}
            <div style={{ background: '#0f2d1f', borderRadius: 20, padding: 20, border: '1px solid #166534' }}>
              <h3 style={{ color: '#4ade80', fontWeight: 900, fontSize: 14, margin: '0 0 14px' }}>
                💪 Điểm mạnh (Top môn)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {strengths.map((s, i) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#bbf7d0', fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                      <div style={{ background: '#166534', borderRadius: 99, height: 6, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, width: `${s.value}%`, background: '#4ade80' }} />
                      </div>
                    </div>
                    <span style={{ color: '#4ade80', fontWeight: 900, fontSize: 14, minWidth: 36, textAlign: 'right' }}>{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div style={{ background: '#2d0f0f', borderRadius: 20, padding: 20, border: '1px solid #991b1b' }}>
              <h3 style={{ color: '#f87171', fontWeight: 900, fontSize: 14, margin: '0 0 14px' }}>
                🎯 Cần cải thiện
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {weaknesses.map((s, i) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#fecaca', fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                      <div style={{ background: '#991b1b', borderRadius: 99, height: 6, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, width: `${s.value}%`, background: '#ef4444' }} />
                      </div>
                    </div>
                    <span style={{ color: '#f87171', fontWeight: 900, fontSize: 14, minWidth: 36, textAlign: 'right' }}>{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Attendance Trend (last 8 weeks) ─────────────────── */}
        {weeklyData.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 20, padding: 24, border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 16, margin: '0 0 20px' }}>
              📅 Xu hướng điểm danh — 8 tuần gần nhất
            </h2>
            <MiniBarChart weeks={weeklyData} valueKey="attendance" color="#38bdf8" />
            <p style={{ color: '#475569', fontSize: 12, marginTop: 12 }}>
              Tổng {totalSessions} buổi · Có mặt {presentSessions} · Vắng {totalSessions - presentSessions}
            </p>
          </div>
        )}

        {/* ── Learning Curve (accuracy last 4 weeks) ──────────── */}
        {last4WeeksData.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 20, padding: 24, border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 16, margin: '0 0 20px' }}>
              📈 Learning Curve — Độ chính xác 4 tuần gần nhất
            </h2>
            <MiniBarChart weeks={last4WeeksData} valueKey="accuracy" color="#DC607D" />
            <p style={{ color: '#475569', fontSize: 12, marginTop: 12 }}>
              Dựa trên {recentAnswers.length} câu trả lời gần nhất
            </p>
          </div>
        )}

        {/* ── Recent Badges ────────────────────────────────────── */}
        {userBadges.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 20, padding: 24, border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 16, margin: '0 0 16px' }}>
              🏆 Huy hiệu đạt được ({userBadges.length})
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {userBadges.map(ub => (
                <div key={ub.id} style={{
                  background: 'rgba(251,191,36,0.1)', borderRadius: 12, padding: '8px 14px',
                  border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>{ub.badge.icon}</span>
                  <div>
                    <div style={{ color: '#fde68a', fontSize: 12, fontWeight: 700 }}>{ub.badge.name}</div>
                    <div style={{ color: '#92400e', fontSize: 10 }}>
                      {new Date(ub.earnedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Activity Timeline ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Recent answers */}
          <div style={{ background: '#1e293b', borderRadius: 20, padding: 24, border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 15, margin: '0 0 16px' }}>
              📝 10 câu trả lời gần nhất
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentActivity10.length === 0 && (
                <p style={{ color: '#475569', fontSize: 13 }}>Chưa có dữ liệu</p>
              )}
              {recentActivity10.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 12,
                  background: a.isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${a.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                    {a.isCorrect ? '✅' : '❌'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: '#e2e8f0', fontSize: 12, margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}>
                      {a.question.content.replace(/<[^>]+>/g, '').slice(0, 80)}…
                    </p>
                    <p style={{ color: '#475569', fontSize: 10, margin: '3px 0 0' }}>
                      {a.question.subject.name} · {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {a.score}đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div style={{ background: '#1e293b', borderRadius: 20, padding: 24, border: '1px solid #334155' }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 15, margin: '0 0 16px' }}>
              📋 10 buổi học gần nhất
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessionRecords.length === 0 && (
                <p style={{ color: '#475569', fontSize: 13 }}>Chưa có dữ liệu</p>
              )}
              {sessionRecords.slice(0, 10).map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12,
                  background: r.attendance ? 'rgba(56,189,248,0.06)' : 'rgba(248,113,113,0.06)',
                  border: `1px solid ${r.attendance ? 'rgba(56,189,248,0.18)' : 'rgba(248,113,113,0.18)'}`,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>
                    {r.attendance ? '✅' : '❌'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#e2e8f0', fontSize: 12, margin: 0, fontWeight: 600 }}>
                      {r.feedback.subject.icon ?? '📚'} {r.feedback.subject.name}
                    </p>
                    <p style={{ color: '#475569', fontSize: 10, margin: '2px 0 0' }}>
                      {new Date(r.feedback.sessionDate).toLocaleDateString('vi-VN')}
                      {r.comprehension != null && ` · Hiểu bài: ${r.comprehension}/5`}
                      {r.hwScore != null && ` · BTVN: ${r.hwScore}%`}
                    </p>
                  </div>
                  {r.emotionState && (
                    <span style={{ fontSize: 16 }}>
                      {r.emotionState === 'great' ? '🤩' : r.emotionState === 'good' ? '😊' : r.emotionState === 'neutral' ? '😐' : r.emotionState === 'tired' ? '😴' : '😤'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Back link ──────────────────────────────────────────── */}
        <div style={{ paddingBottom: 24, display: 'flex', gap: 12 }}>
          <Link
            href={`/admin/erp/students/${id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: '#334155', color: '#e2e8f0',
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}
          >
            ← Hồ sơ học sinh
          </Link>
          <Link
            href="/admin/erp/students"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: '#1e293b', color: '#94a3b8',
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
              border: '1px solid #334155',
            }}
          >
            Danh sách học sinh
          </Link>
        </div>

      </div>
    </main>
  )
}
