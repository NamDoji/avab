import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ContractsClient from './ContractsClient'

export const metadata = { title: 'Hợp đồng — HRM — AvaB Admin' }

export default async function HRMContractsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const [contracts, staffList] = await Promise.all([
    prisma.contract.findMany({
      include: {
        employee: { select: { id: true, name: true, role: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'TEACHER'] }, isActive: true },
      select: { id: true, name: true, role: true, phone: true },
      orderBy: { name: 'asc' },
    }),
  ])

  // Count contracts expiring within 30 days
  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const expiringCount = contracts.filter((c) => {
    if (!c.endDate) return false
    return c.endDate > now && c.endDate <= in30Days
  }).length

  // Serialize for client component
  const serializedContracts = contracts.map((c) => ({
    ...c,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #4a044e 0%, #7e22ce 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-purple-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">Hợp đồng</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black mb-1">📄 Hợp đồng lao động</h1>
              <p className="text-purple-100 text-sm">Quản lý HĐLĐ, theo dõi hạn hợp đồng</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📄', label: 'Tổng HĐ', value: contracts.length },
              { icon: '✅', label: 'Đang hiệu lực', value: contracts.filter((c) => c.status === 'active').length },
              {
                icon: '⚠️',
                label: 'Sắp hết hạn',
                value: expiringCount,
              },
              { icon: '⏰', label: 'Đã hết hạn', value: contracts.filter((c) => c.status === 'expired').length },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-3">
                <div className="text-lg font-black">{s.value}</div>
                <div className="text-xs text-purple-100 mt-0.5">
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">
        <ContractsClient initialContracts={serializedContracts} staffList={staffList} />
      </div>
    </div>
  )
}
