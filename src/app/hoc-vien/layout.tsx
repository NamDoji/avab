import type { ReactNode } from 'react'
import StudentBottomNav from '@/components/student/StudentBottomNav'

export default function HocVienLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Student-only bottom navigation */}
      <StudentBottomNav />
    </>
  )
}
