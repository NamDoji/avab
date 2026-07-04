'use client'

import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ExcelGrid, { ExcelColumn, ExcelRow } from '@/components/finance/ExcelGrid'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SerializedPayment {
  id: string
  userName: string | null
  phone: string | null
  amount: number
  isFree: boolean
  isPaid: boolean
  paidAt: string | null // ISO string or null
  note: string | null
}

// ─── Columns definition ───────────────────────────────────────────────────────

const COLUMNS: ExcelColumn[] = [
  { key: 'stt',      header: 'STT',      type: 'readonly', width: 50 },
  { key: 'userName', header: 'Họ tên',   type: 'readonly', width: 200 },
  { key: 'phone',    header: 'SĐT',      type: 'readonly', width: 120 },
  { key: 'amount',   header: 'Số tiền',  type: 'currency', width: 140 },
  { key: 'isFree',   header: 'Miễn phí', type: 'checkbox', width: 90 },
  { key: 'isPaid',   header: 'Đã thu',   type: 'checkbox', width: 80 },
  { key: 'paidAt',   header: 'Ngày thu', type: 'date',     width: 130 },
  { key: 'note',     header: 'Ghi chú',  type: 'text',     width: 220 },
]

// amount is currency-displayed but readonly
const READONLY_COLS = ['amount']

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoicePaymentsGrid({
  payments,
}: {
  payments: SerializedPayment[]
}) {
  const router = useRouter()

  const initialData: ExcelRow[] = payments.map((p, idx) => ({
    id:       p.id,
    stt:      idx + 1,
    userName: p.userName ?? '—',
    phone:    p.phone ?? '—',
    amount:   p.amount,
    isFree:   p.isFree,
    isPaid:   p.isPaid,
    paidAt:   p.paidAt ?? '',
    note:     p.note ?? '',
  }))

  const handleSave = useCallback(
    async (changedRows: ExcelRow[]) => {
      const updates = changedRows.map((row) => ({
        id:     String(row.id),
        isPaid: Boolean(row.isPaid),
        isFree: Boolean(row.isFree),
        paidAt: row.paidAt ? String(row.paidAt) : null,
        note:   row.note  ? String(row.note)   : null,
      }))

      const res = await fetch('/api/admin/finance/payments/batch', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ updates }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? 'Lưu thất bại')
      }

      // Refresh server data
      router.refresh()
    },
    [router],
  )

  return (
    <ExcelGrid
      columns={COLUMNS}
      initialData={initialData}
      onSave={handleSave}
      readonlyColumns={READONLY_COLS}
    />
  )
}
