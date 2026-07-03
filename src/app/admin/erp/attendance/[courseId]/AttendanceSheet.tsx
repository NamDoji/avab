'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────
export interface StudentRow {
  id: string
  name: string | null
  phone: string
}

type AttendanceStatus = 'present' | 'late' | 'absent'

interface AttendanceEntry {
  userId: string
  status: AttendanceStatus
  note: string
}

interface Props {
  students: StudentRow[]
  courseId: string
  courseName: string
}

// ── Status options ─────────────────────────────────────────────────
const STATUS_OPTIONS: { value: AttendanceStatus; label: string; emoji: string; bg: string; color: string }[] = [
  { value: 'present', label: 'Có mặt', emoji: '✅', bg: '#dcfce7', color: '#166534' },
  { value: 'late',    label: 'Muộn',   emoji: '🔶', bg: '#fef9c3', color: '#854d0e' },
  { value: 'absent',  label: 'Vắng',   emoji: '❌', bg: '#fee2e2', color: '#991b1b' },
]

function initEntries(students: StudentRow[]): Record<string, AttendanceEntry> {
  const entries: Record<string, AttendanceEntry> = {}
  students.forEach((s) => {
    entries[s.id] = { userId: s.id, status: 'present', note: '' }
  })
  return entries
}

// ── Avatar ────────────────────────────────────────────────────────
function MiniAvatar({ name }: { name: string | null }) {
  const letter = name?.trim()[0]?.toUpperCase() ?? '?'
  const colors = ['#0f766e', '#0369a1', '#7c3aed', '#db2777', '#ea580c']
  const bg = colors[(letter.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
      style={{ background: bg }}
    >
      {letter}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────
export default function AttendanceSheet({ students, courseId, courseName }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>(() => initEntries(students))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  function setStatus(userId: string, status: AttendanceStatus) {
    setEntries((prev) => ({ ...prev, [userId]: { ...prev[userId], status } }))
  }

  function setNote(userId: string, note: string) {
    setEntries((prev) => ({ ...prev, [userId]: { ...prev[userId], note } }))
  }

  function markAll(status: AttendanceStatus) {
    setEntries((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((uid) => { next[uid] = { ...next[uid], status } })
      return next
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/erp/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          date,
          records: Object.values(entries).map((e) => ({
            userId: e.userId,
            status: e.status,
            note: e.note || undefined,
          })),
        }),
      })
      const data = await res.json() as { success: boolean; error?: string; count?: number }
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error ?? 'Có lỗi xảy ra khi lưu điểm danh')
      }
    } catch {
      setError('Lỗi kết nối mạng. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const presentCount = Object.values(entries).filter((e) => e.status === 'present').length
  const lateCount    = Object.values(entries).filter((e) => e.status === 'late').length
  const absentCount  = Object.values(entries).filter((e) => e.status === 'absent').length

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
        <div className="text-5xl mb-3">✅</div>
        <h2 className="text-xl font-black text-gray-900 mb-1">Đã lưu điểm danh!</h2>
        <p className="text-gray-500 text-sm mb-5">
          {students.length} học sinh — {new Date(date).toLocaleDateString('vi-VN')}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => { setSuccess(false); setEntries(initEntries(students)) }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Điểm danh ngày khác
          </button>
          <Link
            href="/admin/erp/attendance"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
          >
            Về danh sách lớp
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex flex-wrap gap-4 items-center">
        {/* Date picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">📅 Ngày:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Quick mark all */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Chọn tất cả:</span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => markAll(opt.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
              style={{ background: opt.bg, color: opt.color }}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-3 ml-auto flex-wrap text-xs">
          <span style={{ color: '#166534' }}>✅ {presentCount}</span>
          <span style={{ color: '#854d0e' }}>🔶 {lateCount}</span>
          <span style={{ color: '#991b1b' }}>❌ {absentCount}</span>
        </div>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        <div
          className="px-4 py-3 text-sm font-bold text-gray-700"
          style={{ borderBottom: '1px solid #f1f5f9' }}
        >
          {students.length} học sinh — {courseName}
        </div>
        <div className="divide-y divide-gray-50">
          {students.map((student, idx) => {
            const entry = entries[student.id]
            const currentStatus = entry?.status ?? 'present'

            return (
              <div key={student.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="text-xs text-gray-400 w-6">{idx + 1}</div>
                <MiniAvatar name={student.name} />
                <div className="flex-1 min-w-0 min-w-28">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {student.name ?? '—'}
                  </div>
                  <div className="text-xs text-gray-400">{student.phone}</div>
                </div>

                {/* Status buttons */}
                <div className="flex gap-1 flex-wrap">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(student.id, opt.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={
                        currentStatus === opt.value
                          ? { background: opt.color, color: '#fff' }
                          : { background: '#f3f4f6', color: '#9ca3af' }
                      }
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>

                {/* Note */}
                <input
                  type="text"
                  placeholder="Ghi chú..."
                  value={entry?.note ?? ''}
                  onChange={(e) => setNote(student.id, e.target.value)}
                  className="w-28 border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: '#fee2e2', color: '#991b1b' }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || students.length === 0}
          className="flex-1 py-3 rounded-xl font-black text-white text-sm shadow hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
        >
          {submitting
            ? 'Đang lưu...'
            : `💾 Lưu điểm danh (${students.length} HS · ${new Date(date).toLocaleDateString('vi-VN')})`}
        </button>
        <Link
          href="/admin/erp/attendance"
          className="px-5 py-3 rounded-xl font-bold text-gray-600 text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </Link>
      </div>
    </div>
  )
}
