'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Plus, Trash2, FileText, BookOpen, Video, CheckSquare, Play, Link2, ExternalLink } from 'lucide-react'

interface Question {
  id: string
  order: number
  content: string
  correctAnswer: string
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

/** Chuyển Google Drive share link → embed/preview link */
function toEmbedUrl(url: string): string {
  if (!url) return url
  // Google Drive file: /file/d/ID/view → /file/d/ID/preview
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`
  // Google Docs/Slides/Sheets
  if (url.includes('docs.google.com') || url.includes('slides.google.com') || url.includes('sheets.google.com')) {
    return url.replace(/\/(edit|pub|view).*$/, '/preview')
  }
  // YouTube watch → embed
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Canva: trả nguyên
  return url
}

export default function AdminSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // ── BTVN Parse ──
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseResult, setParseResult] = useState<{ parsed: number; questions: Question[] } | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Manual question ──
  const [showQForm, setShowQForm] = useState(false)
  const [qForm, setQForm] = useState({ content: '', correctAnswer: '', points: '1' })

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

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject) return
    const fd = new FormData()
    const text = `1. ${qForm.content}\nĐáp án: ${qForm.correctAnswer}\nĐiểm: ${qForm.points}`
    fd.append('file', new Blob([text], { type: 'text/plain' }), 'question.txt')
    fd.append('save', 'true')
    await fetch(`/api/admin/subjects/${id}/parse-homework`, { method: 'POST', body: fd })
    setShowQForm(false)
    setQForm({ content: '', correctAnswer: '', points: '1' })
    load()
  }

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Xoá câu hỏi này?')) return
    await fetch(`/api/admin/subjects/${qId}`, { method: 'DELETE' })
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

        {/* ═══ 5 LOẠI NỘI DUNG ═══ */}
        <div className="space-y-4">

          {/* ── 1. BÀI GIẢNG (LÝ THUYẾT) ── */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              📖 Bài giảng (Lý thuyết)
              <span className="text-xs font-normal text-gray-400 ml-1">— Google Drive, Canva, PDF, Word...</span>
            </h2>

            {/* Danh sách đã lưu */}
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

          {/* ── 3. BTVN (Parse) ── */}
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
                      <p className="font-medium text-gray-800">{q.order}. {q.content}</p>
                      <p className="text-teal-600 mt-1">→ Đáp án: {q.correctAnswer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách câu hỏi + thêm thủ công */}
            <div className="mt-5 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Đã có: {subject.questions.length} câu hỏi</p>
                <button onClick={() => setShowQForm(!showQForm)} className="flex items-center gap-1 text-sm text-purple-600 font-semibold">
                  <Plus className="w-4 h-4" /> Thêm thủ công
                </button>
              </div>

              {showQForm && (
                <form onSubmit={handleAddQuestion} className="mb-4 p-4 bg-purple-50 rounded-xl space-y-3">
                  <textarea required placeholder="Nội dung câu hỏi" value={qForm.content}
                    onChange={e => setQForm(f => ({ ...f, content: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" rows={3} />
                  <div className="flex gap-3">
                    <input required placeholder="Đáp án đúng" value={qForm.correctAnswer}
                      onChange={e => setQForm(f => ({ ...f, correctAnswer: e.target.value }))}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                    <input type="number" min={1} value={qForm.points} onChange={e => setQForm(f => ({ ...f, points: e.target.value }))}
                      className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Điểm" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">Thêm</button>
                    <button type="button" onClick={() => setShowQForm(false)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm">Huỷ</button>
                  </div>
                </form>
              )}

              {subject.questions.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {subject.questions.map(q => (
                    <div key={q.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:border-purple-100">
                      <span className="text-sm text-gray-400 w-6 flex-shrink-0">{q.order}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 line-clamp-1">{q.content}</p>
                        <p className="text-xs text-teal-600 mt-0.5">Đáp án: {q.correctAnswer}</p>
                      </div>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 4. ĐÁP ÁN ── */}
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

          {/* ── 5. VỞ GHI (info only) ── */}
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
