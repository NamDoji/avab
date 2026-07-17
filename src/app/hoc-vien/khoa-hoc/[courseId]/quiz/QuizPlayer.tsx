'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { QuizQuestion } from './page'

interface QuizPlayerProps {
  courseId: string
  courseName: string
  questions: QuizQuestion[]
}

type Phase = 'start' | 'quiz' | 'result'

const QUIZ_DURATION = 15 * 60 // 900 seconds

interface QuizResult {
  score: number
  total: number
  pct: number
  xpEarned: number
  badgesEarned: Array<{ name: string; icon: string; xpReward: number }>
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getGrade(pct: number): { grade: string; bgColor: string; textColor: string; label: string } {
  if (pct >= 90) return { grade: 'A', bgColor: 'bg-green-100', textColor: 'text-green-600', label: 'Xuất sắc 🌟' }
  if (pct >= 70) return { grade: 'B', bgColor: 'bg-blue-100', textColor: 'text-blue-600', label: 'Giỏi 👍' }
  if (pct >= 50) return { grade: 'C', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', label: 'Khá 📚' }
  return { grade: 'D', bgColor: 'bg-red-100', textColor: 'text-red-600', label: 'Cần cố gắng 💪' }
}

export default function QuizPlayer({ courseId, courseName, questions }: QuizPlayerProps) {
  const [phase, setPhase] = useState<Phase>('start')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [timeExpired, setTimeExpired] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalQ = questions.length
  const answeredCount = Object.keys(answers).length
  const currentQ = questions[currentIdx]

  // handleSubmit using callback so refs stay current
  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    setShowConfirm(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const timeTaken = QUIZ_DURATION - timeLeft
    const answerArray = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] ?? '',
    }))

    try {
      const res = await fetch('/api/student/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, answers: answerArray, timeTaken }),
      })
      const data: { success: boolean; data?: QuizResult; error?: string } = await res.json()

      if (data.success && data.data) {
        setResult(data.data)
        setPhase('result')
      } else {
        alert('Nộp bài thất bại: ' + (data.error ?? 'Lỗi không xác định'))
        setSubmitting(false)
      }
    } catch {
      alert('Lỗi kết nối. Vui lòng thử lại.')
      setSubmitting(false)
    }
  }, [submitting, timeLeft, questions, answers, courseId])

  // Timer — start when phase === 'quiz'
  useEffect(() => {
    if (phase !== 'quiz') return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimeExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [phase])

  // Trigger submit when time expires
  useEffect(() => {
    if (timeExpired && phase === 'quiz') {
      setTimeExpired(false)
      handleSubmit()
    }
  }, [timeExpired, phase, handleSubmit])

  function startQuiz() {
    setAnswers({})
    setTimeLeft(QUIZ_DURATION)
    setCurrentIdx(0)
    setShowAnswers(false)
    setSubmitting(false)
    setPhase('quiz')
  }

  function resetQuiz() {
    setPhase('start')
    setAnswers({})
    setTimeLeft(QUIZ_DURATION)
    setCurrentIdx(0)
    setResult(null)
    setShowAnswers(false)
    setSubmitting(false)
    setTimeExpired(false)
  }

  // ─── START SCREEN ────────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Kiểm tra kiến thức</h1>
          <p className="text-gray-500 text-sm mb-7 line-clamp-2">{courseName}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-cherry-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-cherry-600">{totalQ}</div>
              <div className="text-xs text-gray-500 mt-1">Câu hỏi</div>
            </div>
            <div className="bg-cherry-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-cherry-600">15</div>
              <div className="text-xs text-gray-500 mt-1">Phút</div>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-yellow-600">20</div>
              <div className="text-xs text-gray-500 mt-1">XP/câu</div>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-gray-600 text-left mb-8">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              Mỗi câu đúng nhận 20 XP vào tài khoản
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">⏱️</span>
              Hết giờ sẽ tự động nộp bài
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cherry-500">🏅</span>
              Đạt 90%+ sẽ nhận huy hiệu đặc biệt
            </li>
          </ul>

          <button
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-cherry-600 to-cherry-600 text-white font-black py-4 rounded-2xl text-lg hover:from-cherry-700 hover:to-cherry-700 active:scale-95 transition"
          >
            🚀 Bắt đầu làm bài
          </button>

          <Link
            href={`/hoc-vien/khoa-hoc/${courseId}`}
            className="block mt-3 text-sm text-gray-400 hover:text-gray-600 transition py-2"
          >
            ← Về khoá học
          </Link>
        </div>
      </div>
    )
  }

  // ─── RESULT SCREEN ───────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const { grade, bgColor, textColor, label } = getGrade(result.pct)

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Score card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center mb-6">
          <div className={`w-24 h-24 mx-auto rounded-3xl ${bgColor} flex items-center justify-center mb-4`}>
            <span className={`text-5xl font-black ${textColor}`}>{grade}</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">{label}</h2>
          <p className="text-gray-400 text-sm mb-6">{courseName}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-green-600">
                {result.score}/{result.total}
              </div>
              <div className="text-xs text-gray-500 mt-1">Câu đúng</div>
            </div>
            <div className="bg-cherry-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-cherry-600">{result.pct}%</div>
              <div className="text-xs text-gray-500 mt-1">Tỉ lệ</div>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4">
              <div className="text-2xl font-black text-yellow-600">+{result.xpEarned}</div>
              <div className="text-xs text-gray-500 mt-1">XP nhận</div>
            </div>
          </div>

          {/* Score progress bar */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  result.pct >= 90
                    ? 'bg-green-500'
                    : result.pct >= 70
                    ? 'bg-blue-500'
                    : result.pct >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${result.pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Badges earned */}
          {result.badgesEarned.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-left">
              <p className="font-bold text-yellow-700 mb-3 text-center">🏅 Huy hiệu mới!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.badgesEarned.map((badge, i) => (
                  <span
                    key={i}
                    className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1.5 rounded-full border border-yellow-200"
                  >
                    {badge.icon} {badge.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition text-sm"
            >
              {showAnswers ? '🙈 Ẩn đáp án' : '🎯 Xem đáp án'}
            </button>
            <button
              onClick={resetQuiz}
              className="flex-1 py-3 rounded-2xl border-2 border-cherry-200 bg-cherry-50 font-bold text-cherry-700 hover:bg-cherry-100 transition text-sm"
            >
              📚 Làm lại
            </button>
          </div>
          <Link
            href={`/hoc-vien/khoa-hoc/${courseId}`}
            className="block py-3 rounded-2xl bg-gradient-to-r from-cherry-600 to-cherry-600 text-white font-black hover:from-cherry-700 hover:to-cherry-700 transition text-center"
          >
            ← Về khoá học
          </Link>
        </div>

        {/* Answer review */}
        {showAnswers && (
          <div className="space-y-3">
            <h3 className="text-lg font-black text-gray-900 px-1 mb-4">📋 Chi tiết đáp án</h3>
            {questions.map((q, idx) => {
              const studentAns = answers[q.id] ?? ''
              const isCorrect =
                studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
              const isAnswered = studentAns.length > 0

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border-2 p-4 ${
                    !isAnswered
                      ? 'border-gray-200'
                      : isCorrect
                      ? 'border-green-200'
                      : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        !isAnswered
                          ? 'bg-gray-100 text-gray-400'
                          : isCorrect
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {!isAnswered ? '—' : isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 mb-2 text-sm">
                        Câu {idx + 1}: {q.content}
                      </p>

                      {q.options && Array.isArray(q.options) && q.options.length > 0 ? (
                        <div className="space-y-1 mb-2">
                          {q.options.map(opt => (
                            <div
                              key={opt.key}
                              className={`text-xs px-3 py-1.5 rounded-xl ${
                                opt.key === q.correctAnswer
                                  ? 'bg-green-50 text-green-700 font-semibold border border-green-200'
                                  : opt.key === studentAns && !isCorrect
                                  ? 'bg-red-50 text-red-600 border border-red-200'
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {opt.key}. {opt.text}
                              {opt.key === q.correctAnswer && ' ✓'}
                              {opt.key === studentAns && opt.key !== q.correctAnswer && ' ✗'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm mb-2 space-y-1">
                          <div>
                            <span className="text-gray-500">Bạn trả lời: </span>
                            <span className={isCorrect ? 'text-green-600 font-semibold' : 'text-red-600'}>
                              {studentAns || '(bỏ trống)'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div>
                              <span className="text-gray-500">Đáp án đúng: </span>
                              <span className="text-green-600 font-semibold">{q.correctAnswer}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-xl">
                          💡 {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─── QUIZ SCREEN ─────────────────────────────────────────────────────────────
  const progressPct = totalQ > 0 ? ((currentIdx + 1) / totalQ) * 100 : 0
  const isTimeLow = timeLeft < 60

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Confirm submit dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Nộp bài?</h3>
              <p className="text-gray-500 text-sm">
                Bạn đã trả lời{' '}
                <strong className="text-gray-800">
                  {answeredCount}/{totalQ}
                </strong>{' '}
                câu.
                {answeredCount < totalQ && (
                  <span className="text-orange-600 block mt-1">
                    ⚠️ Còn {totalQ - answeredCount} câu chưa trả lời
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition text-sm min-h-[48px]"
              >
                Tiếp tục làm
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold hover:from-green-600 hover:to-teal-600 transition disabled:opacity-60 text-sm min-h-[48px]"
              >
                {submitting ? '⏳ Đang nộp...' : '✅ Xác nhận nộp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress & Timer header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-black text-gray-800 text-sm">
            Câu {currentIdx + 1}/{totalQ}
          </span>
          <div
            className={`font-mono font-black text-base px-3 py-1.5 rounded-2xl transition ${
              isTimeLow
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            ⏱️ {formatTime(timeLeft)}
          </div>
          <span className="text-xs text-gray-500">{answeredCount} đã trả lời</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cherry-500 to-cherry-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-4">
        <p className="text-base md:text-lg font-bold text-gray-900 mb-6 leading-relaxed">
          {currentQ.content}
        </p>

        {/* Multiple choice options */}
        {currentQ.options && Array.isArray(currentQ.options) && currentQ.options.length > 0 ? (
          <div className="space-y-3" role="radiogroup" aria-label="Lựa chọn câu trả lời">
            {currentQ.options.map(opt => {
              const isSelected = answers[currentQ.id] === opt.key
              return (
                <button
                  key={opt.key}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() =>
                    setAnswers(prev => ({ ...prev, [currentQ.id]: opt.key }))
                  }
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-98 ${
                    isSelected
                      ? 'border-cherry-500 bg-cherry-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-cherry-300 hover:bg-cherry-50/30'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-cherry-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {opt.key}
                  </div>
                  <span
                    className={`font-semibold text-sm leading-relaxed ${
                      isSelected ? 'text-cherry-900' : 'text-gray-700'
                    }`}
                  >
                    {opt.text}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          /* Open text answer */
          <textarea
            value={answers[currentQ.id] ?? ''}
            onChange={e =>
              setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))
            }
            placeholder="Nhập câu trả lời của bạn..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-cherry-400 focus:outline-none resize-none font-medium text-gray-800 text-sm transition"
          />
        )}
      </div>

      {/* Question dots + Navigation */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="px-4 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 text-sm min-h-[48px] whitespace-nowrap"
        >
          ← Câu trước
        </button>

        {/* Dot navigator */}
        <div className="flex-1 flex flex-wrap justify-center gap-1">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              title={`Câu ${idx + 1}${answers[q.id] ? ' (đã trả lời)' : ''}`}
              className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                idx === currentIdx
                  ? 'bg-cherry-600 text-white scale-110 shadow-sm'
                  : answers[q.id]
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentIdx < totalQ - 1 ? (
          <button
            onClick={() => setCurrentIdx(prev => Math.min(totalQ - 1, prev + 1))}
            className="px-4 py-3 rounded-2xl border-2 border-cherry-200 bg-cherry-50 font-bold text-cherry-700 hover:bg-cherry-100 transition text-sm min-h-[48px] whitespace-nowrap"
          >
            Câu tiếp →
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold hover:from-green-600 hover:to-teal-600 transition disabled:opacity-60 text-sm min-h-[48px] whitespace-nowrap"
          >
            Nộp bài ✅
          </button>
        )}
      </div>

      {/* Always-visible submit button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={submitting}
        className="w-full py-3.5 rounded-2xl border-2 border-green-300 text-green-700 font-bold hover:bg-green-50 transition disabled:opacity-60 text-sm"
      >
        📤 Nộp bài ({answeredCount}/{totalQ} câu đã trả lời)
      </button>
    </div>
  )
}
