import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Owner Dashboard — Toàn hệ thống | AvaB' }

// Format VND currency
function fmtVND(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return Math.round(n / 1_000) + 'K'
  return n.toLocaleString('vi-VN')
}

export default async function OwnerDashboardPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // ── Pull cross-campus data ──────────────────────────────────────────────
  const [orgs, campuses, totalStudents, totalRevenue, revenueThisMonth] = await Promise.all([
    prisma.organization.count({ where: { isActive: true, deletedAt: null } }),
    prisma.campus.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true },
      _sum: { amount: true },
    }),
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true, paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ])

  // ── Revenue per campus via TuitionCollection ────────────────────────────
  const campusRevenue = await prisma.campus.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { campusUsers: true } },
    },
    orderBy: { name: 'asc' },
  })

  // Revenue per campus from TuitionCollection
  const campusCollectionRevenue = await prisma.tuitionCollection.groupBy({
    by: ['campusId'],
    where: { campusId: { not: null } },
    _sum: { totalAmount: true },
  })
  const campusRevenueMap = new Map<string, number>()
  for (const row of campusCollectionRevenue) {
    if (row.campusId) campusRevenueMap.set(row.campusId, row._sum.totalAmount ?? 0)
  }

  // Student count per campus (via enrollment → course → campusId)
  const campusCourseCount = await prisma.course.groupBy({
    by: ['campusId'],
    where: { campusId: { not: null } },
    _count: { id: true },
  })
  const campusCourseCountMap = new Map<string, number>()
  for (const row of campusCourseCount) {
    if (row.campusId) campusCourseCountMap.set(row.campusId, row._count.id)
  }

  const totalRevenueAmt = totalRevenue._sum.amount ?? 0
  const revenueThisMonthAmt = revenueThisMonth._sum.amount ?? 0

  // MoM comparison: last month revenue
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const lastMonthRevenue = await prisma.tuitionPayment.aggregate({
    where: { isPaid: true, paidAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    _sum: { amount: true },
  })
  const lastMonthAmt = lastMonthRevenue._sum.amount ?? 0
  const momDiff = lastMonthAmt > 0
    ? ((revenueThisMonthAmt - lastMonthAmt) / lastMonthAmt * 100).toFixed(1)
    : null
  const momPositive = revenueThisMonthAmt >= lastMonthAmt

  return (
    <div className="min-h-screen pt-14 bg-gray-50">

      {/* ── Header: dark slate gradient ────────────────────────────────── */}
      <div className="relative overflow-hidden py-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        <div className="container-custom relative">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1 text-slate-400 text-sm font-semibold mb-3 hover:text-white transition-colors"
          >
            ← Analytics Center
          </Link>
          <p className="text-slate-400 text-sm font-semibold mb-1">👑 AvaB EOS</p>
          <h1 className="text-4xl font-black text-white mb-1">Owner Dashboard</h1>
          <p className="text-slate-400 text-sm">Tổng quan toàn hệ thống</p>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">

        {/* ── Row 1: 4 KPI Cards ─────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">📊 Tổng quan hệ thống</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '🏢',
                label: 'Tổ chức',
                value: orgs,
                sub: 'Organizations active',
                gradient: 'from-slate-600 to-slate-800',
              },
              {
                icon: '🏫',
                label: 'Cơ sở',
                value: campuses,
                sub: 'Campus đang hoạt động',
                gradient: 'from-indigo-600 to-indigo-800',
              },
              {
                icon: '👥',
                label: 'Học sinh',
                value: totalStudents,
                sub: 'Tổng học viên STUDENT',
                gradient: 'from-violet-600 to-violet-800',
              },
              {
                icon: '💰',
                label: 'Tổng doanh thu',
                value: fmtVND(totalRevenueAmt),
                sub: 'Tất cả thời gian · đã thu',
                gradient: 'from-emerald-600 to-emerald-800',
                isText: true,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${stat.gradient} p-6 text-white shadow-md`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className={`font-black mb-1 ${stat.isText ? 'text-3xl' : 'text-4xl'}`}>
                  {stat.isText ? stat.value : (stat.value as number).toLocaleString('vi-VN')}
                </div>
                <div className="font-bold text-sm">{stat.label}</div>
                <div className="text-white/60 text-xs mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 2: Revenue this month ──────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">📅 Doanh thu tháng này</p>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Tháng {now.getMonth() + 1}/{now.getFullYear()}
                </p>
                <p className="text-6xl font-black text-gray-900">
                  {fmtVND(revenueThisMonthAmt)}
                  <span className="text-2xl text-gray-400 font-bold ml-1">đ</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {revenueThisMonthAmt.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                {momDiff !== null ? (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold ${
                    momPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}>
                    <span>{momPositive ? '📈' : '📉'}</span>
                    <span>{momPositive ? '+' : ''}{momDiff}% so với tháng trước</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-2xl text-sm font-bold bg-gray-50 text-gray-400">
                    Không có dữ liệu tháng trước
                  </div>
                )}
                <div className="px-4 py-2 rounded-2xl text-sm font-semibold bg-slate-50 text-slate-600">
                  Tháng trước: {fmtVND(lastMonthAmt)}đ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Campus comparison table ─────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🏫 So sánh theo cơ sở</p>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {campusRevenue.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">🏫</div>
                <p className="font-semibold">Chưa có cơ sở nào</p>
                <p className="text-sm mt-1">Thêm cơ sở từ Organizations → Campus</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[1fr_120px_120px_160px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div>Cơ sở</div>
                  <div className="text-center">👥 Nhân viên</div>
                  <div className="text-center">📚 Lớp học</div>
                  <div className="text-center">💰 Doanh thu</div>
                </div>
                <div className="divide-y divide-gray-50">
                  {campusRevenue.map((campus) => {
                    const staffCount = campus._count.campusUsers
                    const courseCount = campusCourseCountMap.get(campus.id) ?? 0
                    const revenue = campusRevenueMap.get(campus.id) ?? 0
                    return (
                      <div
                        key={campus.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_160px] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Campus info */}
                        <div>
                          <p className="font-bold text-gray-900">{campus.name}</p>
                          {campus.code && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                                {campus.code}
                              </span>
                            </p>
                          )}
                          {campus.address && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{campus.address}</p>
                          )}
                        </div>

                        {/* Staff */}
                        <div className="text-center">
                          <p className="text-xl font-black text-indigo-600">{staffCount}</p>
                          <p className="text-xs text-gray-400">nhân viên</p>
                        </div>

                        {/* Courses */}
                        <div className="text-center">
                          <p className="text-xl font-black text-violet-600">{courseCount}</p>
                          <p className="text-xs text-gray-400">lớp học</p>
                        </div>

                        {/* Revenue */}
                        <div className="text-center">
                          {revenue > 0 ? (
                            <>
                              <p className="text-xl font-black text-emerald-600">{fmtVND(revenue)}</p>
                              <p className="text-xs text-gray-400">doanh thu</p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-300 font-semibold">— Chưa có</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Row 4: Quick links to each campus admin ────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🔗 Truy cập cơ sở</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {campusRevenue.map((campus) => (
              <Link
                key={campus.id}
                href={`/admin/organizations?campusId=${campus.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  🏫
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
                    {campus.name}
                  </p>
                  {campus.code && (
                    <p className="text-xs text-gray-400">{campus.code}</p>
                  )}
                </div>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors text-sm">→</span>
              </Link>
            ))}

            {/* Static quick links */}
            <Link
              href="/admin/organizations"
              className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🏢
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm group-hover:text-slate-700 transition-colors">
                  Quản lý Organizations
                </p>
                <p className="text-xs text-gray-400">Thêm / sửa tổ chức</p>
              </div>
              <span className="text-gray-300 group-hover:text-slate-400 transition-colors text-sm">→</span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 hover:bg-orange-50 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                📊
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm group-hover:text-orange-700 transition-colors">
                  Analytics Center
                </p>
                <p className="text-xs text-gray-400">Báo cáo học tập chi tiết</p>
              </div>
              <span className="text-gray-300 group-hover:text-orange-400 transition-colors text-sm">→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
