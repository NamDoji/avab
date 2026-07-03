'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ApprovalStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived'

interface ApprovalBadgeProps {
  courseId:      string
  approvalStatus: ApprovalStatus
}

const STATUS_CONFIG: Record<ApprovalStatus, {
  label: string
  icon:  string
  bg:    string
  text:  string
  border: string
}> = {
  draft:     { label: 'Bản nháp',   icon: '📝', bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-200'  },
  review:    { label: 'Đang duyệt', icon: '🔍', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200'},
  approved:  { label: 'Đã duyệt',   icon: '✅', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' },
  published: { label: 'Đã xuất bản',icon: '🚀', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200'},
  archived:  { label: 'Lưu trữ',    icon: '📦', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200'   },
}

const WORKFLOW: ApprovalStatus[] = ['draft', 'review', 'approved', 'published']

const NEXT_STATUS: Partial<Record<ApprovalStatus, { status: ApprovalStatus; label: string }>> = {
  draft:    { status: 'review',    label: '🔍 Gửi Review' },
  review:   { status: 'approved',  label: '✅ Approve'    },
  approved: { status: 'published', label: '🚀 Xuất bản'   },
}

export default function ApprovalBadge({ courseId, approvalStatus }: ApprovalBadgeProps) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const cfg     = STATUS_CONFIG[approvalStatus]
  const nextStep = NEXT_STATUS[approvalStatus]

  const transition = async (newStatus: ApprovalStatus) => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/admin/ai-studio/course-generator/${courseId}/approval`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ approvalStatus: newStatus }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        router.refresh()
      } else {
        setError(data.error ?? 'Thao tác thất bại')
      }
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Status badge + action button */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.icon} {cfg.label}
        </span>

        {nextStep && (
          <button
            onClick={() => void transition(nextStep.status)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : null}
            {nextStep.label}
          </button>
        )}

        {approvalStatus !== 'archived' && approvalStatus !== 'draft' && (
          <button
            onClick={() => void transition('archived')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            📦 Lưu trữ
          </button>
        )}
      </div>

      {/* Workflow steps */}
      <div className="flex items-center gap-1">
        {WORKFLOW.map((step, idx) => {
          const stepCfg = STATUS_CONFIG[step]
          const currentIdx = WORKFLOW.indexOf(approvalStatus)
          const isDone    = WORKFLOW.indexOf(step) < currentIdx
          const isCurrent = step === approvalStatus && approvalStatus !== 'archived'

          return (
            <div key={step} className="flex items-center gap-1">
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  isCurrent
                    ? `${stepCfg.bg} ${stepCfg.text} ring-2 ring-offset-1 ring-current/30`
                    : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? '✓' : stepCfg.icon} {stepCfg.label}
              </div>
              {idx < WORKFLOW.length - 1 && (
                <span className={`text-xs ${isDone ? 'text-emerald-400' : 'text-gray-300'}`}>→</span>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
          {error}
        </p>
      )}
    </div>
  )
}
