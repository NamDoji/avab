'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Users, Link2, ChevronRight, BookOpen, Target, Calendar } from 'lucide-react'

const COURSE_TYPE_EMOJI: Record<string, string> = {
  TOAN: '📐',
  TIENG_ANH: '🇬🇧',
  LAP_TRINH_THUAT_TOAN: '🤖',
  LAP_TRINH_SCRATCH: '🐱',
  LAP_TRINH_PYTHON: '🐍',
  LAP_TRINH_CPP: '⚡',
}

interface StudentCard {
  id: string
  name: string | null
  phone: string
  avatar: string | null
  isActive: boolean
  linkedAt: string
  enrollments: Array<{
    id: string
    status: string
    course: { id: string; name: string; courseType: string; code: string }
  }>
  weekStats: { done: number; pct: number | null }
  lastSession: { date: string; subject: string } | null
}

export default function ParentDashboard() {
  const { data: session } = useSession()
  const [students, setStudents] = useState<StudentCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/parent/students')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStudents(d.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const name = session?.user?.name ?? 'Phụ huynh'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 p-4 pt-6 lg:pt-8">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-7 text-white mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/10 rounded-full translate-y-8" />
          <div className="relative">
            <p className="text-white/70 text-sm font-semibold mb-1">Góc phụ huynh · AvaB</p>
            <h1 className="text-2xl md:text-3xl font-black mb-2">
              Xin chào, {name}! 👨‍👩‍👧‍👦
            </h1>
            <p className="text-white/80 text-sm">
              {students.length > 0
                ? `Bạn đang theo dõi ${students.length} học sinh.`
                : 'Hãy liên kết tài khoản với con để bắt đầu theo dõi.'}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link href="/phu-huynh/lien-ket"
            className="bg-white rounded-2xl p-4 border border-blue-100 hover:border-blue-300 transition flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition">
              <Link2 size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Liên kết con</p>
              <p className="text-xs text-gray-400">Thêm học sinh</p>
            </div>
          </Link>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{students.length} học sinh</p>
              <p className="text-xs text-gray-400">Đang theo dõi</p>
            </div>
          </div>
        </div>

        {/* Student list */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Học sinh của tôi
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <p className="text-gray-600 font-bold mb-2">Chưa có học sinh nào được liên kết</p>
              <p className="text-gray-400 text-sm mb-6">Nhập số điện thoại của con để bắt đầu theo dõi tiến độ học tập</p>
              <Link href="/phu-huynh/lien-ket"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition">
                <Link2 size={16} /> Liên kết ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((s) => {
                const activeEnrollments = s.enrollments.filter((e) => ['ACTIVE', 'APPROVED'].includes(e.status))
                return (
                  <Link key={s.id} href={`/phu-huynh/hoc-sinh/${s.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition group overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                            {s.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <h3 className="font-black text-gray-900">{s.name ?? 'Chưa có tên'}</h3>
                            <p className="text-xs text-gray-400">{s.phone}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition mt-1" />
                      </div>

                      {/* Stats row */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {/* Bài tuần này */}
                        <div className="flex items-center gap-1.5 bg-blue-50 rounded-xl px-3 py-1.5">
                          <Target size={13} className="text-blue-500" />
                          <span className="text-xs font-semibold text-blue-700">
                            {s.weekStats.done} bài/tuần
                            {s.weekStats.pct !== null && ` · ${s.weekStats.pct}% đúng`}
                          </span>
                        </div>
                        {/* Buổi học gần nhất */}
                        {s.lastSession && (
                          <div className="flex items-center gap-1.5 bg-purple-50 rounded-xl px-3 py-1.5">
                            <Calendar size={13} className="text-purple-500" />
                            <span className="text-xs font-semibold text-purple-700">
                              {new Date(s.lastSession.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })} · {s.lastSession.subject}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Courses */}
                      {activeEnrollments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {activeEnrollments.map((e) => (
                            <span key={e.id} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                              {COURSE_TYPE_EMOJI[e.course.courseType] ?? '📚'} {e.course.code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
