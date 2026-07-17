'use client'

import { useState } from 'react'

interface Campus {
  id: string
  name: string
  code: string | null
}

interface TimetableVersion {
  id: string
  name: string
  status: string
  score: number | null
  conflicts: number
  generatedAt: string
  publishedAt: string | null
}

interface SlotData {
  id: string
  courseId: string
  teacherId: string | null
  roomId: string | null
  dayOfWeek: number
  period: number
  status: string
  isLocked: boolean
  course: { id: string; code: string; name: string; subjectName: string | null } | null
  teacher: { id: string; name: string | null } | null
  room: { id: string; name: string } | null
}

interface Props {
  campuses: Campus[]
  initialVersions: TimetableVersion[]
  initialSlots: SlotData[]
  defaultCampusId: string | null
}

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6']
const PROGRESS_STEPS = [
  'Đang phân tích danh sách lớp...',
  'Đang tối ưu phân công giáo viên...',
  'Đang tối ưu phân bổ phòng học...',
  'Đang kiểm tra xung đột...',
  'Đang tính điểm tối ưu...',
  'Hoàn thành! Đang lưu kết quả...',
]

const PALETTE = [
  '#6366f1', '#BE3659', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16',
]

function courseColor(courseId: string): string {
  let hash = 0
  for (let i = 0; i < courseId.length; i++) hash = courseId.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    published: { label: '✅ Published', bg: '#dcfce7', color: '#166534' },
    draft: { label: '📝 Draft', bg: '#fef9c3', color: '#713f12' },
    archived: { label: '🗄️ Archived', bg: '#f1f5f9', color: '#64748b' },
  }
  const s = map[status] ?? map.draft
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

export default function TimetableGeneratePanel({
  campuses,
  initialVersions,
  initialSlots,
  defaultCampusId,
}: Props) {
  const [campusId, setCampusId] = useState(defaultCampusId ?? campuses[0]?.id ?? '')
  const [semesterId, setSemesterId] = useState('HK1 2025-2026')
  const [periodsPerDay, setPeriodsPerDay] = useState(8)
  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [maxPeriodsPerTeacher, setMaxPeriodsPerTeacher] = useState(6)

  const [generating, setGenerating] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [result, setResult] = useState<{
    versionId: string
    slots: number
    conflicts: number
    score: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [versions, setVersions] = useState<TimetableVersion[]>(initialVersions)
  const [slots, setSlots] = useState<SlotData[]>(initialSlots)
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(
    initialVersions.find((v) => v.status === 'published')?.id ?? null
  )
  const [filterCourse, setFilterCourse] = useState<string>('')

  // Progress ticker
  function startProgressTicker() {
    setProgressStep(0)
    const interval = setInterval(() => {
      setProgressStep((p) => {
        if (p >= PROGRESS_STEPS.length - 1) {
          clearInterval(interval)
          return p
        }
        return p + 1
      })
    }, 3500)
    return interval
  }

  async function handleGenerate() {
    if (!campusId) return
    setGenerating(true)
    setError(null)
    setResult(null)
    const ticker = startProgressTicker()

    try {
      const res = await fetch('/api/admin/erp/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campusId,
          semesterId,
          constraints: { periodsPerDay, daysPerWeek, maxPeriodsPerTeacher },
        }),
      })

      clearInterval(ticker)
      setProgressStep(PROGRESS_STEPS.length - 1)

      const data = await res.json()
      if (!res.ok) {
        setError(data.error + (data.details ? `: ${data.details}` : ''))
        return
      }

      setResult(data)
      // Refresh versions list
      await refreshVersions()
    } catch (e) {
      setError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  async function refreshVersions() {
    const res = await fetch(`/api/admin/erp/timetable?campusId=${campusId}`)
    if (res.ok) {
      const data = await res.json()
      setVersions(data.versions)
    }
  }

  async function loadSlots(versionId: string) {
    setViewingVersionId(versionId)
    const res = await fetch(`/api/admin/erp/timetable/slots?versionId=${versionId}`)
    if (res.ok) {
      const data = await res.json()
      setSlots(data.slots)
    }
  }

  async function handlePublish(versionId: string) {
    const res = await fetch(`/api/admin/erp/timetable?versionId=${versionId}&action=publish`, {
      method: 'PATCH',
    })
    if (res.ok) await refreshVersions()
  }

  async function handleDelete(versionId: string) {
    if (!confirm('Xóa version này? Thao tác không thể hoàn tác.')) return
    const res = await fetch(`/api/admin/erp/timetable?versionId=${versionId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      await refreshVersions()
      if (viewingVersionId === versionId) {
        setViewingVersionId(null)
        setSlots([])
      }
    }
  }

  // Build grid data
  const viewingVersion = versions.find((v) => v.id === viewingVersionId)
  const filteredSlots = filterCourse
    ? slots.filter(
        (s) =>
          s.course?.name.toLowerCase().includes(filterCourse.toLowerCase()) ||
          s.course?.code.toLowerCase().includes(filterCourse.toLowerCase()) ||
          s.teacher?.name?.toLowerCase().includes(filterCourse.toLowerCase())
      )
    : slots

  const maxPeriod = Math.max(8, ...slots.map((s) => s.period))
  const PERIODS = Array.from({ length: maxPeriod }, (_, i) => i + 1)

  // Grid: day → period → slot[]
  const grid: Record<number, Record<number, SlotData[]>> = {}
  for (const s of filteredSlots) {
    if (!grid[s.dayOfWeek]) grid[s.dayOfWeek] = {}
    if (!grid[s.dayOfWeek][s.period]) grid[s.dayOfWeek][s.period] = []
    grid[s.dayOfWeek][s.period].push(s)
  }

  const uniqueCourses = [...new Set(slots.map((s) => s.course?.name ?? s.courseId))].filter(Boolean)

  return (
    <div>
      {/* ── Zone 1: Generate Panel ─────────────────────────────── */}
      <div
        className="rounded-3xl p-6 mb-6 text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, #29050F 0%, #4338ca 100%)' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="text-3xl">🤖</div>
          <div>
            <h2 className="text-lg font-black">Generate TKB với AI</h2>
            <p className="text-cherry-200 text-xs">
              AI tự động tạo thời khóa biểu tối ưu — không trùng GV, không trùng phòng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {/* Campus selector */}
          {campuses.length > 1 && (
            <div>
              <label className="text-cherry-200 text-xs font-bold mb-1 block">🏫 Campus</label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-gray-800"
                style={{ background: 'rgba(255,255,255,0.95)' }}
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Semester */}
          <div>
            <label className="text-cherry-200 text-xs font-bold mb-1 block">📅 Học kỳ</label>
            <input
              type="text"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              placeholder="HK1 2025-2026"
              className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-gray-800"
              style={{ background: 'rgba(255,255,255,0.95)' }}
            />
          </div>

          {/* Periods per day */}
          <div>
            <label className="text-cherry-200 text-xs font-bold mb-1 block">
              ⏱️ Tiết/ngày: <span className="text-white">{periodsPerDay}</span>
            </label>
            <input
              type="range"
              min={4}
              max={12}
              value={periodsPerDay}
              onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
          </div>

          {/* Days per week */}
          <div>
            <label className="text-cherry-200 text-xs font-bold mb-1 block">
              📆 Ngày/tuần: <span className="text-white">{daysPerWeek}</span>
            </label>
            <input
              type="range"
              min={3}
              max={6}
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
          </div>

          {/* Max periods per teacher */}
          <div>
            <label className="text-cherry-200 text-xs font-bold mb-1 block">
              👩‍🏫 Max tiết/GV/ngày: <span className="text-white">{maxPeriodsPerTeacher}</span>
            </label>
            <input
              type="range"
              min={2}
              max={8}
              value={maxPeriodsPerTeacher}
              onChange={(e) => setMaxPeriodsPerTeacher(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !campusId}
          className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: generating ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
          onMouseEnter={(e) => {
            if (!generating)
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)'
          }}
          onMouseLeave={(e) => {
            if (!generating)
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'
          }}
        >
          {generating ? (
            <>
              <span className="animate-spin inline-block">⚙️</span>
              {PROGRESS_STEPS[progressStep]}
            </>
          ) : (
            '🤖 Generate TKB với AI'
          )}
        </button>

        {/* Result */}
        {result && (
          <div
            className="mt-4 rounded-2xl px-5 py-3 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-black text-sm">
                Tạo xong! {result.slots} tiết — Điểm tối ưu: {result.score}/100 — Xung đột:{' '}
                {result.conflicts}
              </p>
              <p className="text-cherry-200 text-xs">
                Nhấn &quot;📊 Xem&quot; để xem chi tiết, &quot;✅ Publish&quot; để áp dụng
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mt-4 rounded-2xl px-5 py-3"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
          >
            <p className="font-bold text-sm">⚠️ Lỗi: {error}</p>
          </div>
        )}
      </div>

      {/* ── Zone 2: Version History ─────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-gray-800">📋 Lịch sử phiên bản</h3>
          <button
            onClick={refreshVersions}
            className="text-xs text-cherry-600 hover:text-cherry-800 font-bold transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>

        {versions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-400 text-sm">Chưa có phiên bản nào. Hãy generate TKB đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-4 rounded-2xl transition-all"
                style={{
                  background: viewingVersionId === v.id ? '#eef2ff' : '#f8fafc',
                  border: viewingVersionId === v.id ? '2px solid #6366f1' : '2px solid transparent',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div>
                    <p className="font-black text-sm text-gray-800 truncate">{v.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {statusBadge(v.status)}
                      {v.score != null && (
                        <span className="text-xs text-gray-500 font-semibold">
                          🎯 {v.score}/100
                        </span>
                      )}
                      {v.conflicts > 0 && (
                        <span className="text-xs text-red-600 font-semibold">
                          ⚠️ {v.conflicts} xung đột
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(v.generatedAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button
                    onClick={() => loadSlots(v.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    style={{ background: '#eef2ff', color: '#4338ca' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#F9CCD6')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#eef2ff')}
                  >
                    📊 Xem
                  </button>
                  {v.status !== 'published' && (
                    <button
                      onClick={() => handlePublish(v.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      style={{ background: '#dcfce7', color: '#166534' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#bbf7d0')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#dcfce7')}
                    >
                      ✅ Publish
                    </button>
                  )}
                  {v.status !== 'published' && (
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      style={{ background: '#fee2e2', color: '#991b1b' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#fecaca')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#fee2e2')}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Zone 3: Timetable Grid ─────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-base font-black text-gray-800">
              📅 Thời khóa biểu
              {viewingVersion && (
                <span className="ml-2 text-sm font-semibold text-cherry-600">
                  — {viewingVersion.name}
                </span>
              )}
            </h3>
          </div>

          {slots.length > 0 && (
            <input
              type="text"
              placeholder="Lọc theo lớp, GV..."
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:border-cherry-400 w-48"
            />
          )}
        </div>

        {!viewingVersionId || slots.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-4">📅</div>
            <h4 className="text-xl font-black text-gray-700 mb-2">Chưa có thời khóa biểu</h4>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Nhấn &quot;🤖 Generate TKB với AI&quot; ở trên để tạo thời khóa biểu tự động, hoặc chọn một
              phiên bản để xem.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {[
                { icon: '🚫', title: 'Không trùng GV' },
                { icon: '🏛️', title: 'Không trùng phòng' },
                { icon: '⚖️', title: 'Cân bằng tải' },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-gray-600"
                  style={{ background: '#f8fafc' }}
                >
                  <span>{f.icon}</span>
                  {f.title}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Legend */}
            {uniqueCourses.length > 0 && uniqueCourses.length <= 12 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[...new Set(slots.map((s) => s.courseId))].map((cId) => {
                  const c = slots.find((s) => s.courseId === cId)?.course
                  return (
                    <span
                      key={cId}
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ background: courseColor(cId) }}
                    >
                      {c?.code ?? cId.slice(0, 6)}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Grid */}
            <div className="overflow-auto">
              <table className="w-full text-xs min-w-max border-collapse">
                <thead>
                  <tr>
                    <th
                      className="text-left px-3 py-2.5 font-bold text-gray-500 uppercase text-xs"
                      style={{ width: 60, background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}
                    >
                      Tiết
                    </th>
                    {DAYS.slice(0, daysPerWeek).map((d, di) => (
                      <th
                        key={d}
                        className="px-3 py-2.5 font-black text-gray-700 text-center"
                        style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderLeft: '1px solid #e2e8f0' }}
                      >
                        {d}
                        <span className="block text-gray-400 font-normal text-xs">
                          ({(grid[di + 1] ? Object.values(grid[di + 1]).flat().length : 0)} tiết)
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((p) => (
                    <tr key={p} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td
                        className="px-3 py-2 font-bold text-gray-400 text-center"
                        style={{ background: '#fafafa' }}
                      >
                        {p}
                      </td>
                      {DAYS.slice(0, daysPerWeek).map((_, di) => {
                        const daySlots = grid[di + 1]?.[p] ?? []
                        return (
                          <td
                            key={di}
                            className="px-2 py-1.5 align-top"
                            style={{
                              borderLeft: '1px solid #f1f5f9',
                              minWidth: 120,
                              minHeight: 48,
                            }}
                          >
                            {daySlots.length === 0 ? (
                              <div
                                className="rounded-lg h-10 w-full"
                                style={{ background: '#f8fafc' }}
                              />
                            ) : (
                              <div className="space-y-1">
                                {daySlots.map((s) => (
                                  <div
                                    key={s.id}
                                    className="rounded-lg px-2 py-1 text-white"
                                    style={{
                                      background: courseColor(s.courseId),
                                      fontSize: 10,
                                    }}
                                    title={`${s.course?.name ?? s.courseId} | GV: ${s.teacher?.name ?? '—'} | Phòng: ${s.room?.name ?? '—'}`}
                                  >
                                    <div className="font-black truncate">
                                      {s.course?.code ?? s.courseId.slice(0, 6)}
                                    </div>
                                    {s.teacher?.name && (
                                      <div className="opacity-80 truncate">{s.teacher.name}</div>
                                    )}
                                    {s.room?.name && (
                                      <div className="opacity-70 truncate">🚪 {s.room.name}</div>
                                    )}
                                    {s.isLocked && (
                                      <span className="text-yellow-300 font-black">🔒</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
              <span>Tổng: {filteredSlots.length} tiết</span>
              {viewingVersion && viewingVersion.conflicts > 0 && (
                <span className="text-red-500 font-semibold">
                  ⚠️ {viewingVersion.conflicts} xung đột
                </span>
              )}
              {viewingVersion && (viewingVersion.score ?? 0) > 0 && (
                <span className="text-cherry-600 font-semibold">
                  🎯 Điểm tối ưu: {viewingVersion.score}/100
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
