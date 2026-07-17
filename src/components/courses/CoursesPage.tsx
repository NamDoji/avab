'use client'

import { useState } from 'react'
import { SubjectCard } from './SubjectCard'
import { SubjectDetail } from './SubjectDetail'
import { ChevronLeft } from 'lucide-react'

// 25 chuyên đề thực tế từ file Danh sách chuyên đề.xlsx
const subjectList = [
  { id: '1',  icon: '➕', name: 'Phép cộng, phép trừ có nhớ',           color: 'from-cherry-400 to-cherry-600', done: false },
  { id: '2',  icon: '⚡', name: 'Bài toán tính nhanh',                   color: 'from-blue-400 to-blue-600',   done: false },
  { id: '3',  icon: '➡️', name: 'Bài toán tính xuôi',                   color: 'from-teal-400 to-teal-600',   done: false },
  { id: '4',  icon: '⬅️', name: 'Bài toán tính ngược',                  color: 'from-cyan-400 to-cyan-600',   done: false },
  { id: '5',  icon: '🌳', name: 'Bài toán trồng cây',                   color: 'from-green-400 to-green-600', done: false },
  { id: '6',  icon: '👴', name: 'Bài toán tuổi',                        color: 'from-orange-400 to-orange-600', done: false },
  { id: '7',  icon: '🔄', name: 'Bài toán so sánh thay thế',            color: 'from-yellow-400 to-yellow-600', done: false },
  { id: '8',  icon: '⚖️', name: 'Bài toán cân thăng bằng',             color: 'from-red-400 to-red-600',     done: false },
  { id: '9',  icon: '🚶', name: 'Bài toán xếp hàng',                   color: 'from-pink-400 to-pink-600',   done: false },
  { id: '10', icon: '🧠', name: 'Bài toán Logic',                       color: 'from-cherry-400 to-cherry-600', done: false },
  { id: '11', icon: '🐔', name: 'Bài toán Gà - Thỏ',                   color: 'from-rose-400 to-rose-600',   done: false },
  { id: '12', icon: '📊', name: 'Bài toán nhiều hơn, ít hơn, bằng nhau', color: 'from-cherry-400 to-cherry-600', done: false },
  { id: '13', icon: '📐', name: 'Bài toán vẽ sơ đồ',                   color: 'from-sky-400 to-sky-600',     done: false },
  { id: '14', icon: '🔵', name: 'Bài toán biểu đồ Venn',               color: 'from-blue-500 to-cherry-600', done: false },
  { id: '15', icon: '🎱', name: 'Bài toán bốc bi',                     color: 'from-cherry-500 to-cherry-700', done: false },
  { id: '16', icon: '📏', name: 'Bài toán chênh lệch',                 color: 'from-teal-500 to-teal-700',   done: false },
  { id: '17', icon: '🎨', name: 'Bài toán tô màu',                     color: 'from-orange-500 to-orange-700', done: false },
  { id: '18', icon: '🧩', name: 'Bài toán IQ',                         color: 'from-red-500 to-red-700',     done: false },
  { id: '19', icon: '🔡', name: 'Bài toán thay số bằng chữ',           color: 'from-green-500 to-green-700', done: false },
  { id: '20', icon: '🔢', name: 'Bài toán quy luật số',                color: 'from-yellow-500 to-amber-600', done: false },
  { id: '21', icon: '🔷', name: 'Bài toán quy luật hình',              color: 'from-pink-500 to-pink-700',   done: false },
  { id: '22', icon: '🔲', name: 'Bài toán số chẵn, số lẻ',            color: 'from-cherry-500 to-cherry-700', done: false },
  { id: '23', icon: '🔣', name: 'Bài toán định nghĩa phép toán mới',  color: 'from-cyan-500 to-cyan-700',   done: false },
  { id: '24', icon: '🗺️', name: 'Bài toán đếm cách đi',              color: 'from-cherry-500 to-cherry-700', done: false },
  { id: '25', icon: '📅', name: 'Bài toán thứ trong tuần',            color: 'from-rose-500 to-rose-700',   done: false },
]

export function CoursesPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const subject = subjectList.find((s) => s.id === selectedSubject)

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="gradient-hero text-white py-12 md:py-16">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            🏆 Khoá Luyện Thi Học Bổng Lớp 1
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Các chuyên đề toán tư duy
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-base md:text-lg">
            Bấm vào biểu tượng của chuyên đề con muốn học — hệ thống sẽ hiển thị bài giảng, 
            bài tập và con có thể tự làm bài ngay!
          </p>
        </div>
      </div>

      <div className="container-custom py-10">
        {!selectedSubject ? (
          <>
            {/* Pain → Solution intro */}
            <div className="mb-10 bg-amber-50 border border-amber-200 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-black text-amber-900 mb-3">
                💭 Phụ huynh đang gặp áp lực gì?
              </h2>
              <ul className="space-y-2 text-amber-800 text-sm md:text-base">
                <li>😰 <strong>Không biết con cần học gì</strong> để vào các trường như Lương Thế Vinh, Nguyễn Siêu, Vinschool?</li>
                <li>📚 <strong>Tài liệu thiếu hệ thống</strong> — mua nhiều sách nhưng con học không ra tư duy?</li>
                <li>⏰ <strong>Thời gian chuẩn bị ngắn</strong> — cần một lộ trình rõ ràng, hiệu quả ngay?</li>
              </ul>
              <div className="mt-4 flex items-center gap-2 text-cherry-700 font-bold">
                <span>✅</span>
                <span>AvaB có đầy đủ 25 chuyên đề — từ nền tảng đến nâng cao, theo đúng cấu trúc đề thi các trường hàng đầu Hà Nội.</span>
              </div>
            </div>

            {/* Subject grid — kid-friendly UX */}
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">
              🎮 Chọn chuyên đề muốn học
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
              {subjectList.map((subject, index) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  index={index}
                  onClick={() => setSelectedSubject(subject.id)}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-xs">✓</span>
                Đã làm
              </span>
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs">→</span>
                Chưa làm
              </span>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedSubject(null)}
              className="flex items-center gap-2 text-cherry-600 hover:text-cherry-800 font-semibold mb-6 transition-colors"
            >
              <ChevronLeft size={20} />
              Quay lại danh sách chuyên đề
            </button>
            {subject && <SubjectDetail subject={subject} />}
          </>
        )}
      </div>
    </div>
  )
}
