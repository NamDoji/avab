'use client'

import { useLang } from '@/contexts/LanguageContext'

const COURSE_TYPE_META_EMOJIS: Record<string, string> = {
  TOAN: '📐',
  TIENG_ANH: '🇬🇧',
  LAP_TRINH_THUAT_TOAN: '🤖',
  LAP_TRINH_SCRATCH: '🐱',
  LAP_TRINH_PYTHON: '🐍',
  LAP_TRINH_CPP: '⚡',
}

const TYPE_LABELS_VI: Record<string, string> = {
  TOAN: 'Toán',
  TIENG_ANH: 'Tiếng Anh',
  LAP_TRINH_THUAT_TOAN: 'Lập trình tư duy',
  LAP_TRINH_SCRATCH: 'Lập trình Scratch',
  LAP_TRINH_PYTHON: 'Lập trình Python',
  LAP_TRINH_CPP: 'Lập trình C++',
}

const TYPE_LABELS_EN: Record<string, string> = {
  TOAN: 'Math',
  TIENG_ANH: 'English',
  LAP_TRINH_THUAT_TOAN: 'Algorithm Coding',
  LAP_TRINH_SCRATCH: 'Scratch Coding',
  LAP_TRINH_PYTHON: 'Python',
  LAP_TRINH_CPP: 'C++',
}

export function KhoaHocHero() {
  const { lang } = useLang()
  const vi = lang === 'vi'
  const labels = vi ? TYPE_LABELS_VI : TYPE_LABELS_EN

  return (
    <div className="gradient-hero text-white py-14">
      <div className="container-custom text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-4 text-sm font-semibold">
          {vi ? '🌟 Học vui — Học thật — Học hiệu quả' : '🌟 Fun learning — Real results — Effective method'}
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          {vi ? 'Chọn khoá học phù hợp với con' : 'Find the right course for your child'}
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto text-base md:text-lg">
          {vi
            ? 'Toán tư duy · Tiếng Anh · Lập trình — Thiết kế riêng cho trẻ em Việt Nam'
            : 'Thinking Math · English · Coding — Designed specifically for Vietnamese children'}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {Object.entries(labels).map(([key, label]) => (
            <span key={key} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold">
              {COURSE_TYPE_META_EMOJIS[key]} {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
