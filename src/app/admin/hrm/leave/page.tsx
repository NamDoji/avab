import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Nghỉ phép — HRM — AvaB Admin' }

export default async function HRMLeafPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #4a044e 0%, #7e22ce 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-purple-200 text-sm font-semibold mb-3">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>›</span>
            <Link href="/admin/hrm" className="hover:text-white transition-colors">HRM</Link>
            <span>›</span>
            <span className="text-white">Nghỉ phép</span>
          </div>
          <h1 className="text-3xl font-black mb-1">🌴 Nghỉ phép</h1>
          <p className="text-purple-100 text-sm">Quản lý đơn xin nghỉ, phê duyệt và theo dõi ngày phép</p>
        </div>
      </div>

      <div className="container-custom py-16 flex flex-col items-center text-center">
        <div className="text-8xl mb-6">🌴</div>
        <h2 className="text-3xl font-black text-gray-800 mb-3">Đang phát triển</h2>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          Phân hệ Nghỉ phép cho phép nhân viên gửi đơn xin nghỉ, quản lý phê duyệt theo cấp bậc và tự động tính số ngày phép còn lại.
        </p>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-left max-w-md w-full mb-8">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">📌 Lộ trình phát triển</p>
          <div className="space-y-3">
            {[
              { label: 'Gửi đơn xin nghỉ online', eta: 'Q3/2025', done: false },
              { label: 'Workflow phê duyệt đa cấp', eta: 'Q3/2025', done: false },
              { label: 'Tính toán số ngày phép tự động', eta: 'Q4/2025', done: false },
              { label: 'Lịch nghỉ phép toàn trường', eta: 'Q4/2025', done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${item.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">{item.eta}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/workflow"
            className="inline-flex items-center gap-2 bg-white text-gray-700 rounded-2xl px-5 py-3 text-sm font-bold border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            🔄 Workflow hiện tại
          </Link>
          <Link
            href="/admin/hrm"
            className="inline-flex items-center gap-2 bg-purple-600 text-white rounded-2xl px-6 py-3 text-sm font-bold hover:bg-purple-700 transition-colors"
          >
            ← Quay lại HRM
          </Link>
        </div>
      </div>
    </div>
  )
}
