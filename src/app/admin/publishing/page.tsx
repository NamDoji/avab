import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Publishing Center — AvaB' }

const publishCards = [
  {
    icon: '📖',
    title: 'Xuất giáo trình',
    desc: 'Xuất toàn bộ giáo trình khoá học ra file Word (DOCX) để in ấn và chia sẻ.',
    steps: 'Vào Course Generator → Chọn khoá học → Tab "Preview" → Xuất DOCX',
    href: '/admin/ai-studio/course-generator',
    color: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    badgeColor: '#7c3aed',
    badge: 'DOCX / PDF',
    type: null,
  },
  {
    icon: '📝',
    title: 'Xuất bài tập về nhà',
    desc: 'Sinh và xuất BTVN theo từng buổi học, có đáp án kèm theo.',
    steps: 'Vào Course Generator → Chọn khoá học → Tab "BTVN" → Xuất',
    href: '/admin/ai-studio/course-generator',
    color: 'linear-gradient(135deg, #0891b2 0%, #0284c7 100%)',
    badgeColor: '#0891b2',
    badge: 'Homework',
    type: 'homework',
  },
  {
    icon: '📊',
    title: 'Xuất đề kiểm tra',
    desc: 'Tạo đề kiểm tra từ ngân hàng câu hỏi, xuất Word hoặc PDF.',
    steps: 'Vào Course Generator → Chọn khoá học → Tab "Kiểm tra" → Xuất',
    href: '/admin/ai-studio/course-generator',
    color: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    badgeColor: '#dc2626',
    badge: 'Quiz / Exam',
    type: 'quiz',
  },
  {
    icon: '👩‍🏫',
    title: 'Xuất giáo án giáo viên',
    desc: 'Giáo án chi tiết theo từng buổi: mục tiêu, phương pháp, hoạt động.',
    steps: 'Vào Course Generator → Chọn khoá học → Tab "Giáo án" → Xuất',
    href: '/admin/ai-studio/course-generator',
    color: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    badgeColor: '#059669',
    badge: 'Teacher Guide',
    type: 'teacher-guide',
  },
]

export default async function PublishingPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div
        className="px-6 py-10"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">📤 Publishing Center</h1>
              <p className="text-blue-200 text-sm mt-1">
                Xuất học liệu ra Word, PDF, Slide
              </p>
            </div>
            <Link
              href="/admin/ai-studio/course-generator"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition shadow-md"
            >
              🚀 Đến Course Generator
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Export Cards */}
        <div>
          <h2 className="font-black text-gray-800 text-lg mb-4">📦 Chọn loại xuất bản</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {publishCards.map((card) => (
              <Link
                key={card.title}
                href={
                  card.type
                    ? `${card.href}?type=${card.type}`
                    : card.href
                }
                className="group relative overflow-hidden rounded-2xl p-6 text-white hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md hover:shadow-xl"
                style={{ background: card.color }}
              >
                {/* Decorative blob */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full pointer-events-none"
                  style={{ transform: 'translate(30%, -30%)' }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl leading-none">{card.icon}</span>
                    <span
                      className="text-xs font-black px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">{card.title}</h3>
                  <p className="text-sm text-white/80 mt-1 leading-relaxed">{card.desc}</p>

                  <div
                    className="mt-4 text-xs rounded-xl px-3 py-2 font-medium"
                    style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.85)' }}
                  >
                    📍 {card.steps}
                  </div>

                  <p className="text-sm font-bold mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <span>Mở ngay</span>
                    <span>→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Exports (placeholder) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900 text-lg">🕐 Lịch sử xuất bản</h2>
              <p className="text-xs text-gray-500 mt-0.5">Các file đã xuất gần đây</p>
            </div>
          </div>
          <div className="px-6 py-12 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}
            >
              🚧
            </div>
            <p className="font-bold text-gray-700">Đang phát triển</p>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Hệ thống đang phát triển tính năng lưu lịch sử xuất bản. Hiện tại xuất trực tiếp từ Course Generator.
            </p>
            <Link
              href="/admin/ai-studio/course-generator"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
            >
              🚀 Đến Course Generator
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
        >
          <h3 className="font-black mb-3">💡 Hướng dẫn nhanh</h3>
          <ol className="space-y-2 text-sm text-blue-100">
            <li>
              <span className="font-bold text-white">1.</span> Vào{' '}
              <Link
                href="/admin/ai-studio/course-generator"
                className="text-white underline hover:no-underline"
              >
                Course Generator
              </Link>
            </li>
            <li>
              <span className="font-bold text-white">2.</span> Chọn hoặc tạo một khoá học
            </li>
            <li>
              <span className="font-bold text-white">3.</span> Chọn tab loại nội dung muốn xuất
            </li>
            <li>
              <span className="font-bold text-white">4.</span> Nhấn nút{' '}
              <span className="font-bold text-white">"Xuất DOCX"</span> hoặc{' '}
              <span className="font-bold text-white">"Xuất PDF"</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  )
}
