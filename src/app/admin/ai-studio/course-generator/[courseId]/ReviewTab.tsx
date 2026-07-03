'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Material {
  id:      string
  type:    string
  title:   string | null
  content: string | null
}

interface SubjectWithMaterials {
  id:        string
  name:      string
  materials: Material[]
}

interface ReviewTabProps {
  subjects: SubjectWithMaterials[]
}

type FilterType = 'THEORY' | 'lesson-outline' | 'HOMEWORK' | 'ANSWER_KEY' | 'QUIZ' | 'TEACHER_GUIDE' | 'VIDEO_SCRIPT'

const FILTER_OPTIONS: { type: FilterType; label: string; icon: string }[] = [
  { type: 'THEORY',        label: 'Lý thuyết',     icon: '📖' },
  { type: 'lesson-outline',label: 'Outline',        icon: '📋' },
  { type: 'HOMEWORK',      label: 'Bài tập',        icon: '📝' },
  { type: 'ANSWER_KEY',    label: 'Đáp án',         icon: '✅' },
  { type: 'QUIZ',          label: 'Đề kiểm tra',    icon: '📊' },
  { type: 'TEACHER_GUIDE', label: 'Hướng dẫn GV',  icon: '👩‍🏫' },
  { type: 'VIDEO_SCRIPT',  label: 'Kịch bản video', icon: '🎬' },
]

export default function ReviewTab({ subjects }: ReviewTabProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id ?? '')
  const [filterType,        setFilterType]         = useState<FilterType>('THEORY')

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId)
  const selectedMaterial = selectedSubject?.materials.find(m => m.type === filterType)

  return (
    <div className="flex gap-4 min-h-[500px]">
      {/* ── Left sidebar: subject list ─────────────────────────────────── */}
      <div className="w-56 flex-shrink-0">
        <p className="text-sm font-bold text-gray-700 mb-2 px-1">
          Chuyên đề
        </p>
        <div className="flex flex-col gap-1">
          {subjects.map(subject => {
            const hasMaterial = subject.materials.some(m => m.type === filterType && m.content)
            return (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedSubjectId === subject.id
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${hasMaterial ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="truncate">{subject.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Type filter */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map(opt => {
            const hasContent = selectedSubject?.materials.some(m => m.type === opt.type && m.content)
            return (
              <button
                key={opt.type}
                onClick={() => setFilterType(opt.type)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterType === opt.type
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : hasContent
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {opt.icon} {opt.label}
                {!hasContent && <span className="text-gray-300">·</span>}
              </button>
            )
          })}
        </div>

        {/* Content area */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {selectedMaterial?.content ? (
            <div className="p-5 overflow-y-auto max-h-[700px]">
              {selectedMaterial.title && (
                <h2 className="text-lg font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  {selectedMaterial.title}
                </h2>
              )}
              <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-gray-700 prose-li:text-gray-700">
                <ReactMarkdown>{selectedMaterial.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
              <div className="text-5xl mb-4">
                {FILTER_OPTIONS.find(o => o.type === filterType)?.icon ?? '📄'}
              </div>
              <p className="font-bold text-gray-600 mb-1">Chưa có nội dung</p>
              <p className="text-sm text-gray-400">
                {selectedSubject
                  ? `"${selectedSubject.name}" chưa có ${FILTER_OPTIONS.find(o => o.type === filterType)?.label ?? filterType}`
                  : 'Chọn một chuyên đề để xem nội dung'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
