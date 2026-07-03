'use client'

import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────
interface CourseSubject {
  id: string
  name: string
  order: number
}

interface EnrollmentCourse {
  id: string
  name: string
  grade: string | null
  subjectName: string | null
  subjects: CourseSubject[]
}

interface EnrollmentItem {
  id: string
  status: string
  expiresAt: Date | null
  createdAt: Date
  course: EnrollmentCourse
}

interface AnswerQuestion {
  content: string
  subjectId: string
}

interface AnswerItem {
  id: string
  isCorrect: boolean
  score: number
  createdAt: Date
  question: AnswerQuestion
}

interface SessionFeedbackItem {
  id: string
  sessionDate: Date
  sessionNote: string | null
  subjectId: string
}

interface SessionRecordItem {
  id: string
  attendance: boolean
  focusLevel: number | null
  comprehension: number | null
  teacherNote: string | null
  emotionState: string | null
  createdAt: Date
  feedback: SessionFeedbackItem
}

interface BadgeItem {
  id: string
  key: string
  name: string
  icon: string
  color: string
  xpReward: number
}

interface UserBadgeItem {
  id: string
  earnedAt: Date
  badge: BadgeItem
}

interface UserStatsItem {
  xp: number
  coin: number
  level: number
  streak: number
  totalAnswers: number
  correctAnswers: number
  lessonsViewed: number
}

export interface StudentProfileTabsProps {
  enrollments: EnrollmentItem[]
  answers: AnswerItem[]
  sessionRecords: SessionRecordItem[]
  userBadges: UserBadgeItem[]
  userStats: UserStatsItem | null
}

// ── Tabs ──────────────────────────────────────────────────────────
type Tab = 'courses' | 'homework' | 'history' | 'gamification'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'courses',      icon: '📚', label: 'Khóa học' },
  { id: 'homework',     icon: '📝', label: 'Bài tập' },
  { id: 'history',      icon: '📅', label: 'Lịch sử học' },
  { id: 'gamification', icon: '🏅', label: 'Gamification' },
]

// ── Helpers ───────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Đang học',
  EXPIRED: 'Hết hạn',
  PENDING: 'Chờ duyệt',
  REMOVED: 'Đã xóa',
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  ACTIVE:   { bg: '#dcfce7', color: '#166534' },
  EXPIRED:  { bg: '#fee2e2', color: '#991b1b' },
  PENDING:  { bg: '#fef9c3', color: '#854d0e' },
  REMOVED:  { bg: '#f3f4f6', color: '#6b7280' },
}

const EMOTION_LABELS: Record<string, string> = {
  great: '😄 Tuyệt vời',
  good: '🙂 Tốt',
  neutral: '😐 Bình thường',
  tired: '😴 Mệt',
  frustrated: '😤 Căng thẳng',
}

function StarsRow({ value, max = 5 }: { value: number | null; max?: number }) {
  if (!value) return <span className="text-gray-400 text-xs">—</span>
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: i < value ? '#0f766e' : '#e5e7eb' }}
        />
      ))}
    </div>
  )
}

// ── Tab: Khóa học ─────────────────────────────────────────────────
function CoursesTab({ enrollments }: { enrollments: EnrollmentItem[] }) {
  if (enrollments.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <div className="text-4xl mb-2">📚</div>
        <p className="text-sm font-medium">Chưa ghi danh khóa học nào</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {enrollments.map((enr) => {
        const sc = STATUS_COLORS[enr.status] ?? STATUS_COLORS.REMOVED
        return (
          <div key={enr.id} className="border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="font-bold text-gray-900">{enr.course.name}</div>
                {enr.course.grade && (
                  <div className="text-xs text-gray-500 mt-0.5">Lớp {enr.course.grade} · {enr.course.subjectName ?? ''}</div>
                )}
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: sc.bg, color: sc.color }}
              >
                {STATUS_LABELS[enr.status] ?? enr.status}
              </span>
            </div>
            {enr.expiresAt && (
              <div className="text-xs text-gray-400 mb-2">
                Hết hạn: {new Date(enr.expiresAt).toLocaleDateString('vi-VN')}
              </div>
            )}
            {enr.course.subjects.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Chuyên đề ({enr.course.subjects.length})</div>
                <div className="flex flex-wrap gap-1">
                  {enr.course.subjects.map((sub) => (
                    <span key={sub.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0fdfa', color: '#0f766e' }}>
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Tab: Bài tập ─────────────────────────────────────────────────
function HomeworkTab({ answers }: { answers: AnswerItem[] }) {
  if (answers.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <div className="text-4xl mb-2">📝</div>
        <p className="text-sm font-medium">Chưa làm bài tập nào</p>
      </div>
    )
  }
  const correctCount = answers.filter((a) => a.isCorrect).length
  const pct = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0

  return (
    <div>
      {/* Summary */}
      <div className="flex gap-4 mb-4 p-3 rounded-xl" style={{ background: '#f0fdfa' }}>
        <div className="text-center">
          <div className="text-xl font-black" style={{ color: '#0f766e' }}>{pct}%</div>
          <div className="text-xs text-gray-500">Tỉ lệ đúng</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black text-gray-800">{answers.length}</div>
          <div className="text-xs text-gray-500">Câu đã làm</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-black text-green-600">{correctCount}</div>
          <div className="text-xs text-gray-500">Câu đúng</div>
        </div>
      </div>

      {/* Recent answers */}
      <div className="space-y-2">
        {answers.map((ans) => (
          <div
            key={ans.id}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: ans.isCorrect ? '#f0fdf4' : '#fff1f2' }}
          >
            <span className="text-lg">{ans.isCorrect ? '✅' : '❌'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 line-clamp-2">{ans.question.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(ans.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Lịch sử học ─────────────────────────────────────────────
function HistoryTab({ sessionRecords }: { sessionRecords: SessionRecordItem[] }) {
  if (sessionRecords.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <div className="text-4xl mb-2">📅</div>
        <p className="text-sm font-medium">Chưa có lịch sử buổi học</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {sessionRecords.map((rec) => (
        <div key={rec.id} className="border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm text-gray-900">
              📅 {new Date(rec.feedback.sessionDate).toLocaleDateString('vi-VN')}
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={rec.attendance ? { background: '#dcfce7', color: '#166534' } : { background: '#fee2e2', color: '#991b1b' }}
            >
              {rec.attendance ? 'Có mặt' : 'Vắng'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
            <div>
              <span className="text-gray-500">Tập trung: </span>
              <StarsRow value={rec.focusLevel} />
            </div>
            <div>
              <span className="text-gray-500">Hiểu bài: </span>
              <StarsRow value={rec.comprehension} />
            </div>
          </div>

          {rec.emotionState && (
            <div className="text-xs text-gray-500 mb-1">
              Cảm xúc: {EMOTION_LABELS[rec.emotionState] ?? rec.emotionState}
            </div>
          )}

          {rec.teacherNote && (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-1">
              💬 {rec.teacherNote}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Tab: Gamification ────────────────────────────────────────────
function GamificationTab({ userBadges, userStats }: { userBadges: UserBadgeItem[]; userStats: UserStatsItem | null }) {
  return (
    <div>
      {/* Stats */}
      {userStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'XP', value: userStats.xp.toLocaleString(), icon: '⚡' },
            { label: 'Level', value: `Lv.${userStats.level}`, icon: '🎯' },
            { label: 'Streak', value: `${userStats.streak} ngày`, icon: '🔥' },
            { label: 'Coin', value: userStats.coin.toLocaleString(), icon: '🪙' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-3 text-center"
              style={{ background: '#f0fdfa' }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-black text-lg" style={{ color: '#0f766e' }}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      {userBadges.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <div className="text-4xl mb-2">🏅</div>
          <p className="text-sm font-medium">Chưa có huy hiệu nào</p>
        </div>
      ) : (
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2">Huy hiệu ({userBadges.length})</div>
          <div className="flex flex-wrap gap-2">
            {userBadges.map((ub) => (
              <div
                key={ub.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100"
                title={`Đạt ngày ${new Date(ub.earnedAt).toLocaleDateString('vi-VN')}`}
              >
                <span className="text-xl">{ub.badge.icon}</span>
                <div>
                  <div className="text-xs font-bold text-gray-800">{ub.badge.name}</div>
                  <div className="text-xs text-amber-600">+{ub.badge.xpReward} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function StudentProfileTabs({
  enrollments,
  answers,
  sessionRecords,
  userBadges,
  userStats,
}: StudentProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('courses')

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Tab nav */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0"
            style={
              activeTab === tab.id
                ? { color: '#0f766e', borderBottom: '2px solid #0f766e' }
                : { color: '#6b7280', borderBottom: '2px solid transparent' }
            }
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'courses'      && <CoursesTab enrollments={enrollments} />}
        {activeTab === 'homework'     && <HomeworkTab answers={answers} />}
        {activeTab === 'history'      && <HistoryTab sessionRecords={sessionRecords} />}
        {activeTab === 'gamification' && <GamificationTab userBadges={userBadges} userStats={userStats} />}
      </div>
    </div>
  )
}
