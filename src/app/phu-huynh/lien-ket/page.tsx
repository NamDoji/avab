'use client'

import { useState, useEffect } from 'react'
import { Link2, Search, CheckCircle, XCircle, Trash2 } from 'lucide-react'

interface LinkedStudent {
  id: string
  name: string | null
  phone: string
  enrollments: Array<{ id: string; status: string; course: { name: string; courseType: string } }>
  linkedAt: string
}

const COURSE_TYPE_EMOJI: Record<string, string> = {
  TOAN: '📐', TIENG_ANH: '🇬🇧', LAP_TRINH_THUAT_TOAN: '🤖',
  LAP_TRINH_SCRATCH: '🐱', LAP_TRINH_PYTHON: '🐍', LAP_TRINH_CPP: '⚡',
}

export default function LienKetPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [students, setStudents] = useState<LinkedStudent[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadStudents = () => {
    setLoadingStudents(true)
    fetch('/api/parent/students')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudents(d.data) })
      .finally(() => setLoadingStudents(false))
  }

  useEffect(() => { loadStudents() }, [])

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/parent/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: 'success', text: data.message })
        setPhone('')
        loadStudents()
      } else {
        setMsg({ type: 'error', text: data.error || 'Lỗi không xác định' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' })
    }
    setLoading(false)
  }

  const handleUnlink = async (studentId: string, name: string | null) => {
    if (!confirm(`Hủy liên kết với ${name ?? 'học sinh này'}?`)) return
    setDeletingId(studentId)
    try {
      const res = await fetch('/api/parent/link', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      })
      const data = await res.json()
      if (data.success) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId))
      } else {
        alert(data.error || 'Không thể hủy liên kết')
      }
    } catch {
      alert('Lỗi kết nối')
    }
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 p-4 pt-6 lg:pt-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Link2 size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Liên kết với con</h1>
          </div>
          <p className="text-gray-500 text-sm ml-13">Nhập số điện thoại đã đăng ký của học sinh để theo dõi tiến độ học tập</p>
        </div>

        {/* Link form */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Search size={16} className="text-blue-500" />
            Tìm kiếm học sinh
          </h2>

          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Số điện thoại học sinh *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">
                💡 Số điện thoại học sinh dùng để đăng nhập vào hệ thống AvaB
              </p>
            </div>

            {msg && (
              <div className={`flex items-start gap-2 text-sm px-4 py-3 rounded-xl ${
                msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {msg.type === 'success'
                  ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  : <XCircle size={16} className="shrink-0 mt-0.5" />}
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-bold transition"
            >
              {loading ? '⏳ Đang tìm kiếm...' : '🔗 Liên kết ngay'}
            </button>
          </form>
        </div>

        {/* Linked students */}
        <div>
          <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-lg">👨‍👩‍👧‍👦</span>
            Học sinh đã liên kết ({students.length})
          </h2>

          {loadingStudents ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />)}
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">Chưa có học sinh nào được liên kết</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0">
                    {s.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{s.name ?? 'Chưa có tên'}</p>
                    <p className="text-xs text-gray-400">{s.phone}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.enrollments.filter((e) => ['ACTIVE', 'APPROVED'].includes(e.status)).map((e) => (
                        <span key={e.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                          {COURSE_TYPE_EMOJI[e.course.courseType] ?? '📚'} {e.course.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlink(s.id, s.name)}
                    disabled={deletingId === s.id}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-40"
                    title="Hủy liên kết"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
