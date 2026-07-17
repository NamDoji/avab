'use client'

import { useState, useEffect } from 'react'
import {
  Cpu, Zap, CheckCircle2, Clock, Bot, ChevronLeft,
  BookOpen, Settings, Wand2, History, GitBranch,
  FileText, BarChart3, Edit3, ExternalLink, RefreshCw,
  Loader2, ArrowRight, Layers, Shield, Activity,
  Sparkles, Play,
} from 'lucide-react'

// ─── Static Standards Config ───────────────────────────────────────────────

const STANDARDS: StandardConfig[] = [
  {
    id: 'education',
    prefix: 'AvaB-Education-Standard',
    name: 'Education Standard',
    desc: 'Khung chất lượng giáo dục cốt lõi — nền tảng cho mọi học liệu AvaB',
    emoji: '🎓',
    version: 'v1.0',
    status: 'stable',
    aiModel: 'gpt-4o',
    gradient: 'from-cherry-500 to-cherry-600',
    bg: 'bg-cherry-50',
    textColor: 'text-cherry-700',
    borderColor: 'border-cherry-200',
    dotColor: 'bg-cherry-500',
    category: 'Core',
  },
  {
    id: 'lesson',
    prefix: 'AvaB-Lesson-Standard',
    name: 'Lesson Standard',
    desc: 'Tiêu chuẩn thiết kế giáo án và tổ chức buổi học hiệu quả',
    emoji: '📖',
    version: 'v1.0',
    status: 'stable',
    aiModel: 'gpt-4o',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    category: 'Core',
  },
  {
    id: 'homework',
    prefix: 'AvaB-Homework',
    name: 'Homework Standard',
    desc: 'Tiêu chuẩn thiết kế bài tập về nhà và đánh giá năng lực',
    emoji: '✏️',
    version: 'v1.0',
    status: 'stable',
    aiModel: 'gpt-4o',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    category: 'Core',
  },
  {
    id: 'qa',
    prefix: 'AvaB-QA',
    name: 'QA Standard',
    desc: 'Đảm bảo chất lượng học liệu — quy trình kiểm duyệt và phê duyệt',
    emoji: '🛡️',
    version: 'v1.0',
    status: 'stable',
    aiModel: 'gpt-4o',
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500',
    category: 'Quality',
  },
  {
    id: 'curriculum',
    prefix: 'AvaB-Curriculum',
    name: 'Curriculum Standard',
    desc: 'Kiến trúc chương trình học — phân cấp Curriculum → Chapter → Topic → Lesson',
    emoji: '🗂️',
    version: 'v1.0',
    status: 'stable',
    aiModel: 'gpt-4o',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    category: 'Structure',
  },
  {
    id: 'knowledge-graph',
    prefix: 'AvaB-Knowledge-Graph',
    name: 'Knowledge Graph',
    desc: 'Bản đồ kiến thức — quan hệ phụ thuộc và lộ trình học tập thích ứng',
    emoji: '🔗',
    version: 'v1.0',
    status: 'beta',
    aiModel: 'gpt-4o',
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500',
    category: 'Structure',
  },
  {
    id: 'publishing',
    prefix: 'AvaB-Publishing',
    name: 'Publishing Standard',
    desc: 'Quy trình xuất bản học liệu — từ nháp đến production',
    emoji: '📤',
    version: 'v1.0',
    status: 'stable',
    aiModel: 'gpt-4o',
    gradient: 'from-pink-500 to-fuchsia-500',
    bg: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
    dotColor: 'bg-pink-500',
    category: 'Delivery',
  },
  {
    id: 'curriculum-arch',
    prefix: 'AvaB-Curriculum-Generator-Architecture',
    name: 'Curriculum Generator',
    desc: 'Kiến trúc AI sinh chương trình học tự động theo K12 Việt Nam',
    emoji: '⚡',
    version: 'v1.0',
    status: 'experimental',
    aiModel: 'gpt-4o',
    gradient: 'from-cherry-500 to-cherry-600',
    bg: 'bg-cherry-50',
    textColor: 'text-cherry-700',
    borderColor: 'border-cherry-200',
    dotColor: 'bg-cherry-500',
    category: 'AI',
  },
]

const WORKSPACE_TABS = [
  { id: 'overview',   label: 'Overview',    icon: BarChart3  },
  { id: 'config',     label: 'Config',      icon: Settings   },
  { id: 'prompt',     label: 'Prompt',      icon: Cpu        },
  { id: 'generate',   label: 'Generate',    icon: Wand2      },
  { id: 'history',    label: 'History',     icon: History    },
  { id: 'version',    label: 'Version',     icon: GitBranch  },
  { id: 'ai-logs',    label: 'AI Logs',     icon: Activity   },
  { id: 'docs',       label: 'Documentation', icon: FileText },
]

interface StandardConfig {
  id: string; prefix: string; name: string; desc: string; emoji: string
  version: string; status: string; aiModel: string; gradient: string
  bg: string; textColor: string; borderColor: string; dotColor: string; category: string
}

interface FileInfo { name: string; sizeKb: number; updatedAt: string }

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    stable:       { label: 'Stable',       cls: 'bg-emerald-100 text-emerald-700' },
    beta:         { label: 'Beta',         cls: 'bg-blue-100 text-blue-700' },
    experimental: { label: 'Experimental', cls: 'bg-amber-100 text-amber-700' },
    deprecated:   { label: 'Deprecated',   cls: 'bg-red-100 text-red-700' },
  }
  const m = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${m.cls}`}>{m.label}</span>
}

// ─── Markdown renderer ──────────────────────────────────────────────────────

function MdView({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-700 space-y-1">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('# '))   return <h1 key={i} className="text-xl font-black text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">{line.slice(2)}</h1>
        if (line.startsWith('## '))  return <h2 key={i} className="text-lg font-bold text-gray-800 mt-5 mb-2">{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-gray-700 mt-4 mb-1">{line.slice(4)}</h3>
        if (line.startsWith('#### '))return <h4 key={i} className="text-sm font-bold text-gray-600 mt-3 mb-1">{line.slice(5)}</h4>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 text-sm text-gray-600 my-0.5 list-disc">{line.slice(2)}</li>
        if (line.startsWith('> '))
          return <blockquote key={i} className="border-l-4 border-cherry-300 pl-3 my-2 text-sm text-cherry-700 bg-cherry-50 py-1 rounded-r">{line.slice(2)}</blockquote>
        if (line.trim() === '---') return <hr key={i} className="my-4 border-gray-200" />
        if (line.trim() === '')    return <div key={`sp-${i}`} className="h-2" />
        if (line.startsWith('|'))
          return <div key={i} className="font-mono text-xs text-gray-600 bg-gray-50 px-2 border-b border-gray-100">{line}</div>
        const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="bg-gray-100 text-cherry-700 px-1 rounded text-xs">$1</code>')
        return <p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
      })}
    </div>
  )
}

// ─── Standard Card ──────────────────────────────────────────────────────────

function StandardCard({ std, onOpen }: { std: StandardConfig; onOpen: () => void }) {
  return (
    <div className={`group relative bg-white rounded-2xl border ${std.borderColor} shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden`}>
      {/* Gradient accent line */}
      <div className={`h-1 w-full bg-gradient-to-r ${std.gradient}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl ${std.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
            {std.emoji}
          </div>
          <StatusPill status={std.status} />
        </div>

        {/* Name + desc */}
        <h3 className="font-black text-gray-900 text-sm mb-1 group-hover:text-cherry-700 transition-colors">
          {std.name}
        </h3>
        <p className="text-xs text-gray-500 leading-snug line-clamp-2 mb-4">{std.desc}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-bold ${std.textColor}`}>{std.version}</span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Bot size={10} /> {std.aiModel}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onOpen}
            className={`flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r ${std.gradient} text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 transition-all shadow-sm`}
          >
            <Zap size={12} /> Open Workspace
          </button>
          <button
            onClick={onOpen}
            className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            title="Documentation"
          >
            <FileText size={14} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Workspace Tabs Content ─────────────────────────────────────────────────

function OverviewTab({ std }: { std: StandardConfig }) {
  return (
    <div className="space-y-6">
      <div className={`rounded-2xl bg-gradient-to-br ${std.gradient} p-6 text-white`}>
        <div className="text-4xl mb-3">{std.emoji}</div>
        <h2 className="text-2xl font-black mb-1">{std.name}</h2>
        <p className="text-white/80 text-sm">{std.desc}</p>
        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <div className="text-xl font-black">{std.version}</div>
            <div className="text-xs text-white/60">Version</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <div className="text-xl font-black capitalize">{std.status}</div>
            <div className="text-xs text-white/60">Status</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <div className="text-xl font-black">{std.aiModel}</div>
            <div className="text-xs text-white/60">AI Model</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Shield,   label: 'Loại',     val: std.category },
          { icon: Bot,      label: 'AI Model', val: std.aiModel },
          { icon: GitBranch,label: 'Version',  val: std.version },
          { icon: CheckCircle2, label: 'Status', val: std.status },
          { icon: Layers,   label: 'Prefix',   val: std.prefix.replace('AvaB-', '') },
          { icon: Sparkles, label: 'Engine',   val: 'AvaB AI' },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">{label}</span>
            </div>
            <div className="text-sm font-bold text-gray-800 capitalize">{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfigTab({ std }: { std: StandardConfig }) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        ⚙️ Tính năng cấu hình AI Engine đang trong quá trình phát triển.
      </div>
      <div className="space-y-3">
        {[
          { label: 'AI Model', val: std.aiModel, type: 'select' },
          { label: 'Temperature', val: '0.7', type: 'range' },
          { label: 'Max Tokens', val: '4096', type: 'number' },
          { label: 'Language', val: 'Vietnamese (vi-VN)', type: 'select' },
          { label: 'Grade Context', val: 'K12 Việt Nam', type: 'select' },
        ].map(({ label, val, type }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-800">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{type === 'range' ? 'Creativity / Precision balance' : 'Current value'}</div>
              </div>
              <div className="text-sm font-mono text-cherry-700 bg-cherry-50 px-3 py-1 rounded-lg">
                {val}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PromptTab({ std }: { std: StandardConfig }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        🤖 System prompts cho <strong>{std.name}</strong> — sẽ được dùng khi AI generate học liệu theo standard này.
      </div>
      <div className="bg-gray-900 rounded-2xl p-5 font-mono text-sm">
        <div className="text-gray-400 text-xs mb-3 flex items-center gap-2">
          <Cpu size={12} /> SYSTEM PROMPT — {std.name.toUpperCase()}
        </div>
        <pre className="text-green-400 text-xs leading-relaxed whitespace-pre-wrap">{`You are an expert AI curriculum designer for AvaB Education Platform.
Apply the ${std.name} when generating all learning materials.

Standards version: ${std.version}
Context: K12 Vietnam Education System
Language: Vietnamese (primary)

Core principles:
1. Age-appropriate content for target grade level
2. Bloom's Taxonomy alignment (Remember → Create)
3. Vietnam Ministry of Education compliance
4. Engaging, interactive, and visual-first design
5. Formative assessment integration

Output format: Structured JSON with metadata`}
        </pre>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-800">Edit Prompt</span>
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Coming soon</span>
        </div>
        <p className="text-xs text-gray-400">Chỉnh sửa system prompt trực tiếp từ đây để tùy chỉnh AI behavior.</p>
      </div>
    </div>
  )
}

function GenerateTab({ std }: { std: StandardConfig }) {
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')

  const handleGenerate = async () => {
    if (!input.trim() || generating) return
    setGenerating(true)
    setResult('')
    // Simulate generation (replace with real API call)
    await new Promise(r => setTimeout(r, 1500))
    setResult(`✅ Generated using ${std.name} ${std.version}\n\nĐây là kết quả mẫu. Kết nối API generate để nhận nội dung thực tế từ AI.\n\nTopic: ${input}`)
    setGenerating(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 size={18} className="text-cherry-600" />
          <span className="font-bold text-gray-800">Generate Content</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Topic / Chủ đề</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-cherry-300 focus:border-transparent outline-none"
              rows={3}
              placeholder={`Nhập chủ đề cần generate theo ${std.name}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Khối lớp</label>
              <select className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-cherry-300 outline-none">
                <option value="">Chọn lớp</option>
                <option>Mầm non</option>
                {Array.from({ length: 12 }, (_, i) => <option key={i+1}>Lớp {i + 1}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Môn học</label>
              <select className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-cherry-300 outline-none">
                <option>Toán Tư Duy</option>
                <option>Toán</option>
                <option>Tiếng Anh</option>
                <option>Khoa học</option>
                <option>Lịch sử</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || generating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cherry-600 to-cherry-600 text-white font-bold py-3 rounded-xl hover:from-cherry-700 hover:to-cherry-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {generating ? 'Đang generate...' : 'Generate'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-gray-900 rounded-2xl p-5">
          <div className="text-gray-400 text-xs mb-3 flex items-center gap-2">
            <Sparkles size={12} className="text-cherry-400" /> OUTPUT
          </div>
          <pre className="text-gray-100 text-sm whitespace-pre-wrap leading-relaxed">{result}</pre>
        </div>
      )}
    </div>
  )
}

function HistoryTab() {
  const items = [
    { date: '2026-07-04 03:02', action: 'Branding update — K12 generic', user: 'Admin', type: 'update' },
    { date: '2026-07-01 02:00', action: 'Standards Suite v1.0 published', user: 'Admin', type: 'publish' },
    { date: '2026-06-30 22:00', action: 'Initial creation', user: 'Admin', type: 'create' },
  ]
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
            item.type === 'publish' ? 'bg-green-500' :
            item.type === 'update' ? 'bg-blue-500' : 'bg-gray-400'
          }`} />
          <div>
            <p className="text-sm font-semibold text-gray-800">{item.action}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.date} · {item.user}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function VersionTab({ std }: { std: StandardConfig }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cherry-100 rounded-lg flex items-center justify-center">
                <GitBranch size={16} className="text-cherry-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{std.version} — Current</div>
                <div className="text-xs text-gray-400">Released 2026-07-01</div>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">LATEST</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">Changelog</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2"><span className="text-green-500">+</span> Initial release with full standard definition</li>
            <li className="flex gap-2"><span className="text-green-500">+</span> K12 Vietnam curriculum alignment</li>
            <li className="flex gap-2"><span className="text-green-500">+</span> Bloom&apos;s Taxonomy integration</li>
          </ul>
        </div>
      </div>
      <div className="text-center py-6 text-gray-400">
        <GitBranch size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Chưa có version cũ hơn</p>
      </div>
    </div>
  )
}

function AILogsTab({ std }: { std: StandardConfig }) {
  return (
    <div className="space-y-3">
      <div className="bg-gray-900 rounded-2xl p-4">
        <div className="text-gray-400 text-xs mb-3 flex items-center gap-2">
          <Activity size={12} className="text-green-400" /> LIVE LOGS — {std.name}
        </div>
        <div className="space-y-1 font-mono text-xs">
          {[
            { time: '03:02:37', msg: `[INFO] ${std.name} loaded — version ${std.version}`, col: 'text-gray-300' },
            { time: '03:02:38', msg: `[INFO] AI model: ${std.aiModel}`, col: 'text-gray-300' },
            { time: '03:02:38', msg: '[INFO] K12 context initialized — VN curriculum', col: 'text-gray-300' },
            { time: '03:02:39', msg: '[OK] Standard ready for generation', col: 'text-green-400' },
            { time: '03:02:40', msg: '[INFO] No active generation jobs', col: 'text-gray-400' },
          ].map((log, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-gray-600 shrink-0">{log.time}</span>
              <span className={log.col}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        📊 AI Logs real-time sẽ hiển thị khi có generation jobs chạy.
      </div>
    </div>
  )
}

function DocsTab({ std, files }: { std: StandardConfig; files: FileInfo[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const stdFiles = files.filter(f => f.name.startsWith(std.prefix))

  const loadFile = async (filename: string) => {
    setSelected(filename)
    setLoading(true)
    setContent('')
    try {
      const res = await fetch(`/api/admin/standards/${encodeURIComponent(filename)}`)
      const data = await res.json()
      setContent(data.content || '')
    } catch {}
    setLoading(false)
  }

  if (stdFiles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileText size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Chưa có tài liệu</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!selected ? (
        <>
          <p className="text-sm font-bold text-gray-700">{stdFiles.length} file</p>
          {stdFiles.map(f => (
            <button
              key={f.name}
              onClick={() => loadFile(f.name)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-cherry-300 hover:bg-cherry-50/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-gray-400 group-hover:text-cherry-500 transition-colors" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-cherry-700">
                      {f.name.replace('AvaB-', '').replace('-v1.0', '').replace('.md', '').replace(/-/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400">{f.sizeKb} KB</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-cherry-400 transition-colors" />
              </div>
            </button>
          ))}
        </>
      ) : (
        <>
          <button
            onClick={() => { setSelected(null); setContent('') }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2"
          >
            <ChevronLeft size={14} /> Danh sách file
          </button>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="animate-spin mr-2" size={18} /> Đang tải...
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <MdView content={content} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Workspace View ─────────────────────────────────────────────────────────

function WorkspaceView({
  std, files, onBack,
}: {
  std: StandardConfig; files: FileInfo[]; onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Workspace Header */}
      <div className={`bg-gradient-to-r ${std.gradient} text-white px-6 py-5`}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
          <ChevronLeft size={16} /> AI Engine
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            {std.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black">{std.name}</h1>
              <StatusPill status={std.status} />
            </div>
            <p className="text-white/70 text-sm">{std.version} · {std.aiModel} · {std.category}</p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto scrollbar-none">
          {WORKSPACE_TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-cherry-600 text-cherry-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl mx-auto p-6">
        {activeTab === 'overview'  && <OverviewTab std={std} />}
        {activeTab === 'config'    && <ConfigTab std={std} />}
        {activeTab === 'prompt'    && <PromptTab std={std} />}
        {activeTab === 'generate'  && <GenerateTab std={std} />}
        {activeTab === 'history'   && <HistoryTab />}
        {activeTab === 'version'   && <VersionTab std={std} />}
        {activeTab === 'ai-logs'   && <AILogsTab std={std} />}
        {activeTab === 'docs'      && <DocsTab std={std} files={files} />}
      </div>
    </div>
  )
}

// ─── Dashboard View ──────────────────────────────────────────────────────────

function DashboardView({
  files, onOpenStandard,
}: {
  files: FileInfo[]; onOpenStandard: (std: StandardConfig) => void
}) {
  const lastUpdated = files.length
    ? new Date(Math.max(...files.map(f => new Date(f.updatedAt).getTime())))
        .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  const grouped = STANDARDS.reduce<Record<string, StandardConfig[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-cherry-900 to-cherry-900 text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cherry-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <a href="/admin" className="flex items-center gap-1 text-white/50 text-sm mb-5 hover:text-white transition-colors relative">
          <ChevronLeft size={14} /> Admin
        </a>
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cherry-400 via-cherry-400 to-cherry-400 rounded-2xl flex items-center justify-center text-3xl shadow-xl">
              <Cpu size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-black">AI Engine</h1>
                <span className="text-[10px] bg-cherry-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Admin</span>
              </div>
              <p className="text-cherry-300 text-sm">Cấu hình và quản trị Standards — không phải thư viện tài liệu</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { icon: Layers,      label: 'Standards',     val: String(STANDARDS.length) },
            { icon: CheckCircle2,label: 'Stable',        val: String(STANDARDS.filter(s => s.status === 'stable').length) },
            { icon: GitBranch,   label: 'Version',       val: 'v1.0' },
            { icon: Clock,       label: 'Cập nhật',      val: lastUpdated },
            { icon: Bot,         label: 'AI Model',      val: 'gpt-4o' },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={13} className="text-cherry-300" />
                <span className="text-xs text-white/50">{label}</span>
              </div>
              <div className="font-black text-white text-sm">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Standards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {Object.entries(grouped).map(([category, stds]) => (
          <section key={category}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{category}</span>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{stds.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stds.map(std => (
                <StandardCard
                  key={std.id}
                  std={std}
                  onOpen={() => onOpenStandard(std)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AIEnginePage() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [activeStandard, setActiveStandard] = useState<StandardConfig | null>(null)

  useEffect(() => {
    fetch('/api/admin/standards')
      .then(r => r.json())
      .then(d => setFiles(d.files || []))
      .catch(() => {})
  }, [])

  if (activeStandard) {
    return (
      <WorkspaceView
        std={activeStandard}
        files={files}
        onBack={() => setActiveStandard(null)}
      />
    )
  }

  return (
    <DashboardView
      files={files}
      onOpenStandard={setActiveStandard}
    />
  )
}
