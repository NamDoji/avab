'use client'

import Link from 'next/link'

interface CellData {
  line1: string
  line2: string
  line3?: string
}

interface PrintGroup {
  id: string
  name: string
  grid: Record<number, Record<number, CellData>>
}

interface PrintData {
  versionId: string
  versionName: string
  viewType: 'class' | 'teacher' | 'room'
  groups: PrintGroup[]
  workingDays: number[]
  maxPeriods: number
  dayLabels: string[]
  versions: Array<{ id: string; name: string; status: string }>
}

const VIEW_TYPE_LABELS: Record<string, string> = {
  class: 'Theo lớp',
  teacher: 'Theo giáo viên',
  room: 'Theo phòng học',
}

export default function PrintClient({ data }: { data: PrintData }) {
  const { versionId, versionName, viewType, groups, workingDays, maxPeriods, dayLabels, versions } = data

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { page-break-after: always; }
          body { margin: 0; padding: 0; font-size: 11px; }
          .print-header { font-size: 14px; font-weight: 900; margin-bottom: 8px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 4px 6px; font-size: 10px; }
          th { background: #f1f5f9; }
          .timetable-cell { min-height: 40px; }
          @page { size: A4 landscape; margin: 1cm; }
        }
      `}</style>

      {/* No-print header bar */}
      <div className="no-print" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <Link href="/admin/erp/timetable" style={{
          color: '#93c5fd', fontSize: 13, textDecoration: 'none', fontWeight: 700,
        }}>
          ← TKB
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>🖨️ In Thời khóa biểu</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{versionName} — {VIEW_TYPE_LABELS[viewType]}</div>
        </div>

        {/* View type switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['class', 'teacher', 'room'] as const).map(t => (
            <a
              key={t}
              href={`/admin/erp/timetable/print?type=${t}&versionId=${versionId}`}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: viewType === t ? '#6366f1' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                textDecoration: 'none',
                border: 'none',
              }}
            >
              {VIEW_TYPE_LABELS[t]}
            </a>
          ))}
        </div>

        {/* Version switcher */}
        <select
          defaultValue={versionId}
          onChange={e => {
            window.location.href = `/admin/erp/timetable/print?type=${viewType}&versionId=${e.target.value}`
          }}
          style={{
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: 12,
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
          }}
        >
          {versions.map(v => (
            <option key={v.id} value={v.id} style={{ color: '#1e293b', background: '#fff' }}>
              {v.status === 'published' ? '✅' : '📝'} {v.name.length > 30 ? v.name.slice(0, 30) + '…' : v.name}
            </option>
          ))}
        </select>

        <a
          href={`/api/admin/erp/timetable/export?versionId=${versionId}&format=xlsx&groupBy=${viewType}`}
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

        <button
          type="button"
          onClick={handlePrint}
          style={{
            padding: '7px 16px',
            borderRadius: 8,
            background: '#4338ca',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          🖨️ In TKB
        </button>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 60, background: '#f8fafc', minHeight: '100vh' }}>
        {groups.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            Không có dữ liệu để in cho loại xem này
          </div>
        ) : (
          groups.map((group, gi) => (
            <div
              key={group.id}
              className="print-page"
              style={{
                margin: '16px auto',
                maxWidth: 900,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              {/* Group header */}
              <div style={{
                padding: '12px 20px',
                background: 'linear-gradient(90deg, #4338ca, #6366f1)',
                color: '#fff',
              }}>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>
                  {VIEW_TYPE_LABELS[viewType]} • {versionName}
                </div>
                <div className="print-header" style={{ fontSize: 16, fontWeight: 900 }}>
                  {viewType === 'class' ? '🎓' : viewType === 'teacher' ? '👩‍🏫' : '🏫'} {group.name}
                </div>
              </div>

              {/* Timetable grid */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{
                        padding: '8px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#64748b',
                        background: '#f8fafc',
                        borderBottom: '2px solid #e2e8f0',
                        borderRight: '1px solid #e2e8f0',
                        textAlign: 'center',
                        minWidth: 60,
                      }}>
                        Tiết
                      </th>
                      {workingDays.map(d => (
                        <th key={d} style={{
                          padding: '8px 12px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#1e293b',
                          background: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                          borderRight: '1px solid #e2e8f0',
                          textAlign: 'center',
                          minWidth: 100,
                        }}>
                          {dayLabels[d] ?? `T${d}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: maxPeriods }, (_, pi) => pi + 1).map(period => (
                      <tr key={period} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{
                          padding: '8px 12px',
                          textAlign: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#94a3b8',
                          background: '#fafafa',
                          borderRight: '1px solid #e2e8f0',
                        }}>
                          Tiết {period}
                        </td>
                        {workingDays.map(day => {
                          const cell = group.grid[day]?.[period]
                          return (
                            <td key={day} className="timetable-cell" style={{
                              padding: '8px 10px',
                              verticalAlign: 'top',
                              borderRight: '1px solid #f1f5f9',
                              minWidth: 100,
                              minHeight: 48,
                            }}>
                              {cell ? (
                                <div>
                                  <div style={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: '#1e293b',
                                    lineHeight: 1.3,
                                  }}>
                                    {cell.line1}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#6366f1', marginTop: 2 }}>
                                    {cell.line2}
                                  </div>
                                  {cell.line3 && (
                                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                                      {cell.line3}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ color: '#e2e8f0', fontSize: 18, textAlign: 'center' }}>·</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {gi < groups.length - 1 && (
                <div className="no-print" style={{
                  height: 1, background: '#f1f5f9', margin: '0 20px',
                }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
