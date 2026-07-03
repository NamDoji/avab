import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Điểm danh — School ERP' }

const statusLabel: Record<string, string> = {
  present: 'Có mặt',
  absent: 'Vắng',
  late: 'Muộn',
  excused: 'Có phép',
}

const statusColor: Record<string, string> = {
  present: 'background:#dcfce7;color:#166534',
  absent: 'background:#fee2e2;color:#991b1b',
  late: 'background:#fef9c3;color:#854d0e',
  excused: 'background:#dbeafe;color:#1e40af',
}

export default async function AttendancePage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const records = await prisma.attendance.findMany({
    where: { date: { gte: sevenDaysAgo } },
    orderBy: [{ date: 'desc' }, { courseId: 'asc' }],
    take: 200,
  })

  // Load users and courses referenced
  const userIds = [...new Set(records.map((r) => r.userId))]
  const courseIds = [...new Set(records.map((r) => r.courseId))]

  const [users, courses] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, phone: true },
    }),
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, name: true, code: true },
    }),
  ])

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]))

  const presentCount = records.filter((r) => r.status === 'present').length
  const absentCount = records.filter((r) => r.status === 'absent').length
  const lateCount = records.filter((r) => r.status === 'late').length
  const total = records.length
  const presentPct = total > 0 ? Math.round((presentCount / total) * 100) : 0

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
      >
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Điểm danh</span>
          </div>
          <h1 className="text-3xl font-black mb-1">📋 Điểm danh</h1>
          <p className="text-blue-200 text-sm">7 ngày gần nhất — {total} bản ghi</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-5">
            <div>
              <div className="text-2xl font-black text-green-300">{presentPct}%</div>
              <div className="text-xs text-blue-200">Có mặt</div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-300">{absentCount}</div>
              <div className="text-xs text-blue-200">Vắng</div>
            </div>
            <div>
              <div className="text-2xl font-black text-yellow-300">{lateCount}</div>
              <div className="text-xs text-blue-200">Muộn</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Action bar */}
        <div className="flex justify-end mb-4">
          <Link
            href="/admin/erp/attendance/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            + Điểm danh mới
          </Link>
        </div>

        {/* Table */}
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500 font-semibold">Chưa có dữ liệu điểm danh</p>
            <p className="text-gray-400 text-sm mt-1">Bắt đầu điểm danh cho buổi học đầu tiên</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">#</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Học sinh</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Khóa học</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Ngày</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, idx) => {
                    const user = userMap[record.userId]
                    const course = courseMap[record.courseId]
                    const [bgStr, colorStr] = (statusColor[record.status] ?? 'background:#f3f4f6;color:#374151').split(';')
                    const bg = bgStr.replace('background:', '')
                    const color = colorStr.replace('color:', '')
                    return (
                      <tr key={record.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{user?.name ?? '—'}</div>
                          <div className="text-xs text-gray-400">{user?.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-700">{course?.name ?? record.courseId}</div>
                          <div className="text-xs text-gray-400">{course?.code}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(record.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: bg, color }}
                          >
                            {statusLabel[record.status] ?? record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{record.note ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
