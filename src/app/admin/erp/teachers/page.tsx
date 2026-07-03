import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Giáo viên — AvaB ERP' }

// ── Avatar helper ─────────────────────────────────────────────────
function Avatar({ name, size = 40 }: { name: string | null; size?: number }) {
  const letter = name ? name.trim()[0]?.toUpperCase() ?? '?' : '?'
  const colors = ['#0c4a6e', '#0369a1', '#7c3aed', '#db2777', '#ea580c', '#65a30d']
  const color  = colors[(letter.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  )
}

export default async function TeachersPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER', isActive: true },
    include: {
      campusUsers: {
        include: { campus: { select: { id: true, name: true, code: true } } },
      },
      _count: { select: { sessionRecords: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Stats
  const totalCampuses = new Set(
    teachers.flatMap((t) => t.campusUsers.map((cu) => cu.campusId))
  ).size

  const teachersWithSessions = teachers.filter((t) => t._count.sessionRecords > 0)
  const teachersWithoutCampus = teachers.filter((t) => t.campusUsers.length === 0)

  // Campus with most teachers
  const campusCount: Record<string, { name: string; count: number }> = {}
  for (const t of teachers) {
    for (const cu of t.campusUsers) {
      const key = cu.campus.id
      if (!campusCount[key]) campusCount[key] = { name: cu.campus.name, count: 0 }
      campusCount[key].count++
    }
  }
  const topCampus = Object.values(campusCount).sort((a, b) => b.count - a.count)[0]

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sky-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">ERP</Link>
            <span>/</span>
            <span>Giáo viên</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">👨‍🏫 Giáo viên</h1>
              <p className="text-sky-200 text-sm">
                {teachers.length} giáo viên · {totalCampuses} cơ sở
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/admin/users?create=teacher"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                ➕ Thêm GV
              </Link>
              <Link
                href="/admin/data-migration"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
              >
                📦 Import
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng GV', value: teachers.length, icon: '👨‍🏫', bg: '#eff6ff', color: '#1d4ed8' },
            { label: 'GV có lớp', value: teachersWithSessions.length, icon: '✅', bg: '#f0fdf4', color: '#166534' },
            { label: 'Chưa phân công', value: teachersWithoutCampus.length, icon: '⏳', bg: '#fff7ed', color: '#c2410c' },
            { label: topCampus ? topCampus.name : 'Cơ sở nhiều nhất', value: topCampus ? topCampus.count + ' GV' : '—', icon: '🏫', bg: '#faf5ff', color: '#7c3aed' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: s.bg, border: `1px solid ${s.color}22` }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: s.color }}>{s.icon} {s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Teacher table */}
        {teachers.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
            <div className="text-5xl mb-3">👨‍🏫</div>
            <p className="text-gray-700 font-bold text-lg mb-1">Chưa có giáo viên nào</p>
            <p className="text-gray-400 text-sm mb-5">Import từ Excel hoặc thêm thủ công.</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/admin/data-migration"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)' }}
              >
                📦 Import Excel
              </Link>
              <Link
                href="/admin/users?create=teacher"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: '#374151' }}
              >
                ➕ Thêm thủ công
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">#</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Giáo viên</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Cơ sở</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Số buổi dạy</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Ngày tham gia</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher, idx) => (
                    <tr
                      key={teacher.id}
                      style={{ borderTop: idx === 0 ? undefined : '1px solid #f1f5f9' }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>

                      {/* Avatar + Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={teacher.name} size={36} />
                          <div>
                            <div className="font-semibold text-gray-900">{teacher.name ?? '—'}</div>
                            <div className="text-xs text-gray-400">
                              {teacher.phone}
                              {teacher.email && <span className="ml-2 text-gray-300">·</span>}
                              {teacher.email && <span className="ml-1">{teacher.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Campus badges */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {teacher.campusUsers.length === 0 ? (
                            <span className="text-xs text-gray-400">Chưa phân công</span>
                          ) : (
                            teacher.campusUsers.map((cu) => (
                              <span
                                key={cu.id}
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: '#e0f2fe', color: '#0369a1' }}
                              >
                                {cu.campus.code ? cu.campus.code : cu.campus.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Session count */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-700">{teacher._count.sessionRecords}</span>
                        <span className="text-xs text-gray-400 ml-1">buổi</span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(teacher.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/erp/teachers/${teacher.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #0c4a6e, #0369a1)', color: '#fff' }}
                        >
                          Xem hồ sơ →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Hiển thị {teachers.length} giáo viên đang hoạt động
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
