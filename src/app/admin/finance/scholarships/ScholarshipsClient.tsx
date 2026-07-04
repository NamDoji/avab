'use client'

import { useState, useCallback } from 'react'

interface Student {
  id: string
  name: string | null
  phone: string
  email: string | null
}

interface Course {
  id: string
  name: string
}

interface Scholarship {
  id: string
  name: string
  description: string | null
  amount: number
  type: string
  studentId: string
  courseId: string | null
  reason: string | null
  approvedBy: string | null
  status: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  student: Student | null
  course: Course | null
}

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Đang hiệu lực', cls: 'bg-green-100 text-green-700' },
    expired: { label: 'Hết hạn', cls: 'bg-gray-100 text-gray-500' },
    cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-600' },
  }
  const m = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.cls}`}>{m.label}</span>
}

interface Props {
  initialScholarships: Scholarship[]
  courses: Course[]
}

export default function ScholarshipsClient({ initialScholarships, courses }: Props) {
  const [scholarships, setScholarships] = useState<Scholarship[]>(initialScholarships)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Student search
  const [studentQuery, setStudentQuery] = useState('')
  const [studentResults, setStudentResults] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searching, setSearching] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    amount: '',
    type: 'fixed' as 'fixed' | 'percent',
    courseId: '',
    reason: '',
    approvedBy: '',
    startDate: '',
    endDate: '',
  })

  const searchStudents = useCallback(async (q: string) => {
    if (q.length < 2) { setStudentResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/admin/finance/scholarships/students?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setStudentResults(data.students ?? [])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) { setError('Vui lòng chọn học sinh'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/finance/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          studentId: selectedStudent.id,
          amount: Number(form.amount),
          courseId: form.courseId || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Lỗi tạo học bổng')
      setScholarships([data.scholarship, ...scholarships])
      setShowForm(false)
      setSelectedStudent(null)
      setStudentQuery('')
      setForm({ name: '', description: '', amount: '', type: 'fixed', courseId: '', reason: '', approvedBy: '', startDate: '', endDate: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const changeStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/finance/scholarships/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const { scholarship } = await res.json()
      setScholarships(scholarships.map(s =>
        s.id === id ? { ...s, status: scholarship.status } : s
      ))
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{scholarships.length} học bổng trong hệ thống</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm"
          style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' }}
        >
          {showForm ? '✕ Đóng' : '+ Tạo Học Bổng'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-black text-gray-900">Tạo học bổng mới</h3>
          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

          {/* Student search */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Tìm học sinh *</label>
            {selectedStudent ? (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">{selectedStudent.name ?? 'Chưa có tên'}</p>
                  <p className="text-xs text-blue-600">{selectedStudent.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedStudent(null); setStudentQuery('') }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Đổi
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Tìm theo tên, số điện thoại, email..."
                  value={studentQuery}
                  onChange={e => {
                    setStudentQuery(e.target.value)
                    searchStudents(e.target.value)
                  }}
                />
                {(studentResults.length > 0 || searching) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                    {searching ? (
                      <div className="px-4 py-3 text-sm text-gray-500">Đang tìm...</div>
                    ) : (
                      studentResults.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-50 last:border-0"
                          onClick={() => {
                            setSelectedStudent(s)
                            setStudentResults([])
                            setStudentQuery('')
                          }}
                        >
                          <p className="font-semibold text-sm text-gray-800">{s.name ?? 'Chưa có tên'}</p>
                          <p className="text-xs text-gray-500">{s.phone}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Tên học bổng *</label>
              <input
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="VD: Học bổng tài năng T7/2026"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Khóa học áp dụng</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.courseId}
                onChange={e => setForm({ ...form, courseId: e.target.value })}
              >
                <option value="">Tất cả khóa học</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Loại học bổng *</label>
              <select
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as 'fixed' | 'percent' })}
              >
                <option value="fixed">VNĐ Cố định</option>
                <option value="percent">% Phần trăm</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Giá trị * {form.type === 'percent' ? '(%)' : '(VNĐ)'}
              </label>
              <input
                required
                type="number"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder={form.type === 'percent' ? '20' : '1000000'}
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Lý do</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="VD: Học sinh giỏi môn Toán tháng 6"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Người duyệt</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Tên người duyệt"
                value={form.approvedBy}
                onChange={e => setForm({ ...form, approvedBy: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Ngày bắt đầu</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Ngày kết thúc</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Mô tả</label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Ghi chú thêm..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' }}
            >
              {loading ? 'Đang tạo...' : '✅ Tạo Học Bổng'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); setSelectedStudent(null) }}
              className="px-6 py-2.5 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {scholarships.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">
            <p className="text-4xl mb-3">🎓</p>
            <p>Chưa có học bổng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                  <th className="text-left px-6 py-3">Học sinh</th>
                  <th className="text-left px-4 py-3">Tên học bổng</th>
                  <th className="text-left px-4 py-3">Khóa học</th>
                  <th className="text-center px-4 py-3">Loại</th>
                  <th className="text-right px-4 py-3">Giá trị</th>
                  <th className="text-left px-4 py-3">Lý do</th>
                  <th className="text-center px-4 py-3">Trạng thái</th>
                  <th className="text-center px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {scholarships.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{s.student?.name ?? 'N/A'}</p>
                      <p className="text-xs text-gray-500">{s.student?.phone ?? s.studentId}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{s.name}</p>
                      {s.approvedBy && (
                        <p className="text-xs text-gray-400">Duyệt bởi: {s.approvedBy}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-xs">
                      {s.course?.name ?? <span className="text-gray-400">Tất cả</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        s.type === 'percent'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {s.type === 'percent' ? '%' : 'VNĐ'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-blue-700">
                      {s.type === 'percent' ? `${s.amount}%` : fmtVND(s.amount)}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500 max-w-[180px] truncate">
                      {s.reason ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.status === 'active' ? (
                        <button
                          onClick={() => changeStatus(s.id, 'cancelled')}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          Hủy
                        </button>
                      ) : (
                        <button
                          onClick={() => changeStatus(s.id, 'active')}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition"
                        >
                          Khôi phục
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
