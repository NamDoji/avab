import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Hồ sơ sức khỏe — School ERP' }

export default async function HealthPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const healthRecords = await prisma.healthRecord.findMany({
    
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })

  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const expiringSoonCount = healthRecords.filter(
    (r) => r.insuranceExpiry && r.insuranceExpiry <= thirtyDaysLater && r.insuranceExpiry >= now,
  ).length
  const expiredCount = healthRecords.filter(
    (r) => r.insuranceExpiry && r.insuranceExpiry < now,
  ).length

  function insuranceBadge(expiry: Date | null) {
    if (!expiry) return null
    if (expiry < now) return { label: 'Hết hạn', bg: '#fee2e2', color: '#dc2626', icon: '❌' }
    if (expiry <= thirtyDaysLater) return { label: 'Sắp hết', bg: '#fef9c3', color: '#854d0e', icon: '⚠️' }
    return { label: 'Còn hạn', bg: '#dcfce7', color: '#166534', icon: '✅' }
  }

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
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
          <h1 className="text-3xl font-black mb-1">🏥 Hồ sơ sức khỏe</h1>
          <p className="text-green-100 text-sm mb-4">Quản lý thông tin y tế, bảo hiểm học sinh</p>
          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-black">{healthRecords.length}</div>
              <div className="text-xs text-green-100">Tổng hồ sơ</div>
            </div>
            {expiredCount > 0 && (
              <div>
                <div className="text-3xl font-black text-red-200">{expiredCount}</div>
                <div className="text-xs text-green-100">BH hết hạn</div>
              </div>
            )}
            {expiringSoonCount > 0 && (
              <div>
                <div className="text-3xl font-black text-yellow-200">{expiringSoonCount}</div>
                <div className="text-xs text-green-100">BH sắp hết</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {healthRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-3">🏥</div>
            <p className="text-gray-500 font-semibold text-lg">Chưa có hồ sơ sức khỏe</p>
            <p className="text-gray-400 text-sm mt-1">
              Hồ sơ sẽ xuất hiện sau khi nhập thông tin y tế cho học sinh
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-700">Danh sách hồ sơ</span>
              <span className="text-sm text-gray-400">Hiển thị {healthRecords.length} bản ghi</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Học sinh</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Nhóm máu</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Dị ứng</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Bệnh lý</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Số BH</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Hết hạn BH</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Khám gần nhất</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Liên lạc khẩn</th>
                  </tr>
                </thead>
                <tbody>
                  {healthRecords.map((record) => {
                    const badge = insuranceBadge(record.insuranceExpiry)
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{record.studentId ?? '—'}</div>
                          <div className="text-xs text-gray-400">{record.studentId ?? ''}</div>
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
                        <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                          {record.allergies ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                          {record.conditions ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {record.insuranceNo ? (
                            <span className="font-mono text-xs text-gray-700">{record.insuranceNo}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {badge ? (
                            <span
                              className="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {badge.icon} {record.insuranceExpiry
                                ? new Date(record.insuranceExpiry).toLocaleDateString('vi-VN')
                                : ''}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {record.lastCheckup
                            ? new Date(record.lastCheckup).toLocaleDateString('vi-VN')
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {record.emergencyContact ? (
                            <div>
                              <div className="text-sm font-medium text-gray-700">{record.emergencyContact}</div>
                              {record.emergencyPhone && (
                                <div className="text-xs text-gray-400 font-mono">{record.emergencyPhone}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/admin/erp"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Quay về School ERP
          </Link>
        </div>
      </div>
    </div>
  )
}
