'use client'

import { useState } from 'react'
import { CheckCircle, X, RefreshCw, ChevronDown } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type ApprovalStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived'

interface ApprovalStatusBadgeProps {
  /** Current approval status */
  status:     ApprovalStatus
  /** API endpoint to PATCH; receives body { approvalStatus: string } */
  patchUrl:   string
  /** Callback after successful update */
  onUpdated?: (newStatus: ApprovalStatus) => void
  /** Show action buttons alongside badge */
  showActions?: boolean
  /** Compact mode — smaller text/padding */
  compact?: boolean
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ApprovalStatus, {
  label:  string
  icon:   string
  color:  string
  bg:     string
  border: string
}> = {
  draft:     { label: 'Bản nháp',    icon: '📝', color: 'text-gray-700',   bg: 'bg-gray-100',   border: 'border-gray-200'   },
  review:    { label: 'Đang duyệt',  icon: '🔍', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  approved:  { label: 'Đã duyệt',    icon: '✅', color: 'text-green-700',  bg: 'bg-green-100',  border: 'border-green-200'  },
  published: { label: 'Đã xuất bản', icon: '🚀', color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200' },
  archived:  { label: 'Lưu trữ',     icon: '📦', color: 'text-red-700',    bg: 'bg-red-100',    border: 'border-red-200'    },
}

const NEXT_ACTIONS: Partial<Record<ApprovalStatus, { status: ApprovalStatus; label: string; color: string }>> = {
  draft:    { status: 'review',    label: 'Gửi Review',  color: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
  review:   { status: 'approved',  label: 'Phê duyệt',   color: 'bg-green-600 hover:bg-green-700 text-white'   },
  approved: { status: 'published', label: 'Xuất bản',    color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
}

const REJECT_TARGETS: Partial<Record<ApprovalStatus, ApprovalStatus>> = {
  review:    'draft',
  approved:  'draft',
  published: 'archived',
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ApprovalStatusBadge({
  status:       initialStatus,
  patchUrl,
  onUpdated,
  showActions = true,
  compact     = false,
}: ApprovalStatusBadgeProps) {
  const [status,   setStatus]   = useState<ApprovalStatus>(initialStatus)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const cfg        = STATUS_CFG[status] ?? STATUS_CFG.draft
  const nextAction = NEXT_ACTIONS[status]
  const rejectTo   = REJECT_TARGETS[status]

  async function transition(newStatus: ApprovalStatus) {
    setLoading(true)
    setError('')
    setShowMenu(false)
    try {
      const res = await fetch(patchUrl, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ approvalStatus: newStatus }),
      })
      const data = await res.json() as { success: boolean; error?: string; approvalStatus?: string }
      if (!data.success) throw new Error(data.error ?? 'Cập nhật thất bại')
      const updated = (data.approvalStatus ?? newStatus) as ApprovalStatus
      setStatus(updated)
      onUpdated?.(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  const paddingCls  = compact ? 'px-2 py-0.5' : 'px-3 py-1.5'
  const textCls     = compact ? 'text-xs'      : 'text-sm'
  const btnPadding  = compact ? 'px-2.5 py-1'  : 'px-3 py-1.5'
  const btnText     = compact ? 'text-xs'      : 'text-xs font-bold'

  return (
    <div className="relative inline-flex flex-col gap-1">
      {/* Badge + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 ${paddingCls} rounded-full font-semibold border ${textCls} ${cfg.bg} ${cfg.color} ${cfg.border}`}
        >
          {cfg.icon} {cfg.label}
        </span>

        {showActions && !loading && (
          <>
            {/* Approve / advance */}
            {nextAction && (
              <button
                onClick={() => void transition(nextAction.status)}
                className={`flex items-center gap-1 ${btnPadding} rounded-full ${btnText} transition ${nextAction.color}`}
              >
                <CheckCircle size={compact ? 10 : 12} />
                {nextAction.label}
              </button>
            )}

            {/* Reject / rollback */}
            {rejectTo && (
              <button
                onClick={() => void transition(rejectTo)}
                className={`flex items-center gap-1 ${btnPadding} rounded-full ${btnText} bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200`}
              >
                <X size={compact ? 10 : 12} />
                Từ chối
              </button>
            )}

            {/* Archive dropdown */}
            {status !== 'archived' && status !== 'draft' && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className={`flex items-center gap-0.5 ${btnPadding} rounded-full ${btnText} bg-gray-100 text-gray-600 hover:bg-gray-200 transition`}
                >
                  <ChevronDown size={compact ? 10 : 12} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[120px]">
                    <button
                      onClick={() => void transition('archived')}
                      className="w-full text-left text-xs px-3 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      📦 Lưu trữ
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {loading && (
          <RefreshCw size={14} className="animate-spin text-gray-400" />
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">{error}</p>
      )}
    </div>
  )
}
