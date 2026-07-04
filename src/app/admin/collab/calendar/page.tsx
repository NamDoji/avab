import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Academic Calendar — AvaB Admin' }

const STATIC_EVENTS = [
  { date: '2025-09-05', label: 'Khai giảng năm học 2025-2026', icon: '🏫', color: '#4338ca' },
  { date: '2025-11-20', label: 'Ngày Nhà giáo Việt Nam', icon: '👩‍🏫', color: '#0891b2' },
  { date: '2025-11-24', label: 'Thi giữa kỳ I', icon: '📝', color: '#dc2626' },
  { date: '2026-01-15', label: 'Tổng kết học kỳ I', icon: '📊', color: '#7c3aed' },
  { date: '2026-01-25', label: 'Nghỉ Tết Nguyên Đán', icon: '🎉', color: '#d97706' },
  { date: '2026-02-09', label: 'Học kỳ II bắt đầu', icon: '📚', color: '#059669' },
  { date: '2026-04-20', label: 'Thi giữa kỳ II', icon: '📝', color: '#dc2626' },
  { date: '2026-05-15', label: 'Thi cuối kỳ II', icon: '📝', color: '#be123c' },
  { date: '2026-05-30', label: 'Lễ bế giảng năm học', icon: '🎓', color: '#4338ca' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date()
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  return diff
}

export default async function CollabCalendarPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const [academicYears, timetableVersions] = await Promise.all([
    prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
      take: 5,
    }),
    prisma.timetableVersion.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    }),
  ])

  const currentYear = academicYears.find((y) => y.isCurrent)
  const upcomingEvents = STATIC_EVENTS.filter((e) => isUpcoming(e.date)).slice(0, 4)
  const nextEvent = upcomingEvents[0]

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(25%, -50%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(16,185,129,0.15)', transform: 'translate(-25%, 50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-teal-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/collab" className="hover:text-white transition-colors">Collaboration</Link>
            <span>›</span>
            <span className="text-white">Calendar</span>
          </div>
          <h1 className="text-3xl font-black mb-1">📅 Academic Calendar</h1>
          <p className="text-teal-100 text-sm">Lịch học, sự kiện trường, kỳ thi, nghỉ lễ</p>

          {/* Next event banner */}
          {nextEvent && (
            <div
              className="mt-5 inline-flex items-center gap-3 rounded-2xl px-5 py-3"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <span className="text-2xl">{nextEvent.icon}</span>
              <div>
                <p className="text-xs text-teal-200 font-bold uppercase tracking-wide">
                  Sự kiện sắp tới — còn {daysUntil(nextEvent.date)} ngày
                </p>
                <p className="font-black">{nextEvent.label}</p>
                <p className="text-teal-200 text-xs">{formatDate(nextEvent.date)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ─────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Academic Years */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
                🎓 Năm học
                <Link
                  href="/admin/erp"
                  className="ml-auto text-xs text-teal-600 font-bold hover:text-teal-800"
                >
                  Quản lý →
                </Link>
              </h2>

              {academicYears.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-gray-400 text-sm">Chưa có năm học nào được tạo</p>
                  <Link
                    href="/admin/erp"
                    className="mt-3 inline-block text-xs font-bold text-teal-600 hover:text-teal-800"
                  >
                    + Tạo năm học đầu tiên
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {academicYears.map((y) => (
                    <div
                      key={y.id}
                      className="flex items-center justify-between p-4 rounded-2xl"
                      style={{
                        background: y.isCurrent ? '#f0fdf4' : '#f8fafc',
                        border: y.isCurrent ? '2px solid #86efac' : '2px solid transparent',
                      }}
                    >
                      <div>
                        <p className="font-black text-gray-800 text-sm">{y.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(y.startDate).toLocaleDateString('vi-VN')} →{' '}
                          {new Date(y.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      {y.isCurrent && (
                        <span
                          className="text-xs font-black px-2.5 py-1 rounded-full"
                          style={{ background: '#dcfce7', color: '#166534' }}
                        >
                          ✅ Hiện tại
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-base font-black text-gray-800 mb-4">
                🗓️ Sự kiện năm học 2025-2026
              </h2>

              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-5 top-0 bottom-0 w-0.5"
                  style={{ background: '#e2e8f0' }}
                />

                <div className="space-y-4">
                  {STATIC_EVENTS.map((event, i) => {
                    const upcoming = isUpcoming(event.date)
                    const days = daysUntil(event.date)
                    return (
                      <div key={i} className="flex items-start gap-4 pl-0 relative">
                        {/* Dot */}
                        <div
                          className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-lg shrink-0"
                          style={{
                            background: upcoming ? event.color : '#e2e8f0',
                            opacity: upcoming ? 1 : 0.5,
                          }}
                        >
                          {event.icon}
                        </div>

                        <div
                          className="flex-1 p-3 rounded-2xl"
                          style={{
                            background: upcoming ? '#f8fafc' : '#f1f5f9',
                            opacity: upcoming ? 1 : 0.65,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-black text-sm text-gray-800">{event.label}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{formatDate(event.date)}</p>
                            </div>
                            {upcoming && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                                style={{
                                  background: days <= 14 ? '#fef2f2' : '#eff6ff',
                                  color: days <= 14 ? '#dc2626' : '#2563eb',
                                }}
                              >
                                {days <= 0 ? 'Hôm nay' : `${days} ngày`}
                              </span>
                            )}
                            {!upcoming && (
                              <span className="text-xs text-gray-400 font-semibold">✓ Đã qua</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column ─────────────── */}
          <div className="space-y-6">

            {/* Quick stats */}
            {currentYear && (
              <div
                className="rounded-3xl p-5 text-white shadow-xl"
                style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)' }}
              >
                <h3 className="font-black text-sm mb-3 text-teal-100">📊 Năm học hiện tại</h3>
                <p className="text-xl font-black mb-1">{currentYear.name}</p>
                <div className="text-teal-200 text-xs space-y-1 mt-3">
                  <div>Bắt đầu: {new Date(currentYear.startDate).toLocaleDateString('vi-VN')}</div>
                  <div>Kết thúc: {new Date(currentYear.endDate).toLocaleDateString('vi-VN')}</div>
                  <div className="mt-2">
                    Còn lại:{' '}
                    <span className="text-white font-black">
                      {Math.max(0, Math.ceil((new Date(currentYear.endDate).getTime() - Date.now()) / 86400000))} ngày
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Published TKB */}
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <h3 className="font-black text-sm text-gray-800 mb-3 flex items-center gap-2">
                📅 Thời khóa biểu đang áp dụng
                <Link
                  href="/admin/erp/timetable"
                  className="ml-auto text-xs text-indigo-600 font-bold hover:text-indigo-800"
                >
                  Xem →
                </Link>
              </h3>

              {timetableVersions.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-gray-400 text-xs mb-3">Chưa có TKB nào được publish</p>
                  <Link
                    href="/admin/erp/timetable"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black text-white"
                    style={{ background: '#4338ca' }}
                  >
                    🤖 Tạo TKB với AI
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {timetableVersions.map((v) => (
                    <Link
                      key={v.id}
                      href="/admin/erp/timetable"
                      className="block p-3 rounded-2xl hover:bg-indigo-50 transition-colors"
                      style={{ background: '#f8fafc' }}
                    >
                      <p className="font-black text-sm text-gray-800 truncate">{v.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: '#dcfce7', color: '#166534' }}
                        >
                          ✅ Active
                        </span>
                        {v.score != null && (
                          <span className="text-xs text-gray-400">🎯 {v.score}/100</span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {v.publishedAt
                            ? new Date(v.publishedAt).toLocaleDateString('vi-VN')
                            : new Date(v.generatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <h3 className="font-black text-sm text-gray-800 mb-3">🔗 Liên kết nhanh</h3>
              <div className="space-y-2">
                {[
                  { href: '/admin/erp/timetable', icon: '📅', label: 'AI Timetable Engine' },
                  { href: '/admin/erp/teachers', icon: '👩‍🏫', label: 'Quản lý giáo viên' },
                  { href: '/admin/erp/classrooms', icon: '🏛️', label: 'Quản lý phòng học' },
                  { href: '/admin/erp/classes', icon: '📚', label: 'Quản lý lớp học' },
                  { href: '/admin/erp/attendance', icon: '📋', label: 'Điểm danh' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                    <span className="ml-auto text-gray-300">›</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <h3 className="font-black text-sm text-gray-800 mb-3">🚀 Sắp ra mắt</h3>
              <div className="space-y-2">
                {[
                  { icon: '📲', label: 'Google Calendar sync' },
                  { icon: '📧', label: 'Email nhắc nhở sự kiện' },
                  { icon: '🔔', label: 'Push notification' },
                  { icon: '📊', label: 'iCal export' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                    <span
                      className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: '#f1f5f9', color: '#94a3b8' }}
                    >
                      Soon
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
