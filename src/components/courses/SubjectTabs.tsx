'use client'

import { useState } from 'react'
import { Loader2, VideoOff, Star, Maximize2, Minimize2 } from 'lucide-react'
import { IDETab } from './IDETab'
import ReactMarkdown from 'react-markdown'

// ── Markdown renderer — renders bài giảng đẹp ───────────────────────────
function MarkdownLesson({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none break-words
      prose-headings:font-black prose-headings:text-gray-900
      prose-h1:text-xl prose-h1:mt-0
      prose-h2:text-base prose-h2:text-purple-700 prose-h2:border-b prose-h2:border-purple-100 prose-h2:pb-1
      prose-h3:text-sm prose-h3:text-gray-800
      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-2
      prose-li:text-gray-700 prose-li:my-0.5
      prose-strong:text-gray-900
      prose-table:text-sm prose-table:w-full
      prose-th:bg-purple-50 prose-th:text-purple-800 prose-th:font-bold prose-th:text-xs prose-th:p-2
      prose-td:p-2 prose-td:border-gray-200 prose-td:text-xs prose-td:align-top
      prose-pre:bg-gray-900 prose-pre:rounded-xl prose-pre:text-xs prose-pre:overflow-x-auto
      prose-code:bg-gray-100 prose-code:text-purple-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
      prose-blockquote:border-purple-300 prose-blockquote:bg-purple-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1
      [&_table]:border-collapse [&_td]:border [&_th]:border">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

// ── Smart answer matching (giống server-side) ───────────────────────────────
function smartMatch(student: string, correct: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase()
    .replace(/[()[\]{}]/g, ' ').replace(/[.,;:!?]/g, '').replace(/\s+/g, ' ').trim()
  const a = norm(student), b = norm(correct)
  if (!a) return false
  if (a === b) return true
  const numA = a.match(/^(\d+([.,]\d+)?)/)?.[0]?.replace(',', '.')
  const numB = b.match(/^(\d+([.,]\d+)?)/)?.[0]?.replace(',', '.')
  if (numA && numB && numA === numB) return true
  if (b.startsWith(a) || a.startsWith(b)) return true
  return false
}

// ── Check answer by question type ──────────────────────────────────────────
function checkAnswerByType(answer: string, q: Question): boolean {
  if (!answer.trim()) return false
  const qType = (q.questionType || 'OPEN').toUpperCase()

  if (qType === 'MULTIPLE_CHOICE' || qType === 'TRUE_FALSE') {
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
  }

  if (qType === 'MATCHING') {
    try {
      // Parse bất kể format: JSON array hoặc "left=right,left=right"
      const parseMatchPairs = (s: string): Record<string, string> => {
        const map: Record<string, string> = {}
        if (s.trim().startsWith('[')) {
          JSON.parse(s).forEach((p: any) => {
            if (p.left && p.right) map[p.left.trim().toLowerCase()] = p.right.trim().toLowerCase()
          })
        } else {
          s.split(',').forEach(pair => {
            const idx = pair.indexOf('=')
            if (idx > 0) map[pair.slice(0, idx).trim().toLowerCase()] = pair.slice(idx + 1).trim().toLowerCase()
          })
        }
        return map
      }
      const correctMap = parseMatchPairs(q.correctAnswer)
      const studentMap = parseMatchPairs(answer)
      const filled = Object.entries(studentMap).filter(([, v]) => v)
      return filled.length > 0 && filled.every(([k, v]) => correctMap[k] ? smartMatch(v, correctMap[k]) : false)
    } catch { return false }
  }

  if (qType === 'ORDERING') {
    const studentLines = answer.split('\n').map(l => l.trim()).filter(Boolean)
    try {
      const correctOrder = JSON.parse(q.correctAnswer) as string[]
      return (
        correctOrder.length === studentLines.length &&
        correctOrder.every((item, i) => smartMatch(studentLines[i], item))
      )
    } catch {
      const correctItems = q.correctAnswer.split(',').map(s => s.trim())
      return (
        correctItems.length === studentLines.length &&
        correctItems.every((item, i) => smartMatch(studentLines[i], item))
      )
    }
  }

  return smartMatch(answer, q.correctAnswer)
}

// ── Web Audio: âm thanh không cần file ────────────────────────────────────
function playSound(type: 'correct' | 'wrong' | 'complete') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const play = (freq: number, t: number, dur: number, wave: OscillatorType = 'sine', vol = 0.3) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = wave; osc.frequency.value = freq
      gain.gain.setValueAtTime(vol, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
      osc.start(t); osc.stop(t + dur)
    }
    const now = ctx.currentTime
    if (type === 'correct') {
      play(523, now,        0.18, 'sine', 0.35)
      play(659, now + 0.12, 0.18, 'sine', 0.35)
      play(784, now + 0.22, 0.28, 'sine', 0.35)
    } else if (type === 'wrong') {
      play(440, now,        0.15, 'sine', 0.2)
      play(330, now + 0.18, 0.25, 'sine', 0.15)
    } else if (type === 'complete') {
      ;[523,659,784,1047,1319].forEach((f, i) => play(f, now + i*0.13, 0.35, 'sine', 0.38))
      play(1047, now + 0.7, 0.6, 'sine', 0.3)
    }
  } catch {}
}

// ── Màn hình chúc mừng ──────────────────────────────────────────────────────
function CongratScreen({ name, correct, total, onClose, onRetryAll, onRetryWrong }: {
  name: string; correct: number; total: number
  onClose: () => void; onRetryAll: () => void; onRetryWrong: () => void
}) {
  const pct  = total > 0 ? Math.round(correct / total * 100) : 0
  const star = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0
  const msg  = pct >= 90 ? 'Tuyệt vời! Con giỏi lắm! 🌟'
             : pct >= 70 ? 'Rất tốt! Cố gắng thêm nhé! 💪'
             : pct >= 50 ? 'Cố lên! Lần sau sẽ tốt hơn! 🎯'
             : 'Không sao! Xem lại lời giải và thử lại nhé! 📖'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="bg-white rounded-4xl p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="text-6xl mb-2 animate-bounce">🎉</div>
        <h2 className="text-2xl font-black text-purple-700 mb-1">Chúc mừng con!</h2>
        <p className="text-xl font-bold text-gray-800 mb-4">{name}</p>
        <div className="flex justify-center gap-2 mb-4">
          {[1,2,3].map(s => (
            <Star key={s} size={40}
              className={s <= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
            />
          ))}
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-5 text-white mb-4">
          <div className="text-5xl font-black text-yellow-300 mb-1">{correct}<span className="text-2xl text-white/60">/{total}</span></div>
          <p className="text-white/80 text-sm">câu đúng · {pct}% chính xác</p>
        </div>
        <p className="text-gray-600 font-semibold mb-5">{msg}</p>
        <div className="flex flex-col gap-2">
          <button onClick={onClose} className="btn-primary w-full !py-3 text-sm">Tiếp tục học 📚</button>
          <div className="flex gap-2">
            <button onClick={onRetryAll} className="flex-1 py-2.5 bg-purple-100 text-purple-700 font-bold rounded-2xl hover:bg-purple-200 transition text-sm">
              🔄 Làm lại toàn bộ
            </button>
            {correct < total && (
              <button onClick={onRetryWrong} className="flex-1 py-2.5 bg-orange-100 text-orange-700 font-bold rounded-2xl hover:bg-orange-200 transition text-sm">
                💡 Làm lại câu chưa đúng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Smart URL resolver ──────────────────────────────────────────────────────
function resolveEmbedUrl(url: string): { kind: 'iframe' | 'video' | 'link'; src: string } {
  if (!url) return { kind: 'link', src: url }
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` }
  if (url.includes('youtube.com/embed/')) return { kind: 'iframe', src: url }
  const gd = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (gd) return { kind: 'iframe', src: `https://drive.google.com/file/d/${gd[1]}/preview` }
  if (url.includes('drive.google.com') && url.includes('/preview')) return { kind: 'iframe', src: url }
  if (url.match(/docs\.google\.com|slides\.google\.com|sheets\.google\.com/)) {
    return { kind: 'iframe', src: url.replace(/\/(edit|pub|view)(\?.*)?$/, '/preview') }
  }
  if (url.includes('canva.com')) return { kind: 'iframe', src: url }
  if (url.match(/\.pdf(\?|$)/i)) return { kind: 'iframe', src: url }
  if (url.match(/\.(mp4|mov|webm|avi)(\?|$)/i)) return { kind: 'video', src: url }
  return { kind: 'link', src: url }
}

function MaterialView({ url, title }: { url: string; title?: string | null }) {
  const r = resolveEmbedUrl(url)
  if (r.kind === 'iframe') return (
    <div>
      <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200">
        <iframe src={r.src} className="w-full h-full" allowFullScreen title={title ?? 'Tài liệu'} />
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-purple-600 text-xs hover:underline">
        🔗 Mở trong tab mới
      </a>
    </div>
  )
  if (r.kind === 'video') return <video src={r.src} controls className="w-full rounded-2xl" />
  return (
    <a href={r.src} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 text-purple-700 hover:bg-purple-100 transition">
      📥 {title ?? 'Tải về tài liệu'}
    </a>
  )
}

// ── Video Panel (right side) ────────────────────────────────────────────────
function VideoPanel({ videoMaterial }: { videoMaterial: { fileUrl: string | null; content: string | null; title: string | null } | null }) {
  const url = videoMaterial?.fileUrl || videoMaterial?.content || ''
  const r = url ? resolveEmbedUrl(url) : null
  return (
    <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-xl">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
        <span className="text-red-400 text-lg">🎬</span>
        <span className="text-white font-bold text-sm">Video bài giảng</span>
      </div>
      {r && (r.kind === 'iframe' || r.kind === 'video') ? (
        <div className="aspect-video w-full">
          {r.kind === 'iframe'
            ? <iframe src={r.src} className="w-full h-full" allowFullScreen title="Video bài giảng" />
            : <video src={r.src} controls className="w-full h-full" />
          }
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden">
          {/* Ảnh mặc định giáo viên */}
          <img
            src="/default-teacher.jpg"
            alt="Bảo Nam"
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
            <p className="text-white font-bold text-sm">🎥 Video sắp ra mắt</p>
            <p className="text-white/70 text-xs mt-0.5">Giờ học trực tiếp với thầy Bảo Nam — cập nhật sớm!</p>
          </div>
        </div>
      )}
      {url && (
        <div className="px-4 py-2 border-t border-white/10">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1">
            🔗 Mở video trong tab mới
          </a>
        </div>
      )}
    </div>
  )
}

// ── Types ───────────────────────────────────────────────────────────────────
interface QuestionOption {
  key?: string
  text?: string
  left?: string
  right?: string
}

interface Question {
  id: string; order: number; content: string
  correctAnswer: string; explanation?: string; points: number
  /** "OPEN" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MATCHING" | "ORDERING" */
  questionType?: string
  /** Varies by type: MC/TF → {key,text}[], MATCHING → {left,right}[], ORDERING → string[] */
  options?: QuestionOption[] | string[]
  /** Optional image shown above question text */
  imageUrl?: string
}

interface Material {
  id: string; type: string; title: string | null
  content: string | null; fileUrl: string | null; fileName: string | null
}
interface Top5Entry { rank: number; userId: string; name: string; score: number; isMe: boolean }
type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const IDE_COURSE_TYPES: CourseType[] = ['LAP_TRINH_SCRATCH', 'LAP_TRINH_PYTHON', 'LAP_TRINH_CPP', 'LAP_TRINH_THUAT_TOAN']

const IDE_TAB_LABEL: Partial<Record<CourseType, { label: string; emoji: string }>> = {
  LAP_TRINH_SCRATCH:    { label: 'Scratch IDE', emoji: '🐱' },
  LAP_TRINH_PYTHON:     { label: 'Python IDE',  emoji: '🐍' },
  LAP_TRINH_CPP:        { label: 'C++ Editor',  emoji: '⚡' },
  LAP_TRINH_THUAT_TOAN: { label: 'Robot',       emoji: '🤖' },
}

interface Props {
  subject: { id: string; name: string; courseId: string }
  materials: Material[]
  questions: Question[]
  answersMap: Record<string, { answer: string; isCorrect: boolean; score: number }>
  top5: Top5Entry[]
  userId: string
  userName: string
  courseType?: CourseType
  mySubjectScore?: number
  myTotalScore?: number
  maxScore?: number
}

// ── Tabs ───────────────────────────────────────────────────────────────────
const BASE_TABS = [
  { id: 'homework', label: 'BTVN',      emoji: '✏️' },
  { id: 'theory',   label: 'Bài giảng', emoji: '📖' },
  { id: 'answer',   label: 'Đáp án',    emoji: '✅' },
  { id: 'top5',     label: 'Điểm',      emoji: '⭐' },
]
const NOTEBOOK_TAB = { id: 'notebook', label: 'Vở viết', emoji: '📓' }

// ── Child-friendly option palettes for MULTIPLE_CHOICE ────────────────────
// A = blue, B = green, C = yellow, D = red/orange
const MC_COLORS = [
  { // A — Blue
    base:    'bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200 hover:border-blue-500 hover:scale-[1.02]',
    sel:     'bg-blue-200 border-blue-700 text-blue-900 border-4 scale-105 shadow-lg shadow-blue-200',
    keyBase: 'bg-blue-500 text-white',
    keySel:  'bg-blue-700 text-white',
  },
  { // B — Green
    base:    'bg-green-100 border-green-400 text-green-900 hover:bg-green-200 hover:border-green-500 hover:scale-[1.02]',
    sel:     'bg-green-200 border-green-700 text-green-900 border-4 scale-105 shadow-lg shadow-green-200',
    keyBase: 'bg-green-500 text-white',
    keySel:  'bg-green-700 text-white',
  },
  { // C — Yellow
    base:    'bg-yellow-100 border-yellow-400 text-yellow-900 hover:bg-yellow-200 hover:border-yellow-500 hover:scale-[1.02]',
    sel:     'bg-yellow-100 border-yellow-600 text-yellow-900 border-4 scale-105 shadow-lg shadow-yellow-200',
    keyBase: 'bg-yellow-500 text-white',
    keySel:  'bg-yellow-600 text-white',
  },
  { // D — Red/Orange
    base:    'bg-red-100 border-red-400 text-red-900 hover:bg-red-200 hover:border-red-500 hover:scale-[1.02]',
    sel:     'bg-red-200 border-red-700 text-red-900 border-4 scale-105 shadow-lg shadow-red-200',
    keyBase: 'bg-red-500 text-white',
    keySel:  'bg-red-700 text-white',
  },
]

// ── Main Component ──────────────────────────────────────────────────────────
export function SubjectTabs({ subject, materials, questions, answersMap, top5, userId, userName, courseType, mySubjectScore = 0, myTotalScore = 0, maxScore = 0 }: Props) {
  const hasIDE = courseType && IDE_COURSE_TYPES.includes(courseType)
  const TABS = hasIDE
    ? [...BASE_TABS.slice(0,2), { id: 'ide', ...(IDE_TAB_LABEL[courseType!] ?? { label: 'IDE', emoji: '💻' }) }, ...BASE_TABS.slice(2)]
    : [...BASE_TABS.slice(0,2), NOTEBOOK_TAB, ...BASE_TABS.slice(2)]
  const [activeTab, setActiveTab] = useState('homework')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoCollapsed, setVideoCollapsed] = useState(false)
  const [expandedQ, setExpandedQ] = useState<string | null>(null)

  // Answer state
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(answersMap).map(([k, v]) => [k, v.answer]))
  )
  // Matching inputs: qId → { leftItem → studentAnswer }
  const [matchingInputs, setMatchingInputs] = useState<Record<string, Record<string, string>>>({})

  const [submitted, setSubmitted] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.entries(answersMap).map(([k]) => [k, true]))
  )
  const [results, setResults] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.entries(answersMap).map(([k, v]) => [k, v.isCorrect]))
  )
  const [showHint, setShowHint] = useState<Record<string, boolean>>({})
  const [hintPeeked, setHintPeeked] = useState<Record<string, boolean>>({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [submittingAll, setSubmittingAll] = useState(false)
  const [notebookText, setNotebookText] = useState('')
  const [notebookSubmitting, setNotebookSubmitting] = useState(false)
  const [notebookResult, setNotebookResult] = useState<any>(null)
  const [notebookDone, setNotebookDone] = useState<Record<string, boolean>>({})
  const [notebookQ, setNotebookQ] = useState<string | null>(null)
  const [showCongrat, setShowCongrat] = useState(false)

  const getMaterial = (type: string) => materials.filter((m) => m.type === type)
  const videoMaterial = getMaterial('VIDEO')[0] ?? null

  // ── Compute the final answer string for any question type ─────────────────
  const computeAnswer = (q: Question): string => {
    const qType = (q.questionType || 'OPEN').toUpperCase()
    if (qType === 'MATCHING') {
      // Extract left keys via regex — works even when options is null/undefined
      const getLeftKeys = (src: string) =>
        [...src.matchAll(/"left"\s*:\s*"([^"]+)"/g)].map(m => m[1])
      let leftKeys: string[] = []
      const rawO = q.options
      if (Array.isArray(rawO) && rawO.length > 0 && (rawO[0] as any)?.left)
        leftKeys = (rawO as any[]).map((o: any) => String(o.left ?? '')).filter(Boolean)
      if (!leftKeys.length && q.correctAnswer)
        leftKeys = getLeftKeys(q.correctAnswer)
      return leftKeys.map(l => `${l}=${matchingInputs[q.id]?.[l] || ''}`).join(',')
    }
    return userAnswers[q.id] || ''
  }

  // ── Matching helper ───────────────────────────────────────────────────────
  const handleMatchingInput = (qId: string, leftKey: string, value: string) => {
    setMatchingInputs(prev => ({
      ...prev,
      [qId]: { ...(prev[qId] || {}), [leftKey]: value },
    }))
  }

  // ── Submit one question ───────────────────────────────────────────────────
  const handleAnswerQ = async (q: Question) => {
    const ans = computeAnswer(q)
    if (!ans.trim()) return
    const isCorrect = checkAnswerByType(ans, q)
    setSubmitted((p) => ({ ...p, [q.id]: true }))
    setResults((p) => ({ ...p, [q.id]: isCorrect }))
    playSound(isCorrect ? 'correct' : 'wrong')
    await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: subject.id,
        answers: [{ questionId: q.id, answer: ans, hintPenalty: hintPeeked[q.id] ? 0.5 : 0 }],
      }),
    }).catch(() => {})
  }

  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = (onlyWrong: boolean) => {
    setAiResult(null)
    setShowCongrat(false)
    setExpandedQ(null)
    if (onlyWrong) {
      const wrongIds = questions.filter(q => submitted[q.id] && !results[q.id]).map(q => q.id)
      setSubmitted(p     => { const n = { ...p }; wrongIds.forEach(id => delete n[id]); return n })
      setResults(p       => { const n = { ...p }; wrongIds.forEach(id => delete n[id]); return n })
      setUserAnswers(p   => { const n = { ...p }; wrongIds.forEach(id => delete n[id]); return n })
      setShowHint(p      => { const n = { ...p }; wrongIds.forEach(id => delete n[id]); return n })
      setHintPeeked(p    => { const n = { ...p }; wrongIds.forEach(id => delete n[id]); return n })
      setMatchingInputs(p => { const n = { ...p }; wrongIds.forEach(id => delete n[id]); return n })
    } else {
      setSubmitted({}); setResults({}); setUserAnswers({})
      setShowHint({}); setHintPeeked({}); setMatchingInputs({})
    }
  }

  // ── Submit all ────────────────────────────────────────────────────────────
  const handleSubmitAll = async () => {
    setSubmittingAll(true)
    for (const q of questions.filter((q) => !submitted[q.id] && computeAnswer(q).trim())) {
      await handleAnswerQ(q)
    }
    playSound('complete')
    setShowCongrat(true)
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: subject.id }),
      })
      const data = await res.json()
      if (data.success) setAiResult(data.data)
    } catch {}
    setAiLoading(false)
    setSubmittingAll(false)
  }

  const handleNotebookSubmit = async () => {
    if (!notebookText.trim()) return
    setNotebookSubmitting(true)
    try {
      const res = await fetch('/api/ai/grade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: subject.id, subjectName: subject.name, studentText: notebookText }),
      })
      const data = await res.json()
      setNotebookResult(data.success ? data.data : { score: 0, feedback: 'Có lỗi xảy ra.', pathway: '', prediction: '' })
    } catch {
      setNotebookResult({ score: 0, feedback: 'Không thể kết nối.', pathway: '', prediction: '' })
    }
    setNotebookSubmitting(false)
  }

  const totalAnswered = questions.filter((q) => submitted[q.id]).length
  const totalCorrect  = questions.filter((q) => results[q.id] === true).length
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  // ── Render question input by type ─────────────────────────────────────────
  const renderQuestionInput = (q: Question, isDone: boolean, isCorrect: boolean) => {
    const qType = (q.questionType || 'OPEN').toUpperCase()
    const selectedAns = userAnswers[q.id] || ''

    // ── MULTIPLE_CHOICE ──────────────────────────────────────────────────────
    if (qType === 'MULTIPLE_CHOICE') {
      const opts = (q.options || []) as QuestionOption[]
      return (
        <div className="mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {opts.map((opt, i) => {
              const key = opt.key || String(i)
              const text = opt.text || ''
              const isSelected = selectedAns === key
              const isThisCorrect = isDone && key.toLowerCase() === q.correctAnswer.trim().toLowerCase()
              const isThisWrong   = isDone && isSelected && !isCorrect
              const palette = MC_COLORS[i] || MC_COLORS[0]

              // Card: min-h-[60px], large rounded, bold text, transition
              let cls = 'flex items-center gap-3 px-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 text-left font-black text-base w-full min-h-[60px] shadow-sm '
              if (isDone) {
                if (isThisCorrect)   cls += 'bg-teal-100 border-teal-500 text-teal-800 border-4'
                else if (isThisWrong) cls += 'bg-orange-100 border-orange-400 text-orange-800'
                else                  cls += 'bg-gray-50 border-gray-200 text-gray-400'
              } else {
                cls += isSelected ? palette.sel : palette.base
              }

              // Key bubble
              let keyBgCls = 'w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shrink-0 '
              if (isDone) {
                keyBgCls += isThisCorrect ? 'bg-teal-500 text-white' : isThisWrong ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-500'
              } else {
                keyBgCls += isSelected ? palette.keySel : palette.keyBase
              }

              return (
                <button key={key} disabled={isDone}
                  onClick={() => setUserAnswers(p => ({ ...p, [q.id]: key }))}
                  className={cls}>
                  <span className={keyBgCls}>{key}</span>
                  <span className="flex-1 leading-snug py-2">{text}</span>
                  {isDone && isThisCorrect && <span className="text-2xl shrink-0">✅</span>}
                  {isDone && isThisWrong   && <span className="text-2xl shrink-0">💡</span>}
                </button>
              )
            })}
          </div>
          {!isDone && (
            <button onClick={() => handleAnswerQ(q)}
              disabled={!selectedAns}
              className="btn-primary !py-4 !px-6 !text-lg font-black disabled:opacity-40 w-full rounded-2xl shadow-md">
              ✅ Xác nhận →
            </button>
          )}
        </div>
      )
    }

    // ── TRUE_FALSE ───────────────────────────────────────────────────────────
    if (qType === 'TRUE_FALSE') {
      return (
        <div className="mb-3">
          {/* Two giant buttons: min-h-[72px] */}
          <div className="flex gap-3 mb-4">
            {[
              { key: 'Đúng', emoji: '✅', bgBase: 'bg-teal-100 border-teal-400 text-teal-800 hover:bg-teal-200 hover:border-teal-500', bgSel: 'bg-teal-500 border-teal-500 text-white scale-105 shadow-xl shadow-teal-300' },
              { key: 'Sai',  emoji: '❌', bgBase: 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200 hover:border-red-500',     bgSel: 'bg-red-500 border-red-500 text-white scale-105 shadow-xl shadow-red-300'   },
            ].map(opt => {
              const isSelected    = selectedAns === opt.key
              const isThisCorrect = isDone && opt.key.toLowerCase() === q.correctAnswer.trim().toLowerCase()
              const isThisWrong   = isDone && isSelected && !isCorrect

              let cls = 'flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 cursor-pointer transition-all duration-150 font-black min-h-[72px] '
              if (isDone) {
                if (isThisCorrect)   cls += 'bg-teal-100 border-teal-500 text-teal-800 border-4'
                else if (isThisWrong) cls += 'bg-orange-100 border-orange-400 text-orange-800'
                else                  cls += 'bg-gray-50 border-gray-200 text-gray-400'
              } else {
                cls += isSelected ? opt.bgSel : opt.bgBase + ' hover:scale-[1.02]'
              }

              return (
                <button key={opt.key} disabled={isDone}
                  onClick={() => setUserAnswers(p => ({ ...p, [q.id]: opt.key }))}
                  className={cls}>
                  <span className="text-3xl">{isDone && isThisCorrect ? '✅' : isDone && isThisWrong ? '💡' : opt.emoji}</span>
                  <span className="text-xl">{opt.key}</span>
                </button>
              )
            })}
          </div>
          {!isDone && (
            <button onClick={() => handleAnswerQ(q)}
              disabled={!selectedAns}
              className="btn-primary !py-4 !px-6 !text-lg font-black disabled:opacity-40 w-full rounded-2xl shadow-md">
              ✅ Xác nhận →
            </button>
          )}
        </div>
      )
    }

    // ── MATCHING ─────────────────────────────────────────────────────────────
    if (qType === 'MATCHING') {
      // Regex extract — reliable dù Prisma JSON field có serialize không
      const rxExtract = (src: string): Array<{left:string;right:string}> => {
        const ls = [...src.matchAll(/"left"\s*:\s*"([^"]+)"/g)].map(m => m[1])
        const rs = [...src.matchAll(/"right"\s*:\s*"([^"]+)"/g)].map(m => m[1])
        return ls.map((l, i) => ({ left: l, right: rs[i] || '' })).filter(p => p.left && p.right)
      }
      let pairs: Array<{left:string;right:string}> = []
      const ro = q.options
      if (Array.isArray(ro) && ro.length > 0 && (ro[0] as any)?.left)
        pairs = (ro as any[]).map((o: any) => ({ left: String(o.left??''), right: String(o.right??'') })).filter(p => p.left && p.right)
      if (!pairs.length && q.correctAnswer) pairs = rxExtract(q.correctAnswer)
      if (!pairs.length && ro) { try { pairs = rxExtract(JSON.stringify(ro)) } catch(_){} }
      // Luôn cho phép thay đổi (không disable) để học sinh nhỏ dễ sửa
      const inputs = matchingInputs[q.id] || {}
      const rightOptions = pairs.map(p => p.right).filter(Boolean) as string[]
      const hasAnyInput = Object.values(inputs).some(v => v.trim())
      return (
        <div className="mb-3">
          <p className="text-sm text-purple-700 font-bold mb-2">
            🔗 Nối từng từ bên trái với nghĩa đúng:
          </p>
          {/* Hiển thị danh sách từ gợi ý */}
          {rightOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-yellow-50 rounded-2xl border border-yellow-200">
              <span className="w-full text-xs text-yellow-700 font-bold">📌 Các nghĩa để chọn:</span>
              {rightOptions.map((opt, j) => (
                <span key={j} className="bg-white border border-yellow-300 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-xl">{opt}</span>
              ))}
            </div>
          )}
          <div className="space-y-3 mb-4">
            {pairs.map((pair, i) => {
              const leftKey = pair.left || String(i)
              const studentVal = inputs[leftKey] || ''
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-100 border-2 border-blue-300 rounded-2xl px-3 py-2.5 text-blue-900 font-black text-sm min-w-0">
                    {pair.left}
                  </div>
                  <span className="text-gray-400 font-black shrink-0">→</span>
                  <select
                    value={studentVal}
                    onChange={e => handleMatchingInput(q.id, leftKey, e.target.value)}
                    className={`flex-1 px-3 py-2.5 rounded-2xl border-2 text-sm font-semibold min-w-0 bg-white cursor-pointer ${
                      studentVal ? 'border-purple-400 bg-purple-50 text-purple-900' : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    <option value="">— Chọn nghĩa —</option>
                    {rightOptions.map((opt, j) => (
                      <option key={j} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
          {!isDone && (
            <button onClick={() => handleAnswerQ(q)}
              disabled={!hasAnyInput}
              className="btn-primary !py-4 !px-6 !text-lg font-black disabled:opacity-40 w-full rounded-2xl shadow-md">
              ✅ Xác nhận →
            </button>
          )}
          {isDone && !isCorrect && (() => {
            // Hiển thị đáp án đúng dạng readable
            let correctPairs: Array<{left:string;right:string}> = []
            try {
              if (q.correctAnswer.trim().startsWith('[')) {
                correctPairs = JSON.parse(q.correctAnswer)
              } else {
                correctPairs = q.correctAnswer.split(',').map(p => {
                  const i = p.indexOf('='); return {left:p.slice(0,i).trim(), right:p.slice(i+1).trim()}
                })
              }
            } catch(_){}
            return (
              <div className="mt-2 bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-3">
                <p className="font-bold text-orange-700 mb-2">💡 Đáp án đúng:</p>
                <div className="space-y-1">
                  {correctPairs.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-blue-700 font-bold">{p.left}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-700 font-bold">{p.right}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )
    }

    // ── ORDERING ─────────────────────────────────────────────────────────────
    if (qType === 'ORDERING') {
      const shuffledItems = (q.options || []) as (string | QuestionOption)[]
      return (
        <div className="mb-3">
          {shuffledItems.length > 0 && (
            <div className="mb-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm">
              <p className="text-sm font-bold text-amber-800 mb-2">📋 Các mục cần sắp xếp (đang bị xáo trộn):</p>
              <div className="flex flex-wrap gap-2">
                {shuffledItems.map((item, i) => (
                  <span key={i} className="px-3 py-2 bg-white border-2 border-amber-400 rounded-xl text-base font-bold text-amber-900 shadow-sm">
                    {typeof item === 'string' ? item : (item as QuestionOption).text || String(i + 1)}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-purple-700 font-bold mb-2">
            ✍️ Nhập thứ tự đúng (mỗi mục một dòng):
          </p>
          <textarea
            value={selectedAns}
            onChange={e => !isDone && setUserAnswers(p => ({ ...p, [q.id]: e.target.value }))}
            disabled={isDone}
            placeholder={'Mục 1\nMục 2\nMục 3\n...'}
            rows={Math.max(4, shuffledItems.length + 1)}
            className={`w-full px-4 py-3 rounded-2xl border-2 text-base font-medium focus:outline-none transition-all resize-y mb-3 font-mono shadow-sm ${
              isDone
                ? isCorrect ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-orange-300 bg-orange-50 text-orange-800'
                : 'border-purple-300 bg-white focus:border-purple-500'
            }`}
          />
          {!isDone && (
            <button onClick={() => handleAnswerQ(q)}
              disabled={!selectedAns.trim()}
              className="btn-primary !py-4 !px-6 !text-lg font-black disabled:opacity-40 w-full rounded-2xl shadow-md">
              ✅ Xác nhận →
            </button>
          )}
        </div>
      )
    }

    // ── OPEN (default) ────────────────────────────────────────────────────────
    return (
      <div className="flex gap-2 mb-3">
        <input type="text" value={selectedAns}
          onChange={(e) => { if (!isDone) setUserAnswers(p => ({ ...p, [q.id]: e.target.value })) }}
          onKeyDown={(e) => e.key === 'Enter' && !isDone && handleAnswerQ(q)}
          disabled={isDone}
          placeholder="Nhập đáp số..."
          autoFocus
          className={`flex-1 px-5 py-4 rounded-2xl border-2 font-black text-center text-xl focus:outline-none transition-all shadow-sm ${
            isDone
              ? isCorrect ? 'border-teal-400 bg-teal-100 text-teal-800' : 'border-orange-300 bg-orange-50 text-orange-800'
              : 'border-purple-300 bg-white focus:border-purple-500'
          }`}
        />
        {!isDone && (
          <button onClick={() => handleAnswerQ(q)}
            disabled={!selectedAns.trim()}
            className="btn-primary !py-4 !px-5 !text-lg font-black disabled:opacity-40 shrink-0 rounded-2xl">
            →
          </button>
        )}
      </div>
    )
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
    {showCongrat && (
      <CongratScreen
        name={userName}
        correct={totalCorrect}
        total={questions.length}
        onClose={() => setShowCongrat(false)}
        onRetryAll={() => { setShowCongrat(false); handleRetry(false) }}
        onRetryWrong={() => { setShowCongrat(false); handleRetry(true) }}
      />
    )}
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-gray-50 overflow-auto p-4 md:p-6 flex flex-col' : 'flex flex-col lg:flex-row gap-5 items-start'}>

      {/* ══ LEFT: Tabs + Content ══ */}
      <div className={isFullscreen ? 'flex-1 flex flex-col max-w-4xl mx-auto w-full' : 'w-full lg:flex-1 min-w-0'}>

        {/* Video trên mobile — có nút thu/mở lên trên */}
        <div className="lg:hidden mb-4">
          <div
            className={`overflow-hidden transition-all duration-300 ${
              videoCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-[400px] opacity-100'
            }`}
          >
            <VideoPanel videoMaterial={videoMaterial} />
          </div>
          {/* Nút mũi tên thu/mở — mobile */}
          <button
            onClick={() => setVideoCollapsed(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-2 mt-1 rounded-2xl bg-white border-2 border-gray-100 hover:border-purple-300 text-gray-400 hover:text-purple-500 text-xs font-bold transition-all"
          >
            {videoCollapsed
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> Hiện video</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg> Thu video</>}
          </button>
        </div>

        {/* Tab bar + Fullscreen button */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all min-h-[44px] ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-purple-200 hover:text-purple-600'
                }`}>
                <span>{tab.emoji}</span>{tab.label}
              </button>
            ))}
          </div>
          {/* Nút phóng to — tất cả tab, tất cả khoá */}
          <button
            onClick={() => setIsFullscreen(f => !f)}
            title={isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white border-2 border-gray-100 hover:border-purple-300 hover:text-purple-600 text-gray-500 font-bold text-sm transition-all min-h-[44px] shadow-sm"
          >
            {isFullscreen
              ? <><Minimize2 className="w-4 h-4" /><span className="hidden sm:inline">Thu nhỏ</span></>
              : <><Maximize2 className="w-4 h-4" /><span className="hidden sm:inline">Phóng to</span></>}
          </button>
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-4xl border-2 border-purple-50 p-5 md:p-6 shadow-sm">

          {/* ── BTVN ── */}
          {activeTab === 'homework' && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900">✏️ Bài Tập Về Nhà</h2>
                {totalAnswered > 0 && (
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    accuracy >= 80 ? 'bg-teal-100 text-teal-700'
                    : accuracy >= 50 ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-orange-100 text-orange-700'}`}>
                    {totalCorrect}/{questions.length} ({accuracy}%)
                  </span>
                )}
              </div>

              {/* ── PROGRESS BAR ── */}
              {questions.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-500">
                      {totalAnswered === questions.length ? '🎉 Hoàn thành!' : `${totalAnswered}/${questions.length} câu đã làm`}
                    </span>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(s => {
                        const threshold = s === 1 ? 50 : s === 2 ? 70 : 90
                        const lit = totalAnswered === questions.length && accuracy >= threshold
                        return <span key={s} className={`text-lg transition-all ${lit ? 'scale-125' : 'opacity-25'}`}>⭐</span>
                      })}
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400"
                      style={{ width: `${questions.length > 0 ? (totalAnswered / questions.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {questions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-5xl mb-3">📝</div>
                  <p>Giáo viên chưa tải lên bài tập</p>
                </div>
              ) : (
                <>
                  {/* ── GRID CÂU HỎI ── */}
                  <div className="flex flex-wrap justify-center gap-2 mb-5 p-3 bg-gray-50 rounded-2xl">
                    {questions.map((q) => {
                      const isDone    = submitted[q.id]
                      const isCorrect = results[q.id]
                      const hasInput  = !isDone && !!computeAnswer(q).trim()
                      const isActive  = expandedQ === q.id
                      return (
                        <button key={q.id}
                          onClick={() => setExpandedQ(isActive ? null : q.id)}
                          className={`w-11 h-11 rounded-2xl text-sm font-black transition-all duration-150 shadow-sm ${
                            isDone
                              ? isCorrect
                                ? 'bg-teal-500 text-white shadow-teal-200'
                                : 'bg-orange-400 text-white shadow-orange-200'
                              : hasInput
                              ? 'bg-orange-400 text-white shadow-orange-200 animate-pulse'
                              : isActive
                              ? 'bg-purple-600 text-white shadow-purple-200 scale-110'
                              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                          }`}>
                          {isDone ? (isCorrect ? '✓' : '~') : q.order}
                        </button>
                      )
                    })}
                  </div>

                  {/* Chú thích màu */}
                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 inline-block"/> Chưa làm</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400 inline-block"/> Đang điền</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-500 inline-block"/> Đúng rồi ✅</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-300 inline-block"/> Cần cố thêm 💡</span>
                  </div>

                  {/* ── NỘI DUNG CÂU ĐƯỢC CHỌN ── */}
                  {expandedQ && (() => {
                    const q = questions.find(q => q.id === expandedQ)!
                    if (!q) return null
                    const qIdx      = questions.findIndex(x => x.id === expandedQ)
                    const prevQ     = questions[qIdx - 1] ?? null
                    const nextQ     = questions[qIdx + 1] ?? null
                    const isDone    = submitted[q.id]
                    const isCorrect = results[q.id]
                    const hint      = showHint[q.id]
                    return (
                      <div className={`mb-5 rounded-3xl border-2 p-5 transition-all shadow-md ${
                        isDone
                          ? isCorrect ? 'border-teal-300 bg-teal-50' : 'border-orange-200 bg-orange-50'
                          : 'border-purple-300 bg-purple-50/30'
                      }`}>
                        {/* Số câu + badge loại */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-black shrink-0 shadow-sm ${
                            isDone ? (isCorrect ? 'bg-teal-500 text-white' : 'bg-orange-400 text-white') : 'bg-purple-600 text-white'
                          }`}>{q.order}</div>
                          <div className="flex-1 min-w-0">
                            {q.questionType && q.questionType !== 'OPEN' && (
                              <span className={`inline-flex items-center gap-1 mb-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                q.questionType === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-700'
                                : q.questionType === 'TRUE_FALSE'   ? 'bg-green-100 text-green-700'
                                : q.questionType === 'MATCHING'     ? 'bg-purple-100 text-purple-700'
                                : q.questionType === 'ORDERING'     ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                              }`}>
                                {q.questionType === 'MULTIPLE_CHOICE' && '🔘 Trắc nghiệm'}
                                {q.questionType === 'TRUE_FALSE'      && '⚖️ Đúng / Sai'}
                                {q.questionType === 'MATCHING'        && '🔗 Nối đôi'}
                                {q.questionType === 'ORDERING'        && '🔢 Sắp xếp'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hình ảnh minh họa (nếu có) */}
                        {q.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={q.imageUrl}
                              alt="Hình minh họa"
                              className="w-full max-h-56 object-contain rounded-2xl border border-gray-100 bg-gray-50 shadow-sm"
                            />
                          </div>
                        )}

                        {/* Nội dung câu hỏi — text-xl, dễ đọc */}
                        <div className="bg-white rounded-2xl px-4 py-3 mb-4 border border-gray-100 shadow-sm">
                          <p className="font-bold text-gray-900 text-xl leading-relaxed">{q.content}</p>
                        </div>

                        {/* ── Ô nhập đáp án theo loại câu hỏi ── */}
                        {renderQuestionInput(q, isDone, isCorrect)}

                        {/* ── Feedback sau khi nộp ── */}
                        {isDone && (
                          <div className={`flex items-center gap-3 py-3 px-4 rounded-2xl mb-3 ${
                            isCorrect
                              ? 'bg-teal-100 border-2 border-teal-300'
                              : 'bg-orange-100 border-2 border-orange-300'
                          }`}>
                            <span className="text-3xl">
                              {isCorrect ? '✅' : '💡'}
                            </span>
                            <div>
                              {isCorrect ? (
                                <p className="text-teal-800 font-black text-lg">Đúng rồi! Con giỏi lắm! 🌟</p>
                              ) : (
                                <>
                                  <p className="text-orange-800 font-black text-lg">Thử lại nhé!</p>
                                  {/* For OPEN type, show correct answer directly */}
                                  {(!q.questionType || q.questionType === 'OPEN') && (
                                    <p className="text-orange-700 text-sm font-semibold mt-0.5">
                                      Đáp án đúng: <span className="font-black">{q.correctAnswer}</span>
                                    </p>
                                  )}
                                  {(q.questionType === 'MATCHING' || q.questionType === 'ORDERING') && (
                                    <p className="text-orange-700 text-sm font-semibold mt-0.5">Xem gợi ý bên dưới nhé! 👇</p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Gợi ý + cảnh báo trừ điểm */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <button onClick={() => {
                            if (!isDone && !hint) {
                              setHintPeeked(p => ({ ...p, [q.id]: true }))
                            }
                            setShowHint(p => ({ ...p, [q.id]: !p[q.id] }))
                          }}
                            className="text-sm text-purple-600 hover:text-purple-800 font-bold rounded-xl px-3 py-1.5 bg-purple-50 hover:bg-purple-100 transition">
                            {hint ? '🙈 Ẩn gợi ý' : '💡 Xem gợi ý / lời giải'}
                          </button>
                          {!isDone && (
                            <span className="text-xs text-orange-500 font-medium">
                              ⚠️ xem gợi ý sẽ bị −0.5 điểm
                            </span>
                          )}
                          {hintPeeked[q.id] && !isDone && (
                            <span className="text-xs text-orange-600 font-bold">→ Đã xem gợi ý</span>
                          )}
                        </div>
                        {hint && (
                          <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-4 py-3 space-y-1.5">
                            <p className="text-base font-bold text-yellow-800">Đáp án: <span className="text-teal-700">{q.correctAnswer}</span></p>
                            {q.explanation && (
                              <div className="border-t border-yellow-200 pt-2">
                                <p className="text-xs font-bold text-blue-700 mb-1">📝 Lời giải chi tiết:</p>
                                <p className="text-sm text-blue-900 leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── Điều hướng Câu trước / Câu tiếp ── */}
                        <div className="flex gap-3 mt-2">
                          <button
                            disabled={!prevQ}
                            onClick={() => prevQ && setExpandedQ(prevQ.id)}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 font-black rounded-2xl hover:bg-gray-200 transition text-base disabled:opacity-30 shadow-sm">
                            ← Câu trước
                          </button>
                          <button
                            disabled={!nextQ}
                            onClick={() => nextQ && setExpandedQ(nextQ.id)}
                            className="flex-1 py-4 bg-purple-100 text-purple-700 font-black rounded-2xl hover:bg-purple-200 transition text-base disabled:opacity-30 shadow-sm">
                            Câu tiếp →
                          </button>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Nút nộp tất cả */}
                  {!aiResult && (() => {
                    const allAnswered = questions.every(q => submitted[q.id] || computeAnswer(q).trim())
                    const allDone    = questions.every(q => submitted[q.id])
                    return (
                      <div className="mt-2">
                        {!allAnswered && (
                          <p className="text-center text-sm text-gray-400 mb-2">
                            📝 Hãy làm tất cả {questions.length} câu rồi mới nộp nhé!
                          </p>
                        )}
                        <button onClick={handleSubmitAll}
                          disabled={submittingAll || !allAnswered}
                          className={`w-full !py-4 flex items-center justify-center gap-2 text-lg font-black rounded-3xl transition-all shadow-md ${
                            allAnswered ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}>
                          {submittingAll
                            ? <><Loader2 className="animate-spin" size={20} /> Đang chấm & phân tích AI...</>
                            : allDone
                            ? '🏆 Xem kết quả & nhận nhận xét AI'
                            : '🏆 Nộp bài & nhận nhận xét AI'
                          }
                        </button>
                      </div>
                    )
                  })()}

                  {aiLoading && (
                    <div className="mt-4 text-center text-purple-600">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      <p className="text-sm font-medium">AI đang phân tích...</p>
                    </div>
                  )}

                  {aiResult && (
                    <div className="mt-4 bg-gradient-to-br from-purple-50 to-teal-50 rounded-3xl p-5 border border-purple-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🤖</span>
                        <h3 className="font-black text-gray-900">Nhận xét của AI</h3>
                        <span className={`ml-auto text-lg font-black ${accuracy >= 80 ? 'text-teal-600' : accuracy >= 50 ? 'text-orange-500' : 'text-orange-600'}`}>{accuracy}%</span>
                      </div>
                      {aiResult.summary && <p className="text-gray-700 text-sm mb-3">{aiResult.summary}</p>}
                      {aiResult.recommendation && (
                        <div className="bg-white rounded-2xl p-3 text-sm text-purple-900 shadow-sm">
                          🚀 <strong>Gợi ý tiếp theo:</strong> {aiResult.recommendation}
                        </div>
                      )}
                      {aiResult.encouragement && (
                        <p className="text-center text-purple-600 font-semibold text-sm mt-3">{aiResult.encouragement}</p>
                      )}
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button onClick={() => handleRetry(false)}
                          className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition text-sm">
                          🔄 Làm lại toàn bộ
                        </button>
                        {questions.some(q => submitted[q.id] && !results[q.id]) && (
                          <button onClick={() => handleRetry(true)}
                            className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition text-sm">
                            💡 Làm lại câu chưa đúng
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── BÀI GIẢNG (LÝ THUYẾT) ── */}
          {activeTab === 'theory' && (
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4">📖 Bài giảng — {subject.name}</h2>
              {getMaterial('THEORY').length > 0 ? (
                getMaterial('THEORY').map((m) => {
                  // Local content path → render markdown từ DB
                  const isLocalPath = m.fileUrl?.startsWith('/content/')
                  const hasContent = m.content && m.content.length > 50
                  return (
                    <div key={m.id} className="mb-4">
                      {!isLocalPath && m.fileUrl ? (
                        // URL bên ngoài: embed iframe
                        <MaterialView url={m.fileUrl} title={m.title} />
                      ) : hasContent ? (
                        // Nội dung markdown từ DB
                        <div className="bg-white rounded-3xl border border-purple-100 p-5 md:p-6 shadow-sm">
                          <MarkdownLesson content={m.content!} />
                          {m.fileUrl && (
                            <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
                              <a
                                href={`https://raw.githubusercontent.com/NamDoji/avab/main${m.fileUrl}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition"
                              >
                                ⬇️ Tải file DOCX
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-purple-50 rounded-3xl p-5 text-gray-600 whitespace-pre-wrap text-sm">{m.content || 'Đang cập nhật...'}</div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-5xl mb-3">📄</div>
                  <p>Giáo viên chưa tải lên bài giảng</p>
                </div>
              )}
            </div>
          )}

          {/* ── VỞ VIẾT ── */}
          {activeTab === 'ide' && courseType && hasIDE && (
            <div className="py-2"><IDETab
              courseType={courseType}
              subjectName={subject.name}
              questions={questions as any}
              theoryContent={getMaterial('THEORY')[0]?.content ?? undefined}
              theoryTitle={getMaterial('THEORY')[0]?.title ?? undefined}
            /></div>
          )}
          {activeTab === 'notebook' && !hasIDE && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900">📓 Vở viết</h2>
                {questions.length > 0 && (
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Đã chép: {Object.keys(notebookDone).length}/{questions.length}
                  </span>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-5xl mb-3">📓</div>
                  <p>Chưa có bài tập nào</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-4 text-sm text-blue-800">
                    📝 <strong>Cách dùng:</strong> Bấm vào số câu → đọc đề bài → giải vào vở → bấm <strong>"Đã viết ✓"</strong>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-4 p-3 bg-gray-50 rounded-2xl">
                    {questions.map((q) => {
                      const done   = notebookDone[q.id]
                      const active = notebookQ === q.id
                      return (
                        <button key={q.id}
                          onClick={() => setNotebookQ(active ? null : q.id)}
                          className={`w-11 h-11 rounded-2xl text-sm font-black transition-all duration-150 shadow-sm ${
                            done
                              ? 'bg-blue-500 text-white shadow-blue-200'
                              : active
                              ? 'bg-purple-600 text-white scale-110 shadow-purple-200'
                              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                          }`}>
                          {done ? '✓' : q.order}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex justify-center gap-4 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 inline-block"/> Chưa chép</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block"/> Đã viết vào vở</span>
                  </div>

                  {notebookQ && (() => {
                    const q = questions.find(x => x.id === notebookQ)!
                    const done = notebookDone[q.id]
                    return (
                      <div className={`mb-4 rounded-3xl border-2 p-5 transition-all shadow-sm ${
                        done ? 'border-blue-300 bg-blue-50' : 'border-purple-300 bg-purple-50/40'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${
                            done ? 'bg-blue-500 text-white' : 'bg-purple-600 text-white'
                          }`}>{q.order}</div>
                          <p className="text-xs text-gray-500 font-medium">Câu {q.order} / {questions.length}</p>
                        </div>
                        {q.imageUrl && (
                          <div className="mb-3">
                            <img src={q.imageUrl} alt="Hình minh họa" className="w-full max-h-56 object-contain rounded-2xl border border-gray-100 bg-gray-50" />
                          </div>
                        )}
                        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
                          <p className="text-xl font-bold text-gray-900 leading-relaxed">{q.content}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {!done ? (
                            <button
                              onClick={() => {
                                setNotebookDone(p => ({ ...p, [q.id]: true }))
                                const idx = questions.findIndex(x => x.id === q.id)
                                const next = questions[idx + 1]
                                setNotebookQ(next ? next.id : null)
                              }}
                              className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-2xl transition text-lg shadow-md">
                              ✓ Đã viết vào vở
                            </button>
                          ) : (
                            <button
                              onClick={() => setNotebookDone(p => { const n = {...p}; delete n[q.id]; return n })}
                              className="flex-1 py-3 bg-gray-100 text-gray-500 font-semibold rounded-2xl transition text-sm">
                              ← Chưa xong
                            </button>
                          )}
                          <div className="flex gap-2">
                            {questions.findIndex(x => x.id === q.id) > 0 && (
                              <button
                                onClick={() => setNotebookQ(questions[questions.findIndex(x => x.id === q.id) - 1].id)}
                                className="px-5 py-3 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:border-purple-300 transition text-base shadow-sm">
                                ← Trước
                              </button>
                            )}
                            {questions.findIndex(x => x.id === q.id) < questions.length - 1 && (
                              <button
                                onClick={() => setNotebookQ(questions[questions.findIndex(x => x.id === q.id) + 1].id)}
                                className="px-5 py-3 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:border-purple-300 transition text-base shadow-sm">
                                Tiếp →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  <div className={`transition-all ${
                    Object.keys(notebookDone).length === questions.length ? 'opacity-100' : 'opacity-40'
                  }`}>
                    <div className="border-t-2 border-dashed border-blue-200 pt-4 mb-3">
                      <p className="text-sm font-bold text-blue-700 mb-1">🤖 Nộp bài tự luận cho AI chấm</p>
                      <p className="text-xs text-gray-400 mb-3">Chép lại lời giải của con vào ô dưới để AI nhận xét và cho điểm.</p>
                      <textarea value={notebookText} onChange={(e) => setNotebookText(e.target.value)}
                        disabled={!!notebookResult}
                        placeholder={'Câu 1: ...\nCâu 2: ...\n...'}
                        className="w-full min-h-[200px] p-4 rounded-3xl border-2 border-blue-200 focus:border-purple-400 focus:outline-none text-gray-800 text-sm leading-7 bg-white resize-y font-mono disabled:bg-gray-100 disabled:cursor-not-allowed mb-3"
                        style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent calc(1.75rem - 1px), #dbeafe calc(1.75rem - 1px), #dbeafe 1.75rem)', backgroundAttachment: 'local', lineHeight: '1.75rem' }}
                      />
                      {!notebookResult ? (
                        <button onClick={handleNotebookSubmit}
                          disabled={notebookSubmitting || !notebookText.trim()}
                          className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
                          {notebookSubmitting ? <><Loader2 className="animate-spin" size={18} /> AI đang chấm...</> : '🤖 Nộp bài cho AI chấm'}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-5 text-white text-center">
                            <div className="text-5xl font-black mb-1 text-yellow-300">
                              {notebookResult.score ?? '—'}<span className="text-xl text-white/60">/10</span>
                            </div>
                            <p className="text-white/80 text-sm">Điểm bài tự luận</p>
                          </div>
                          <div className="bg-purple-50 border border-purple-100 rounded-3xl p-4">
                            <h3 className="font-black text-gray-900 mb-2">🤖 Nhận xét của AI</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">{notebookResult.feedback}</p>
                          </div>
                          {notebookResult.pathway && (
                            <div className="bg-teal-50 border border-teal-100 rounded-3xl p-4">
                              <h3 className="font-black text-gray-900 mb-2">🗺️ Lộ trình cá nhân</h3>
                              <p className="text-gray-700 text-sm leading-relaxed">{notebookResult.pathway}</p>
                            </div>
                          )}
                          {notebookResult.prediction && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-4">
                              <h3 className="font-black text-gray-900 mb-2">🏫 Dự đoán xét tuyển</h3>
                              <p className="text-gray-700 text-sm leading-relaxed">{notebookResult.prediction}</p>
                            </div>
                          )}
                          <button onClick={() => { setNotebookResult(null); setNotebookText(''); setNotebookDone({}); setNotebookQ(null) }}
                            className="w-full py-3 border-2 border-purple-200 text-purple-600 font-bold rounded-2xl hover:bg-purple-50 transition-all">
                            🔄 Làm lại bài
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── ĐÁP ÁN ── */}
          {activeTab === 'answer' && (
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4">✅ Đáp án & Hướng dẫn giải</h2>
              {getMaterial('ANSWER').length > 0 ? (
                getMaterial('ANSWER').map((m) => (
                  <div key={m.id} className="mb-4">
                    {m.fileUrl
                      ? <MaterialView url={m.fileUrl} title={m.title} />
                      : <div className="bg-teal-50 rounded-3xl p-5 text-gray-700 whitespace-pre-wrap text-sm">{m.content}</div>
                    }
                  </div>
                ))
              ) : questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q.id} className="border border-teal-100 rounded-2xl p-4 shadow-sm">
                      {q.imageUrl && (
                        <img src={q.imageUrl} alt="" className="w-full max-h-40 object-contain rounded-xl mb-2 bg-gray-50" />
                      )}
                      <p className="text-sm font-semibold text-gray-700 mb-1">Câu {q.order}: {q.content}</p>
                      <p className="text-teal-700 font-black text-sm">✅ {q.correctAnswer}</p>
                      {q.explanation && <p className="text-blue-700 text-xs mt-1">📝 {q.explanation}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-5xl mb-3">📋</div><p>Chưa có đáp án</p>
                </div>
              )}
            </div>
          )}

          {/* ── TOP 5 ── */}
          {activeTab === 'top5' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900">⭐ Điểm của bạn</h2>

              {/* Điểm chưyên đề hiện tại */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-5 text-white">
                <p className="text-white/70 text-sm font-semibold mb-1">📚 Chưyên đề hiện tại</p>
                <p className="text-xs text-white/60 mb-3">{subject.name}</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-yellow-300">{mySubjectScore}</span>
                  <span className="text-white/60 text-lg mb-1">/ {questions.reduce((s, q) => s + q.points, 0)} điểm</span>
                </div>
                {/* Progress bar */}
                {questions.length > 0 && (
                  <div className="mt-3">
                    <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round(mySubjectScore / Math.max(1, questions.reduce((s,q)=>s+q.points,0)) * 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/60 mt-1 text-right">
                      {Math.min(100, Math.round(mySubjectScore / Math.max(1, questions.reduce((s,q)=>s+q.points,0)) * 100))}% hoàn thành
                    </p>
                  </div>
                )}
              </div>

              {/* Tổng điểm toàn khoá */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-5 text-white">
                <p className="text-white/70 text-sm font-semibold mb-1">🏆 Tổng điểm toàn khoá</p>
                <p className="text-xs text-white/60 mb-3">Cộng điểm cao nhất tất cả chưyên đề đã làm</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-yellow-300">{myTotalScore}</span>
                  {maxScore > 0 && <span className="text-white/60 text-lg mb-1">/ {maxScore} điểm</span>}
                </div>
                {maxScore > 0 && (
                  <div className="mt-3">
                    <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round(myTotalScore / maxScore * 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/60 mt-1 text-right">
                      {Math.min(100, Math.round(myTotalScore / maxScore * 100))}% toàn khoá
                    </p>
                  </div>
                )}
              </div>

              {/* Top 5 */}
              {top5.length > 0 && (
                <div>
                  <p className="text-sm font-black text-gray-700 mb-3">🏅 Top 5 chưyên đề này</p>
                  <div className="space-y-2">
                    {top5.map((e) => (
                      <div key={e.userId} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                        e.isMe ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50 border border-gray-100'
                      }`}>
                        <span className="text-lg shrink-0">{e.rank===1?'🥇':e.rank===2?'🥈':e.rank===3?'🥉':`#${e.rank}`}</span>
                        <p className="flex-1 font-bold text-sm text-gray-800">{e.name}{e.isMe && ' ✨'}</p>
                        <span className="font-black text-purple-700">{e.score} đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center bg-purple-50 rounded-2xl p-4">
                <p className="text-sm text-purple-700 font-semibold">💪 Làm BTVN để tăng điểm và leo bảng vàng!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT: Video sticky (desktop only) — collapsible ══ */}
      {!isFullscreen && (
        <div className="hidden lg:flex shrink-0 items-start gap-0 transition-all duration-300">

          {/* Nút mũi tên thu/mở — always visible */}
          <div className="sticky top-24 flex flex-col items-center pt-2 mr-1">
            <button
              onClick={() => setVideoCollapsed(v => !v)}
              title={videoCollapsed ? 'Mở video' : 'Thu video'}
              className="w-7 h-14 flex items-center justify-center rounded-xl bg-white border-2 border-purple-100 hover:border-purple-400 hover:bg-purple-50 text-purple-400 hover:text-purple-600 shadow-sm transition-all duration-200"
            >
              {videoCollapsed
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              }
            </button>
          </div>

          {/* Video panel — slides in/out */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              videoCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[40vw] max-w-[420px] opacity-100'
            }`}
          >
            <div className="sticky top-24">
              <VideoPanel videoMaterial={videoMaterial} />
              <div className="mt-3 bg-white rounded-2xl border border-purple-100 px-4 py-3 text-xs text-gray-500 space-y-1 shadow-sm">
                <p>📖 <strong className="text-gray-700">Bài giảng:</strong> slide/PDF lý thuyết</p>
                <p>✏️ <strong className="text-gray-700">BTVN:</strong> làm bài trực tiếp, chấm tự động</p>
                <p>✅ <strong className="text-gray-700">Đáp án:</strong> xem sau khi làm bài</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  )
}
