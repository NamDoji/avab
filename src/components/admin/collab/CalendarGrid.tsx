'use client'

import { useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
export interface HolidayEvent {
  id: string
  name: string
  startDate: string   // ISO string
  endDate: string     // ISO string
  type: string        // holiday | exam | event | makeup
}

// ─── Event type config ───────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  holiday: { color: '#dc2626', bg: '#fee2e2', dot: '🔴' },
  exam:    { color: '#d97706', bg: '#fef3c7', dot: '🟡' },
  event:   { color: '#2563eb', bg: '#dbeafe', dot: '🔵' },
  makeup:  { color: '#059669', bg: '#dcfce7', dot: '🟢' },
}

function typeConf(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.event
}

const VI_MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const VI_WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns all days in a month grid (6 weeks × 7 = 42 cells), starting Sunday */
function buildCalendarGrid(year: number, month: number): Array<Date | null> {
  const first = new Date(year, month, 1)
  const startDay = first.getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const grid: Array<Date | null> = []

  // Leading empty slots
  for (let i = 0; i < startDay; i++) grid.push(null)

  // Month days
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d))

  // Trailing empty slots to complete 42 cells
  while (grid.length < 42) grid.push(null)

  return grid
}

/** Returns YYYY-MM-DD string for a Date */
function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Build a map: dateKey → events */
function buildEventMap(events: HolidayEvent[]): Map<string, HolidayEvent[]> {
  const map = new Map<string, HolidayEvent[]>()
  for (const ev of events) {
    const start = new Date(ev.startDate)
    const end = new Date(ev.endDate)
    // Add the event for each day it spans (up to 31 days)
    const cursor = new Date(start)
    let count = 0
    while (cursor <= end && count < 31) {
      const key = toDateKey(cursor)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
      cursor.setDate(cursor.getDate() + 1)
      count++
    }
  }
  return map
}

// ─── Main CalendarGrid ───────────────────────────────────────────────────────
interface CalendarGridProps {
  holidays: HolidayEvent[]
  staticEvents?: Array<{ date: string; label: string; type: string }>
}

export default function CalendarGrid({ holidays, staticEvents = [] }: CalendarGridProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const todayKey = toDateKey(today)

  // Merge holidays + static events into a unified list
  const allEvents: HolidayEvent[] = [
    ...holidays,
    ...staticEvents.map((e, i) => ({
      id: `static-${i}`,
      name: e.label,
      startDate: e.date,
      endDate: e.date,
      type: e.type,
    })),
  ]

  const eventMap = buildEventMap(allEvents)
  const grid = buildCalendarGrid(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDay(todayKey)
  }

  const selectedEvents = selectedDay ? (eventMap.get(selectedDay) ?? []) : []

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Calendar Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold text-lg"
        >
          ‹
        </button>

        <div className="text-center">
          <h3 className="font-black text-gray-900">
            {VI_MONTHS[month]} {year}
          </h3>
          <p className="text-xs text-gray-400">{allEvents.length} sự kiện trong tháng hiện tại</p>
        </div>

        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold text-lg"
        >
          ›
        </button>
      </div>

      {/* Today button */}
      <div className="flex justify-end px-6 pt-3">
        <button
          onClick={goToday}
          className="text-xs font-bold text-teal-600 hover:text-teal-800 px-3 py-1 rounded-lg hover:bg-teal-50 transition"
        >
          Hôm nay
        </button>
      </div>

      {/* ── Weekday headers ── */}
      <div className="grid grid-cols-7 gap-px px-4 pt-2">
        {VI_WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-xs font-black text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7 gap-px p-4">
        {grid.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-16 rounded-xl" />
          }

          const key = toDateKey(day)
          const isToday = key === todayKey
          const isSelected = key === selectedDay
          const dayEvents = eventMap.get(key) ?? []
          const hasEvents = dayEvents.length > 0
          const isCurrentMonth = day.getMonth() === month

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(isSelected ? null : key)}
              className={[
                'h-16 rounded-xl p-1 flex flex-col items-center transition-all relative overflow-hidden',
                isToday ? 'ring-2 ring-teal-500 ring-offset-1' : '',
                isSelected ? 'bg-teal-50 ring-2 ring-teal-400 ring-offset-1' : 'hover:bg-gray-50',
                !isCurrentMonth ? 'opacity-30' : '',
              ].join(' ')}
            >
              {/* Day number */}
              <span
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-0.5',
                  isToday ? 'bg-teal-600 text-white' : 'text-gray-700',
                ].join(' ')}
              >
                {day.getDate()}
              </span>

              {/* Event dots */}
              {hasEvents && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map((ev, i) => {
                    const conf = typeConf(ev.type)
                    return (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: conf.color }}
                        title={ev.name}
                      />
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] text-gray-400 font-bold">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Selected day events panel ── */}
      {selectedDay && (
        <div className="border-t border-gray-100 px-6 py-4">
          <h4 className="font-black text-sm text-gray-800 mb-3">
            📌 {new Date(selectedDay + 'T00:00:00').toLocaleDateString('vi-VN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </h4>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400">Không có sự kiện</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev) => {
                const conf = typeConf(ev.type)
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: conf.bg }}
                  >
                    <span className="text-lg">{conf.dot}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: conf.color }}>{ev.name}</p>
                      {ev.startDate !== ev.endDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Đến{' '}
                          {new Date(ev.endDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Legend ── */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-4">
        {Object.entries(TYPE_CONFIG).map(([type, conf]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: conf.color }}
            />
            {conf.dot === '🔴' ? 'Nghỉ lễ' : conf.dot === '🟡' ? 'Thi' : conf.dot === '🔵' ? 'Sự kiện' : 'Học bù'}
          </div>
        ))}
      </div>
    </div>
  )
}
