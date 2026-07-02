'use client'

import { useState, useEffect, use, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2, Trash2, BookOpen, Users, Check, X, ChevronDown, Download, Upload, Copy } from 'lucide-react'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'
type PaymentType = 'PER_COURSE' | 'PER_SESSION'

const COURSE_TYPE_OPTIONS: { value: CourseType; label: string; emoji: string; color: string }[] = [
  { value: 'TOAN',                 label: 'Toán',                 emoji: '📐', color: 'bg-blue-50 text-blue-700' },
  { value: 'TIENG_ANH',            label: 'Tiếng Anh',            emoji: '🇬🇧', color: 'bg-green-50 text-green-700' },
  { value: 'LAP_TRINH_THUAT_TOAN', label: 'Lập trình thuật toán', emoji: '🤖', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'LAP_TRINH_SCRATCH',    label: 'Lập trình Scratch',    emoji: '🐱', color: 'bg-orange-50 text-orange-700' },
  { value: 'LAP_TRINH_PYTHON',     label: 'Lập trình Python',     emoji: '🐍', color: 'bg-teal-50 text-teal-700' },
  { value: 'LAP_TRINH_CPP',        label: 'Lập trình C++',        emoji: '⚡', color: 'bg-purple-50 text-purple-700' },
]

const GRADE_OPTIONS = [
  { value: '', label: 'Tất cả lớp' },
  ...Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: `Lớp ${i + 1}` })),
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

interface StudentEnrollment {
  id: string
  status: string
  isFree: boolean
  expiresAt: string | null
  createdAt: string
  user: { id: string; name: string | null; phone: string; email: string | null }
}

interface CourseDetail {
  id: string
  code: string
  name: string
  description: string | null
  price: number | null
  pricePerSession: number | null
  paymentType: PaymentType
  grade: string | null
  courseDurationMonths: number
  courseType: CourseType
  isActive: boolean
  subjects: Subject[]
}

export default function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [students, setStudents] = useState<StudentEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [subjectForm, setSubjectForm] = useState({ name: '', icon: '', description: '', order: '0' })
  const [saving, setSaving] = useState(false)

  // Edit course
  const [editingCourse, setEditingCourse] = useState(false)
  const [editCourseForm, setEditCourseForm] = useState({
    name: '',
    description: '',
    courseType: 'TOAN' as CourseType,
    price: '1500000',
    pricePerSession: '200000',
    paymentType: 'PER_COURSE' as PaymentType,
    grade: '',
  })
  const [savingCourse, setSavingCourse] = useState(false)

  // Student management dropdown
  const [showActionMenu, setShowActionMenu] = useState(false)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  // Add student modal
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [addStudentForm, setAddStudentForm] = useState({ phone: '', email: '', name: '', isFree: false })
  const [addingStudent, setAddingStudent] = useState(false)
  const [addStudentMsg, setAddStudentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Import XLS modal
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; created: number } | null>(null)

  // Clone modal
  const [showClone, setShowClone] = useState(false)
  const [cloneForm, setCloneForm] = useState({ name: '', grade: '' })
  const [cloning, setCloning] = useState(false)
  const [cloneResult, setCloneResult] = useState<{ id: string; name: string } | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/courses/${id}`)
    const data = await res.json()
    if (data.success) setCourse(data.data)
    setLoading(false)
  }

  const loadStudents = async () => {
    setStudentsLoading(true)
    const res = await fetch(`/api/admin/courses/${id}/students`)
    const data = await res.json()
    if (data.success) setStudents(data.data)
    setStudentsLoading(false)
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { if (!loading) loadStudents() }, [loading])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setShowActionMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
      pricePerSession: String(course.pricePerSession ?? 200000),
      paymentType: course.paymentType ?? 'PER_COURSE',
      grade: course.grade ?? '',
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
        paymentType: editCourseForm.paymentType,
        price: editCourseForm.paymentType === 'PER_COURSE' ? Number(editCourseForm.price) || 1500000 : null,
        pricePerSession: editCourseForm.paymentType === 'PER_SESSION' ? Number(editCourseForm.pricePerSession) || 200000 : null,
        grade: editCourseForm.grade || null,
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
    const res = await fetch(`/api/admin/courses/${id}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addStudentForm),
    })
    const data = await res.json()
    if (data.success) {
      setAddStudentMsg({ type: 'success', text: data.created ? 'Đã tạo tài khoản và thêm học viên!' : 'Đã thêm học viên thành công!' })
      setAddStudentForm({ phone: '', email: '', name: '', isFree: false })
      loadStudents()
    } else {
      setAddStudentMsg({ type: 'error', text: data.error || 'Không thể thêm học viên.' })
    }
    setAddingStudent(false)
  }

  const handleDeleteStudent = async (userId: string, userName: string) => {
    if (!confirm(`Xoá học viên "${userName}" khỏi khoá học này?`)) return
    const res = await fetch(`/api/admin/courses/${id}/students/${userId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadStudents()
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    setImportResult(null)
    const formData = new FormData()
    formData.append('file', importFile)
    const res = await fetch(`/api/admin/courses/${id}/students/import`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (data.success) {
      setImportResult(data.data)
      loadStudents()
    } else {
      alert(data.error || 'Import thất bại')
    }
    setImporting(false)
  }

  const handleDownloadTemplate = () => {
    window.open(`/api/admin/courses/${id}/students/template`, '_blank')
  }

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault()
    setCloning(true)
    const res = await fetch(`/api/admin/courses/${id}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cloneForm.name, grade: cloneForm.grade || null }),
    })
    const data = await res.json()
    if (data.success) {
      setCloneResult(data.data)
    } else {
      alert(data.error || 'Nhân bản thất bại')
    }
    setCloning(false)
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
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/courses" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm">
            <ArrowLeft className="w-4 h-4" /> Danh sách khoá học
          </Link>
          {/* Clone button */}
          <button
            onClick={() => { setShowClone(true); setCloneResult(null); setCloneForm({ name: course.name + ' (Bản sao)', grade: course.grade ?? '' }) }}
            className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm px-4 py-2 rounded-lg font-semibold transition"
          >
            <Copy className="w-4 h-4" /> Nhân bản
          </button>
        </div>

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
              {/* Course Type Selector */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Loại khoá học</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COURSE_TYPE_OPTIONS.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setEditCourseForm(f => ({ ...f, courseType: opt.value }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                        editCourseForm.courseType === opt.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-purple-300'
                      }`}>
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
              {/* Payment type */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Loại thu tiền</p>
                <div className="flex gap-3">
                  <button type="button"
                    onClick={() => setEditCourseForm(f => ({ ...f, paymentType: 'PER_COURSE' }))}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                      editCourseForm.paymentType === 'PER_COURSE'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600'
                    }`}>
                    🏦 Thu theo khoá (18 tháng)
                  </button>
                  <button type="button"
                    onClick={() => setEditCourseForm(f => ({ ...f, paymentType: 'PER_SESSION' }))}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                      editCourseForm.paymentType === 'PER_SESSION'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-600'
                    }`}>
                    🗓️ Thu theo buổi
                  </button>
                </div>
              </div>
              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                {editCourseForm.paymentType === 'PER_COURSE' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">💰 Học phí cả khoá (VNĐ)</label>
                    <input type="number"
                      value={editCourseForm.price}
                      onChange={(e) => setEditCourseForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="1500000"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">💰 Học phí mỗi buổi (VNĐ)</label>
                    <input type="number"
                      value={editCourseForm.pricePerSession}
                      onChange={(e) => setEditCourseForm((f) => ({ ...f, pricePerSession: e.target.value }))}
                      placeholder="200000"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🎓 Lớp</label>
                  <select
                    value={editCourseForm.grade}
                    onChange={(e) => setEditCourseForm(f => ({ ...f, grade: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  >
                    {GRADE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveCourse} disabled={savingCourse}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50">
                  <Check className="w-4 h-4" /> {savingCourse ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button onClick={() => setEditingCourse(false)}
                  className="flex items-center gap-1.5 border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  <X className="w-4 h-4" /> Huỷ
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-mono text-sm text-gray-400">{course.code}</p>
                <h1 className="text-2xl font-bold text-gray-800 mt-1">{course.name}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <CourseTypeBadge type={course.courseType ?? 'TOAN'} />
                  {course.grade && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      Lớp {course.grade}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {course.paymentType === 'PER_SESSION'
                      ? `${(course.pricePerSession ?? 0).toLocaleString()}đ/buổi`
                      : `${(course.price ?? 0).toLocaleString()}đ/khoá`}
                  </span>
                </div>
                {course.description && <p className="text-gray-500 mt-2 text-sm">{course.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleStartEditCourse}
                  className="flex items-center gap-1.5 border border-gray-200 hover:border-purple-300 text-gray-500 hover:text-purple-600 text-sm px-3 py-1.5 rounded-lg transition">
                  <Edit2 className="w-4 h-4" /> Sửa
                </button>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${course.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {course.isActive ? 'Hoạt động' : 'Ẩn'}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-purple-600" />{course.subjects.length} chuyên đề</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-teal-600" />{students.length} học viên</span>
            <Link href={`/admin/courses/${id}/tuition`}
              className="flex items-center gap-1.5 text-purple-600 hover:text-purple-800 font-semibold border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg transition">
              💰 Thu học phí
            </Link>
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" /> Chuyên đề
            </h2>
            <button onClick={() => setShowSubjectForm(!showSubjectForm)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg transition">
              <Plus className="w-4 h-4" /> Thêm chuyên đề
            </button>
          </div>

          {showSubjectForm && (
            <form onSubmit={handleAddSubject} className="grid md:grid-cols-2 gap-3 mb-5 p-4 bg-purple-50 rounded-xl">
              <input required placeholder="Tên chuyên đề"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm((f) => ({ ...f, name: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <input placeholder="Icon (emoji, vd: 📘)"
                value={subjectForm.icon}
                onChange={(e) => setSubjectForm((f) => ({ ...f, icon: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <input placeholder="Mô tả"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm((f) => ({ ...f, description: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <input type="number" placeholder="Thứ tự"
                value={subjectForm.order}
                onChange={(e) => setSubjectForm((f) => ({ ...f, order: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <button type="submit" disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 font-semibold text-sm transition disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Thêm'}
              </button>
              <button type="button" onClick={() => setShowSubjectForm(false)}
                className="border border-gray-200 rounded-lg py-2 text-sm hover:bg-white transition">
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

        {/* Student Management */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" /> Danh sách học viên
              <span className="text-sm font-normal text-gray-400">({students.length})</span>
            </h2>
            {/* Action dropdown */}
            <div className="relative" ref={actionMenuRef}>
              <button
                onClick={() => setShowActionMenu(!showActionMenu)}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition"
              >
                Thao tác <ChevronDown className="w-4 h-4" />
              </button>
              {showActionMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    onClick={() => { setShowActionMenu(false); setShowAddStudent(true); setAddStudentMsg(null) }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 text-teal-600" /> Thêm học viên
                  </button>
                  <button
                    onClick={() => { setShowActionMenu(false); setShowImport(true); setImportResult(null); setImportFile(null) }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 text-blue-600" /> Import từ XLS
                  </button>
                  <button
                    onClick={() => { setShowActionMenu(false); handleDownloadTemplate() }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 text-gray-500" /> Tải file mẫu
                  </button>
                </div>
              )}
            </div>
          </div>

          {studentsLoading ? (
            <div className="text-center text-gray-400 py-8">Đang tải...</div>
          ) : students.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Chưa có học viên nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 text-gray-500 font-medium">Học viên</th>
                    <th className="text-left pb-3 text-gray-500 font-medium">SĐT</th>
                    <th className="text-left pb-3 text-gray-500 font-medium">Trạng thái</th>
                    <th className="text-left pb-3 text-gray-500 font-medium">Hết hạn</th>
                    <th className="text-left pb-3 text-gray-500 font-medium">Ngày vào</th>
                    <th className="text-right pb-3 text-gray-500 font-medium">Xoá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((e) => (
                    <tr key={e.id}>
                      <td className="py-3">
                        <p className="font-medium text-gray-800">{e.user.name ?? 'N/A'}</p>
                        {e.user.email && <p className="text-xs text-gray-400">{e.user.email}</p>}
                        {e.isFree && <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">Miễn phí</span>}
                      </td>
                      <td className="py-3 text-gray-500">{e.user.phone}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          e.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                          e.status === 'EXPIRED' ? 'bg-orange-50 text-orange-700' :
                          e.status === 'REMOVED' ? 'bg-red-50 text-red-700' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>
                          {e.status === 'ACTIVE' ? 'Hoạt động' :
                           e.status === 'EXPIRED' ? 'Hết hạn' :
                           e.status === 'REMOVED' ? 'Đã xoá' : e.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {new Date(e.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteStudent(e.user.id, e.user.name ?? e.user.phone)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition"
                          title="Xoá học viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Thêm học viên ── */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddStudent(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" /> Thêm học viên
            </h3>
            {addStudentMsg && (
              <div className={`text-sm px-4 py-2 rounded-lg mb-4 ${addStudentMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {addStudentMsg.text}
              </div>
            )}
            <form onSubmit={handleAddStudent} className="space-y-3">
              <input
                type="text"
                placeholder="Họ tên"
                value={addStudentForm.name}
                onChange={e => setAddStudentForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={addStudentForm.phone}
                onChange={e => setAddStudentForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={addStudentForm.email}
                onChange={e => setAddStudentForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={addStudentForm.isFree}
                  onChange={e => setAddStudentForm(f => ({ ...f, isFree: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-gray-700">Miễn học phí</span>
              </label>
              <p className="text-xs text-gray-400">
                💡 Nếu chưa có tài khoản, sẽ tự động tạo với mật khẩu mặc định 123456
              </p>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={addingStudent || (!addStudentForm.phone && !addStudentForm.email)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition">
                  {addingStudent ? 'Đang thêm...' : 'Thêm học viên'}
                </button>
                <button type="button" onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Import XLS ── */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowImport(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" /> Import học viên từ XLS
            </h3>
            {importResult ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                  <p className="font-bold text-green-800">✅ Import hoàn tất!</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-2xl font-black text-teal-600">{importResult.added}</p>
                      <p className="text-xs text-gray-500">Đã thêm</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-2xl font-black text-blue-600">{importResult.created}</p>
                      <p className="text-xs text-gray-500">Tạo mới</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-2xl font-black text-gray-400">{importResult.skipped}</p>
                      <p className="text-xs text-gray-500">Bỏ qua</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowImport(false)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-semibold text-sm transition">
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tải file XLS/XLSX với cột: STT, Họ tên, SĐT, Mail</p>
                  <button type="button" onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium mb-3">
                    <Download className="w-4 h-4" /> Tải file mẫu
                  </button>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={e => setImportFile(e.target.files?.[0] ?? null)}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-500 text-center cursor-pointer hover:border-blue-300"
                  />
                  {importFile && (
                    <p className="text-xs text-teal-600 mt-1">✓ {importFile.name}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  💡 Học viên đã có tài khoản sẽ được enroll. Chưa có sẽ tạo mới với mật khẩu 123456.
                </p>
                <div className="flex gap-2">
                  <button type="submit" disabled={!importFile || importing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition">
                    {importing ? 'Đang import...' : 'Import'}
                  </button>
                  <button type="button" onClick={() => setShowImport(false)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Nhân bản khoá học ── */}
      {showClone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowClone(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Copy className="w-5 h-5 text-amber-600" /> Nhân bản khoá học
            </h3>
            {cloneResult ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-bold text-amber-800 mb-2">✅ Nhân bản thành công!</p>
                  <p className="text-sm text-gray-700">Khoá học mới: <span className="font-semibold">{cloneResult.name}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Khoá bị ẩn mặc định, hãy vào chỉnh sửa và kích hoạt.</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${cloneResult.id}`}
                    className="flex-1 text-center bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-semibold text-sm transition">
                    Mở khoá mới
                  </Link>
                  <button onClick={() => setShowClone(false)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleClone} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khoá mới</label>
                  <input required
                    value={cloneForm.name}
                    onChange={e => setCloneForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nhập tên khoá học mới..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                  <select
                    value={cloneForm.grade}
                    onChange={e => setCloneForm(f => ({ ...f, grade: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    {GRADE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-400">
                  📋 Sẽ copy toàn bộ chuyên đề, tài liệu, bài tập. Không copy học viên.
                </p>
                <div className="flex gap-2">
                  <button type="submit" disabled={cloning}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition">
                    {cloning ? 'Đang nhân bản...' : 'Nhân bản'}
                  </button>
                  <button type="button" onClick={() => setShowClone(false)}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
