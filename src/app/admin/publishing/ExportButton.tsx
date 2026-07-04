'use client'

import { trackExport } from './RecentExports'

interface Props {
  courseId: string
  courseName: string
  exportType: string
  exportLabel: string
  variant?: 'primary' | 'ghost'
}

export default function ExportButton({ courseId, courseName, exportType, exportLabel, variant = 'ghost' }: Props) {
  function handleClick() {
    trackExport({ courseId, courseName, exportType, exportLabel })
    window.open(
      `/api/admin/ai-studio/course-generator/${courseId}/export?type=${exportType}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (variant === 'primary') {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)' }}
      >
        📦 Xuất ALL
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition hover:scale-105 active:scale-95"
      style={{
        background: '#f0f9ff',
        color: '#0369a1',
        border: '1px solid #bae6fd',
      }}
    >
      ↓ {exportLabel}
    </button>
  )
}
