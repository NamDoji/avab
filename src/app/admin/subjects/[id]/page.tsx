'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Plus, Trash2, FileText, BookOpen, Video, CheckSquare, Play, Link2, ExternalLink, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type QuestionType = 'OPEN' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MATCHING' | 'ORDERING'

interface QuestionForm {
  questionType: QuestionType
  content: string
  imageUrl: string
  correctAnswer: string
  explanation: string
  points: string
  // MULTIPLE_CHOICE
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  // MATCHING
  matchPairs: Array<{ left: string; right: string }>
  // ORDERING
  orderItems: string[]
}

interface Question {
  id: string
  order: number
  questionType: string
  content: string
  correctAnswer: string
  options: any
  points: number
}

interface Material {
  id: string
  type: string
  title: string | null
  fileUrl: string | null
  fileName: string | null
}

interface SubjectDetail {
  id: string
  name: string
  courseId: string
  course: { id: string; name: string; code: string }
  questions: Question[]
  materials: Material[]
}

type MaterialType = 'THEORY' | 'VIDEO' | 'ANSWER'
type InputMode = 'url' | 'upload'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Chuyển Google Drive share link → embed/preview link */
function toEmbedUrl(url: string): string {
  if (!url) return url
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`
  if (url.includes('docs.google.com') || url.includes('slides.google.com') || url.includes('sheets.google.com')) {
    return url.replace(/\/(edit|pub|view).*$/, '/preview')
  }
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  return url
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  OPEN: '📝 Tự luận',
  MULTIPLE_CHOICE: '🔤 Trắc nghiệm',
  TRUE_FALSE: '✅ Đúng/Sai',
  MATCHING: '🔗 Nối đáp án',
  ORDERING: '📋 Sắp xếp',
}

const QUESTION_TYPE_BADGE: Record<string, string> = {
  OPEN: 'bg-gray-100 text-gray-600',
  MULTIPLE_CHOICE: 'bg-blue-100 text-blue-700',
  TRUE_FALSE: 'bg-green-100 text-green-700',
  MATCHING: 'bg-orange-100 text-orange-700',
  ORDERING: 'bg-violet-100 text-violet-700',
}

const DEFAULT_FORM: QuestionForm = {
  questionType: 'OPEN',
  content: '',
  imageUrl: '',
  correctAnswer: '',
  explanation: '',
  points: '1',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  matchPairs: [{ left: '', right: '' }],
  orderItems: [''],
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // ── BTVN Parse ──
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseResult, setParseResult] = useState<{ parsed: number; questions: Question[] } | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Rich question form ──
  const [showQForm, setShowQForm] = useState(false)
  const [qForm, setQForm] = useState<QuestionForm>(DEFAULT_FORM)
  const [savingQ, setSavingQ] = useState(false)

  // ── Lý thuyết ──
  const [lyThuyetMode, setLyThuyetMode] = useState<InputMode>('url')
  const [lyThuyetUrl, setLyThuyetUrl] = useState('')
  const [lyThuyetFile, setLyThuyetFile] = useState<File | null>(null)
  const [savingLyThuyet, setSavingLyThuyet] = useState(false)

  // ── Video ──
  const [videoMode, setVideoMode] = useState<InputMode>('url')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [savingVideo, setSavingVideo] = useState(false)

  // ── Đáp án ──
  const [dapAnMode, setDapAnMode] = useState<InputMode>('url')
  const [dapAnUrl, setDapAnUrl] = useState('')
  const [dapAnFile, setDapAnFile] = useState<File | null>(null)
  const [savingDapAn, setSavingDapAn] = useState(false)

  // ── Notifications ──
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/subjects/${id}`)
    const data = await res.json()
    if (data.success) setSubject(data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  // ── BTVN parse ──
  const handleParsePreview = async () => {
    if (!uploadFile) return
    setParsing(true)
    setParseResult(null)
    const fd = new FormData()
    fd.append('file', uploadFile)
    fd.append('save', 'false')
    const res = await fetch(`/api/admin/subjects/${id}/parse-homework`, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) setParseResult(data.data)
    else alert(data.error)
    setParsing(false)
  }

  const handleParseAndSave = async () => {
    if (!uploadFile) return
    setSaving(true)
    const fd = new FormData()
    fd.append('file', uploadFile)
    fd.append('save', 'true')
    const res = await fetch(`/api/admin/subjects/${id}/parse-homework`, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) {
      showMsg('success', `Đã lưu ${data.data.parsed} câu hỏi!`)
      setParseResult(null)
      setUploadFile(null)
      load()
    } else {
      showMsg('error', data.error)
    }
    setSaving(false)
  }

  // ── Rich question add ──
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject) return
    setSavingQ(true)

    const { questionType, content, imageUrl, explanation, points } = qForm
    let options: any = undefined
    let correctAnswer = qForm.correctAnswer

    if (questionType === 'MULTIPLE_CHOICE') {
      options = [
        { key: 'A', text: qForm.optionA },
        { key: 'B', text: qForm.optionB },
        { key: 'C', text: qForm.optionC },
        { key: 'D', text: qForm.optionD },
      ]
      // correctAnswer is already set to selected key (A/B/C/D)
    } else if (questionType === 'TRUE_FALSE') {
      options = [
        { key: 'Đúng', text: 'Đúng' },
        { key: 'Sai', text: 'Sai' },
      ]
      // correctAnswer is "Đúng" or "Sai"
    } else if (questionType === 'MATCHING') {
      options = qForm.matchPairs
      correctAnswer = JSON.stringify(qForm.matchPairs)
    } else if (questionType === 'ORDERING') {
      options = qForm.orderItems
      correctAnswer = JSON.stringify(qForm.orderItems)
    }

    const body = {
      subjectId: id,
      questionType,
      content,
      correctAnswer,
      options,
      explanation,
      points: Number(points),
      imageUrl: imageUrl || undefined,
    }

    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.success) {
      showMsg('success', 'Đã thêm câu hỏi!')
      setQForm(DEFAULT_FORM)
      setShowQForm(false)
      load()
    } else {
      showMsg('error', data.error || 'Lỗi khi thêm câu hỏi')
    }
    setSavingQ(false)
  }

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Xoá câu hỏi này?')) return
    await fetch(`/api/admin/questions/${qId}`, { method: 'DELETE' })
    load()
  }

  // ── Save material (URL hoặc file) ──
  const saveMaterialUrl = async (type: MaterialType, url: string, label: string) => {
    const embed = toEmbedUrl(url)
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title: label, fileUrl: embed, fileName: label }),
    })
    return res.json()
  }

  const uploadAndSave = async (type: MaterialType, file: File, folder: string) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'avab-materials')
    fd.append('folder', folder)
    const up = await fetch('/api/upload', { method: 'POST', body: fd }).then(r => r.json())
    if (!up.success) return up
    return fetch(`/api/admin/subjects/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title: file.name, fileUrl: up.data.url, fileName: file.name }),
    }).then(r => r.json())
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Xoá tài liệu này?')) return
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId }),
    })
    const data = await res.json()
    if (data.success) load()
    else showMsg('error', data.error)
  }

  // ── Handlers ──
  const handleSaveLyThuyet = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingLyThuyet(true)
    try {
      if (lyThuyetMode === 'url') {
        if (!lyThuyetUrl.trim()) return
        const r = await saveMaterialUrl('THEORY', lyThuyetUrl.trim(), 'Bài giảng')
        if (r.success) { showMsg('success', 'Đã lưu bài giảng!'); setLyThuyetUrl(''); load() }
        else showMsg('error', r.error)
      } else {
        if (!lyThuyetFile) return
        const r = await uploadAndSave('THEORY', lyThuyetFile, 'ly-thuyet')
        if (r.success) { showMsg('success', 'Đã tải lên bài giảng!'); setLyThuyetFile(null); load() }
        else showMsg('error', r.error || 'Upload thất bại')
      }
    } finally { setSavingLyThuyet(false) }
  }

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingVideo(true)
    try {
      if (videoMode === 'url') {
        if (!videoUrl.trim()) return
        const r = await saveMaterialUrl('VIDEO', videoUrl.trim(), 'Video bài giảng')
        if (r.success) { showMsg('success', 'Đã lưu video!'); setVideoUrl(''); load() }
        else showMsg('error', r.error)
      } else {
        if (!videoFile) return
        const r = await uploadAndSave('VIDEO', videoFile, 'video')
        if (r.success) { showMsg('success', 'Đã tải lên video!'); setVideoFile(null); load() }
        else showMsg('error', r.error || 'Upload thất bại')
      }
    } finally { setSavingVideo(false) }
  }

  const handleSaveDapAn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingDapAn(true)
    try {
      if (dapAnMode === 'url') {
        if (!dapAnUrl.trim()) return
        const r = await saveMaterialUrl('ANSWER', dapAnUrl.trim(), 'Đáp án')
        if (r.success) { showMsg('success', 'Đã lưu đáp án!'); setDapAnUrl(''); load() }
        else showMsg('error', r.error)
      } else {
        if (!dapAnFile) return
        const r = await uploadAndSave('ANSWER', dapAnFile, 'dap-an')
        if (r.success) { showMsg('success', 'Đã tải lên đáp án!'); setDapAnFile(null); load() }
        else showMsg('error', r.error || 'Upload thất bại')
      }
    } finally { setSavingDapAn(false) }
  }

  const getMaterials = (type: MaterialType) =>
    (subject?.materials ?? []).filter((m) => m.type === type)

  // ── Matching pair helpers ──
  const addMatchPair = () => setQForm(f => ({ ...f, matchPairs: [...f.matchPairs, { left: '', right: '' }] }))
  const removeMatchPair = (i: number) => setQForm(f => ({ ...f, matchPairs: f.matchPairs.filter((_, idx) => idx !== i) }))
  const updateMatchPair = (i: number, side: 'left' | 'right', val: string) =>
    setQForm(f => ({ ...f, matchPairs: f.matchPairs.map((p, idx) => idx === i ? { ...p, [side]: val } : p) }))

  // ── Ordering item helpers ──
  const addOrderItem = () => setQForm(f => ({ ...f, orderItems: [...f.orderItems, ''] }))
  const removeOrderItem = (i: number) => setQForm(f => ({ ...f, orderItems: f.orderItems.filter((_, idx) => idx !== i) }))
  const updateOrderItem = (i: number, val: string) =>
    setQForm(f => ({ ...f, orderItems: f.orderItems.map((item, idx) => idx === i ? val : item) }))

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>
  if (!subject) return <div className="min-h-screen flex items-center justify-center text-red-500">Không tìm thấy chuyên đề</div>

  // ── Shared mode toggle UI ──
  const ModeToggle = ({ mode, setMode, labelA, labelB, iconA, iconB }: {
    mode: InputMode; setMode: (m: InputMode) => void
    labelA: string; labelB: string
    iconA: React.ReactNode; iconB: React.ReactNode
  }) => (
    <div className="flex gap-2 mb-3">
      <button type="button" onClick={() => setMode('url')}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition ${mode === 'url' ? 'bg-blue-100 text-blue-700 font-semibold' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
        {iconA} {labelA}
      </button>
      <button type="button" onClick={() => setMode('upload')}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition ${mode === 'upload' ? 'bg-blue-100 text-blue-700 font-semibold' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
        {iconB} {labelB}
      </button>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-5xl mx-auto">
        <Link href={`/admin/courses/${subject.courseId}`} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> {subject.course.name}
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{subject.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{subject.course.code} · Chuyên đề {subject.name} · {subject.questions.length} câu hỏi</p>
        </div>

        {/* Notification */}
        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        {/* ═══ NỘI DUNG ═══ */}
        <div className="space-y-4">

          {/* ── 1. BÀI GIẢNG (LÝ THUYẾT) ── */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              📖 Bài giảng (Lý thuyết)
              <span className="text-xs font-normal text-gray-400 ml-1">— Google Drive, Canva, PDF, Word...</span>
            </h2>

            {getMaterials('THEORY').length > 0 && (
              <div className="space-y-2 mb-4">
                {getMaterials('THEORY').map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-2 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <a href={m.fileUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-blue-700 hover:underline truncate flex items-center gap-1">
                      {m.title ?? m.fileName ?? 'Bài giảng'} <ExternalLink className="w-3 h-3" />
                    </a>
                    <button onClick={() => handleDeleteMaterial(m.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveLyThuyet}>
              <ModeToggle
                mode={lyThuyetMode} setMode={setLyThuyetMode}
                labelA="Link URL" labelB="Upload file"
                iconA={<Link2 className="w-4 h-4" />} iconB={<Upload className="w-4 h-4" />}
              />
              {lyThuyetMode === 'url' ? (
                <div className="flex gap-2">
                  <input type="url" required value={lyThuyetUrl} onChange={e => setLyThuyetUrl(e.target.value)}
                    placeholder="https://drive.google.com/... hoặc link Canva, PDF..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button type="submit" disabled={savingLyThuyet || !lyThuyetUrl.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    {savingLyThuyet ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input type="file" accept=".doc,.docx,.pdf" onChange={e => setLyThuyetFile(e.target.files?.[0] ?? null)} className="hidden" />
                    <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer text-sm transition ${lyThuyetFile ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>
                      {lyThuyetFile ? lyThuyetFile.name : '📄 Chọn file Word/PDF'}
                    </div>
                  </label>
                  <button type="submit" disabled={savingLyThuyet || !lyThuyetFile}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    {savingLyThuyet ? 'Đang tải...' : 'Tải lên'}
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">💡 Khuyến nghị: dùng Google Drive (chia sẻ công khai) → paste link vào đây</p>
            </form>
          </div>

          {/* ── 2. VIDEO ── */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500" />
              🎬 Video bài giảng
              <span className="text-xs font-normal text-gray-400 ml-1">— YouTube, link video...</span>
            </h2>

            {getMaterials('VIDEO').length > 0 && (
              <div className="space-y-2 mb-4">
                {getMaterials('VIDEO').map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <Play className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <a href={m.fileUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-red-700 hover:underline truncate">{m.title ?? 'Video'}</a>
                    <button onClick={() => handleDeleteMaterial(m.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveVideo}>
              <ModeToggle
                mode={videoMode} setMode={setVideoMode}
                labelA="Link YouTube / URL" labelB="Upload file video"
                iconA={<Play className="w-4 h-4" />} iconB={<Upload className="w-4 h-4" />}
              />
              {videoMode === 'url' ? (
                <div className="flex gap-2">
                  <input type="url" required value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                  <button type="submit" disabled={savingVideo || !videoUrl.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    {savingVideo ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input type="file" accept=".mp4,.mov,.avi" onChange={e => setVideoFile(e.target.files?.[0] ?? null)} className="hidden" />
                    <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer text-sm transition ${videoFile ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400 hover:border-red-300'}`}>
                      {videoFile ? videoFile.name : '🎬 Chọn file video (.mp4/.mov)'}
                    </div>
                  </label>
                  <button type="submit" disabled={savingVideo || !videoFile}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    {savingVideo ? 'Đang tải...' : 'Tải lên'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* ── 3. BTVN (Parse file) ── */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              ✏️ Bài Tập Về Nhà (BTVN)
              <span className="text-xs font-normal text-gray-400 ml-1">— Upload file Word/PDF theo mẫu → tự động tách câu hỏi</span>
            </h2>

            {/* Template download */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-purple-700 font-semibold">📋 Dùng đúng file mẫu để parse chính xác</p>
              <a href="/templates/mau-bai-tap-ve-nha.docx" download
                className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700">
                ⬇️ Tải mẫu BTVN (câu hỏi + đáp án + lời giải)
              </a>
            </div>

            <div className="flex gap-3 flex-wrap">
              <label className="flex-1 min-w-48">
                <input type="file" accept=".docx,.pdf,.txt" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} className="hidden" />
                <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${uploadFile ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <FileText className="w-7 h-7 mx-auto mb-1 text-gray-400" />
                  <p className="text-sm text-gray-500">{uploadFile ? uploadFile.name : 'Chọn file .docx / .pdf / .txt'}</p>
                </div>
              </label>
              <div className="flex flex-col gap-2">
                <button onClick={handleParsePreview} disabled={!uploadFile || parsing}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
                  {parsing ? 'Đang đọc...' : '🔍 Preview'}
                </button>
                {parseResult && (
                  <button onClick={handleParseAndSave} disabled={saving}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
                    {saving ? 'Đang lưu...' : `💾 Lưu ${parseResult.parsed} câu`}
                  </button>
                )}
              </div>
            </div>

            {parseResult && (
              <div className="mt-4 p-4 bg-teal-50 rounded-xl">
                <p className="font-semibold text-teal-700 mb-3">Preview: {parseResult.parsed} câu hỏi</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {parseResult.questions.map((q, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 text-sm">
                      <p className="font-medium text-gray-800 whitespace-pre-wrap">{q.order}. {q.content}</p>
                      <p className="text-teal-600 mt-1">→ Đáp án: {q.correctAnswer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách câu hỏi hiện có */}
            {subject.questions.length > 0 && (
              <div className="mt-5 border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Đã có: {subject.questions.length} câu hỏi</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {subject.questions.map(q => (
                    <div key={q.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:border-purple-100">
                      <span className="text-sm text-gray-400 w-6 flex-shrink-0">{q.order}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${QUESTION_TYPE_BADGE[q.questionType] ?? 'bg-gray-100 text-gray-600'}`}>
                            {QUESTION_TYPE_LABELS[q.questionType as QuestionType] ?? q.questionType}
                          </span>
                          <span className="text-xs text-gray-400">{q.points} điểm</span>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2 whitespace-pre-wrap">{q.content}</p>
                        <p className="text-xs text-teal-600 mt-0.5">Đáp án: {q.correctAnswer}</p>
                      </div>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 4. THÊM CÂU HỎI (Rich form) ── */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                ➕ Thêm câu hỏi
              </h2>
              {!showQForm && (
                <button
                  onClick={() => setShowQForm(true)}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                  <Plus className="w-4 h-4" /> Tạo câu hỏi mới
                </button>
              )}
            </div>

            {showQForm && (
              <form onSubmit={handleAddQuestion} className="space-y-5">

                {/* ── Type selector ── */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Loại câu hỏi</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setQForm(f => ({ ...f, questionType: type, correctAnswer: '' }))}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                          qForm.questionType === type
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                        {QUESTION_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Common fields ── */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nội dung câu hỏi *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Nhập nội dung câu hỏi..."
                    value={qForm.content}
                    onChange={e => setQForm(f => ({ ...f, content: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">URL hình ảnh (tuỳ chọn)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={qForm.imageUrl}
                      onChange={e => setQForm(f => ({ ...f, imageUrl: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Điểm *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={qForm.points}
                      onChange={e => setQForm(f => ({ ...f, points: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lời giải / Giải thích (tuỳ chọn)</label>
                  <textarea
                    rows={2}
                    placeholder="Giải thích đáp án..."
                    value={qForm.explanation}
                    onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* ── OPEN ── */}
                {qForm.questionType === 'OPEN' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Đáp án đúng *</label>
                    <input
                      required
                      placeholder="Nhập đáp án..."
                      value={qForm.correctAnswer}
                      onChange={e => setQForm(f => ({ ...f, correctAnswer: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                )}

                {/* ── MULTIPLE_CHOICE ── */}
                {qForm.questionType === 'MULTIPLE_CHOICE' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Các lựa chọn & Đáp án đúng *</label>
                    <div className="space-y-2">
                      {(['A', 'B', 'C', 'D'] as const).map(key => {
                        const fieldKey = `option${key}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="mcCorrect"
                              value={key}
                              checked={qForm.correctAnswer === key}
                              onChange={() => setQForm(f => ({ ...f, correctAnswer: key }))}
                              className="accent-purple-600 w-4 h-4 flex-shrink-0"
                            />
                            <span className="w-6 text-sm font-bold text-gray-600">{key}.</span>
                            <input
                              required
                              placeholder={`Lựa chọn ${key}`}
                              value={qForm[fieldKey]}
                              onChange={e => setQForm(f => ({ ...f, [fieldKey]: e.target.value }))}
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                          </div>
                        )
                      })}
                      {!qForm.correctAnswer && (
                        <p className="text-xs text-orange-500 mt-1">⚠️ Chọn đáp án đúng bằng cách click vào radio bên trái</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── TRUE_FALSE ── */}
                {qForm.questionType === 'TRUE_FALSE' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Đáp án đúng *</label>
                    <div className="flex gap-4">
                      {['Đúng', 'Sai'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition ${
                          qForm.correctAnswer === opt
                            ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="tfCorrect"
                            value={opt}
                            checked={qForm.correctAnswer === opt}
                            onChange={() => setQForm(f => ({ ...f, correctAnswer: opt }))}
                            className="accent-purple-600"
                          />
                          {opt === 'Đúng' ? '✅' : '❌'} {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── MATCHING ── */}
                {qForm.questionType === 'MATCHING' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Các cặp nối *</label>
                      <button type="button" onClick={addMatchPair}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-semibold">
                        <Plus className="w-3.5 h-3.5" /> Thêm cặp
                      </button>
                    </div>
                    <div className="space-y-2">
                      {qForm.matchPairs.map((pair, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-5 flex-shrink-0">{i + 1}.</span>
                          <input
                            required
                            placeholder="Vế trái"
                            value={pair.left}
                            onChange={e => updateMatchPair(i, 'left', e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <span className="text-gray-400 text-sm">→</span>
                          <input
                            required
                            placeholder="Vế phải"
                            value={pair.right}
                            onChange={e => updateMatchPair(i, 'right', e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          {qForm.matchPairs.length > 1 && (
                            <button type="button" onClick={() => removeMatchPair(i)}
                              className="text-gray-400 hover:text-red-500 flex-shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">💡 Thứ tự các cặp chính là đáp án đúng</p>
                  </div>
                )}

                {/* ── ORDERING ── */}
                {qForm.questionType === 'ORDERING' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Các mục sắp xếp *</label>
                      <button type="button" onClick={addOrderItem}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-semibold">
                        <Plus className="w-3.5 h-3.5" /> Thêm mục
                      </button>
                    </div>
                    <div className="space-y-2">
                      {qForm.orderItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0">{i + 1}</span>
                          <input
                            required
                            placeholder={`Mục thứ ${i + 1}`}
                            value={item}
                            onChange={e => updateOrderItem(i, e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          {qForm.orderItems.length > 1 && (
                            <button type="button" onClick={() => removeOrderItem(i)}
                              className="text-gray-400 hover:text-red-500 flex-shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">💡 Thứ tự nhập vào ở đây chính là thứ tự đúng</p>
                  </div>
                )}

                {/* ── Form actions ── */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={savingQ}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                    {savingQ ? 'Đang lưu...' : '💾 Thêm câu hỏi'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowQForm(false); setQForm(DEFAULT_FORM) }}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                    Huỷ
                  </button>
                </div>
              </form>
            )}

            {!showQForm && (
              <p className="text-sm text-gray-400">Nhấn "Tạo câu hỏi mới" để thêm câu hỏi thủ công với nhiều loại câu hỏi phong phú.</p>
            )}
          </div>

          {/* ── 5. ĐÁP ÁN ── */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-600" />
              ✅ Đáp án & Hướng dẫn giải
              <span className="text-xs font-normal text-gray-400 ml-1">— Google Drive, PDF, Word...</span>
            </h2>

            {getMaterials('ANSWER').length > 0 && (
              <div className="space-y-2 mb-4">
                {getMaterials('ANSWER').map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg">
                    <FileText className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <a href={m.fileUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-green-700 hover:underline truncate flex items-center gap-1">
                      {m.title ?? 'Đáp án'} <ExternalLink className="w-3 h-3" />
                    </a>
                    <button onClick={() => handleDeleteMaterial(m.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveDapAn}>
              <ModeToggle
                mode={dapAnMode} setMode={setDapAnMode}
                labelA="Link URL" labelB="Upload file"
                iconA={<Link2 className="w-4 h-4" />} iconB={<Upload className="w-4 h-4" />}
              />
              {dapAnMode === 'url' ? (
                <div className="flex gap-2">
                  <input type="url" required value={dapAnUrl} onChange={e => setDapAnUrl(e.target.value)}
                    placeholder="https://drive.google.com/... hoặc link PDF đáp án..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  <button type="submit" disabled={savingDapAn || !dapAnUrl.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    {savingDapAn ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input type="file" accept=".doc,.docx,.pdf" onChange={e => setDapAnFile(e.target.files?.[0] ?? null)} className="hidden" />
                    <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer text-sm transition ${dapAnFile ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400 hover:border-green-300'}`}>
                      {dapAnFile ? dapAnFile.name : '📄 Chọn file Word/PDF'}
                    </div>
                  </label>
                  <button type="submit" disabled={savingDapAn || !dapAnFile}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    {savingDapAn ? 'Đang tải...' : 'Tải lên'}
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">💡 Khuyến nghị: dùng Google Drive (chia sẻ công khai) → paste link vào đây</p>
            </form>
          </div>

          {/* ── 6. VỞ GHI (info only) ── */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-300">
            <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              📓 Vở ghi (AI chấm)
            </h2>
            <p className="text-sm text-gray-500">
              Học viên tự viết bài giải tự luận → AI tự động chấm điểm và đưa ra nhận xét cá nhân hoá.
              Không cần admin upload nội dung.
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
