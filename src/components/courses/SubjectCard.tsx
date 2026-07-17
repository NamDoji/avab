'use client'

interface Subject {
  id: string
  icon: string
  name: string
  color: string
  done: boolean
}

interface Props {
  subject: Subject
  index: number
  onClick: () => void
}

export function SubjectCard({ subject, index, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center justify-center gap-3 
        p-4 md:p-6 rounded-3xl text-center
        border-2 transition-all duration-200 
        hover:shadow-xl hover:-translate-y-2 active:scale-95 
        cursor-pointer select-none
        ${subject.done
          ? 'border-teal-200 bg-teal-50'
          : 'border-cherry-100 bg-white hover:border-cherry-300'
        }
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Done badge */}
      {subject.done && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          ✓
        </div>
      )}

      {/* Number badge */}
      <div className="absolute top-2 left-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
        {index + 1}
      </div>

      {/* Icon circle */}
      <div
        className={`
          w-16 h-16 md:w-20 md:h-20 rounded-3xl 
          bg-gradient-to-br ${subject.color}
          flex items-center justify-center text-3xl md:text-4xl
          shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200
        `}
      >
        {subject.icon}
      </div>

      {/* Name */}
      <p className="text-xs md:text-sm font-bold text-gray-700 leading-snug">
        {subject.name}
      </p>

      {/* Tap hint */}
      <span className="text-xs text-gray-400 group-hover:text-cherry-500 transition-colors font-medium">
        {subject.done ? '✅ Xem lại' : '👆 Bấm vào học'}
      </span>
    </button>
  )
}
