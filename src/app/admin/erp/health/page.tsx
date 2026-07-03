import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Hồ sơ sức khỏe — School ERP' }

export default async function HealthPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const records = await prisma.healthRecord.findMany({
    orderBy: { lastUpdated: 'desc' },
  })

  // Load users
  const userIds = records.map((r) => r.userId)
  const users = userIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, phone: true },
      })
    : []
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  function isExpiringSoon(date: Date | null): boolean {
    if (!date) return false
    return date <= thirtyDaysLater
  }

  function isExpired(date: Date | null): boolean {
    if (!date) return false
    return date < now
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-green-100 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Hồ sơ sức khỏe</span>
          </div>
          <h1 className="text-3xl font-black mb-1">💊 Hồ sơ sức khỏe</h1>
          <div className="flex gap-6 mt-4">
            <div>
              <div className="text-2xl font-black">{records.length}</div>
              <div className="text-xs text-green-100">Tổng hồ sơ</div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-200">
                {records.filter((r) => isExpiringSoon(r.insuranceExpiry)).length}
              </div>
              <div className="text-xs text-green-100">BH sắp hết hạn</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">💊</div>
            <p className="text-gray-500 font-semibold">Chưa có hồ sơ sức khỏe</p>
            <p className="text-gray-400 text-sm mt-1">Hồ sơ sẽ xuất hiện sau khi nhập thông tin y tế cho học sinh</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Học sinh</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Nhóm máu</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Dị ứng</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Bệnh lý</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Bảo hiểm</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Hết hạn BH</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const user = userMap[record.userId]
                    const expiringSoon = isExpiringSoon(record.insuranceExpiry)
                    const expired = isExpired(record.insuranceExpiry)
                    return (
                      <tr key={record.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{user?.name ?? '—'}</div>
                          <div className="text-xs text-gray-400">{user?.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          {record.bloodType ? (
                            <span
                              className="font-bold text-sm px-2.5 py-0.5 rounded-full"
                              style={{ background: '#fee2e2', color: '#dc2626' }}
                            >
                              {record.bloodType}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {record.allergies ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {record.conditions ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {record.insuranceNo ? (
                            <div>
                              <div className="font-mono text-xs text-gray-700">{record.insuranceNo}</div>
                              {record.insuranceProvider && (
                                <div className="text-xs text-gray-400">{record.insuranceProvider}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {record.insuranceExpiry ? (
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={
                                expired
                                  ? { background: '#fee2e2', color: '#dc2626' }
                                  : expiringSoon
                                  ? { background: '#fef9c3', color: '#854d0e' }
                                  : { background: '#dcfce7', color: '#166534' }
                              }
                            >
                              {new Date(record.insuranceExpiry).toLocaleDateString('vi-VN')}
                              {expired && ' ❌'}
                              {!expired && expiringSoon && ' ⚠️'}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(record.lastUpdated).toLocaleDateString('vi-VN')}
                        </td>
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
