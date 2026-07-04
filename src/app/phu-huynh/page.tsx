'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const COURSE_TYPE_EMOJI: Record<string, string> = {
  TOAN: '📐', TIENG_ANH: '🇬🇧',
  LAP_TRINH_THUAT_TOAN: '🤖', LAP_TRINH_SCRATCH: '🐱',
  LAP_TRINH_PYTHON: '🐍', LAP_TRINH_CPP: '⚡',
  THINKING_MATH: '🧠', MATH: '📐', VIETNAMESE: '📖',
  ENGLISH: '🇬🇧', SCIENCE: '🔬', PHYSICS: '⚛️',
  CHEMISTRY: '🧪', BIOLOGY: '🧬', HISTORY: '🏰',
  GEOGRAPHY: '🌍', INFORMATICS: '💻', CIVIC: '⚖️',
  ALGO: '🤖', SCRATCH: '🐱', PYTHON: '🐍', CPP: '⚡',
  IELTS: '📝', CAMBRIDGE: '🎓', GENERAL: '📚',
}

interface StudentCard {
  id: string
  name: string | null
  phone: string
  avatar: string | null
  isActive: boolean
  linkedAt: string
  enrollments: Array<{
    id: string
    status: string
    course: { id: string; name: string; courseType: string; code: string }
  }>
  weekStats: { done: number; pct: number | null }
  lastSession: { date: string; subject: string } | null
  gamification: {
    xp: number
    level: number
    streak: number
    badges: Array<{ id: string; name: string; icon: string; color: string }>
  }
  attendance: { monthPresent: number; monthTotal: number; pct: number | null }
  paymentStatus: 'paid' | 'unpaid' | 'unknown'
}

// ── Stat Pill ──────────────────────────────────────────────────
function StatPill({
  emoji,
  value,
  label,
  valueColor,
}: {
  emoji: string
  value: string | number
  label: string
  valueColor?: string
}) {
  return (
    <div style={{
      flex: 1, minWidth: 90,
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 12, padding: '10px 8px',
      textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: valueColor ?? '#f1f5f9' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{label}</div>
    </div>
  )
}

// ── Individual Student Card ────────────────────────────────────
function StudentDetailCard({ s }: { s: StudentCard }) {
  const initials = s.name?.[0]?.toUpperCase() ?? '?'
  const bgColors = ['#0f766e', '#0369a1', '#7c3aed', '#db2777', '#ea580c']
  const avatarBg = bgColors[(initials.charCodeAt(0) ?? 0) % bgColors.length]
  const activeEnrollments = s.enrollments.filter(e => ['ACTIVE', 'APPROVED'].includes(e.status))

  const attPct = s.attendance.pct
  const accPct = s.weekStats.pct
  const levelEmoji = s.gamification.level >= 10 ? '🏆' : s.gamification.level >= 5 ? '⭐' : '🌱'
  const attColor = attPct === null ? '#94a3b8' : attPct >= 80 ? '#4ade80' : attPct >= 60 ? '#fbbf24' : '#f87171'
  const accColor = accPct === null ? '#94a3b8' : accPct >= 70 ? '#4ade80' : accPct >= 50 ? '#fbbf24' : '#f87171'

  return (
    <div style={{
      background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid #334155',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        padding: '18px 20px 16px',
        background: 'linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(15,23,42,0) 100%)',
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9', margin: 0 }}>
              {s.name ?? 'Chưa có tên'}
            </h3>
            <p style={{ color: '#475569', fontSize: 12, margin: '2px 0 0' }}>{s.phone}</p>
          </div>
        </div>
        <div style={{
          background: 'rgba(99,102,241,0.18)', borderRadius: 10,
          padding: '4px 10px', textAlign: 'center',
          border: '1px solid rgba(99,102,241,0.3)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#a5b4fc' }}>
            {levelEmoji} Lv.{s.gamification.level}
          </div>
          <div style={{ fontSize: 10, color: '#6366f1' }}>
            {s.gamification.xp.toLocaleString('vi-VN')} XP
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Row 1: 4 Stats ───────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <StatPill
            emoji="📅"
            value={attPct !== null ? `${attPct}%` : '—'}
            label="Điểm danh"
            valueColor={attColor}
          />
          <StatPill
            emoji="🎯"
            value={accPct !== null ? `${accPct}%` : '—'}
            label="Câu đúng/tuần"
            valueColor={accColor}
          />
          <StatPill
            emoji="⭐"
            value={s.gamification.xp >= 1000 ? `${(s.gamification.xp / 1000).toFixed(1)}k` : s.gamification.xp}
            label="XP"
            valueColor="#fbbf24"
          />
          <StatPill
            emoji="🔥"
            value={`${s.gamification.streak}d`}
            label="Streak"
            valueColor={s.gamification.streak >= 7 ? '#f97316' : '#f1f5f9'}
          />
        </div>

        {/* ── Row 2: Enrollments ───────────────────────────── */}
        {activeEnrollments.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: '#475569', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📚 Lớp đang học
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeEnrollments.slice(0, 4).map(e => (
                <span key={e.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(99,102,241,0.12)', borderRadius: 8,
                  padding: '5px 10px', fontSize: 12, fontWeight: 600,
                  color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)',
                }}>
                  {COURSE_TYPE_EMOJI[e.course.courseType] ?? '📚'} {e.course.code}
                </span>
              ))}
              {activeEnrollments.length > 4 && (
                <span style={{ color: '#475569', fontSize: 12, padding: '5px 0' }}>
                  +{activeEnrollments.length - 4} lớp khác
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Row 3: Badges ────────────────────────────────── */}
        {s.gamification.badges.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: '#475569', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🏆 Huy hiệu mới nhất
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {s.gamification.badges.map(b => (
                <div key={b.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(251,191,36,0.08)', borderRadius: 10,
                  padding: '5px 10px', border: '1px solid rgba(251,191,36,0.2)',
                }}>
                  <span style={{ fontSize: 16 }}>{b.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fde68a' }}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Row 4: Payment Status ─────────────────────────── */}
        {s.paymentStatus !== 'unknown' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 12,
            background: s.paymentStatus === 'paid' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${s.paymentStatus === 'paid' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <span style={{ fontSize: 18 }}>{s.paymentStatus === 'paid' ? '✅' : '⚠️'}</span>
            <div>
              <p style={{
                fontSize: 13, fontWeight: 700, margin: 0,
                color: s.paymentStatus === 'paid' ? '#4ade80' : '#f87171',
              }}>
                {s.paymentStatus === 'paid' ? 'Học phí đã đóng đủ' : 'Còn học phí chưa đóng'}
              </p>
              <p style={{ fontSize: 11, color: '#475569', margin: '2px 0 0' }}>
                {s.paymentStatus === 'paid' ? 'Tháng này không có khoản nào tồn đọng' : 'Liên hệ nhà trường để thanh toán'}
              </p>
            </div>
          </div>
        )}

        {/* ── Last Session ──────────────────────────────────── */}
        {s.lastSession && (
          <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
            🕐 Buổi học gần nhất:{' '}
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>
              {new Date(s.lastSession.date).toLocaleDateString('vi-VN')} · {s.lastSession.subject}
            </span>
          </p>
        )}

        {/* ── Action Buttons ────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <Link
            href={`/phu-huynh/hoc-sinh/${s.id}`}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', borderRadius: 12, textDecoration: 'none',
              background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}
          >
            👁️ Xem chi tiết
          </Link>
          <Link
            href={`/admin/erp/students/${s.id}/analytics`}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', borderRadius: 12, textDecoration: 'none',
              background: 'rgba(255,255,255,0.07)',
              color: '#94a3b8', fontWeight: 700, fontSize: 13,
              border: '1px solid #334155',
            }}
          >
            📊 Analytics
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────
export default function ParentDashboard() {
  const { data: session } = useSession()
  const [students, setStudents] = useState<StudentCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/parent/students')
      .then(r => r.json())
      .then(d => { if (d.success) setStudents(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const name = session?.user?.name ?? 'Phụ huynh'
  const totalUnpaid = students.filter(s => s.paymentStatus === 'unpaid').length
  const totalLowAcc = students.filter(s => s.weekStats.pct !== null && s.weekStats.pct < 50).length

  return (
    <div style={{ minHeight: '100vh', background: '#030712', paddingTop: 80 }}>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a5f 0%,#1a1a4e 50%,#0f172a 100%)',
        padding: '36px 24px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, margin: '0 0 6px' }}>
            Góc phụ huynh · AvaB
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px' }}>
            Xin chào, {name}! 👨‍👩‍👧‍👦
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
            {students.length > 0
              ? `Bạn đang theo dõi ${students.length} học sinh.`
              : 'Hãy liên kết tài khoản con để bắt đầu theo dõi.'}
          </p>

          {/* Summary alerts */}
          {(totalUnpaid > 0 || totalLowAcc > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {totalUnpaid > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                  background: 'rgba(239,68,68,0.2)', color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.35)',
                }}>
                  ⚠️ {totalUnpaid} học sinh chưa đóng học phí
                </span>
              )}
              {totalLowAcc > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                  background: 'rgba(251,191,36,0.15)', color: '#fde68a',
                  border: '1px solid rgba(251,191,36,0.3)',
                }}>
                  📉 {totalLowAcc} học sinh điểm thấp tuần này
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Quick Actions ───────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          <Link href="/phu-huynh/lien-ket" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#1e293b', borderRadius: 16, padding: '14px 16px',
            border: '1px solid #334155', textDecoration: 'none',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🔗</div>
            <div>
              <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, margin: 0 }}>Liên kết con</p>
              <p style={{ color: '#475569', fontSize: 12, margin: '2px 0 0' }}>Thêm học sinh</p>
            </div>
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#1e293b', borderRadius: 16, padding: '14px 16px',
            border: '1px solid #334155',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>👨‍👩‍👧</div>
            <div>
              <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, margin: 0 }}>{students.length} học sinh</p>
              <p style={{ color: '#475569', fontSize: 12, margin: '2px 0 0' }}>Đang theo dõi</p>
            </div>
          </div>
        </div>

        {/* ── Student List ─────────────────────────────────────── */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👨‍👩‍👧</span> Học sinh của tôi
          </h2>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  background: '#1e293b', borderRadius: 20, height: 240,
                  border: '1px solid #334155',
                  animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                }} />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div style={{
              background: '#1e293b', borderRadius: 24, padding: '48px 24px',
              textAlign: 'center', border: '1px solid #334155',
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>
                Chưa có học sinh nào được liên kết
              </p>
              <p style={{ color: '#475569', fontSize: 14, margin: '0 0 24px' }}>
                Nhập số điện thoại của con để bắt đầu theo dõi tiến độ học tập
              </p>
              <Link href="/phu-huynh/lien-ket" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#6366f1', color: '#fff', padding: '12px 24px',
                borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>
                🔗 Liên kết ngay
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
              {students.map(s => (
                <StudentDetailCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
