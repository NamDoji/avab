import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Báo cáo PDF — AvaB EOS' }

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtVND(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(0)     + ' triệu'
  if (n >= 1_000)         return Math.round(n / 1_000)          + 'K'
  return n.toLocaleString('vi-VN')
}

function fmtNum(n: number) {
  return n.toLocaleString('vi-VN')
}

function periodLabel(period: string): string {
  if (period === 'month') return `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`
  if (period === 'year')  return `Năm ${new Date().getFullYear()}`
  return 'Tất cả thời gian'
}

function dateRange(period: string): Date | null {
  const now = new Date()
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === 'year')  return new Date(now.getFullYear(), 0, 1)
  return null
}

// ── Print button (client island) ──────────────────────────────────────────────

function PrintButton() {
  return (
    <button
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick={'window.print()' as any}
      suppressHydrationWarning
      className="no-print"
      style={{
        padding: '10px 24px', borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg,#951F3D,#2563eb)',
        color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}
    >
      🖨️ In báo cáo
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const { period: periodParam } = await searchParams
  const period = ['month', 'year', 'all'].includes(periodParam ?? '') ? periodParam! : 'month'
  const since = dateRange(period)
  const generatedAt = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // ── Pull data ──────────────────────────────────────────────────────────────
  const [
    students,
    teachers,
    courses,
    revenueAgg,
    paidCount,
    registrations,
    topCourses,
    userStatsTop,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.course.count({ where: since ? { createdAt: { gte: since } } : {} }),
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true, ...(since ? { paidAt: { gte: since } } : {}) },
      _sum: { amount: true },
    }),
    prisma.tuitionPayment.count({
      where: { isPaid: true, ...(since ? { paidAt: { gte: since } } : {}) },
    }),
    prisma.registration.count({
      where: since ? { createdAt: { gte: since } } : {},
    }),
    prisma.course.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, code: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.userStats.findMany({
      take: 10,
      orderBy: { xp: 'desc' },
      include: { user: { select: { name: true } } },
    }),
  ])

  const revenue = revenueAgg._sum.amount ?? 0

  // Registration by source
  const regByStatus = await prisma.registration.groupBy({
    by: ['status'],
    _count: true,
  })
  const regMap: Record<string, number> = {}
  for (const r of regByStatus) regMap[r.status] = r._count

  const wonLeads   = regMap['WON']      ?? 0
  const totalLeads = registrations
  const convRate   = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

  // KPIs
  const kpis = [
    { label: 'Học sinh',          value: fmtNum(students),       icon: '🎓', color: '#951F3D', bg: '#FFF7F9' },
    { label: 'Doanh thu',         value: fmtVND(revenue) + ' ₫', icon: '💰', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Khóa học',          value: fmtNum(courses),        icon: '📚', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Tỷ lệ chuyển đổi', value: convRate + '%',          icon: '📈', color: '#d97706', bg: '#fffbeb' },
  ]

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Báo cáo {periodLabel(period)} — AvaB EOS</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1f2937; background: #f9fafb; }
          .page { max-width: 900px; margin: 0 auto; padding: 32px 24px; background: #fff; min-height: 100vh; }
          @media print {
            .no-print { display: none !important; }
            body { font-size: 11pt; background: #fff; }
            .page { max-width: 100%; padding: 16px; box-shadow: none; }
            table { border-collapse: collapse; width: 100%; page-break-inside: auto; }
            th, td { border: 1px solid #d1d5db; padding: 7px 10px; }
            tr { page-break-inside: avoid; }
            .page-break { page-break-before: always; }
          }
          h1 { font-size: 22px; font-weight: 900; }
          h2 { font-size: 15px; font-weight: 800; margin-bottom: 12px; color: #374151; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #951F3D; color: #fff; padding: 9px 12px; text-align: left; font-weight: 700; font-size: 12px; }
          td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) td { background: #fafafa; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
          .kpi { border-radius: 12px; padding: 16px; text-align: center; }
          .kpi .icon { font-size: 26px; margin-bottom: 6px; }
          .kpi .val  { font-size: 20px; font-weight: 900; }
          .kpi .lbl  { font-size: 11px; font-weight: 600; margin-top: 2px; opacity: 0.8; }
          .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
          .header-brand { display: flex; align-items: center; gap: 12px; }
          .badge { background: #951F3D; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
          .section { margin-bottom: 28px; }
          .meta { color: #6b7280; font-size: 12px; }
          .bar-wrap { background: #f3f4f6; border-radius: 4px; height: 8px; width: 80px; display: inline-block; vertical-align: middle; }
          .bar-fill { background: #951F3D; height: 8px; border-radius: 4px; }
          .pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        `}</style>
      </head>
      <body>
        <div className="page">

          {/* ── Top nav (no-print) ──────────────────────────────────── */}
          <div className="no-print" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin/analytics" style={{ color: '#951F3D', fontWeight: 700, textDecoration: 'none' }}>
              ← Analytics
            </Link>
            <span style={{ color: '#d1d5db' }}>|</span>
            {/* Period switcher */}
            {['month','year','all'].map(p => (
              <Link
                key={p}
                href={`/admin/analytics/report?period=${p}`}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                  background: period === p ? '#951F3D' : '#f3f4f6',
                  color: period === p ? '#fff' : '#6b7280',
                  textDecoration: 'none',
                }}
              >
                {p === 'month' ? 'Tháng này' : p === 'year' ? 'Năm nay' : 'Tất cả'}
              </Link>
            ))}
            <div style={{ flex: 1 }} />
            <PrintButton />
          </div>

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="header">
            <div className="header-brand">
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg,#951F3D,#2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 18,
              }}>A</div>
              <div>
                <h1 style={{ color: '#111827' }}>AvaB Education OS</h1>
                <p className="meta">Báo cáo tổng hợp · {periodLabel(period)}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge">📊 {periodLabel(period)}</span>
              <p className="meta" style={{ marginTop: 6 }}>Tạo lúc: {generatedAt}</p>
              <p className="meta">Giáo viên: {teachers} · Học sinh: {students}</p>
            </div>
          </div>

          {/* ── KPIs ───────────────────────────────────────────────── */}
          <div className="kpi-grid">
            {kpis.map((k) => (
              <div key={k.label} className="kpi" style={{ background: k.bg, border: `1px solid ${k.color}22` }}>
                <div className="icon">{k.icon}</div>
                <div className="val" style={{ color: k.color }}>{k.value}</div>
                <div className="lbl" style={{ color: k.color }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* ── Revenue summary ──────────────────────────────────────── */}
          <div className="section">
            <h2>💰 Tài chính</h2>
            <table>
              <thead>
                <tr>
                  <th>Chỉ tiêu</th>
                  <th>Giá trị</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tổng doanh thu ({periodLabel(period)})</td>
                  <td><strong>{revenue.toLocaleString('vi-VN')} ₫</strong></td>
                  <td>Đã thu từ học phí</td>
                </tr>
                <tr>
                  <td>Số khoản đã đóng</td>
                  <td>{fmtNum(paidCount)}</td>
                  <td>Hóa đơn đã thanh toán</td>
                </tr>
                <tr>
                  <td>Trung bình / khoản</td>
                  <td>{paidCount > 0 ? fmtVND(Math.round(revenue / paidCount)) : '—'} ₫</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Top courses by enrollment ────────────────────────────── */}
          <div className="section">
            <h2>📚 Khóa học (theo số học sinh)</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên khóa học</th>
                  <th>Mã</th>
                  <th>Học sinh</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((c, i) => {
                  const max = topCourses[0]?._count.enrollments ?? 1
                  const pct = Math.round((c._count.enrollments / Math.max(max, 1)) * 100)
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: '#951F3D' }}>{i + 1}</td>
                      <td>{c.name}</td>
                      <td><code style={{ fontSize: 11, background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>{c.code}</code></td>
                      <td>{fmtNum(c._count.enrollments)}</td>
                      <td>
                        <span className="bar-wrap">
                          <span className="bar-fill" style={{ width: `${pct}%` }} />
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {topCourses.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── CRM / Registration summary ───────────────────────────── */}
          <div className="section">
            <h2>📋 CRM — Leads & Tuyển sinh</h2>
            <table>
              <thead>
                <tr>
                  <th>Trạng thái</th>
                  <th>Số lượng</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { status: 'NEW',      label: 'Mới',         color: '#2563eb' },
                  { status: 'FOLLOWUP', label: 'Follow-up',   color: '#d97706' },
                  { status: 'WON',      label: 'Đã đăng ký',  color: '#16a34a' },
                  { status: 'LOST',     label: 'Không đăng ký', color: '#dc2626' },
                ].map(row => {
                  const count = regMap[row.status] ?? 0
                  const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
                  return (
                    <tr key={row.status}>
                      <td>
                        <span className="pill" style={{ background: row.color + '18', color: row.color }}>
                          {row.label}
                        </span>
                      </td>
                      <td>{fmtNum(count)}</td>
                      <td>
                        <span className="bar-wrap">
                          <span className="bar-fill" style={{ width: `${pct}%`, background: row.color }} />
                        </span>
                        {' '}{pct}%
                      </td>
                    </tr>
                  )
                })}
                <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                  <td><strong>Tổng leads</strong></td>
                  <td><strong>{fmtNum(totalLeads)}</strong></td>
                  <td><strong>Tỷ lệ chuyển đổi: {convRate}%</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Student performance top 10 ───────────────────────────── */}
          <div className="section">
            <h2>🏆 Top 10 học sinh (XP)</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Học sinh</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Biểu đồ</th>
                </tr>
              </thead>
              <tbody>
                {userStatsTop.map((s, i) => {
                  const maxXp = userStatsTop[0]?.xp ?? 1
                  const pct = Math.round((s.xp / Math.max(maxXp, 1)) * 100)
                  const medals = ['🥇', '🥈', '🥉']
                  return (
                    <tr key={s.userId}>
                      <td style={{ fontWeight: 800, fontSize: 16 }}>{medals[i] ?? `#${i + 1}`}</td>
                      <td>{s.user?.name ?? '—'}</td>
                      <td>
                        <span className="pill" style={{ background: '#FFF7F9', color: '#951F3D' }}>
                          Lv.{s.level}
                        </span>
                      </td>
                      <td><strong>{fmtNum(s.xp)}</strong></td>
                      <td>
                        <span className="bar-wrap">
                          <span className="bar-fill" style={{ width: `${pct}%` }} />
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {userStatsTop.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 32, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="meta">© {new Date().getFullYear()} AvaB Education OS · Báo cáo tự động</p>
            <p className="meta">Tổng học sinh: {fmtNum(students)} · Giáo viên: {fmtNum(teachers)}</p>
          </div>

          {/* ── Print button bottom ──────────────────────────────────── */}
          <div className="no-print" style={{ marginTop: 24, textAlign: 'center' }}>
            <PrintButton />
          </div>

        </div>

        {/* Inline print trigger script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.querySelectorAll('button').forEach(b => {
                if (b.textContent.includes('In báo cáo')) {
                  b.addEventListener('click', function() { window.print(); });
                }
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
