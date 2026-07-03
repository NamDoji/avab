import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Users, CheckSquare, Newspaper, DollarSign, MessageSquare } from 'lucide-react'

export const metadata = { title: 'Admin Dashboard — AvaB' }

export default async function AdminPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const [coursesCount, usersCount, pendingEnrollments, newsCount, newContacts, aiProjectsCount] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.news.count(),
    prisma.registration.count({ where: { status: 'NEW' } }),
    prisma.aIProject.count(),
  ])

  return (
    <div className="min-h-screen pt-20 bg-gray-50">

      {/* ── Colorful hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white py-12">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-indigo-200 text-sm font-semibold mb-1">🧭 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-1">Dashboard</h1>
          <p className="text-indigo-200 text-sm">Quản trị toàn bộ nền tảng AvaB AI Education</p>

          {/* hero stats */}
          <div className="flex flex-wrap gap-8 mt-6">
            {[
              { label: 'Khóa học', value: coursesCount, color: 'text-yellow-300' },
              { label: 'Học sinh', value: usersCount,   color: 'text-green-300' },
              { label: 'AI Projects', value: aiProjectsCount, color: 'text-pink-300' },
              { label: 'Chờ duyệt', value: pendingEnrollments, color: pendingEnrollments > 0 ? 'text-orange-300' : 'text-white/60' },
            ].map(s => (
              <div key={s.label}>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-indigo-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">

        {/* ── AI Studio — Hero card ──────────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🤖 AI Platform</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* AI Studio — big card */}
            <Link href="/admin/ai-studio/course-generator"
              className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 p-6 text-white hover:scale-[1.01] transition-transform shadow-lg hover:shadow-xl group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-pink-400/20 rounded-full translate-y-1/2 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">🚀</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black">Course Generator</h2>
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">AI</span>
                    </div>
                    <p className="text-purple-200 text-sm">Tạo toàn bộ khóa học bằng AI</p>
                  </div>
                </div>
                <p className="text-purple-100 text-sm mb-4 leading-relaxed">
                  Từ chủ đề → AI sinh đầy đủ: Lý thuyết · Bài tập · Đáp án · Quiz · Hướng dẫn GV · Kịch bản video
                </p>
                <div className="flex flex-wrap gap-2">
                  {['📖 Lý thuyết', '📝 Bài tập', '✅ Đáp án', '📊 Quiz', '👩‍🏫 GV Guide', '🎬 Video'].map(t => (
                    <span key={t} className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">{t}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all">
                  <span>Tạo khóa học ngay</span>
                  <span>→</span>
                </div>
              </div>
            </Link>

            {/* AI Studio projects */}
            <div className="flex flex-col gap-4">
              <Link href="/admin/ai-studio"
                className="flex-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 text-white hover:scale-[1.01] transition-transform shadow-md hover:shadow-lg group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-black text-lg">AI Studio</h3>
                <p className="text-pink-100 text-xs mt-1">Projects workspace · {aiProjectsCount} projects</p>
              </Link>
              <Link href="/admin/question-bank"
                className="flex-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-5 text-white hover:scale-[1.01] transition-transform shadow-md hover:shadow-lg group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-3xl mb-2">🗃️</div>
                <h3 className="font-black text-lg">Question Bank</h3>
                <p className="text-teal-100 text-xs mt-1">Ngân hàng câu hỏi trung tâm</p>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quản lý hệ thống ──────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">⚙️ Quản lý hệ thống</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { href: '/admin/courses',     icon: '📚', label: 'Khoá học',      desc: 'Thêm, sửa, xoá',   color: 'hover:border-purple-300', count: coursesCount },
              { href: '/admin/enrollments', icon: '✅', label: 'Đăng ký',       desc: 'Phê duyệt HS',     color: 'hover:border-orange-300', count: pendingEnrollments, alert: pendingEnrollments > 0 },
              { href: '/admin/users',       icon: '👥', label: 'Người dùng',    desc: 'HS · PH · GV',     color: 'hover:border-teal-300',   count: usersCount },
              { href: '/admin/news',        icon: '📰', label: 'Tin tức',       desc: 'Đăng bài viết',    color: 'hover:border-pink-300',   count: newsCount },
              { href: '/admin/finance',     icon: '💰', label: 'Tài chính',     desc: 'Doanh thu',        color: 'hover:border-emerald-300' },
              { href: '/admin/contacts',    icon: '📩', label: 'Liên hệ',       desc: 'CRM / leads',      color: 'hover:border-blue-300',   count: newContacts, alert: newContacts > 0 },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all ${item.color} ${(item as any).alert ? 'ring-2 ring-orange-400' : ''}`}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-black text-gray-900 text-sm">{item.label}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                {(item as any).count !== undefined && (item as any).count > 0 && (
                  <span className={`absolute top-2 right-2 text-xs font-black px-1.5 py-0.5 rounded-full ${(item as any).alert ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                    {(item as any).count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Portals ───────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🎓 Portals</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/giao-vien', icon: '👨‍🏫', label: 'Giáo viên',  desc: 'Nhận xét buổi học · Hồ sơ lớp', color: 'from-cyan-500 to-teal-600' },
              { href: '/hoc-vien',  icon: '👦',   label: 'Học sinh',   desc: 'Bài tập · AI Tutor · Tiến độ',   color: 'from-blue-500 to-indigo-600' },
              { href: '/phu-huynh',icon: '👨‍👩‍👧‍👦', label: 'Phụ huynh', desc: 'Theo dõi con · Báo cáo',          color: 'from-orange-400 to-amber-500' },
            ].map(p => (
              <Link key={p.href} href={p.href}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.color} p-5 text-white hover:scale-[1.01] transition-transform shadow-sm hover:shadow-md`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-3xl mb-2">{p.icon}</div>
                <h3 className="font-black">{p.label}</h3>
                <p className="text-white/70 text-xs mt-1">{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Standards (small, tucked away) ───────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <Link href="/admin/education-standards"
            className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-sm font-semibold text-gray-700">
            📖 AvaB Standards
          </Link>
        </div>

      </div>
    </div>
  )
}
