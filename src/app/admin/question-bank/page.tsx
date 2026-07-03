'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, Sparkles, BookOpen, ChevronRight, X, Layers, BarChart3, RefreshCw } from 'lucide-react'
import { GRADE_OPTIONS_WITH_ALL, SUBJECT_META, getSubjectMeta } from '@/lib/constants/education'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subject {
  id: string
  name: string
  icon: string | null
  order: number
  _count: { questions: number }
}

interface Course {
  id: string
  code: string
  name: string
  grade: string | null
  courseType: string
  subjects: Subject[]
}

interface TypeStat {
  type: string
  count: number
}

interface Stats {
  totalQuestions: number
  totalSubjects: number
  totalCourses: number
  byType: TypeStat[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

// GRADE_OPTIONS dùng từ shared constants (Mầm non → Lớp 12 → Đại học)
const GRADE_OPTIONS = GRADE_OPTIONS_WITH_ALL.map(g => ({ value: g.value === 'all' ? '' : g.value, label: g.value === 'all' ? 'Tất cả lớp' : g.label }))

const COURSE_TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  // Legacy codes
  TOAN: { label: 'Toán', emoji: '📐', color: 'bg-blue-100 text-blue-700' },
  TIENG_ANH: { label: 'Tiếng Anh', emoji: '🇬🇧', color: 'bg-green-100 text-green-700' },
  LAP_TRINH_THUAT_TOAN: { label: 'Lập trình thuật toán', emoji: '🤖', color: 'bg-yellow-100 text-yellow-700' },
  LAP_TRINH_SCRATCH: { label: 'Lập trình Scratch', emoji: '🐱', color: 'bg-orange-100 text-orange-700' },
  LAP_TRINH_PYTHON: { label: 'Lập trình Python', emoji: '🐍', color: 'bg-teal-100 text-teal-700' },
  LAP_TRINH_CPP: { label: 'Lập trình C++', emoji: '⚡', color: 'bg-purple-100 text-purple-700' },
  // K12 generic codes — map to SUBJECT_META
  ...Object.fromEntries(
    Object.entries(SUBJECT_META).map(([k, v]) => [k, { label: v.label, emoji: v.emoji, color: `${v.color} ${v.textColor}` }])
  ),
}

const Q_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  MULTIPLE_CHOICE: { label: 'Trắc nghiệm', color: 'bg-blue-100 text-blue-700' },
  OPEN: { label: 'Tự luận', color: 'bg-purple-100 text-purple-700' },
  TRUE_FALSE: { label: 'Đúng/Sai', color: 'bg-green-100 text-green-700' },
  MATCHING: { label: 'Nối đáp', color: 'bg-orange-100 text-orange-700' },
  FILL_BLANK: { label: 'Điền chỗ trống', color: 'bg-teal-100 text-teal-700' },
  NUMBER_INPUT: { label: 'Số học', color: 'bg-red-100 text-red-700' },
  SHORT_ANSWER: { label: 'Trả lời ngắn', color: 'bg-indigo-100 text-indigo-700' },
  SORT_WORDS: { label: 'Sắp xếp từ', color: 'bg-pink-100 text-pink-700' },
  GROUP_CLASSIFY: { label: 'Phân loại', color: 'bg-yellow-100 text-yellow-700' },
  MULTI_BLANK: { label: 'Nhiều chỗ trống', color: 'bg-cyan-100 text-cyan-700' },
}

// ─── AI Generate Modal ─────────────────────────────────────────────────────────

function AIGenerateModal({
  subject,
  onClose,
  onSuccess,
}: {
  subject: { id: string; name: string } | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!subject) return null

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: subject!.id, subjectName: subject!.name }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Lỗi không xác định')
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-500" />
            Sinh câu hỏi AI
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-purple-900 mb-1">Chủ đề:</p>
          <p className="text-purple-700 font-black">{subject.name}</p>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          AI sẽ sinh <strong>30 câu hỏi mới</strong> cho chủ đề này, bao gồm nhiều loại câu hỏi khác nhau với độ khó tăng dần.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm mb-4">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition min-h-[44px]"
          >
            Huỷ
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-sm hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-60 min-h-[44px] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Đang sinh...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Sinh 30 câu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Subject Card ──────────────────────────────────────────────────────────────

function SubjectCard({
  subject,
  course,
  onAIGenerate,
}: {
  subject: Subject
  course: Course
  onAIGenerate: (s: { id: string; name: string }) => void
}) {
  const grade = course.grade
    ? course.grade.split(',').map(g => `L${g.trim()}`).join(', ')
    : 'Tất cả lớp'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
      {/* Icon strip */}
      <div className="h-2 rounded-t-2xl bg-gradient-to-r from-purple-400 to-blue-400" />
      <div className="p-4 flex-1 flex flex-col">
        {/* Icon + name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {subject.icon ?? '📚'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-gray-900 text-sm leading-tight line-clamp-2">{subject.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{grade}</p>
          </div>
        </div>

        {/* Question count */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-black text-purple-600">{subject._count.questions}</span>
          <span className="text-xs text-gray-500">câu hỏi</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/admin/question-bank/${subject.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-700 transition min-h-[36px]"
          >
            <BookOpen size={12} />
            Xem
          </Link>
          <button
            onClick={() => onAIGenerate({ id: subject.id, name: subject.name })}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition min-h-[36px] border border-purple-200"
            title="Sinh câu hỏi AI"
          >
            <Sparkles size={12} />
            AI+
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function QuestionBankPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')

  // AI modal
  const [aiSubject, setAiSubject] = useState<{ id: string; name: string } | null>(null)

  // Success toast
  const [successMsg, setSuccessMsg] = useState('')

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (gradeFilter) params.set('grade', gradeFilter)
      const res = await fetch(`/api/admin/question-bank?${params}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setCourses(data.data.courses)
      setStats(data.data.stats)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [gradeFilter])

  function handleAISuccess() {
    setSuccessMsg('✅ Đã sinh câu hỏi AI thành công!')
    setTimeout(() => setSuccessMsg(''), 3000)
    fetchData()
  }

  // Flatten subjects from all courses for searching/filtering
  const allSubjectsWithCourse = useMemo(() => {
    return courses.flatMap(c => c.subjects.map(s => ({ subject: s, course: c })))
  }, [courses])

  const filteredSubjects = useMemo(() => {
    return allSubjectsWithCourse.filter(({ subject, course }) => {
      if (search && !subject.name.toLowerCase().includes(search.toLowerCase())) return false
      if (courseFilter && course.id !== courseFilter) return false
      return true
    })
  }, [allSubjectsWithCourse, search, courseFilter])

  // Group filtered subjects by course
  const groupedByCourse = useMemo(() => {
    const groups = new Map<string, { course: Course; subjects: Subject[] }>()
    filteredSubjects.forEach(({ subject, course }) => {
      if (!groups.has(course.id)) {
        groups.set(course.id, { course, subjects: [] })
      }
      groups.get(course.id)!.subjects.push(subject)
    })
    return Array.from(groups.values())
  }, [filteredSubjects])

  const courseTypeInfo = (type: string) =>
    COURSE_TYPE_LABELS[type] ?? { label: type, emoji: '📚', color: 'bg-gray-100 text-gray-700' }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* AI Modal */}
      <AIGenerateModal
        subject={aiSubject}
        onClose={() => setAiSubject(null)}
        onSuccess={handleAISuccess}
      />

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-3 rounded-2xl shadow-lg font-semibold text-sm">
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900 text-white py-10">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">
              ← Admin
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 text-sm">Question Bank</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1 flex items-center gap-3">
                <span>🗃️</span> Question Bank
              </h1>
              {stats && (
                <p className="text-gray-400">
                  {stats.totalQuestions.toLocaleString()} câu hỏi · {stats.totalSubjects} chủ đề · {stats.totalCourses} khoá học
                </p>
              )}
            </div>
            <button
              onClick={() => setAiSubject(null)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-sm hover:from-purple-700 hover:to-purple-800 transition shadow-lg min-h-[44px]"
            >
              <Sparkles size={16} />
              Sinh câu hỏi AI
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-2xl font-black text-purple-600">{stats.totalQuestions.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-0.5">Tổng câu hỏi</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-2xl font-black text-blue-600">{stats.totalSubjects}</div>
              <div className="text-xs text-gray-500 mt-0.5">Chủ đề</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-2xl font-black text-teal-600">{stats.totalCourses}</div>
              <div className="text-xs text-gray-500 mt-0.5">Khoá học</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-wrap gap-1">
                {stats.byType.slice(0, 2).map(t => (
                  <span key={t.type} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${Q_TYPE_LABELS[t.type]?.color ?? 'bg-gray-100 text-gray-700'}`}>
                    {Q_TYPE_LABELS[t.type]?.label ?? t.type}: {t.count}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Loại câu hỏi</div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm chủ đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[40px]"
            />
          </div>

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[40px] bg-white"
          >
            {GRADE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[40px] bg-white max-w-[200px]"
          >
            <option value="">Tất cả khoá</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Reset */}
          {(search || gradeFilter || courseFilter) && (
            <button
              onClick={() => { setSearch(''); setGradeFilter(''); setCourseFilter('') }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition min-h-[40px]"
            >
              <X size={14} />
              Xoá bộ lọc
            </button>
          )}

          <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <Layers size={12} />
            {filteredSubjects.length} chủ đề
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-2xl p-4 mb-6 text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-purple-400" />
          </div>
        )}

        {/* Course groups */}
        {!loading && groupedByCourse.map(({ course, subjects }) => {
          const typeInfo = courseTypeInfo(course.courseType)
          const grade = course.grade
            ? course.grade.split(',').map(g => `Lớp ${g.trim()}`).join(', ')
            : 'Tất cả lớp'
          const totalQ = subjects.reduce((s, sub) => s + sub._count.questions, 0)

          return (
            <div key={course.id} className="mb-8">
              {/* Course header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{typeInfo.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-black text-gray-900 text-base">{course.name}</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{grade}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{subjects.length} chủ đề · {totalQ.toLocaleString()} câu hỏi</p>
                </div>
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition"
                >
                  Quản lý <ChevronRight size={12} />
                </Link>
              </div>

              {/* Subject cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(subject => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    course={course}
                    onAIGenerate={setAiSubject}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {!loading && groupedByCourse.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🗃️</div>
            <h3 className="font-black text-gray-900 text-lg mb-2">Không có chủ đề nào</h3>
            <p className="text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc thêm khoá học mới</p>
            <Link href="/admin/courses" className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition">
              Quản lý khoá học
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
