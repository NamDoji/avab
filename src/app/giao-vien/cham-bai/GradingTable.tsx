'use client'

import { useState } from 'react'
import GradingModal from './GradingModal'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'

interface SubmissionRow {
  id: string
  studentName: string
  studentPhone: string
  subjectName: string
  content: string
  submittedAt: string
}

interface Props {
  submissions: SubmissionRow[]
}

function contentSnippet(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { text?: string }
    if (parsed.text) return parsed.text.slice(0, 80) + (parsed.text.length > 80 ? '…' : '')
  } catch { /* plain text */ }
  return raw.slice(0, 80) + (raw.length > 80 ? '…' : '')
}

export default function GradingTable({ submissions }: Props) {
  const [active, setActive] = useState<SubmissionRow | null>(null)
  const router = useRouter()

  function handleSuccess() {
    router.refresh()
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Học sinh</th>
              <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Chuyên đề</th>
              <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Nộp lúc</th>
              <th className="pb-3 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Nội dung</th>
              <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {submissions.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3.5 pr-4">
                  <p className="font-semibold text-gray-900">{row.studentName}</p>
                  <p className="text-xs text-gray-400">{row.studentPhone}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="text-gray-700 font-medium line-clamp-1">{row.subjectName}</p>
                </td>
                <td className="py-3.5 pr-4 text-gray-400 hidden md:table-cell whitespace-nowrap">
                  {new Date(row.submittedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="py-3.5 pr-4 text-gray-400 hidden lg:table-cell max-w-xs">
                  <span className="line-clamp-1">{contentSnippet(row.content)}</span>
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => setActive(row)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition"
                  >
                    <Eye size={13} /> Chấm bài
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active && (
        <GradingModal
          submission={active}
          onClose={() => setActive(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
