'use client'

import { useState, useEffect } from 'react'
import { User, Target, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react'

interface Profile {
  backgroundLevel: string
  learningStyle: string
  selfStudyCapacity: string
  parentInvolvement: string
  weeklyHours: number
  targetSchool: string | null
  targetDate: string | null
  targetGoal: string
  additionalNotes: string | null
}

const BG_LEVELS = [
  { value: 'BEGINNER', label: 'Mới bắt đầu', desc: 'Con chưa từng luyện thi học bổng' },
  { value: 'INTERMEDIATE', label: 'Trung bình', desc: 'Đã học và luyện được vài tháng' },
  { value: 'ADVANCED', label: 'Khá tốt', desc: 'Đã quen với các dạng toán tư duy' },
]
const STYLES = [
  { value: 'VISUAL', label: '🎨 Trực quan', desc: 'Học tốt qua hình ảnh, sơ đồ' },
  { value: 'READING', label: '📖 Đọc hiểu', desc: 'Học tốt qua văn bản, lý thuyết' },
  { value: 'KINESTHETIC', label: '✋ Thực hành', desc: 'Học tốt khi tự làm, tự khám phá' },
  { value: 'MIXED', label: '🔀 Đa dạng', desc: 'Kết hợp nhiều cách' },
]
const CAPACITIES = [
  { value: 'LOW', label: 'Thấp', desc: 'Cần hướng dẫn từng bước', color: 'text-red-600 bg-red-50' },
  { value: 'MEDIUM', label: 'Trung bình', desc: 'Có thể tự học một phần', color: 'text-orange-600 bg-orange-50' },
  { value: 'HIGH', label: 'Cao', desc: 'Chủ động, tự giác học tập', color: 'text-green-600 bg-green-50' },
]
const PARENT_LEVELS = [
  { value: 'LOW', label: 'Ít', desc: 'Ít có thời gian đồng hành' },
  { value: 'MEDIUM', label: 'Vừa phải', desc: 'Hỗ trợ khi con cần' },
  { value: 'HIGH', label: 'Cao', desc: 'Học và kiểm tra cùng con mỗi ngày' },
]
const GOALS = [
  { value: 'SCHOLARSHIP', label: '🏆 Học bổng / Trường CLC', desc: 'Đỗ vào trường chất lượng cao lớp 1' },
  { value: 'FOUNDATION', label: '🌱 Củng cố nền tảng', desc: 'Xây dựng tư duy toán vững chắc' },
  { value: 'ADVANCED', label: '🚀 Nâng cao', desc: 'Chuẩn bị cho các kỳ thi quốc tế' },
]

export function LearnerProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Partial<Profile>>({})
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/ai/profile').then(r => r.json()).then(d => {
      if (d.success) {
        setProfile(d.data)
        if (!d.data) setEditing(true) // Chưa có profile → mở form ngay
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const openEdit = () => {
    setForm({
      backgroundLevel: profile?.backgroundLevel ?? 'BEGINNER',
      learningStyle: profile?.learningStyle ?? 'MIXED',
      selfStudyCapacity: profile?.selfStudyCapacity ?? 'MEDIUM',
      parentInvolvement: profile?.parentInvolvement ?? 'MEDIUM',
      weeklyHours: profile?.weeklyHours ?? 5,
      targetSchool: profile?.targetSchool ?? '',
      targetDate: profile?.targetDate ? profile.targetDate.slice(0, 10) : '',
      targetGoal: profile?.targetGoal ?? 'SCHOLARSHIP',
      additionalNotes: profile?.additionalNotes ?? '',
    })
    setEditing(true)
    setExpanded(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/ai/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        weeklyHours: Number(form.weeklyHours),
        targetDate: form.targetDate || null,
        targetSchool: form.targetSchool || null,
        additionalNotes: form.additionalNotes || null,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setProfile(data.data)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (loading) return null

  // Chưa có profile → show setup prompt
  if (!profile && !editing) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0">🪪</span>
          <div className="flex-1">
            <h3 className="font-black text-gray-900 mb-1">Thiết lập hồ sơ người học (P_i + G_i)</h3>
            <p className="text-sm text-gray-600 mb-3">
              AI cần thêm thông tin về trình độ, phong cách học và mục tiêu của con để phân tích chính xác hơn theo mô hình A2PLM.
            </p>
            <button onClick={openEdit}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">
              ✏️ Thiết lập ngay
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
            <User size={18} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-sm">Hồ sơ người học (P_i + G_i)</p>
            {profile && !editing && (
              <p className="text-xs text-gray-400">
                {BG_LEVELS.find(b => b.value === profile.backgroundLevel)?.label} ·{' '}
                {STYLES.find(s => s.value === profile.learningStyle)?.label} ·{' '}
                {GOALS.find(g => g.value === profile.targetGoal)?.label}
                {profile.targetSchool ? ` · 🎯 ${profile.targetSchool}` : ''}
              </p>
            )}
          </div>
          {saved && <span className="text-xs text-green-600 font-bold ml-2">✅ Đã lưu!</span>}
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <button onClick={e => { e.stopPropagation(); openEdit() }}
              className="text-xs text-purple-600 hover:underline px-2 py-1 rounded-lg hover:bg-purple-50 transition">
              Sửa
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          {editing ? (
            <div className="space-y-5 pt-4">
              {/* P_i: Trình độ nền */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">📊 Trình độ nền (P_i)</p>
                <div className="grid grid-cols-3 gap-2">
                  {BG_LEVELS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, backgroundLevel: opt.value }))}
                      className={`p-3 rounded-2xl border-2 text-left transition ${form.backgroundLevel === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}>
                      <p className="font-bold text-xs text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phong cách học */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">🎓 Phong cách học (P_i)</p>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, learningStyle: opt.value }))}
                      className={`p-3 rounded-2xl border-2 text-left transition ${form.learningStyle === opt.value ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}>
                      <p className="font-bold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SRL baseline + Phụ huynh */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">📚 Năng lực tự học ban đầu</p>
                  <div className="space-y-1.5">
                    {CAPACITIES.map(opt => (
                      <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, selfStudyCapacity: opt.value }))}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition ${form.selfStudyCapacity === opt.value ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-teal-200'}`}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt.color}`}>{opt.label}</span>
                        <span className="text-xs text-gray-500">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">👨‍👩‍👧 Phụ huynh đồng hành</p>
                  <div className="space-y-1.5">
                    {PARENT_LEVELS.map(opt => (
                      <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, parentInvolvement: opt.value }))}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition text-left ${form.parentInvolvement === opt.value ? 'border-amber-500 bg-amber-50' : 'border-gray-100 hover:border-amber-200'}`}>
                        <p className="font-bold text-xs text-gray-900">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* G_i: Mục tiêu */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">🎯 Mục tiêu học tập (G_i)</p>
                <div className="space-y-2">
                  {GOALS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, targetGoal: opt.value }))}
                      className={`w-full p-3 rounded-2xl border-2 text-left transition ${form.targetGoal === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                      <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trường + Deadline + Giờ học */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">🏫 Trường mục tiêu</label>
                  <input type="text" placeholder="VD: Nguyễn Siêu, Lương Thế Vinh..."
                    value={form.targetSchool ?? ''} onChange={e => setForm(f => ({ ...f, targetSchool: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">📅 Kỳ thi dự kiến</label>
                  <input type="date" value={form.targetDate ?? ''} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">⏱️ Giờ học/tuần</label>
                  <input type="number" min={1} max={30} value={form.weeklyHours ?? 5}
                    onChange={e => setForm(f => ({ ...f, weeklyHours: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">📝 Ghi chú thêm (tuỳ chọn)</label>
                <textarea rows={2} placeholder="VD: Con bị ADHD nhẹ, thích làm bài có hình ảnh, sợ toán đếm..."
                  value={form.additionalNotes ?? ''} onChange={e => setForm(f => ({ ...f, additionalNotes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </div>

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</> : <><Check size={14} /> Lưu hồ sơ</>}
                </button>
                {profile && (
                  <button onClick={() => setEditing(false)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
                    Huỷ
                  </button>
                )}
              </div>
            </div>
          ) : profile ? (
            <div className="pt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Trình độ nền', value: BG_LEVELS.find(b => b.value === profile.backgroundLevel)?.label, icon: '📊' },
                { label: 'Phong cách học', value: STYLES.find(s => s.value === profile.learningStyle)?.label, icon: '🎓' },
                { label: 'Tự học', value: CAPACITIES.find(c => c.value === profile.selfStudyCapacity)?.label, icon: '📚' },
                { label: 'Phụ huynh', value: PARENT_LEVELS.find(p => p.value === profile.parentInvolvement)?.label, icon: '👨‍👩‍👧' },
                { label: 'Mục tiêu', value: GOALS.find(g => g.value === profile.targetGoal)?.label, icon: '🎯' },
                { label: 'Trường mục tiêu', value: profile.targetSchool || 'Chưa đặt', icon: '🏫' },
                { label: 'Kỳ thi', value: profile.targetDate ? new Date(profile.targetDate).toLocaleDateString('vi-VN') : 'Chưa đặt', icon: '📅' },
                { label: 'Giờ học/tuần', value: `${profile.weeklyHours} giờ`, icon: '⏱️' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-2xl px-3 py-2.5">
                  <p className="text-xs text-gray-400">{item.icon} {item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                </div>
              ))}
              {profile.additionalNotes && (
                <div className="sm:col-span-2 lg:col-span-4 bg-amber-50 rounded-2xl px-3 py-2.5">
                  <p className="text-xs text-amber-600">📝 Ghi chú</p>
                  <p className="text-sm text-gray-700 mt-0.5">{profile.additionalNotes}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
