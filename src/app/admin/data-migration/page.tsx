import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { DataMigrationImportSection } from './DataMigrationImportSection'

export const metadata = { title: 'Data Migration Center — AvaB' }

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Chờ xử lý', cls: 'bg-gray-100 text-gray-600' },
  analyzing:  { label: 'Đang phân tích', cls: 'bg-blue-100 text-blue-700' },
  mapping:    { label: 'Mapping', cls: 'bg-indigo-100 text-indigo-700' },
  validating: { label: 'Kiểm tra', cls: 'bg-yellow-100 text-yellow-700' },
  importing:  { label: 'Đang import', cls: 'bg-orange-100 text-orange-700' },
  done:       { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
  failed:     { label: 'Thất bại', cls: 'bg-red-100 text-red-700' },
  rolled_back:{ label: 'Đã rollback', cls: 'bg-gray-200 text-gray-500' },
}

const MODULE_LABELS: Record<string, string> = {
  students: '👦 Học sinh',
  teachers: '👨‍🏫 Giáo viên',
  courses: '📚 Khóa học',
  classes: '🏫 Lớp học',
  rooms: '🚪 Phòng học',
  questions: '❓ Câu hỏi',
}

const TEMPLATE_MODULES = [
  { key: 'students', label: '👦 Học sinh' },
  { key: 'teachers', label: '👨‍🏫 Giáo viên' },
  { key: 'courses', label: '📚 Khóa học' },
  { key: 'rooms', label: '🚪 Phòng học' },
  { key: 'questions', label: '❓ Câu hỏi' },
]

function fmt(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export default async function DataMigrationPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) redirect('/dang-nhap')

  const logs = await prisma.migrationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const totalMigrations = logs.length
  const doneLogs = logs.filter(l => l.status === 'done')
  const totalImported = doneLogs.reduce((s, l) => s + (l.successRows ?? 0), 0)

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-sky-200 text-sm font-semibold mb-1">🧭 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-1">📦 Data Migration Center</h1>
          <p className="text-sky-200 text-sm">Import học sinh · giáo viên · khóa học từ Excel/CSV với AI mapping</p>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">

        {/* Top CTA cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/data-migration/new"
            className="relative overflow-hidden rounded-2xl p-6 text-white hover:scale-[1.01] transition-transform shadow-md group"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                🚀
              </div>
              <div>
                <h2 className="text-xl font-black">Import mới</h2>
                <p className="text-sky-200 text-sm mt-0.5">Upload file · AI phân tích · Import ngay</p>
              </div>
              <span className="ml-auto text-3xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">📋</div>
              <h2 className="text-lg font-black text-gray-800">Lịch sử import</h2>
            </div>
            <p className="text-sm text-gray-500">Xem danh sách các lần import bên dưới</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tổng migrations', value: totalMigrations, color: 'text-indigo-600' },
            { label: 'Thành công', value: doneLogs.length, color: 'text-green-600' },
            { label: 'Bản ghi đã import', value: totalImported.toLocaleString('vi-VN'), color: 'text-sky-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Migration log table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-800">📋 Lịch sử Migration</h2>
          </div>
          {logs.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-medium">Chưa có lần import nào</p>
              <Link
                href="/admin/data-migration/new"
                className="inline-block mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
              >
                🚀 Import ngay
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-semibold">Module</th>
                    <th className="text-left px-4 py-3 font-semibold">File</th>
                    <th className="text-right px-4 py-3 font-semibold">Bản ghi</th>
                    <th className="text-right px-4 py-3 font-semibold">Thành công</th>
                    <th className="text-right px-4 py-3 font-semibold">Thất bại</th>
                    <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="text-right px-4 py-3 font-semibold">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(log => {
                    const badge = STATUS_BADGE[log.status] ?? STATUS_BADGE.pending
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {MODULE_LABELS[log.module] ?? log.module}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{log.fileName}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{log.totalRows.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">{log.successRows.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-right font-semibold text-red-500">{log.failedRows.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">{fmt(log.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Data Migration Import Section (client) */}
        <DataMigrationImportSection />

        {/* Bulk import instructions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <details>
            <summary className="px-6 py-4 cursor-pointer list-none flex items-center gap-3 hover:bg-gray-50 transition-colors select-none">
              <span className="text-xl">📖</span>
              <span className="font-black text-gray-800">Hướng dẫn import dữ liệu hàng loạt</span>
              <span className="ml-auto text-xs text-gray-400">Nhấn để xem ▾</span>
            </summary>
            <div className="px-6 pb-6 pt-2 space-y-4">
              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { step: '1', icon: '📥', title: 'Tải template', desc: 'Tải file mẫu Excel (.xlsx) tương ứng với loại dữ liệu bạn muốn import. Không thay đổi tên cột.' },
                  { step: '2', icon: '✏️', title: 'Điền dữ liệu', desc: 'Điền dữ liệu vào file theo đúng định dạng. Mỗi hàng là một bản ghi. Xem cột bắt buộc (*) và cột tuỳ chọn.' },
                  { step: '3', icon: '🚀', title: 'Import', desc: 'Upload file và bấm Import. AI sẽ tự động mapping, kiểm tra lỗi và hiển thị kết quả trước khi xác nhận.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center flex-shrink-0">{s.step}</div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{s.icon} {s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Format notes */}
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-100">
                <p className="text-sm font-bold text-sky-700 mb-2">📌 Lưu ý định dạng</p>
                <ul className="text-xs text-sky-600 space-y-1 list-disc pl-4">
                  <li>Hỗ trợ định dạng: <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong></li>
                  <li>Kích thước file tối đa: <strong>10 MB</strong> (≈ 50,000 bản ghi)</li>
                  <li>Ngày tháng định dạng: <strong>DD/MM/YYYY</strong> hoặc <strong>YYYY-MM-DD</strong></li>
                  <li>Số điện thoại Việt Nam: bắt đầu bằng <strong>0</strong> hoặc <strong>+84</strong></li>
                  <li>Encoding: <strong>UTF-8</strong> (đảm bảo tiếng Việt hiển thị đúng)</li>
                  <li>Dòng đầu tiên là <strong>header</strong> — không import vào database</li>
                </ul>
              </div>

              {/* AI Migration link */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-indigo-700">Import nâng cao với AI Mapping</p>
                  <p className="text-xs text-indigo-500">Không khớp cột? AI sẽ tự động phân tích và mapping file của bạn.</p>
                </div>
                <a
                  href="/admin/data-migration/new"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  🚀 Thử ngay
                </a>
              </div>
            </div>
          </details>
        </div>

      </div>
    </div>
  )
}
