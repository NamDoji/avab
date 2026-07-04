'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Campus  { id: string; name: string; code?: string }
interface Teacher { id: string; name: string | null; phone: string }
interface CourseItem { id: string; name: string; code: string; gradeMin: number | null }
interface GradeGroup { label: string; courses: CourseItem[] }
interface SubjectInput { name: string; teacherId: string; teacherName: string; periodsPerWeek: number }
interface TimetableResult { [cls: string]: { [day: string]: { [period: string]: { subject: string; teacher: string } } } }

const DAYS    = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6']
const PERIODS = Array.from({ length: 10 }, (_, i) => `Tiết ${i + 1}`)

const CELL_COLORS: Record<string, string> = {
  'toán': '#dbeafe', 'văn': '#fce7f3', 'anh': '#d1fae5', 'vật lý': '#fef9c3',
  'hóa': '#e0e7ff', 'sinh': '#d1fae5', 'lịch sử': '#ffedd5', 'địa': '#ecfdf5',
  'tin': '#e0f2fe', 'thể dục': '#dcfce7', 'âm nhạc': '#fdf4ff', 'mỹ thuật': '#fef3c7',
}
function cellColor(subject: string) {
  const lower = subject.toLowerCase()
  for (const [k, v] of Object.entries(CELL_COLORS)) {
    if (lower.includes(k)) return v
  }
  return '#f8fafc'
}

type Step = 'campus' | 'level' | 'classes' | 'subjects' | 'generate' | 'result'

export default function TimetableAIGenerator() {
  // ── Server data ──────────────────────────────────────────────────────────────
  const [campuses,   setCampuses]   = useState<Campus[]>([])
  const [gradeGroups, setGradeGroups] = useState<Record<string, GradeGroup>>({})
  const [teachers,   setTeachers]   = useState<Teacher[]>([])
  const [subjectTemplates, setSubjectTemplates] = useState<Record<string, { name: string; periodsPerWeek: number }[]>>({})

  // ── Wizard state ─────────────────────────────────────────────────────────────
  const [step,          setStep]          = useState<Step>('campus')
  const [campusId,      setCampusId]      = useState<string>('')
  const [campusName,    setCampusName]    = useState<string>('')
  const [levelKey,      setLevelKey]      = useState<string>('')
  const [selectedClasses, setSelectedClasses] = useState<CourseItem[]>([])
  const [subjects,      setSubjects]      = useState<SubjectInput[]>([])
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  // ── Result ───────────────────────────────────────────────────────────────────
  const [timetable,  setTimetable]  = useState<TimetableResult | null>(null)
  const [stats,      setStats]      = useState<{ totalPeriods?: number; conflicts?: number; efficiency?: string } | null>(null)
  const [conflicts,  setConflicts]  = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')

  // ── Load setup data ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/erp/timetable/setup-data')
      .then(r => r.json())
      .then(d => {
        setCampuses(d.campuses ?? [])
        setGradeGroups(d.gradeGroups ?? {})
        setTeachers(d.teachers ?? [])
        setSubjectTemplates(d.subjectTemplates ?? {})
      })
      .catch(() => {})
  }, [])

  // Reload when campus changes
  useEffect(() => {
    if (!campusId) return
    fetch(`/api/admin/erp/timetable/setup-data?campusId=${campusId}`)
      .then(r => r.json())
      .then(d => {
        setGradeGroups(d.gradeGroups ?? {})
        setTeachers(d.teachers ?? [])
      })
  }, [campusId])

  // Pre-fill subjects from template when level selected
  useEffect(() => {
    if (!levelKey) return
    const tpl = subjectTemplates[levelKey] ?? []
    setSubjects(tpl.map(s => ({ name: s.name, teacherId: '', teacherName: '', periodsPerWeek: s.periodsPerWeek })))
  }, [levelKey, subjectTemplates])

  // ── Generate ──────────────────────────────────────────────────────────────────
  async function generate() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/erp/timetable/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campusName,
          levelKey,
          classes: selectedClasses.map(c => ({ name: c.name, grade: String(c.gradeMin ?? '') })),
          subjects: subjects.filter(s => s.name.trim()).map(s => ({
            name: s.name,
            teacher: s.teacherName || teachers.find(t => t.id === s.teacherId)?.name || `GV ${s.name}`,
            periodsPerWeek: s.periodsPerWeek,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Lỗi AI'); return }
      setTimetable(data.timetable ?? {})
      setStats(data.stats ?? {})
      setConflicts(data.conflicts ?? [])
      setSelectedClass(selectedClasses[0]?.name ?? '')
      setStep('result')
    } catch { setError('Không kết nối được AI') }
    finally { setLoading(false) }
  }

  // ── Step renders ──────────────────────────────────────────────────────────────

  // Step 1: Chọn cơ sở
  if (step === 'campus') return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏫</span>
        <div>
          <h3 className="font-black text-gray-900">Bước 1 — Chọn cơ sở</h3>
          <p className="text-sm text-gray-400">Tạo TKB cho cơ sở nào?</p>
        </div>
      </div>
      {campuses.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">Chưa có cơ sở nào. <a href="/admin/organizations" className="text-indigo-600 underline">Thêm cơ sở →</a></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {campuses.map(c => (
            <button
              key={c.id}
              onClick={() => { setCampusId(c.id); setCampusName(c.name); setStep('level') }}
              className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left min-h-[60px]"
            >
              <span className="text-2xl">🏢</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                {c.code && <p className="text-xs text-gray-400">{c.code}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // Step 2: Chọn cấp học
  if (step === 'level') {
    const LEVEL_META: Record<string, { icon: string; color: string }> = {
      mn: { icon: '🧸', color: '#ec4899' }, th: { icon: '📚', color: '#3b82f6' },
      thcs: { icon: '🔬', color: '#8b5cf6' }, thpt: { icon: '🎓', color: '#f59e0b' },
      other: { icon: '📋', color: '#6b7280' },
    }
    const levels = Object.entries(gradeGroups)
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button onClick={() => setStep('campus')} className="text-indigo-600 hover:underline">← Cơ sở</button>
          <span className="text-gray-300">/</span>
          <span className="font-bold text-gray-700">{campusName}</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📐</span>
          <div>
            <h3 className="font-black text-gray-900">Bước 2 — Chọn cấp học</h3>
            <p className="text-sm text-gray-400">TKB cho cấp học nào?</p>
          </div>
        </div>
        {levels.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Chưa có lớp học nào tại cơ sở này. <a href="/admin/erp/classes" className="text-indigo-600 underline">Tạo lớp →</a></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {levels.map(([key, group]) => {
              const meta = LEVEL_META[key] ?? { icon: '📋', color: '#6b7280' }
              return (
                <button
                  key={key}
                  onClick={() => { setLevelKey(key); setStep('classes') }}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left min-h-[60px]"
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{group.label}</p>
                    <p className="text-xs text-gray-400">{group.courses.length} lớp học</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Step 3: Chọn lớp
  if (step === 'classes') {
    const group = gradeGroups[levelKey]
    const available = group?.courses ?? []
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
          <button onClick={() => setStep('campus')} className="text-indigo-600 hover:underline">← Cơ sở</button>
          <span className="text-gray-300">/</span>
          <button onClick={() => setStep('level')} className="text-indigo-600 hover:underline">{campusName}</button>
          <span className="text-gray-300">/</span>
          <span className="font-bold text-gray-700">{group?.label}</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📋</span>
          <div>
            <h3 className="font-black text-gray-900">Bước 3 — Chọn lớp</h3>
            <p className="text-sm text-gray-400">Chọn các lớp cần xếp TKB</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setSelectedClasses(available)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100">Chọn tất cả</button>
          <button onClick={() => setSelectedClasses([])} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100">Bỏ chọn</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {available.map(c => {
            const selected = selectedClasses.some(x => x.id === c.id)
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClasses(prev => selected ? prev.filter(x => x.id !== c.id) : [...prev, c])}
                className="flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left min-h-[44px]"
                style={{
                  borderColor: selected ? '#6366f1' : '#e5e7eb',
                  background: selected ? '#eef2ff' : '#fff',
                }}
              >
                <span className="text-base">{selected ? '✅' : '⬜'}</span>
                <span className="text-sm font-semibold text-gray-800 truncate">{c.name}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={() => setStep('level')} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">← Quay lại</button>
          <button
            onClick={() => setStep('subjects')}
            disabled={selectedClasses.length === 0}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            Tiếp tục ({selectedClasses.length} lớp) →
          </button>
        </div>
      </div>
    )
  }

  // Step 4: Môn học & GV
  if (step === 'subjects') return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">👩‍🏫</span>
        <div>
          <h3 className="font-black text-gray-900">Bước 4 — Môn học & Giáo viên</h3>
          <p className="text-sm text-gray-400">Phân công môn cho từng GV</p>
        </div>
      </div>
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {subjects.map((s, i) => (
          <div key={i} className="flex gap-2 items-start flex-wrap sm:flex-nowrap">
            <input
              value={s.name}
              onChange={e => setSubjects(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
              placeholder="Tên môn"
              className="flex-1 min-w-[120px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            />
            <select
              value={s.teacherId}
              onChange={e => {
                const t = teachers.find(t => t.id === e.target.value)
                setSubjects(prev => prev.map((x, j) => j === i ? { ...x, teacherId: e.target.value, teacherName: t?.name ?? '' } : x))
              }}
              className="flex-1 min-w-[140px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            >
              <option value="">-- Chọn GV --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name ?? t.phone}</option>)}
            </select>
            <input
              type="number" min={1} max={10}
              value={s.periodsPerWeek}
              onChange={e => setSubjects(prev => prev.map((x, j) => j === i ? { ...x, periodsPerWeek: Number(e.target.value) } : x))}
              className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-indigo-400"
            />
            <button onClick={() => setSubjects(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-2 text-lg min-h-[40px] flex items-center">×</button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setSubjects(p => [...p, { name: '', teacherId: '', teacherName: '', periodsPerWeek: 2 }])}
        className="mt-3 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
      >+ Thêm môn</button>

      {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">❌ {error}</div>}

      <div className="mt-4 flex gap-3">
        <button onClick={() => setStep('classes')} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">← Quay lại</button>
        <button
          onClick={generate}
          disabled={loading || subjects.filter(s => s.name.trim()).length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white text-sm disabled:opacity-50"
          style={{ background: loading ? '#7c3aed88' : 'linear-gradient(135deg,#7c3aed,#4338ca)' }}
        >
          {loading ? <><span className="animate-spin">⚙️</span> AI đang xếp TKB…</> : '🤖 Generate với AI'}
        </button>
      </div>
    </div>
  )

  // Step result
  if (step === 'result' && timetable) {
    const currentGrid = selectedClass && timetable[selectedClass]
      ? timetable[selectedClass]
      : null

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 mb-1">
            <div className="text-xs text-gray-500"><span className="font-bold text-gray-700">Cơ sở:</span> {campusName}</div>
            <div className="text-xs text-gray-500"><span className="font-bold text-gray-700">Lớp:</span> {selectedClasses.length} lớp</div>
            <div className="text-xs text-gray-500"><span className="font-bold text-gray-700">Môn:</span> {subjects.filter(s=>s.name).length} môn</div>
            {stats?.efficiency && <div className="text-xs text-green-600 font-bold">✨ Hiệu suất: {stats.efficiency}</div>}
          </div>
          {conflicts.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              ⚡ {conflicts.length} xung đột: {conflicts.slice(0,2).join(', ')}
            </div>
          )}
        </div>

        {/* Class tab selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {selectedClasses.map(c => (
            <button
              key={c.name}
              onClick={() => setSelectedClass(c.name)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all min-h-[40px]"
              style={{
                background: selectedClass === c.name ? 'linear-gradient(135deg,#7c3aed,#4338ca)' : '#f3f4f6',
                color: selectedClass === c.name ? '#fff' : '#374151',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Timetable grid */}
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 500 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="px-3 py-2.5 text-left font-bold text-gray-400 uppercase w-14">Tiết</th>
                {DAYS.map(d => <th key={d} className="px-3 py-2.5 font-bold text-gray-700 text-center">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td className="px-3 py-2 font-bold text-gray-400 bg-gray-50 text-xs">{period}</td>
                  {DAYS.map(day => {
                    const cell = currentGrid?.[day]?.[period]
                    return (
                      <td key={day} className="px-2 py-1.5 text-center" style={{ borderLeft: '1px solid #f1f5f9' }}>
                        {cell ? (
                          <div className="rounded-lg px-2 py-1.5" style={{ background: cellColor(cell.subject) }}>
                            <div className="font-bold text-gray-800 text-xs leading-tight">{cell.subject}</div>
                            <div className="text-gray-500 text-xs leading-tight mt-0.5 truncate max-w-[70px]">{cell.teacher}</div>
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

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setStep('subjects'); setTimetable(null) }} className="flex-1 min-w-[120px] py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">← Chỉnh lại</button>
          <button onClick={generate} disabled={loading} className="flex-1 min-w-[120px] py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#7c3aed,#4338ca)' }}>{loading ? '⚙️ Đang tạo lại…' : '🔄 Tạo lại'}</button>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify({ campusName, classes: selectedClasses.map(c=>c.name), timetable }, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = `tkb-${campusName}.json`; a.click()
              URL.revokeObjectURL(url)
            }}
            className="flex-1 min-w-[120px] py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#0f766e,#0369a1)' }}
          >⬇️ Xuất JSON</button>
        </div>
      </div>
    )
  }

  return null
}
