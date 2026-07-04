'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export interface ExportRecord {
  id: string
  courseId: string
  courseName: string
  exportType: string
  exportLabel: string
  exportedAt: string // ISO string
}

const STORAGE_KEY = 'avab_recent_exports'
const MAX_RECORDS = 20

export function trackExport(record: Omit<ExportRecord, 'id' | 'exportedAt'>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const existing: ExportRecord[] = raw ? JSON.parse(raw) : []
    const newRecord: ExportRecord = {
      ...record,
      id: crypto.randomUUID(),
      exportedAt: new Date().toISOString(),
    }
    const updated = [newRecord, ...existing].slice(0, MAX_RECORDS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // ignore storage errors
  }
}

const TYPE_ICON: Record<string, string> = {
  all: '📦',
  lessons: '📖',
  homework: '📝',
  answers: '✅',
  quiz: '📊',
  'teacher-guide': '👩‍🏫',
  'video-script': '🎬',
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  return `${days} ngày trước`
}

export default function RecentExports() {
  const [records, setRecords] = useState<ExportRecord[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setRecords(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY)
    setRecords([])
  }

  if (records.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-3xl mb-3">📭</p>
        <p className="font-semibold text-gray-700">Chưa có xuất bản nào</p>
        <p className="text-sm text-gray-400 mt-1">
          Khi bạn xuất file, lịch sử sẽ xuất hiện tại đây
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y divide-gray-50">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">
              {TYPE_ICON[rec.exportType] ?? '📄'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{rec.courseName}</p>
              <p className="text-xs text-gray-400">
                {rec.exportLabel} · {timeAgo(rec.exportedAt)}
              </p>
            </div>
            <Link
              href={`/api/admin/ai-studio/course-generator/${rec.courseId}/export?type=${rec.exportType}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition shrink-0"
            >
              ↓ Tải lại
            </Link>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 border-t border-gray-100">
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-red-500 transition font-medium"
        >
          🗑 Xóa lịch sử
        </button>
      </div>
    </div>
  )
}
