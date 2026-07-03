import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Collaboration — AvaB Admin' }

const COLLAB_MODULES = [
  { href: '/admin/collab/tasks',    icon: '✅', label: 'Tasks',    desc: 'Công việc, deadline',       color: '#059669' },
  { href: '/admin/collab/calendar', icon: '📅', label: 'Calendar', desc: 'Lịch học, sự kiện',         color: '#0369a1' },
  { href: '/admin/collab/meetings', icon: '🎥', label: 'Meeting',  desc: 'Cuộc họp, biên bản',        color: '#7c3aed' },
  { href: '/admin/collab/workflow', icon: '🔄', label: 'Workflow', desc: 'Phê duyệt quy trình',       color: '#d97706' },
]

export default async function CollabPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <Link href="/admin" className="inline-flex items-center gap-1 text-teal-200 text-sm font-semibold mb-3 hover:text-white transition-colors">
            ← Admin Dashboard
          </Link>
          <p className="text-teal-200 text-sm font-semibold mb-1">🤝 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-1">Collaboration</h1>
          <p className="text-teal-100 text-sm">Task, Calendar, Meeting, Approval</p>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* ── Module Cards ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🗂️ Phân hệ Collaboration</p>
          <div className="grid grid-cols-2 gap-4">
            {COLLAB_MODULES.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all flex flex-col gap-3"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: mod.color + '18' }}
                >
                  {mod.icon}
                </div>
                <div>
                  <h2 className="font-black text-gray-900 group-hover:text-teal-700 transition-colors">{mod.label}</h2>
                  <p className="text-gray-400 text-xs mt-0.5">{mod.desc}</p>
                </div>
                <div className="mt-auto text-xs font-bold" style={{ color: mod.color }}>
                  Xem chi tiết →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Quick nav ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/collab/tasks"
            className="flex items-center gap-2 bg-teal-600 text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm"
          >
            ✅ Xem tất cả Tasks
          </Link>
          <Link
            href="/admin/workflow"
            className="flex items-center gap-2 bg-white text-gray-700 rounded-2xl px-5 py-3 text-sm font-bold border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all shadow-sm"
          >
            🔄 Workflow Engine
          </Link>
        </div>
      </div>
    </div>
  )
}
