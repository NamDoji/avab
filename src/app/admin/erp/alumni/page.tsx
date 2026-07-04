import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Alumni — School ERP' }

export default async function AlumniPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const currentYear = new Date().getFullYear()

  const alumni = await prisma.alumniRecord.findMany({
    include: { user: { select: { name: true, phone: true, avatar: true } } },
    orderBy: { graduationYear: 'desc' },
  })

  // Stats
  const thisYear = alumni.filter((a) => a.graduationYear === currentYear).length
  const lastYear = alumni.filter((a) => a.graduationYear === currentYear - 1).length

  // Group by year
  const byYear: Record<number, typeof alumni> = {}
  for (const a of alumni) {
    if (!byYear[a.graduationYear]) byYear[a.graduationYear] = []
    byYear[a.graduationYear].push(a)
  }
  const sortedYears = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
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
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-1">🎓 Alumni</h1>
              <p className="text-teal-100 text-sm">Cựu học sinh đã hoàn thành khóa học</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 mt-5">
            <div>
              <div className="text-3xl font-black">{alumni.length}</div>
              <div className="text-xs text-teal-100">Tổng cựu học sinh</div>
            </div>
            {thisYear > 0 && (
              <div>
                <div className="text-3xl font-black text-yellow-300">{thisYear}</div>
                <div className="text-xs text-teal-100">Năm {currentYear}</div>
              </div>
            )}
            {lastYear > 0 && (
              <div>
                <div className="text-3xl font-black">{lastYear}</div>
                <div className="text-xs text-teal-100">Năm {currentYear - 1}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-5">
        {alumni.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-3">🎓</div>
            <p className="text-gray-500 font-semibold text-lg">Chưa có alumni</p>
            <p className="text-gray-400 text-sm mt-1">Học sinh tốt nghiệp sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          sortedYears.map((year) => (
            <div key={year} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Year header */}
              <div
                className="px-5 py-3 flex items-center gap-3 border-b border-gray-100"
                style={{ background: 'linear-gradient(90deg, #f0fdfa, #f8fafc)' }}
              >
                <span className="text-xl">🎓</span>
                <span className="font-black text-base text-teal-700">Năm tốt nghiệp {year}</span>
                <span
                  className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: '#ccfbf1', color: '#0f766e' }}
                >
                  {byYear[year].length} học sinh
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">#</th>
                      <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Tên</th>
                      <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">SĐT</th>
                      <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Xếp loại</th>
                      <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Trường tiếp theo</th>
                      <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Thành tích</th>
                      <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-xs uppercase">Email liên lạc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byYear[year].map((a, idx) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {a.user.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.user.avatar}
                                alt={a.user.name ?? ''}
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #14b8a6, #0891b2)' }}
                              >
                                {(a.user.name ?? '?')[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-gray-900">{a.user.name ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.user.phone ?? '—'}</td>
                        <td className="px-4 py-3">
                          {a.finalGrade ? (
                            <span
                              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                              style={{ background: '#dcfce7', color: '#166534' }}
                            >
                              {a.finalGrade}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {a.nextSchool ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">
                          {a.achievements ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {a.contactEmail ?? <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
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
