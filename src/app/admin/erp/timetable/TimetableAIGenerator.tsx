'use client'

import { useState } from 'react'

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6']
const PERIODS = Array.from({ length: 10 }, (_, i) => `Tiết ${i + 1}`)

interface SubjectInput { name: string; teacher: string; periodsPerWeek: number }
interface ClassInput   { name: string; grade: string }

type Cell = { subject: string; teacher: string } | null
type TimetableResult = Record<string, Record<string, Record<string, { subject: string; teacher: string }>>>
type Stats = { totalPeriods?: number; conflicts?: number; efficiency?: string }

const SUBJECT_COLORS: Record<string, string> = {
  'Toán': '#dbeafe', 'Văn': '#fce7f3', 'Anh': '#d1fae5',
  'Lý': '#fef9c3', 'Hóa': '#e0e7ff', 'Sinh': '#d1fae5',
  'Sử': '#ffedd5', 'Địa': '#ecfdf5', 'GDCD': '#f3e8ff',
  'Thể dục': '#dcfce7', 'Nhạc': '#fdf4ff', 'Mỹ thuật': '#fef3c7',
  'Tin': '#e0f2fe', 'Công nghệ': '#f0fdf4',
}
function cellColor(subject: string) {
  for (const [k, v] of Object.entries(SUBJECT_COLORS)) {
    if (subject.toLowerCase().includes(k.toLowerCase())) return v
  }
  return '#f8fafc'
}

const DEFAULT_SUBJECTS: SubjectInput[] = [
  { name: 'Toán', teacher: 'Nguyễn Văn A', periodsPerWeek: 4 },
  { name: 'Ngữ Văn', teacher: 'Trần Thị B', periodsPerWeek: 4 },
  { name: 'Tiếng Anh', teacher: 'Lê Thị C', periodsPerWeek: 3 },
  { name: 'Vật Lý', teacher: 'Phạm Văn D', periodsPerWeek: 2 },
  { name: 'Hóa học', teacher: 'Hoàng Thị E', periodsPerWeek: 2 },
  { name: 'Sinh học', teacher: 'Đặng Văn F', periodsPerWeek: 2 },
  { name: 'Thể dục', teacher: 'Bùi Thị G', periodsPerWeek: 2 },
]
const DEFAULT_CLASSES: ClassInput[] = [
  { name: '10A1', grade: '10' },
  { name: '10A2', grade: '10' },
]

export default function TimetableAIGenerator() {
  const [classes, setClasses]   = useState<ClassInput[]>(DEFAULT_CLASSES)
  const [subjects, setSubjects] = useState<SubjectInput[]>(DEFAULT_SUBJECTS)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [timetable, setTimetable] = useState<TimetableResult | null>(null)
  const [stats, setStats]       = useState<Stats | null>(null)
  const [conflicts, setConflicts] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [step, setStep] = useState<'config' | 'result'>('config')

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/erp/timetable/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classes, subjects }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Lỗi không xác định'); return }
      setTimetable(data.timetable ?? {})
      setStats(data.stats ?? {})
      setConflicts(data.conflicts ?? [])
      setSelectedClass(classes[0]?.name ?? '')
      setStep('result')
    } catch {
      setError('Không kết nối được AI. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  function addSubject() {
    setSubjects(s => [...s, { name: '', teacher: '', periodsPerWeek: 2 }])
  }
  function updateSubject(i: number, field: keyof SubjectInput, value: string | number) {
    setSubjects(s => s.map((x, idx) => idx === i ? { ...x, [field]: value } : x))
  }
  function removeSubject(i: number) {
    setSubjects(s => s.filter((_, idx) => idx !== i))
  }

  function addClass() {
    setClasses(c => [...c, { name: '', grade: '10' }])
  }
  function updateClass(i: number, field: keyof ClassInput, value: string) {
    setClasses(c => c.map((x, idx) => idx === i ? { ...x, [field]: value } : x))
  }
  function removeClass(i: number) {
    setClasses(c => c.filter((_, idx) => idx !== i))
  }

  const currentGrid: Record<string, Record<string, Cell>> = {}
  if (timetable && selectedClass && timetable[selectedClass]) {
    for (const day of DAYS) {
      currentGrid[day] = {}
      for (const period of PERIODS) {
        currentGrid[day][period] = timetable[selectedClass]?.[day]?.[period] ?? null
      }
    }
  }

  return (
    <div>
      {step === 'config' && (
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          {/* Classes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-800 text-sm">🏫 Danh sách lớp</h3>
              <button onClick={addClass} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-400 transition">+ Thêm lớp</button>
            </div>
            <div className="space-y-2">
              {classes.map((c, i) => (
                <div key={i} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    value={c.name}
                    onChange={e => updateClass(i, 'name', e.target.value)}
                    placeholder="Tên lớp (vd: 10A1)"
                    className="flex-1 min-w-[100px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <select
                    value={c.grade}
                    onChange={e => updateClass(i, 'grade', e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  >
                    {Array.from({length: 12}, (_, i) => String(i+1)).map(g => (
                      <option key={g} value={g}>Lớp {g}</option>
                    ))}
                  </select>
                  <button onClick={() => removeClass(i)} className="text-red-400 hover:text-red-600 px-2 text-lg">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-800 text-sm">📚 Môn học & Giáo viên</h3>
              <button onClick={addSubject} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-400 transition">+ Thêm môn</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase">
                    <th className="text-left pb-2 font-bold">Môn học</th>
                    <th className="text-left pb-2 font-bold pl-2">Giáo viên</th>
                    <th className="text-left pb-2 font-bold pl-2 w-24">Tiết/tuần</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {subjects.map((s, i) => (
                    <tr key={i}>
                      <td className="py-1 pr-2">
                        <input
                          value={s.name}
                          onChange={e => updateSubject(i, 'name', e.target.value)}
                          placeholder="Toán, Văn..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          value={s.teacher}
                          onChange={e => updateSubject(i, 'teacher', e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={s.periodsPerWeek}
                          onChange={e => updateSubject(i, 'periodsPerWeek', Number(e.target.value))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 text-center"
                        />
                      </td>
                      <td className="py-1">
                        <button onClick={() => removeSubject(i)} className="text-red-400 hover:text-red-600 px-2 text-lg">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={generate}
            disabled={loading || classes.length === 0 || subjects.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: loading ? '#7c3aed88' : 'linear-gradient(135deg,#7c3aed,#4338ca)' }}
          >
            {loading ? (
              <>
                <span className="animate-spin text-xl">⚙️</span>
                AI đang xếp thời khóa biểu... (15-30s)
              </>
            ) : (
              <>🤖 Generate Timetable với AI</>
            )}
          </button>
          {loading && (
            <p className="text-center text-xs text-gray-400 mt-2">
              AI đang tối ưu hóa cho {classes.length} lớp × {subjects.length} môn...
            </p>
          )}
        </div>
      )}

      {step === 'result' && timetable && (
        <div className="space-y-4">
          {/* Stats bar */}
          {stats && (
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Tổng tiết', value: stats.totalPeriods ?? '—', icon: '📊' },
                { label: 'Xung đột', value: stats.conflicts ?? conflicts.length, icon: '⚡', danger: (stats.conflicts ?? conflicts.length) > 0 },
                { label: 'Hiệu suất', value: stats.efficiency ?? '—', icon: '✨' },
              ].map(s => (
                <div key={s.label} className={`flex-1 min-w-28 bg-white rounded-2xl p-4 shadow-sm text-center ${s.danger ? 'border border-red-200' : ''}`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`font-black text-xl ${s.danger ? 'text-red-600' : 'text-gray-800'}`}>{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="font-bold text-red-700 text-sm mb-2">⚡ Xung đột cần xử lý thủ công:</p>
              <ul className="space-y-1">
                {conflicts.map((c, i) => (
                  <li key={i} className="text-xs text-red-600">• {c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Class selector */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <span className="text-sm font-bold text-gray-500">Lớp:</span>
              {classes.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedClass(c.name)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${selectedClass === c.name ? 'text-white shadow' : 'border border-gray-200 text-gray-500 hover:border-indigo-300'}`}
                  style={selectedClass === c.name ? { background: 'linear-gradient(135deg,#7c3aed,#4338ca)' } : {}}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-max">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-3 py-2.5 font-bold text-gray-400 uppercase w-16">Tiết</th>
                    {DAYS.map(d => (
                      <th key={d} className="px-3 py-2.5 font-bold text-gray-700 text-center">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period) => (
                    <tr key={period} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td className="px-3 py-2 font-bold text-gray-400 bg-gray-50 text-xs">{period}</td>
                      {DAYS.map(day => {
                        const cell = currentGrid[day]?.[period]
                        return (
                          <td key={day} className="px-2 py-1.5 text-center" style={{ borderLeft: '1px solid #f1f5f9' }}>
                            {cell ? (
                              <div
                                className="rounded-lg px-2 py-1.5"
                                style={{ background: cellColor(cell.subject) }}
                              >
                                <div className="font-bold text-gray-800 text-xs leading-tight">{cell.subject}</div>
                                <div className="text-gray-500 text-xs leading-tight mt-0.5 truncate max-w-[80px]">{cell.teacher}</div>
                              </div>
                            ) : (
                              <div className="rounded-lg h-9 w-full" style={{ background: '#f8fafc' }} />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setStep('config'); setTimetable(null) }}
              className="flex-1 min-w-[120px] px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              ← Chỉnh sửa lại
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="flex-1 min-w-[120px] px-4 py-3 rounded-2xl text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4338ca)' }}
            >
              {loading ? '⚙️ Đang tạo lại...' : '🔄 Tạo lại'}
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(timetable, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = 'timetable.json'; a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex-1 min-w-[120px] px-4 py-3 rounded-2xl text-sm font-bold text-white transition"
              style={{ background: 'linear-gradient(135deg,#0f766e,#0369a1)' }}
            >
              ⬇️ Xuất JSON
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
