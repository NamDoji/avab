import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Calendar — Collaboration — AvaB Admin' }

export default async function CollabCalendarPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-teal-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/collab" className="hover:text-white transition-colors">Collaboration</Link>
            <span>›</span>
            <span className="text-white">Calendar</span>
          </div>
          <h1 className="text-3xl font-black mb-1">📅 Academic Calendar</h1>
          <p className="text-teal-100 text-sm">Lịch học, sự kiện trường, kỳ thi, nghỉ lễ</p>
        </div>
      </div>

      <div className="container-custom py-16 flex flex-col items-center text-center">
        <div className="text-8xl mb-6">📅</div>
        <h2 className="text-3xl font-black text-gray-800 mb-3">Đang phát triển</h2>
        <p className="text-gray-500 text-sm max-w-lg mb-6">
          Academic Calendar tập trung mọi lịch học, kỳ thi, sự kiện và ngày nghỉ lễ — đồng bộ với thời khóa biểu và lịch cá nhân.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
          {[
            { icon: '🗓️', title: 'Lịch năm học', desc: 'Học kỳ, tuần học, kỳ thi theo chuẩn Bộ GD' },
            { icon: '🏫', title: 'Lịch cơ sở', desc: 'Sự kiện riêng từng campus, phòng học' },
            { icon: '👩‍🏫', title: 'Lịch giáo viên', desc: 'Thời khóa biểu, lịch họp, lịch nghỉ' },
            { icon: '📲', title: 'Đồng bộ Mobile', desc: 'Google Calendar, iCal export' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-4 text-left border border-gray-100 shadow-sm">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="font-black text-gray-800 text-sm">{item.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/erp/timetable"
            className="inline-flex items-center gap-2 bg-white text-gray-700 rounded-2xl px-5 py-3 text-sm font-bold border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
          >
            📆 Thời khóa biểu hiện tại
          </Link>
          <Link
            href="/admin/collab"
            className="inline-flex items-center gap-2 bg-teal-600 text-white rounded-2xl px-6 py-3 text-sm font-bold hover:bg-teal-700 transition-colors"
          >
            ← Quay lại Collaboration
          </Link>
        </div>
      </div>
    </div>
  )
}
