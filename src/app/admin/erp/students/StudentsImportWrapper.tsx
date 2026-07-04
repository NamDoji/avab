'use client'

import { useRouter } from 'next/navigation'
import { ImportExcelButton } from '@/components/admin/ImportExcelButton'

export function StudentsImportWrapper() {
  const router = useRouter()
  return (
    <ImportExcelButton
      entityType="students"
      label="Import học sinh"
      onSuccess={() => router.refresh()}
    />
  )
}
