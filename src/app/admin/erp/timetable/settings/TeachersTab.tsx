'use client'

import { useState } from 'react'

interface TeacherSubject {
  id: string
  name: string | null
  subjects: string
}

interface AvailabilityRow {
  id: string
  teacherId: string
  dayOfWeek: number
  periodFrom: number
  periodTo: number
  campusId: string | null
  note: string | null
}

interface TeachersTabProps {
  initialTeachers: TeacherSubject[]
}

const SUBJECT_OPTIONS = [
  { code: 'MATH', label: 'Toán' },
  { code: 'LIT', label: 'Ngữ văn' },
  { code: 'VIET', label: 'Tiếng Việt' },
  { code: 'ENGLISH', label: 'Tiếng Anh' },
  { code: 'PHYSICS', label: 'Vật lý' },
  { code: 'CHEMISTRY', label: 'Hóa học' },
  { code: 'BIOLOGY', label: 'Sinh học' },
  { code: 'HISTORY', label: 'Lịch sử' },
  { code: 'GEO', label: 'Địa lý' },
  { code: 'CIVIC', label: 'GDCD' },
  { code: 'PE', label: 'Thể dục' },
  { code: 'MUSIC', label: 'Âm nhạc' },
  { code: 'ART', label: 'Mỹ thuật' },
  { code: 'TECH', label: 'Công nghệ' },
  { code: 'CODING', label: 'Tin học' },
  { code: 'SCIENCE', label: 'Khoa học' },
  { code: 'GENERAL', label: 'Giáo dục chung' },
]

const DAY_LABELS = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MAX_PERIODS = 5 // tiết tối đa mỗi ngày

// Availability grid for a teacher: day × period checkboxes
function AvailabilityGrid({
  teacherId,
  initialRows,
  onClose,
}: {
  teacherId: string
  initialRows: AvailabilityRow[]
  onClose: () => void
}) {
  // Local state: which (day, period) combos are enabled
  // Build a Set of "day-period" strings from initial rows
  const buildEnabled = (rows: AvailabilityRow[]): Set<string> => {
    const s = new Set<string>()
    for (const r of rows) {
      for (let p = r.periodFrom; p <= r.periodTo; p++) {
        s.add(`${r.dayOfWeek}-${p}`)
      }
    }
    return s
  }

  const [enabled, setEnabled] = useState<Set<string>>(() => buildEnabled(initialRows))
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState<string>(initialRows[0]?.note ?? '')

  const toggleCell = (day: number, period: number) => {
    const key = `${day}-${period}`
    setEnabled(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const isEnabled = (day: number, period: number) => enabled.has(`${day}-${period}`)

  const saveAll = async () => {
    setSaving(true)
    try {
      // Delete all existing rows for this teacher first
      for (const row of initialRows) {
        await fetch(`/api/admin/erp/timetable/settings/availability?id=${row.id}`, { method: 'DELETE' })
      }

      // For each day, compute enabled ranges and POST
      for (let day = 1; day <= 7; day++) {
        const enabledPeriods: number[] = []
        for (let p = 1; p <= MAX_PERIODS; p++) {
          if (enabled.has(`${day}-${p}`)) enabledPeriods.push(p)
        }
        if (enabledPeriods.length === 0) continue

        const from = Math.min(...enabledPeriods)
        const to = Math.max(...enabledPeriods)

        await fetch('/api/admin/erp/timetable/settings/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId,
            dayOfWeek: day,
            periodFrom: from,
            periodTo: to,
            note: note || null,
          }),
        })
      }
      onClose()
    } catch {
      // ignore — show in onClose feedback
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      marginTop: 12,
      padding: 16,
      background: '#f8fafc',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
        📅 Lịch có thể dạy theo tiết
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 16, height: 16, borderRadius: 4,
            background: '#22c55e', display: 'inline-block',
          }} />
          ✅ Có thể dạy
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 16, height: 16, borderRadius: 4,
            background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'inline-block',
          }} />
          🚫 Không dạy
        </span>
      </div>

      {/* Grid: cols = days (T2–CN), rows = periods */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 400 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', fontSize: 12, color: '#64748b', textAlign: 'left', fontWeight: 700 }}>
                Tiết
              </th>
              {DAY_LABELS.slice(1).map((d, i) => (
                <th key={i + 1} style={{
                  padding: '6px 8px',
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 700,
                  textAlign: 'center',
                  minWidth: 44,
                }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: MAX_PERIODS }, (_, pi) => pi + 1).map(period => (
              <tr key={period}>
                <td style={{
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#94a3b8',
                }}>
                  Tiết {period}
                </td>
                {Array.from({ length: 7 }, (_, di) => di + 1).map(day => {
                  const active = isEnabled(day, period)
                  return (
                    <td key={day} style={{ textAlign: 'center', padding: '4px 6px' }}>
                      <button
                        type="button"
                        onClick={() => toggleCell(day, period)}
                        title={active ? 'Có thể dạy — nhấn để tắt' : 'Không dạy — nhấn để bật'}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: active ? '2px solid #16a34a' : '1px solid #e2e8f0',
                          background: active ? '#22c55e' : '#f8fafc',
                          cursor: 'pointer',
                          fontSize: 14,
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                        }}
                      >
                        {active ? '✅' : ''}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
          Ghi chú (tuỳ chọn):
        </label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder='VD: "Chỉ dạy sáng", "Nghỉ chiều T4"'
          style={{
            width: '100%',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          type="button"
          onClick={saveAll}
          disabled={saving}
          style={{
            padding: '7px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#6366f1',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? '⏳ Đang lưu...' : '💾 Lưu lịch'}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '7px 16px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#64748b',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  )
}

export default function TeachersTab({ initialTeachers }: TeachersTabProps) {
  const [teachers, setTeachers] = useState<TeacherSubject[]>(initialTeachers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  // Availability expand state
  const [expandedAvailId, setExpandedAvailId] = useState<string | null>(null)
  const [availRows, setAvailRows] = useState<AvailabilityRow[]>([])
  const [loadingAvail, setLoadingAvail] = useState(false)

  const startEdit = (teacher: TeacherSubject) => {
    setEditingId(teacher.id)
    setEditVal(teacher.subjects)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditVal('')
  }

  const saveSubjects = async (id: string) => {
    setSaving(id)
    try {
      await fetch('/api/admin/erp/timetable/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleType: 'teacher_subjects',
          ruleScope: 'teacher',
          scopeValue: id,
          value: { subjects: editVal.split(',').map(s => s.trim()).filter(Boolean) },
          description: `GV ${teachers.find(t => t.id === id)?.name ?? id}: dạy ${editVal}`,
          isActive: true,
        }),
      })
      setTeachers(prev => prev.map(t => t.id === id ? { ...t, subjects: editVal } : t))
      setEditingId(null)
    } catch {
      // ignore — non-critical
    } finally {
      setSaving(null)
    }
  }

  const toggleAvailability = async (teacherId: string) => {
    if (expandedAvailId === teacherId) {
      setExpandedAvailId(null)
      return
    }
    setExpandedAvailId(teacherId)
    setLoadingAvail(true)
    try {
      const res = await fetch(`/api/admin/erp/timetable/settings/availability?teacherId=${teacherId}`)
      const data = await res.json() as { success: boolean; data?: AvailabilityRow[] }
      setAvailRows(data.data ?? [])
    } catch {
      setAvailRows([])
    } finally {
      setLoadingAvail(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: '#eff6ff',
        borderRadius: 12,
        padding: '12px 16px',
        border: '1px solid #bfdbfe',
        fontSize: 13,
        color: '#1e40af',
      }}>
        💡 Cấu hình môn dạy và lịch sẵn sàng giúp AI biết giáo viên nào dạy môn nào, và chỉ xếp TKB đúng khung giờ GV đăng ký.
      </div>

      {/* Subject reference */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Mã môn tham khảo:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUBJECT_OPTIONS.map(s => (
            <span
              key={s.code}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 12,
                background: '#f1f5f9',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              {s.code}: {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Teachers list */}
      {teachers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 14 }}>
          Chưa có giáo viên nào. Thêm giáo viên trong phần Quản lý giáo viên.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {teachers.map(teacher => (
            <div key={teacher.id}>
              {/* Teacher row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: expandedAvailId === teacher.id ? '#f5f3ff' : '#fff',
                borderRadius: expandedAvailId === teacher.id ? '12px 12px 0 0' : 12,
                border: expandedAvailId === teacher.id ? '1px solid #c4b5fd' : '1px solid #e2e8f0',
                borderBottom: expandedAvailId === teacher.id ? 'none' : undefined,
                transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {(teacher.name ?? 'GV').charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    {teacher.name ?? 'Giáo viên'}
                  </div>
                  {editingId === teacher.id ? (
                    <input
                      type="text"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      placeholder="VD: MATH,PHYSICS,SCIENCE (dấu phẩy)"
                      style={{
                        marginTop: 4,
                        border: '1px solid #6366f1',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 12,
                        outline: 'none',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                      autoFocus
                    />
                  ) : (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {teacher.subjects ? `Môn dạy: ${teacher.subjects}` : 'Chưa cấu hình môn dạy'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {editingId === teacher.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveSubjects(teacher.id)}
                        disabled={saving === teacher.id}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#6366f1',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: saving === teacher.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {saving === teacher.id ? '...' : '💾 Lưu'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#64748b',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(teacher)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: '#64748b',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Sửa môn
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAvailability(teacher.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 8,
                          border: `1px solid ${expandedAvailId === teacher.id ? '#7c3aed' : '#e2e8f0'}`,
                          background: expandedAvailId === teacher.id ? '#ede9fe' : '#f8fafc',
                          color: expandedAvailId === teacher.id ? '#7c3aed' : '#64748b',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📅 Lịch dạy
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Availability grid (expanded) */}
              {expandedAvailId === teacher.id && (
                <div style={{
                  borderRadius: '0 0 12px 12px',
                  border: '1px solid #c4b5fd',
                  borderTop: 'none',
                  background: '#fff',
                  padding: '0 16px 16px',
                }}>
                  {loadingAvail ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      ⏳ Đang tải lịch...
                    </div>
                  ) : (
                    <AvailabilityGrid
                      teacherId={teacher.id}
                      initialRows={availRows}
                      onClose={() => setExpandedAvailId(null)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
