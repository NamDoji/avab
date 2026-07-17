'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Phone, Mail, Lock, Globe, BookOpen, Camera,
  Save, RefreshCw, AlertCircle, CheckCircle, ChevronLeft,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id:     string
  name:   string | null
  email:  string | null
  phone:  string
  avatar: string | null
  role:   string
  learnerProfile: {
    backgroundLevel:   string
    learningStyle:     string
    selfStudyCapacity: string
    parentInvolvement: string
    weeklyHours:       number
    targetSchool:      string | null
    targetGoal:        string
    additionalNotes:   string | null
  } | null
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BACKGROUND_LEVELS = [
  { value: 'BEGINNER',     label: '🌱 Mới bắt đầu'   },
  { value: 'INTERMEDIATE', label: '📘 Trung cấp'      },
  { value: 'ADVANCED',     label: '🏆 Nâng cao'       },
]

const LEARNING_STYLES = [
  { value: 'VISUAL',     label: '👁️ Thị giác (xem video/hình)' },
  { value: 'READING',    label: '📖 Đọc tài liệu'               },
  { value: 'KINESTHETIC',label: '✍️ Thực hành trực tiếp'        },
  { value: 'MIXED',      label: '🎭 Kết hợp nhiều phương pháp'  },
]

const TARGET_GOALS = [
  { value: 'SCHOLARSHIP', label: '🏅 Thi học bổng'    },
  { value: 'FOUNDATION',  label: '🏗️ Củng cố kiến thức'},
  { value: 'ADVANCED',    label: '🚀 Nâng cao toàn diện'},
]

// ─── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <h3 className="font-black text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentProfilePage() {
  const router = useRouter()

  const [profile,  setProfile]  = useState<UserProfile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [loadErr,  setLoadErr]  = useState('')

  // Form state
  const [name,   setName]   = useState('')
  const [avatar, setAvatar] = useState('')
  const [phone,  setPhone]  = useState('')

  // Password change
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd,     setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  // Learning preferences
  const [backgroundLevel, setBackgroundLevel] = useState('BEGINNER')
  const [learningStyle,   setLearningStyle]   = useState('MIXED')
  const [weeklyHours,     setWeeklyHours]     = useState(5)
  const [targetSchool,    setTargetSchool]    = useState('')
  const [targetGoal,      setTargetGoal]      = useState('FOUNDATION')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Save state
  const [saving,   setSaving]   = useState(false)
  const [saveMsg,  setSaveMsg]  = useState('')
  const [saveErr,  setSaveErr]  = useState('')

  // Load profile
  useEffect(() => {
    fetch('/api/student/profile')
      .then(r => r.json())
      .then((data: { success: boolean; data?: UserProfile; error?: string }) => {
        if (!data.success || !data.data) {
          setLoadErr(data.error ?? 'Không tải được hồ sơ')
          return
        }
        const p = data.data
        setProfile(p)
        setName(p.name ?? '')
        setAvatar(p.avatar ?? '')
        setPhone(p.phone)

        if (p.learnerProfile) {
          const lp = p.learnerProfile
          setBackgroundLevel(lp.backgroundLevel)
          setLearningStyle(lp.learningStyle)
          setWeeklyHours(lp.weeklyHours)
          setTargetSchool(lp.targetSchool ?? '')
          setTargetGoal(lp.targetGoal)
          setAdditionalNotes(lp.additionalNotes ?? '')
        }
      })
      .catch(() => setLoadErr('Lỗi kết nối'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(section: 'profile' | 'password' | 'preferences') {
    setSaving(true)
    setSaveMsg('')
    setSaveErr('')

    try {
      const body: Record<string, unknown> = {}

      if (section === 'profile') {
        body.name   = name
        body.avatar = avatar
        body.phone  = phone
      } else if (section === 'password') {
        if (!newPwd) { setSaveErr('Vui lòng nhập mật khẩu mới'); setSaving(false); return }
        if (newPwd !== confirmPwd) { setSaveErr('Xác nhận mật khẩu không khớp'); setSaving(false); return }
        body.currentPassword = currentPwd
        body.newPassword     = newPwd
      } else if (section === 'preferences') {
        body.backgroundLevel = backgroundLevel
        body.learningStyle   = learningStyle
        body.weeklyHours     = weeklyHours
        body.targetSchool    = targetSchool
        body.targetGoal      = targetGoal
        body.additionalNotes = additionalNotes
      }

      const res  = await fetch('/api/student/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json() as { success: boolean; message?: string; error?: string }

      if (!data.success) throw new Error(data.error ?? 'Lỗi lưu')

      setSaveMsg('✅ Đã lưu thay đổi')
      if (section === 'password') {
        setCurrentPwd('')
        setNewPwd('')
        setConfirmPwd('')
      }
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
      setTimeout(() => { setSaveMsg(''); setSaveErr('') }, 4000)
    }
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-cherry-400" />
      </div>
    )
  }

  if (loadErr) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-red-700 font-semibold">{loadErr}</p>
        <Link href="/dang-nhap" className="text-sm text-blue-600 hover:underline">
          Đăng nhập lại
        </Link>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-cherry-900 to-gray-900 text-white py-8">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Link href="/hoc-vien" className="hover:text-white transition">← Trang chủ học viên</Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cherry-400 to-cherry-500 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
              {profile?.avatar
                ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                : <span>{profile?.name?.[0]?.toUpperCase() ?? '👤'}</span>
              }
            </div>
            <div>
              <h1 className="text-2xl font-black">{profile?.name ?? 'Học viên'}</h1>
              <p className="text-gray-400 text-sm">{profile?.phone} · {profile?.email ?? 'Chưa có email'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 max-w-2xl mx-auto space-y-5">

        {/* Toast */}
        {(saveMsg || saveErr) && (
          <div className={`rounded-2xl p-4 text-sm font-semibold flex items-center gap-2 ${
            saveMsg ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {saveMsg ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {saveMsg || saveErr}
          </div>
        )}

        {/* ── Profile info ─────────────────────────────────────────────── */}
        <Section title="Thông tin cá nhân" icon={<User size={16} />}>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Tên hiển thị</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1 flex items-center gap-1">
              <Phone size={11} /> Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1 flex items-center gap-1">
              <Camera size={11} /> URL ảnh đại diện
            </label>
            <input
              type="url"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300"
            />
            {avatar && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={avatar}
                  alt="Preview"
                  className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-xs text-gray-400">Preview</span>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSave('profile')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cherry-600 text-white font-bold text-sm hover:bg-cherry-700 transition disabled:opacity-60 min-h-[44px]"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu thông tin
          </button>
        </Section>

        {/* ── Change password ──────────────────────────────────────────── */}
        <Section title="Đổi mật khẩu" icon={<Lock size={16} />}>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="Ít nhất 8 ký tự"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="Nhập lại mật khẩu..."
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300 ${
                  confirmPwd && confirmPwd !== newPwd
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {confirmPwd && confirmPwd !== newPwd && (
                <p className="text-xs text-red-600 mt-1">Mật khẩu không khớp</p>
              )}
            </div>
          </div>
          <button
            onClick={() => handleSave('password')}
            disabled={saving || !currentPwd || !newPwd || newPwd !== confirmPwd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition disabled:opacity-60 min-h-[44px]"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
            Đổi mật khẩu
          </button>
        </Section>

        {/* ── Learning preferences ─────────────────────────────────────── */}
        <Section title="Sở thích học tập" icon={<BookOpen size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Trình độ hiện tại</label>
              <select
                value={backgroundLevel}
                onChange={e => setBackgroundLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300 bg-white"
              >
                {BACKGROUND_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Phong cách học</label>
              <select
                value={learningStyle}
                onChange={e => setLearningStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300 bg-white"
              >
                {LEARNING_STYLES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Số giờ học/tuần: <strong>{weeklyHours}h</strong>
              </label>
              <input
                type="range"
                min={1} max={40} step={1}
                value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-cherry-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1h</span><span>20h</span><span>40h</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Mục tiêu học tập</label>
              <select
                value={targetGoal}
                onChange={e => setTargetGoal(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300 bg-white"
              >
                {TARGET_GOALS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Trường mục tiêu (nếu có)</label>
            <input
              type="text"
              value={targetSchool}
              onChange={e => setTargetSchool(e.target.value)}
              placeholder="VD: Trường THCS Nguyễn Siêu..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Ghi chú thêm</label>
            <textarea
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              rows={2}
              placeholder="Điểm yếu, mong muốn đặc biệt..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300 resize-none"
            />
          </div>

          <button
            onClick={() => handleSave('preferences')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cherry-600 text-white font-bold text-sm hover:bg-cherry-700 transition disabled:opacity-60 min-h-[44px]"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu sở thích
          </button>
        </Section>

      </div>
    </div>
  )
}
