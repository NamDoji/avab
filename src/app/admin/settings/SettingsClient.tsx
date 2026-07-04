'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'org' | 'security' | 'notifications' | 'system'

// ─────────────────────────────────────────────────────────────────────────────
// Toggle component
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  desc?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Tổ chức
// ─────────────────────────────────────────────────────────────────────────────

function TabOrg() {
  const [orgName, setOrgName] = useState('AvaB Demo School')
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh')
  const [currency, setCurrency] = useState('VND')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-black text-gray-800">Thông tin tổ chức</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Org name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Tên tổ chức
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Nhập tên tổ chức..."
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Logo (URL)
            </label>
            <input
              type="url"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="https://..."
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Múi giờ
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option value="Asia/Ho_Chi_Minh">GMT+7 — Hà Nội / TP.HCM</option>
              <option value="Asia/Bangkok">GMT+7 — Bangkok</option>
              <option value="Asia/Singapore">GMT+8 — Singapore</option>
              <option value="America/New_York">GMT-5 — New York</option>
              <option value="Europe/London">GMT+0 — London</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Tiền tệ
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option value="VND">VND — Đồng Việt Nam</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="SGD">SGD — Singapore Dollar</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {saved ? '✅ Đã lưu!' : '💾 Lưu thay đổi'}
          </button>
          <Link
            href="/admin/organizations"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            🏢 Quản lý tổ chức →
          </Link>
        </div>
      </div>

      {/* Quick link */}
      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
        <p className="text-sm font-semibold text-indigo-700 mb-1">💡 Cài đặt nâng cao</p>
        <p className="text-xs text-indigo-500 mb-3">
          Cấu hình chi tiết tổ chức: cơ sở, branding, domain, và nhiều hơn nữa.
        </p>
        <Link
          href="/admin/organizations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
        >
          Đến trang Organizations →
        </Link>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Bảo mật
// ─────────────────────────────────────────────────────────────────────────────

function TabSecurity() {
  const [enforce2FA, setEnforce2FA] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('480')
  const [minLength, setMinLength] = useState('8')
  const [requireSpecial, setRequireSpecial] = useState(true)
  const [requireNumbers, setRequireNumbers] = useState(true)

  return (
    <div className="space-y-6">
      {/* Password Policy */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">🔐 Chính sách mật khẩu</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Độ dài tối thiểu
            </label>
            <input
              type="number"
              value={minLength}
              onChange={(e) => setMinLength(e.target.value)}
              min={6}
              max={32}
              className="w-32 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <span className="ml-2 text-xs text-gray-400">ký tự</span>
          </div>
          <Toggle
            checked={requireSpecial}
            onChange={setRequireSpecial}
            label="Yêu cầu ký tự đặc biệt"
            desc="Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$...)"
          />
          <Toggle
            checked={requireNumbers}
            onChange={setRequireNumbers}
            label="Yêu cầu chữ số"
            desc="Mật khẩu phải chứa ít nhất một chữ số (0-9)"
          />
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">🛡️ Xác thực hai yếu tố (2FA)</h3>
        <Toggle
          checked={enforce2FA}
          onChange={setEnforce2FA}
          label="Bắt buộc 2FA cho tất cả admin"
          desc="Tất cả tài khoản ADMIN phải bật xác thực hai yếu tố"
        />
        {enforce2FA && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
            ⚠️ Cài đặt này sẽ áp dụng khi tính năng 2FA được triển khai.
          </div>
        )}
      </div>

      {/* Session */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">⏱️ Phiên đăng nhập</h3>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Tự động đăng xuất sau
          </label>
          <select
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            className="w-48 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
          >
            <option value="60">1 giờ</option>
            <option value="240">4 giờ</option>
            <option value="480">8 giờ (mặc định)</option>
            <option value="1440">24 giờ</option>
            <option value="0">Không bao giờ</option>
          </select>
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-2">🌐 IP Whitelist</h3>
        <p className="text-xs text-gray-400 mb-4">Chỉ cho phép đăng nhập từ các địa chỉ IP được liệt kê.</p>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
          rows={4}
          placeholder={'192.168.1.0/24\n203.113.xx.xx\n# Mỗi IP / CIDR trên một dòng'}
        />
        <p className="text-xs text-gray-400 mt-2">
          🔜 Tính năng này sẽ có hiệu lực sau khi được triển khai.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Thông báo
// ─────────────────────────────────────────────────────────────────────────────

function TabNotifications() {
  const [emailOn, setEmailOn] = useState(true)
  const [smsOn, setSmsOn] = useState(false)
  const [inAppOn, setInAppOn] = useState(true)

  const [enrollment, setEnrollment] = useState(true)
  const [payment, setPayment] = useState(true)
  const [attendance, setAttendance] = useState(false)
  const [aiJobs, setAiJobs] = useState(false)

  return (
    <div className="space-y-6">
      {/* Channels */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">📣 Kênh thông báo</h3>
        <Toggle checked={emailOn} onChange={setEmailOn} label="Email" desc="Gửi thông báo qua địa chỉ email đã đăng ký" />
        <Toggle checked={smsOn} onChange={setSmsOn} label="SMS" desc="Nhắn tin SMS tới số điện thoại (tốn phí)" />
        <Toggle checked={inAppOn} onChange={setInAppOn} label="In-app" desc="Thông báo hiển thị trong giao diện AvaB" />
      </div>

      {/* Notification types */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">🔔 Loại thông báo</h3>
        <Toggle
          checked={enrollment}
          onChange={setEnrollment}
          label="Đăng ký khoá học"
          desc="Thông báo khi có học sinh đăng ký hoặc được phê duyệt"
        />
        <Toggle
          checked={payment}
          onChange={setPayment}
          label="Thanh toán học phí"
          desc="Thông báo khi nhận được thanh toán hoặc đến hạn nộp"
        />
        <Toggle
          checked={attendance}
          onChange={setAttendance}
          label="Điểm danh"
          desc="Cảnh báo khi học sinh vắng mặt nhiều lần liên tiếp"
        />
        <Toggle
          checked={aiJobs}
          onChange={setAiJobs}
          label="AI Jobs"
          desc="Thông báo khi các tác vụ AI hoàn thành (tạo khóa học, phân tích...)"
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Hệ thống
// ─────────────────────────────────────────────────────────────────────────────

function TabSystem() {
  const [lang, setLang] = useState('vi')
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [dangerConfirm, setDangerConfirm] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('avab-theme') as 'light' | 'dark' | 'auto' | null
      if (saved) setTheme(saved)
    } catch {}
  }, [])

  const handleThemeChange = (t: 'light' | 'dark' | 'auto') => {
    setTheme(t)
    try {
      localStorage.setItem('avab-theme', t)
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Language */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">🌐 Ngôn ngữ</h3>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-56 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
        >
          <option value="vi">🇻🇳 Tiếng Việt</option>
          <option value="en">🇺🇸 English</option>
        </select>
      </div>

      {/* Theme */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-4">🎨 Giao diện (Theme)</h3>
        <div className="flex gap-3 flex-wrap">
          {(['light', 'dark', 'auto'] as const).map((t) => {
            const labels = { light: '☀️ Sáng', dark: '🌙 Tối', auto: '🔄 Tự động' }
            return (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  theme === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {labels[t]}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Cài đặt được lưu trên trình duyệt của bạn (localStorage).
        </p>
      </div>

      {/* Data export */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-2">📤 Xuất dữ liệu</h3>
        <p className="text-sm text-gray-500 mb-4">
          Xuất toàn bộ dữ liệu tổ chức ra file ZIP (học sinh, giáo viên, khoá học, tài chính...).
        </p>
        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-not-allowed opacity-60"
          disabled
          title="Tính năng sắp ra mắt"
        >
          📦 Xuất toàn bộ dữ liệu
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">🔜 Sắp ra mắt</span>
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h3 className="font-black text-red-600 mb-2">⚠️ Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Xóa tổ chức sẽ xóa <strong>toàn bộ dữ liệu</strong> bao gồm học sinh, khoá học, tài chính. Hành động này
          <strong> không thể hoàn tác</strong>.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={dangerConfirm}
            onChange={(e) => setDangerConfirm(e.target.value)}
            placeholder='Gõ "XÓA TỔ CHỨC" để xác nhận'
            className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          <button
            disabled={dangerConfirm !== 'XÓA TỔ CHỨC'}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              dangerConfirm === 'XÓA TỔ CHỨC'
                ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                : 'bg-red-100 text-red-400 cursor-not-allowed'
            }`}
          >
            🗑️ Xóa tổ chức
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Client Component
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'org',           icon: '🏢', label: 'Tổ chức' },
  { id: 'security',      icon: '🔐', label: 'Bảo mật' },
  { id: 'notifications', icon: '🔔', label: 'Thông báo' },
  { id: 'system',        icon: '⚙️', label: 'Hệ thống' },
]

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('org')

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'org'           && <TabOrg />}
      {activeTab === 'security'      && <TabSecurity />}
      {activeTab === 'notifications' && <TabNotifications />}
      {activeTab === 'system'        && <TabSystem />}
    </div>
  )
}
