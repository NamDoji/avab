'use client'

import { useState, useEffect, useCallback } from 'react'

interface TimetableSlot {
  id: string
  courseId: string
  teacherId: string | null
  roomId: string | null
  dayOfWeek: number
  period: number
  status: string
  course?: { name: string; code: string }
}

interface TimetableVersion {
  id: string
  name: string
  status: string
  score: number | null
  conflicts: number
  generatedAt: string
  slots?: TimetableSlot[]
}

interface VersionCompareApiResponse {
  versions?: TimetableVersion[]
  error?: string
}

interface SlotsFetchResponse {
  slots?: TimetableSlot[]
}

interface PublishResponse {
  version?: TimetableVersion
  error?: string
}

const DAY_LABELS = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const PERIODS = Array.from({ length: 10 }, (_, i) => i + 1)

function SlotCell({ slot, hasConflict }: { slot?: TimetableSlot; hasConflict?: boolean }) {
  if (!slot) {
    return (
      <div style={{
        height: 44,
        borderRadius: 8,
        background: '#f8fafc',
        border: '1px dashed #e2e8f0',
      }} />
    )
  }
  const bg = hasConflict ? '#fef2f2' : '#f0fdf4'
  const border = hasConflict ? '1px solid #fecaca' : '1px solid #bbf7d0'
  const color = hasConflict ? '#dc2626' : '#16a34a'

  return (
    <div style={{
      height: 44,
      borderRadius: 8,
      background: bg,
      border,
      padding: '4px 6px',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {slot.course?.code ?? slot.courseId.slice(0, 8)}
      </div>
      <div style={{ fontSize: 9, color: hasConflict ? '#ef4444' : '#22c55e', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {slot.course?.name ?? ''}
      </div>
    </div>
  )
}

function VersionGrid({ version }: { version: TimetableVersion }) {
  const slots = version.slots ?? []

  // Detect conflicts
  const conflictKeys = new Set<string>()
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]
      const b = slots[j]
      if (a.dayOfWeek !== b.dayOfWeek || a.period !== b.period) continue
      if ((a.teacherId && a.teacherId === b.teacherId) ||
          (a.roomId && a.roomId === b.roomId) ||
          a.courseId === b.courseId) {
        conflictKeys.add(a.id)
        conflictKeys.add(b.id)
      }
    }
  }

  // Build grid: period → day → slot
  const grid: Record<number, Record<number, TimetableSlot>> = {}
  for (const slot of slots) {
    if (!grid[slot.period]) grid[slot.period] = {}
    grid[slot.period][slot.dayOfWeek] = slot
  }

  const days = [1, 2, 3, 4, 5, 6].filter(d =>
    slots.some(s => s.dayOfWeek === d)
  )
  if (days.length === 0) days.push(1, 2, 3, 4, 5)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3 }}>
        <thead>
          <tr>
            <th style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', padding: '4px 6px', textAlign: 'left', width: 40 }}>Tiết</th>
            {days.map(d => (
              <th key={d} style={{ fontSize: 11, fontWeight: 700, color: '#334155', padding: '4px 6px', textAlign: 'center' }}>
                {DAY_LABELS[d] ?? `Ngày ${d}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.slice(0, 8).map(period => (
            <tr key={period}>
              <td style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', padding: '2px 6px', textAlign: 'center', verticalAlign: 'middle' }}>
                {period}
              </td>
              {days.map(day => {
                const slot = grid[period]?.[day]
                return (
                  <td key={day} style={{ padding: 2, verticalAlign: 'top' }}>
                    <SlotCell slot={slot} hasConflict={slot ? conflictKeys.has(slot.id) : false} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TimetableVersionCompare() {
  const [versions, setVersions] = useState<TimetableVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [leftIdx, setLeftIdx] = useState(0)
  const [rightIdx, setRightIdx] = useState(1)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null)

  const fetchVersionSlots = useCallback(async (versionId: string): Promise<TimetableSlot[]> => {
    const res = await fetch(`/api/admin/erp/timetable/slots?versionId=${versionId}`)
    const data = await res.json() as SlotsFetchResponse
    return data.slots ?? []
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/erp/timetable')
        const data = await res.json() as VersionCompareApiResponse
        if (data.versions) {
          // Fetch slots for first 6 versions
          const versionList = data.versions.slice(0, 6)
          const withSlots = await Promise.all(
            versionList.map(async v => ({
              ...v,
              slots: await fetchVersionSlots(v.id),
            }))
          )
          setVersions(withSlots)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [fetchVersionSlots])

  const handlePublish = async (versionId: string) => {
    if (!confirm('Xuất bản phương án này? Các phương án khác sẽ chuyển sang archive.')) return
    setPublishing(versionId)
    try {
      const res = await fetch(`/api/admin/erp/timetable?versionId=${versionId}&action=publish`, {
        method: 'PATCH',
      })
      const data = await res.json() as PublishResponse
      if (data.version) {
        setVersions(prev => prev.map(v => ({
          ...v,
          status: v.id === versionId ? 'published' : v.status === 'published' ? 'archived' : v.status,
        })))
        setPublishSuccess(versionId)
        setTimeout(() => setPublishSuccess(null), 3000)
      }
    } catch {
      // ignore
    } finally {
      setPublishing(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14 }}>
        ⏳ Đang tải phương án...
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px',
        background: '#f8fafc',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
          Chưa có phương án nào. Tạo TKB trước để so sánh.
        </p>
      </div>
    )
  }

  const leftVersion = versions[leftIdx]
  const rightVersion = versions[rightIdx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Version Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
            Phương án A
          </label>
          <select
            value={leftIdx}
            onChange={e => setLeftIdx(parseInt(e.target.value))}
            style={{
              width: '100%',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              outline: 'none',
            }}
          >
            {versions.map((v, idx) => (
              <option key={v.id} value={idx}>{v.name}</option>
            ))}
          </select>
        </div>
        {/* Right */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
            Phương án B
          </label>
          <select
            value={rightIdx}
            onChange={e => setRightIdx(parseInt(e.target.value))}
            style={{
              width: '100%',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              outline: 'none',
            }}
          >
            {versions.map((v, idx) => (
              <option key={v.id} value={idx}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Compare Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[leftVersion, rightVersion].map((v, colIdx) => v ? (
          <div
            key={v.id}
            style={{
              background: '#fff',
              borderRadius: 16,
              border: `2px solid ${v.status === 'published' ? '#22c55e' : '#e2e8f0'}`,
              overflow: 'hidden',
            }}
          >
            {/* Version Header */}
            <div style={{
              padding: '14px 16px',
              background: v.status === 'published' ? '#f0fdf4' : '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 2 }}>
                    {v.name}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: v.conflicts === 0 ? '#f0fdf4' : '#fef2f2',
                      color: v.conflicts === 0 ? '#16a34a' : '#dc2626',
                      fontWeight: 700,
                    }}>
                      {v.conflicts === 0 ? '✅' : '❌'} {v.conflicts} xung đột
                    </span>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 700,
                    }}>
                      📊 {v.score?.toFixed(0) ?? 'N/A'} điểm
                    </span>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: v.status === 'published' ? '#f0fdf4' : '#f8fafc',
                      color: v.status === 'published' ? '#16a34a' : '#94a3b8',
                      fontWeight: 700,
                    }}>
                      {v.status === 'published' ? '🟢 Đang dùng' : v.status === 'draft' ? '📝 Nháp' : '📦 Lưu trữ'}
                    </span>
                  </div>
                </div>
                {v.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() => handlePublish(v.id)}
                    disabled={publishing === v.id}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: publishing === v.id ? '#94a3b8' : '#6366f1',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: publishing === v.id ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {publishing === v.id ? '⏳...' : publishSuccess === v.id ? '✅ Đã xuất bản!' : '🚀 Chọn phương án này'}
                  </button>
                )}
                {v.status === 'published' && (
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 800 }}>
                    ✅ Đang sử dụng
                  </span>
                )}
              </div>
            </div>

            {/* Grid */}
            <div style={{ padding: 12 }}>
              <VersionGrid version={v} />
            </div>

            {/* Stats */}
            <div style={{
              padding: '10px 16px',
              background: '#fafafa',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: 16,
            }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                📋 {(v.slots ?? []).length} tiết
              </span>
              <span style={{ fontSize: 11, color: colIdx === 0 ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
                🟢 Sạch: {(v.slots ?? []).length - v.conflicts * 2} tiết
              </span>
              <span style={{ fontSize: 11, color: v.conflicts > 0 ? '#dc2626' : '#94a3b8', fontWeight: 600 }}>
                🔴 Xung đột: {v.conflicts}
              </span>
            </div>
          </div>
        ) : null)}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#f0fdf4', border: '1px solid #bbf7d0' }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>Tiết bình thường</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#fef2f2', border: '1px solid #fecaca' }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>Xung đột</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#f8fafc', border: '1px dashed #e2e8f0' }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>Trống</span>
        </div>
      </div>
    </div>
  )
}
