'use client'

import { useRouter } from 'next/navigation'
import { ImportExcelButton } from '@/components/admin/ImportExcelButton'

export function LeadsImportWrapper() {
  const router = useRouter()
  return (
    <ImportExcelButton
      entityType="leads"
      label="Import khách hàng"
      onSuccess={() => router.refresh()}
    />
  )
}
