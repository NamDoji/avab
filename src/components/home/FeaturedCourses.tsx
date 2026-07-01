import Link from 'next/link'
import { ArrowRight, Star, BookOpen, Video, ClipboardCheck } from 'lucide-react'

const courses = [
  {
    id: 1,
    name: 'Toán Tư Duy Nền Tảng',
    emoji: '🌱',
    level: 'Cơ bản',
    levelColor: 'text-green-600 bg-green-50',
    subjects: 8,
    desc: 'Xây dựng nền tảng tư duy logic vững chắc cho trẻ 5 tuổi qua các bài toán hình ảnh trực quan.',
    features: ['Lý thuyết có hình ảnh minh hoạ', 'Video bài giảng', 'Bài tập tự luyện'],
    price: '1,5 triệu/năm',
    popular: false,
  },
  {
    id: 2,
    name: 'Luyện Thi Học Bổng Lớp 1',
    emoji: '🏆',
    level: 'Flagship',
    levelColor: 'text-purple-600 bg-purple-50',
    subjects: 25,
    desc: 'Toàn bộ 25 chuyên đề luyện thi học bổng vào lớp 1 các trường chất lượng cao: Lương Thế Vinh, Nguyễn Siêu, Vinschool… Kèm khoá học nhóm có gia sư (tối đa 15 bạn).',
    features: ['25 chuyên đề Toán Tư Duy', 'Khoá học nhóm có gia sư', 'AI lộ trình cá nhân', 'Chấm bài tự động + Bảng xếp hạng'],
    price: '1,5 triệu/năm',
    popular: true,
  },
  {
    id: 3,
    name: 'Mở rộng — Sắp ra mắt',
    emoji: '🌱',
    level: '2026+',
    levelColor: 'text-teal-600 bg-teal-50',
    subjects: 0,
    desc: 'Toán Tư Duy lớp 2–5, Tiếng Anh tư duy, Lập trình cho trẻ. Đặng ký danh sách chờ để ưu tiên nhận thông báo đầu tiên.',
    features: ['Toán lớp 1–9', 'Tiếng Anh Tư Duy', 'Lập trình cơ bản'],
    price: 'Sắp ra mắt',
    popular: false,
  },
]

export function FeaturedCourses() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-purple-600 font-bold uppercase text-sm tracking-wider">Khoá học</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-4">
            Chương trình{' '}
            <span className="text-gradient">đỉnh cao</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Hệ thống khoá học được thiết kế khoa học, từng bước giúp con tự tin chinh phục mọi kỳ thi.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`relative rounded-4xl border-2 overflow-hidden card-hover ${
                course.popular
                  ? 'border-purple-400 shadow-xl shadow-purple-100'
                  : 'border-gray-100 shadow-md'
              }`}
            >
              {course.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-center text-xs font-bold py-2 tracking-wider">
                  ⭐ PHỔ BIẾN NHẤT
                </div>
              )}

              <div className={`p-6 ${course.popular ? 'pt-10' : ''}`}>
                <div className="text-5xl mb-4">{course.emoji}</div>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${course.levelColor}`}>
                  {course.level}
                </span>
                <h3 className="text-xl font-black text-gray-900 mb-3">{course.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{course.desc}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} className="text-purple-500" />
                    {course.subjects} chuyên đề
                  </span>
                </div>

                {/* Price */}
                <div className={`text-center rounded-2xl py-2.5 px-4 mb-4 ${
                  course.popular ? 'bg-purple-100' : 'bg-gray-50'
                }`}>
                  <span className={`text-xl font-black ${
                    course.popular ? 'text-purple-700' : 'text-gray-500'
                  }`}>{course.price}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {course.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/khoa-hoc"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold transition-all ${
                    course.popular
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  Xem chi tiết <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/khoa-hoc" className="btn-secondary inline-flex items-center gap-2">
            Xem tất cả khoá học <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
