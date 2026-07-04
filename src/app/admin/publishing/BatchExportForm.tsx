'use client'

import { useState } from 'react'
import { trackExport } from './RecentExports'

interface Course {
  id: string
  name: string
  code: string
}

const EXPORT_TYPES = [
  { key: 'all',            label: 'Toàn bộ khóa học', icon: '📦' },
  { key: 'lessons',        label: 'Lý thuyết',         icon: '📖' },
  { key: 'homework',       label: 'Bài tập',            icon: '📝' },
  { key: 'answers',        label: 'Đáp án',             icon: '✅' },
  { key: 'quiz',           label: 'Kiểm tra',           icon: '📊' },
  { key: 'teacher-guide',  label: 'Giáo án',            icon: '👩‍🏫' },
]

export default function BatchExportForm({ courses }: { courses: Course[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [exportType, setExportType] = useState('all')
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState(0)

  function toggleCourse(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === courses.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(courses.map(c => c.id)))
    }
  }

  async function handleBatchExport() {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    const typeLabel = EXPORT_TYPES.find(t => t.key === exportType)?.label ?? exportType
    setExporting(true)
    setDone(0)
    setTotal(ids.length)

    for (const courseId of ids) {
      const course = courses.find(c => c.id === courseId)!
      const url = `/api/admin/ai-studio/course-generator/${courseId}/export?type=${exportType}`
      try {
        // Trigger download in a new tab
        window.open(url, '_blank')
        trackExport({ courseId, courseName: course.name, exportType, exportLabel: typeLabel })
      } catch {
        // continue
      }
      setDone(d => d + 1)
      // Small delay between downloads
      await new Promise(r => setTimeout(r, 600))
    }

    setExporting(false)
    setSelected(new Set())
    setDone(0)
    setTotal(0)
  }

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Export type selector */}
      <div>
        <p className="text-sm font-bold text-gray-700 mb-2">Loại nội dung xuất</p>
        <div className="flex flex-wrap gap-2">
          {EXPORT_TYPES.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setExportType(t.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
              style={{
                background: exportType === t.key ? '#eff6ff' : '#f9fafb',
                border: `1.5px solid ${exportType === t.key ? '#3b82f6' : '#e5e7eb'}`,
                color: exportType === t.key ? '#1d4ed8' : '#6b7280',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-700">Chọn khóa học</p>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            {selected.size === courses.length ? '☑ Bỏ chọn tất cả' : '☐ Chọn tất cả'}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
          {courses.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-gray-400">Không có khóa học nào có nội dung</p>
          ) : (
            courses.map(course => (
              <label
                key={course.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selected.has(course.id)}
                  onChange={() => toggleCourse(course.id)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{course.name}</p>
                  <p className="text-xs text-gray-400">{course.code}</p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Progress */}
      {exporting && total > 0 && (
        <div className="rounded-xl bg-blue-50 px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-blue-700">⏳ Đang xuất…</span>
            <span className="text-xs text-blue-500">{done}/{total}</span>
          </div>
          <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Action */}
      <button
        type="button"
        onClick={handleBatchExport}
        disabled={selected.size === 0 || exporting}
        className="w-full py-3.5 rounded-xl font-black text-sm text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: selected.size === 0 || exporting
            ? '#93c5fd'
            : 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
        }}
      >
        {exporting
          ? `⏳ Đang xuất ${done}/${total}…`
          : selected.size === 0
            ? '📦 Chọn khóa học để xuất'
            : `📦 Xuất ${selected.size} khóa học`}
      </button>
    </div>
  )
}
