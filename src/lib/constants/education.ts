/**
 * AvaB AI Education Platform — Shared Education Constants
 * Dùng chung cho toàn bộ platform. Không hardcode riêng từng file.
 */

// ─── GRADE OPTIONS ────────────────────────────────────────────────────────────
// Bao gồm: Mầm non → Lớp 1-12 → Đại học
// Dùng cho: Course, AI Studio, Question Bank, Content Studio, Filters...

export const GRADE_OPTIONS = [
  { value: 'preschool',   label: 'Mầm non',     short: 'MN',  order: 0  },
  ...Array.from({ length: 12 }, (_, i) => ({
    value:  String(i + 1),
    label:  `Lớp ${i + 1}`,
    short:  `L${i + 1}`,
    order:  i + 1,
  })),
  { value: 'university',  label: 'Đại học',     short: 'ĐH',  order: 13 },
]

/** Dùng cho select/filter — có option "Tất cả" ở đầu */
export const GRADE_OPTIONS_WITH_ALL = [
  { value: 'all', label: 'Tất cả lớp', short: 'All', order: -1 },
  ...GRADE_OPTIONS,
]

/** Chuyển value → label */
export function gradeLabel(value: string | null | undefined): string {
  if (!value) return 'Tất cả lớp'
  const opt = GRADE_OPTIONS.find(g => g.value === value)
  return opt?.label ?? `Lớp ${value}`
}

// ─── SUBJECT OPTIONS ──────────────────────────────────────────────────────────
// K12 Việt Nam chuẩn + International programs + Lập trình chuyên sâu

export type SubjectDef = {
  value:    string
  label:    string
  emoji:    string
  group:    'k12-core' | 'k12-stem' | 'coding' | 'international' | 'other'
  gradeMin?: number  // lớp bắt đầu môn này xuất hiện (optional hint)
  gradeMax?: number
}

export const SUBJECTS: SubjectDef[] = [
  // ── K12 Core ────────────────────────────────────────────────────────────────
  { value: 'THINKING_MATH',    label: 'Toán Tư Duy',            emoji: '🧠', group: 'k12-core' },
  { value: 'MATH',             label: 'Toán',                   emoji: '📐', group: 'k12-core' },
  { value: 'VIETNAMESE',       label: 'Tiếng Việt',             emoji: '📖', group: 'k12-core' },
  { value: 'ENGLISH',          label: 'Tiếng Anh',              emoji: '🔤', group: 'k12-core' },
  { value: 'ETHICS',           label: 'Đạo đức',                emoji: '🌻', group: 'k12-core', gradeMin: 1,  gradeMax: 5  },
  { value: 'CIVIC',            label: 'GDCD',                   emoji: '⚖️', group: 'k12-core', gradeMin: 6,  gradeMax: 12 },
  { value: 'HISTORY',          label: 'Lịch sử',                emoji: '🏛️', group: 'k12-core', gradeMin: 4  },
  { value: 'GEOGRAPHY',        label: 'Địa lý',                  emoji: '🌍', group: 'k12-core', gradeMin: 4  },
  { value: 'HISTORY_GEO',      label: 'Lịch sử & Địa lý',       emoji: '🗺️', group: 'k12-core', gradeMin: 4,  gradeMax: 5  },
  { value: 'PE',               label: 'Thể dục',                emoji: '⚽', group: 'k12-core' },
  { value: 'MUSIC',            label: 'Âm nhạc',                emoji: '🎵', group: 'k12-core' },
  { value: 'ART',              label: 'Mỹ thuật',               emoji: '🎨', group: 'k12-core' },
  { value: 'TECHNOLOGY',       label: 'Công nghệ',              emoji: '🔧', group: 'k12-core', gradeMin: 3  },
  // ── K12 STEM / Science ────────────────────────────────────────────────────
  { value: 'SCIENCE',          label: 'Khoa học',               emoji: '🔬', group: 'k12-stem', gradeMin: 1,  gradeMax: 5  },
  { value: 'NATURAL_SCIENCE',  label: 'Khoa học tự nhiên',      emoji: '⚗️', group: 'k12-stem', gradeMin: 6,  gradeMax: 9  },
  { value: 'PHYSICS',          label: 'Vật lý',                  emoji: '⚡', group: 'k12-stem', gradeMin: 6  },
  { value: 'CHEMISTRY',        label: 'Hóa học',                emoji: '🧪', group: 'k12-stem', gradeMin: 8  },
  { value: 'BIOLOGY',          label: 'Sinh học',               emoji: '🌿', group: 'k12-stem', gradeMin: 6  },
  { value: 'INFORMATICS',      label: 'Tin học',                emoji: '💻', group: 'k12-stem', gradeMin: 3  },
  // ── Lập trình chuyên sâu ─────────────────────────────────────────────────
  { value: 'SCRATCH',          label: 'Scratch',                emoji: '🐱', group: 'coding' },
  { value: 'PYTHON',           label: 'Python',                 emoji: '🐍', group: 'coding' },
  { value: 'CPP',              label: 'C++',                    emoji: '⚡', group: 'coding' },
  { value: 'ALGO',             label: 'Thuật toán',             emoji: '🤖', group: 'coding' },
  { value: 'CODING',           label: 'Lập trình (chung)',      emoji: '🖥️', group: 'coding' },
  // ── Chương trình quốc tế ─────────────────────────────────────────────────
  { value: 'IELTS',            label: 'IELTS',                  emoji: '📝', group: 'international' },
  { value: 'TOEIC',            label: 'TOEIC',                  emoji: '📋', group: 'international' },
  { value: 'CAMBRIDGE',        label: 'Cambridge',              emoji: '🎓', group: 'international' },
  { value: 'SAT',              label: 'SAT',                    emoji: '🏆', group: 'international' },
  { value: 'IB',               label: 'IB (Int\'l Baccalaureate)', emoji: '🌐', group: 'international' },
  { value: 'AP',               label: 'AP (Advanced Placement)', emoji: '🎯', group: 'international' },
  // ── Khác ─────────────────────────────────────────────────────────────────
  { value: 'GENERAL',          label: 'Chung / Khác',           emoji: '📚', group: 'other' },
]

/** Map value → SubjectDef (O(1) lookup) */
export const SUBJECT_MAP: Record<string, SubjectDef> = Object.fromEntries(
  SUBJECTS.map(s => [s.value, s])
)

/** Subjects dùng cho select — optional "Tất cả" */
export const SUBJECTS_WITH_ALL: SubjectDef[] = [
  { value: 'all', label: 'Tất cả môn', emoji: '📚', group: 'other' },
  ...SUBJECTS,
]

/** Shorthand: subject emoji + label */
export function subjectDisplay(value: string | null | undefined): string {
  if (!value) return '📚 Chung'
  const s = SUBJECT_MAP[value]
  return s ? `${s.emoji} ${s.label}` : value
}

// ─── CURRICULUM OPTIONS ───────────────────────────────────────────────────────

export const CURRICULUM_OPTIONS = [
  { value: 'K12-VN',           label: 'K12 Việt Nam',           emoji: '🇻🇳' },
  { value: 'CAMBRIDGE-PRIMARY', label: 'Cambridge Primary',     emoji: '🎓' },
  { value: 'CAMBRIDGE-LOWER',  label: 'Cambridge Lower Secondary', emoji: '🎓' },
  { value: 'CAMBRIDGE-IGCSE',  label: 'Cambridge IGCSE',        emoji: '🎓' },
  { value: 'IB-PYP',           label: 'IB PYP',                 emoji: '🌐' },
  { value: 'IB-MYP',           label: 'IB MYP',                 emoji: '🌐' },
  { value: 'IB-DP',            label: 'IB Diploma',             emoji: '🌐' },
  { value: 'SAT',              label: 'SAT Prep',               emoji: '🏆' },
  { value: 'IELTS',            label: 'IELTS Prep',             emoji: '📝' },
  { value: 'TOEIC',            label: 'TOEIC Prep',             emoji: '📋' },
  { value: 'AP',               label: 'AP Courses',             emoji: '🎯' },
  { value: 'PRESCHOOL-VN',     label: 'Mầm non Việt Nam',       emoji: '🌸' },
  { value: 'UNIVERSITY',       label: 'Đại học',                emoji: '🏫' },
]

/** Map curriculum → display */
export const CURRICULUM_MAP: Record<string, { label: string; emoji: string }> = Object.fromEntries(
  CURRICULUM_OPTIONS.map(c => [c.value, { label: c.label, emoji: c.emoji }])
)

// ─── SUBJECT CODE → META (colors, used in course cards) ──────────────────────

export type SubjectMeta = {
  emoji: string
  label: string
  color: string       // Tailwind bg class
  textColor: string   // Tailwind text class
  gradient: string    // Tailwind gradient classes
}

export const SUBJECT_META: Record<string, SubjectMeta> = {
  THINKING_MATH:   { emoji: '🧠', label: 'Toán Tư Duy',        color: 'bg-purple-100', textColor: 'text-purple-700', gradient: 'from-purple-500 to-purple-700' },
  MATH:            { emoji: '📐', label: 'Toán',               color: 'bg-blue-100',   textColor: 'text-blue-700',   gradient: 'from-blue-500 to-blue-700'     },
  VIETNAMESE:      { emoji: '📖', label: 'Tiếng Việt',         color: 'bg-red-100',    textColor: 'text-red-700',    gradient: 'from-red-500 to-red-700'       },
  ENGLISH:         { emoji: '🔤', label: 'Tiếng Anh',          color: 'bg-green-100',  textColor: 'text-green-700',  gradient: 'from-green-500 to-green-700'   },
  SCIENCE:         { emoji: '🔬', label: 'Khoa học',           color: 'bg-teal-100',   textColor: 'text-teal-700',   gradient: 'from-teal-500 to-teal-700'     },
  NATURAL_SCIENCE: { emoji: '⚗️', label: 'KHTN',               color: 'bg-cyan-100',   textColor: 'text-cyan-700',   gradient: 'from-cyan-500 to-cyan-700'     },
  PHYSICS:         { emoji: '⚡', label: 'Vật lý',              color: 'bg-yellow-100', textColor: 'text-yellow-700', gradient: 'from-yellow-500 to-yellow-700' },
  CHEMISTRY:       { emoji: '🧪', label: 'Hóa học',            color: 'bg-orange-100', textColor: 'text-orange-700', gradient: 'from-orange-500 to-orange-700' },
  BIOLOGY:         { emoji: '🌿', label: 'Sinh học',           color: 'bg-lime-100',   textColor: 'text-lime-700',   gradient: 'from-lime-500 to-lime-700'     },
  INFORMATICS:     { emoji: '💻', label: 'Tin học',            color: 'bg-sky-100',    textColor: 'text-sky-700',    gradient: 'from-sky-500 to-sky-700'       },
  HISTORY:         { emoji: '🏛️', label: 'Lịch sử',           color: 'bg-amber-100',  textColor: 'text-amber-700',  gradient: 'from-amber-500 to-amber-700'   },
  GEOGRAPHY:       { emoji: '🌍', label: 'Địa lý',              color: 'bg-emerald-100',textColor: 'text-emerald-700',gradient: 'from-emerald-500 to-emerald-700'},
  HISTORY_GEO:     { emoji: '🗺️', label: 'LS & ĐL',           color: 'bg-amber-100',  textColor: 'text-amber-700',  gradient: 'from-amber-400 to-emerald-600' },
  CIVIC:           { emoji: '⚖️', label: 'GDCD',              color: 'bg-indigo-100', textColor: 'text-indigo-700', gradient: 'from-indigo-500 to-indigo-700' },
  ETHICS:          { emoji: '🌻', label: 'Đạo đức',            color: 'bg-pink-100',   textColor: 'text-pink-700',   gradient: 'from-pink-500 to-pink-700'     },
  TECHNOLOGY:      { emoji: '🔧', label: 'Công nghệ',          color: 'bg-zinc-100',   textColor: 'text-zinc-700',   gradient: 'from-zinc-500 to-zinc-700'     },
  PE:              { emoji: '⚽', label: 'Thể dục',            color: 'bg-lime-100',   textColor: 'text-lime-700',   gradient: 'from-lime-400 to-green-600'    },
  MUSIC:           { emoji: '🎵', label: 'Âm nhạc',            color: 'bg-fuchsia-100',textColor: 'text-fuchsia-700',gradient: 'from-fuchsia-500 to-pink-600'  },
  ART:             { emoji: '🎨', label: 'Mỹ thuật',           color: 'bg-rose-100',   textColor: 'text-rose-700',   gradient: 'from-rose-500 to-rose-700'     },
  SCRATCH:         { emoji: '🐱', label: 'Scratch',            color: 'bg-orange-100', textColor: 'text-orange-700', gradient: 'from-orange-400 to-orange-600' },
  PYTHON:          { emoji: '🐍', label: 'Python',             color: 'bg-teal-100',   textColor: 'text-teal-700',   gradient: 'from-teal-400 to-teal-600'     },
  CPP:             { emoji: '⚡', label: 'C++',                 color: 'bg-purple-100', textColor: 'text-purple-700', gradient: 'from-purple-400 to-purple-600' },
  ALGO:            { emoji: '🤖', label: 'Thuật toán',         color: 'bg-slate-100',  textColor: 'text-slate-700',  gradient: 'from-slate-500 to-slate-700'   },
  CODING:          { emoji: '🖥️', label: 'Lập trình',          color: 'bg-sky-100',    textColor: 'text-sky-700',    gradient: 'from-sky-400 to-sky-700'       },
  IELTS:           { emoji: '📝', label: 'IELTS',              color: 'bg-green-100',  textColor: 'text-green-700',  gradient: 'from-green-400 to-teal-600'    },
  TOEIC:           { emoji: '📋', label: 'TOEIC',              color: 'bg-blue-100',   textColor: 'text-blue-700',   gradient: 'from-blue-400 to-blue-600'     },
  CAMBRIDGE:       { emoji: '🎓', label: 'Cambridge',          color: 'bg-blue-100',   textColor: 'text-blue-700',   gradient: 'from-blue-500 to-indigo-700'   },
  SAT:             { emoji: '🏆', label: 'SAT',                color: 'bg-yellow-100', textColor: 'text-yellow-700', gradient: 'from-yellow-400 to-orange-600' },
  IB:              { emoji: '🌐', label: 'IB',                 color: 'bg-indigo-100', textColor: 'text-indigo-700', gradient: 'from-indigo-400 to-blue-700'   },
  AP:              { emoji: '🎯', label: 'AP',                 color: 'bg-red-100',    textColor: 'text-red-700',    gradient: 'from-red-400 to-red-700'       },
  GENERAL:         { emoji: '📚', label: 'Chung',              color: 'bg-gray-100',   textColor: 'text-gray-700',   gradient: 'from-gray-400 to-gray-600'     },
}

/** Lấy meta cho một subjectCode, fallback về GENERAL */
export function getSubjectMeta(subjectCode?: string | null): SubjectMeta {
  return (subjectCode && SUBJECT_META[subjectCode]) ? SUBJECT_META[subjectCode] : SUBJECT_META.GENERAL
}
