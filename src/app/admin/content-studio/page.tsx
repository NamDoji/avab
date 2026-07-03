'use client'

import { useState, useEffect, useRef } from 'react'
import { GRADE_OPTIONS, SUBJECTS } from '@/lib/constants/education'
import Link from 'next/link'
import {
  Sparkles, Zap, Copy, Download, Save, RefreshCw,
  CheckCircle2, AlertCircle, Clock, ChevronLeft,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  { id: 'course',    icon: '📚', label: 'Course',    desc: 'Khoá học đầy đủ',       border: 'border-purple-200 hover:border-purple-500', badge: 'bg-purple-100 text-purple-700' },
  { id: 'lesson',   icon: '📖', label: 'Lesson',    desc: 'Bài học đơn lẻ',         border: 'border-teal-200 hover:border-teal-500',   badge: 'bg-teal-100 text-teal-700' },
  { id: 'theory',   icon: '📝', label: 'Theory',    desc: 'Lý thuyết chuyên đề',    border: 'border-blue-200 hover:border-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  { id: 'exercise', icon: '❓', label: 'Exercise',  desc: 'Bài tập luyện tập',      border: 'border-green-200 hover:border-green-500', badge: 'bg-green-100 text-green-700' },
  { id: 'homework', icon: '📋', label: 'Homework',  desc: 'Bài tập về nhà (BTVN)',  border: 'border-orange-200 hover:border-orange-500',badge: 'bg-orange-100 text-orange-700' },
  { id: 'quiz',     icon: '🎯', label: 'Quiz',      desc: 'Đề kiểm tra',            border: 'border-pink-200 hover:border-pink-500',   badge: 'bg-pink-100 text-pink-700' },
]

const WORKFLOW_STEPS = [
  { id: 1, label: 'Chọn loại',    icon: '📌' },
  { id: 2, label: 'Tham số',      icon: '⚙️' },
  { id: 3, label: 'AI Generate',  icon: '🤖' },
  { id: 4, label: 'Kết quả',      icon: '👁️' },
  { id: 5, label: 'Chỉnh sửa',    icon: '✏️' },
  { id: 6, label: 'QA Check',     icon: '✅' },
  { id: 7, label: 'Xuất bản',     icon: '📤' },
]

const QUICK_ACTIONS = [
  { icon: '🤖', label: 'Sinh bài học mới',    type: 'lesson',   extra: {},                color: 'from-teal-600 to-teal-700' },
  { icon: '❓', label: 'Sinh 30 câu BTVN',    type: 'homework', extra: { numItems: '30' }, color: 'from-orange-600 to-orange-700' },
  { icon: '📝', label: 'Lý thuyết chuyên đề', type: 'theory',   extra: {},                color: 'from-blue-600 to-blue-700' },
  { icon: '🎯', label: 'Sinh đề kiểm tra',    type: 'quiz',     extra: { numItems: '20' }, color: 'from-pink-600 to-pink-700' },
]

const GRADES = GRADE_OPTIONS
const SUBJECT_LIST = SUBJECTS
const DIFFICULTIES = [
  { value: 'EASY',   label: '🟢 Dễ' },
  { value: 'MEDIUM', label: '🟡 Trung bình' },
  { value: 'HARD',   label: '🔴 Khó' },
]

const PROGRESS_LOGS: Record<string, string[]> = {
  lesson:   ['📌 Phân tích chuẩn chương trình...','📚 Tải AvaB Lesson Standard...','🧠 Soạn mục tiêu bài học...','✏️ Viết nội dung chính...','🔍 Tạo ví dụ minh họa...','📋 Soạn bài tập thực hành...','✅ Kiểm tra chất lượng...','🎉 Hoàn thành!'],
  homework: ['📌 Phân tích chủ đề...','📊 Lập phân bố độ khó...','🧠 Sinh câu hỏi DỄ...','🧠 Sinh câu hỏi KHÁ...','🧠 Sinh câu hỏi KHÓ...','✏️ Soạn đáp án & lời giải...','✅ Kiểm tra...','🎉 Hoàn thành!'],
  theory:   ['📌 Phân tích chuyên đề...','📚 Tham chiếu kiến thức...','🧠 Soạn lý thuyết cốt lõi...','📝 Tạo ví dụ điển hình...','💡 Thêm mẹo & lưu ý...','✅ Kiểm tra chất lượng...','🎉 Hoàn thành!'],
  quiz:     ['📌 Lập cấu trúc đề...','📊 Phân bố câu hỏi theo độ khó...','🧠 Soạn câu hỏi...','✏️ Soạn đáp án...','📋 Tổng hợp đề thi...','✅ Kiểm tra tính nhất quán...','🎉 Hoàn thành!'],
  course:   ['📌 Phân tích chương trình...','🗂️ Lập cấu trúc khoá học...','📖 Xây dựng từng unit...','📊 Thiết kế phương pháp đánh giá...','✅ Hoàn thiện...','🎉 Hoàn thành!'],
  exercise: ['📌 Phân tích yêu cầu...','🧠 Sinh câu hỏi...','✏️ Soạn đáp án...','✅ Kiểm tra...','🎉 Hoàn thành!'],
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenParams {
  grade: string
  subject: string
  topic: string
  difficulty: string
  targetAge: string
  numItems: string
}

interface GenResult {
  content: string
  metadata: {
    type: string
    wordCount: number
    items?: number
    generatedAt: string
    grade?: string
    subject?: string
    topic?: string
  }
}

interface RecentItem {
  id: string
  type: string
  title: string
  time: string
  content: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContentStudioPage() {
  const [step,         setStep]         = useState(1)
  const [selectedType, setSelectedType] = useState('')
  const [params,       setParams]       = useState<GenParams>({ grade: '2', subject: 'Toán', topic: '', difficulty: 'MEDIUM', targetAge: '7', numItems: '30' })
  const [generating,   setGenerating]   = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [progressLog,  setProgressLog]  = useState<string[]>([])
  const [result,       setResult]       = useState<GenResult | null>(null)
  const [error,        setError]        = useState('')
  const [copied,       setCopied]       = useState(false)
  const [recentItems,  setRecentItems]  = useState<RecentItem[]>([])
  const [editContent,  setEditContent]  = useState('')
  const [isEditing,    setIsEditing]    = useState(false)

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const logTimer      = useRef<ReturnType<typeof setInterval> | null>(null)
  const logIndexRef   = useRef(0)

  // Load recent items
  useEffect(() => {
    try {
      const saved = localStorage.getItem('avab-content-studio-recent')
      if (saved) setRecentItems(JSON.parse(saved))
    } catch { /* ignore */ }
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current)
      if (logTimer.current) clearInterval(logTimer.current)
    }
  }, [])

  const saveToRecent = (item: RecentItem) => {
    setRecentItems(prev => {
      const updated = [item, ...prev.filter(r => r.id !== item.id)].slice(0, 10)
      try { localStorage.setItem('avab-content-studio-recent', JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleQuickAction = (type: string, extra: Partial<GenParams> = {}) => {
    setSelectedType(type)
    setParams(p => ({ ...p, ...extra }))
    setResult(null); setError(''); setStep(2)
  }

  const handleGenerate = async () => {
    if (!selectedType) { setError('Chưa chọn loại nội dung!'); return }
    if (!params.topic.trim()) { setError('Vui lòng nhập Chủ đề!'); return }

    setGenerating(true)
    setProgress(0)
    setProgressLog([])
    setError('')
    setResult(null)
    setIsEditing(false)
    logIndexRef.current = 0
    setStep(3)

    const logs = PROGRESS_LOGS[selectedType] ?? PROGRESS_LOGS.lesson
    let cur = 0

    // fake progress bar
    progressTimer.current = setInterval(() => {
      cur = Math.min(cur + Math.random() * 9 + 3, 90)
      setProgress(Math.round(cur))
    }, 350)

    // fake log lines
    logTimer.current = setInterval(() => {
      const idx = logIndexRef.current
      if (idx < logs.length) {
        setProgressLog(prev => [...prev, logs[idx]])
        logIndexRef.current = idx + 1
      } else {
        if (logTimer.current) clearInterval(logTimer.current)
      }
    }, 750)

    try {
      const res  = await fetch('/api/admin/content-studio/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type: selectedType, params }),
      })
      const data = await res.json()

      if (progressTimer.current) clearInterval(progressTimer.current)
      if (logTimer.current)      clearInterval(logTimer.current)
      setProgress(100)
      setProgressLog(logs)

      if (data.success) {
        setResult(data)
        setEditContent(data.content)
        setStep(4)
        saveToRecent({
          id:      Date.now().toString(),
          type:    selectedType,
          title:   `${CONTENT_TYPES.find(t => t.id === selectedType)?.label} — ${params.topic} (Lớp ${params.grade})`,
          time:    'Vừa xong',
          content: data.content,
        })
      } else {
        setError(data.error || 'AI trả về lỗi, vui lòng thử lại.')
      }
    } catch {
      if (progressTimer.current) clearInterval(progressTimer.current)
      if (logTimer.current)      clearInterval(logTimer.current)
      setError('Không thể kết nối server. Kiểm tra kết nối và thử lại.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editContent || result?.content || '').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = editContent || result?.content || ''
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${selectedType}-${params.topic.slice(0, 30)}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetFlow = () => {
    setStep(1); setSelectedType(''); setResult(null); setError('')
    setProgress(0); setProgressLog([]); setIsEditing(false)
  }

  const getType = (id: string) => CONTENT_TYPES.find(t => t.id === id) ?? CONTENT_TYPES[0]
  const needsNumItems = ['homework', 'quiz', 'exercise'].includes(selectedType)

  // ─── Step renderers ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-1">📌 Chọn loại nội dung</h2>
      <p className="text-gray-500 text-sm mb-6">Chọn loại học liệu bạn muốn tạo để bắt đầu</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CONTENT_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => { setSelectedType(t.id); setError(''); setStep(2) }}
            className={`min-h-[110px] p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${t.border} ${selectedType === t.id ? 'ring-2 ring-purple-500' : 'border-gray-200'}`}
          >
            <div className="text-4xl mb-2">{t.icon}</div>
            <div className="font-black text-gray-900 text-sm">{t.label}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => {
    const ti = getType(selectedType)
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep(1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span>{ti.icon}</span> {ti.label} — Nhập tham số
            </h2>
            <p className="text-gray-400 text-xs">Điền thông tin để AI sinh nội dung chuẩn AvaB</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-5">
          {/* Grade */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">🏫 Lớp</label>
            <select
              value={params.grade}
              onChange={e => setParams(p => ({ ...p, grade: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-purple-400 focus:outline-none bg-white"
            >
              {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">📚 Môn học</label>
            <select
              value={params.subject}
              onChange={e => setParams(p => ({ ...p, subject: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-purple-400 focus:outline-none bg-white"
            >
              {SUBJECT_LIST.map(s => <option key={s.value} value={s.label}>{s.emoji} {s.label}</option>)}
            </select>
          </div>

          {/* Topic */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
              🎯 Chủ đề <span className="text-red-400 normal-case font-normal">(bắt buộc)</span>
            </label>
            <input
              type="text"
              value={params.topic}
              onChange={e => setParams(p => ({ ...p, topic: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="VD: Phép cộng trong phạm vi 100, Phân số cơ bản, Hình học phẳng..."
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">⚡ Độ khó</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setParams(p => ({ ...p, difficulty: d.value }))}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${params.difficulty === d.value ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target age */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">👶 Độ tuổi mục tiêu</label>
            <input
              type="number"
              value={params.targetAge}
              onChange={e => setParams(p => ({ ...p, targetAge: e.target.value }))}
              min="6" max="15"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Num items */}
          {needsNumItems && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                🔢 Số câu {selectedType === 'homework' ? 'BTVN' : selectedType === 'quiz' ? 'đề thi' : 'bài tập'}
              </label>
              <input
                type="number"
                value={params.numItems}
                onChange={e => setParams(p => ({ ...p, numItems: e.target.value }))}
                min="5" max="100"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-purple-400 focus:outline-none"
              />
              {selectedType === 'homework' && (
                <p className="text-xs text-gray-400 mt-1">
                  Phân bố: {Math.floor(parseInt(params.numItems||'30')/3)} DỄ + {Math.floor(parseInt(params.numItems||'30')/3)} KHÁ + {parseInt(params.numItems||'30') - Math.floor(parseInt(params.numItems||'30')/3)*2} KHÓ
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-2xl font-black text-base hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <Sparkles size={20} />
          🚀 AI Sinh Nội Dung Ngay
        </button>
      </div>
    )
  }

  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-1">🤖 AI đang sinh nội dung...</h2>
      <p className="text-gray-500 text-sm mb-6">Đang xử lý — thường mất 15–30 giây</p>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Tiến độ</span>
          <span className="font-black text-purple-600">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Terminal log */}
      <div className="bg-gray-950 rounded-2xl p-5 font-mono text-sm space-y-2 min-h-[200px] border border-gray-800">
        <div className="text-gray-500 text-xs mb-3 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-2 text-gray-600">avab-content-studio — AI Generator</span>
        </div>
        {progressLog.map((log, i) => (
          <div key={i} className={`flex items-center gap-2.5 ${i === progressLog.length - 1 ? 'text-green-400' : 'text-gray-400'}`}>
            {i === progressLog.length - 1 && generating
              ? <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              : <CheckCircle2 size={12} className="text-green-600 flex-shrink-0" />
            }
            <span>{log}</span>
          </div>
        ))}
        {progressLog.length === 0 && (
          <div className="text-gray-600">Đang khởi động AI...</div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setStep(2)} className="underline font-semibold hover:no-underline">Thử lại</button>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => {
    if (!result) return null
    const ti = getType(selectedType)
    return (
      <div>
        {/* Result header */}
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-green-500" />
              Sinh thành công!
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ti.badge}`}>{ti.icon} {ti.label}</span>
              <span className="text-xs text-gray-400">Lớp {params.grade} • {params.subject}</span>
              <span className="text-xs text-gray-400">~{result.metadata.wordCount} từ</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px]">
              <Copy size={14} />{copied ? '✓ Đã copy!' : 'Copy'}
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px]">
              <Download size={14} />Export .md
            </button>
            <button onClick={() => { setResult(null); setStep(2) }}
              className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px]">
              <RefreshCw size={14} />Regenerate
            </button>
          </div>
        </div>

        {/* View / Edit toggle */}
        <div className="flex gap-1.5 mb-3 p-1 bg-gray-100 rounded-xl w-fit">
          <button onClick={() => setIsEditing(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!isEditing ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            👁️ Xem
          </button>
          <button onClick={() => setIsEditing(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isEditing ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            ✏️ Chỉnh sửa
          </button>
        </div>

        {/* Content */}
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full h-96 border-2 border-gray-200 rounded-2xl p-4 text-sm font-mono focus:border-purple-400 focus:outline-none resize-none bg-gray-50"
          />
        ) : (
          <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 h-96 overflow-y-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{editContent}</pre>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-3 rounded-xl font-bold text-sm hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md min-h-[44px]">
            <Save size={16} />Lưu vào hệ thống
          </button>
          <button onClick={resetFlow}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px]">
            ➕ Tạo nội dung mới
          </button>
        </div>
      </div>
    )
  }

  const renderMain = () => {
    switch (step) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return renderStep1()
    }
  }

  // ─── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/10">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container-custom relative">
          <div className="flex items-center gap-3 mb-4 text-sm">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">← Admin</Link>
            <span className="text-gray-700">/</span>
            <span className="text-gray-300">Content Studio</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                🎨
              </div>
              <div>
                <h1 className="text-3xl font-black">Content Studio</h1>
                <p className="text-purple-300 text-sm mt-0.5">Tạo học liệu theo chuẩn AvaB — từ A đến Z</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-center">
              <div>
                <div className="text-2xl font-black">{recentItems.length}</div>
                <div className="text-xs text-gray-400 mt-0.5">Files tạo gần đây</div>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div>
                <div className="text-2xl font-black text-green-400">6</div>
                <div className="text-xs text-gray-400 mt-0.5">Loại nội dung</div>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div>
                <div className="text-2xl font-black text-purple-300">AI</div>
                <div className="text-xs text-gray-400 mt-0.5">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">

        {/* ── Quick Actions Bar ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm mr-1">
            <Zap size={15} className="text-purple-500" />
            <span className="font-bold">Quick Actions:</span>
          </div>
          {QUICK_ACTIONS.map(qa => (
            <button
              key={qa.type}
              onClick={() => handleQuickAction(qa.type, qa.extra as Partial<GenParams>)}
              className={`flex items-center gap-2 bg-gradient-to-r ${qa.color} text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm hover:shadow-md min-h-[44px]`}
            >
              {qa.icon} {qa.label}
            </button>
          ))}
          <Link
            href="/admin/ai-generator/qa"
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm hover:shadow-md min-h-[44px]"
          >
            ✅ Chạy QA
          </Link>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div className="flex gap-5">

          {/* Sidebar — Workflow */}
          <div className="w-44 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">WORKFLOW</p>
              <div className="space-y-1">
                {WORKFLOW_STEPS.map(s => {
                  const isActive = step === s.id
                  const isDone   = step > s.id
                  const locked   = s.id > 4
                  const disabled = locked || (s.id > step)
                  return (
                    <button
                      key={s.id}
                      onClick={() => !disabled && setStep(s.id)}
                      disabled={disabled}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                        isActive  ? 'bg-purple-600 text-white font-bold shadow-sm'
                        : isDone  ? 'bg-green-50 text-green-700 font-semibold hover:bg-green-100'
                        : disabled? 'text-gray-300 cursor-not-allowed'
                        :           'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-white/25 text-white' : isDone ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isDone ? '✓' : s.id}
                      </span>
                      <span className="leading-tight">{s.label}</span>
                    </button>
                  )
                })}
              </div>

              {step > 1 && (
                <button onClick={resetFlow} className="mt-4 w-full text-xs text-gray-400 hover:text-purple-600 py-2 border-t border-gray-100 transition-colors">
                  ↺ Bắt đầu lại
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7">
              {renderMain()}
            </div>
          </div>
        </div>

        {/* ── Recent Activity ──────────────────────────────────────────────── */}
        {recentItems.length > 0 && (
          <div className="mt-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                Hoạt động gần đây ({recentItems.length} file)
              </h2>
              <div className="space-y-2">
                {recentItems.map(item => {
                  const ti = CONTENT_TYPES.find(t => t.id === item.type)
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                      <span className="text-xl flex-shrink-0">{ti?.icon ?? '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{item.title}</div>
                        <div className="text-xs text-gray-400">{item.time}</div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedType(item.type)
                            setResult({ content: item.content, metadata: { type: item.type, wordCount: item.content.split(/\s+/).length, generatedAt: new Date().toISOString() } })
                            setEditContent(item.content)
                            setStep(4)
                          }}
                          className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg font-semibold hover:bg-purple-200 transition-colors min-h-[32px]"
                        >
                          Mở lại
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.content).catch(() => {})
                          }}
                          className="text-xs bg-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors min-h-[32px]"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile workflow steps (shown on mobile only) */}
        <div className="md:hidden mt-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">WORKFLOW</p>
            <div className="flex overflow-x-auto gap-2 pb-1">
              {WORKFLOW_STEPS.map(s => {
                const isActive = step === s.id
                const isDone   = step > s.id
                const disabled = s.id > 4 || s.id > step
                return (
                  <button
                    key={s.id}
                    onClick={() => !disabled && setStep(s.id)}
                    disabled={disabled}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-center text-xs transition-all ${
                      isActive ? 'bg-purple-600 text-white font-bold' : isDone ? 'bg-green-50 text-green-700' : 'text-gray-300'
                    }`}
                  >
                    <span>{isDone ? '✓' : s.icon}</span>
                    <span className="whitespace-nowrap">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
