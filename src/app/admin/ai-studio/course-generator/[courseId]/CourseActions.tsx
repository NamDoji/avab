'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CourseActionsProps {
  courseId: string
  isActive: boolean
}

export default function CourseActions({ courseId, isActive }: CourseActionsProps) {
  const router  = useRouter()
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<{ generated: number; total: number } | null>(null)

  const generateLessons = async () => {
    setError('')
    setGenResult(null)
    setGenerating(true)
    try {
      const res = await fetch(`/api/admin/ai-studio/course-generator/${courseId}/generate-lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.success) {
        setGenResult({ generated: data.generated, total: data.total })
        router.refresh()
      } else {
        setError(data.error ?? 'Generate thất bại')
      }
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setGenerating(false)
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <button
          onClick={toggle}
          disabled={busy}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
            isActive
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
          }`}
        >
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              Đang xử lý...
            </span>
          ) : isActive ? (
            '⏸ Hủy xuất bản'
          ) : (
            '✅ Xuất bản khóa học'
          )}
        </button>
        <a
          href={`/admin/courses`}
          className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-center"
        >
          🔗 Quản lý khóa học
        </a>
      </div>
      {/* Generate Lesson Content */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={generateLessons}
          disabled={generating || busy}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              Đang generate nội dung...
            </span>
          ) : (
            '🤖 Generate Lesson Content'
          )}
        </button>
        {genResult && (
          <p className="text-green-600 text-xs bg-green-50 border border-green-200 rounded-xl px-4 py-2 mt-2 text-center">
            ✅ Đã generate {genResult.generated}/{genResult.total} chuyên đề
          </p>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
