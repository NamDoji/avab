'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export type NotifType = 'enrollment' | 'contact' | 'finance'

export interface NotifItem {
  id: string
  type: NotifType
  icon: string
  message: string
  link: string
  timeMs: number          // epoch ms for client-side relative time
  badge: string
  badgeColor: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const LOCALSTORAGE_KEY = 'avab_read_notifs_v1'

function getReadSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveReadSet(set: Set<string>) {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([...set]))
  } catch { /* ignore */ }
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return new Date(ms).toLocaleDateString('vi-VN')
}

// ─── Filter config ────────────────────────────────────────────────────────────
type FilterKey = 'all' | NotifType

const FILTER_CONFIG: Record<FilterKey, { label: string; icon: string }> = {
  all:        { label: 'Tất cả',   icon: '🔔' },
  enrollment: { label: 'Đăng ký',  icon: '🎓' },
  contact:    { label: 'Liên hệ',  icon: '📞' },
  finance:    { label: 'Học phí',  icon: '💰' },
}

// ─── Component ───────────────────────────────────────────────────────────────
interface NotificationListProps {
  notifications: NotifItem[]
  overdueCount: number
}

export default function NotificationList({ notifications, overdueCount }: NotificationListProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  // Hydrate from localStorage after mount
  useEffect(() => {
    setReadIds(getReadSet())
  }, [])

  function markRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      saveReadSet(next)
      return next
    })
  }

  function markAllRead() {
    const ids = new Set(notifications.map((n) => n.id))
    saveReadSet(ids)
    setReadIds(ids)
  }

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => setRefreshing(false), 1200)
  }, [router])

  // Filtered list
  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter)

  const unreadFiltered = filtered.filter((n) => !readIds.has(n.id)).length

  // Filter counts
  const counts: Record<FilterKey, number> = {
    all: notifications.filter((n) => !readIds.has(n.id)).length,
    enrollment: notifications.filter((n) => n.type === 'enrollment' && !readIds.has(n.id)).length,
    contact: notifications.filter((n) => n.type === 'contact' && !readIds.has(n.id)).length,
    finance: overdueCount,
  }

  return (
    <div className="space-y-5">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(FILTER_CONFIG) as FilterKey[]).map((key) => {
            const conf = FILTER_CONFIG[key]
            const count = counts[key]
            const active = filter === key
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600',
                ].join(' ')}
              >
                {conf.icon} {conf.label}
                {count > 0 && (
                  <span
                    className={[
                      'text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center',
                      active ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white',
                    ].join(' ')}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition disabled:opacity-50"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            {refreshing ? 'Đang tải...' : 'Refresh'}
          </button>
          {counts.all > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              ✓ Đọc tất cả
            </button>
          )}
        </div>
      </div>

      {/* ── Overdue alert (finance) ── */}
      {overdueCount > 0 && (filter === 'all' || filter === 'finance') && (
        <Link
          href="/admin/finance"
          className="flex items-center gap-4 p-4 rounded-2xl text-white hover:opacity-90 transition shadow-md"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
        >
          <span className="text-3xl flex-shrink-0">💰</span>
          <div className="flex-1">
            <p className="font-bold">{overdueCount} học phí quá hạn chưa thu (&gt; 30 ngày)</p>
            <p className="text-sm text-red-200 mt-0.5">Xem Finance Dashboard để xử lý</p>
          </div>
          <span className="text-white/70">→</span>
        </Link>
      )}

      {/* ── Notification list ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-gray-900 text-lg">
              {FILTER_CONFIG[filter].icon} {FILTER_CONFIG[filter].label}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {filtered.length} thông báo{unreadFiltered > 0 ? ` · ${unreadFiltered} chưa đọc` : ' · Tất cả đã đọc'}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-bold text-gray-700">Không có thông báo</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'all' ? 'Tất cả đã được xử lý!' : `Không có thông báo loại "${FILTER_CONFIG[filter].label}"`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((notif, idx) => {
              const isRead = readIds.has(notif.id)
              return (
                <div
                  key={notif.id}
                  className={[
                    'flex items-center gap-4 px-6 py-4 transition',
                    isRead ? 'opacity-60 bg-gray-50/40' : 'hover:bg-gray-50/50',
                  ].join(' ')}
                >
                  {/* Icon + timeline */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ background: isRead ? '#f1f5f9' : 'rgba(79,70,229,0.08)' }}
                    >
                      {notif.icon}
                    </div>
                    {!isRead && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white"
                      />
                    )}
                    {idx < filtered.length - 1 && (
                      <div className="absolute left-1/2 top-10 w-0.5 h-4 -translate-x-1/2 bg-gray-100" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isRead ? 'text-gray-500' : 'font-semibold text-gray-800'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: notif.badgeColor }}
                      >
                        {notif.badge}
                      </span>
                      <span className="text-xs text-gray-400">{relativeTime(notif.timeMs)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isRead && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Đánh dấu đã đọc"
                      >
                        ✓
                      </button>
                    )}
                    <Link
                      href={notif.link}
                      onClick={() => markRead(notif.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      Xem
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
