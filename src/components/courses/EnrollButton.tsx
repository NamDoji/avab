'use client'

import { useState } from 'react'

interface EnrollButtonProps {
  courseId: string
  isEnrolled: boolean
  enrollmentStatus?: string | null
}

export default function EnrollButton({ courseId, isEnrolled, enrollmentStatus }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(enrollmentStatus)

  // Already approved
  if (isEnrolled) {
    return (
      <span className="btn-primary !py-2 !px-5 !text-sm whitespace-nowrap bg-green-500 border-green-500 cursor-default opacity-90">
        Đang học 🎓
      </span>
    )
  }

  // Pending approval
  if (currentStatus === 'PENDING') {
    return (
      <div className="flex flex-col items-center sm:items-end gap-1">
        <span className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 font-semibold py-2 px-5 rounded-full text-sm whitespace-nowrap cursor-default">
          Chờ duyệt ⏳
        </span>
        <p className="text-xs text-amber-700 text-center sm:text-right">
          Liên hệ Zalo{' '}
          <a href="https://zalo.me/0904290583" target="_blank" rel="noopener noreferrer" className="font-bold underline">
            0904290583
          </a>{' '}
          để được hướng dẫn
        </p>
      </div>
    )
  }

  // Success state after enrolling
  if (success) {
    return (
      <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-2xl px-4 py-2 max-w-xs text-center sm:text-right">
        ✅ Đăng ký thành công! Hãy liên hệ Zalo{' '}
        <a href="https://zalo.me/0904290583" target="_blank" rel="noopener noreferrer" className="font-bold underline">
          0904290583
        </a>{' '}
        để được hướng dẫn tiếp theo.
      </div>
    )
  }

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setCurrentStatus('PENDING')
        setSuccess(true)
      }
    } catch {
      // silently fail; user can retry
    } finally {
      setLoading(false)
    }
  }

  // Rejected or not enrolled
  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="btn-primary !py-2 !px-5 !text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Đang xử lý...' : currentStatus === 'REJECTED' ? 'Đăng ký lại' : 'Đăng ký khoá học'}
    </button>
  )
}
