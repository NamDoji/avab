'use client'

import { useState } from 'react'
import HomeworkModal from './HomeworkModal'
import { useRouter } from 'next/navigation'
import { ClipboardList, CheckCircle2, Clock, Award } from 'lucide-react'

interface SubjectItem {
  id: string
  name: string
  icon: string | null
  materialId?: string
  submission: {
    id: string
    status: string
    score: number | null
    feedback: string | null
    submittedAt: string
    gradedAt: string | null
  } | null
}

interface Props {
  subjects: SubjectItem[]
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
        <Clock size={11} /> Chưa nộp
      </span>
    )
  if (status === 'submitted')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
        <ClipboardList size={11} /> Đã nộp
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
      <CheckCircle2 size={11} /> Đã chấm
    </span>
  )
}

export default function HomeworkList({ subjects }: Props) {
  const [activeSubject, setActiveSubject] = useState<SubjectItem | null>(null)
  const router = useRouter()

  function handleSuccess() {
    router.refresh()
  }

  return (
    <>
      <div className="space-y-3">
        {subjects.map((s, idx) => {
          const sub = s.submission
          const isGraded = sub?.status === 'graded'
          const isSubmitted = sub?.status === 'submitted'
          const canSubmit = !isGraded

          const colors = [
            'from-cherry-400 to-cherry-600',
            'from-cherry-400 to-cherry-600',
            'from-blue-400 to-blue-600',
            'from-teal-400 to-teal-600',
            'from-green-400 to-green-600',
            'from-pink-400 to-pink-600',
          ]
          const color = colors[idx % colors.length]

          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-start gap-4 p-4">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl flex-shrink-0`}
                >
                  {s.icon ?? '📖'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm leading-tight">{s.name}</p>
                    <StatusBadge status={sub?.status ?? null} />
                  </div>

                  {/* Score + Feedback when graded */}
                  {isGraded && sub && (
                    <div className="mt-2 space-y-1.5">
                      {sub.score !== null && (
                        <div className="flex items-center gap-2">
                          <Award size={14} className="text-yellow-500" />
                          <span className="text-sm font-black text-gray-900">
                            Điểm: {sub.score}/10
                          </span>
                        </div>
                      )}
                      {sub.feedback && (
                        <p className="text-sm text-gray-600 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                          💬 {sub.feedback}
                        </p>
                      )}
                    </div>
                  )}

                  {isSubmitted && (
                    <p className="mt-1 text-xs text-amber-600">
                      Đã nộp •{' '}
                      {new Date(sub!.submittedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Action */}
              {canSubmit && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => setActiveSubject(s)}
                    className="w-full py-2.5 rounded-xl bg-cherry-600 text-white text-sm font-black hover:bg-cherry-700 active:scale-95 transition"
                  >
                    {isSubmitted ? '✏️ Nộp lại bài' : '📤 Nộp bài'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {activeSubject && (
        <HomeworkModal
          subjectId={activeSubject.id}
          subjectName={activeSubject.name}
          materialId={activeSubject.materialId}
          onClose={() => setActiveSubject(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
