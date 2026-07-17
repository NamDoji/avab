'use client'

import { useState } from 'react'

interface Feedback {
  id: string
  sessionDate: string
  sessionNote: string | null
  createdAt: string
  studentsCount: number
  subjectName: string
  courseName: string
}

interface Campus {
  id: string
  campusId: string
  campusName: string
  campusCode: string | null
  isPrimary: boolean
}

export interface TeacherProfileTabsProps {
  teacherId: string
  feedbacks: Feedback[]
  campuses: Campus[]
  sessionCount: number
  studentCount: number
}

const TABS = [
  { id: 'schedule', label: '📅 Lịch dạy' },
  { id: 'stats', label: '📊 Stats' },
  { id: 'campuses', label: '🏫 Cơ sở' },
]

export default function TeacherProfileTabs({
  feedbacks,
  campuses,
  sessionCount,
  studentCount,
}: TeacherProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('schedule')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all"
            style={
              activeTab === tab.id
                ? { background: 'linear-gradient(135deg, #0c4a6e, #0369a1)', color: '#fff' }
                : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schedule tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {feedbacks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-500 font-semibold">Chưa có buổi dạy nào</p>
              <p className="text-gray-400 text-sm mt-1">Lịch dạy sẽ hiện ở đây khi GV tạo phản hồi buổi học</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Ngày</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Khóa học</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Chủ đề</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Học sinh</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((fb, idx) => (
                    <tr
                      key={fb.id}
                      style={{ borderTop: idx === 0 ? undefined : '1px solid #f1f5f9' }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(fb.sessionDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800">{fb.courseName}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{fb.subjectName}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                          {fb.studentsCount} HS
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {fb.sessionNote ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                {feedbacks.length} buổi dạy gần nhất
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Tổng buổi dạy', value: sessionCount, icon: '📅', color: '#0369a1', bg: '#eff6ff' },
            { label: 'Học sinh đã dạy', value: studentCount, icon: '👥', color: '#059669', bg: '#f0fdf4' },
            { label: 'Cơ sở hoạt động', value: campuses.length, icon: '🏫', color: '#951F3D', bg: '#FFF7F9' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 shadow-sm"
              style={{ background: s.bg, border: `1px solid ${s.color}22` }}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Campuses tab */}
      {activeTab === 'campuses' && (
        <div className="space-y-3">
          {campuses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="text-4xl mb-3">🏫</div>
              <p className="text-gray-500 font-semibold">Chưa phân công cơ sở</p>
            </div>
          ) : (
            campuses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: '#eff6ff' }}
                  >
                    🏫
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{c.campusName}</div>
                    {c.campusCode && (
                      <div className="text-xs text-gray-400">{c.campusCode}</div>
                    )}
                  </div>
                </div>
                {c.isPrimary && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: '#fef9c3', color: '#854d0e' }}
                  >
                    ⭐ Cơ sở chính
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
