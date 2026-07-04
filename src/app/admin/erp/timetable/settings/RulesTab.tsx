'use client'

import { useState } from 'react'

interface TimetableRule {
  id: string
  ruleType: string
  ruleScope: string
  scopeValue: string | null
  value: Record<string, unknown>
  isActive: boolean
  description: string | null
}

interface RulesTabProps {
  initialRules: TimetableRule[]
}

const RULE_TYPES = [
  { value: 'teacher_max_periods', label: 'Số tiết tối đa/ngày/GV', valueType: 'number', valueName: 'maxPeriods', defaultVal: 6 },
  { value: 'no_double_subject', label: 'Không xếp 2 tiết cùng môn liên tiếp', valueType: 'boolean', valueName: 'enabled', defaultVal: true },
  { value: 'prefer_morning_core', label: 'Ưu tiên tiết đầu buổi cho môn chính', valueType: 'boolean', valueName: 'preferMorning', defaultVal: true },
  { value: 'separate_exam_days', label: 'Tách môn thi theo ngày khác nhau', valueType: 'boolean', valueName: 'enabled', defaultVal: true },
  { value: 'no_split_sessions', label: 'GV không dạy 2 ca sáng chiều cùng ngày', valueType: 'boolean', valueName: 'enabled', defaultVal: true },
  { value: 'mn_max_time', label: 'Lớp mầm non không học sau 11:30', valueType: 'time', valueName: 'maxTime', defaultVal: '11:30' },
]

const SCOPE_LABELS: Record<string, string> = {
  all: 'Tất cả',
  level: 'Cấp học',
  teacher: 'Giáo viên',
  class: 'Lớp học',
}

export default function RulesTab({ initialRules }: RulesTabProps) {
  const [rules, setRules] = useState<TimetableRule[]>(initialRules)
  const [selectedType, setSelectedType] = useState(RULE_TYPES[0].value)
  const [numberVal, setNumberVal] = useState(6)
  const [timeVal, setTimeVal] = useState('11:30')
  const [description, setDescription] = useState('')
  const [adding, setAdding] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentRuleType = RULE_TYPES.find(r => r.value === selectedType)!

  const buildValue = (): Record<string, unknown> => {
    if (currentRuleType.valueType === 'number') return { [currentRuleType.valueName]: numberVal }
    if (currentRuleType.valueType === 'time') return { [currentRuleType.valueName]: timeVal }
    return { [currentRuleType.valueName]: true }
  }

  const buildDescription = (): string => {
    if (description) return description
    if (currentRuleType.valueType === 'number') return `${currentRuleType.label}: tối đa ${numberVal} tiết`
    if (currentRuleType.valueType === 'time') return `${currentRuleType.label}: ${timeVal}`
    return currentRuleType.label
  }

  const handleAdd = async () => {
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/erp/timetable/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleType: selectedType,
          ruleScope: 'all',
          value: buildValue(),
          description: buildDescription(),
          isActive: true,
        }),
      })
      const data = await res.json() as { success: boolean; data?: TimetableRule; error?: string }
      if (!data.success) throw new Error(data.error)
      if (data.data) {
        setRules(prev => [data.data!, ...prev])
        setDescription('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm quy tắc')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (id: string, currentActive: boolean) => {
    setToggling(id)
    try {
      const res = await fetch('/api/admin/erp/timetable/settings/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) throw new Error(data.error)
      setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !currentActive } : r))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật quy tắc')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa quy tắc này?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/erp/timetable/settings/rules?id=${id}`, { method: 'DELETE' })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) throw new Error(data.error)
      setRules(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa quy tắc')
    } finally {
      setDeleting(null)
    }
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Add Rule Form */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        border: '1px solid #e2e8f0',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#334155', margin: '0 0 16px' }}>
          ➕ Thêm quy tắc mới
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Loại quy tắc</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              style={inputStyle}
            >
              {RULE_TYPES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {currentRuleType.valueType === 'number' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Giá trị (số tiết)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={numberVal}
                onChange={e => setNumberVal(parseInt(e.target.value) || 6)}
                style={inputStyle}
              />
            </div>
          )}

          {currentRuleType.valueType === 'time' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Giờ giới hạn</label>
              <input
                type="time"
                value={timeVal}
                onChange={e => setTimeVal(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ gridColumn: currentRuleType.valueType === 'boolean' ? '1 / -1' : 'auto' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Mô tả (tùy chọn)</label>
            <input
              type="text"
              placeholder="Mô tả chi tiết quy tắc..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
        {error && (
          <p style={{ fontSize: 12, color: '#ef4444', margin: '12px 0 0', fontWeight: 600 }}>❌ {error}</p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          style={{
            marginTop: 14,
            padding: '9px 20px',
            borderRadius: 10,
            border: 'none',
            background: adding ? '#94a3b8' : '#6366f1',
            color: '#fff',
            fontSize: 13,
            fontWeight: 800,
            cursor: adding ? 'not-allowed' : 'pointer',
          }}
        >
          {adding ? '⏳ Đang thêm...' : '➕ Thêm quy tắc'}
        </button>
      </div>

      {/* Rules List */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#334155', margin: '0 0 12px' }}>
          📋 Quy tắc hiện tại ({rules.length})
        </h3>
        {rules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: 14 }}>
            Chưa có quy tắc nào. Thêm quy tắc ở trên.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map(rule => (
              <div
                key={rule.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: rule.isActive ? '#fff' : '#f8fafc',
                  borderRadius: 12,
                  border: `1px solid ${rule.isActive ? '#e2e8f0' : '#f1f5f9'}`,
                  opacity: rule.isActive ? 1 : 0.6,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    {rule.description ?? RULE_TYPES.find(r => r.value === rule.ruleType)?.label ?? rule.ruleType}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    Phạm vi: {SCOPE_LABELS[rule.ruleScope] ?? rule.ruleScope}
                    {rule.scopeValue && ` • ${rule.scopeValue}`}
                    {' '}• Giá trị: {JSON.stringify(rule.value)}
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(rule.id, rule.isActive)}
                  disabled={toggling === rule.id}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    border: `1px solid ${rule.isActive ? '#22c55e' : '#e2e8f0'}`,
                    background: rule.isActive ? '#f0fdf4' : '#f8fafc',
                    color: rule.isActive ? '#16a34a' : '#94a3b8',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: toggling === rule.id ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {toggling === rule.id ? '...' : rule.isActive ? '✅ Bật' : '⬜ Tắt'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(rule.id)}
                  disabled={deleting === rule.id}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: 12,
                    color: '#dc2626',
                    cursor: deleting === rule.id ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {deleting === rule.id ? '...' : '🗑️'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
