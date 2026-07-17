'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react'

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

interface Enrollment {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  note: string | null
  user: { id: string; name: string | null; phone: string; email: string | null }
  course: { id: string; name: string; code: string }
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('PENDING')
  const [processing, setProcessing] = useState<string | null>(null)

  const load = async (status: StatusFilter) => {
    setLoading(true)
    const q = status === 'ALL' ? '' : `?status=${status}`
    const res = await fetch(`/api/admin/enrollments${q}`)
    const data = await res.json()
    if (data.success) setEnrollments(data.data)
    setLoading(false)
  }

  useEffect(() => { load(filter) }, [filter])

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setProcessing(id)
    const res = await fetch('/api/admin/enrollments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId: id, status: action }),
    })
    const data = await res.json()
    if (data.success) {
      setEnrollments((prev) => prev.filter((e) => e.id !== id))
    }
    setProcessing(null)
  }

  const tabs: { label: string; value: StatusFilter; icon: typeof AlertCircle }[] = [
    { label: 'Chờ duyệt', value: 'PENDING', icon: AlertCircle },
    { label: 'Đã duyệt', value: 'APPROVED', icon: CheckCircle },
    { label: 'Từ chối', value: 'REJECTED', icon: XCircle },
    { label: 'Tất cả', value: 'ALL', icon: Users },
  ]

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-cherry-600" />
          Duyệt đăng ký khoá học
        </h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === value
                  ? 'bg-cherry-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Đang tải...</div>
          ) : enrollments.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không có đăng ký nào</p>
            </div>
          ) : (
            <>
          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-gray-100">
            {enrollments.map((e) => (
              <div key={e.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{e.user.name ?? 'N/A'}</p>
                    <p className="text-xs text-gray-400">{e.user.phone}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    e.status === 'APPROVED' ? 'bg-green-50 text-green-700'
                    : e.status === 'REJECTED' ? 'bg-red-50 text-red-700'
                    : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {e.status === 'APPROVED' ? 'Đã duyệt' : e.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium">{e.course.name}</p>
                <p className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleDateString('vi-VN')}</p>
                {filter === 'PENDING' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleAction(e.id, 'APPROVED')} disabled={processing === e.id}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-2 rounded-lg transition font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Duyệt
                    </button>
                    <button onClick={() => handleAction(e.id, 'REJECTED')} disabled={processing === e.id}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs px-3 py-2 rounded-lg transition font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Học viên</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Khoá học</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Ngày đăng ký</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                  {filter === 'PENDING' && (
                    <th className="text-right p-4 text-sm font-semibold text-gray-600">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{e.user.name ?? 'N/A'}</p>
                      <p className="text-xs text-gray-400">{e.user.phone}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-700">{e.course.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{e.course.code}</p>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(e.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          e.status === 'APPROVED'
                            ? 'bg-green-50 text-green-700'
                            : e.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {e.status === 'APPROVED' ? 'Đã duyệt' : e.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    </td>
                    {filter === 'PENDING' && (
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(e.id, 'APPROVED')}
                            disabled={processing === e.id}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition font-semibold"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleAction(e.id, 'REJECTED')}
                            disabled={processing === e.id}
                            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition font-semibold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Từ chối
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
