'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Course {
  id: string
  name: string
  code: string
}

interface Student {
  id: string
  name: string | null
  phone: string
}

interface AttendanceEntry {
  userId: string
  status: 'present' | 'absent' | 'late' | 'excused'
  note: string
}

const STATUS_OPTIONS: { value: AttendanceEntry['status']; label: string; color: string }[] = [
  { value: 'present',  label: 'Có mặt', color: '#16a34a' },
  { value: 'absent',   label: 'Vắng',   color: '#dc2626' },
  { value: 'late',     label: 'Muộn',   color: '#ca8a04' },
  { value: 'excused',  label: 'Có phép',color: '#2563eb' },
]

export default function NewAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState<Student[]>([])
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({})
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Load courses
  useEffect(() => {
    fetch('/api/admin/courses')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCourses(d.data as Course[]) })
      .catch(console.error)
  }, [])

  // Load students when course changes
  const loadStudents = useCallback(async (courseId: string) => {
    if (!courseId) return
    setLoadingStudents(true)
    try {
      const res = await fetch(`/api/admin/enrollments?courseId=${courseId}&status=ACTIVE`)
      const data = await res.json() as { success: boolean; data: { user: Student }[] }
      if (data.success) {
        const studentList = data.data.map((e) => e.user)
        setStudents(studentList)
        // Default all to present
        const initial: Record<string, AttendanceEntry> = {}
        studentList.forEach((s) => {
          initial[s.id] = { userId: s.id, status: 'present', note: '' }
        })
        setEntries(initial)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingStudents(false)
    }
  }, [])

  useEffect(() => {
    if (selectedCourseId) loadStudents(selectedCourseId)
  }, [selectedCourseId, loadStudents])

  const updateEntry = (userId: string, field: keyof AttendanceEntry, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }))
  }

  const handleSubmit = async () => {
    if (!selectedCourseId || !date) {
      setError('Vui lòng chọn khóa học và ngày')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/admin/erp/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          date,
          records: Object.values(entries),
        }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error ?? 'Có lỗi xảy ra')
      }
    } catch (err) {
      console.error(err)
      setError('Lỗi kết nối mạng')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-14 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Điểm danh thành công!</h2>
          <p className="text-gray-500 mb-6">{Object.values(entries).length} học sinh đã được ghi nhận</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/admin/erp/attendance"
              className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            >
              Xem danh sách
            </Link>
            <button
              onClick={() => { setSubmitted(false); setEntries({}) }}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-700 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Điểm danh mới
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
      >
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <Link href="/admin/erp/attendance" className="hover:text-white transition-colors">Điểm danh</Link>
            <span>/</span>
            <span>Mới</span>
          </div>
          <h1 className="text-3xl font-black mb-1">📋 Điểm danh mới</h1>
          <p className="text-blue-200 text-sm">Ghi nhận điểm danh cho buổi học</p>
        </div>
      </div>

      <div className="container-custom py-6 max-w-3xl">
        {/* Selectors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Khóa học</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Chọn khóa học --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Ngày</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Student list */}
        {loadingStudents && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-gray-400 text-sm">Đang tải danh sách học sinh...</div>
          </div>
        )}

        {!loadingStudents && selectedCourseId && students.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-gray-500 text-sm">Không có học sinh active trong khóa học này</p>
          </div>
        )}

        {!loadingStudents && students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-3 font-bold text-sm text-gray-700" style={{ borderBottom: '1px solid #f1f5f9' }}>
              {students.length} học sinh
            </div>
            <div className="divide-y divide-gray-50">
              {students.map((student, idx) => {
                const entry = entries[student.id]
                return (
                  <div key={student.id} className="px-5 py-3 flex items-center gap-4">
                    <div className="w-6 text-gray-400 text-sm">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{student.name ?? '—'}</div>
                      <div className="text-xs text-gray-400">{student.phone}</div>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateEntry(student.id, 'status', opt.value)}
                          className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                          style={
                            entry?.status === opt.value
                              ? { background: opt.color, color: '#fff' }
                              : { background: '#f3f4f6', color: '#6b7280' }
                          }
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Ghi chú"
                      value={entry?.note ?? ''}
                      onChange={(e) => updateEntry(student.id, 'note', e.target.value)}
                      className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {students.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl font-black text-white text-sm shadow hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            >
              {submitting ? 'Đang lưu...' : `✅ Lưu điểm danh (${Object.values(entries).length} HS)`}
            </button>
            <Link
              href="/admin/erp/attendance"
              className="px-5 py-3 rounded-xl font-bold text-gray-600 text-sm bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
