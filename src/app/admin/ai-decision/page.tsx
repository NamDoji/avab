import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'AI Decision Center — AvaB' }

export default async function AIDecisionPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const now = Date.now()

  const [overduePayments, inactiveStudents, lowAttendance, aiProjectsDraft] =
    await Promise.all([
      // HP chưa thu > 30 ngày
      prisma.tuitionPayment.count({
        where: {
          isPaid: false,
          isFree: false,
          createdAt: { lt: new Date(now - 30 * 86400000) },
        },
      }),
      // HS không làm bài > 14 ngày
      prisma.user.count({
        where: {
          role: 'STUDENT',
          answers: {
            none: {
              createdAt: { gte: new Date(now - 14 * 86400000) },
            },
          },
        },
      }),
      // HS điểm danh vắng tháng này
      prisma.studentSessionRecord.count({
        where: {
          attendance: false,
          createdAt: { gte: new Date(now - 30 * 86400000) },
        },
      }),
      // AI Projects stuck > 7 ngày
      prisma.aIProject.count({
        where: {
          status: 'draft',
          updatedAt: { lt: new Date(now - 7 * 86400000) },
        },
      }),
    ])

  const alerts = [
    {
      emoji: '🔴',
      count: overduePayments,
      label: 'học phí quá hạn > 30 ngày',
      href: '/admin/finance',
      severity: overduePayments > 0 ? 'high' : 'none',
      bg: overduePayments > 10
        ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
        : overduePayments > 0
        ? 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    },
    {
      emoji: '🟡',
      count: inactiveStudents,
      label: 'học sinh không học > 14 ngày',
      href: '/admin/erp/students',
      severity: inactiveStudents > 0 ? 'medium' : 'none',
      bg: inactiveStudents > 5
        ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
        : inactiveStudents > 0
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    },
    {
      emoji: '🟠',
      count: lowAttendance,
      label: 'lần vắng mặt tháng này',
      href: '/admin/erp/attendance',
      severity: lowAttendance > 0 ? 'medium' : 'none',
      bg: lowAttendance > 10
        ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
        : lowAttendance > 0
        ? 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)'
        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    },
    {
      emoji: '🔵',
      count: aiProjectsDraft,
      label: 'AI Projects bị stuck > 7 ngày',
      href: '/admin/ai-studio',
      severity: aiProjectsDraft > 0 ? 'low' : 'none',
      bg: aiProjectsDraft > 0
        ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    },
  ]

  // AI Recommendations
  const recommendations: { icon: string; text: string }[] = []
  if (overduePayments > 10) {
    recommendations.push({
      icon: '💳',
      text: 'Gợi ý: Gửi thông báo nhắc học phí hàng loạt cho các phụ huynh có công nợ quá hạn.',
    })
  }
  if (overduePayments > 0 && overduePayments <= 10) {
    recommendations.push({
      icon: '📱',
      text: 'Gợi ý: Liên hệ trực tiếp với phụ huynh có học phí chưa đóng.',
    })
  }
  if (inactiveStudents > 5) {
    recommendations.push({
      icon: '👨‍👩‍👧',
      text: 'Gợi ý: Kiểm tra và liên hệ phụ huynh của học sinh không hoạt động > 14 ngày.',
    })
  }
  if (inactiveStudents > 0 && inactiveStudents <= 5) {
    recommendations.push({
      icon: '📞',
      text: 'Gợi ý: Giáo viên liên hệ hỏi thăm những học sinh vắng bài.',
    })
  }
  if (lowAttendance > 10) {
    recommendations.push({
      icon: '📋',
      text: 'Gợi ý: Rà soát lại lịch học và thông báo điểm danh cho phụ huynh.',
    })
  }
  if (aiProjectsDraft > 0) {
    recommendations.push({
      icon: '🤖',
      text: `Gợi ý: ${aiProjectsDraft} AI Projects chưa được publish — vào AI Studio để hoàn thiện.`,
    })
  }
  if (recommendations.length === 0) {
    recommendations.push({
      icon: '✅',
      text: 'Hệ thống đang hoạt động tốt. Không có cảnh báo nghiêm trọng.',
    })
  }

  const totalAlerts = overduePayments + inactiveStudents + lowAttendance + aiProjectsDraft

  return (
    <main className="min-h-screen bg-gray-950 pt-20">
      {/* Header */}
      <div
        className="px-6 py-10"
        style={{ background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🧠</span>
                <div>
                  <h1 className="text-3xl font-black text-white">AI Decision Center</h1>
                  <p className="text-stone-400 text-sm mt-0.5">
                    Phân tích thông minh · Cảnh báo · Dự báo
                  </p>
                </div>
              </div>
              {totalAlerts > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-red-500 text-white">
                    🚨 {totalAlerts} cảnh báo cần xử lý
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500">Cập nhật</p>
              <p className="text-sm font-bold text-stone-300">
                {new Date().toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Alert Cards */}
        <div>
          <h2 className="font-black text-white text-lg mb-4">🚨 Live Alerts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <Link
                key={alert.label}
                href={alert.href}
                className="group relative overflow-hidden rounded-2xl p-6 text-white hover:scale-[1.02] active:scale-[0.99] transition-all shadow-lg hover:shadow-xl"
                style={{ background: alert.bg }}
              >
                <div
                  className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full pointer-events-none"
                  style={{ transform: 'translate(30%, -30%)' }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{alert.emoji}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                      {alert.count > 0 ? 'CẦN XỬ LÝ' : 'ỔN ĐỊNH'}
                    </span>
                  </div>
                  <p className="text-4xl font-black">{alert.count}</p>
                  <p className="text-sm text-white/80 mt-1">{alert.label}</p>
                  <p className="text-xs font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Xem chi tiết →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800">
            <h2 className="font-black text-white text-lg">🤖 AI Recommendations</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gợi ý hành động dựa trên phân tích dữ liệu thực tế
            </p>
          </div>
          <div className="p-6 space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-xl flex-shrink-0">{rec.icon}</span>
                <p className="text-sm text-gray-300 leading-relaxed">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Section */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800">
            <h2 className="font-black text-white text-lg">📈 Dự báo (Forecast)</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Phân tích xu hướng và dự báo tương lai
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-2xl mb-2">💰</p>
                <p className="text-sm font-bold text-gray-300">Dự báo doanh thu tháng tới</p>
                <div
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold inline-block"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
                >
                  🚧 Đang phát triển
                </div>
              </div>
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-2xl mb-2">🔄</p>
                <p className="text-sm font-bold text-gray-300">Dự báo tỷ lệ tái ký học kỳ</p>
                <div
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold inline-block"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
                >
                  🚧 Đang phát triển
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4 text-center">
              Tính năng dự báo AI sẽ được phát triển sau khi tích lũy đủ dữ liệu lịch sử
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '💰', label: 'Finance', href: '/admin/finance', color: '#059669' },
            { icon: '👥', label: 'Students', href: '/admin/erp/students', color: '#7c3aed' },
            { icon: '📋', label: 'Attendance', href: '/admin/erp/attendance', color: '#f97316' },
            { icon: '🤖', label: 'AI Studio', href: '/admin/ai-studio', color: '#0284c7' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl text-white font-bold text-sm transition hover:opacity-90"
              style={{ background: action.color }}
            >
              <span className="text-2xl">{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
