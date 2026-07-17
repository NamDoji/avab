import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CalendarGrid, { type HolidayEvent } from '@/components/admin/collab/CalendarGrid'

export const metadata = { title: 'Academic Calendar — AvaB Admin' }

const STATIC_EVENTS = [
  { date: '2025-09-05', label: 'Khai giảng năm học 2025-2026', type: 'event' },
  { date: '2025-11-20', label: 'Ngày Nhà giáo Việt Nam', type: 'event' },
  { date: '2025-11-24', label: 'Thi giữa kỳ I', type: 'exam' },
  { date: '2026-01-15', label: 'Tổng kết học kỳ I', type: 'event' },
  { date: '2026-01-25', label: 'Nghỉ Tết Nguyên Đán', type: 'holiday' },
  { date: '2026-02-09', label: 'Học kỳ II bắt đầu', type: 'event' },
  { date: '2026-04-20', label: 'Thi giữa kỳ II', type: 'exam' },
  { date: '2026-05-15', label: 'Thi cuối kỳ II', type: 'exam' },
  { date: '2026-05-30', label: 'Lễ bế giảng năm học', type: 'event' },
]

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) >= new Date()
}

export default async function CollabCalendarPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const [academicYears, holidays, timetableVersions] = await Promise.all([
    prisma.academicYear.findMany({ orderBy: { startDate: 'desc' }, take: 5 }),
    prisma.holidayCalendar.findMany({
      orderBy: { startDate: 'asc' },
      where: { startDate: { gte: new Date() } },
      take: 20,
    }),
    prisma.timetableVersion.findMany({ where: { status: 'published' }, take: 3 }),
  ])

  const currentYear = academicYears.find((y) => y.isCurrent)

  // Build typed HolidayEvent array for CalendarGrid
  const holidayEvents: HolidayEvent[] = holidays.map((h) => ({
    id: h.id,
    name: h.name,
    startDate: h.startDate.toISOString(),
    endDate: h.endDate.toISOString(),
    type: h.type ?? 'holiday',
  }))

  const upcomingStaticEvents = STATIC_EVENTS.filter((e) => isUpcoming(e.date))
  const nextEvent = upcomingStaticEvents[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────── */}
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
          <p className="text-teal-100 text-sm">
            Lịch học, nghỉ lễ, kỳ thi · {holidays.length} sự kiện từ DB
          </p>

          {/* Next event banner */}
          {nextEvent && (
            <div
              className="mt-5 flex flex-wrap items-start gap-3 rounded-2xl px-4 sm:px-5 py-3"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <span className="text-2xl">📌</span>
              <div>
                <p className="text-xs text-teal-200 font-bold uppercase tracking-wide">
                  Sắp tới — còn {daysUntil(nextEvent.date)} ngày
                </p>
                <p className="font-black">{nextEvent.label}</p>
                <p className="text-teal-200 text-xs">
                  {new Date(nextEvent.date).toLocaleDateString('vi-VN', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Calendar Grid ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full month calendar grid */}
            <CalendarGrid
              holidays={holidayEvents}
              staticEvents={STATIC_EVENTS}
            />

            {/* Academic Years */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
                🎓 Năm học
                <Link href="/admin/erp" className="ml-auto text-xs text-teal-600 font-bold hover:text-teal-800">
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
                        <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>
                          ✅ Hiện tại
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Current year stats */}
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

            {/* Upcoming holidays from DB */}
            {holidays.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm p-5">
                <h3 className="font-black text-sm text-gray-800 mb-3">🔴 Nghỉ lễ sắp tới</h3>
                <div className="space-y-2">
                  {holidays.slice(0, 5).map((h) => (
                    <div
                      key={h.id}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: '#fef2f2' }}
                    >
                      <span className="text-lg shrink-0">🔴</span>
                      <div>
                        <p className="text-sm font-bold text-red-700">{h.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(h.startDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })}
                          {h.startDate.toISOString().slice(0, 10) !== h.endDate.toISOString().slice(0, 10) &&
                            ` → ${new Date(h.endDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })}`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Published TKB */}
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <h3 className="font-black text-sm text-gray-800 mb-3 flex items-center gap-2">
                📅 Thời khóa biểu đang áp dụng
                <Link href="/admin/erp/timetable" className="ml-auto text-xs text-cherry-600 font-bold hover:text-cherry-800">Xem →</Link>
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
                      className="block p-3 rounded-2xl hover:bg-cherry-50 transition-colors"
                      style={{ background: '#f8fafc' }}
                    >
                      <p className="font-black text-sm text-gray-800 truncate">{v.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>
                          ✅ Active
                        </span>
                        {v.score != null && <span className="text-xs text-gray-400">🎯 {v.score}/100</span>}
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
              <div className="space-y-1">
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
          </div>
        </div>
      </div>
    </div>
  )
}
