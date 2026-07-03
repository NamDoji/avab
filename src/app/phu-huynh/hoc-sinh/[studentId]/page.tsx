'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, BookOpen, Target, BarChart2, Calendar, CheckCircle, XCircle,
  MessageSquare, Brain, Star, TrendingUp
} from 'lucide-react'

const COURSE_TYPE_EMOJI: Record<string, string> = {
  TOAN: '📐', TIENG_ANH: '🇬🇧', LAP_TRINH_THUAT_TOAN: '🤖',
  LAP_TRINH_SCRATCH: '🐱', LAP_TRINH_PYTHON: '🐍', LAP_TRINH_CPP: '⚡',
}

interface ProgressData {
  student: {
    id: string
    name: string | null
    phone: string
    avatar: string | null
    createdAt: string
    learnerProfile: {
      backgroundLevel: string
      targetSchool: string | null
      targetGoal: string
      additionalNotes: string | null
    } | null
  }
  enrollments: Array<{
    id: string
    status: string
    course: {
      id: string
      name: string
      code: string
      courseType: string
      subjects: Array<{ id: string; name: string; icon: string | null; order: number }>
    }
  }>
  stats: {
    totalAnswers: number
    correctAnswers: number
    accuracy: number
    weekDone: number
    weekCorrect: number
    weekPct: number | null
  }
  subjectProgress: Array<{
    subjectId: string
    name: string
    icon: string | null
    total: number
    correct: number
    pct: number
  }>
  recentAnswers: Array<{
    id: string
    question: string
    subject: string
    isCorrect: boolean
    score: number
    createdAt: string
  }>
  sessionRecords: Array<{
    id: string
    sessionDate: string
    subjectName: string
    subjectIcon: string | null
    courseName: string
    attendance: boolean
    focusLevel: number | null
    comprehension: number | null
    emotionState: string | null
    hwScore: number | null
    hwCorrect: number | null
    hwTotal: number | null
    teacherNote: string | null
    aiComment: string | null
    discipline: number | null
    participationLevel: number | null
  }>
}

function RatingDots({ value, max = 5 }: { value: number | null; max?: number }) {
  if (value === null) return <span className="text-gray-300 text-xs">–</span>
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < value ? 'bg-blue-500' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

function EmotionBadge({ state }: { state: string | null }) {
  if (!state) return null
  const map: Record<string, { emoji: string; label: string; cls: string }> = {
    great:     { emoji: '🤩', label: 'Hứng khởi',  cls: 'bg-yellow-50 text-yellow-700' },
    good:      { emoji: '😊', label: 'Vui vẻ',     cls: 'bg-green-50 text-green-700' },
    neutral:   { emoji: '😐', label: 'Bình thường', cls: 'bg-gray-50 text-gray-600' },
    tired:     { emoji: '😴', label: 'Mệt mỏi',    cls: 'bg-orange-50 text-orange-700' },
    frustrated:{ emoji: '😤', label: 'Chán',        cls: 'bg-red-50 text-red-700' },
  }
  const m = map[state] ?? { emoji: '😐', label: state, cls: 'bg-gray-50 text-gray-600' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${m.cls}`}>
      {m.emoji} {m.label}
    </span>
  )
}

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'overview' | 'progress' | 'sessions' | 'recent'>('overview')

  useEffect(() => {
    fetch(`/api/parent/students/${studentId}/progress`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data)
        else setError(d.error || 'Không tải được dữ liệu')
      })
      .catch(() => setError('Lỗi kết nối'))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Đang tải dữ liệu học sinh...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 font-bold mb-2">{error ?? 'Không tìm thấy học sinh'}</p>
          <Link href="/phu-huynh" className="text-blue-600 hover:underline text-sm">← Quay lại</Link>
        </div>
      </div>
    )
  }

  const { student, enrollments, stats, subjectProgress, recentAnswers, sessionRecords } = data
  const activeEnrollments = enrollments.filter((e) => ['ACTIVE', 'APPROVED'].includes(e.status))

  const TABS = [
    { id: 'overview',  label: 'Tổng quan', icon: Target },
    { id: 'progress',  label: 'Tiến độ',   icon: BarChart2 },
    { id: 'sessions',  label: 'Buổi học',  icon: Calendar },
    { id: 'recent',    label: 'Bài gần đây', icon: CheckCircle },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-4 pt-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/phu-huynh" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-5 transition">
            <ArrowLeft size={15} /> Quay lại
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
              {student.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="text-2xl font-black">{student.name ?? 'Học sinh'}</h1>
              <p className="text-white/70 text-sm">{student.phone}</p>
              {student.learnerProfile?.targetSchool && (
                <p className="text-white/60 text-xs mt-0.5">🎯 Mục tiêu: {student.learnerProfile.targetSchool}</p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-2xl font-black">{stats.accuracy}%</div>
              <div className="text-white/70 text-xs">Chính xác</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-2xl font-black">{stats.totalAnswers}</div>
              <div className="text-white/70 text-xs">Tổng câu</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-2xl font-black">{stats.weekDone}</div>
              <div className="text-white/70 text-xs">Bài/tuần</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-2xl font-black">{activeEnrollments.length}</div>
              <div className="text-white/70 text-xs">Khoá học</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 lg:top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                  tab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Courses */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-500" /> Khoá học đang học
              </h2>
              {activeEnrollments.length === 0 ? (
                <p className="text-gray-400 text-sm">Chưa có khoá học nào đang hoạt động</p>
              ) : (
                <div className="space-y-2">
                  {activeEnrollments.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl">{COURSE_TYPE_EMOJI[e.course.courseType] ?? '📚'}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{e.course.name}</p>
                        <p className="text-xs text-gray-400">{e.course.subjects.length} chuyên đề · {e.course.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learner profile */}
            {student.learnerProfile && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Brain size={16} className="text-purple-500" /> Hồ sơ người học
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Trình độ', value: { BEGINNER: 'Mới bắt đầu', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao' }[student.learnerProfile.backgroundLevel] ?? student.learnerProfile.backgroundLevel },
                    { label: 'Mục tiêu', value: { SCHOLARSHIP: 'Học bổng', FOUNDATION: 'Nền tảng', ADVANCED: 'Nâng cao' }[student.learnerProfile.targetGoal] ?? student.learnerProfile.targetGoal },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="font-bold text-gray-800 text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                {student.learnerProfile.additionalNotes && (
                  <div className="mt-3 bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-600 font-semibold mb-1">📝 Ghi chú</p>
                    <p className="text-sm text-gray-700">{student.learnerProfile.additionalNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Week summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-green-500" /> Tuần này
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-green-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-green-700">{stats.weekDone}</p>
                  <p className="text-xs text-gray-400">Bài đã làm</p>
                </div>
                <div className="text-center bg-blue-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-blue-700">{stats.weekCorrect}</p>
                  <p className="text-xs text-gray-400">Câu đúng</p>
                </div>
                <div className="text-center bg-purple-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-purple-700">{stats.weekPct !== null ? `${stats.weekPct}%` : '–'}</p>
                  <p className="text-xs text-gray-400">Tỷ lệ đúng</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {tab === 'progress' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-500" /> Tiến độ theo chuyên đề
            </h2>
            {subjectProgress.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">Chưa có dữ liệu bài tập</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjectProgress
                  .sort((a, b) => b.total - a.total)
                  .map((sp) => (
                    <div key={sp.subjectId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-700">
                          {sp.icon ?? '📖'} {sp.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{sp.correct}/{sp.total}</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                            sp.pct >= 80 ? 'bg-green-100 text-green-700'
                            : sp.pct >= 60 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {sp.pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            sp.pct >= 80 ? 'bg-green-500'
                            : sp.pct >= 60 ? 'bg-yellow-400'
                            : 'bg-red-400'
                          }`}
                          style={{ width: `${sp.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* SESSIONS TAB */}
        {tab === 'sessions' && (
          <div className="space-y-4">
            {sessionRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-gray-400 text-sm">Chưa có nhận xét buổi học nào</p>
              </div>
            ) : (
              sessionRecords.map((record) => {
                const lines = (record.aiComment ?? '').split('\n\n').filter(Boolean)
                const parentNote = lines.find((l) => l.includes('Gửi phụ huynh'))?.replace(/\*\*/g, '').replace('👨‍👩‍👧 Gửi phụ huynh:', '').trim()
                const overview = lines.find((l) => l.includes('Tổng quan'))?.replace(/\*\*/g, '').replace('📋 Tổng quan:', '').trim()

                return (
                  <div key={record.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Session header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      <span className="text-xl shrink-0">{record.subjectIcon ?? '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{record.subjectName}</p>
                        <p className="text-xs text-gray-400">{record.courseName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-blue-600">
                          {new Date(record.sessionDate).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                        </p>
                        {record.hwScore !== null && (
                          <p className="text-xs text-gray-400">BTVN: {record.hwScore}%</p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-4 space-y-3">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          record.attendance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {record.attendance ? '✅ Có mặt' : '❌ Vắng'}
                        </span>
                        {record.focusLevel && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                            🧠 Tập trung: {record.focusLevel}/5
                          </span>
                        )}
                        {record.comprehension && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                            📚 Hiểu bài: {record.comprehension}/5
                          </span>
                        )}
                        <EmotionBadge state={record.emotionState} />
                      </div>

                      {/* Parent note (most important) */}
                      {parentNote && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-amber-600 mb-0.5">👨‍👩‍👧 Giáo viên gửi phụ huynh</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{parentNote}</p>
                        </div>
                      )}

                      {/* Overview */}
                      {overview && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-gray-500 mb-0.5">📋 Tổng quan buổi học</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{overview}</p>
                        </div>
                      )}

                      {/* Detailed metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        {record.discipline !== null && (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-500">Ý thức</span>
                            <RatingDots value={record.discipline} />
                          </div>
                        )}
                        {record.participationLevel !== null && (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-500">Tham gia</span>
                            <RatingDots value={record.participationLevel} />
                          </div>
                        )}
                      </div>

                      {/* Full AI comment collapsible */}
                      {record.aiComment && (
                        <details>
                          <summary className="text-xs text-blue-600 font-semibold cursor-pointer hover:text-blue-700 list-none">
                            ▶ Xem nhận xét đầy đủ của AI
                          </summary>
                          <div className="mt-2 bg-blue-50 rounded-xl px-3 py-3 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                            {record.aiComment}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* RECENT ANSWERS TAB */}
        {tab === 'recent' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-black text-gray-900 mb-5 flex items-center gap-2">
              <CheckCircle size={16} className="text-blue-500" /> 10 câu gần nhất
            </h2>
            {recentAnswers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">Chưa có bài làm nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnswers.map((ans, i) => (
                  <div key={ans.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    ans.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      ans.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {ans.isCorrect
                        ? <CheckCircle size={12} className="text-white" />
                        : <XCircle size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 line-clamp-2 font-medium">{ans.question || 'Câu hỏi'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{ans.subject}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(ans.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${
                      ans.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      +{ans.score}đ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
