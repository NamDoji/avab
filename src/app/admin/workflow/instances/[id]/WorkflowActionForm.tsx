'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ActionType = 'approve' | 'reject' | 'submit' | 'reassign' | 'comment'

interface WorkflowActionFormProps {
  instanceId: string
  stepName: string
  allowedActions: ActionType[]
}

const ACTION_CONFIG: Record<ActionType, { label: string; color: string; icon: string }> = {
  approve:  { label: 'Phê duyệt',   color: '#059669', icon: '✅' },
  reject:   { label: 'Từ chối',     color: '#dc2626', icon: '❌' },
  submit:   { label: 'Gửi tiếp',    color: '#2563eb', icon: '📤' },
  reassign: { label: 'Chuyển giao', color: '#d97706', icon: '🔄' },
  comment:  { label: 'Bình luận',   color: '#6b7280', icon: '💬' },
}

export default function WorkflowActionForm({ instanceId, stepName, allowedActions }: WorkflowActionFormProps) {
  const router = useRouter()
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null)
  const [note, setNote] = useState('')
  const [nextAssigneeId, setNextAssigneeId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAction) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/admin/workflow/instances/${instanceId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedAction,
          note: note.trim() || undefined,
          nextAssigneeId: nextAssigneeId.trim() || undefined,
        }),
      })

      const json = await res.json() as { success: boolean; message?: string; error?: string }

      if (!res.ok || !json.success) {
        setError(json.error ?? 'Có lỗi xảy ra')
        return
      }

      setSuccess(json.message ?? 'Thành công!')
      setSelectedAction(null)
      setNote('')
      setNextAssigneeId('')
      router.refresh()
    } catch (err) {
      setError('Không thể kết nối đến máy chủ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-black text-sm text-gray-800 mb-4">⚡ Thực hiện hành động</h3>
      <p className="text-xs text-gray-500 mb-4">
        Bước hiện tại: <span className="font-semibold text-gray-700">{stepName}</span>
      </p>

      {/* Success / Error messages */}
      {success && (
        <div className="mb-4 p-3 rounded-xl text-sm font-semibold text-green-700 bg-green-50 border border-green-200">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm font-semibold text-red-700 bg-red-50 border border-red-200">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Action buttons */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-semibold">Chọn hành động</p>
          <div className="flex flex-wrap gap-2">
            {allowedActions.map((action) => {
              const cfg = ACTION_CONFIG[action]
              const isSelected = selectedAction === action
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => setSelectedAction(isSelected ? null : action)}
                  className="text-xs font-bold px-3 py-2 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSelected ? cfg.color : '#e5e7eb',
                    background: isSelected ? cfg.color : 'white',
                    color: isSelected ? 'white' : cfg.color,
                  }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Note */}
        {selectedAction && (
          <>
            <div>
              <label className="text-xs text-gray-500 font-semibold block mb-1">
                Ghi chú {selectedAction === 'reject' ? '(bắt buộc)' : '(tuỳ chọn)'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={
                  selectedAction === 'reject'
                    ? 'Lý do từ chối...'
                    : selectedAction === 'comment'
                    ? 'Nội dung bình luận...'
                    : 'Ghi chú (không bắt buộc)...'
                }
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required={selectedAction === 'reject'}
              />
            </div>

            {selectedAction === 'reassign' && (
              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1">
                  ID người nhận (bắt buộc)
                </label>
                <input
                  type="text"
                  value={nextAssigneeId}
                  onChange={(e) => setNextAssigneeId(e.target.value)}
                  placeholder="User ID..."
                  required
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-black py-2.5 rounded-xl text-white transition-opacity"
              style={{
                background: ACTION_CONFIG[selectedAction].color,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Đang xử lý...' : `${ACTION_CONFIG[selectedAction].icon} Xác nhận ${ACTION_CONFIG[selectedAction].label}`}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
