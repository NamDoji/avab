import Link from 'next/link'
import { Suspense } from 'react'

export const metadata = { title: 'Đăng ký thành công — AvaB' }

interface Props {
  searchParams: Promise<{
    courseId?: string
    status?: string
    courseName?: string
    hasPayment?: string
  }>
}

async function SuccessContent({ searchParams }: Props) {
  const params = await searchParams
  const courseName = params.courseName ? decodeURIComponent(params.courseName) : 'Khóa học'
  const status = params.status ?? 'PENDING'
  const hasPayment = params.hasPayment === '1'
  const isPending = status === 'PENDING'

  return (
    <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-6">
        {/* ── Success card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Banner */}
          <div
            className="relative py-10 text-white text-center"
            style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="relative">
              <div className="text-6xl mb-3">✅</div>
              <h1 className="text-2xl font-black mb-1">Đăng ký thành công!</h1>
              <p className="text-emerald-100 text-sm">{courseName}</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Status badge */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${isPending ? 'bg-amber-100' : 'bg-green-100'}`}>
                {isPending ? '⏳' : '✅'}
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">Trạng thái đăng ký</p>
                <p className={`text-sm font-bold mt-0.5 ${isPending ? 'text-amber-600' : 'text-green-600'}`}>
                  {isPending ? 'Chờ duyệt — Trung tâm sẽ liên hệ bạn sớm' : 'Đã được duyệt — Có thể học ngay'}
                </p>
              </div>
            </div>

            {/* Payment instructions */}
            {hasPayment && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="font-black text-amber-800 text-sm mb-3">💰 Hướng dẫn đóng học phí</p>
                <div className="space-y-2 text-sm text-amber-700">
                  <div className="flex items-start gap-2">
                    <span className="font-black text-amber-800 flex-shrink-0">1.</span>
                    <span>Chuyển khoản ngân hàng hoặc đóng tiền mặt tại văn phòng trung tâm</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-black text-amber-800 flex-shrink-0">2.</span>
                    <span>Nội dung chuyển khoản: <span className="font-black">Tên học sinh + Tên khóa học</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-black text-amber-800 flex-shrink-0">3.</span>
                    <span>Sau khi xác nhận học phí, tài khoản sẽ được kích hoạt học đầy đủ</span>
                  </div>
                </div>
              </div>
            )}

            {/* Next steps */}
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">📌 Bước tiếp theo</p>
              <div className="space-y-2">
                {[
                  { icon: '📱', text: 'Nhân viên trung tâm sẽ liên hệ để xác nhận đăng ký' },
                  { icon: '📅', text: 'Sắp xếp lịch học phù hợp với bạn' },
                  { icon: '📚', text: 'Tài liệu học tập sẽ được cung cấp trước buổi học đầu tiên' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/hoc-vien"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm text-center hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm"
              >
                🎓 Vào trang học viên
              </Link>
              <Link
                href="/khoa-hoc"
                className="w-full py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm text-center hover:bg-gray-50 transition-colors"
              >
                Xem thêm khóa học
              </Link>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-gray-500 text-sm">
            Cần hỗ trợ? Liên hệ{' '}
            <a href="tel:0123456789" className="font-black text-emerald-600 hover:underline">
              0123 456 789
            </a>{' '}
            hoặc{' '}
            <a href="mailto:support@avab.vn" className="font-black text-emerald-600 hover:underline">
              support@avab.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function EnrollSuccessPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-3">⏳</div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    }>
      <SuccessContent {...props} />
    </Suspense>
  )
}
