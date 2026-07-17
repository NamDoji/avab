'use client'

import { useState } from 'react'
import { BookOpen, Video, FileText, CheckCircle2, Trophy } from 'lucide-react'
import { QuizSection } from './QuizSection'

interface Subject {
  id: string
  icon: string
  name: string
  color: string
  done: boolean
}

interface Props {
  subject: Subject
}

const tabs = [
  { id: 'theory', label: 'Lý thuyết', icon: BookOpen, emoji: '📖' },
  { id: 'video', label: 'Video', icon: Video, emoji: '🎬' },
  { id: 'homework', label: 'Bài tập', icon: FileText, emoji: '✏️' },
  { id: 'answer', label: 'Đáp án', icon: CheckCircle2, emoji: '✅' },
]

export function SubjectDetail({ subject }: Props) {
  const [activeTab, setActiveTab] = useState('theory')

  return (
    <div className="max-w-4xl mx-auto">
      {/* Subject header */}
      <div className={`rounded-4xl bg-gradient-to-br ${subject.color} p-6 md:p-8 text-white mb-6`}>
        <div className="flex items-center gap-4">
          <div className="text-6xl">{subject.icon}</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black">{subject.name}</h1>
            <p className="text-white/80 mt-1">Bấm vào tab bên dưới để học!</p>
          </div>
        </div>
      </div>

      {/* Tabs — big, kid-friendly */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap
              transition-all duration-200 min-h-[48px]
              ${activeTab === tab.id
                ? 'bg-cherry-600 text-white shadow-lg shadow-cherry-200'
                : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-cherry-200 hover:text-cherry-600'
              }
            `}
          >
            <span className="text-lg">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-4xl border-2 border-cherry-50 p-6 md:p-8">
        {activeTab === 'theory' && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              📖 Lý thuyết — {subject.name}
            </h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <div className="bg-cherry-50 rounded-3xl p-6 mb-4">
                <p className="text-gray-500 italic text-sm">
                  📂 Tài liệu lý thuyết sẽ được hiển thị ở đây sau khi giáo viên tải lên.
                  File PDF hoặc Word sẽ được nhúng trực tiếp để xem thuận tiện.
                </p>
              </div>
              <div className="aspect-[4/3] bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-3">📄</div>
                  <p className="font-semibold">File lý thuyết</p>
                  <p className="text-sm">Giáo viên chưa tải lên</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              🎬 Video bài giảng
            </h2>
            <div className="bg-gray-900 rounded-3xl aspect-video flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-7xl mb-4">▶️</div>
                <p className="font-bold text-lg">Video bài giảng</p>
                <p className="text-gray-400 text-sm mt-1">Giáo viên chưa cập nhật video</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <QuizSection subjectId={subject.id} subjectName={subject.name} />
        )}

        {activeTab === 'answer' && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              ✅ Đáp án & Hướng dẫn giải
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <p className="text-amber-800 text-sm font-medium">
                💡 Hãy làm bài tập trước khi xem đáp án nhé! Tab <strong>Bài tập</strong> đang chờ bạn.
              </p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-3">📋</div>
                <p className="font-semibold text-gray-700">Đáp án chi tiết</p>
                <p className="text-sm text-gray-400">Giáo viên chưa tải lên</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
