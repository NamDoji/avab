'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  name: string
  grade: string | null
}

interface Subject {
  id: string
  name: string
  icon: string | null
}

interface Props {
  courses: Course[]
}

export default function QuickFeedbackEntry({ courses }: Props) {
  const router = useRouter()
  const [courseId, setCourseId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [sessionNote, setSessionNote] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load subjects when course changes
  useEffect(() => {
    if (!courseId) {
      setSubjects([])
      setSubjectId('')
      return
    }
    setLoadingSubjects(true)
    setSubjectId('')
    fetch(`/api/admin/courses/${courseId}`)
      .then(r => r.json())
      .then((data: { success?: boolean; data?: { subjects?: Subject[] } }) => {
        if (data.success && data.data?.subjects) setSubjects(data.data.subjects)
        else setSubjects([])
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false))
  }, [courseId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subjectId) {
      setError('Vui lòng chọn chuyên đề')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/subjects/${subjectId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionNote: sessionNote || null,
          sessionDate: new Date().toISOString(),
          studentIds: [],
        }),
      })
      const data = await res.json() as { success?: boolean; data?: { feedbackId: string }; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Đã có lỗi xảy ra')
        return
      }
      // Navigate to the new session
      router.push(`/giao-vien/buoi-hoc/${data.data!.feedbackId}`)
    } catch {
      setError('Không thể kết nối máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition bg-white'

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Course selector */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Khóa học</label>
          <select
            className={inputCls}
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
          >
            <option value="">-- Chọn khóa học --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.grade ? ` (Lớp ${c.grade})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Subject selector */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Chuyên đề</label>
          <select
            className={inputCls}
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            disabled={!courseId || loadingSubjects}
          >
            {loadingSubjects
              ? <option value="">⏳ Đang tải…</option>
              : !courseId
                ? <option value="">-- Chọn khóa học trước --</option>
                : subjects.length === 0
                  ? <option value="">Không có chuyên đề</option>
                  : (
                    <>
                      <option value="">-- Chọn chuyên đề --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.icon ? `${s.icon} ` : ''}{s.name}
                        </option>
                      ))}
                    </>
                  )}
          </select>
        </div>
      </div>

      {/* Session note */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">Ghi chú buổi học (tùy chọn)</label>
        <input
          type="text"
          className={inputCls}
          placeholder="VD: Buổi học ôn tập trước kỳ thi…"
          value={sessionNote}
          onChange={e => setSessionNote(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium">⚠️ {error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!subjectId || submitting}
          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #0d9488, #0891b2)',
          }}
        >
          {submitting ? '⏳ Đang tạo…' : '✏️ Tạo buổi học'}
        </button>
        <a
          href="/giao-vien/buoi-hoc"
          className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition"
        >
          Xem tất cả buổi học →
        </a>
      </div>
    </form>
  )
}
