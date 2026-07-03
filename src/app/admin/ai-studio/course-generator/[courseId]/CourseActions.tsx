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
      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
