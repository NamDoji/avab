'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Trophy, ArrowRight, RotateCcw } from 'lucide-react'

// Câu hỏi mẫu — sẽ load từ API sau
const sampleQuestions = [
  {
    id: '1',
    order: 1,
    content: 'Điền số thích hợp vào chỗ trống: 5 + ___ = 8',
    correctAnswer: '3',
    hint: 'Nghĩ xem: 5 + ? = 8, thì ? bằng bao nhiêu?',
  },
  {
    id: '2',
    order: 2,
    content: 'Tính: 7 + 6 = ?',
    correctAnswer: '13',
    hint: 'Đếm thêm 6 từ số 7 nhé!',
  },
  {
    id: '3',
    order: 3,
    content: 'Lan có 10 quả táo, Lan ăn 3 quả. Hỏi Lan còn lại bao nhiêu quả táo?',
    correctAnswer: '7',
    hint: 'Đây là phép trừ: 10 - 3 = ?',
  },
  {
    id: '4',
    order: 4,
    content: 'Số nào lớn hơn: 15 hay 12?',
    correctAnswer: '15',
    hint: 'Số nào đứng sau trên trục số thì lớn hơn!',
  },
  {
    id: '5',
    order: 5,
    content: 'Tính: 9 + 9 = ?',
    correctAnswer: '18',
    hint: '9 + 9 = 9 + 10 - 1 = ?',
  },
]

interface Props {
  subjectId: string
  subjectName: string
}

type QuestionState = 'unanswered' | 'correct' | 'wrong'

export function QuizSection({ subjectId, subjectName }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [states, setStates] = useState<Record<string, QuestionState>>({})
  const [showHints, setShowHints] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  const questions = sampleQuestions

  const handleAnswerChange = (qId: string, value: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qId]: value }))
    setStates((prev) => ({ ...prev, [qId]: 'unanswered' }))
  }

  const handleSubmit = () => {
    const newStates: Record<string, QuestionState> = {}
    questions.forEach((q) => {
      const userAnswer = (answers[q.id] || '').trim()
      newStates[q.id] = userAnswer === q.correctAnswer ? 'correct' : 'wrong'
    })
    setStates(newStates)
    setSubmitted(true)
  }

  const handleReset = () => {
    setAnswers({})
    setStates({})
    setShowHints({})
    setSubmitted(false)
  }

  const correctCount = Object.values(states).filter((s) => s === 'correct').length
  const totalCount = questions.length
  const score = submitted ? Math.round((correctCount / totalCount) * 10) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          ✏️ Bài tập — {subjectName}
        </h2>
        {submitted && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-semibold"
          >
            <RotateCcw size={16} />
            Làm lại
          </button>
        )}
      </div>

      {/* Score summary */}
      {submitted && (
        <div className={`rounded-3xl p-6 mb-6 text-center ${
          score >= 8 ? 'bg-teal-50 border-2 border-teal-200' :
          score >= 5 ? 'bg-yellow-50 border-2 border-yellow-200' :
          'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="text-5xl mb-2">
            {score >= 8 ? '🏆' : score >= 5 ? '👍' : '💪'}
          </div>
          <div className="text-4xl font-black text-gray-900">{score}/10 điểm</div>
          <p className="text-gray-600 mt-1">
            Đúng <strong>{correctCount}</strong> / {totalCount} câu
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {score >= 8
              ? '🎉 Xuất sắc! Con làm rất tốt!'
              : score >= 5
              ? '👏 Cố gắng lên, con làm được!'
              : '💪 Ôn lại lý thuyết và thử lại nhé!'}
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, index) => {
          const state = states[q.id] || 'unanswered'
          const showHint = showHints[q.id]

          return (
            <div
              key={q.id}
              className={`rounded-3xl border-2 p-5 transition-all ${
                state === 'correct'
                  ? 'border-teal-300 bg-teal-50'
                  : state === 'wrong'
                  ? 'border-red-300 bg-red-50'
                  : 'border-purple-100 bg-white'
              }`}
            >
              {/* Question number + content */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`
                  w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black shrink-0
                  ${state === 'correct' ? 'bg-teal-500 text-white' :
                    state === 'wrong' ? 'bg-red-500 text-white' :
                    'bg-purple-100 text-purple-700'}
                `}>
                  {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : index + 1}
                </div>
                <p className="font-bold text-gray-800 text-base leading-relaxed whitespace-pre-wrap">{q.content}</p>
              </div>

              {/* Answer input */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Nhập đáp án..."
                  className={`
                    flex-1 px-4 py-3 rounded-2xl border-2 font-bold text-lg text-center
                    focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all
                    ${submitted ? 'cursor-not-allowed opacity-75' : ''}
                    ${state === 'correct'
                      ? 'border-teal-400 bg-teal-50 text-teal-700'
                      : state === 'wrong'
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-purple-200 bg-white text-gray-800 hover:border-purple-400'
                    }
                  `}
                />
                {state === 'correct' && <CheckCircle2 className="text-teal-500 shrink-0" size={28} />}
                {state === 'wrong' && <XCircle className="text-red-500 shrink-0" size={28} />}
              </div>

              {/* Hint */}
              {!submitted && (
                <button
                  onClick={() => setShowHints((p) => ({ ...p, [q.id]: !showHint }))}
                  className="mt-2 text-xs text-purple-500 hover:text-purple-700 font-medium"
                >
                  {showHint ? '🙈 Ẩn gợi ý' : '💡 Xem gợi ý'}
                </button>
              )}
              {showHint && !submitted && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-sm text-yellow-800">
                  💡 {q.hint}
                </div>
              )}

              {/* Correct answer shown after wrong */}
              {submitted && state === 'wrong' && (
                <div className="mt-3 text-sm text-red-700">
                  Đáp án đúng: <strong className="text-teal-600">{q.correctAnswer}</strong>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className={`
            mt-8 w-full flex items-center justify-center gap-2 py-4 rounded-3xl font-extrabold text-lg
            transition-all duration-200 shadow-lg
            ${Object.keys(answers).length >= questions.length
              ? 'btn-primary'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Trophy size={20} />
          Nộp bài & xem kết quả
          <ArrowRight size={20} />
        </button>
      )}

      {Object.keys(answers).length < questions.length && !submitted && (
        <p className="text-center text-sm text-gray-400 mt-3">
          Hãy điền đủ {questions.length} câu trước khi nộp bài nhé!
        </p>
      )}
    </div>
  )
}
