import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Meeting — Collaboration — AvaB Admin' }

export default async function CollabMeetingsPage() {
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
            <span className="text-white">Meeting</span>
          </div>
          <h1 className="text-3xl font-black mb-1">🎥 Meeting Center</h1>
          <p className="text-teal-100 text-sm">Cuộc họp, biên bản tự động bằng AI</p>
        </div>
      </div>

      <div className="container-custom py-16 flex flex-col items-center text-center">
        <div className="text-8xl mb-6">🎥</div>
        <h2 className="text-3xl font-black text-gray-800 mb-3">Đang phát triển</h2>
        <p className="text-gray-500 text-sm max-w-lg mb-6">
          Meeting Center tích hợp AI để tự động ghi lại biên bản họp, phát hiện điểm hành động (action items) và phân phối task ngay sau cuộc họp.
        </p>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-6 max-w-md w-full mb-8">
          <p className="text-sm font-black text-teal-800 mb-4">🤖 AI Meeting Features (Roadmap)</p>
          <div className="space-y-3 text-left">
            {[
              { icon: '🎙️', label: 'Ghi âm & transcript tự động', desc: 'Whisper AI xử lý tiếng Việt' },
              { icon: '📋', label: 'Biên bản họp AI', desc: 'Tóm tắt, điểm chính, action items' },
              { icon: '✅', label: 'Tự động tạo task', desc: 'Action items → Task trong Collaboration' },
              { icon: '📧', label: 'Gửi biên bản qua email', desc: 'Tự động gửi sau khi họp kết thúc' },
              { icon: '🔗', label: 'Tích hợp Google Meet / Zoom', desc: 'Kết nối nền tảng họp trực tuyến' },
            ].map((feat) => (
              <div key={feat.label} className="flex items-start gap-3 bg-white rounded-xl p-3">
                <span className="text-xl flex-shrink-0">{feat.icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{feat.label}</p>
                  <p className="text-xs text-gray-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">Dự kiến: Q1/2026</p>

        <Link
          href="/admin/collab"
          className="inline-flex items-center gap-2 bg-teal-600 text-white rounded-2xl px-6 py-3 text-sm font-bold hover:bg-teal-700 transition-colors"
        >
          ← Quay lại Collaboration
        </Link>
      </div>
    </div>
  )
}
