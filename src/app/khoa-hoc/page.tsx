import { prisma } from '@/lib/prisma'
import { KhoaHocPageClient } from '@/components/courses/KhoaHocPageClient'
import { KhoaHocHero } from '@/components/courses/KhoaHocHero'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Khoá học K12 — AvaB',
  description: 'Các khoá học K12 đầy đủ: Toán, Tiếng Việt, Tiếng Anh, Lập trình, Khoa học và nhiều môn khác từ Mầm non đến Lớp 12 tại AvaB',
  openGraph: {
    title: 'Khoá học K12 — AvaB',
    description: 'Các khoá học K12 đầy đủ: Toán, Tiếng Việt, Tiếng Anh, Lập trình, Khoa học và nhiều môn khác từ Mầm non đến Lớp 12 tại AvaB',
    url: 'https://www.avab.vn/khoa-hoc',
  }
}

// Render động để luôn phản ánh khoá học mới nhất từ DB
export const dynamic = 'force-dynamic'

const COURSE_TYPE_META_EMOJIS: Record<string, string> = {
  TOAN: '📐',
  TIENG_ANH: '🇬🇧',
  LAP_TRINH_THUAT_TOAN: '🤖',
  LAP_TRINH_SCRATCH: '🐱',
  LAP_TRINH_PYTHON: '🐍',
  LAP_TRINH_CPP: '⚡',
}

const TYPE_LABELS: Record<string, string> = {
  TOAN: 'Toán',
  TIENG_ANH: 'Tiếng Anh',
  LAP_TRINH_THUAT_TOAN: 'Lập trình tư duy',
  LAP_TRINH_SCRATCH: 'Lập trình Scratch',
  LAP_TRINH_PYTHON: 'Lập trình Python',
  LAP_TRINH_CPP: 'Lập trình C++',
}

export default async function KhoaHocPage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true, isPublic: true },
    select: {
      id: true, code: true, name: true, description: true,
      price: true, courseType: true, isActive: true, grade: true,
      subjectCode: true, subjectName: true, gradeMin: true, gradeMax: true,
      _count: { select: { subjects: true, enrollments: true } },
    },
    orderBy: { createdAt: 'asc' },
  }).catch(() => [])

  return (
    <div className="min-h-screen pt-20">
      <KhoaHocHero />
      <KhoaHocPageClient courses={courses as any} />
    </div>
  )
}
