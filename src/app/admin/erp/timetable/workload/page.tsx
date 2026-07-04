import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Báo cáo Workload Giáo viên — TKB School ERP' }

const DAY_LABELS = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function balanceScore(distribution: number[]): number {
  const nonZero = distribution.filter(d => d > 0)
  if (nonZero.length === 0) return 100
  const avg = nonZero.reduce((a, b) => a + b, 0) / nonZero.length
  const variance = nonZero.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / nonZero.length
  return Math.max(0, Math.round(100 - variance * 10))
}

function BalanceBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const color = value === 0 ? '#e2e8f0' : value >= 4 ? '#f59e0b' : '#22c55e'
  return (
    <div style={{
      display: 'inline-block',
      width: 28,
      height: 24,
      background: '#f1f5f9',
      borderRadius: 4,
      position: 'relative',
      verticalAlign: 'bottom',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${pct}%`,
        background: color,
        transition: 'height 0.3s',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 700,
        color: value === 0 ? '#94a3b8' : '#fff',
        mixBlendMode: 'difference',
      }}>
        {value || '—'}
      </div>
    </div>
  )
}

export default async function WorkloadPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  // Find published version (or latest draft if none published)
  const org = await prisma.organization.findFirst({ where: { slug: 'ob-school' } })
  const organizationId = org?.id ?? 'ob-school'

  const publishedVersion = await prisma.timetableVersion.findFirst({
    where: { organizationId, status: 'published' },
    orderBy: { publishedAt: 'desc' },
  }) ?? await prisma.timetableVersion.findFirst({
    where: { organizationId },
    orderBy: { generatedAt: 'desc' },
  })

  const versions = await prisma.timetableVersion.findMany({
    where: { organizationId },
    orderBy: { generatedAt: 'desc' },
    take: 10,
    select: { id: true, name: true, status: true, score: true, generatedAt: true },
  })

  let workloadData: Array<{
    teacherId: string
    teacherName: string
    totalPeriods: number
    perDay: Record<number, number>
    distribution: number[]
    maxPerDay: number
    minPerDay: number
    gapDays: number
    balance: number
  }> = []

  let totalTeachers = 0
  let avgPerWeek = 0
  let mostLoadedName = ''
  let mostLoadedPeriods = 0
  let leastLoadedName = ''
  let leastLoadedPeriods = Infinity

  if (publishedVersion) {
    const slots = await prisma.timetableSlot.findMany({
      where: { versionId: publishedVersion.id },
      select: { teacherId: true, dayOfWeek: true, period: true },
    })

    // Get teacher names
    const teacherIdsSet = new Set(slots.map(s => s.teacherId).filter(Boolean) as string[])
    const teacherIds = [...teacherIdsSet]
    const users = teacherIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: teacherIds } },
          select: { id: true, name: true },
        })
      : []
    const userMap = new Map(users.map(u => [u.id, u.name ?? u.id]))

    // Group slots by teacher
    const grouped = new Map<string, typeof slots>()
    for (const s of slots) {
      if (!s.teacherId) continue
      if (!grouped.has(s.teacherId)) grouped.set(s.teacherId, [])
      grouped.get(s.teacherId)!.push(s)
    }

    for (const [teacherId, teacherSlots] of grouped) {
      const perDay: Record<number, number> = {}
      for (let d = 1; d <= 7; d++) perDay[d] = 0
      for (const s of teacherSlots) {
        perDay[s.dayOfWeek] = (perDay[s.dayOfWeek] ?? 0) + 1
      }
      const distribution = [1, 2, 3, 4, 5, 6, 7].map(d => perDay[d] ?? 0)
      const activeDays = distribution.filter(v => v > 0)
      const maxPerDay = activeDays.length > 0 ? Math.max(...activeDays) : 0
      const minPerDay = activeDays.length > 0 ? Math.min(...activeDays) : 0
      const gapDays = distribution.filter(v => v === 0).length
      const balance = balanceScore(distribution)
      const totalPeriods = teacherSlots.length

      workloadData.push({
        teacherId,
        teacherName: userMap.get(teacherId) ?? teacherId,
        totalPeriods,
        perDay,
        distribution,
        maxPerDay,
        minPerDay,
        gapDays,
        balance,
      })
    }

    workloadData.sort((a, b) => b.totalPeriods - a.totalPeriods)
    totalTeachers = workloadData.length
    if (totalTeachers > 0) {
      avgPerWeek = Math.round(workloadData.reduce((s, t) => s + t.totalPeriods, 0) / totalTeachers)
      mostLoadedName = workloadData[0].teacherName
      mostLoadedPeriods = workloadData[0].totalPeriods
      const least = workloadData[workloadData.length - 1]
      leastLoadedName = least.teacherName
      leastLoadedPeriods = least.totalPeriods
    }
  }

  const hasData = workloadData.length > 0

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: '#fff',
        padding: '48px 0 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          transform: 'translate(25%, -50%)',
          pointerEvents: 'none',
        }} />
        <div className="container-custom" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#93c5fd', marginBottom: 8 }}>
            <Link href="/admin/erp" style={{ color: 'inherit', textDecoration: 'none' }}>School ERP</Link>
            <span>/</span>
            <Link href="/admin/erp/timetable" style={{ color: 'inherit', textDecoration: 'none' }}>Thời khóa biểu</Link>
            <span>/</span>
            <span>Báo cáo Workload</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>📊 Workload Giáo viên</h1>
          <p style={{ color: '#bfdbfe', fontSize: 14, margin: 0 }}>
            Phân tích số tiết và mức độ cân bằng tải của từng giáo viên trong TKB
          </p>
        </div>
      </div>

      <div className="container-custom" style={{ padding: '32px 16px' }}>
        {/* Version selector */}
        {versions.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>📋 Phiên bản TKB:</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {versions.map(v => (
                <Link
                  key={v.id}
                  href={`/admin/erp/timetable/workload?versionId=${v.id}`}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    border: '1px solid #e2e8f0',
                    background: v.id === publishedVersion?.id ? '#eff6ff' : '#f8fafc',
                    color: v.id === publishedVersion?.id ? '#2563eb' : '#64748b',
                    textDecoration: 'none',
                  }}
                >
                  {v.status === 'published' ? '✅ ' : v.status === 'draft' ? '📝 ' : '🗄️ '}
                  {v.name.length > 30 ? v.name.slice(0, 30) + '…' : v.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!publishedVersion ? (
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 48,
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: 8 }}>Chưa có TKB nào</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Tạo và xuất bản TKB để xem báo cáo workload giáo viên
            </p>
            <Link
              href="/admin/erp/timetable"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                borderRadius: 10,
                background: '#4338ca',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              ← Về trang TKB
            </Link>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}>
              {[
                { label: 'Tổng giáo viên', value: totalTeachers, icon: '👩‍🏫', color: '#6366f1' },
                { label: 'TB tiết/tuần', value: avgPerWeek, icon: '📚', color: '#0ea5e9' },
                { label: 'Nhiều nhất', value: `${mostLoadedPeriods} tiết`, sub: mostLoadedName, icon: '🔥', color: '#f59e0b' },
                { label: 'Ít nhất', value: `${leastLoadedPeriods === Infinity ? 0 : leastLoadedPeriods} tiết`, sub: leastLoadedName, icon: '💤', color: '#22c55e' },
              ].map(card => (
                <div key={card.label} style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '20px 24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: card.color, lineHeight: 1 }}>
                    {card.value}
                  </div>
                  {card.sub && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{card.sub}</div>
                  )}
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Workload table */}
            {!hasData ? (
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 32,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                color: '#94a3b8',
                fontSize: 14,
              }}>
                Phiên bản này chưa có dữ liệu phân công giáo viên
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: 20,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                {/* Table header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    Chi tiết workload — {publishedVersion.name}
                  </h2>
                  <a
                    href={`/api/admin/erp/timetable/export?versionId=${publishedVersion.id}&format=xlsx&groupBy=teacher`}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 8,
                      background: '#16a34a',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    📤 Xuất Excel
                  </a>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['Giáo viên', 'Tổng tiết', ...DAY_LABELS.slice(1), 'Max/ngày', 'Ngày trống', 'Balance'].map((h, i) => (
                          <th key={i} style={{
                            padding: '10px 12px',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#64748b',
                            textAlign: i === 0 ? 'left' : 'center',
                            borderBottom: '1px solid #e2e8f0',
                            whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workloadData.map((row, idx) => (
                        <tr key={row.teacherId} style={{
                          background: idx % 2 === 0 ? '#fff' : '#fafafa',
                          borderBottom: '1px solid #f1f5f9',
                        }}>
                          <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 800,
                                flexShrink: 0,
                              }}>
                                {row.teacherName.charAt(0)}
                              </div>
                              {row.teacherName}
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: 15, fontWeight: 900, color: '#4338ca' }}>
                            {row.totalPeriods}
                          </td>
                          {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <td key={d} style={{ padding: '8px 6px', textAlign: 'center' }}>
                              <BalanceBar value={row.perDay[d] ?? 0} max={6} />
                            </td>
                          ))}
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: row.maxPerDay >= 5 ? '#dc2626' : '#1e293b' }}>
                            {row.maxPerDay}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: 13, color: row.gapDays >= 3 ? '#f59e0b' : '#64748b' }}>
                            {row.gapDays}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                              background: row.balance >= 80 ? '#dcfce7' : row.balance >= 60 ? '#fef9c3' : '#fee2e2',
                              color: row.balance >= 80 ? '#16a34a' : row.balance >= 60 ? '#92400e' : '#dc2626',
                            }}>
                              {row.balance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: 20,
                  flexWrap: 'wrap',
                  fontSize: 12,
                  color: '#64748b',
                }}>
                  <span>🟩 ≤3 tiết/ngày (cân bằng)</span>
                  <span>🟨 4 tiết/ngày (chấp nhận được)</span>
                  <span>🟥 ≥5 tiết/ngày (quá tải)</span>
                  <span>Balance 80+ = tốt | 60-79 = khá | &lt;60 = cần điều chỉnh</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Link
                href="/admin/erp/timetable"
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#64748b',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                ← Quay lại TKB
              </Link>
              <Link
                href={`/admin/erp/timetable/print?type=teacher`}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: '#4338ca',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                🖨️ In TKB theo GV
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
