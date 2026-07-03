import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Alumni — School ERP' }

export default async function AlumniPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  // Alumni = enrollments with status EXPIRED
  const expiredEnrollments = await prisma.enrollment.findMany({
    where: { status: 'EXPIRED' },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true } },
      course: { select: { id: true, name: true, code: true } },
    },
    orderBy: { expiresAt: 'desc' },
    take: 200,
  })

  // Deduplicate by user (show latest expired enrollment per user)
  const seen = new Set<string>()
  const alumni = expiredEnrollments.filter((e) => {
    if (seen.has(e.userId)) return false
    seen.add(e.userId)
    return true
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-teal-100 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Alumni</span>
          </div>
          <h1 className="text-3xl font-black mb-1">🎓 Alumni</h1>
          <p className="text-teal-100 text-sm mb-4">Cựu học sinh đã hoàn thành khóa học</p>
          <div>
            <div className="text-3xl font-black">{alumni.length}</div>
            <div className="text-xs text-teal-100">Tổng cựu học sinh</div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {alumni.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🎓</div>
            <p className="text-gray-500 font-semibold">Chưa có alumni</p>
            <p className="text-gray-400 text-sm mt-1">Học sinh có enrollment hết hạn sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">#</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Tên</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Số điện thoại</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Email</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Khóa học gần nhất</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Tốt nghiệp</th>
                  </tr>
                </thead>
                <tbody>
                  {alumni.map((enrollment, idx) => (
                    <tr key={enrollment.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{enrollment.user.name ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{enrollment.user.phone}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{enrollment.user.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-700">{enrollment.course.name}</div>
                        <div className="text-xs text-gray-400">{enrollment.course.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        {enrollment.expiresAt ? (
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: '#f0fdf4', color: '#166534' }}
                          >
                            🎓 {new Date(enrollment.expiresAt).toLocaleDateString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
