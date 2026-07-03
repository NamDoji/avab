'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CourseActionsProps {
  courseId: string
  isActive: boolean
}

type ContentType = 'lessons' | 'homework' | 'answers' | 'quiz' | 'teacher-guide' | 'video-script'

interface GenState {
  loading: boolean
  result: { generated: number; skipped: number; total: number } | null
  error: string
}

const PIPELINE: { type: ContentType; label: string; icon: string; description: string; color: string }[] = [
  {
    type: 'lessons',
    label: 'Lý thuyết',
    icon: '📖',
    description: 'Nội dung bài giảng + ví dụ',
    color: 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
  },
  {
    type: 'homework',
    label: 'Bài tập về nhà',
    icon: '📝',
    description: '30 câu / chuyên đề',
    color: 'from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600',
  },
  {
    type: 'answers',
    label: 'Đáp án',
    icon: '✅',
    description: 'Đáp án + hướng dẫn giải',
    color: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
  },
  {
    type: 'quiz',
    label: 'Đề kiểm tra',
    icon: '📊',
    description: '20 câu 45 phút + biểu điểm',
    color: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
  },
  {
    type: 'teacher-guide',
    label: 'Hướng dẫn GV',
    icon: '👩‍🏫',
    description: 'Giáo án + tiến trình dạy',
    color: 'from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
  },
  {
    type: 'video-script',
    label: 'Kịch bản video',
    icon: '🎬',
    description: 'Script + slide + lời thoại',
    color: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
  },
]

export default function CourseActions({ courseId, isActive }: CourseActionsProps) {
  const router  = useRouter()
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState('')

  const [states, setStates] = useState<Record<ContentType, GenState>>(
    Object.fromEntries(
      PIPELINE.map(p => [p.type, { loading: false, result: null, error: '' }])
    ) as Record<ContentType, GenState>
  )

  const setLoading = (type: ContentType, val: boolean) =>
    setStates(s => ({ ...s, [type]: { ...s[type], loading: val } }))

  const setResult  = (type: ContentType, r: GenState['result']) =>
    setStates(s => ({ ...s, [type]: { ...s[type], result: r, error: '' } }))

  const setGenError = (type: ContentType, msg: string) =>
    setStates(s => ({ ...s, [type]: { ...s[type], error: msg, loading: false } }))

  const generate = async (type: ContentType) => {
    setLoading(type, true)
    setStates(s => ({ ...s, [type]: { ...s[type], error: '' } }))
    try {
      let res: Response

      if (type === 'lessons') {
        res = await fetch(`/api/admin/ai-studio/course-generator/${courseId}/generate-lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      } else {
        res = await fetch(`/api/admin/ai-studio/course-generator/${courseId}/generate-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType: type }),
        })
      }

      const data = await res.json()
      if (data.success) {
        setResult(type, {
          generated: data.generated ?? 0,
          skipped:   data.skipped   ?? 0,
          total:     data.total     ?? 0,
        })
        router.refresh()
      } else {
        setGenError(type, data.error ?? 'Generate thất bại')
      }
    } catch {
      setGenError(type, 'Lỗi kết nối')
    } finally {
      setLoading(type, false)
    }
  }

  const toggle = async () => {
    setError('')
    setBusy(true)
    try {
      const action = isActive ? 'unpublish' : 'publish'
      const res    = await fetch(`/api/admin/ai-studio/course-generator/${courseId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        setError(data.error ?? 'Thao tác thất bại')
      }
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setBusy(false)
    }
  }

  const anyLoading = Object.values(states).some(s => s.loading) || busy

  return (
    <div className="flex flex-col gap-3">

      {/* ── Top actions ─────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={toggle}
          disabled={anyLoading}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
            isActive
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
          }`}
        >
          {busy ? (
            <Spinner />
          ) : isActive ? (
            '⏸ Hủy xuất bản'
          ) : (
            '✅ Xuất bản khóa học'
          )}
        </button>
        <a
          href="/admin/courses"
          className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-center"
        >
          🔗 Quản lý khóa học
        </a>
      </div>

      {/* ── Pipeline label ─────────────────────────────────────────────── */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          🤖 AI Content Pipeline
        </p>

        <div className="flex flex-col gap-2">
          {PIPELINE.map((step, idx) => {
            const st = states[step.type]
            return (
              <div key={step.type} className="flex flex-col gap-1">
                {/* Step row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4 text-center font-mono">{idx + 1}</span>
                  <button
                    onClick={() => generate(step.type)}
                    disabled={anyLoading}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r ${step.color} text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between`}
                  >
                    <span className="flex items-center gap-2">
                      {st.loading ? <Spinner /> : <span>{step.icon}</span>}
                      <span>{step.label}</span>
                    </span>
                    <span className="text-xs opacity-75">{step.description}</span>
                  </button>
                </div>

                {/* Result badge */}
                {st.result && (
                  <p className="text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 ml-6">
                    ✅ {st.result.generated} chuyên đề mới
                    {st.result.skipped > 0 && ` · ${st.result.skipped} đã có`}
                  </p>
                )}

                {/* Error badge */}
                {st.error && (
                  <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 ml-6">
                    ❌ {st.error}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Global error ────────────────────────────────────────────────── */}
      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </p>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
      <span>Đang generate...</span>
    </span>
  )
}
