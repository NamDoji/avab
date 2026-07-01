import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { BookOpen, Star, ArrowRight, CheckCircle2, Clock } from 'lucide-react'

export const metadata = {
  title: 'Khoá học — AvaB',
  description: 'Các khoá học luyện thi học bổng vào lớp 1 tại AvaB',
}

// Số đăng ký hiển thị ổn định (seed từ courseId, range 350-700)
function displayEnrollCount(courseId: string): number {
  let h = 0
  for (let i = 0; i < courseId.length; i++) h = (h * 31 + courseId.charCodeAt(i)) % 1000000
  return 350 + (h % 351)
}

const SCHOOLS = [
  'Newton', 'Pascal', 'Archimedes', 'Vinschool',
  'Nguyễn Siêu', 'Lương Thế Vinh', 'Đoàn Thị Điểm',
  'Lê Quý Đôn', 'Ngô Sĩ Liên', 'và nhiều trường khác...'
]

export default async function KhoaHocPage() {
  const session = await auth()
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
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
            🏆 Luyện thi học bổng vào Lớp 1
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">Chọn khoá học muốn học</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-base md:text-lg">
            Chuẩn bị cho con tự tin chinh phục kỳ thi tuyển sinh vào các trường chất lượng cao:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {SCHOOLS.map((s) => (
              <span key={s} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500">Đang cập nhật khoá học mới. Vui lòng quay lại sau!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-4xl border-2 border-purple-100 overflow-hidden shadow-sm card-hover flex flex-col">
                {/* Course image/banner */}
                <div className="relative h-44 gradient-hero flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-2">🧮</div>
                    <div className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
                      {course.code}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">
                    ⭐ Phổ biến nhất
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-black text-gray-900 text-lg leading-snug mb-2">
                    {course.name}
                  </h3>
                  {course.description && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {course.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} className="text-purple-400" />
                      {course._count.subjects} chuyên đề
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-teal-400" />
                      Khoá học nhóm
                    </span>
                    <span className="flex items-center gap-1 text-orange-500 font-semibold">
                      👥 {displayEnrollCount(course.id).toLocaleString('vi-VN')} học viên
                    </span>
                  </div>

                  {/* Includes */}
                  <ul className="space-y-1.5 mb-5 text-sm">
                    {[
                      '25 chuyên đề Toán Tư Duy',
                      'Khoá học nhóm có gia sư',
                      'AI phân tích lộ trình cá nhân',
                      'Chấm bài tự động 24/7',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 size={14} className="text-teal-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="bg-purple-50 rounded-2xl px-4 py-3 text-center mb-4">
                    <div className="text-2xl font-black text-purple-700">1.500.000 VNĐ</div>
                    <div className="text-xs text-gray-500">/ năm / học sinh — trọn gói</div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/khoa-hoc/${course.id}`}
                    className="btn-primary !py-2.5 !text-sm flex items-center justify-center gap-1.5 w-full"
                  >
                    Xem chi tiết <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schools */}
        <div className="mt-12 bg-gradient-to-br from-purple-50 to-teal-50 rounded-4xl p-8 text-center border border-purple-100">
          <h2 className="text-xl font-black text-gray-900 mb-2">🏫 Các trường con có thể thi vào</h2>
          <p className="text-gray-500 text-sm mb-5">Chương trình AvaB được xây dựng đúng theo cấu trúc đề thi của các trường:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SCHOOLS.map((s) => (
              <span key={s} className="bg-white border border-purple-200 text-purple-700 font-semibold px-4 py-1.5 rounded-full text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
