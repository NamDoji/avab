'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowRight, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const COURSE_TYPE_META: Record<CourseType, {
  emoji: string; label: string; gradient: string; textColor: string
  badgeBg: string; tag: string; features: string[]
}> = {
  TOAN: {
    emoji: '📐', label: 'Toán',
    gradient: 'from-purple-500 to-indigo-600', textColor: 'text-purple-700', badgeBg: 'bg-purple-50',
    tag: '🏆 Phổ biến nhất',
    features: ['Toán tư duy & luyện thi', 'Bài tập tự động chấm 24/7', 'AI phân tích điểm yếu', 'Có gia sư hướng dẫn'],
  },
  TIENG_ANH: {
    emoji: '🇬🇧', label: 'Tiếng Anh',
    gradient: 'from-green-400 to-teal-600', textColor: 'text-green-700', badgeBg: 'bg-green-50',
    tag: '🆕 Mới nhất',
    features: ['English cho trẻ 5-6 tuổi', 'Học qua trò chơi & hình ảnh', 'AI phát âm & hội thoại', 'Không học thuộc lòng'],
  },
  LAP_TRINH_THUAT_TOAN: {
    emoji: '🤖', label: 'Lập trình tư duy',
    gradient: 'from-yellow-400 to-orange-500', textColor: 'text-yellow-700', badgeBg: 'bg-yellow-50',
    tag: '🎮 Học qua game',
    features: ['Tư duy thuật toán lớp 1-2', 'Điều khiển robot vui nhộn', 'Maze & kéo thả lệnh', 'Không cần biết code'],
  },
  LAP_TRINH_SCRATCH: {
    emoji: '🐱', label: 'Lập trình Scratch',
    gradient: 'from-orange-400 to-pink-500', textColor: 'text-orange-700', badgeBg: 'bg-orange-50',
    tag: '🎨 Sáng tạo',
    features: ['Lập trình kéo thả cho 7-10t', 'Tạo game, hoạt hình, quiz', 'Scratch IDE tích hợp', 'Có sản phẩm cuối khoá'],
  },
  LAP_TRINH_PYTHON: {
    emoji: '🐍', label: 'Lập trình Python',
    gradient: 'from-teal-400 to-cyan-600', textColor: 'text-teal-700', badgeBg: 'bg-teal-50',
    tag: '💻 Thực chiến',
    features: ['Python cơ bản đến nâng cao', 'Bài tập thực hành', 'Code editor tích hợp', 'AI hỗ trợ debug'],
  },
  LAP_TRINH_CPP: {
    emoji: '⚡', label: 'Lập trình C++',
    gradient: 'from-violet-500 to-purple-700', textColor: 'text-violet-700', badgeBg: 'bg-violet-50',
    tag: '🏅 Thi thuật toán',
    features: ['C++ cho học sinh phổ thông', 'Judge tự động chấm bài', 'Bài tập theo đề Codeforces', 'Thi contest & ranking'],
  },
}

function displayEnrollCount(courseId: string): number {
  let h = 0
  for (let i = 0; i < courseId.length; i++) h = (h * 31 + courseId.charCodeAt(i)) % 1000000
  return 350 + (h % 351)
}

const SCHOOLS = [
  'Newton', 'Pascal', 'Archimedes', 'Vinschool',
  'Nguyễn Siêu', 'Lương Thế Vinh', 'Đoàn Thị Điểm',
  'Lê Quý Đôn', 'Ngô Sĩ Liên', 'và nhiều trường khác...',
]

const PAGE_SIZE = 12

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  price: number | null
  courseType: CourseType
  isActive: boolean
  grade: string | null
  _count: { subjects: number; enrollments: number }
}

interface Props {
  courses: Course[]
}

export function KhoaHocPageClient({ courses }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [page, setPage] = useState(1)

  const gradeOptions = [
    { value: 'all', label: 'Tất cả' },
    ...Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: `Lớp ${i + 1}` })),
  ]

  const filtered = useMemo(() => {
    if (selectedGrade === 'all') return courses
    // Chỉ hiện khoá đúng lớp đã chọn (không kèm khoá không có lớp)
    return courses.filter(c => c.grade === selectedGrade)
  }, [courses, selectedGrade])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade)
    setPage(1)
  }

  return (
    <div className="container-custom py-12">
      {/* Grade Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-sm font-bold text-gray-600 mr-1">🎓 Lọc theo lớp:</span>
        {gradeOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleGradeChange(opt.value)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              selectedGrade === opt.value
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="text-sm text-gray-400 mb-4">
          Hiển thị {paginated.length} / {filtered.length} khoá học
          {selectedGrade !== 'all' ? ` cho Lớp ${selectedGrade}` : ''}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500">
            {selectedGrade === 'all'
              ? 'Đang cập nhật khoá học mới. Vui lòng quay lại sau!'
              : `Chưa có khoá học cho Lớp ${selectedGrade}. Hãy thử xem "Tất cả" nhé!`}
          </p>
          {selectedGrade !== 'all' && (
            <button onClick={() => handleGradeChange('all')}
              className="mt-4 btn-primary !py-2 !px-6 !text-sm">
              Xem tất cả khoá học
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((course) => {
              const cType = course.courseType ?? 'TOAN'
              const meta = COURSE_TYPE_META[cType] ?? COURSE_TYPE_META.TOAN
              return (
                <div key={course.id} className="bg-white rounded-4xl border-2 border-gray-100 overflow-hidden shadow-sm card-hover flex flex-col">
                  {/* Banner */}
                  <div className={`relative h-44 bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2 drop-shadow-lg">{meta.emoji}</div>
                      <div className="text-sm font-bold bg-white/20 rounded-full px-4 py-1">{meta.label}</div>
                    </div>
                    {meta.tag && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">
                        {meta.tag}
                      </div>
                    )}
                    {course.grade && (
                      <div className="absolute top-3 left-3 bg-white/90 text-purple-700 text-xs font-black px-2.5 py-1 rounded-full">
                        Lớp {course.grade}
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-white/20 text-white text-xs font-mono px-2 py-0.5 rounded">
                      {course.code}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-black text-gray-900 text-lg leading-snug mb-2">{course.name}</h3>
                    {course.description && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">{course.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} className="text-purple-400" />
                        {course._count.subjects} chuyên đề
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-teal-400" />
                        Học online
                      </span>
                      <span className="text-orange-500 font-semibold">
                        👥 {displayEnrollCount(course.id).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <ul className="space-y-1.5 mb-5 text-sm flex-1">
                      {meta.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle2 size={14} className="text-teal-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className={`${meta.badgeBg} rounded-2xl px-4 py-3 text-center mb-4`}>
                      <div className={`text-2xl font-black ${meta.textColor}`}>
                        {course.price ? `${course.price.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ'}
                      </div>
                      <div className="text-xs text-gray-500">/ khoá học trọn gói</div>
                    </div>

                    <Link href={`/khoa-hoc/${course.id}`}
                      className="btn-primary !py-2.5 !text-sm flex items-center justify-center gap-1.5 w-full">
                      Xem chi tiết <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white border-2 border-gray-100 text-gray-600 font-bold hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-2xl font-black text-sm transition-all ${
                    p === safePage
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-purple-300 hover:text-purple-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white border-2 border-gray-100 text-gray-600 font-bold hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Tiếp <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer banner */}
      <div className="mt-12 bg-gradient-to-br from-purple-50 to-teal-50 rounded-4xl p-8 text-center border border-purple-100">
        <h2 className="text-xl font-black text-gray-900 mb-2">🏫 Khoá Toán luyện thi các trường</h2>
        <p className="text-gray-500 text-sm mb-5">Chương trình xây dựng theo cấu trúc đề thi của các trường chất lượng cao:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SCHOOLS.map((s) => (
            <span key={s} className="bg-white border border-purple-200 text-purple-700 font-semibold px-4 py-1.5 rounded-full text-sm">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
