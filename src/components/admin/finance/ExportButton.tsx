'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface ExportButtonProps {
  /** 'header' = white/transparent for dark bg | 'card' = styled as quick-action card */
  variant?: 'header' | 'card'
}

export function ExportButton({ variant = 'header' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/finance/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `avab-finance-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Không thể xuất file. Vui lòng thử lại.')
    }
    setExporting(false)
  }

  if (variant === 'card') {
    return (
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center justify-center gap-2.5 rounded-2xl px-5 py-4 font-bold text-sm text-white transition hover:opacity-90 shadow-sm disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
      >
        {exporting ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <span className="text-xl">📤</span>
        )}
        {exporting ? 'Đang xuất...' : 'Xuất báo cáo Excel'}
      </button>
    )
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm disabled:opacity-50 border border-white/30"
    >
      {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
      {exporting ? 'Đang xuất...' : 'Xuất Excel'}
    </button>
  )
}
