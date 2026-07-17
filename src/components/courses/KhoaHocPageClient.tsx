'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowRight, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  SUBJECTS_WITH_ALL,
  GRADE_OPTIONS_WITH_ALL,
  getSubjectMeta as getEduSubjectMeta,
} from '@/lib/constants/education'

// ─── Legacy CourseType (backward compat) ──────────────────────────────────────
type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const LEGACY_META: Record<string, {
  emoji: string; label: string; gradient: string; textColor: string;
  badgeBg: string; tag: string; features: string[]
}> = {
  TOAN: {
    emoji: '📐', label: 'Toán',
    gradient: 'from-cherry-500 to-cherry-600', textColor: 'text-cherry-700', badgeBg: 'bg-cherry-50',
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
    gradient: 'from-cherry-500 to-cherry-700', textColor: 'text-cherry-700', badgeBg: 'bg-cherry-50',
    tag: '🏅 Thi thuật toán',
    features: ['C++ cho học sinh phổ thông', 'Judge tự động chấm bài', 'Bài tập theo đề Codeforces', 'Thi contest & ranking'],
  },
}

// ─── K12 Subject Meta ─────────────────────────────────────────────────────────
interface SubjectMeta {
  emoji: string; label: string; gradient: string; textColor: string;
  badgeBg: string; tag: string; features: string[]
}

const SUBJECT_META: Record<string, SubjectMeta> = {
  THINKING_MATH: {
    emoji: '🧠', label: 'Toán Tư Duy',
    gradient: 'from-cherry-500 to-cherry-600', textColor: 'text-cherry-700', badgeBg: 'bg-cherry-50',
    tag: '🏆 Phổ biến nhất',
    features: ['Tư duy logic & sáng tạo', 'AI phân tích điểm yếu', 'Bài tập tự động chấm', 'Gia sư hướng dẫn'],
  },
  MATH: {
    emoji: '📐', label: 'Toán',
    gradient: 'from-blue-500 to-cherry-600', textColor: 'text-blue-700', badgeBg: 'bg-blue-50',
    tag: '',
    features: ['Toán chuẩn CTGD', 'Luyện thi cuối kỳ', 'AI chấm tự động', 'Theo chuẩn Bộ GD'],
  },
  VIETNAMESE: {
    emoji: '📖', label: 'Tiếng Việt',
    gradient: 'from-red-500 to-orange-500', textColor: 'text-red-700', badgeBg: 'bg-red-50',
    tag: '',
    features: ['Đọc hiểu & viết văn', 'Ngữ pháp & chính tả', 'Luyện thi học kỳ', 'Phù hợp lớp 1-9'],
  },
  ENGLISH: {
    emoji: '🇬🇧', label: 'Tiếng Anh',
    gradient: 'from-green-400 to-teal-600', textColor: 'text-green-700', badgeBg: 'bg-green-50',
    tag: '🆕 Mới nhất',
    features: ['Giao tiếp thực tế', 'AI phát âm & hội thoại', 'Cambridge & IELTS prep', 'Học qua trò chơi'],
  },
  SCIENCE: {
    emoji: '🔬', label: 'Khoa học',
    gradient: 'from-cyan-400 to-blue-500', textColor: 'text-cyan-700', badgeBg: 'bg-cyan-50',
    tag: '',
    features: ['Khoa học tự nhiên', 'Thí nghiệm trực quan', 'Vật lý, Hóa học, Sinh', 'Phù hợp lớp 4-5'],
  },
  HISTORY: {
    emoji: '🏰', label: 'Lịch sử',
    gradient: 'from-amber-400 to-orange-500', textColor: 'text-amber-700', badgeBg: 'bg-amber-50',
    tag: '',
    features: ['Lịch sử Việt Nam & TG', 'Trắc nghiệm & tự luận', 'Timeline trực quan', 'Ôn thi hiệu quả'],
  },
  GEOGRAPHY: {
    emoji: '🌍', label: 'Địa lý',
    gradient: 'from-emerald-400 to-green-600', textColor: 'text-emerald-700', badgeBg: 'bg-emerald-50',
    tag: '',
    features: ['Địa lý Việt Nam & TG', 'Bản đồ & biểu đồ', 'Khí hậu & kinh tế', 'Ôn thi cuối kỳ'],
  },
  PHYSICS: {
    emoji: '⚛️', label: 'Vật lý',
    gradient: 'from-cherry-500 to-cherry-600', textColor: 'text-cherry-700', badgeBg: 'bg-cherry-50',
    tag: '',
    features: ['Vật lý lớp 6-12', 'Công thức & bài tập', 'Thí nghiệm ảo', 'Luyện đề thi THPT'],
  },
  CHEMISTRY: {
    emoji: '🧪', label: 'Hóa học',
    gradient: 'from-lime-400 to-green-600', textColor: 'text-lime-700', badgeBg: 'bg-lime-50',
    tag: '',
    features: ['Hóa lớp 8-12', 'Phương trình phản ứng', 'Bài tập thực hành', 'Luyện đề thi THPT'],
  },
  BIOLOGY: {
    emoji: '🧬', label: 'Sinh học',
    gradient: 'from-teal-400 to-cyan-600', textColor: 'text-teal-700', badgeBg: 'bg-teal-50',
    tag: '',
    features: ['Sinh lớp 6-12', 'Di truyền & tiến hóa', 'Hình ảnh minh họa', 'Luyện đề THPT QG'],
  },
  INFORMATICS: {
    emoji: '💻', label: 'Tin học',
    gradient: 'from-sky-400 to-blue-600', textColor: 'text-sky-700', badgeBg: 'bg-sky-50',
    tag: '',
    features: ['Tin học phổ thông', 'Office & Internet cơ bản', 'Lập trình nhập môn', 'Phù hợp lớp 3-12'],
  },
  CIVIC: {
    emoji: '⚖️', label: 'GDCD',
    gradient: 'from-cherry-400 to-blue-500', textColor: 'text-cherry-700', badgeBg: 'bg-cherry-50',
    tag: '',
    features: ['Pháp luật & đạo đức', 'Kinh tế & xã hội', 'Ôn thi học kỳ', 'Trắc nghiệm'],
  },
  PE: {
    emoji: '⚽', label: 'Thể dục',
    gradient: 'from-orange-400 to-red-500', textColor: 'text-orange-700', badgeBg: 'bg-orange-50',
    tag: '',
    features: ['Lý thuyết thể dục', 'Quy tắc thể thao', 'Sức khỏe & thể chất', 'Phù hợp mọi lớp'],
  },
  MUSIC: {
    emoji: '🎵', label: 'Âm nhạc',
    gradient: 'from-pink-400 to-rose-500', textColor: 'text-pink-700', badgeBg: 'bg-pink-50',
    tag: '',
    features: ['Lý thuyết âm nhạc', 'Ký âm & nhịp điệu', 'Lịch sử âm nhạc', 'Phù hợp lớp 1-9'],
  },
  ART: {
    emoji: '🎨', label: 'Mỹ thuật',
    gradient: 'from-yellow-400 to-amber-500', textColor: 'text-yellow-700', badgeBg: 'bg-yellow-50',
    tag: '',
    features: ['Lý thuyết mỹ thuật', 'Màu sắc & hình khối', 'Lịch sử nghệ thuật', 'Phù hợp lớp 1-9'],
  },
  ALGO: {
    emoji: '🤖', label: 'Thuật toán',
    gradient: 'from-yellow-400 to-orange-500', textColor: 'text-yellow-700', badgeBg: 'bg-yellow-50',
    tag: '🎮 Học qua game',
    features: ['Tư duy thuật toán', 'Robot & maze', 'Thi lập trình', 'Lớp 1-9'],
  },
  SCRATCH: {
    emoji: '🐱', label: 'Scratch',
    gradient: 'from-orange-400 to-pink-500', textColor: 'text-orange-700', badgeBg: 'bg-orange-50',
    tag: '🎨 Sáng tạo',
    features: ['Lập trình kéo thả', 'Game & hoạt hình', 'Scratch IDE tích hợp', 'Sản phẩm cuối khoá'],
  },
  PYTHON: {
    emoji: '🐍', label: 'Python',
    gradient: 'from-teal-400 to-cyan-600', textColor: 'text-teal-700', badgeBg: 'bg-teal-50',
    tag: '💻 Thực chiến',
    features: ['Python cơ bản → nâng cao', 'Bài tập thực hành', 'Code editor tích hợp', 'AI hỗ trợ debug'],
  },
  CPP: {
    emoji: '⚡', label: 'C++',
    gradient: 'from-cherry-500 to-cherry-700', textColor: 'text-cherry-700', badgeBg: 'bg-cherry-50',
    tag: '🏅 Thi thuật toán',
    features: ['C++ phổ thông', 'Judge tự động chấm', 'Bài tập Codeforces', 'Thi contest & ranking'],
  },
  IELTS: {
    emoji: '📝', label: 'IELTS',
    gradient: 'from-sky-400 to-blue-600', textColor: 'text-sky-700', badgeBg: 'bg-sky-50',
    tag: '',
    features: ['4 kỹ năng IELTS', 'Mock test & feedback', 'Lộ trình cá nhân', 'Target 6.5+'],
  },
  CAMBRIDGE: {
    emoji: '🎓', label: 'Cambridge',
    gradient: 'from-rose-400 to-pink-600', textColor: 'text-rose-700', badgeBg: 'bg-rose-50',
    tag: '',
    features: ['Starters/Movers/Flyers', 'KET/PET prep', 'Certificate training', 'British Council method'],
  },
  GENERAL: {
    emoji: '📚', label: 'Tổng hợp',
    gradient: 'from-gray-400 to-slate-600', textColor: 'text-gray-700', badgeBg: 'bg-gray-50',
    tag: '',
    features: ['Đa môn học', 'Ôn tập tổng hợp', 'Học liệu đa dạng', 'Phù hợp mọi lớp'],
  },
}

const SUBJECT_OPTIONS = SUBJECTS_WITH_ALL.map(s => ({
  value: s.value,
  label: s.value === 'all' ? 'Tất cả môn' : `${s.emoji} ${s.label}`,
}))

const GRADE_OPTIONS = [
  ...GRADE_OPTIONS_WITH_ALL.map(g => ({
    value: g.value,
    label: g.value === 'all' ? 'Tất cả' : g.label,
  })),
  { value: 'university', label: 'Đại học' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCourseMeta(subjectCode?: string | null, courseType?: string | null): SubjectMeta {
  if (subjectCode && SUBJECT_META[subjectCode]) return SUBJECT_META[subjectCode]
  if (courseType && LEGACY_META[courseType]) return LEGACY_META[courseType]
  return SUBJECT_META.GENERAL
}

function displayEnrollCount(courseId: string): number {
  let h = 0
  for (let i = 0; i < courseId.length; i++) h = (h * 31 + courseId.charCodeAt(i)) % 1000000
  return 350 + (h % 351)
}

function getGradeLabels(grade: string | null, gradeMin: number | null, gradeMax: number | null): string[] {
  if (grade) return grade.split(',').filter(Boolean)
  if (gradeMin !== null && gradeMax !== null) {
    if (gradeMin === gradeMax) return [String(gradeMin)]
    return [`${gradeMin}-${gradeMax}`]
  }
  return []
}

const SCHOOLS = [
  'Newton', 'Pascal', 'Archimedes', 'Vinschool',
  'Nguyễn Siêu', 'Lương Thế Vinh', 'Đoàn Thị Điểm',
  'Lê Quý Đôn', 'Ngô Sĩ Liên', 'và nhiều trường khác...',
]

const PAGE_SIZE = 12

// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  price: number | null
  courseType: string
  isActive: boolean
  grade: string | null
  subjectCode: string | null
  subjectName: string | null
  gradeMin: number | null
  gradeMax: number | null
  _count: { subjects: number; enrollments: number }
}

interface Props {
  courses: Course[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KhoaHocPageClient({ courses }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return courses.filter(c => {
      // Grade filter
      if (selectedGrade !== 'all') {
        const gradeLabels = getGradeLabels(c.grade, c.gradeMin, c.gradeMax)
        // gradeMin/Max range check (numeric grades)
        const gradeNum = selectedGrade === 'preschool' ? 0 : parseInt(selectedGrade)
        const inGradeField = gradeLabels.includes(selectedGrade)
        const inRange =
          c.gradeMin !== null && c.gradeMax !== null &&
          gradeNum >= c.gradeMin && gradeNum <= c.gradeMax
        // handle combined grade range string like "1-5"
        const inRangeString = gradeLabels.some(g => {
          const m = g.match(/^(\d+)-(\d+)$/)
          return m ? gradeNum >= parseInt(m[1]) && gradeNum <= parseInt(m[2]) : false
        })
        if (!inGradeField && !inRange && !inRangeString) return false
      }
      // Subject filter
      if (selectedSubject !== 'all') {
        if (c.subjectCode !== selectedSubject && c.courseType !== selectedSubject) return false
      }
      return true
    })
  }, [courses, selectedGrade, selectedSubject])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade)
    setPage(1)
  }
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject)
    setPage(1)
  }

  const gradeLabel = GRADE_OPTIONS.find(g => g.value === selectedGrade)?.label ?? ''
  const subjectLabel = SUBJECT_OPTIONS.find(s => s.value === selectedSubject)?.label ?? ''

  return (
    <div className="container-custom py-12">

      {/* Grade Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-bold text-gray-600 mr-1">🎓 Lớp:</span>
        {GRADE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleGradeChange(opt.value)}
            className={`px-3 py-1.5 rounded-2xl text-sm font-bold transition-all ${
              selectedGrade === opt.value
                ? 'bg-cherry-600 text-white shadow-md shadow-cherry-200'
                : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-cherry-300 hover:text-cherry-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Subject Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-sm font-bold text-gray-600 mr-1">📚 Môn:</span>
        {SUBJECT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleSubjectChange(opt.value)}
            className={`px-3 py-1.5 rounded-2xl text-sm font-bold transition-all ${
              selectedSubject === opt.value
                ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-teal-300 hover:text-teal-600'
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
          {selectedGrade !== 'all' ? ` · ${gradeLabel}` : ''}
          {selectedSubject !== 'all' ? ` · ${subjectLabel}` : ''}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500">
            {selectedGrade === 'all' && selectedSubject === 'all'
              ? 'Đang cập nhật khoá học mới. Vui lòng quay lại sau!'
              : 'Chưa có khoá học phù hợp với bộ lọc này. Hãy thử lại nhé!'}
          </p>
          {(selectedGrade !== 'all' || selectedSubject !== 'all') && (
            <button
              onClick={() => { setSelectedGrade('all'); setSelectedSubject('all'); setPage(1) }}
              className="mt-4 btn-primary !py-2 !px-6 !text-sm"
            >
              Xem tất cả khoá học
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((course) => {
              const meta = getCourseMeta(course.subjectCode, course.courseType)
              const gradeLabels = getGradeLabels(course.grade, course.gradeMin, course.gradeMax)
              const displaySubjectLabel = course.subjectName ||
                (course.subjectCode ? (SUBJECT_META[course.subjectCode]?.label ?? meta.label) : meta.label)
              return (
                <div key={course.id} className="bg-white rounded-4xl border-2 border-gray-100 overflow-hidden shadow-sm card-hover flex flex-col">
                  {/* Banner */}
                  <div className={`relative h-44 bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2 drop-shadow-lg">{meta.emoji}</div>
                      <div className="text-sm font-bold bg-white/20 rounded-full px-4 py-1">{displaySubjectLabel}</div>
                    </div>
                    {meta.tag && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">
                        {meta.tag}
                      </div>
                    )}
                    {gradeLabels.length > 0 && (
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {gradeLabels.map(g => (
                          <span key={g} className="bg-white/90 text-cherry-700 text-xs font-black px-2.5 py-1 rounded-full">
                            {/^\d+$/.test(g) ? `Lớp ${g}` : g === 'preschool' ? 'Mầm non' : g}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-white/20 text-white text-xs font-mono px-2 py-0.5 rounded">
                      {course.code}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-black text-gray-900 text-lg leading-snug mb-2">{course.name}</h3>
                    {course.description && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-3 whitespace-pre-line">{course.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} className="text-cherry-400" />
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
                className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white border-2 border-gray-100 text-gray-600 font-bold hover:border-cherry-300 hover:text-cherry-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-2xl font-black text-sm transition-all ${
                    p === safePage
                      ? 'bg-cherry-600 text-white shadow-md'
                      : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-cherry-300 hover:text-cherry-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white border-2 border-gray-100 text-gray-600 font-bold hover:border-cherry-300 hover:text-cherry-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Tiếp <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer banner */}
      <div className="mt-12 bg-gradient-to-br from-cherry-50 to-teal-50 rounded-4xl p-8 text-center border border-cherry-100">
        <h2 className="text-xl font-black text-gray-900 mb-2">🏫 Khoá học luyện thi các trường chất lượng cao</h2>
        <p className="text-gray-500 text-sm mb-5">Chương trình xây dựng theo cấu trúc đề thi của các trường chất lượng cao:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SCHOOLS.map((s) => (
            <span key={s} className="bg-white border border-cherry-200 text-cherry-700 font-semibold px-4 py-1.5 rounded-full text-sm">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
