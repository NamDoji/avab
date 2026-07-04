'use client'

import { useState } from 'react'

interface PayrollRow {
  name: string
  phone: string
  role: string
  position: string | null
  contractType: string
  salary: number
  allowance: number
  deduction: number
  net: number
}

interface Props {
  rows: PayrollRow[]
  month: string
}

export default function PayrollExportButton({ rows, month }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      // Dynamic import xlsx to avoid SSR issues
      const XLSX = await import('xlsx')

      const data = [
        [`BẢNG LƯƠNG — ${month}`],
        [],
        ['STT', 'Họ tên', 'SĐT', 'Vai trò', 'Chức vụ', 'Loại HĐ', 'Lương cơ bản', 'Phụ cấp', 'Khấu trừ (10.5%)', 'Thực lĩnh'],
        ...rows.map((r, i) => [
          i + 1,
          r.name,
          r.phone,
          r.role,
          r.position ?? '',
          r.contractType,
          r.salary,
          r.allowance,
          r.deduction,
          r.net,
        ]),
        [],
        [
          '',
          'TỔNG CỘNG',
          '',
          '',
          '',
          '',
          rows.reduce((s, r) => s + r.salary, 0),
          rows.reduce((s, r) => s + r.allowance, 0),
          rows.reduce((s, r) => s + r.deduction, 0),
          rows.reduce((s, r) => s + r.net, 0),
        ],
      ]

      const ws = XLSX.utils.aoa_to_sheet(data)

      // Column widths
      ws['!cols'] = [
        { wch: 5 },
        { wch: 25 },
        { wch: 14 },
        { wch: 12 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, `Bảng lương ${month}`)

      const fileName = `bang-luong-${month.replace(/\//g, '-')}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Xuất file thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading || rows.length === 0}
      className="flex items-center gap-2 bg-white text-red-700 border border-red-200 rounded-2xl px-5 py-2.5 text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-colors shadow-sm"
    >
      {loading ? '⏳ Đang xuất...' : '📊 Xuất bảng lương'}
    </button>
  )
}
