'use client'

import { useState, useCallback } from 'react'

interface VersionMeta {
  id: string
  version: number
  label: string | null
  createdBy: string | null
  createdAt: string
}

interface ContentVersionHistoryProps {
  entityId: string
  entityType: string
  currentContent: string
}

export default function ContentVersionHistory({
  entityId,
  entityType,
  currentContent,
}: ContentVersionHistoryProps) {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<VersionMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadVersions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/content/versions?entityId=${encodeURIComponent(entityId)}&entityType=${encodeURIComponent(entityType)}`
      )
      const data = await res.json() as { success: boolean; data?: VersionMeta[] }
      if (data.success && data.data) setVersions(data.data.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }, [entityId, entityType])

  function toggle() {
    if (!open) loadVersions()
    setOpen((v) => !v)
    setPreviewId(null)
    setPreviewContent(null)
    setMessage(null)
  }

  async function saveVersion() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/content/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, entityType, content: currentContent }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setMessage({ type: 'success', text: 'Đã lưu phiên bản hiện tại!' })
        loadVersions()
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Lỗi khi lưu' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Không thể kết nối máy chủ' })
    } finally {
      setSaving(false)
    }
  }

  async function viewVersion(id: string) {
    if (previewId === id) {
      setPreviewId(null)
      setPreviewContent(null)
      return
    }
    setPreviewId(id)
    // Fetch full content of the version
    const res = await fetch(
      `/api/admin/content/versions?entityId=${encodeURIComponent(entityId)}&entityType=${encodeURIComponent(entityType)}`
    )
    const data = await res.json() as { success: boolean; data?: VersionMeta[] }
    if (data.success) {
      // Full content is not in list response, show a note
      setPreviewContent('(Nội dung chi tiết không có trong danh sách — khôi phục để xem toàn bộ)')
    }
  }

  async function restoreVersion(id: string) {
    if (!confirm('Khôi phục phiên bản này sẽ ghi đè nội dung hiện tại. Tiếp tục?')) return
    setRestoringId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/content/versions/${id}/restore`, {
        method: 'POST',
      })
      const data = await res.json() as { success: boolean; message?: string; error?: string }
      if (data.success) {
        setMessage({ type: 'success', text: data.message ?? 'Đã khôi phục!' })
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Lỗi khi khôi phục' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Không thể kết nối máy chủ' })
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'white',
        marginTop: '16px',
      }}
    >
      {/* Header */}
      <button
        onClick={toggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '14px', color: '#374151' }}>
          🕐 Lịch sử phiên bản
        </span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 20px 16px', borderTop: '1px solid #f3f4f6' }}>
          {/* Save current version */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {versions.length > 0 ? `${versions.length} phiên bản đã lưu` : 'Chưa có phiên bản nào'}
            </span>
            <button
              onClick={saveVersion}
              disabled={saving}
              style={{
                background: saving ? '#f3f4f6' : '#6366f1',
                color: saving ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? '...' : '💾 Lưu phiên bản hiện tại'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '10px',
                background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: message.type === 'success' ? '#065f46' : '#991b1b',
              }}
            >
              {message.text}
            </div>
          )}

          {/* Version list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
              Đang tải...
            </div>
          ) : versions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
              Chưa có phiên bản nào được lưu
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {versions.map((v) => (
                <div key={v.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: previewId === v.id ? '#f0f9ff' : '#f9fafb',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '13px', color: '#374151' }}>
                        {v.label ?? `v${v.version}`}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {new Date(v.createdAt).toLocaleString('vi-VN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => viewVersion(v.id)}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      👁️ Xem
                    </button>
                    <button
                      onClick={() => restoreVersion(v.id)}
                      disabled={restoringId === v.id}
                      style={{
                        background: restoringId === v.id ? '#f3f4f6' : '#fef3c7',
                        color: restoringId === v.id ? '#9ca3af' : '#92400e',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: restoringId === v.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {restoringId === v.id ? '...' : '↩️ Khôi phục'}
                    </button>
                  </div>
                  {previewId === v.id && previewContent && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '10px 12px',
                        background: '#f0f9ff',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#374151',
                        fontStyle: 'italic',
                      }}
                    >
                      {previewContent}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
