import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Users, CheckSquare, Newspaper, DollarSign, MessageSquare } from 'lucide-react'

export const metadata = { title: 'Admin Dashboard — AvaB' }

export default async function AdminPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const [coursesCount, usersCount, pendingEnrollments, newsCount, newContacts, aiProjectsCount, orgsCount] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.news.count(),
    prisma.registration.count({ where: { status: 'NEW' } }),
    prisma.aIProject.count(),
    prisma.organization.count({ where: { deletedAt: null } }),
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

        {/* ── Organization Management ─────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🏢 Tổ chức</p>
          <Link href="/admin/organizations"
            className="flex items-center gap-4 rounded-2xl p-5 text-white hover:scale-[1.01] transition-transform shadow-md"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>🏢</div>
            <div className="flex-1">
              <h3 className="font-black text-white">Organization Management</h3>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(148,163,184,1)' }}>Quản lý trường học, cơ sở, năm học · Multi-Campus · RBAC</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Multi-Campus', 'RBAC', 'Academic Year'].map(t => (
                <span key={t} className="text-xs font-semibold px-2 py-0.5 rounded-lg text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>{t}</span>
              ))}
            </div>
          </Link>
        </div>

        {/* ── School ERP ────────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🏫 School ERP</p>
          <Link href="/admin/erp"
            className="block relative overflow-hidden rounded-3xl p-6 text-white hover:scale-[1.01] transition-transform shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }} />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.15)' }}>🏫</div>
              <div>
                <h3 className="font-black text-xl text-white">School ERP</h3>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(199,210,254,1)' }}>Điểm danh · Phòng học · Sức khỏe · TKB AI · Khen thưởng · Alumni</p>
              </div>
            </div>
          </Link>
        </div>

        {/* ── AI Studio — Hero card ──────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🤖 AI Platform</p>
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

            {/* Right column: 4 small cards */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/ai-studio"
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-4 text-white hover:scale-[1.01] transition-transform shadow-md hover:shadow-lg">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-2xl mb-1.5">✨</div>
                <h3 className="font-black text-sm">AI Studio</h3>
                <p className="text-pink-100 text-xs mt-0.5">{aiProjectsCount} projects</p>
              </Link>
              <Link href="/admin/ai-generator"
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-4 text-white hover:scale-[1.01] transition-transform shadow-md hover:shadow-lg">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-2xl mb-1.5">🤖</div>
                <h3 className="font-black text-sm">AI Generator</h3>
                <p className="text-purple-100 text-xs mt-0.5">Engine modules</p>
              </Link>
              <Link href="/admin/content-studio"
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 p-4 text-white hover:scale-[1.01] transition-transform shadow-md hover:shadow-lg">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-2xl mb-1.5">🎨</div>
                <h3 className="font-black text-sm">Content Studio</h3>
                <p className="text-fuchsia-100 text-xs mt-0.5">Tạo học liệu A–Z</p>
              </Link>
              <Link href="/admin/question-bank"
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-4 text-white hover:scale-[1.01] transition-transform shadow-md hover:shadow-lg">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-2xl mb-1.5">🗃️</div>
                <h3 className="font-black text-sm">Question Bank</h3>
                <p className="text-teal-100 text-xs mt-0.5">Ngân hàng câu hỏi</p>
              </Link>
              <Link href="/admin/gamification"
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 p-4 text-white hover:scale-[1.01] transition-transform shadow-md hover:shadow-lg col-span-2">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-2xl mb-1.5">🎮</div>
                <h3 className="font-black text-sm">Gamification</h3>
                <p className="text-yellow-100 text-xs mt-0.5">XP · Badge · Mission · Leaderboard</p>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Import & Migration ────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">📥 Import & Migration</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/material-import"
              className="relative overflow-hidden rounded-2xl p-5 text-white hover:scale-[1.01] transition-transform shadow-md"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(25%, -50%)' }} />
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-black text-sm text-white">Teaching Material Import</h3>
              <p className="text-xs mt-1" style={{ color: 'rgba(221,214,254,1)' }}>Word · PDF · Quizizz · Google Forms · Kahoot</p>
              <span className="absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>AI</span>
            </Link>
            <Link href="/admin/data-migration"
              className="relative overflow-hidden rounded-2xl p-5 text-white hover:scale-[1.01] transition-transform shadow-md"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(25%, -50%)' }} />
              <div className="text-2xl mb-2">📦</div>
              <h3 className="font-black text-sm text-white">Data Migration Center</h3>
              <p className="text-xs mt-1" style={{ color: 'rgba(186,230,253,1)' }}>Excel · CSV · học sinh · giáo viên · khóa học</p>
              <span className="absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>AI</span>
            </Link>
          </div>
        </div>

        {/* ── Quản lý hệ thống ──────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">⚙️ Quản lý hệ thống</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { href: '/admin/analytics',  icon: '📊', label: 'Analytics',     desc: 'Phân tích học tập', color: 'hover:border-orange-300' },
              { href: '/admin/courses',     icon: '📚', label: 'Khoá học',      desc: 'Thêm, sửa, xoá',   color: 'hover:border-purple-300', count: coursesCount },
              { href: '/admin/enrollments', icon: '✅', label: 'Đăng ký',       desc: 'Phê duyệt HS',     color: 'hover:border-orange-300', count: pendingEnrollments, alert: pendingEnrollments > 0 },
              { href: '/admin/users',       icon: '👥', label: 'Người dùng',    desc: 'HS · PH · GV',     color: 'hover:border-teal-300',   count: usersCount },
              { href: '/admin/news',        icon: '📰', label: 'Tin tức',       desc: 'Đăng bài viết',    color: 'hover:border-pink-300',   count: newsCount },
              { href: '/admin/finance',     icon: '💰', label: 'Tài chính',     desc: 'Doanh thu',        color: 'hover:border-emerald-300' },
              { href: '/admin/contacts',    icon: '📩', label: 'Liên hệ',       desc: 'CRM / leads',      color: 'hover:border-blue-300',   count: newContacts, alert: newContacts > 0 },
              { href: '/admin/organizations', icon: '🏢', label: 'Tổ chức',    desc: 'Multi-campus',     color: 'hover:border-indigo-300', count: orgsCount },
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
          <p className="text-sm font-bold text-gray-700 mb-3">🎓 Portals người dùng</p>

          {/* Học thuật */}
          <p className="text-sm font-semibold text-gray-600 mb-2 ml-0.5">Học thuật</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { href: '/giao-vien', icon: '👨‍🏫', label: 'Giáo viên',  desc: 'Nhận xét · Điểm danh · Lịch dạy · BTVN',        color: 'from-cyan-500 to-teal-600'     },
              { href: '/hoc-vien',  icon: '👦',   label: 'Học sinh',   desc: 'Bài tập · AI Tutor · Thành tích · Tiến độ',     color: 'from-blue-500 to-indigo-600'   },
              { href: '/phu-huynh',icon: '👨‍👩‍👧‍👦', label: 'Phụ huynh', desc: 'Theo dõi con · Báo cáo học tập',   color: 'from-orange-400 to-amber-500'  },
            ].map(p => (
              <Link key={p.href} href={p.href}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.color} p-5 text-white hover:scale-[1.01] transition-transform shadow-md hover:shadow-lg`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-3xl mb-2">{p.icon}</div>
                <h3 className="font-black text-sm">{p.label}</h3>
                <p className="text-white/70 text-xs mt-1 leading-relaxed">{p.desc}</p>
              </Link>
            ))}
          </div>

          {/* Quản lý tổ chức */}
          <p className="text-sm font-semibold text-gray-600 mb-2 ml-0.5">Quản lý tổ chức</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { href: '/admin/analytics',   icon: '🏫', label: 'Ban Giám Hiệu',  desc: 'Tổng quan · KPIs · Reports',       color: 'from-rose-500 to-pink-600'     },
              { href: '/admin/ai-studio',   icon: '📐', label: 'Academic Dir.',  desc: 'Chương trình · Nội dung · AI',     color: 'from-violet-500 to-purple-600' },
              { href: '/admin/enrollments', icon: '📋', label: 'Quản lý lớp',   desc: 'Lớp học · Đăng ký · Học viên',   color: 'from-sky-500 to-blue-600'      },
              { href: '/admin/finance',     icon: '💰', label: 'Kế toán',        desc: 'Học phí · Doanh thu · Xuất báo cáo', color: 'from-emerald-500 to-green-600' },
            ].map(p => (
              <Link key={p.href} href={p.href}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.color} p-4 text-white hover:scale-[1.01] transition-transform shadow-sm hover:shadow-md`}>
                <div className="absolute top-0 right-0 w-14 h-14 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-2xl mb-1.5">{p.icon}</div>
                <h3 className="font-black text-sm">{p.label}</h3>
                <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{p.desc}</p>
              </Link>
            ))}
          </div>

          {/* Vận hành */}
          <p className="text-sm font-semibold text-gray-600 mb-2 ml-0.5">Vận hành</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/admin/contacts',    icon: '📞', label: 'Sales / CSKH',  desc: 'Leads · CRM · Chăm sóc',          color: 'from-yellow-500 to-orange-500' },
              { href: '/admin/users',       icon: '👥', label: 'Người dùng',    desc: 'HS · GV · PH · Phân quyền',       color: 'from-teal-500 to-cyan-600'     },
              { href: '/admin/news',        icon: '📰', label: 'Marketing',     desc: 'Tin tức · Nội dung truyền thông', color: 'from-fuchsia-500 to-pink-600'  },
              { href: '/admin/roles',       icon: '🛡️', label: 'Trưởng BP',    desc: 'Roles · Permissions · Audit',     color: 'from-slate-600 to-gray-700'    },
            ].map(p => (
              <Link key={p.href} href={p.href}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.color} p-4 text-white hover:scale-[1.01] transition-transform shadow-sm hover:shadow-md`}>
                <div className="absolute top-0 right-0 w-14 h-14 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-2xl mb-1.5">{p.icon}</div>
                <h3 className="font-black text-sm">{p.label}</h3>
                <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Data Migration ────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">📦 Data Migration</p>
          <Link href="/admin/data-migration"
            className="block relative overflow-hidden rounded-2xl p-5 text-white hover:scale-[1.01] transition-transform shadow-md"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>📦</div>
              <div>
                <h3 className="font-black text-lg text-white">Data Migration Center</h3>
                <p className="text-sm" style={{ color: 'rgba(186,230,253,1)' }}>Import học sinh · giáo viên · khóa học từ Excel/CSV với AI mapping</p>
              </div>
              <span className="ml-auto flex-shrink-0 text-xs font-black px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>AI</span>
            </div>
          </Link>
        </div>

        {/* ── Hệ thống & Bảo mật + Standards ───────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🔐 Hệ thống & Bảo mật</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { href: '/admin/roles',        icon: '🛡️', label: 'Role Management',  desc: 'Tạo và cấu hình roles',  color: 'from-violet-500 to-purple-600'  },
              { href: '/admin/roles/matrix', icon: '📊', label: 'Permission Matrix', desc: 'Ma trận phân quyền',    color: 'from-indigo-500 to-blue-600'    },
              { href: '/admin/permissions',  icon: '🔑', label: 'Permissions',       desc: 'Danh mục quyền hạn',   color: 'from-cyan-600 to-teal-700'      },
              { href: '/admin/audit',        icon: '📋', label: 'Audit Log',         desc: 'Lịch sử thay đổi',     color: 'from-gray-600 to-gray-800'      },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.color} p-4 text-white hover:scale-[1.01] transition-transform shadow-sm hover:shadow-md`}>
                <div className="absolute top-0 right-0 w-14 h-14 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-2xl mb-1.5">{item.icon}</div>
                <h3 className="font-black text-white text-sm">{item.label}</h3>
                <p className="text-white/70 text-xs mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>

          {/* Workflow Engine */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 mb-3">⚙️ Workflow Engine</p>
            <Link href="/admin/workflow"
              className="block relative overflow-hidden rounded-2xl p-5 text-white hover:scale-[1.01] transition-transform shadow-md"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>⚙️</div>
                <div className="flex-1">
                  <h3 className="font-black text-base text-white">Workflow Engine</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(221,214,254,1)' }}>10 templates · Approval flow · Tuyển sinh · QA · Thu học phí · Nhân sự</p>
                </div>
                <span className="flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>BPM</span>
              </div>
            </Link>
          </div>

          {/* AvaB Standards — full-width dark card */}
          <p className="text-sm font-bold text-gray-700 mb-3">📖 Chương trình & Tiêu chuẩn</p>
          <Link href="/admin/education-standards"
            className="block relative overflow-hidden rounded-3xl p-6 text-white hover:scale-[1.01] transition-transform shadow-lg hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(25%, -50%)' }} />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>📖</div>
                <div>
                  <h3 className="font-black text-xl text-white">AvaB Standards</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'rgba(203,213,225,1)' }}>Tiêu chuẩn giáo dục K12 · Lesson · QA · Publishing · Curriculum</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
               {['K12 Vietnam', 'Cambridge', 'IB', 'IELTS', 'SAT'].map(t => (
                  <span key={t} className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>{t}</span>
                ))}
              </div>
          </Link>
        </div>

      </div>
    </div>
  )
}
