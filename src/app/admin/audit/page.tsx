import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Audit Log — AvaB Admin' }

// Action icon & color mapping
function getActionStyle(action: string): { icon: string; dotClass: string; textClass: string } {
  const a = action.toLowerCase()
  if (a === 'created' || a === 'create') return { icon: '🟢', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700' }
  if (a === 'updated' || a === 'update' || a === 'edit') return { icon: '🔵', dotClass: 'bg-blue-500', textClass: 'text-blue-700' }
  if (a === 'deleted' || a === 'delete') return { icon: '🔴', dotClass: 'bg-red-500', textClass: 'text-red-700' }
  if (a === 'approved' || a === 'approve') return { icon: '✅', dotClass: 'bg-teal-500', textClass: 'text-teal-700' }
  if (a === 'rejected' || a === 'reject') return { icon: '❌', dotClass: 'bg-rose-500', textClass: 'text-rose-700' }
  if (a === 'published' || a === 'publish') return { icon: '📢', dotClass: 'bg-violet-500', textClass: 'text-violet-700' }
  if (a === 'login') return { icon: '🔐', dotClass: 'bg-indigo-500', textClass: 'text-indigo-700' }
  return { icon: '📝', dotClass: 'bg-gray-400', textClass: 'text-gray-600' }
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s trước`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}p trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export default async function AuditLogPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/dang-nhap')
  }

  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, phone: true } },
    },
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white py-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <Link href="/admin" className="text-slate-400 text-sm hover:text-white transition-colors mb-4 inline-block">
            ← Admin Dashboard
          </Link>
          <h1 className="text-3xl font-black mb-1">📋 Audit Log</h1>
          <p className="text-slate-400 text-sm">{logs.length} bản ghi gần nhất · Lịch sử thay đổi hệ thống</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          {logs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p>Chưa có audit log nào</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 pointer-events-none" />

              <div className="space-y-0">
                {logs.map((log, idx) => {
                  const style = getActionStyle(log.action)
                  const userName = log.user?.name ?? 'System'
                  const userPhone = log.user?.phone

                  return (
                    <div key={log.id} className="relative flex gap-4 pb-1">
                      {/* Dot */}
                      <div className={`relative z-10 mt-3 w-3 h-3 rounded-full border-2 border-white shadow-sm shrink-0 ml-3.5 ${style.dotClass}`} />

                      {/* Card */}
                      <div className={`flex-1 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-2 hover:shadow-md transition-all ${idx === 0 ? 'ring-1 ring-violet-100' : ''}`}>
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base leading-none">{style.icon}</span>
                            <span className="font-bold text-gray-900 text-sm">{userName}</span>
                            {userPhone && (
                              <span className="text-gray-400 text-xs font-mono">({userPhone})</span>
                            )}
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 ${style.textClass}`}>
                              {log.action}
                            </span>
                            <span className="text-gray-600 text-xs font-semibold">{log.entityType}</span>
                            {log.entityId && (
                              <span className="text-gray-400 text-xs font-mono">#{log.entityId.slice(-8)}</span>
                            )}
                          </div>
                          <span className="text-gray-400 text-xs shrink-0 whitespace-nowrap">
                            {relativeTime(new Date(log.createdAt))}
                          </span>
                        </div>

                        {log.summary && (
                          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{log.summary}</p>
                        )}

                        {log.ipAddress && (
                          <p className="text-gray-300 text-xs mt-1 font-mono">{log.ipAddress}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
