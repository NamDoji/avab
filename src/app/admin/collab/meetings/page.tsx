import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MeetingSummaryBtn from '@/components/admin/collab/MeetingSummaryBtn'

export const metadata = { title: 'Meeting Center — Collaboration — AvaB Admin' }

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export default async function CollabMeetingsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  // Recent session feedbacks as meeting log source
  const recentSessions = await prisma.sessionFeedback.findMany({
    orderBy: { sessionDate: 'desc' },
    take: 20,
    include: {
      subject: {
        include: { course: { select: { name: true } } },
      },
      records: { select: { id: true } },
    },
  })

  // Workflow instances with type = meeting (if any)
  const meetingWorkflows = await prisma.workflowInstance.findMany({
    where: { entityType: 'meeting' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { workflow: { select: { name: true } } },
  })

  const totalSessions = recentSessions.length

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-purple-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/collab" className="hover:text-white transition-colors">Collaboration</Link>
            <span>›</span>
            <span className="text-white">Meeting</span>
          </div>
          <h1 className="text-3xl font-black mb-1">🎥 Meeting Center</h1>
          <p className="text-purple-100 text-sm">
            {totalSessions} buổi học/họp · AI tóm tắt biên bản tự động
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Meeting List ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Summary Tool */}
            <MeetingSummaryBtn />

            {/* Workflow-based meetings */}
            {meetingWorkflows.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-black text-gray-900">🔄 Cuộc họp (Workflow)</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{meetingWorkflows.length} meeting instance</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {meetingWorkflows.map((m) => (
                    <Link
                      key={m.id}
                      href={`/admin/workflow/instances/${m.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-purple-50/50 transition"
                    >
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: '#f3f0ff' }}
                      >
                        🎥
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{m.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{m.workflow.name}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{relativeTime(m.createdAt)}</span>
                        </div>
                      </div>
                      <span className="text-gray-300 text-sm">›</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Session feedback as meeting log */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-gray-900">📚 Nhật ký Buổi học / Họp</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Từ Session Feedback của giáo viên</p>
                </div>
                <Link
                  href="/admin/erp/students"
                  className="text-xs font-bold text-teal-600 hover:text-teal-800"
                >
                  Xem tất cả →
                </Link>
              </div>

              {totalSessions === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-bold text-gray-700">Chưa có session nào</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Giáo viên ghi chú buổi học sẽ hiện tại đây
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentSessions.map((s) => {
                    const participantCount = s.records.length
                    return (
                      <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                        {/* Date avatar */}
                        <div
                          className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0 text-white"
                          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
                        >
                          <span className="text-xs font-black leading-none">
                            {new Date(s.sessionDate).getDate()}
                          </span>
                          <span className="text-[8px] font-bold uppercase opacity-80">
                            {new Date(s.sessionDate).toLocaleDateString('vi-VN', { month: 'short' })}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {s.subject.course.name} — {s.subject.name ?? 'Buổi học'}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {participantCount > 0 && (
                              <span className="text-xs text-gray-500">
                                👥 {participantCount} học sinh
                              </span>
                            )}
                            {s.sessionNote && (
                              <span className="text-xs text-gray-400 truncate max-w-[180px]">
                                📝 {s.sessionNote}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto shrink-0">
                              {relativeTime(s.sessionDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Stats */}
            <div
              className="rounded-3xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' }}
            >
              <h3 className="font-black text-sm mb-4 text-purple-100">📊 Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Buổi học gần đây</span>
                  <span className="font-black text-xl">{totalSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Cuộc họp workflow</span>
                  <span className="font-black text-xl">{meetingWorkflows.length}</span>
                </div>
              </div>
            </div>

            {/* AI Features roadmap */}
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <h3 className="font-black text-sm text-gray-800 mb-3">🤖 AI Meeting Features</h3>
              <div className="space-y-3">
                {[
                  { icon: '✅', label: 'AI tóm tắt biên bản', status: 'live', color: '#059669' },
                  { icon: '✅', label: 'Trích xuất action items', status: 'live', color: '#059669' },
                  { icon: '🔜', label: 'Ghi âm & transcript', status: 'soon', color: '#94a3b8' },
                  { icon: '🔜', label: 'Tự động tạo task', status: 'soon', color: '#94a3b8' },
                  { icon: '🔜', label: 'Google Meet / Zoom', status: 'soon', color: '#94a3b8' },
                  { icon: '🔜', label: 'Gửi biên bản email', status: 'soon', color: '#94a3b8' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2.5">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-sm text-gray-700 flex-1">{f.label}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: f.status === 'live' ? '#dcfce7' : '#f1f5f9',
                        color: f.status === 'live' ? '#166534' : '#94a3b8',
                      }}
                    >
                      {f.status === 'live' ? '✓ Live' : 'Soon'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow link */}
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-purple-800 mb-1">💡 Tạo cuộc họp có workflow</p>
              <p className="text-xs text-purple-600 mb-3">
                Tạo workflow với entityType=meeting để theo dõi quá trình phê duyệt
              </p>
              <Link
                href="/admin/workflow"
                className="text-xs font-bold text-purple-700 hover:text-purple-900 transition"
              >
                Tới Workflow Engine →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
