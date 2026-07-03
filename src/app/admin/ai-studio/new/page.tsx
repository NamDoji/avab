'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Sparkles, AlertCircle } from 'lucide-react'
import {
  GRADE_OPTIONS as EDUCATION_GRADES,
  SUBJECTS as EDUCATION_SUBJECTS,
  CURRICULUM_OPTIONS,
} from '@/lib/constants/education'

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRICULA = CURRICULUM_OPTIONS

const GRADES = EDUCATION_GRADES

const SUBJECTS = EDUCATION_SUBJECTS

const DIFFICULTIES = [
  { value: 'easy',   label: 'Dễ',        desc: 'Học sinh TB làm được',    emoji: '🟢' },
  { value: 'medium', label: 'Trung bình', desc: 'Phù hợp đại đa số HS',   emoji: '🟡' },
  { value: 'hard',   label: 'Khó',       desc: 'Luyện thi, nâng cao',     emoji: '🔴' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewAIProjectPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title:      '',
    curriculum: 'K12-VN',
    grade:      '2',
    subject:    'MATH',
    chapter:    '',
    topic:      '',
    objective:  '',
    difficulty: 'medium',
  })

  const [creating, setCreating] = useState(false)
  const [error,    setError]    = useState('')

  const selectedSubject = SUBJECTS.find(s => s.value === form.subject)

  // Auto-generate title
  const autoTitle = () => {
    const grade = GRADES.find(g => g.value === form.grade)?.label ?? `Lớp ${form.grade}`
    const subj  = selectedSubject?.label ?? form.subject
    const topic = form.topic.trim()
    return topic ? `${subj} ${grade} — ${topic}` : ''
  }

  const handleSubjectChange = (value: string) => {
    const subj = SUBJECTS.find(s => s.value === value)
    setForm(f => ({
      ...f,
      subject: value,
      // Auto-update title if topic is set
      title: f.title === autoTitle() ? '' : f.title,
    }))
  }

  const handleTopicBlur = () => {
    if (!form.title.trim() && form.topic.trim()) {
      setForm(f => ({ ...f, title: autoTitle() }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) return setError('Vui lòng nhập tên dự án')
    if (!form.grade)         return setError('Vui lòng chọn khối lớp')
    if (!form.subject)       return setError('Vui lòng chọn môn học')
    if (!form.topic.trim())  return setError('Vui lòng nhập chủ đề')

    setCreating(true)
    try {
      const res  = await fetch('/api/admin/ai-studio/projects', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title:      form.title.trim(),
          curriculum: form.curriculum,
          grade:      form.grade,
          subject:    form.subject,
          subjectName: selectedSubject?.label,
          chapter:    form.chapter.trim() || undefined,
          topic:      form.topic.trim(),
          objective:  form.objective.trim() || undefined,
          difficulty: form.difficulty,
        }),
      })
      const data = await res.json()

      if (data.success && data.project?.id) {
        router.push(`/admin/ai-studio/${data.project.id}`)
      } else {
        setError(data.error ?? 'Không tạo được dự án, thử lại!')
      }
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-purple-50/10 to-blue-50/10">

      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white py-8">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm mb-4 text-gray-400">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/ai-studio" className="hover:text-white transition-colors">AI Studio</Link>
            <span>/</span>
            <span className="text-gray-200">Dự án mới</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/ai-studio"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black">Tạo Dự án mới</h1>
              <p className="text-indigo-300 text-sm">Điền thông tin để AI Studio tự động sinh học liệu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">

            {/* Project title */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                📌 Tên dự án
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="VD: Toán Lớp 2 — Quy luật dãy số"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Để trống → tự điền sau khi nhập Chủ đề</p>
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
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-purple-400 focus:outline-none bg-white"
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
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-purple-400 focus:outline-none bg-white"
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
                    onClick={() => handleSubjectChange(s.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all min-h-[44px] ${
                      form.subject === s.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{s.emoji}</span>
                    <span className="leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter + Topic */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  📖 Chương / Module <span className="text-gray-400 normal-case font-normal">(tuỳ chọn)</span>
                </label>
                <input
                  type="text"
                  value={form.chapter}
                  onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))}
                  placeholder="VD: Chương 3: Số và phép tính"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  🎯 Chủ đề <span className="text-red-400 normal-case font-normal">(bắt buộc)</span>
                </label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  onBlur={handleTopicBlur}
                  placeholder="VD: Quy luật dãy số, Present Continuous Tense..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Objective */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                🎯 Mục tiêu học tập <span className="text-gray-400 normal-case font-normal">(tuỳ chọn)</span>
              </label>
              <textarea
                value={form.objective}
                onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
                placeholder="VD: HS nhận biết và hoàn thành dãy số có quy luật đơn giản; phát triển tư duy logic..."
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:outline-none resize-none"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                ⚡ Độ khó
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, difficulty: d.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.difficulty === d.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-xl mb-1">{d.emoji}</div>
                    <div className={`text-sm font-bold ${form.difficulty === d.value ? 'text-purple-700' : 'text-gray-700'}`}>
                      {d.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Preview */}
            {form.topic && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm">
                <p className="font-bold text-indigo-800 mb-1">✨ Xem trước:</p>
                <p className="text-indigo-700">
                  <strong>{selectedSubject?.emoji} {selectedSubject?.label ?? form.subject}</strong>
                  {' '}{GRADES.find(g => g.value === form.grade)?.label} —{' '}
                  {form.topic}
                </p>
                <p className="text-indigo-500 text-xs mt-1">
                  AI Studio sẽ tự động sinh: Đề cương → Bài học → 30 câu BTVN → QA → Xuất bản
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link href="/admin/ai-studio"
                className="flex-1 text-center py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                ← Hủy
              </Link>
              <button
                type="submit"
                disabled={creating}
                className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-black text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Tạo Dự án →
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
