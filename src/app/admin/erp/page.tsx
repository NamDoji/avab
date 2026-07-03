import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'School ERP — AvaB Admin' }

const modules = [
  {
    href: '/admin/erp/attendance',
    icon: '📋',
    label: 'Điểm danh',
    desc: 'Theo dõi chuyên cần',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  {
    href: '/admin/erp/classrooms',
    icon: '🏛️',
    label: 'Phòng học',
    desc: 'Quản lý phòng & thiết bị',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  },
  {
    href: '/admin/erp/rewards',
    icon: '🏅',
    label: 'Khen thưởng',
    desc: 'Khen thưởng & kỷ luật',
    gradient: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
  },
  {
    href: '/admin/erp/health',
    icon: '💊',
    label: 'Hồ sơ sức khỏe',
    desc: 'Y tế & bảo hiểm',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)',
  },
  {
    href: '/admin/erp/timetable',
    icon: '📅',
    label: 'Thời khóa biểu',
    desc: 'AI Timetable Generator',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    badge: 'AI',
  },
  {
    href: '/admin/erp/alumni',
    icon: '🎓',
    label: 'Alumni',
    desc: 'Cựu học sinh',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
  },
]

export default async function ERPHubPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.2)', transform: 'translate(-25%, 50%)' }}
        />
        <div className="container-custom relative">
          <p className="text-indigo-200 text-sm font-semibold mb-1">⚙️ Quản trị</p>
          <h1 className="text-4xl font-black mb-2">🏫 School ERP</h1>
          <p className="text-indigo-200 text-sm">
            Quản lý toàn diện: Điểm danh · Phòng học · Sức khỏe · Khen thưởng · TKB AI · Alumni
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="relative overflow-hidden rounded-3xl p-6 text-white hover:scale-[1.02] transition-transform shadow-lg hover:shadow-xl"
              style={{ background: mod.gradient }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(30%, -40%)' }}
              />
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
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
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
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
