'use client'

import { useRouter } from 'next/navigation'
import { ImportExcelButton } from '@/components/admin/ImportExcelButton'

export function StaffImportWrapper() {
  const router = useRouter()
  return (
    <ImportExcelButton
      entityType="staff"
      label="Import nhân viên"
      variant="light"
      onSuccess={() => router.refresh()}
    />
  )
}
