'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2, Trash2, BookOpen, Users, Check, X } from 'lucide-react'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const COURSE_TYPE_OPTIONS: { value: CourseType; label: string; emoji: string; color: string }[] = [
  { value: 'TOAN',                 label: 'Toán',                 emoji: '📐', color: 'bg-blue-50 text-blue-700' },
  { value: 'TIENG_ANH',            label: 'Tiếng Anh',            emoji: '🇬🇧', color: 'bg-green-50 text-green-700' },
  { value: 'LAP_TRINH_THUAT_TOAN', label: 'Lập trình thuật toán', emoji: '🤖', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'LAP_TRINH_SCRATCH',    label: 'Lập trình Scratch',    emoji: '🐱', color: 'bg-orange-50 text-orange-700' },
  { value: 'LAP_TRINH_PYTHON',     label: 'Lập trình Python',     emoji: '🐍', color: 'bg-teal-50 text-teal-700' },
  { value: 'LAP_TRINH_CPP',        label: 'Lập trình C++',        emoji: '⚡', color: 'bg-purple-50 text-purple-700' },
]

function CourseTypeBadge({ type }: { type: CourseType }) {
  const opt = COURSE_TYPE_OPTIONS.find(o => o.value === type) ?? COURSE_TYPE_OPTIONS[0]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${opt.color}`}>
      {opt.emoji} {opt.label}
    </span>
  )
}

interface Subject {
  id: string
  order: number
  name: string
  icon: string | null
  isActive: boolean
  isPreview: boolean
  _count: { questions: number; materials: number }
}

interface Enrollment {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: { id: string; name: string | null; phone: string; email: string | null }
}

interface CourseDetail {
  id: string
  code: string
  name: string
  description: string | null
  price: number | null
  courseType: CourseType
  isActive: boolean
  subjects: Subject[]
  enrollments: Enrollment[]
}

export default function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [subjectForm, setSubjectForm] = useState({ name: '', icon: '', description: '', order: '0' })
  const [saving, setSaving] = useState(false)

  // Edit course
  const [editingCourse, setEditingCourse] = useState(false)
  const [editCourseForm, setEditCourseForm] = useState({ name: '', description: '', courseType: 'TOAN' as CourseType, price: '1500000' })
  const [savingCourse, setSavingCourse] = useState(false)

  // Add student by phone
  const [addStudentPhone, setAddStudentPhone] = useState('')
  const [addStudentMsg, setAddStudentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [addingStudent, setAddingStudent] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/courses/${id}`)
    const data = await res.json()
    if (data.success) setCourse(data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...subjectForm, courseId: id, order: Number(subjectForm.order) }),
    })
    setShowSubjectForm(false)
    setSubjectForm({ name: '', icon: '', description: '', order: '0' })
    setSaving(false)
    load()
  }

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Xoá chuyên đề này?')) return
    await fetch(`/api/admin/subjects/${subjectId}`, { method: 'DELETE' })
    load()
  }

  const handleStartEditCourse = () => {
    if (!course) return
    setEditCourseForm({
      name: course.name,
      description: course.description ?? '',
      courseType: course.courseType ?? 'TOAN',
      price: String(course.price ?? 1500000),
    })
    setEditingCourse(true)
  }

  const handleSaveCourse = async () => {
    if (!course) return
    setSavingCourse(true)
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editCourseForm.name,
        description: editCourseForm.description,
        courseType: editCourseForm.courseType,
        price: Number(editCourseForm.price) || 1500000,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setEditingCourse(false)
      load()
    }
    setSavingCourse(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingStudent(true)
    setAddStudentMsg(null)
    const res = await fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: addStudentPhone, courseId: id }),
    })
    const data = await res.json()
    if (data.success) {
      setAddStudentMsg({ type: 'success', text: 'Đã thêm học viên thành công!' })
      setAddStudentPhone('')
      load()
    } else {
      setAddStudentMsg({ type: 'error', text: data.error || 'Không thể thêm học viên.' })
    }
    setAddingStudent(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Không tìm thấy khoá học</div>
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/admin/courses" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Danh sách khoá học
        </Link>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {editingCourse ? (
            <div className="space-y-4">
              <input
                value={editCourseForm.name}
                onChange={(e) => setEditCourseForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Tên khoá học"
              />
              {/* Course Type Selector in Edit Mode */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Loại khoá học</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COURSE_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditCourseForm(f => ({ ...f, courseType: opt.value }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                        editCourseForm.courseType === opt.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <span>{opt.emoji}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={editCourseForm.description}
                onChange={(e) => setEditCourseForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Mô tả khoá học"
                rows={3}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💰 Giá bán (VNĐ)</label>
                <input
                  type="number"
                  value={editCourseForm.price}
                  onChange={(e) => setEditCourseForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="1500000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <p className="text-xs text-gray-400 mt-1">Mặc định: 1.500.000đ — để trống = miễn phí</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCourse}
                  disabled={savingCourse}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> {savingCourse ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  onClick={() => setEditingCourse(false)}
                  className="flex items-center gap-1.5 border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <X className="w-4 h-4" /> Huỷ
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-mono text-sm text-gray-400">{course.code}</p>
                <h1 className="text-2xl font-bold text-gray-800 mt-1">{course.name}</h1>
                <div className="mt-2">
                  <CourseTypeBadge type={course.courseType ?? 'TOAN'} />
                </div>
                {course.description && <p className="text-gray-500 mt-2 text-sm">{course.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleStartEditCourse}
                  className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-500 hover:text-purple-600 text-sm px-3 py-1.5 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" /> Sửa
                </button>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${course.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {course.isActive ? 'Hoạt động' : 'Ẩn'}
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-purple-600" />{course.subjects.length} chuyên đề</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-teal-600" />{course.enrollments.length} học viên</span>
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" /> Chuyên đề
            </h2>
            <button
              onClick={() => setShowSubjectForm(!showSubjectForm)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Thêm chuyên đề
            </button>
          </div>

          {showSubjectForm && (
            <form onSubmit={handleAddSubject} className="grid md:grid-cols-2 gap-3 mb-5 p-4 bg-purple-50 rounded-xl">
              <input
                required
                placeholder="Tên chuyên đề"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm((f) => ({ ...f, name: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <input
                placeholder="Icon (emoji, vd: 📘)"
                value={subjectForm.icon}
                onChange={(e) => setSubjectForm((f) => ({ ...f, icon: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <input
                placeholder="Mô tả"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm((f) => ({ ...f, description: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <input
                type="number"
                placeholder="Thứ tự"
                value={subjectForm.order}
                onChange={(e) => setSubjectForm((f) => ({ ...f, order: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 font-semibold text-sm transition disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Thêm'}
              </button>
              <button type="button" onClick={() => setShowSubjectForm(false)} className="border border-gray-200 rounded-lg py-2 text-sm hover:bg-white transition">
                Huỷ
              </button>
            </form>
          )}

          {course.subjects.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Chưa có chuyên đề</p>
          ) : (
            <div className="space-y-2">
              {course.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-purple-100">
                  <span className="text-gray-400 text-sm w-6 text-center">{subject.order}</span>
                  <span className="text-xl">{subject.icon ?? '📘'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{subject.name}</p>
                    <p className="text-xs text-gray-400">{subject._count.questions} câu hỏi · {subject._count.materials} tài liệu</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await fetch(`/api/admin/subjects/${subject.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isPreview: !subject.isPreview }),
                        })
                        load()
                      }}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-semibold transition ${
                        subject.isPreview
                          ? 'bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100'
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                      }`}
                      title="Bật/tắt Xem thử"
                    >
                      👁 Xem thử
                    </button>
                    <Link href={`/admin/subjects/${subject.id}`} className="p-1.5 text-gray-400 hover:text-purple-600">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDeleteSubject(subject.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-teal-600" /> Học viên đã đăng ký
          </h2>

          <form onSubmit={handleAddStudent} className="flex gap-2 mb-5 flex-wrap">
            <input
              type="tel"
              value={addStudentPhone}
              onChange={(e) => setAddStudentPhone(e.target.value)}
              placeholder="Nhập SĐT học viên..."
              required
              className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              type="submit"
              disabled={addingStudent}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {addingStudent ? 'Đang thêm...' : 'Thêm học viên'}
            </button>
          </form>
          {addStudentMsg && (
            <div className={`text-sm px-4 py-2 rounded-lg mb-4 ${addStudentMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {addStudentMsg.text}
            </div>
          )}

          {course.enrollments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Chưa có học viên đăng ký</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 text-gray-500 font-medium">Học viên</th>
                    <th className="text-left pb-3 text-gray-500 font-medium">SĐT</th>
                    <th className="text-left pb-3 text-gray-500 font-medium">Trạng thái</th>
                    <th className="text-left pb-3 text-gray-500 font-medium">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {course.enrollments.map((e) => (
                    <tr key={e.id}>
                      <td className="py-3 font-medium text-gray-800">{e.user.name ?? 'N/A'}</td>
                      <td className="py-3 text-gray-500">{e.user.phone}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          e.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                          e.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>
                          {e.status === 'APPROVED' ? 'Đã duyệt' : e.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{new Date(e.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
