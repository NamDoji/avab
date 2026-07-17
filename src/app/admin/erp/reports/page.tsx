import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'ERP Reports — AvaB Admin' }

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

export default async function ERPReportsPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? ''))
    redirect('/dang-nhap')

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  const orgUserFilter = orgCtx?.id ? { organizationUsers: { some: { organizationId: orgCtx.id } } } : {}
  const orgEnrollFilter = orgCtx?.id ? { organizationId: orgCtx.id } : {}
  const orgCourseFilter = orgCtx?.id ? { organizationId: orgCtx.id, isActive: true } : { isActive: true }

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // ── KPIs ─────────────────────────────────────────────────────────────
  const [
    studentCount,
    teacherCount,
    classCount,
    activeEnrollmentCount,
    sessionFeedbackCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', ...orgUserFilter } }),
    prisma.user.count({ where: { role: 'TEACHER', ...orgUserFilter } }),
    prisma.course.count({ where: orgCourseFilter }),
    prisma.enrollment.count({ where: { status: 'ACTIVE', ...orgEnrollFilter } }),
    prisma.sessionFeedback.count(),
  ])

  // ── Student growth by month (last 6 months) ───────────────────────────
  const studentGrowthRaw = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true },
  })

  const monthlyStudentMap = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyStudentMap.set(key, 0)
  }
  for (const s of studentGrowthRaw) {
    const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, '0')}`
    if (monthlyStudentMap.has(key)) {
      monthlyStudentMap.set(key, (monthlyStudentMap.get(key) ?? 0) + 1)
    }
  }
  const studentGrowth = Array.from(monthlyStudentMap.entries()).map(([key, count]) => {
    const [year, month] = key.split('-').map(Number)
    return { key, label: `${MONTH_NAMES[month - 1]}/${String(year).slice(-2)}`, count }
  })

  // ── Teacher workload (sessions per teacher via SessionFeedback.createdBy) ──
  const teacherWorkloadRaw = await prisma.sessionFeedback.groupBy({
    by: ['createdBy'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 8,
  })
  // Fetch teacher names
  const teacherIds = teacherWorkloadRaw.map((t) => t.createdBy)
  const teachers = await prisma.user.findMany({
    where: { id: { in: teacherIds } },
    select: { id: true, name: true, phone: true },
  })
  const teacherMap = new Map(teachers.map((t) => [t.id, t.name ?? t.phone ?? t.id.slice(-6)]))
  const teacherWorkload = teacherWorkloadRaw.map((t) => ({
    id: t.createdBy,
    name: teacherMap.get(t.createdBy) ?? t.createdBy.slice(-6),
    sessions: t._count.id,
  }))
  const maxSessions = Math.max(...teacherWorkload.map((t) => t.sessions), 1)

  // ── Class occupancy (active enrollments per course) ───────────────────
  const courseOccupancyRaw = await prisma.course.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })
  const courseOccupancy = courseOccupancyRaw.map((c) => {
    const capacity = 30
    const enrolled = c._count.enrollments
    const rate = capacity > 0 ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0
    return { id: c.id, name: c.name, enrolled, capacity, rate }
  })

  // ── Attendance rate from SessionFeedback records ──────────────────────
  const attendanceRaw = await prisma.studentSessionRecord.aggregate({
    _count: { id: true },
    where: {},
  })
  const presentRaw = await prisma.studentSessionRecord.count({
    where: { attendance: true },
  })
  const totalRecords = attendanceRaw._count.id
  const attendanceRate = totalRecords > 0 ? Math.round((presentRaw / totalRecords) * 100) : 0

  const studentGrowthMax = Math.max(...studentGrowth.map((m) => m.count), 1)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/admin/erp"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <nav className="flex items-center gap-2 text-blue-300 text-xs">
              <Link href="/admin/erp" className="hover:text-white transition">School ERP</Link>
              <span>›</span>
              <span className="text-white font-semibold">Báo cáo tổng hợp</span>
            </nav>
          </div>
          <h1 className="text-2xl font-black text-white">📊 ERP Reports</h1>
          <p className="text-blue-200 text-sm mt-1">
            Tổng quan vận hành: học sinh, giáo viên, lớp học, điểm danh
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Zone 1: 4 KPI Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl p-6 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">👥 Học sinh</p>
            <p className="text-3xl font-black">{studentCount.toLocaleString('vi-VN')}</p>
            <p className="text-xs text-blue-200 mt-2">{activeEnrollmentCount} đang học tích cực</p>
          </div>
          <div className="rounded-3xl p-6 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
            <p className="text-xs font-semibold text-cyan-200 uppercase tracking-wide mb-1">👨🏫 Giáo viên</p>
            <p className="text-3xl font-black">{teacherCount.toLocaleString('vi-VN')}</p>
            <p className="text-xs text-cyan-200 mt-2">{teacherWorkload.length} đã dạy buổi học</p>
          </div>
          <div className="rounded-3xl p-6 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
            <p className="text-xs font-semibold text-cherry-200 uppercase tracking-wide mb-1">📚 Lớp học</p>
            <p className="text-3xl font-black">{classCount.toLocaleString('vi-VN')}</p>
            <p className="text-xs text-cherry-200 mt-2">Lớp đang hoạt động</p>
          </div>
          <div
            className="rounded-3xl p-6 text-white shadow-sm"
            style={{
              background: attendanceRate >= 80
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : attendanceRate >= 60
                ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            }}
          >
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide mb-1">✅ Tỷ lệ đi học</p>
            <p className="text-3xl font-black">{attendanceRate}%</p>
            <div className="mt-2 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Zone 2: Student Growth (6 months) ────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-black text-gray-900 text-lg mb-1">📈 Tăng trưởng học sinh</h2>
          <p className="text-xs text-gray-500 mb-6">Số học sinh đăng ký mới theo tháng (6 tháng gần nhất)</p>

          <div className="flex items-end gap-3 h-40">
            {studentGrowth.map((m, i) => {
              const heightPct = Math.max(4, Math.round((m.count / studentGrowthMax) * 100))
              const isLast = i === studentGrowth.length - 1
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-xs text-gray-500 font-semibold">{m.count}</span>
                  <div
                    className="w-full rounded-t-xl"
                    style={{
                      height: `${heightPct}%`,
                      background: isLast
                        ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)'
                        : 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 100%)',
                      minHeight: '8px',
                    }}
                    title={`${m.label}: ${m.count} học sinh`}
                  />
                  <span className="text-xs text-gray-400 font-medium">{m.label}</span>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Tổng mới 6T: <strong className="text-blue-700">{studentGrowth.reduce((s, m) => s + m.count, 0)} học sinh</strong>
            </span>
            <span>
              TB: <strong className="text-blue-700">{Math.round(studentGrowth.reduce((s, m) => s + m.count, 0) / 6)}/tháng</strong>
            </span>
          </div>
        </div>

        {/* ── Zone 3: Teacher Workload ──────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">👨🏫 Phân bổ công việc giáo viên</h2>
            <p className="text-xs text-gray-500 mt-0.5">Số buổi học đã dạy theo giáo viên (Top 8)</p>
          </div>

          {teacherWorkload.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              Chưa có dữ liệu buổi học
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {teacherWorkload.map((t, idx) => (
                <div key={t.id} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                    style={{
                      background: idx === 0
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800 truncate">{t.name}</span>
                      <span className="text-sm font-black text-cherry-700 ml-2 flex-shrink-0">{t.sessions} buổi</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round((t.sessions / maxSessions) * 100)}%`,
                          background: idx === 0
                            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                            : 'linear-gradient(90deg, #818cf8, #6366f1)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Zone 4: Class Occupancy ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">🏫 Tỷ lệ lấp đầy lớp học</h2>
            <p className="text-xs text-gray-500 mt-0.5">Số học sinh đăng ký / sức chứa tối đa (Top 8 lớp)</p>
          </div>

          {courseOccupancy.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              Chưa có dữ liệu lớp học
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                    <th className="text-left px-6 py-3">Lớp học</th>
                    <th className="text-right px-4 py-3">Đã ghi danh</th>
                    <th className="text-right px-4 py-3">Sức chứa</th>
                    <th className="text-right px-6 py-3">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courseOccupancy.map((c) => (
                    <tr key={c.id} className="hover:bg-cherry-50/30 transition">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/courses/${c.id}`}
                          className="font-semibold text-gray-800 hover:text-cherry-700 transition"
                        >
                          {c.name}
                        </Link>
                        <div className="mt-1.5 w-full max-w-[160px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.rate}%`,
                              background: c.rate >= 80
                                ? 'linear-gradient(90deg, #059669, #10b981)'
                                : c.rate >= 50
                                ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                                : 'linear-gradient(90deg, #dc2626, #ef4444)',
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-800">{c.enrolled}</td>
                      <td className="px-4 py-4 text-right text-gray-500">{c.capacity}</td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className="inline-block font-black text-sm px-2.5 py-1 rounded-full"
                          style={{
                            background: c.rate >= 80
                              ? 'rgba(5,150,105,0.1)'
                              : c.rate >= 50
                              ? 'rgba(245,158,11,0.1)'
                              : 'rgba(239,68,68,0.1)',
                            color: c.rate >= 80
                              ? '#059669'
                              : c.rate >= 50
                              ? '#d97706'
                              : '#dc2626',
                          }}
                        >
                          {c.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Quick Links ───────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Điều hướng nhanh</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/admin/erp/students', icon: '👥', label: 'Học sinh', bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
              { href: '/admin/erp/teachers', icon: '👨🏫', label: 'Giáo viên', bg: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
              { href: '/admin/erp/attendance', icon: '✅', label: 'Điểm danh', bg: 'linear-gradient(135deg, #22c55e, #16a34a)' },
              { href: '/admin/erp/classes', icon: '📋', label: 'Lớp học', bg: 'linear-gradient(135deg, #6366f1, #4338ca)' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm text-center"
                style={{ background: item.bg }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <Link href="/admin/erp" className="text-sm text-gray-500 hover:text-gray-800 transition">
            ← Quay về School ERP
          </Link>
        </div>
      </div>
    </main>
  )
}
