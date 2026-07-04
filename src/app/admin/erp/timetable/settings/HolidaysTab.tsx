'use client'

import { useState } from 'react'

interface Holiday {
  id: string
  name: string
  startDate: string
  endDate: string
  type: string
  campusId: string | null
  isRecurring: boolean
}

interface HolidaysTabProps {
  initialHolidays: Holiday[]
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  holiday: { label: 'Nghỉ lễ', color: '#dc2626', bg: '#fef2f2' },
  exam: { label: 'Thi', color: '#d97706', bg: '#fffbeb' },
  event: { label: 'Sự kiện', color: '#2563eb', bg: '#eff6ff' },
  makeup: { label: 'Học bù', color: '#16a34a', bg: '#f0fdf4' },
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function HolidaysTab({ initialHolidays }: HolidaysTabProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays)
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'holiday',
  })
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/erp/timetable/settings/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { success: boolean; data?: Holiday; error?: string }
      if (!data.success) throw new Error(data.error)
      if (data.data) {
        setHolidays(prev => [...prev, data.data!].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        ))
        setForm({ name: '', startDate: '', endDate: '', type: 'holiday' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm ngày nghỉ')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa ngày nghỉ này?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/erp/timetable/settings/holidays?id=${id}`, { method: 'DELETE' })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) throw new Error(data.error)
      setHolidays(prev => prev.filter(h => h.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa ngày nghỉ')
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
      {/* Add Form */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        border: '1px solid #e2e8f0',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#334155', margin: '0 0 16px' }}>
          ➕ Thêm ngày nghỉ / sự kiện
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Tên</label>
            <input
              type="text"
              placeholder="VD: Tết Nguyên Đán"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Ngày bắt đầu</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Ngày kết thúc</label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Loại</label>
            <select
              value={form.type}
              onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
              style={inputStyle}
            >
              <option value="holiday">🎉 Nghỉ lễ</option>
              <option value="exam">📝 Thi</option>
              <option value="event">📌 Sự kiện</option>
              <option value="makeup">📚 Học bù</option>
            </select>
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
          {adding ? '⏳ Đang thêm...' : '➕ Thêm'}
        </button>
      </div>

      {/* Holiday List */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#334155', margin: '0 0 12px' }}>
          📋 Danh sách ({holidays.length})
        </h3>
        {holidays.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: 14 }}>
            Chưa có ngày nghỉ nào. Thêm ngày nghỉ ở trên.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {holidays.map(h => {
              const typeInfo = TYPE_LABELS[h.type] ?? TYPE_LABELS.holiday
              return (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {formatDate(h.startDate)}
                      {h.startDate !== h.endDate && ` — ${formatDate(h.endDate)}`}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                    color: typeInfo.color,
                    background: typeInfo.bg,
                    whiteSpace: 'nowrap',
                  }}>
                    {typeInfo.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(h.id)}
                    disabled={deleting === h.id}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      padding: '5px 10px',
                      fontSize: 12,
                      color: '#dc2626',
                      cursor: deleting === h.id ? 'not-allowed' : 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {deleting === h.id ? '...' : '🗑️'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
