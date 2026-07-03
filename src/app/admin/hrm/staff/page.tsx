import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Nhân viên — HRM — AvaB Admin' }

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:   { label: 'Quản trị viên', color: '#7c3aed', bg: '#f5f3ff' },
  TEACHER: { label: 'Giáo viên',     color: '#0369a1', bg: '#e0f2fe' },
}

export default async function HRMStaffPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const staff = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'TEACHER'] } },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    include: {
      campusUsers: {
        include: { campus: { select: { name: true } } },
        take: 1,
        where: { isPrimary: true },
      },
    },
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #4a044e 0%, #7e22ce 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-purple-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">Nhân viên</span>
          </div>
          <h1 className="text-3xl font-black mb-1">👥 Danh sách nhân viên</h1>
          <p className="text-purple-100 text-sm">Hồ sơ, phân công — {staff.length} nhân viên</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full">
              👥 {staff.length} nhân viên
            </span>
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full">
              🛡️ {staff.filter((s) => s.role === 'ADMIN').length} Admin
            </span>
            <span className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full">
              👨‍🏫 {staff.filter((s) => s.role === 'TEACHER').length} Giáo viên
            </span>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 bg-purple-600 text-white rounded-2xl px-4 py-2.5 text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
          >
            <span>+</span> Thêm nhân viên
          </Link>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        {staff.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-3">👤</div>
            <h3 className="font-black text-gray-700 mb-1">Chưa có nhân viên</h3>
            <p className="text-gray-400 text-sm">Thêm Admin hoặc Teacher trong phần quản lý người dùng</p>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 mt-4 bg-purple-600 text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-purple-700 transition-colors"
            >
              + Quản lý người dùng
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[48px_1fr_140px_120px_140px_120px_80px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div />
              <div>Nhân viên</div>
              <div>Số điện thoại</div>
              <div>Vai trò</div>
              <div>Cơ sở</div>
              <div>Ngày vào</div>
              <div />
            </div>

            <div className="divide-y divide-gray-50">
              {staff.map((person) => {
                const roleConf = ROLE_CONFIG[person.role] ?? { label: person.role, color: '#6b7280', bg: '#f3f4f6' }
                const primaryCampus = person.campusUsers[0]?.campus?.name ?? '—'
                const avatarChar = (person.name ?? person.phone).charAt(0).toUpperCase()

                return (
                  <div
                    key={person.id}
                    className="grid grid-cols-1 md:grid-cols-[48px_1fr_140px_120px_140px_120px_80px] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                    >
                      {person.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={person.avatar} alt={person.name ?? ''} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        avatarChar
                      )}
                    </div>

                    {/* Name + email */}
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{person.name ?? '(Chưa đặt tên)'}</p>
                      {person.email && (
                        <p className="text-gray-400 text-xs truncate mt-0.5">{person.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="text-sm text-gray-600">{person.phone}</div>

                    {/* Role badge */}
                    <div>
                      <span
                        className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full"
                        style={{ color: roleConf.color, backgroundColor: roleConf.bg }}
                      >
                        {roleConf.label}
                      </span>
                    </div>

                    {/* Campus */}
                    <div className="text-sm text-gray-600 truncate">{primaryCampus}</div>

                    {/* Join date */}
                    <div className="text-xs text-gray-400">
                      {new Date(person.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </div>

                    {/* Action */}
                    <div>
                      <Link
                        href={`/admin/users`}
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        Xem →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
