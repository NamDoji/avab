'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface InstalledApp {
  id: string
  icon: string
  name: string
  desc: string
  category: string
  docsUrl?: string
  manageHref?: string
}

interface MarketplaceApp {
  icon: string
  name: string
  desc: string
  category: string
  popular?: boolean
}

type Tab = 'installed' | 'marketplace'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const INSTALLED_APPS: InstalledApp[] = [
  {
    id: 'zalo-oa',
    icon: '💬',
    name: 'Zalo OA',
    desc: 'Gửi thông báo, tự động hoá qua Zalo Official Account',
    category: 'Communication',
  },
  {
    id: 'google-meet',
    icon: '🟢',
    name: 'Google Meet',
    desc: 'Họp và dạy học qua Google Meet, tích hợp lịch AvaB',
    category: 'Video',
  },
  {
    id: 'google-drive',
    icon: '📁',
    name: 'Google Drive',
    desc: 'Lưu trữ và chia sẻ tài liệu học tập qua Google Drive',
    category: 'Storage',
  },
  {
    id: 'notion',
    icon: '⬛',
    name: 'Notion',
    desc: 'Wiki kiến thức, ghi chú lớp học và quản lý dự án nội bộ',
    category: 'Productivity',
  },
  {
    id: 'slack',
    icon: '🟣',
    name: 'Slack',
    desc: 'Chat nhóm, kênh theo môn học và thông báo tự động',
    category: 'Communication',
  },
  {
    id: 'api-platform',
    icon: '🔑',
    name: 'API Platform',
    desc: 'Quản lý API Keys và tích hợp dữ liệu học sinh, khoá học, điểm số.',
    category: 'Developer',
    manageHref: '/admin/app-center/api',
  },
  {
    id: 'webhooks',
    icon: '🔗',
    name: 'Webhooks',
    desc: 'Nhận thông báo sự kiện thời gian thực: đăng ký, thanh toán, điểm danh.',
    category: 'Developer',
    manageHref: '/admin/app-center/webhooks',
  },
]

const MARKETPLACE_APPS: MarketplaceApp[] = [
  { icon: '📧', name: 'Gmail',            desc: 'Email tự động cho phụ huynh học sinh',    category: 'Communication', popular: true },
  { icon: '📱', name: 'SMS OTP',          desc: 'Nhắn tin SMS nhắc lịch học và OTP',        category: 'Communication' },
  { icon: '🟦', name: 'Microsoft Teams',  desc: 'Họp và cộng tác Microsoft 365',            category: 'Video',         popular: true },
  { icon: '🎥', name: 'Zoom',             desc: 'Lớp học trực tuyến Zoom Meetings',         category: 'Video' },
  { icon: '🌐', name: 'Whereby',          desc: 'Phòng học ảo nhúng trực tiếp vào AvaB',   category: 'Video' },
  { icon: '📅', name: 'Google Calendar',  desc: 'Đồng bộ lịch học, thi và sự kiện',        category: 'Calendar',      popular: true },
  { icon: '📆', name: 'Outlook Calendar', desc: 'Lịch dạy và họp Microsoft Outlook',       category: 'Calendar' },
  { icon: '🏦', name: 'VNPay',            desc: 'Thanh toán học phí qua VNPay QR',          category: 'Payment',       popular: true },
  { icon: '💜', name: 'MoMo',             desc: 'Thanh toán và thông báo qua ví MoMo',     category: 'Payment' },
  { icon: '💙', name: 'ZaloPay',          desc: 'Thanh toán tức thì qua ZaloPay',           category: 'Payment' },
  { icon: '🏫', name: 'Google Classroom', desc: 'Đồng bộ lớp học và điểm từ Classroom',   category: 'LMS' },
  { icon: '📘', name: 'Moodle',           desc: 'Kết nối hệ thống LMS Moodle hiện có',     category: 'LMS' },
  { icon: '⬛', name: 'Blackboard',       desc: 'Tích hợp Blackboard Learn',               category: 'LMS' },
  { icon: '🟥', name: 'Canvas LMS',       desc: 'Nhập/xuất khoá học từ Canvas LMS',        category: 'LMS' },
]

const STORAGE_KEY = 'avab_app_center_enabled'

function loadEnabled(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>
  } catch {
    return {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle switch
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Category badge
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Communication: '#6366f1',
  Video:         '#06b6d4',
  Calendar:      '#8b5cf6',
  Payment:       '#22c55e',
  LMS:           '#f59e0b',
  Storage:       '#3b82f6',
  Productivity:  '#ec4899',
  Developer:     '#6b7280',
}

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? '#6b7280'
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: color + '18', color }}
    >
      {category}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Installed
// ─────────────────────────────────────────────────────────────────────────────

function TabInstalled() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const defaults: Record<string, boolean> = {}
    INSTALLED_APPS.forEach((a) => { defaults[a.id] = true })
    const saved = loadEnabled()
    setEnabled({ ...defaults, ...saved })
  }, [])

  const toggle = (id: string) => {
    setEnabled((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const activeCount = Object.values(enabled).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-800">{activeCount}</span> / {INSTALLED_APPS.length} ứng dụng đang bật
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INSTALLED_APPS.map((app) => {
          const isOn = enabled[app.id] ?? true
          return (
            <div
              key={app.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all ${
                isOn
                  ? 'border-gray-100 hover:shadow-md hover:border-indigo-100'
                  : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border transition-colors ${
                    isOn ? 'bg-gray-50 border-gray-100' : 'bg-gray-100 border-gray-200'
                  }`}
                >
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-800 text-sm leading-tight">{app.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{app.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-1">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={app.category} />
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      isOn ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isOn ? '● Đang hoạt động' : '○ Tắt'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {app.manageHref && isOn && (
                    <Link
                      href={app.manageHref}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                    >
                      Quản lý
                    </Link>
                  )}
                  <Toggle checked={isOn} onChange={() => toggle(app.id)} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Marketplace
// ─────────────────────────────────────────────────────────────────────────────

function TabMarketplace() {
  const [filterCat, setFilterCat] = useState('all')
  const [installed, setInstalled] = useState<Set<string>>(new Set())

  const categories = ['all', ...Array.from(new Set(MARKETPLACE_APPS.map((a) => a.category)))]

  const filtered = filterCat === 'all'
    ? MARKETPLACE_APPS
    : MARKETPLACE_APPS.filter((a) => a.category === filterCat)

  const handleInstall = (name: string) => {
    setInstalled((prev) => new Set([...prev, name]))
    setTimeout(() => {
      // demo: after 1.5s, show as done
    }, 1500)
  }

  return (
    <div className="space-y-5">
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
              filterCat === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            {cat === 'all' ? '📦 Tất cả' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((app) => {
          const isInstalled = installed.has(app.name)
          return (
            <div
              key={app.name}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-indigo-100 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-gray-800 text-sm leading-tight">{app.name}</h3>
                    {app.popular && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                        🔥 Phổ biến
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{app.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-1">
                <CategoryBadge category={app.category} />
                {isInstalled ? (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                    ✓ Đã cài đặt
                  </span>
                ) : (
                  <button
                    onClick={() => handleInstall(app.name)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    + Cài đặt
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl p-8 text-white text-center mt-6"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="text-4xl mb-3">🚀</div>
        <h3 className="text-xl font-black mb-2">Đề xuất tích hợp mới?</h3>
        <p className="text-slate-400 text-sm mb-5">
          Hãy cho chúng tôi biết bạn cần tích hợp gì để chúng tôi ưu tiên phát triển.
        </p>
        <a
          href="mailto:support@avab.io?subject=Đề xuất tích hợp App Center"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
        >
          📩 Gửi đề xuất
        </a>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AppCenterPage() {
  const [tab, setTab] = useState<Tab>('installed')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-slate-400 text-sm font-semibold mb-1">🧭 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-2">🔌 App Center</h1>
          <p className="text-slate-400 text-sm">Tích hợp và mở rộng AvaB</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-30 shadow-sm">
        <div className="container-custom flex gap-1 py-1">
          {(
            [
              { id: 'installed',   label: '⚙️ Ứng dụng cài đặt', desc: `${INSTALLED_APPS.length} apps` },
              { id: 'marketplace', label: '🛒 Marketplace',        desc: `${MARKETPLACE_APPS.length} apps` },
            ] as { id: Tab; label: string; desc: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  tab === t.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {tab === 'installed' ? <TabInstalled /> : <TabMarketplace />}
      </div>
    </div>
  )
}
