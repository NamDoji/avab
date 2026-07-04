import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'KPI & OKR — HRM — AvaB Admin' }

const SAMPLE_KPI = [
  { name: 'Nguyễn Văn An',     role: 'TEACHER', target: 40, actual: 38, rating: 'A' },
  { name: 'Trần Thị Bình',    role: 'TEACHER', target: 40, actual: 42, rating: 'A+' },
  { name: 'Lê Minh Cường',    role: 'ADMIN',   target: 30, actual: 27, rating: 'B+' },
  { name: 'Phạm Thị Dung',    role: 'TEACHER', target: 35, actual: 30, rating: 'B' },
  { name: 'Hoàng Quốc Huy',   role: 'TEACHER', target: 40, actual: 38, rating: 'A' },
]

const RATING_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700',
  'A':  'bg-green-100 text-green-700',
  'B+': 'bg-sky-100 text-sky-700',
  'B':  'bg-blue-100 text-blue-700',
  'C':  'bg-yellow-100 text-yellow-700',
  'D':  'bg-red-100 text-red-700',
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-right">{pct}%</span>
    </div>
  )
}

export default async function HRMKpiPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const totalStaff = await prisma.user.count({ where: { role: { in: ['ADMIN', 'TEACHER'] } } })

  const avgPct = Math.round(
    SAMPLE_KPI.reduce((s, r) => s + Math.round((r.actual / r.target) * 100), 0) / SAMPLE_KPI.length,
  )

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-emerald-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">KPI &amp; OKR</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black mb-1">📊 KPI &amp; OKR Dashboard</h1>
              <p className="text-emerald-100 text-sm">Đánh giá hiệu suất dựa trên OKR Framework</p>
            </div>
            <span className="bg-amber-400 text-amber-900 rounded-2xl px-4 py-2 text-xs font-black shadow">
              🚀 Beta — Dữ liệu mẫu
            </span>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🎯', label: 'Tổng nhân viên', value: totalStaff, sub: 'Đang theo dõi KPI', color: 'from-emerald-500 to-teal-600' },
            { icon: '📈', label: 'Mục tiêu TB/tháng', value: '37.8h', sub: 'Giờ dạy / làm việc', color: 'from-sky-500 to-blue-600' },
            { icon: '✅', label: 'Hoàn thành TB', value: `${avgPct}%`, sub: 'Tỷ lệ đạt mục tiêu', color: 'from-purple-500 to-violet-600' },
            { icon: '⭐', label: 'Rating trung bình', value: 'A', sub: 'Quý 2/2026', color: 'from-amber-500 to-orange-500' },
          ].map((c) => (
            <div key={c.label} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${c.color} p-5 text-white shadow-md`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-3xl font-black">{c.value}</div>
              <div className="text-sm font-bold mt-0.5">{c.label}</div>
              <div className="text-xs opacity-80 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* OKR explanation */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">🎯 OKR Framework</h2>
              <p className="text-gray-500 text-sm mt-0.5">Objectives &amp; Key Results — Thiết lập và đo lường mục tiêu</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🏆',
                title: 'Objective',
                desc: 'Mục tiêu định tính, đầy tham vọng, truyền cảm hứng. VD: "Nâng cao chất lượng giảng dạy"',
                color: 'bg-purple-50 border-purple-200',
              },
              {
                icon: '🔑',
                title: 'Key Results',
                desc: 'Kết quả đo lường cụ thể. VD: "85% học sinh đạt loại Khá trở lên"',
                color: 'bg-sky-50 border-sky-200',
              },
              {
                icon: '📐',
                title: 'Initiatives',
                desc: 'Hành động cụ thể để đạt KR. VD: "Cập nhật giáo án mỗi tuần"',
                color: 'bg-emerald-50 border-emerald-200',
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-2xl border p-4 ${item.color}`}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-black text-gray-900 mb-1">{item.title}</div>
                <p className="text-gray-600 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-black text-gray-700">📋 Bảng KPI nhân viên — Quý 2/2026</p>
            <span className="bg-amber-100 text-amber-700 rounded-xl px-3 py-1 text-xs font-black">
              🚧 Dữ liệu mẫu
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-bold text-gray-600 text-xs">Nhân viên</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Chỉ tiêu (h)</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Thực tế (h)</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs min-w-[160px]">Tiến độ</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs">Rating</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_KPI.map((row) => {
                  const pct = Math.round((row.actual / row.target) * 100)
                  return (
                    <tr key={row.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm flex-shrink-0">
                            {row.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{row.name}</div>
                            <div className="text-xs text-gray-400">{row.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-700">{row.target}h</td>
                      <td className="px-4 py-3 font-bold text-gray-700">{row.actual}h</td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <ProgressBar pct={pct} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-xl text-xs font-black ${RATING_COLORS[row.rating] ?? 'bg-gray-100 text-gray-700'}`}>
                          {row.rating}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coming soon features */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">🚀 Tính năng sắp ra mắt</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🎯', label: 'OKR Builder', desc: 'Tạo mục tiêu theo quý' },
              { icon: '📊', label: 'Đánh giá 360°', desc: 'Phản hồi đa chiều' },
              { icon: '🤖', label: 'AI Scoring', desc: 'Tự động đánh giá KPI' },
              { icon: '📑', label: 'Báo cáo', desc: 'Xuất PDF / Excel' },
            ].map((f) => (
              <div key={f.label} className="relative rounded-2xl border border-dashed border-gray-200 p-4 bg-gray-50">
                <div className="absolute top-2 right-2">
                  <span className="bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-black">Soon</span>
                </div>
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-black text-gray-700 text-sm">{f.label}</div>
                <div className="text-gray-400 text-xs mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
