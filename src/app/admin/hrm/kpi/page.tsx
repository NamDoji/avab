import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import KpiDashboard from './KpiDashboard'

export const metadata = { title: 'KPI & OKR — HRM — AvaB Admin' }

// ─── Generate period list ─────────────────────────────────────────────────────

function generatePeriods(): string[] {
  const periods: string[] = []
  const now = new Date()

  // Last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    periods.push(`${d.getFullYear()}-${month}`)
  }

  // Last 4 quarters
  const currentQ = Math.ceil((now.getMonth() + 1) / 3)
  for (let i = 3; i >= 0; i--) {
    let q = currentQ - i
    let y = now.getFullYear()
    while (q <= 0) {
      q += 4
      y--
    }
    const label = `${y}-Q${q}`
    if (!periods.includes(label)) periods.push(label)
  }

  return periods
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HRMKpiPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const staffList = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'TEACHER'] }, isActive: true },
    select: { id: true, name: true, role: true, phone: true },
    orderBy: { name: 'asc' },
  })

  const periods = generatePeriods()
  const now = new Date()
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-emerald-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">KPI &amp; OKR</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black mb-1">📊 KPI &amp; OKR Dashboard</h1>
              <p className="text-emerald-100 text-sm">Đánh giá hiệu suất nhân viên theo kỳ</p>
            </div>
            <span className="bg-emerald-400/30 text-emerald-100 rounded-2xl px-4 py-2 text-xs font-black">
              👥 {staffList.length} nhân viên
            </span>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">
        <KpiDashboard staffList={staffList} defaultPeriod={defaultPeriod} periods={periods} />
      </div>
    </div>
  )
}
