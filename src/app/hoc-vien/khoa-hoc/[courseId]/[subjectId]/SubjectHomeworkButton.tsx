'use client'

import { useState } from 'react'
import HomeworkModal from '../bai-tap/HomeworkModal'
import { useRouter } from 'next/navigation'

interface Props {
  subjectId: string
  subjectName: string
  materialId?: string
  existingStatus?: string | null
}

export default function SubjectHomeworkButton({
  subjectId,
  subjectName,
  materialId,
  existingStatus,
}: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const isGraded = existingStatus === 'graded'
  const isSubmitted = existingStatus === 'submitted'

  if (isGraded) {
    return (
      <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-50 border border-green-200 text-green-700 font-semibold text-sm">
        ✅ Bài đã được chấm
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-3 rounded-2xl bg-cherry-600 text-white font-black text-sm hover:bg-cherry-700 active:scale-95 transition"
      >
        {isSubmitted ? '✏️ Nộp lại bài' : '📝 Làm bài tập'}
      </button>

      {open && (
        <HomeworkModal
          subjectId={subjectId}
          subjectName={subjectName}
          materialId={materialId}
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
