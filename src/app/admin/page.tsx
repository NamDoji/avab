import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Users, CheckSquare, Newspaper, DollarSign, MessageSquare, GraduationCap, Brain, FileText } from 'lucide-react'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const [coursesCount, usersCount, pendingEnrollments, newsCount, newContacts] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.news.count(),
    prisma.registration.count({ where: { status: 'NEW' } }),
  ])

  const stats = [
    { label: 'Khoá học', value: coursesCount, icon: BookOpen, href: '/admin/courses', color: 'from-purple-500 to-purple-700' },
    { label: 'Người dùng', value: usersCount, icon: Users, href: '/admin/users', color: 'from-teal-500 to-teal-700' },
    { label: 'Chờ duyệt', value: pendingEnrollments, icon: CheckSquare, href: '/admin/enrollments', color: 'from-orange-500 to-orange-700', alert: pendingEnrollments > 0 },
    { label: 'Liên hệ mới', value: newContacts, icon: MessageSquare, href: '/admin/contacts', color: 'from-blue-500 to-blue-700', alert: newContacts > 0 },
    { label: 'Tin tức', value: newsCount, icon: Newspaper, href: '/admin/news', color: 'from-pink-500 to-pink-700' },
    { label: 'Tài chính', value: '→', icon: DollarSign, href: '/admin/finance', color: 'from-emerald-500 to-emerald-700' },
  ]

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="bg-gray-900 text-white py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-black mb-1">⚙️ Admin Dashboard</h1>
          <p className="text-gray-400">Quản lý hệ thống AvaB</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}
              className={`rounded-3xl bg-gradient-to-br ${stat.color} p-5 text-white card-hover ${stat.alert ? 'ring-4 ring-orange-400' : ''}`}>
              <stat.icon size={28} className="mb-3 opacity-80" />
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.label}</div>
              {stat.alert && <div className="mt-2 text-xs bg-white/20 rounded-lg px-2 py-0.5 inline-block">⚠️ Cần duyệt</div>}
            </Link>
          ))}
        </div>

        {/* Quick nav - Management */}
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">⚙️ Quản lý hệ thống</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { href: '/admin/courses', icon: '📚', label: 'Khoá học', desc: 'Thêm, sửa, xoá' },
              { href: '/admin/enrollments', icon: '✅', label: 'Duyệt đăng ký', desc: 'Phê duyệt HS' },
              { href: '/admin/users', icon: '👥', label: 'Người dùng', desc: 'HS + PH + GV' },
              { href: '/admin/news', icon: '📰', label: 'Tin tức', desc: 'Đăng bài viết' },
              { href: '/admin/finance', icon: '💰', label: 'Tài chính', desc: 'Doanh thu' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-black text-gray-900 text-sm">{item.label}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* AI & Education */}
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🧠 AI & Giáo dục</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { href: '/admin/education-standards', icon: '📖', label: 'AvaB Standards', desc: '10 tài liệu chuẩn giáo dục', color: 'border-purple-200 hover:border-purple-400' },
              { href: '/admin/courses', icon: '🎓', label: 'Khóa Tóan TD Lớp 2', desc: '35 chuyên đề, 855 câu hỏi', color: 'border-teal-200 hover:border-teal-400' },
              { href: '/giao-vien', icon: '👨‍🏫', label: 'Portal Giáo viên', desc: 'Nhận xét buổi học', color: 'border-teal-200 hover:border-teal-400' },
              { href: '/hoc-vien', icon: '👦', label: 'Portal Học sinh', desc: 'Xem như học sinh', color: 'border-blue-200 hover:border-blue-400' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all ${item.color}`}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-black text-gray-900 text-sm">{item.label}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
