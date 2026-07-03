'use client'

import { useState, useEffect } from 'react'
import { BookOpen, FileText, ChevronLeft, Download, RefreshCw, Loader2 } from 'lucide-react'

interface FileInfo {
  name: string
  sizeKb: number
  updatedAt: string
}

const CATEGORY_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  'AvaB-Education-Standard': { label: 'Education Standard', color: 'bg-purple-100 text-purple-700', emoji: '📚' },
  'AvaB-Lesson-Standard': { label: 'Lesson Standard', color: 'bg-blue-100 text-blue-700', emoji: '📖' },
  'AvaB-Curriculum': { label: 'Curriculum Standard', color: 'bg-teal-100 text-teal-700', emoji: '🗂️' },
  'AvaB-Knowledge-Graph': { label: 'Knowledge Graph Standard', color: 'bg-orange-100 text-orange-700', emoji: '🔗' },
  'AvaB-Homework': { label: 'Homework Standard', color: 'bg-green-100 text-green-700', emoji: '✏️' },
  'AvaB-QA': { label: 'QA Standard', color: 'bg-red-100 text-red-700', emoji: '✅' },
  'AvaB-Publishing': { label: 'Publishing Standard', color: 'bg-pink-100 text-pink-700', emoji: '📤' },
}

function getCategory(name: string) {
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (name.startsWith(key)) return val
  }
  return { label: 'Standard', color: 'bg-gray-100 text-gray-600', emoji: '📄' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Simple markdown renderer
function MarkdownView({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="prose prose-sm max-w-none font-sans text-gray-800">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-purple-800 mt-6 mb-3 pb-2 border-b-2 border-purple-200">{line.slice(2)}</h1>
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-purple-700 mt-5 mb-2">{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-gray-800 mt-4 mb-1">{line.slice(4)}</h3>
        if (line.startsWith('#### ')) return <h4 key={i} className="text-base font-bold text-gray-700 mt-3 mb-1">{line.slice(5)}</h4>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 text-sm text-gray-700 my-0.5">{line.slice(2)}</li>
        if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-purple-300 pl-3 my-2 text-sm text-purple-700 bg-purple-50 py-1">{line.slice(2)}</blockquote>
        if (line.startsWith('```')) return <div key={i} className="bg-gray-100 rounded px-2 py-1 font-mono text-xs text-gray-600 my-1">{line}</div>
        if (line.startsWith('|')) return <div key={i} className="font-mono text-xs text-gray-600 bg-gray-50 px-2 border-b border-gray-200">{line}</div>
        if (line.trim() === '---') return <hr key={i} className="my-3 border-gray-200" />
        if (line.trim() === '') return <div key={i} className="h-2" />
        // Bold inline
        const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        return <p key={i} className="text-sm text-gray-700 my-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: bold }} />
      })}
    </div>
  )
}

export default function EducationStandardsPage() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingFile, setLoadingFile] = useState(false)

  const loadList = async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/admin/standards')
      const data = await res.json()
      setFiles(data.files || [])
    } catch {}
    setLoadingList(false)
  }

  const loadFile = async (filename: string) => {
    setSelected(filename)
    setLoadingFile(true)
    setContent('')
    try {
      const res = await fetch(`/api/admin/standards/${encodeURIComponent(filename)}`)
      const data = await res.json()
      setContent(data.content || '')
    } catch {}
    setLoadingFile(false)
  }

  useEffect(() => { loadList() }, [])

  // Group files by category
  const grouped: Record<string, FileInfo[]> = {}
  for (const f of files) {
    const cat = getCategory(f.name).label
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(f)
  }

  const totalSize = files.reduce((s, f) => s + f.sizeKb, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-teal-600 text-white p-4 sm:p-6">
        <a href="/admin" className="flex items-center gap-1 text-white/70 text-sm mb-3 hover:text-white">
          <ChevronLeft size={14} /> Admin
        </a>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-2xl font-black flex items-center gap-2">
              <BookOpen size={24} /> AvaB Standards Suite v1.0
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {files.length} tài liệu · {totalSize} KB · Hiến pháp giáo dục AvaB
            </p>
          </div>
          <button onClick={loadList} className="p-2 bg-white/10 rounded-xl hover:bg-white/20">
            <RefreshCw size={18} className={loadingList ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white overflow-y-auto lg:max-h-full max-h-64">
          {loadingList ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <Loader2 className="animate-spin mr-2" size={18} /> Đang tải...
            </div>
          ) : files.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có tài liệu</p>
              <p className="text-xs mt-1">Subagents đang tạo...</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, catFiles]) => (
              <div key={cat}>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cat}</span>
                </div>
                {catFiles.map(f => {
                  const meta = getCategory(f.name)
                  return (
                    <button
                      key={f.name}
                      onClick={() => loadFile(f.name)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-purple-50 transition-all ${selected === f.name ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">{meta.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {f.name.replace('AvaB-', '').replace('-v1.0', '').replace('.md', '').replace(/-/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-400">{f.sizeKb} KB · {formatDate(f.updatedAt)}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto min-h-[60vh] lg:min-h-0">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BookOpen size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-semibold">Chọn tài liệu để xem</p>
              <p className="text-sm mt-1">{files.length} standards có sẵn</p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg w-full px-4 sm:px-8">
                {Object.entries(CATEGORY_MAP).map(([, meta]) => (
                  <div key={meta.label} className={`rounded-xl px-3 py-2 text-sm font-semibold ${meta.color} flex items-center gap-2`}>
                    <span>{meta.emoji}</span> {meta.label}
                  </div>
                ))}
              </div>
            </div>
          ) : loadingFile ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Loader2 className="animate-spin mr-2" size={24} /> Đang tải nội dung...
            </div>
          ) : (
            <div className="p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">
                  {selected.replace('AvaB-', '').replace('-v1.0', '').replace('.md', '').replace(/-/g, ' ')}
                </h2>
                <a
                  href={`/api/admin/standards/${encodeURIComponent(selected)}`}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                  download={selected}
                >
                  <Download size={14} /> Tải xuống
                </a>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <MarkdownView content={content} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
