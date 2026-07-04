'use client'

import { useRouter } from 'next/navigation'
import { ImportExcelButton } from '@/components/admin/ImportExcelButton'

export function TeachersImportWrapper() {
  const router = useRouter()
  return (
    <ImportExcelButton
      entityType="teachers"
      label="Import giáo viên"
      onSuccess={() => router.refresh()}
    />
  )
}
