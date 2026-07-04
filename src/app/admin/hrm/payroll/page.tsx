import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PayrollExportButton from './PayrollExportButton'

export const metadata = { title: 'Bảng lương — HRM — AvaB Admin' }

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  fulltime: 'Toàn thời gian',
  parttime: 'Bán thời gian',
  probation: 'Thử việc',
  freelance: 'Freelance',
}

function fmtVND(n: number) {
  return n.toLocaleString('vi-VN') + ' đ'
}

// Simple payroll calculation
function calcAllowance(salary: number, type: string): number {
  if (type === 'fulltime') return Math.round(salary * 0.12)
  if (type === 'parttime') return Math.round(salary * 0.08)
  if (type === 'probation') return 0
  return Math.round(salary * 0.05)
}

// BHXH 10.5% + small TNCN estimate
function calcDeduction(salary: number): number {
  return Math.round(salary * 0.105)
}

export default async function HRMPayrollPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  const orgUserFilter = orgCtx?.id
    ? { organizationUsers: { some: { organizationId: orgCtx.id } } }
    : {}

  const now = new Date()
  const monthLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`

  const contracts = await prisma.contract.findMany({
    where: { status: 'active' },
    include: { employee: { select: { name: true, phone: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const rows = contracts.map((c) => {
    const salary = c.salary ?? 0
    const allowance = calcAllowance(salary, c.type)
    const deduction = calcDeduction(salary)
    const net = salary + allowance - deduction
    return {
      id: c.id,
      name: c.employee.name ?? c.employee.phone,
      phone: c.employee.phone,
      role: c.employee.role,
      position: c.position,
      contractType: CONTRACT_TYPE_LABELS[c.type] ?? c.type,
      salary,
      allowance,
      deduction,
      net,
    }
  })

  const totalSalary = rows.reduce((s, r) => s + r.salary, 0)
  const totalAllowance = rows.reduce((s, r) => s + r.allowance, 0)
  const totalDeduction = rows.reduce((s, r) => s + r.deduction, 0)
  const totalNet = rows.reduce((s, r) => s + r.net, 0)

  const totalStaff = await prisma.user.count({ where: { role: { in: ['ADMIN', 'TEACHER'] } } })

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-red-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">Bảng lương</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black mb-1">💰 Bảng lương</h1>
              <p className="text-red-100 text-sm">Tính lương từ hợp đồng đang hiệu lực — {monthLabel}</p>
            </div>
            <PayrollExportButton rows={rows} month={monthLabel} />
          </div>

          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Nhân viên có HĐ', value: rows.length, icon: '👤', sub: `/ ${totalStaff} tổng` },
              { label: 'Lương cơ bản', value: fmtVND(totalSalary), icon: '💵' },
              { label: 'Phụ cấp', value: fmtVND(totalAllowance), icon: '➕' },
              { label: 'Thực lĩnh', value: fmtVND(totalNet), icon: '💰' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-3">
                <div className="text-lg font-black">{s.value}</div>
                <div className="text-xs text-red-100 mt-0.5">
                  {s.icon} {s.label}
                </div>
                {s.sub && <div className="text-xs text-red-200 mt-0.5">{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">
        {/* Finance link banner */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-3xl border border-red-200 p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-black text-gray-900 mb-1">🔗 Tích hợp với Finance Center</h3>
            <p className="text-gray-500 text-sm">
              Dữ liệu tài chính, ngân sách nhân sự và báo cáo chi phí được quản lý tại Finance Center.
            </p>
          </div>
          <Link
            href="/admin/finance"
            className="flex items-center gap-2 bg-red-600 text-white rounded-2xl px-5 py-2.5 text-sm font-bold hover:bg-red-700 transition-colors whitespace-nowrap shadow-sm"
          >
            💰 Finance Center →
          </Link>
        </div>

        {/* No contracts warning */}
        {rows.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-black text-amber-800 mb-1">Chưa có hợp đồng đang hiệu lực</p>
            <p className="text-amber-700 text-sm mb-4">Bảng lương được tính từ các hợp đồng có trạng thái &quot;active&quot;</p>
            <Link
              href="/admin/hrm/contracts"
              className="inline-flex items-center gap-2 bg-amber-600 text-white rounded-2xl px-5 py-2.5 text-sm font-bold hover:bg-amber-700 transition-colors"
            >
              📄 Quản lý hợp đồng →
            </Link>
          </div>
        )}

        {/* Payroll formula */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">📐 Công thức tính lương</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              { icon: '💵', label: 'Lương cơ bản', desc: 'Theo hợp đồng lao động', color: 'bg-blue-50 border-blue-200' },
              {
                icon: '➕',
                label: 'Phụ cấp (theo loại HĐ)',
                desc: 'Toàn thời gian 12%, Bán thời gian 8%, Freelance 5%',
                color: 'bg-green-50 border-green-200',
              },
              { icon: '➖', label: 'Khấu trừ (10.5%)', desc: 'BHXH 8% + BHYT 1.5% + BHTN 1%', color: 'bg-red-50 border-red-200' },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl border p-4 ${item.color}`}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-black text-gray-900 mb-1">{item.label}</div>
                <p className="text-gray-600 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 font-mono text-sm text-gray-700">
            <span className="font-black text-gray-900">Thực lĩnh</span>
            {' = Lương cơ bản + Phụ cấp − Khấu trừ'}
          </div>
        </div>

        {/* Payroll table */}
        {rows.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm font-black text-gray-700">📋 Bảng lương {monthLabel}</p>
              <span className="bg-green-100 text-green-700 rounded-xl px-3 py-1 text-xs font-black">
                ✅ Dữ liệu thực từ hợp đồng
              </span>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-bold text-gray-600 text-xs">Nhân viên</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Chức vụ</th>
                    <th className="text-right px-4 py-3 font-bold text-gray-600 text-xs">Lương cơ bản</th>
                    <th className="text-right px-4 py-3 font-bold text-gray-600 text-xs">Phụ cấp</th>
                    <th className="text-right px-4 py-3 font-bold text-gray-600 text-xs">Khấu trừ</th>
                    <th className="text-right px-5 py-3 font-bold text-gray-600 text-xs">Thực lĩnh</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-black text-sm flex-shrink-0">
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{row.name}</div>
                            <div className="text-xs text-gray-400">{row.role} · {row.contractType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{row.position ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-700 font-medium">{fmtVND(row.salary)}</td>
                      <td className="px-4 py-3 text-right text-green-700 font-medium">+{fmtVND(row.allowance)}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">−{fmtVND(row.deduction)}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-black text-gray-900 text-base">{fmtVND(row.net)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="px-5 py-3 font-black text-gray-900" colSpan={2}>Tổng cộng</td>
                    <td className="px-4 py-3 text-right font-black text-gray-900">{fmtVND(totalSalary)}</td>
                    <td className="px-4 py-3 text-right font-black text-green-700">+{fmtVND(totalAllowance)}</td>
                    <td className="px-4 py-3 text-right font-black text-red-600">−{fmtVND(totalDeduction)}</td>
                    <td className="px-5 py-3 text-right font-black text-red-700 text-base">{fmtVND(totalNet)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
