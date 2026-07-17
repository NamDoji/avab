import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Thiết bị & Tài sản — School ERP' }

const CATEGORY_LABELS: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  computer:  { label: 'Máy tính',     icon: '💻', bg: '#eff6ff', color: '#1d4ed8' },
  projector: { label: 'Máy chiếu',    icon: '📽️', bg: '#FFF7F9', color: '#951F3D' },
  furniture: { label: 'Nội thất',     icon: '🪑', bg: '#fff7ed', color: '#c2410c' },
  lab:       { label: 'Thiết bị PTN', icon: '🔬', bg: '#f0fdf4', color: '#15803d' },
  other:     { label: 'Khác',         icon: '📦', bg: '#f8fafc', color: '#475569' },
}

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  active:      { label: 'Hoạt động', bg: '#dcfce7', color: '#166534' },
  maintenance: { label: 'Bảo trì',   bg: '#fef9c3', color: '#854d0e' },
  retired:     { label: 'Đã thanh lý', bg: '#fee2e2', color: '#dc2626' },
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item)
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

export default async function EquipmentPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const equipment = await prisma.equipment.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  const byCategory = groupBy(equipment, (e) => e.category)
  const totalActive = equipment.filter((e) => e.status === 'active').length
  const totalMaintenance = equipment.filter((e) => e.status === 'maintenance').length
  const totalQty = equipment.reduce((s, e) => s + e.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-cherry-100 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Thiết bị & Tài sản</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-1">💻 Thiết bị & Tài sản</h1>
              <p className="text-cherry-100 text-sm">Quản lý trang thiết bị, tài sản nhà trường</p>
            </div>
            <Link
              href="/api/admin/erp/equipment"
              className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              + Thêm thiết bị
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 mt-5">
            <div>
              <div className="text-3xl font-black">{totalQty}</div>
              <div className="text-xs text-cherry-100">Tổng số lượng</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-300">{totalActive}</div>
              <div className="text-xs text-cherry-100">Đang hoạt động</div>
            </div>
            {totalMaintenance > 0 && (
              <div>
                <div className="text-3xl font-black text-yellow-300">{totalMaintenance}</div>
                <div className="text-xs text-cherry-100">Đang bảo trì</div>
              </div>
            )}
            <div>
              <div className="text-3xl font-black">{Object.keys(byCategory).length}</div>
              <div className="text-xs text-cherry-100">Danh mục</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">
        {equipment.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-3">💻</div>
            <p className="text-gray-500 font-semibold text-lg">Chưa có thiết bị nào</p>
            <p className="text-gray-400 text-sm mt-1">Thêm thiết bị để quản lý tài sản nhà trường</p>
          </div>
        ) : (
          <>
            {/* Category groups */}
            {Object.entries(byCategory).map(([cat, items]) => {
              const catMeta = CATEGORY_LABELS[cat] ?? CATEGORY_LABELS.other
              return (
                <div key={cat} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Category header */}
                  <div
                    className="px-5 py-3 flex items-center gap-3 border-b border-gray-100"
                    style={{ background: catMeta.bg }}
                  >
                    <span className="text-xl">{catMeta.icon}</span>
                    <span className="font-black text-base" style={{ color: catMeta.color }}>
                      {catMeta.label}
                    </span>
                    <span
                      className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: catMeta.color + '20', color: catMeta.color }}
                    >
                      {items.length} loại · {items.reduce((s, e) => s + e.quantity, 0)} cái
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Tên</th>
                          <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Mã</th>
                          <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">SL</th>
                          <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Trạng thái</th>
                          <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Vị trí</th>
                          <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Ngày mua</th>
                          <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Giá mua</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const statusMeta = STATUS_LABELS[item.status] ?? STATUS_LABELS.active
                          return (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f1f5f9' }}>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-900">{item.name}</div>
                                {item.notes && <div className="text-xs text-gray-400 truncate max-w-[200px]">{item.notes}</div>}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                {item.code ?? <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-800">{item.quantity}</td>
                              <td className="px-4 py-3">
                                <span
                                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                  style={{ background: statusMeta.bg, color: statusMeta.color }}
                                >
                                  {statusMeta.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {item.location ?? <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                {item.purchaseDate
                                  ? new Date(item.purchaseDate).toLocaleDateString('vi-VN')
                                  : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                {item.purchasePrice
                                  ? item.purchasePrice.toLocaleString('vi-VN') + ' ₫'
                                  : <span className="text-gray-300">—</span>}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </>
        )}

        <div className="mt-2">
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
