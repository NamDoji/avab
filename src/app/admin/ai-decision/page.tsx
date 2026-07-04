import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import Link from 'next/link'

export const metadata = { title: 'AI Decision Center — AvaB' }
export const revalidate = 1800 // cache 30 phút

// ── Helpers ─────────────────────────────────────────────────────
function fmtVND(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}tỷ`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`
  return `${amount}`
}

interface TrendProps {
  current: number
  prev: number
  invertGood?: boolean // true = lower is better (for overdue, inactive…)
}

function TrendBadge({ current, prev, invertGood = true }: TrendProps) {
  const diff = current - prev
  if (diff === 0) {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
        display: 'inline-block',
        background: 'rgba(107,114,128,0.25)', color: '#9ca3af',
      }}>→ Không đổi</span>
    )
  }
  const pct = prev > 0 ? Math.round(Math.abs(diff) / prev * 100) : 100
  const increasing = diff > 0
  const isBad = invertGood ? increasing : !increasing
  const color = isBad ? '#f87171' : '#4ade80'
  const bg = isBad ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'
  const arrow = increasing ? '↑' : '↓'
  const sign = increasing ? '+' : '-'
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, display: 'inline-block', background: bg, color }}>
      {arrow} {sign}{pct}% vs tuần trước
    </span>
  )
}

export default async function AIDecisionPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const now = Date.now()
  const d7  = new Date(now - 7  * 86_400_000)
  const d14 = new Date(now - 14 * 86_400_000)
  const d30 = new Date(now - 30 * 86_400_000)

  // ── Fetch tất cả metrics song song ───────────────────────────
  const [
    overdueData,
    inactiveStudents,
    inactiveLastWeek,
    aiProjectsDraft,
    allStats,
    absentRecords,
    sessionsByTeacher,
    newOverdueThisWeek,
    newOverdueLastWeek,
    aiProjectsLastWeek,
  ] = await Promise.all([
    // 1. HP quá hạn: tổng số khoản + tổng tiền
    prisma.tuitionPayment.aggregate({
      where: { isPaid: false, isFree: false, createdAt: { lt: d30 } },
      _count: { id: true },
      _sum: { amount: true },
    }),
    // 2. HS không làm bài > 14 ngày
    prisma.user.count({
      where: {
        role: 'STUDENT',
        answers: { none: { createdAt: { gte: d14 } } },
      },
    }),
    // 3. Trend inactive: tuần trước (so sánh > 7 ngày)
    prisma.user.count({
      where: {
        role: 'STUDENT',
        answers: { none: { createdAt: { gte: d7 } } },
      },
    }),
    // 4. AI Projects bị stuck
    prisma.aIProject.count({
      where: { status: 'draft', updatedAt: { lt: d7 } },
    }),
    // 5. Tất cả UserStats để tính low-score
    prisma.userStats.findMany({
      where: { totalAnswers: { gte: 10 } },
      select: { correctAnswers: true, totalAnswers: true },
    }),
    // 6. Vắng mặt tháng này (để đếm HS vắng ≥ 3)
    prisma.studentSessionRecord.findMany({
      where: { attendance: false, createdAt: { gte: d30 } },
      select: { userId: true },
    }),
    // 7. Sessions do giáo viên tạo tuần này (để tính busy teachers)
    prisma.sessionFeedback.findMany({
      where: { createdAt: { gte: d7 } },
      select: { createdBy: true },
    }),
    // 8. Trend overdue: tuần này
    prisma.tuitionPayment.count({
      where: { isPaid: false, isFree: false, createdAt: { gte: d7 } },
    }),
    // 9. Trend overdue: tuần trước
    prisma.tuitionPayment.count({
      where: { isPaid: false, isFree: false, createdAt: { gte: d14, lt: d7 } },
    }),
    // 10. AI Projects tuần trước (trend)
    prisma.aIProject.count({
      where: { status: 'draft', updatedAt: { lt: d14 } },
    }),
  ])

  // ── Tính toán ────────────────────────────────────────────────
  const overduePayments = overdueData._count.id
  const overdueAmount   = overdueData._sum.amount ?? 0

  // HS điểm thấp < 50% (dựa trên UserStats tổng thể)
  const lowScoreStudents = allStats.filter(
    s => s.totalAnswers > 0 && s.correctAnswers / s.totalAnswers < 0.5,
  ).length

  // HS vắng ≥ 3 lần tháng này
  const absentByUser: Record<string, number> = {}
  for (const r of absentRecords) {
    absentByUser[r.userId] = (absentByUser[r.userId] ?? 0) + 1
  }
  const noAttendanceStudents = Object.values(absentByUser).filter(c => c >= 3).length

  // GV bận > 5 buổi tuần này
  const countByTeacher: Record<string, number> = {}
  for (const s of sessionsByTeacher) {
    countByTeacher[s.createdBy] = (countByTeacher[s.createdBy] ?? 0) + 1
  }
  const busyTeachers = Object.values(countByTeacher).filter(c => c > 5).length

  // ── Real AI Analysis ─────────────────────────────────────────
  let aiText = ''
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Phân tích dữ liệu trường học và đưa ra khuyến nghị:

Dữ liệu:
- Học phí quá hạn: ${overduePayments} khoản, tổng ${fmtVND(overdueAmount)}đ
- Học sinh không học > 14 ngày: ${inactiveStudents}
- Học sinh điểm thấp < 50%: ${lowScoreStudents}
- Giáo viên bận > 5 buổi/tuần: ${busyTeachers}
- Dự án AI bị stuck: ${aiProjectsDraft}
- Học sinh vắng > 3 lần: ${noAttendanceStudents}

Hãy đưa ra:
1. Top 3 vấn đề cần xử lý ngay (ưu tiên theo mức độ nghiêm trọng)
2. 3 hành động cụ thể có thể làm ngay hôm nay
3. Dự báo ngắn: nếu không xử lý, điều gì có thể xảy ra?

Trả lời ngắn gọn, bằng tiếng Việt, không quá 200 từ.`,
      }],
      max_tokens: 400,
    })
    aiText = completion.choices[0]?.message?.content ?? ''
  } catch {
    aiText = '⚠️ Không thể kết nối AI lúc này. Các chỉ số trên phản ánh tình trạng thực tế — hãy ưu tiên xử lý những mục có số cao nhất.'
  }

  const totalAlerts = overduePayments + inactiveStudents + lowScoreStudents + noAttendanceStudents

  // ── Alert cards data ─────────────────────────────────────────
  const alerts: {
    emoji: string
    count: number
    label: string
    sublabel?: string
    href: string
    bg: string
    trendCurrent: number
    trendPrev: number
    invertGood?: boolean
  }[] = [
    {
      emoji: '💳',
      count: overduePayments,
      label: 'học phí quá hạn > 30 ngày',
      sublabel: overdueAmount > 0 ? `Tổng: ${fmtVND(overdueAmount)}đ` : undefined,
      href: '/admin/finance',
      bg: overduePayments > 10
        ? 'linear-gradient(135deg,#dc2626 0%,#b91c1c 100%)'
        : overduePayments > 0
        ? 'linear-gradient(135deg,#f97316 0%,#dc2626 100%)'
        : 'linear-gradient(135deg,#374151 0%,#1f2937 100%)',
      trendCurrent: newOverdueThisWeek,
      trendPrev: newOverdueLastWeek,
    },
    {
      emoji: '😴',
      count: inactiveStudents,
      label: 'học sinh không học > 14 ngày',
      href: '/admin/erp/students',
      bg: inactiveStudents > 5
        ? 'linear-gradient(135deg,#d97706 0%,#b45309 100%)'
        : inactiveStudents > 0
        ? 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)'
        : 'linear-gradient(135deg,#374151 0%,#1f2937 100%)',
      trendCurrent: inactiveStudents,
      trendPrev: inactiveLastWeek,
    },
    {
      emoji: '📉',
      count: lowScoreStudents,
      label: 'học sinh điểm thấp < 50%',
      href: '/admin/erp/students',
      bg: lowScoreStudents > 5
        ? 'linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)'
        : lowScoreStudents > 0
        ? 'linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)'
        : 'linear-gradient(135deg,#374151 0%,#1f2937 100%)',
      trendCurrent: lowScoreStudents,
      trendPrev: 0,
    },
    {
      emoji: '🚫',
      count: noAttendanceStudents,
      label: 'học sinh vắng ≥ 3 lần/tháng',
      href: '/admin/erp/attendance',
      bg: noAttendanceStudents > 3
        ? 'linear-gradient(135deg,#ea580c 0%,#c2410c 100%)'
        : noAttendanceStudents > 0
        ? 'linear-gradient(135deg,#fb923c 0%,#ea580c 100%)'
        : 'linear-gradient(135deg,#374151 0%,#1f2937 100%)',
      trendCurrent: noAttendanceStudents,
      trendPrev: 0,
    },
    {
      emoji: '👩‍🏫',
      count: busyTeachers,
      label: 'giáo viên > 5 buổi/tuần',
      href: '/admin/hrm',
      bg: busyTeachers > 2
        ? 'linear-gradient(135deg,#0284c7 0%,#0369a1 100%)'
        : busyTeachers > 0
        ? 'linear-gradient(135deg,#38bdf8 0%,#0284c7 100%)'
        : 'linear-gradient(135deg,#374151 0%,#1f2937 100%)',
      trendCurrent: busyTeachers,
      trendPrev: 0,
      invertGood: false,
    },
    {
      emoji: '🤖',
      count: aiProjectsDraft,
      label: 'AI Projects stuck > 7 ngày',
      href: '/admin/ai-studio',
      bg: aiProjectsDraft > 0
        ? 'linear-gradient(135deg,#0d9488 0%,#0f766e 100%)'
        : 'linear-gradient(135deg,#374151 0%,#1f2937 100%)',
      trendCurrent: aiProjectsDraft,
      trendPrev: aiProjectsLastWeek,
    },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#030712', paddingTop: 80 }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#0c0a09 0%,#1c1917 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 42 }}>🧠</span>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0 }}>
                    AI Decision Center
                  </h1>
                  <p style={{ color: '#78716c', fontSize: 13, margin: '4px 0 0' }}>
                    Phân tích thông minh · Cảnh báo · Dự báo — Live AI
                  </p>
                </div>
              </div>
              {totalAlerts > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 900,
                  background: '#ef4444', color: '#fff',
                }}>
                  🚨 {totalAlerts} cảnh báo cần xử lý
                </span>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#57534e', fontSize: 11, margin: 0 }}>Cập nhật lúc</p>
              <p style={{ color: '#d6d3d1', fontSize: 13, fontWeight: 700, margin: '2px 0 0' }}>
                {new Date().toLocaleString('vi-VN')}
              </p>
              <p style={{ color: '#57534e', fontSize: 11, margin: '4px 0 0' }}>
                Cache 30 phút
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Alert Cards ──────────────────────────────────── */}
        <section>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 17, marginBottom: 16, marginTop: 0 }}>
            🚨 Live Alerts
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {alerts.map((alert) => (
              <Link
                key={alert.label}
                href={alert.href}
                style={{
                  display: 'block', position: 'relative', overflow: 'hidden',
                  borderRadius: 20, padding: 24, color: '#fff',
                  background: alert.bg, textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                }}
              >
                {/* Decorative blob */}
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 80, height: 80, background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%', transform: 'translate(30%,-30%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 26 }}>{alert.emoji}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 99,
                      background: 'rgba(255,255,255,0.2)',
                    }}>
                      {alert.count > 0 ? 'CẦN XỬ LÝ' : 'ỔN ĐỊNH'}
                    </span>
                  </div>
                  <p style={{ fontSize: 44, fontWeight: 900, margin: '4px 0 2px', lineHeight: 1 }}>
                    {alert.count}
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', margin: '0 0 2px' }}>
                    {alert.label}
                  </p>
                  {alert.sublabel && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', margin: '0 0 6px', fontWeight: 700 }}>
                      {alert.sublabel}
                    </p>
                  )}
                  <div style={{ marginTop: 10 }}>
                    <TrendBadge
                      current={alert.trendCurrent}
                      prev={alert.trendPrev}
                      invertGood={alert.invertGood ?? true}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 10, fontWeight: 700 }}>
                    Xem chi tiết →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── AI Recommendations Box ───────────────────────── */}
        <section style={{
          background: '#0f172a', borderRadius: 24,
          border: '1px solid #1e293b', overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 17, margin: 0 }}>
                🤖 AI Analysis · Khuyến nghị hành động
              </h2>
              <p style={{ color: '#475569', fontSize: 12, margin: '4px 0 0' }}>
                Phân tích thực tế từ GPT‑4o‑mini · Server‑side · Live
              </p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
              background: 'rgba(16,185,129,0.18)', color: '#34d399',
            }}>
              🟢 LIVE
            </span>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 16,
              padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
                {aiText || 'Đang tải phân tích AI…'}
              </p>
            </div>
          </div>
        </section>

        {/* ── Trend Summary ─────────────────────────────────── */}
        <section style={{
          background: '#0f172a', borderRadius: 24,
          border: '1px solid #1e293b', overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b' }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 17, margin: 0 }}>
              📈 Trend So Sánh — Tuần Này vs Tuần Trước
            </h2>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'HP mới quá hạn', current: newOverdueThisWeek, prev: newOverdueLastWeek, emoji: '💳' },
                { label: 'HS không hoạt động', current: inactiveStudents, prev: inactiveLastWeek, emoji: '😴' },
                { label: 'GV bận > 5 buổi', current: busyTeachers, prev: 0, emoji: '👩‍🏫', noTrend: true },
                { label: 'AI Projects stuck', current: aiProjectsDraft, prev: aiProjectsLastWeek, emoji: '🤖' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: 14,
                    padding: '16px 18px', border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                    <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 900 }}>{item.current}</span>
                    {!item.noTrend && (
                      <TrendBadge current={item.current} prev={item.prev} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quick Actions ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {([
            { icon: '💰', label: 'Finance',    href: '/admin/finance',       color: '#059669' },
            { icon: '👥', label: 'Students',   href: '/admin/erp/students',  color: '#7c3aed' },
            { icon: '📋', label: 'Attendance', href: '/admin/erp/attendance',color: '#f97316' },
            { icon: '🤖', label: 'AI Studio',  href: '/admin/ai-studio',     color: '#0284c7' },
            { icon: '👩‍🏫', label: 'HRM',       href: '/admin/hrm',           color: '#0d9488' },
            { icon: '📊', label: 'Dashboard',  href: '/admin',               color: '#6d28d9' },
          ] as const).map((a) => (
            <Link
              key={a.href}
              href={a.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: '14px 8px', borderRadius: 16,
                background: a.color, color: '#fff', fontWeight: 900,
                fontSize: 12, textDecoration: 'none', textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
