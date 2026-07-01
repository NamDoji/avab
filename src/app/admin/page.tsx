import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Users, CheckSquare, Newspaper, Briefcase, BarChart3, MessageSquare } from 'lucide-react'

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

        {/* Quick nav */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/admin/courses', icon: '📚', label: 'Quản lý khoá học', desc: 'Thêm, sửa, xoá khoá học và chuyên đề' },
            { href: '/admin/enrollments', icon: '✅', label: 'Duyệt đăng ký', desc: 'Xem và phê duyệt học sinh đăng ký mua khoá học' },
            { href: '/admin/users', icon: '👥', label: 'Quản lý người dùng', desc: 'Xem danh sách học sinh, phụ huynh' },
            { href: '/admin/news', icon: '📰', label: 'Quản lý tin tức', desc: 'Đăng bài viết, tin tức, thông báo' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="bg-white rounded-3xl p-5 border-2 border-purple-50 card-hover">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-black text-gray-900 mb-1">{item.label}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
