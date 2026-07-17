import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TimetableVersionCompare from './TimetableVersionCompare'
import TimetableAIGenerator from './TimetableAIGenerator'

export const metadata = { title: 'Thời khóa biểu AI — School ERP' }

export default async function TimetablePage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #a855f7 0%, #951F3D 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.2)', transform: 'translate(-25%, 50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-cherry-200 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Thời khóa biểu</span>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black">📅 AI Timetable Engine</h1>
              <span
                className="text-xs font-black px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(250,204,21,1)', color: '#713f12' }}
              >
                AI-Powered
              </span>
            </div>
            <Link
              href="/admin/erp/timetable/settings"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none' }}
            >
              ⚙️ Cấu hình TKB
            </Link>
          </div>
          <p className="text-cherry-200 text-sm max-w-xl">
            AI tự động tạo thời khóa biểu tối ưu — không trùng giáo viên, không trùng phòng, cân bằng tải
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* AI Generator */}
        <TimetableAIGenerator />

        {/* Feature list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '🚫', title: 'Không trùng GV', desc: 'AI đảm bảo giáo viên không bị xếp 2 lớp cùng giờ' },
            { icon: '🏛️', title: 'Không trùng phòng', desc: 'Phòng học được phân bổ tự động, không xung đột' },
            { icon: '⚖️', title: 'Cân bằng tải', desc: 'Phân phối đều tiết học theo ngày và tuần' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h4 className="font-black text-gray-800 text-sm mb-1">{f.title}</h4>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Compare section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-800 mb-1">📊 So sánh phương án</h2>
              <p className="text-sm text-gray-500">
                So sánh 2 phương án TKB — xem xung đột và chọn phương án tốt nhất
              </p>
            </div>
          </div>
          <TimetableVersionCompare />
        </div>
      </div>
    </div>
  )
}
