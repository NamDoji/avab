import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Khen thưởng & Kỷ luật — School ERP' }

const categoryLabel: Record<string, string> = {
  attendance: 'Chuyên cần',
  behavior: 'Hành vi',
  academic: 'Học tập',
  achievement: 'Thành tích',
}

export default async function RewardsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const records = await prisma.rewardDiscipline.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Load users
  const userIds = [...new Set(records.map((r) => r.userId))]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, phone: true },
  })
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  // Load issuedBy names
  const issuerIds = [...new Set(records.map((r) => r.issuedBy).filter(Boolean))] as string[]
  const issuers = issuerIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: issuerIds } },
        select: { id: true, name: true },
      })
    : []
  const issuerMap = Object.fromEntries(issuers.map((u) => [u.id, u]))

  const rewards = records.filter((r) => r.type === 'reward')
  const disciplines = records.filter((r) => r.type === 'discipline')

  function RecordTable({ items, type }: { items: typeof records; type: 'reward' | 'discipline' }) {
    if (items.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <div className="text-4xl mb-2">{type === 'reward' ? '🏅' : '⚠️'}</div>
          <p className="text-gray-500 text-sm">Chưa có bản ghi nào</p>
        </div>
      )
    }
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Học sinh</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Loại</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Tiêu đề</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Ngày</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Ghi nhận bởi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const user = userMap[item.userId]
                const issuer = item.issuedBy ? issuerMap[item.issuedBy] : null
                return (
                  <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{user?.name ?? '—'}</div>
                      <div className="text-xs text-gray-400">{user?.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={
                          item.type === 'reward'
                            ? { background: '#fef9c3', color: '#854d0e' }
                            : { background: '#fee2e2', color: '#991b1b' }
                        }
                      >
                        {categoryLabel[item.category] ?? item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(item.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{issuer?.name ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-yellow-100 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Khen thưởng & Kỷ luật</span>
          </div>
          <h1 className="text-3xl font-black mb-1">🏅 Khen thưởng & Kỷ luật</h1>
          <div className="flex gap-6 mt-4">
            <div>
              <div className="text-2xl font-black">{rewards.length}</div>
              <div className="text-xs text-yellow-100">Khen thưởng</div>
            </div>
            <div>
              <div className="text-2xl font-black">{disciplines.length}</div>
              <div className="text-xs text-yellow-100">Kỷ luật</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Tabs */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-gray-800">🏅 Khen thưởng ({rewards.length})</h2>
            </div>
            <RecordTable items={rewards} type="reward" />
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-gray-800">⚠️ Kỷ luật ({disciplines.length})</h2>
            </div>
            <RecordTable items={disciplines} type="discipline" />
          </section>
        </div>
      </div>
    </div>
  )
}
