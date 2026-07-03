import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function TeacherSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  const userId = (session!.user as any).id as string

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const pageSize = 20

  const [total, sessions] = await Promise.all([
    prisma.sessionFeedback.count({ where: { createdBy: userId } }),
    prisma.sessionFeedback.findMany({
      where: { createdBy: userId },
      orderBy: { sessionDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        subject: true,
        records: { select: { attendance: true, aiComment: true } },
      },
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">📚 Buổi học của tôi</h1>
        <p className="text-gray-500 mt-1 text-sm">{total} buổi học</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {sessions.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold">Chưa có buổi học nào</p>
            <p className="text-sm mt-1">Admin sẽ tạo buổi học và phân công cho bạn</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500">Môn học</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Ngày</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500">Học sinh có mặt</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-500">Nhận xét AI</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessions.map((s) => {
                  const total = s.records.length
                  const present = s.records.filter((r) => r.attendance).length
                  const aiCount = s.records.filter((r) => r.aiComment).length
                  const aiPct = total > 0 ? Math.round((aiCount / total) * 100) : 0
                  return (
                    <tr key={s.id} className="hover:bg-teal-50/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{s.subject.icon ?? '📖'}</span>
                          <span className="font-semibold text-gray-900">{s.subject.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {new Date(s.sessionDate).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-semibold text-gray-800">
                          {present}/{total}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            aiPct === 100
                              ? 'bg-teal-50 text-teal-700'
                              : aiPct > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {aiPct}% ({aiCount}/{total})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/giao-vien/buoi-hoc/${s.id}`}
                          className="text-teal-600 hover:text-teal-700 font-semibold text-xs hover:underline"
                        >
                          Chi tiết →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 px-5 py-4 border-t border-gray-100">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/giao-vien/buoi-hoc?page=${p}`}
                    className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition ${
                      p === page
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
