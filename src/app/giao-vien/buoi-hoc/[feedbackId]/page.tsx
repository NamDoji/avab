'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Brain, Calendar, X, Check, Edit2, MessageSquare } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface Subject { id: string; name: string; icon: string | null; courseId: string; course: { id: string; name: string; paymentType: string } }
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
interface FeedbackDetail {
  id: string; sessionDate: string; sessionNote: string | null; subjectId: string
  subject: Subject
  records: SessionRecord[]
}

// ── Rating Button ───────────────────────────────────────────────────────────

const RATING_EMOJIS = ['', '😞', '😐', '🙂', '😊', '🌟']
const RATING_COLORS = ['', 'bg-red-50 text-red-600 border-red-200', 'bg-orange-50 text-orange-600 border-orange-200', 'bg-yellow-50 text-yellow-700 border-yellow-200', 'bg-green-50 text-green-700 border-green-200', 'bg-teal-50 text-teal-700 border-teal-200']

function RatingButtons({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg border text-sm flex items-center justify-center transition-all ${
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
  const SAVEABLE_FIELDS: (keyof SessionRecord)[] = [
    'attendance', 'focusLevel', 'participationLevel', 'speakingCount',
    'answerQuality', 'comprehension', 'discipline',
    'observation', 'comparison', 'classification', 'patternRecognition', 'expression',
    'emotionState', 'teacherNote', 'aiComment',
  ]
  const initForm = () => Object.fromEntries(
    SAVEABLE_FIELDS.map(k => [k, (record as any)[k] ?? null])
  ) as Partial<SessionRecord>

  const [form, setForm] = useState<Partial<SessionRecord>>(initForm)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [aiComment, setAiComment] = useState(record.aiComment ?? '')

  const set = (key: keyof SessionRecord, val: any) => setForm(f => ({ ...f, [key]: val }))

  useEffect(() => {
    const comment = record.aiComment ?? ''
    setAiComment(comment)
    setForm(f => ({ ...f, aiComment: record.aiComment ?? f.aiComment ?? null }))
  }, [record.aiComment])

  const save = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      await onSave(record.userId, { ...form, aiComment: aiComment || form.aiComment || null })
      setSaveStatus('ok')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full sm:max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gradient-to-r from-teal-500 to-teal-600 text-white shrink-0">
          <button onClick={onClose} className="p-2.5 bg-white/20 rounded-lg hover:bg-white/30 transition min-w-[40px] min-h-[40px] flex items-center justify-center">
            <X size={16} />
          </button>
          <div className="flex-1">
            <p className="font-black text-base">{record.user.name ?? 'Học sinh'}</p>
            <p className="text-white/70 text-xs">{record.user.phone}</p>
          </div>
          <button onClick={save} disabled={saving}
            className={`flex items-center gap-1.5 font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-60 min-h-[44px] ${
              saveStatus === 'ok' ? 'bg-green-500 text-white' :
              saveStatus === 'error' ? 'bg-red-500 text-white' :
              'bg-white text-teal-700 hover:bg-teal-50'
            }`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> :
             saveStatus === 'ok' ? <Check size={14} /> :
             saveStatus === 'error' ? <X size={14} /> :
             <Check size={14} />}
            {saving ? 'Đang lưu...' : saveStatus === 'ok' ? 'Đã lưu!' : saveStatus === 'error' ? 'Lỗi!' : 'Lưu'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* BTVN */}
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
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition min-h-[48px] ${form.attendance ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                  ✅ Có mặt
                </button>
                <button type="button" onClick={() => set('attendance', false)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition min-h-[48px] ${!form.attendance ? 'bg-red-50 border-red-400 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                  ❌ Vắng
                </button>
              </div>
            </div>

            {form.attendance && (
              <>
                {/* Đánh giá */}
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
                        className={`w-11 h-11 rounded-xl border-2 font-bold text-sm transition ${
                          form.speakingCount === (n === '8+' ? 8 : Number(n))
                            ? 'bg-teal-100 border-teal-400 text-teal-700'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-teal-200'
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
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition min-h-[44px] ${
                          form.emotionState === e.value
                            ? 'bg-teal-50 border-teal-400 text-teal-700'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-teal-200'
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
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                  />
                </div>
              </>
            )}

            {/* AI Nhận xét */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">🤖 Nhận xét AI
                  <span className="ml-2 font-normal text-gray-400 normal-case">(GV sửa trước khi gửi PH)</span>
                </p>
                <button onClick={() => onAI(record.userId)} disabled={aiLoading}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition min-h-[40px]">
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
                      set('aiComment', e.target.value)
                    }}
                    className="w-full border border-teal-200 bg-teal-50 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                  />
                  <p className="text-xs text-gray-400">Giáo viên có thể chỉnh sửa trước khi gửi phụ huynh</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl px-4 py-6 text-center text-gray-400 text-sm">
                  Bấm &quot;Sinh AI&quot; để tạo nhận xét tự động từ dữ liệu buổi học
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

export default function TeacherFeedbackPage({ params }: { params: Promise<{ feedbackId: string }> }) {
  const { feedbackId } = use(params)

  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null)
  const [records, setRecords] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerRecord, setDrawerRecord] = useState<SessionRecord | null>(null)
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [aiAllLoading, setAiAllLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/teacher/sessions/${feedbackId}`)
    const data = await res.json()
    if (data.success) {
      setFeedback(data.data.feedback)
      setRecords(data.data.feedback.records)
    } else {
      setError(data.error ?? 'Không tìm thấy buổi học')
    }
    setLoading(false)
  }, [feedbackId])

  useEffect(() => { load() }, [load])

  const handleSaveRecord = async (userId: string, updateData: Partial<SessionRecord>) => {
    const res = await fetch(`/api/teacher/sessions/${feedbackId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updateData }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Lưu thất bại')
    setRecords(prev => prev.map(r => r.userId === userId ? { ...r, ...data.data } : r))
    if (drawerRecord?.userId === userId) setDrawerRecord(prev => prev ? { ...prev, ...data.data } : null)
  }

  const handleAIGenerate = async (userId: string | null) => {
    if (!feedback) return
    if (userId) setAiLoading(prev => ({ ...prev, [userId]: true }))
    else setAiAllLoading(true)

    const res = await fetch(
      `/api/admin/subjects/${feedback.subjectId}/feedback/${feedbackId}/ai-generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }
    )
    const data = await res.json()
    if (data.success) {
      setRecords(prev => prev.map(r => {
        if (data.data[r.userId]) return { ...r, aiComment: data.data[r.userId], aiCommentAt: new Date().toISOString() }
        return r
      }))
      if (drawerRecord && data.data[drawerRecord.userId]) {
        setDrawerRecord(prev => prev ? { ...prev, aiComment: data.data[prev.userId], aiCommentAt: new Date().toISOString() } : null)
      }
    }
    if (userId) setAiLoading(prev => ({ ...prev, [userId]: false }))
    else setAiAllLoading(false)
  }

  const quickUpdate = async (userId: string, key: string, value: any) => {
    await handleSaveRecord(userId, { [key]: value } as any)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin mr-2" />Đang tải...
    </div>
  )
  if (error || !feedback) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      {error ?? 'Không tìm thấy buổi học'}
    </div>
  )

  const sessionDate = new Date(feedback.sessionDate).toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/giao-vien/buoi-hoc"
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition">
            <ArrowLeft size={16} /> Buổi học
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800">
            {feedback.subject.icon} {feedback.subject.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Session info + AI all */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="font-black text-gray-900 text-lg">{feedback.subject.icon} {feedback.subject.name}</h1>
            <p className="text-sm text-gray-500 capitalize">{sessionDate}</p>
            {feedback.sessionNote && (
              <p className="text-xs text-gray-400 mt-0.5">{feedback.sessionNote}</p>
            )}
          </div>
          <button
            onClick={() => handleAIGenerate(null)}
            disabled={aiAllLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md"
          >
            {aiAllLoading
              ? <><Loader2 size={14} className="animate-spin" /> Đang sinh cả lớp...</>
              : <><Brain size={14} /> 🤖 Sinh nhận xét cả lớp</>}
          </button>
        </div>

        {/* Matrix table */}
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-semibold">Buổi học này chưa có học sinh</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Info bar */}
            <div className="flex items-center gap-4 px-4 py-3 bg-teal-50 border-b border-teal-100 flex-wrap">
              <Calendar size={14} className="text-teal-600" />
              <span className="text-sm font-semibold text-teal-700 capitalize">{sessionDate}</span>
              <span className="text-xs text-gray-500">{records.filter(r => r.attendance).length}/{records.length} có mặt</span>
              <span className="text-xs text-gray-500">· {records.filter(r => r.aiComment).length}/{records.length} nhận xét AI</span>
              <span className="text-xs text-gray-400 border-l border-teal-200 pl-4 hidden sm:inline">
                💡 Đánh giá nhanh trên bảng • Click ✏️ để mở chi tiết học sinh
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 sticky left-0 bg-gray-50 z-10 min-w-[160px]">Học sinh</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">✅ Có mặt</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">🧠 Tập trung</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">🙋 Tham gia</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">🗣️ Phát biểu</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">💬 Trả lời</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">📖 Hiểu bài</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">⭐ Ý thức</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">📚 BTVN</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">😊 Cảm xúc</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">🤖 Nhận xét AI</th>
                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500">✏️ Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map(record => (
                    <tr key={record.userId} className={`hover:bg-gray-50 transition ${!record.attendance ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                        <p className="font-semibold text-gray-800 text-sm">{record.user.name ?? 'N/A'}</p>
                        <p className="text-xs text-gray-400">{record.user.phone}</p>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button onClick={() => quickUpdate(record.userId, 'attendance', !record.attendance)}
                          className={`w-8 h-8 rounded-lg font-bold text-base transition ${record.attendance ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}>
                          {record.attendance ? '✅' : '❌'}
                        </button>
                      </td>
                      <td className="px-2 py-2.5 text-center"><CompactRating value={record.focusLevel} onChange={v => quickUpdate(record.userId, 'focusLevel', v)} /></td>
                      <td className="px-2 py-2.5 text-center"><CompactRating value={record.participationLevel} onChange={v => quickUpdate(record.userId, 'participationLevel', v)} /></td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={`inline-flex w-8 h-8 rounded-lg text-sm font-bold items-center justify-center ${record.speakingCount !== null ? 'bg-teal-50 text-teal-700' : 'text-gray-300'}`}>
                          {record.speakingCount ?? '—'}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center"><CompactRating value={record.answerQuality} onChange={v => quickUpdate(record.userId, 'answerQuality', v)} /></td>
                      <td className="px-2 py-2.5 text-center"><CompactRating value={record.comprehension} onChange={v => quickUpdate(record.userId, 'comprehension', v)} /></td>
                      <td className="px-2 py-2.5 text-center"><CompactRating value={record.discipline} onChange={v => quickUpdate(record.userId, 'discipline', v)} /></td>
                      <td className="px-2 py-2.5 text-center">
                        {record.hwScore !== null ? (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${record.hwScore >= 80 ? 'bg-teal-50 text-teal-700' : record.hwScore >= 60 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                            {record.hwScore}%
                          </span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        {record.emotionState
                          ? <span className="text-xl">{EMOTION_OPTIONS.find(e => e.value === record.emotionState)?.emoji}</span>
                          : <span className="text-gray-300 text-lg">—</span>}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        {record.aiComment ? (
                          <button onClick={() => setDrawerRecord(record)}
                            className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-semibold hover:bg-teal-100 transition">
                            ✓ Xem / Sửa
                          </button>
                        ) : (
                          <button onClick={() => handleAIGenerate(record.userId)} disabled={!!aiLoading[record.userId]}
                            className="text-xs text-teal-600 hover:text-white hover:bg-teal-600 transition px-2.5 py-1 rounded-full border border-teal-300 hover:border-teal-600 font-semibold">
                            {aiLoading[record.userId]
                              ? <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Đang sinh...</span>
                              : '🤖 Sinh nhận xét'}
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button onClick={() => setDrawerRecord(record)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
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

// Compact rating
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
