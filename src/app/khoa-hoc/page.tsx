import { prisma } from '@/lib/prisma'
import { KhoaHocPageClient } from '@/components/courses/KhoaHocPageClient'

export const metadata = {
  title: 'Khoá học — AvaB',
  description: 'Các khoá học Toán, Tiếng Anh, Lập trình dành cho trẻ em tại AvaB',
}

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
    where: { isActive: true },
    select: {
      id: true, code: true, name: true, description: true,
      price: true, courseType: true, isActive: true, grade: true,
      _count: { select: { subjects: true, enrollments: true } },
    },
    orderBy: { createdAt: 'asc' },
  }).catch(() => [])

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="gradient-hero text-white py-14">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-4 text-sm font-semibold">
            🌟 Học vui — Học thật — Học hiệu quả
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">Chọn khoá học phù hợp với con</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-base md:text-lg">
            Toán tư duy · Tiếng Anh · Lập trình — Thiết kế riêng cho trẻ em Việt Nam
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <span key={key} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                {COURSE_TYPE_META_EMOJIS[key]} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <KhoaHocPageClient courses={courses as any} />
    </div>
  )
}
