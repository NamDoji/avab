'use client'

import { useState } from 'react'

interface PeriodSlot {
  period: number
  start: string
  end: string
}

interface SubjectEntry {
  code: string
  name: string
  count: number
}

interface LevelConfig {
  id?: string
  level: string
  levelName: string
  periodsPerDay: number
  periodDuration: number
  breakAfterPeriod: number | null
  startTime: string
  workingDays: number[]
  periodSchedule: PeriodSlot[]
  subjectsPerWeek: Record<string, number>
}

interface LevelConfigFormProps {
  config: LevelConfig
}

const DAY_LABELS: Record<number, string> = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 7: 'CN' }
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7]

const SUBJECT_PRESETS: Record<string, SubjectEntry[]> = {
  MN: [
    { code: 'GENERAL', name: 'Giáo dục chung', count: 4 },
    { code: 'MUSIC', name: 'Âm nhạc', count: 2 },
    { code: 'ART', name: 'Mỹ thuật', count: 2 },
    { code: 'PE', name: 'Thể chất', count: 2 },
  ],
  TH: [
    { code: 'MATH', name: 'Toán', count: 5 },
    { code: 'VIET', name: 'Tiếng Việt', count: 5 },
    { code: 'ENGLISH', name: 'Tiếng Anh', count: 4 },
    { code: 'SCIENCE', name: 'Khoa học', count: 2 },
    { code: 'ART', name: 'Mỹ thuật', count: 1 },
    { code: 'MUSIC', name: 'Âm nhạc', count: 1 },
    { code: 'PE', name: 'Thể chất', count: 2 },
  ],
  THCS: [
    { code: 'MATH', name: 'Toán', count: 5 },
    { code: 'LIT', name: 'Ngữ văn', count: 4 },
    { code: 'ENGLISH', name: 'Tiếng Anh', count: 4 },
    { code: 'PHYSICS', name: 'Vật lý', count: 3 },
    { code: 'CHEMISTRY', name: 'Hóa học', count: 2 },
    { code: 'BIOLOGY', name: 'Sinh học', count: 2 },
    { code: 'HISTORY', name: 'Lịch sử', count: 2 },
    { code: 'GEO', name: 'Địa lý', count: 2 },
    { code: 'PE', name: 'Thể dục', count: 2 },
  ],
  THPT: [
    { code: 'MATH', name: 'Toán', count: 5 },
    { code: 'LIT', name: 'Ngữ văn', count: 4 },
    { code: 'ENGLISH', name: 'Tiếng Anh', count: 4 },
    { code: 'PHYSICS', name: 'Vật lý', count: 3 },
    { code: 'CHEMISTRY', name: 'Hóa học', count: 3 },
    { code: 'BIOLOGY', name: 'Sinh học', count: 2 },
    { code: 'HISTORY', name: 'Lịch sử', count: 2 },
    { code: 'GEO', name: 'Địa lý', count: 2 },
    { code: 'PE', name: 'Thể dục', count: 2 },
    { code: 'CIVIC', name: 'GDCD', count: 1 },
  ],
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function generateSchedule(startTime: string, periodsPerDay: number, periodDuration: number, breakAfterPeriod: number | null): PeriodSlot[] {
  const slots: PeriodSlot[] = []
  let current = startTime
  for (let i = 1; i <= periodsPerDay; i++) {
    const start = current
    const end = addMinutes(current, periodDuration)
    slots.push({ period: i, start, end })
    // Gap between periods
    const gap = (breakAfterPeriod && i === breakAfterPeriod) ? 20 : 5
    current = addMinutes(end, gap)
  }
  return slots
}

export default function LevelConfigForm({ config: initialConfig }: LevelConfigFormProps) {
  const [cfg, setCfg] = useState<LevelConfig>(() => ({
    ...initialConfig,
    periodSchedule: initialConfig.periodSchedule.length > 0
      ? initialConfig.periodSchedule
      : generateSchedule(initialConfig.startTime, initialConfig.periodsPerDay, initialConfig.periodDuration, initialConfig.breakAfterPeriod),
  }))

  const [subjects, setSubjects] = useState<SubjectEntry[]>(() => {
    const sw = initialConfig.subjectsPerWeek
    if (Object.keys(sw).length > 0) {
      return Object.entries(sw).map(([code, count]) => {
        const preset = (SUBJECT_PRESETS[initialConfig.level] ?? []).find(s => s.code === code)
        return { code, name: preset?.name ?? code, count: count as number }
      })
    }
    return SUBJECT_PRESETS[initialConfig.level] ?? []
  })

  const [newSubjectCode, setNewSubjectCode] = useState('')
  const [newSubjectName, setNewSubjectName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDay = (day: number) => {
    setCfg(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort(),
    }))
  }

  const recalcSchedule = (next: Partial<LevelConfig>) => {
    const merged = { ...cfg, ...next }
    setCfg({
      ...merged,
      periodSchedule: generateSchedule(merged.startTime, merged.periodsPerDay, merged.periodDuration, merged.breakAfterPeriod),
    })
  }

  const updatePeriodTime = (idx: number, field: 'start' | 'end', val: string) => {
    const newSchedule = [...cfg.periodSchedule]
    newSchedule[idx] = { ...newSchedule[idx], [field]: val }
    setCfg(prev => ({ ...prev, periodSchedule: newSchedule }))
  }

  const addSubject = () => {
    if (!newSubjectCode || !newSubjectName) return
    setSubjects(prev => [...prev, { code: newSubjectCode.toUpperCase(), name: newSubjectName, count: 1 }])
    setNewSubjectCode('')
    setNewSubjectName('')
  }

  const removeSubject = (code: string) => {
    setSubjects(prev => prev.filter(s => s.code !== code))
  }

  const updateSubjectCount = (code: string, count: number) => {
    setSubjects(prev => prev.map(s => s.code === code ? { ...s, count } : s))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const subjectsPerWeek: Record<string, number> = {}
      subjects.forEach(s => { subjectsPerWeek[s.code] = s.count })

      const payload = {
        level: cfg.level,
        levelName: cfg.levelName,
        periodsPerDay: cfg.periodsPerDay,
        periodDuration: cfg.periodDuration,
        breakAfterPeriod: cfg.breakAfterPeriod,
        startTime: cfg.startTime,
        workingDays: cfg.workingDays,
        periodSchedule: cfg.periodSchedule,
        subjectsPerWeek,
      }

      const res = await fetch('/api/admin/erp/timetable/settings/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) throw new Error(data.error ?? 'Lỗi lưu cấu hình')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  }

  const smallInput: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '4px 8px',
    fontSize: 13,
    outline: 'none',
    width: 70,
    textAlign: 'center',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Basic Config */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Số tiết/ngày</label>
          <input
            type="number"
            min={1}
            max={12}
            value={cfg.periodsPerDay}
            onChange={e => recalcSchedule({ periodsPerDay: parseInt(e.target.value) || 5 })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Thời lượng (phút)</label>
          <input
            type="number"
            min={15}
            max={90}
            value={cfg.periodDuration}
            onChange={e => recalcSchedule({ periodDuration: parseInt(e.target.value) || 45 })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Giờ bắt đầu</label>
          <input
            type="time"
            value={cfg.startTime}
            onChange={e => recalcSchedule({ startTime: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Nghỉ giải lao sau tiết</label>
          <input
            type="number"
            min={1}
            max={cfg.periodsPerDay - 1}
            value={cfg.breakAfterPeriod ?? ''}
            placeholder="Không"
            onChange={e => recalcSchedule({ breakAfterPeriod: e.target.value ? parseInt(e.target.value) : null })}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Working Days */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Ngày học</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALL_DAYS.map(day => {
            const active = cfg.workingDays.includes(day)
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `1px solid ${active ? '#6366f1' : '#e2e8f0'}`,
                  background: active ? '#6366f1' : '#fff',
                  color: active ? '#fff' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {active ? '✅' : '⬜'} {DAY_LABELS[day]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Period Schedule */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Lịch tiết học</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cfg.periodSchedule.map((slot, idx) => (
            <div key={slot.period} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', width: 48, flexShrink: 0 }}>Tiết {slot.period}</span>
              <input
                type="time"
                value={slot.start}
                onChange={e => updatePeriodTime(idx, 'start', e.target.value)}
                style={{ ...smallInput, width: 90 }}
              />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
              <input
                type="time"
                value={slot.end}
                onChange={e => updatePeriodTime(idx, 'end', e.target.value)}
                style={{ ...smallInput, width: 90 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Subjects per Week */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>Số tiết/tuần theo môn</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {subjects.map(s => (
            <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', flex: 1 }}>{s.name}</span>
              <input
                type="number"
                min={0}
                max={15}
                value={s.count}
                onChange={e => updateSubjectCount(s.code, parseInt(e.target.value) || 0)}
                style={smallInput}
              />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>tiết</span>
              <button
                type="button"
                onClick={() => removeSubject(s.code)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            type="text"
            placeholder="Mã môn (VD: MATH)"
            value={newSubjectCode}
            onChange={e => setNewSubjectCode(e.target.value)}
            style={{ ...inputStyle, width: 130 }}
          />
          <input
            type="text"
            placeholder="Tên môn"
            value={newSubjectName}
            onChange={e => setNewSubjectName(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="button"
            onClick={addSubject}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #6366f1',
              background: '#6366f1',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            + Thêm môn
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: saving ? '#94a3b8' : '#6366f1',
            color: '#fff',
            fontSize: 14,
            fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {saving ? '⏳ Đang lưu...' : '💾 Lưu cấu hình'}
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>✅ Đã lưu thành công!</span>
        )}
        {error && (
          <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 700 }}>❌ {error}</span>
        )}
      </div>
    </div>
  )
}
