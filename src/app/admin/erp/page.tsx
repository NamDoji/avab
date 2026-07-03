import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'School ERP — AvaB Admin' }

const ERP_MODULES = [
  { href: '/admin/erp/students',   icon: '👥', label: 'Học sinh',       desc: 'Hồ sơ, chuyển lớp, sức khỏe',  gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { href: '/admin/erp/teachers',   icon: '👨‍🏫', label: 'Giáo viên',     desc: 'Hồ sơ, phân công, lịch dạy',   gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
  { href: '/admin/erp/classes',    icon: '📋', label: 'Lớp học',        desc: 'Tạo lớp, gán GV, quản lý HS',  gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
  { href: '/admin/erp/rooms',      icon: '🚪', label: 'Phòng học',      desc: 'Phòng, sức chứa, lịch sử dụng', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
  { href: '/admin/erp/timetable',  icon: '📅', label: 'Thời khóa biểu', desc: 'AI tự động xếp lịch',           gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', badge: 'AI' },
  { href: '/admin/erp/attendance', icon: '✅', label: 'Điểm danh',      desc: 'Check-in, báo cáo vắng',        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
  { href: '/admin/erp/awards',     icon: '🏆', label: 'Khen thưởng',    desc: 'Kỷ luật, khen thưởng, ghi chú', gradient: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' },
  { href: '/admin/erp/alumni',     icon: '🎓', label: 'Alumni',         desc: 'Học sinh đã tốt nghiệp',        gradient: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)' },
]

export default async function ERPHubPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(25%, -50%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(30,58,95,0.5)', transform: 'translate(-25%, 50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span>School ERP</span>
          </div>
          <h1 className="text-4xl font-black mb-2">🏫 School ERP</h1>
          <p className="text-blue-200 text-sm">
            Quản lý toàn bộ hoạt động học vụ của trường
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* 2×4 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ERP_MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="relative overflow-hidden rounded-3xl p-6 text-white hover:scale-[1.02] transition-transform shadow-lg hover:shadow-xl"
              style={{ background: mod.gradient }}
            >
              <div
                className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(30%, -40%)' }}
              />
              <div className="flex flex-col gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  {mod.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-lg text-white">{mod.label}</h3>
                    {mod.badge && (
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(250,204,21,1)', color: '#713f12' }}
                      >
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.70)' }}>
                    {mod.desc}
                  </p>
                </div>
              </div>
              <div
                className="mt-4 flex items-center gap-1 text-sm font-semibold"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                <span>Mở</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Back */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Quay về Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
