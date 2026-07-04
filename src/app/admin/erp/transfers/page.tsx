import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TransferActions from './TransferActions'

export const metadata = { title: 'Chuyển lớp — School ERP' }

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: 'Chờ duyệt', bg: '#fef9c3', color: '#854d0e' },
  approved: { label: 'Đã duyệt',  bg: '#dcfce7', color: '#166534' },
  rejected: { label: 'Từ chối',   bg: '#fee2e2', color: '#dc2626' },
}

export default async function TransfersPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const transfers = await prisma.classTransfer.findMany({
    include: {
      student:    { select: { name: true } },
      fromCourse: { select: { name: true } },
      toCourse:   { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const pendingCount  = transfers.filter((t) => t.status === 'pending').length
  const approvedCount = transfers.filter((t) => t.status === 'approved').length
  const rejectedCount = transfers.filter((t) => t.status === 'rejected').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-orange-100 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Chuyển lớp</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">
                🔄 Chuyển lớp
                {pendingCount > 0 && (
                  <span
                    className="ml-3 text-base font-black px-2.5 py-0.5 rounded-full align-middle"
                    style={{ background: '#fef08a', color: '#713f12' }}
                  >
                    {pendingCount} chờ duyệt
                  </span>
                )}
              </h1>
              <p className="text-orange-100 text-sm">Duyệt yêu cầu chuyển lớp học sinh</p>
            </div>
          </div>

          <div className="flex gap-8 mt-5">
            <div>
              <div className="text-3xl font-black">{transfers.length}</div>
              <div className="text-xs text-orange-100">Tổng yêu cầu</div>
            </div>
            {pendingCount > 0 && (
              <div>
                <div className="text-3xl font-black text-yellow-300">{pendingCount}</div>
                <div className="text-xs text-orange-100">Chờ duyệt</div>
              </div>
            )}
            {approvedCount > 0 && (
              <div>
                <div className="text-3xl font-black text-green-300">{approvedCount}</div>
                <div className="text-xs text-orange-100">Đã duyệt</div>
              </div>
            )}
            {rejectedCount > 0 && (
              <div>
                <div className="text-3xl font-black text-red-300">{rejectedCount}</div>
                <div className="text-xs text-orange-100">Từ chối</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {transfers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-3">🔄</div>
            <p className="text-gray-500 font-semibold text-lg">Chưa có yêu cầu chuyển lớp</p>
            <p className="text-gray-400 text-sm mt-1">Yêu cầu chuyển lớp của học sinh sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <>
            {/* Pending first */}
            {pendingCount > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
                <div
                  className="px-5 py-3 flex items-center gap-3 border-b border-yellow-100"
                  style={{ background: '#fefce8' }}
                >
                  <span className="text-xl">⏳</span>
                  <span className="font-black text-base text-yellow-800">Chờ duyệt</span>
                  <span
                    className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: '#fef08a', color: '#713f12' }}
                  >
                    {pendingCount} yêu cầu
                  </span>
                </div>
                <TransferTable
                  transfers={transfers.filter((t) => t.status === 'pending')}
                  showActions
                />
              </div>
            )}

            {/* All transfers */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-3 border-b border-gray-100">
                <span className="text-xl">📋</span>
                <span className="font-black text-base text-gray-700">Tất cả yêu cầu</span>
              </div>
              <TransferTable transfers={transfers} showActions />
            </div>
          </>
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

// ── Sub-component ──────────────────────────────────────────────────────────────

type TransferRow = {
  id: string
  status: string
  reason: string | null
  transferDate: Date
  createdAt: Date
  approvedBy: string | null
  student: { name: string | null }
  fromCourse: { name: string }
  toCourse: { name: string }
}

function TransferTable({
  transfers,
  showActions,
}: {
  transfers: TransferRow[]
  showActions: boolean
}) {
  const STATUS_META_LOCAL: Record<string, { label: string; bg: string; color: string }> = STATUS_META

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Học sinh</th>
            <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Từ lớp</th>
            <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Sang lớp</th>
            <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Lý do</th>
            <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Ngày</th>
            <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Trạng thái</th>
            {showActions && (
              <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => {
            const meta = STATUS_META_LOCAL[t.status] ?? { label: t.status, bg: '#f8fafc', color: '#475569' }
            return (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f1f5f9' }}>
                <td className="px-4 py-3 font-semibold text-gray-900">{t.student.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{t.fromCourse.name}</td>
                <td className="px-4 py-3 text-gray-600">{t.toCourse.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                  {t.reason ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(t.transferDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <TransferActions transferId={t.id} currentStatus={t.status} />
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
