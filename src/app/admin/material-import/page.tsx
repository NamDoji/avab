import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Teaching Material Import — AvaB' }

const SOURCE_PILLS = [
  { icon: '📝', label: 'Word' },
  { icon: '📄', label: 'PDF' },
  { icon: '📊', label: 'PowerPoint' },
  { icon: '📈', label: 'Excel' },
  { icon: '📋', label: 'CSV' },
  { icon: '🔵', label: 'Google Drive' },
  { icon: '🎮', label: 'Quizizz' },
  { icon: '🎨', label: 'Kahoot' },
  { icon: '🏫', label: 'Moodle' },
  { icon: '📺', label: 'YouTube' },
  { icon: '🌐', label: 'Web URL' },
  { icon: '📦', label: 'Zip' },
]

function statusBadge(status: string) {
  switch (status) {
    case 'analyzing': return { label: 'Đang phân tích', bg: '#dbeafe', color: '#1d4ed8' }
    case 'mapping':   return { label: 'Đang mapping',   bg: '#fef3c7', color: '#92400e' }
    case 'importing': return { label: 'Đang import',    bg: '#FDECF0', color: '#5F1227' }
    case 'done':      return { label: 'Hoàn tất',       bg: '#d1fae5', color: '#065f46' }
    case 'failed':    return { label: 'Lỗi',            bg: '#fee2e2', color: '#991b1b' }
    default:          return { label: status,            bg: '#f3f4f6', color: '#374151' }
  }
}

function detectedTypeLabel(t: string | null) {
  switch (t) {
    case 'lesson':     return '📖 Bài giảng'
    case 'homework':   return '📝 Bài tập'
    case 'quiz':       return '❓ Đề kiểm tra'
    case 'answer_key': return '✅ Đáp án'
    case 'slide':      return '🖼️ Slide'
    case 'reference':  return '📚 Tài liệu tham khảo'
    default:           return '❓ Chưa xác định'
  }
}

export default async function MaterialImportHubPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) redirect('/dang-nhap')

  const logs = await prisma.materialImportLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      sourceName: true,
      detectedType: true,
      detectedSubject: true,
      detectedGrade: true,
      status: true,
      questionsFound: true,
      questionsImported: true,
      createdAt: true,
      completedAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #951F3D 0%, #0ea5e9 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'rgba(99,102,241,0.2)', transform: 'translate(-25%, 50%)' }} />
        <div className="container-custom relative">
          <p className="text-cherry-200 text-sm font-semibold mb-1">📥 Import & Migration</p>
          <h1 className="text-4xl font-black mb-2">📚 Teaching Material Import</h1>
          <p className="text-cherry-100 text-sm max-w-xl">
            Đưa toàn bộ học liệu từ Word, PDF, Google Drive, Quizizz... vào AvaB bằng AI — Tự động nhận diện loại, môn học, khối lớp và import đúng cấu trúc.
          </p>

          {/* Source pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {SOURCE_PILLS.map(p => (
              <span
                key={p.label}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
              >
                {p.icon} {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* CTA cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/material-import/new"
            className="relative overflow-hidden rounded-3xl p-6 text-white hover:scale-[1.01] transition-transform shadow-lg hover:shadow-xl group"
            style={{ background: 'linear-gradient(135deg, #951F3D 0%, #0ea5e9 100%)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(25%, -50%)' }} />
            <div className="text-3xl mb-3">🚀</div>
            <h2 className="text-xl font-black mb-1">Import tài liệu mới</h2>
            <p className="text-sm" style={{ color: 'rgba(221,214,254,1)' }}>
              Upload Word, PDF, Excel, CSV hoặc paste link → AI phân tích → import vào AvaB
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all">
              <span>Bắt đầu ngay</span>
              <span>→</span>
            </div>
          </Link>

          <div
            className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', opacity: 0.85 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(25%, -50%)' }} />
            <div className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>Sắp ra mắt</div>
            <div className="text-3xl mb-3">📦</div>
            <h2 className="text-xl font-black mb-1">Import hàng loạt (Batch)</h2>
            <p className="text-sm" style={{ color: 'rgba(186,230,253,1)' }}>
              Upload nhiều file cùng lúc, AI xử lý song song và import toàn bộ vào hệ thống
            </p>
          </div>
        </div>

        {/* Recent imports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-700">📋 Lịch sử Import</p>
            <span className="text-xs text-gray-400">{logs.length} lần gần nhất</span>
          </div>

          {logs.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <div className="text-5xl mb-3">📂</div>
              <p className="text-gray-500 font-medium">Chưa có lịch sử import</p>
              <p className="text-sm text-gray-400 mt-1">Bắt đầu bằng cách import tài liệu đầu tiên</p>
              <Link
                href="/admin/material-import/new"
                className="inline-block mt-4 text-sm font-bold px-4 py-2 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #951F3D 0%, #0ea5e9 100%)' }}
              >
                🚀 Import ngay
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs">Tên file</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs">Loại phát hiện</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs">Môn</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs">Lớp</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs">Câu hỏi</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs">Trạng thái</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => {
                      const badge = statusBadge(log.status)
                      return (
                        <tr
                          key={log.id}
                          className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                        >
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900 truncate max-w-[180px] block">{log.sourceName}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{detectedTypeLabel(log.detectedType)}</td>
                          <td className="px-4 py-3">
                            {log.detectedSubject ? (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cherry-50 text-cherry-700">{log.detectedSubject}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {log.detectedGrade ? `Lớp ${log.detectedGrade}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {log.questionsFound > 0 ? (
                              <span>{log.questionsImported}/{log.questionsFound}</span>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
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
    </div>
  )
}
