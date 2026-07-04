import { SettingsClient } from './SettingsClient'

export const metadata = { title: 'Cài đặt hệ thống — AvaB' }

// Server Component wrapper — all interactive logic lives in SettingsClient
export default function SettingsPage() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <p className="text-slate-400 text-sm font-semibold mb-1">🧭 AvaB Admin</p>
          <h1 className="text-4xl font-black mb-2">⚙️ Cài đặt hệ thống</h1>
          <p className="text-slate-400 text-sm">Quản lý cấu hình tổ chức, bảo mật và thông báo</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <SettingsClient />
      </div>
    </div>
  )
}
