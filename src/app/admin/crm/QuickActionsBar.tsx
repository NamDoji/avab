'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LeadsImportWrapper } from './LeadsImportWrapper'

export default function QuickActionsBar() {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/contacts')
      const data = await res.json() as { success: boolean; data?: Array<Record<string, unknown>> }
      if (!data.success || !data.data) return

      const STATUS_MAP: Record<string, string> = {
        NEW: 'Mới', FOLLOWUP: 'Đang tư vấn', WON: 'Đã đăng ký', LOST: 'Không đăng ký',
      }
      const headers = ['Tên', 'SĐT', 'Email', 'Trạng thái', 'Loại', 'Ghi chú', 'Ghi chú admin', 'Ngày tạo']
      const rows = data.data.map((l) => [
        String(l.name ?? ''),
        String(l.phone ?? ''),
        String(l.email ?? ''),
        STATUS_MAP[String(l.status)] ?? String(l.status ?? ''),
        l.type === 'ENROLLMENT' ? 'Đăng ký học' : 'Liên hệ',
        String(l.note ?? ''),
        String(l.note2 ?? ''),
        l.createdAt ? new Date(String(l.createdAt)).toLocaleDateString('vi-VN') : '',
      ])
      const csv = [headers, ...rows]
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
        .join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `crm-leads-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-gray-400 shrink-0">⚡ Thao tác nhanh:</span>

      <Link
        href="/admin/crm/leads/new"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7c2d12, #c2410c)', color: '#fff' }}
      >
        ➕ Thêm Lead
      </Link>

      <LeadsImportWrapper />

      <button
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700 transition-colors disabled:opacity-50"
      >
        {exporting ? '⏳ Đang xuất...' : '⬇️ Xuất báo cáo CSV'}
      </button>

      <Link
        href="/admin/crm/pipeline"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700 transition-colors"
      >
        📋 Xem Pipeline
      </Link>

      <Link
        href="/admin/crm/campaigns"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700 transition-colors"
      >
        📣 Campaigns
      </Link>
    </div>
  )
}
