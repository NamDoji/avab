'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Loader2, Brain, Users, Calendar, ChevronRight, X, Check, RefreshCw, Edit2, Trash2, MessageSquare } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface Student { id: string; name: string | null; phone: string; enrollmentId: string }
interface Subject { id: string; name: string; icon: string | null; courseId: string; course: { id: string; name: string; paymentType: string } }
interface FeedbackSummary { id: string; sessionDate: string; sessionNote: string | null; totalStudents: number; presentCount: number; aiGeneratedCount: number; createdAt: string }
interface SessionRecord {
  id: string; feedbackId: string; userId: string
  attendance: boolean
  focusLevel: number | null; participationLevel: number | null; speakingCount: number | null
  answerQuality: number | null; comprehension: number | null; discipline: number | null
  observation: number | null; comparison: number | null; classification: number | null
  patternRecognition: number | null; expression: number | null
  emotionState: string | null; teacherNote: string | null
  aiComment: string | null; aiCommentAt: string | null
  hwScore: number | null; hwCorrect: number | null; hwTotal: number | null
  user: { id: string; name: string | null; phone: string; avatar: string | null }
}

// ── Rating Button ───────────────────────────────────────────────────────────

const RATING_EMOJIS = ['', '😞', '😐', '🙂', '😊', '🌟']
const RATING_COLORS = ['', 'bg-red-50 text-red-600 border-red-200', 'bg-orange-50 text-orange-600 border-orange-200', 'bg-yellow-50 text-yellow-700 border-yellow-200', 'bg-green-50 text-green-700 border-green-200', 'bg-teal-50 text-teal-700 border-teal-200']

function RatingButtons({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`w-7 h-7 rounded-lg border text-sm flex items-center justify-center transition-all ${
            value === n ? RATING_COLORS[n] + ' border font-bold scale-110' : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-400'
          }`}
          title={`${n}/5`}
        >
          {value === n ? RATING_EMOJIS[n] : n}
        </button>
      ))}
    </div>
  )
}

const EMOTION_OPTIONS = [
  { value: 'great', emoji: '🤩', label: 'Hứng khởi' },
  { value: 'good', emoji: '😊', label: 'Vui' },
  { value: 'neutral', emoji: '😐', label: 'Bình thường' },
  { value: 'tired', emoji: '😴', label: 'Mệt mỏi' },
  { value: 'frustrated', emoji: '😤', label: 'Chán' },
]

// ── Drawer chi tiết học sinh ───────────────────────────────────────────────

function StudentDrawer({
  record, onClose, onSave, onAI, aiLoading,
}: {
  record: SessionRecord
  onClose: () => void
  onSave: (userId: string, data: Partial<SessionRecord>) => Promise<void>
  onAI: (userId: string) => Promise<void>
  aiLoading: boolean
}) {
  const [form, setForm] = useState<Partial<SessionRecord>>(record)
  const [saving, setSaving] = useState(false)
  const [aiComment, setAiComment] = useState(record.aiComment ?? '')

  const set = (key: keyof SessionRecord, val: any) => setForm(f => ({ ...f, [key]: val }))

  // Khi AI sinh xong, cập nhật cả local state VÀ form (fix bug: Lưu overwrite aiComment = null)
  useEffect(() => {
    const comment = record.aiComment ?? ''
    setAiComment(comment)
    setForm(f => ({ ...f, aiComment: record.aiComment ?? f.aiComment ?? null }))
  }, [record.aiComment])

  const save = async () => {
    setSaving(true)
    // Luôn dùng giá trị mới nhất của aiComment (tránh stale form)
    await onSave(record.userId, { ...form, aiComment: aiComment || form.aiComment || null })
    setSaving(false)
  }

  const handleAI = async () => {
    await onAI(record.userId)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shrink-0">
          <button onClick={onClose} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition">
            <X size={16} />
          </button>
          <div className="flex-1">
            <p className="font-black text-base">{record.user.name ?? 'Học sinh'}</p>
            <p className="text-white/70 text-xs">{record.user.phone}</p>
          </div>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 bg-white text-purple-700 font-bold px-3 py-1.5 rounded-xl text-sm hover:bg-purple-50 transition disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Lưu
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* BTVN buổi trước (auto) */}
          {record.hwScore !== null && (
            <div className="mx-4 mt-4 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
              <p className="text-xs font-bold text-blue-600 mb-1">📚 BTVN buổi trước (tự động)</p>
              <div className="flex gap-4 text-sm">
                <span className={`font-black text-lg ${record.hwScore >= 80 ? 'text-teal-600' : record.hwScore >= 60 ? 'text-orange-500' : 'text-red-500'}`}>{record.hwScore}%</span>
                <span className="text-gray-500">{record.hwCorrect}/{record.hwTotal} câu đúng</span>
              </div>
            </div>
          )}

          <div className="p-4 space-y-5">
            {/* Có mặt */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">👤 Chuyên cần</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => set('attendance', true)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition ${form.attendance ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                  ✅ Có mặt
                </button>
                <button type="button" onClick={() => set('attendance', false)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition ${!form.attendance ? 'bg-red-50 border-red-400 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                  ❌ Vắng
                </button>
              </div>
            </div>

            {form.attendance && (
              <>
                {/* Ma trận đánh giá */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">📊 Đánh giá trong buổi học</p>
                  <div className="space-y-3">
                    {([
                      { key: 'focusLevel', label: '🧠 Tập trung' },
                      { key: 'participationLevel', label: '🙋 Tham gia' },
                      { key: 'answerQuality', label: '💬 Trả lời câu hỏi' },
                      { key: 'comprehension', label: '📖 Hiểu bài' },
                      { key: 'discipline', label: '⭐ Ý thức học tập' },
                    ] as const).map(item => (
                      <div key={item.key} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-700 w-36 shrink-0">{item.label}</span>
                        <RatingButtons value={(form as any)[item.key]} onChange={v => set(item.key as keyof SessionRecord, v)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Số lần phát biểu */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">🗣️ Số lần phát biểu</label>
                  <div className="flex gap-2 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6, 7, '8+'].map(n => (
                      <button key={n} type="button"
                        onClick={() => set('speakingCount', n === '8+' ? 8 : Number(n))}
                        className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition ${
                          form.speakingCount === (n === '8+' ? 8 : Number(n))
                            ? 'bg-purple-100 border-purple-400 text-purple-700'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-purple-200'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </div>

                {/* Kỹ năng tư duy */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🔬 Kỹ năng tư duy</p>
                  <div className="space-y-3">
                    {([
                      { key: 'observation', label: '👁️ Quan sát' },
                      { key: 'comparison', label: '⚖️ So sánh' },
                      { key: 'classification', label: '🗂️ Phân loại' },
                      { key: 'patternRecognition', label: '🔄 Quy luật' },
                      { key: 'expression', label: '💡 Diễn đạt' },
                    ] as const).map(item => (
                      <div key={item.key} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-700 w-36 shrink-0">{item.label}</span>
                        <RatingButtons value={(form as any)[item.key]} onChange={v => set(item.key as keyof SessionRecord, v)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cảm xúc */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">😊 Cảm xúc / Thái độ</p>
                  <div className="flex gap-2 flex-wrap">
                    {EMOTION_OPTIONS.map(e => (
                      <button key={e.value} type="button"
                        onClick={() => set('emotionState', form.emotionState === e.value ? null : e.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition ${
                          form.emotionState === e.value
                            ? 'bg-purple-50 border-purple-400 text-purple-700'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-purple-200'
                        }`}
                      >
                        <span className="text-lg">{e.emoji}</span>
                        <span className="hidden sm:inline">{e.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ghi chú GV */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">📝 Ghi chú giáo viên</label>
                  <textarea rows={3} placeholder="Quan sát thêm về học sinh trong buổi này..."
                    value={form.teacherNote ?? ''}
                    onChange={e => set('teacherNote', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  />
                </div>
              </>
            )}

            {/* AI Nhận xét */}
            <div className="border-t border-gray-100 pt-4" id="ai-comment-section">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">🤖 Nhận xét AI
                  <span className="ml-2 font-normal text-gray-400 normal-case">(AI tự tạo — GV sửa trước khi gửi PH)</span>
                </p>
                <button onClick={handleAI} disabled={aiLoading}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
                  {aiLoading ? <><Loader2 size={12} className="animate-spin" /> Đang sinh...</> : <><Brain size={12} /> Sinh AI</>}
                </button>
              </div>
              {record.aiComment ? (
                <div className="space-y-2">
                  <textarea
                    rows={10}
                    value={aiComment}
                    onChange={e => {
                      setAiComment(e.target.value)
                      set('aiComment', e.target.value) // cập nhật form ngay khi gõ
                    }}
                    className="w-full border border-purple-200 bg-purple-50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  />
                  <p className="text-xs text-gray-400">Giáo viên có thể chỉnh sửa trước khi gửi phụ huynh</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl px-4 py-6 text-center text-gray-400 text-sm">
                  Bấm "Sinh AI" để tạo nhận xét tự động từ dữ liệu buổi học
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function SubjectFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: subjectId } = use(params)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackSummary[]>([])
  const [loading, setLoading] = useState(true)
  // Current session
  const [currentFeedback, setCurrentFeedback] = useState<{ id: string; sessionDate: string; sessionNote: string | null } | null>(null)
  const [records, setRecords] = useState<SessionRecord[]>([])
  const [sessionLoading, setSessionLoading] = useState(false)
  // Drawer
  const [drawerRecord, setDrawerRecord] = useState<SessionRecord | null>(null)
  // AI
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [aiAllLoading, setAiAllLoading] = useState(false)
  // New session modal
  const [showNewSession, setShowNewSession] = useState(false)
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newNote, setNewNote] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/subjects/${subjectId}/feedback`)
    const data = await res.json()
    if (data.success) {
      setSubject(data.data.subject)
      setStudents(data.data.students)
      setFeedbacks(data.data.feedbacks)
      // Auto-load latest session
      if (data.data.feedbacks.length > 0 && !currentFeedback) {
        await loadSession(data.data.feedbacks[0].id)
      }
    }
    setLoading(false)
  }, [subjectId])

  useEffect(() => { load() }, [load])

  const loadSession = async (feedbackId: string) => {
    setSessionLoading(true)
    const res = await fetch(`/api/admin/subjects/${subjectId}/feedback/${feedbackId}`)
    const data = await res.json()
    if (data.success) {
      setCurrentFeedback({ id: feedbackId, sessionDate: data.data.feedback.sessionDate, sessionNote: data.data.feedback.sessionNote })
      setRecords(data.data.feedback.records)
    }
    setSessionLoading(false)
  }

  const handleCreateSession = async () => {
    if (students.length === 0) return
    setCreating(true)
    const res = await fetch(`/api/admin/subjects/${subjectId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionDate: newDate, sessionNote: newNote, studentIds: students.map(s => s.id) }),
    })
    const data = await res.json()
    if (data.success) {
      setShowNewSession(false)
      setNewNote('')
      await load()
      await loadSession(data.data.feedbackId)
    }
    setCreating(false)
  }

  const handleSaveRecord = async (userId: string, updateData: Partial<SessionRecord>) => {
    const res = await fetch(`/api/admin/subjects/${subjectId}/feedback/${currentFeedback!.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updateData }),
    })
    const data = await res.json()
    if (data.success) {
      setRecords(prev => prev.map(r => r.userId === userId ? { ...r, ...data.data } : r))
      // Update drawer record too
      if (drawerRecord?.userId === userId) setDrawerRecord(prev => prev ? { ...prev, ...data.data } : null)
    }
  }

  const handleAIGenerate = async (userId: string | null) => {
    if (!currentFeedback) return
    if (userId) {
      setAiLoading(prev => ({ ...prev, [userId]: true }))
    } else {
      setAiAllLoading(true)
    }

    const res = await fetch(`/api/admin/subjects/${subjectId}/feedback/${currentFeedback.id}/ai-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (data.success) {
      setRecords(prev => prev.map(r => {
        if (data.data[r.userId]) return { ...r, aiComment: data.data[r.userId], aiCommentAt: new Date().toISOString() }
        return r
      }))
      // Update drawer if open
      if (drawerRecord && data.data[drawerRecord.userId]) {
        setDrawerRecord(prev => prev ? { ...prev, aiComment: data.data[prev.userId], aiCommentAt: new Date().toISOString() } : null)
      }
    }
    if (userId) setAiLoading(prev => ({ ...prev, [userId]: false }))
    else setAiAllLoading(false)
  }

  const handleDeleteSession = async (feedbackId: string) => {
    if (!confirm('Xóa buổi nhận xét này?')) return
    await fetch(`/api/admin/subjects/${subjectId}/feedback/${feedbackId}`, { method: 'DELETE' })
    if (currentFeedback?.id === feedbackId) { setCurrentFeedback(null); setRecords([]) }
    setFeedbacks(prev => prev.filter(f => f.id !== feedbackId))
  }

  // Quick update từ matrix table (không mở drawer)
  const quickUpdate = async (userId: string, key: string, value: any) => {
    await handleSaveRecord(userId, { [key]: value } as any)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="animate-spin mr-2" />Đang tải...</div>
  if (!subject) return <div className="min-h-screen flex items-center justify-center text-red-500">Không tìm thấy chuyên đề</div>

  const isPERSESSION = subject.course.paymentType === 'PER_SESSION'

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-16">
      {/* Header — sticky BELOW main navbar (top-16) */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/admin/courses/${subject.course.id}`}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition">
            <ArrowLeft size={16} /> {subject.course.name}
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-sm text-gray-500">{subject.icon} {subject.name}</span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-sm font-semibold text-gray-800">Nhận xét</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Top: Session selector + tạo mới */}
        <div className="flex flex-wrap items-start gap-4 mb-5">
          {/* Danh sách buổi */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-black text-gray-900 text-lg">{subject.icon} {subject.name}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPERSESSION ? 'bg-teal-50 text-teal-700' : 'bg-purple-50 text-purple-700'}`}>
                {isPERSESSION ? '🗓️ Theo buổi' : '🎓 Trọn gói'}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {feedbacks.map(f => (
                <div key={f.id}
                  onClick={() => loadSession(f.id)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition ${
                    currentFeedback?.id === f.id ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-gray-700">{new Date(f.sessionDate).toLocaleDateString('vi-VN')}</p>
                    <p className="text-xs text-gray-400">{f.presentCount}/{f.totalStudents} hs · {f.aiGeneratedCount} nhận xét</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDeleteSession(f.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition text-gray-300">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {feedbacks.length === 0 && (
                <p className="text-sm text-gray-400">Chưa có buổi nhận xét nào</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            {currentFeedback && (
              <button onClick={() => handleAIGenerate(null)} disabled={aiAllLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition">
                {aiAllLoading ? <><Loader2 size={14} className="animate-spin" /> Đang sinh...</> : <><Brain size={14} /> Sinh AI (tất cả)</>}
              </button>
            )}
            <button onClick={() => setShowNewSession(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition">
              <Plus size={14} /> Buổi mới
            </button>
          </div>
        </div>

        {/* Matrix table */}
        {sessionLoading ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" /> Đang tải buổi học...
          </div>
        ) : currentFeedback && records.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Session info bar */}
            <div className="flex items-center gap-4 px-4 py-3 bg-purple-50 border-b border-purple-100 flex-wrap">
              <Calendar size={14} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">
                Buổi ngày {new Date(currentFeedback.sessionDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <span className="text-xs text-gray-500">{records.filter(r => r.attendance).length}/{records.length} có mặt</span>
              <span className="text-xs text-gray-500">· {records.filter(r => r.aiComment).length}/{records.length} nhận xét AI</span>
              <span className="text-xs text-gray-400 border-l border-purple-200 pl-4 hidden sm:inline">
                💡 Đánh giá nhanh trên bảng • Click ✨“Sinh nhận xét” để AI tự tạo • Click “Xem/Sửa” để đọc đầy đủ • Click ✏️ để mở chi tiết
              </span>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 sticky left-0 bg-gray-50 z-10 min-w-[160px]">Học sinh</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">✅ Có mặt</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">🧠 Tập trung</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">🙋 Tham gia</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">🗣️ Phát biểu</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">💬 Trả lời</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">📖 Hiểu bài</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">⭐ Ý thức</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">📚 BTVN</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">😊 Cảm xúc</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">🤖 Nhận xét AI</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 whitespace-nowrap">✏️ Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map(record => (
                    <tr key={record.userId} className={`hover:bg-gray-50 transition ${!record.attendance ? 'opacity-50' : ''}`}>
                      {/* Tên học sinh */}
                      <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                        <p className="font-semibold text-gray-800 text-sm">{record.user.name ?? 'N/A'}</p>
                        <p className="text-xs text-gray-400">{record.user.phone}</p>
                      </td>
                      {/* Có mặt toggle */}
                      <td className="px-2 py-2.5 text-center">
                        <button onClick={() => quickUpdate(record.userId, 'attendance', !record.attendance)}
                          className={`w-8 h-8 rounded-lg font-bold text-base transition ${record.attendance ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}>
                          {record.attendance ? '✅' : '❌'}
                        </button>
                      </td>
                      {/* Tập trung */}
                      <td className="px-2 py-2.5 text-center">
                        <CompactRating value={record.focusLevel} onChange={v => quickUpdate(record.userId, 'focusLevel', v)} />
                      </td>
                      {/* Tham gia */}
                      <td className="px-2 py-2.5 text-center">
                        <CompactRating value={record.participationLevel} onChange={v => quickUpdate(record.userId, 'participationLevel', v)} />
                      </td>
                      {/* Phát biểu */}
                      <td className="px-2 py-2.5 text-center">
                        <span className={`inline-block w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${
                          record.speakingCount !== null ? 'bg-purple-50 text-purple-700' : 'text-gray-300'
                        }`}>{record.speakingCount ?? '—'}</span>
                      </td>
                      {/* Trả lời */}
                      <td className="px-2 py-2.5 text-center">
                        <CompactRating value={record.answerQuality} onChange={v => quickUpdate(record.userId, 'answerQuality', v)} />
                      </td>
                      {/* Hiểu bài */}
                      <td className="px-2 py-2.5 text-center">
                        <CompactRating value={record.comprehension} onChange={v => quickUpdate(record.userId, 'comprehension', v)} />
                      </td>
                      {/* Ý thức */}
                      <td className="px-2 py-2.5 text-center">
                        <CompactRating value={record.discipline} onChange={v => quickUpdate(record.userId, 'discipline', v)} />
                      </td>
                      {/* BTVN */}
                      <td className="px-2 py-2.5 text-center">
                        {record.hwScore !== null ? (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            record.hwScore >= 80 ? 'bg-teal-50 text-teal-700' :
                            record.hwScore >= 60 ? 'bg-orange-50 text-orange-600' :
                            'bg-red-50 text-red-600'
                          }`}>{record.hwScore}%</span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      {/* Cảm xúc */}
                      <td className="px-2 py-2.5 text-center">
                        {record.emotionState
                          ? <span className="text-xl">{EMOTION_OPTIONS.find(e => e.value === record.emotionState)?.emoji}</span>
                          : <span className="text-gray-300 text-lg">—</span>}
                      </td>
                      {/* AI status */}
                      <td className="px-2 py-2.5 text-center">
                        {record.aiComment ? (
                          <button
                            onClick={() => setDrawerRecord(record)}
                            title="Click để xem / sửa nhận xét AI"
                            className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-semibold hover:bg-violet-100 transition">
                            ✓ Xem / Sửa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAIGenerate(record.userId)}
                            disabled={!!aiLoading[record.userId]}
                            title="Sinh nhận xét AI tự động cho học sinh này"
                            className="text-xs text-violet-600 hover:text-white hover:bg-violet-600 transition px-2.5 py-1 rounded-full border border-violet-300 hover:border-violet-600 font-semibold">
                            {aiLoading[record.userId]
                              ? <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Đang sinh...</span>
                              : '🤖 Sinh nhận xét'}
                          </button>
                        )}
                      </td>
                      {/* Chi tiết */}
                      <td className="px-2 py-2.5 text-center">
                        <button onClick={() => setDrawerRecord(record)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition">
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !currentFeedback ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-semibold mb-2">Chưa có buổi nhận xét</p>
            <p className="text-gray-400 text-sm mb-5">Tạo buổi mới để bắt đầu theo dõi học sinh</p>
            <button onClick={() => setShowNewSession(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition">
              + Tạo buổi nhận xét đầu tiên
            </button>
          </div>
        ) : null}
      </div>

      {/* Modal tạo buổi mới */}
      {showNewSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-black text-gray-900">📅 Tạo buổi nhận xét mới</h2>
              <button onClick={() => setShowNewSession(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày học</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú buổi học (tuỳ chọn)</label>
                <textarea rows={2} placeholder="VD: Ôn tập chương 3 — Toán đếm và phân loại"
                  value={newNote} onChange={e => setNewNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
              </div>
              <p className="text-xs text-gray-400">Sẽ tự động thêm {students.length} học sinh vào buổi này và load điểm BTVN gần nhất.</p>
              <div className="flex gap-3">
                <button onClick={handleCreateSession} disabled={creating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition">
                  {creating ? 'Đang tạo...' : '✅ Tạo buổi'}
                </button>
                <button onClick={() => setShowNewSession(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Huỷ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer chi tiết học sinh */}
      {drawerRecord && (
        <StudentDrawer
          record={drawerRecord}
          onClose={() => setDrawerRecord(null)}
          onSave={handleSaveRecord}
          onAI={handleAIGenerate}
          aiLoading={!!aiLoading[drawerRecord.userId]}
        />
      )}
    </main>
  )
}

// Compact rating cho table row
function CompactRating({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex justify-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`w-5 h-5 rounded text-[10px] font-bold transition ${
            value !== null && n <= value
              ? RATING_COLORS[value].split(' ')[0] + ' ' + RATING_COLORS[value].split(' ')[1]
              : 'bg-gray-100 text-gray-300'
          } ${value === n ? 'scale-125' : ''}`}
        >●</button>
      ))}
    </div>
  )
}
