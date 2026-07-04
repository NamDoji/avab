'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  courseId: string
  courseName: string
  coursePrice: number | null
  userName: string | null
  userPhone: string
}

export default function EnrollForm({ courseId, courseName, coursePrice, userName, userPhone }: Props) {
  const router = useRouter()
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentName: parentName || null, parentPhone: parentPhone || null, note: note || null }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Đăng ký thất bại. Vui lòng thử lại.')
        return
      }

      // Redirect to success page
      router.push(
        `/hoc-vien/dang-ky-thanh-cong?courseId=${courseId}&status=${data.status}&courseName=${encodeURIComponent(courseName)}&hasPayment=${coursePrice && coursePrice > 0 ? '1' : '0'}`
      )
    } catch {
      setError('Không thể kết nối. Kiểm tra lại kết nối mạng.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Student info (prefilled, read-only) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <p className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-3">👤 Thông tin học viên</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Họ tên</label>
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium">
              {userName ?? '—'}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Số điện thoại</label>
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium">
              {userPhone}
            </div>
          </div>
        </div>
      </div>

      {/* Parent info */}
      <div>
        <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">👨‍👩‍👦 Thông tin phụ huynh (tùy chọn)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Tên phụ huynh</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">SĐT phụ huynh</label>
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="VD: 0901234567"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-xs font-bold text-gray-600 mb-1 block">📝 Ghi chú thêm</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Thời gian học mong muốn, mục tiêu học tập, yêu cầu đặc biệt..."
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
        />
      </div>

      {/* Fee info */}
      {coursePrice !== null && coursePrice > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-black text-amber-700 mb-1">💰 Học phí khóa học</p>
          <p className="font-black text-amber-900 text-lg">{coursePrice.toLocaleString('vi-VN')} đ</p>
          <p className="text-xs text-amber-700 mt-1">Hướng dẫn thanh toán sẽ được cung cấp sau khi đăng ký</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-base shadow-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all"
      >
        {loading ? '⏳ Đang xử lý...' : '✅ Xác nhận đăng ký'}
      </button>
    </form>
  )
}
