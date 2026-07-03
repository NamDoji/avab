'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Rocket, AlertCircle, BookOpen } from 'lucide-react'
import {
  GRADE_OPTIONS,
  SUBJECTS as EDUCATION_SUBJECTS,
  CURRICULUM_OPTIONS,
} from '@/lib/constants/education'

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRICULA = CURRICULUM_OPTIONS

const GRADES = [
  ...GRADE_OPTIONS,
  { value: 'university', label: 'Đại học', short: 'ĐH', order: 13 },
]

const SUBJECTS = EDUCATION_SUBJECTS

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseGeneratorPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    courseName:      '',
    curriculum:      'K12-VN',
    grade:           '3',
    subject:         'THINKING_MATH',
    objective:       '',
    numTopics:       5,
    lessonsPerTopic: 4,
    homeworkCount:   30,
    quizCount:       20,
  })

  const [generating, setGenerating] = useState(false)
  const [error,       setError]     = useState('')

  const selectedSubject = SUBJECTS.find(s => s.value === form.subject)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.courseName.trim()) return setError('Vui lòng nhập tên khóa học')
    if (!form.grade)             return setError('Vui lòng chọn khối lớp')
    if (!form.subject)           return setError('Vui lòng chọn môn học')

    setGenerating(true)
    try {
      const res  = await fetch('/api/admin/ai-studio/course-generator', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          courseName:      form.courseName.trim(),
          curriculum:      form.curriculum,
          grade:           form.grade,
          subject:         form.subject,
          subjectName:     selectedSubject?.label ?? form.subject,
          objective:       form.objective.trim() || undefined,
          numTopics:       form.numTopics,
          lessonsPerTopic: form.lessonsPerTopic,
          homeworkCount:   form.homeworkCount,
          quizCount:       form.quizCount,
        }),
      })
      const data = await res.json()

      if (data.success && data.courseId) {
        router.push(`/admin/ai-studio/course-generator/${data.courseId}`)
      } else {
        setError(data.error ?? 'Không tạo được khóa học, thử lại!')
      }
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-emerald-50/10 to-blue-50/10">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-900 to-gray-900 text-white py-8">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm mb-4 text-gray-400">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/ai-studio" className="hover:text-white transition-colors">AI Studio</Link>
            <span>/</span>
            <span className="text-gray-200">Generate Full Course</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/ai-studio"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                🚀
              </div>
              <div>
                <h1 className="text-2xl font-black">Generate Full Course</h1>
                <p className="text-emerald-300 text-sm">AI tự động tạo toàn bộ cấu trúc khóa học</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">

            {/* Course name */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                📌 Tên khóa học <span className="text-red-400 normal-case font-normal">(bắt buộc)</span>
              </label>
              <input
                type="text"
                value={form.courseName}
                onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))}
                placeholder="VD: Toán Tư Duy Lớp 3 — Phát triển Logic"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Curriculum + Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  🎓 Chương trình
                </label>
                <select
                  value={form.curriculum}
                  onChange={e => setForm(f => ({ ...f, curriculum: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-emerald-400 focus:outline-none bg-white"
                >
                  {CURRICULA.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  🏫 Khối lớp
                </label>
                <select
                  value={form.grade}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-emerald-400 focus:outline-none bg-white"
                >
                  {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                📚 Môn học
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, subject: s.value }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all min-h-[44px] ${
                      form.subject === s.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{s.emoji}</span>
                    <span className="leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Objective */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                🎯 Định hướng / Mục tiêu đầu ra <span className="text-gray-400 normal-case font-normal">(tuỳ chọn)</span>
              </label>
              <textarea
                value={form.objective}
                onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
                placeholder="VD: Phát triển tư duy logic, chuẩn bị thi chuyên, luyện thi học sinh giỏi..."
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none resize-none"
              />
            </div>

            {/* numTopics + 3 counters */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                🗂️ Số chuyên đề
              </label>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, numTopics: Math.max(1, f.numTopics - 1) }))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 font-bold text-lg transition-all"
                >−</button>
                <span className="flex-1 text-center text-2xl font-black text-emerald-600">{form.numTopics}</span>
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, numTopics: Math.min(50, f.numTopics + 1) }))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 font-bold text-lg transition-all"
                >+</button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-1">1 – 50 chuyên đề</p>
            </div>

            {/* 3 separate counters */}
            <div className="grid grid-cols-3 gap-3">
              {/* Bài giảng */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
                <label className="block text-xs font-bold text-blue-700 mb-2 text-center">
                  📖 Bài trong bài giảng
                </label>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, lessonsPerTopic: Math.max(1, f.lessonsPerTopic - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-blue-200 text-blue-600 hover:border-blue-400 font-bold transition-all text-sm"
                  >−</button>
                  <span className="flex-1 text-center text-xl font-black text-blue-700">{form.lessonsPerTopic}</span>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, lessonsPerTopic: Math.min(50, f.lessonsPerTopic + 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-blue-200 text-blue-600 hover:border-blue-400 font-bold transition-all text-sm"
                  >+</button>
                </div>
                <p className="text-xs text-blue-400 text-center mt-1">bài/chuyên đề</p>
              </div>

              {/* Bài tập về nhà */}
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3">
                <label className="block text-xs font-bold text-violet-700 mb-2 text-center">
                  📝 Bài trong BTVN
                </label>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, homeworkCount: Math.max(1, f.homeworkCount - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-violet-200 text-violet-600 hover:border-violet-400 font-bold transition-all text-sm"
                  >−</button>
                  <span className="flex-1 text-center text-xl font-black text-violet-700">{form.homeworkCount}</span>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, homeworkCount: Math.min(50, f.homeworkCount + 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-violet-200 text-violet-600 hover:border-violet-400 font-bold transition-all text-sm"
                  >+</button>
                </div>
                <p className="text-xs text-violet-400 text-center mt-1">câu/chuyên đề</p>
              </div>

              {/* Đề kiểm tra */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3">
                <label className="block text-xs font-bold text-orange-700 mb-2 text-center">
                  📊 Câu kiểm tra
                </label>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, quizCount: Math.max(1, f.quizCount - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-orange-200 text-orange-600 hover:border-orange-400 font-bold transition-all text-sm"
                  >−</button>
                  <span className="flex-1 text-center text-xl font-black text-orange-700">{form.quizCount}</span>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, quizCount: Math.min(50, f.quizCount + 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-orange-200 text-orange-600 hover:border-orange-400 font-bold transition-all text-sm"
                  >+</button>
                </div>
                <p className="text-xs text-orange-400 text-center mt-1">câu/đề</p>
              </div>
            </div>

            {/* Summary preview */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm">
              <p className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <BookOpen size={16} />
                Tóm tắt khóa học sẽ tạo:
              </p>
              <div className="grid grid-cols-2 gap-2 text-emerald-700">
                <div>
                  <span className="font-semibold">Môn:</span>{' '}
                  {selectedSubject?.emoji} {selectedSubject?.label ?? form.subject}
                </div>
                <div>
                  <span className="font-semibold">Lớp:</span>{' '}
                  {GRADES.find(g => g.value === form.grade)?.label}
                </div>
                <div>
                  <span className="font-semibold">Chuyên đề:</span> {form.numTopics}
                </div>
                <div>
                  <span className="font-semibold">Tổng bài:</span> {form.numTopics * form.lessonsPerTopic} bài
                </div>
                <div>
                  <span className="font-semibold">📝 BTVN:</span> {form.homeworkCount} câu/chuyên đề
                </div>
                <div>
                  <span className="font-semibold">📊 Kiểm tra:</span> {form.quizCount} câu/đề
                </div>
              </div>
              <p className="text-emerald-500 text-xs mt-2">
                AI sẽ phân tích chương trình và xây dựng đầy đủ cấu trúc khóa học
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link
                href="/admin/ai-studio"
                className="flex-1 text-center py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
              >
                ← Hủy
              </Link>
              <button
                type="submit"
                disabled={generating}
                className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-black text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    AI đang tạo cấu trúc...
                  </>
                ) : (
                  <>
                    <Rocket size={18} />
                    Generate Full Course →
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  )
}
