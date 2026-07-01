'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const COURSE_TYPE_OPTIONS: { value: CourseType; label: string; emoji: string; color: string }[] = [
  { value: 'TOAN',                 label: 'Toán',                    emoji: '📐', color: 'bg-blue-50 text-blue-700' },
  { value: 'TIENG_ANH',            label: 'Tiếng Anh',               emoji: '🇬🇧', color: 'bg-green-50 text-green-700' },
  { value: 'LAP_TRINH_THUAT_TOAN', label: 'Lập trình thuật toán',    emoji: '🤖', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'LAP_TRINH_SCRATCH',    label: 'Lập trình Scratch',       emoji: '🐱', color: 'bg-orange-50 text-orange-700' },
  { value: 'LAP_TRINH_PYTHON',     label: 'Lập trình Python',        emoji: '🐍', color: 'bg-teal-50 text-teal-700' },
  { value: 'LAP_TRINH_CPP',        label: 'Lập trình C++',           emoji: '⚡', color: 'bg-purple-50 text-purple-700' },
]

function CourseTypeBadge({ type }: { type: CourseType }) {
  const opt = COURSE_TYPE_OPTIONS.find(o => o.value === type) ?? COURSE_TYPE_OPTIONS[0]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${opt.color}`}>
      {opt.emoji} {opt.label}
    </span>
  )
}

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  price: number | null
  courseType: CourseType
  isActive: boolean
  createdAt: string
  _count: { subjects: number; enrollments: number }
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', description: '', price: '1500000', courseType: 'TOAN' as CourseType })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/courses')
    const data = await res.json()
    if (data.success) setCourses(data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    })
    const data = await res.json()
    if (data.success) {
      setShowForm(false)
      setForm({ code: '', name: '', description: '', price: '1500000', courseType: 'TOAN' })
      load()
    } else {
      setError(data.error)
    }
    setSaving(false)
  }

  const handleToggleActive = async (course: Course) => {
    await fetch(`/api/admin/courses/${course.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !course.isActive }),
    })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá khoá học này? Hành động không thể hoàn tác.')) return
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Quản lý khoá học
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tạo khoá học
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-purple-100">
            <h2 className="font-bold text-gray-800 mb-4">Tạo khoá học mới</h2>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</p>
            )}
            <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
              <input
                required
                placeholder="Mã khoá (VD: TOAN-10)"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                required
                placeholder="Tên khoá học"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {/* Course Type Combo Box */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại khoá học</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COURSE_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, courseType: opt.value }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition ${
                        form.courseType === opt.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Mô tả (tuỳ chọn)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 md:col-span-2"
                rows={2}
              />
              <input
                type="number"
                placeholder="Học phí (VNĐ)"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <div className="flex gap-3 items-center">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition"
                >
                  {saving ? 'Đang tạo...' : 'Tạo khoá học'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null) }}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses list */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Đang tải...</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Chưa có khoá học nào</div>
          ) : (
            <>
              {/* Mobile card layout */}
              <div className="md:hidden divide-y divide-gray-100">
                {courses.map((course) => (
                  <div key={course.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-gray-400">{course.code}</p>
                        <p className="font-semibold text-gray-800 leading-snug">{course.name}</p>
                        <div className="mt-1">
                          <CourseTypeBadge type={course.courseType ?? 'TOAN'} />
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        course.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {course.isActive ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>📚 {course._count.subjects} chuyên đề</span>
                      <span>👥 {course._count.enrollments} học viên</span>
                      <span>{course.price ? `${course.price.toLocaleString()}đ` : 'Miễn phí'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/courses/${course.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 transition">
                        <Edit className="w-3.5 h-3.5" /> Chi tiết
                      </Link>
                      <button onClick={() => handleToggleActive(course)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-50 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition">
                        {course.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Ẩn</> : <><Eye className="w-3.5 h-3.5" /> Hiện</>}
                      </button>
                      <button onClick={() => handleDelete(course.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Khoá học</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Loại</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Chuyên đề</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Học viên</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Học phí</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-mono text-xs text-gray-400">{course.code}</p>
                          <p className="font-semibold text-gray-800">{course.name}</p>
                        </td>
                        <td className="p-4">
                          <CourseTypeBadge type={course.courseType ?? 'TOAN'} />
                        </td>
                        <td className="p-4 text-gray-600">{course._count.subjects}</td>
                        <td className="p-4 text-gray-600">{course._count.enrollments}</td>
                        <td className="p-4 text-gray-600">
                          {course.price ? `${course.price.toLocaleString()}đ` : 'Miễn phí'}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            course.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {course.isActive ? 'Hoạt động' : 'Ẩn'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/courses/${course.id}`}
                              className="p-1.5 text-gray-400 hover:text-purple-600 transition" title="Chi tiết">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleToggleActive(course)}
                              className="p-1.5 text-gray-400 hover:text-teal-600 transition"
                              title={course.isActive ? 'Ẩn' : 'Hiện'}>
                              {course.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDelete(course.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition" title="Xoá">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
