import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Rocket } from 'lucide-react'

export const metadata = { title: 'AI Studio — AvaB Admin' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProgressInfo(steps: { stepType: string; status: string }[]) {
  const ordered = ['setup', 'curriculum', 'lesson', 'homework', 'qa', 'preview', 'publish', 'done']
  const doneCount = steps.filter(s => s.status === 'done').length
  const total     = 8
  return { doneCount, total, pct: Math.round((doneCount / total) * 100) }
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft:      'bg-gray-100 text-gray-600',
    'in-progress': 'bg-blue-100 text-blue-700',
    review:     'bg-yellow-100 text-yellow-700',
    published:  'bg-green-100 text-green-700',
  }
  const labels: Record<string, string> = {
    draft:      'Nháp',
    'in-progress': 'Đang làm',
    review:     'Xét duyệt',
    published:  'Đã xuất bản',
  }
  return { cls: map[status] ?? 'bg-gray-100 text-gray-500', label: labels[status] ?? status }
}

function subjectEmoji(subject: string) {
  const map: Record<string, string> = {
    MATH: '📐', ENGLISH: '🔤', SCIENCE: '🔬', CODING: '💻',
    VIETNAMESE: '📖', HISTORY: '🏛️', GEOGRAPHY: '🌍', ART: '🎨',
    MUSIC: '🎵', PE: '⚽',
  }
  return map[subject.toUpperCase()] ?? '📚'
}

function gradeLabel(grade: string) {
  if (grade === 'preschool') return 'Mầm non'
  return `Lớp ${grade}`
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({ project }: {
  project: {
    id: string; title: string; grade: string; subject: string; subjectName?: string | null
    topic: string; status: string; updatedAt: Date
    steps: { stepType: string; status: string }[]
  }
}) {
  const { doneCount, total, pct } = getProgressInfo(project.steps)
  const badge = statusBadge(project.status)
  const emoji = subjectEmoji(project.subject)
  const isActive = ['draft', 'in-progress'].includes(project.status)

  return (
    <Link href={`/admin/ai-studio/${project.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{emoji}</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
      </div>

      <h3 className="font-black text-gray-900 text-sm leading-tight mb-1 group-hover:text-purple-700 transition-colors line-clamp-2">
        {project.title}
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        {gradeLabel(project.grade)} • {project.subjectName ?? project.subject} • {project.topic}
      </p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Bước {doneCount}/{total}</span>
          <span className="font-bold text-purple-600">{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-purple-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <span className={`flex-1 text-center text-xs font-bold py-2 rounded-xl transition-all ${
          isActive
            ? 'bg-purple-600 text-white group-hover:bg-purple-700'
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        }`}>
          {isActive ? '▶ Tiếp tục' : '👁 Xem'}
        </span>
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AIStudioPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const userId = (session.user as { id?: string })?.id!

  const projects = await prisma.aIProject.findMany({
    where: { createdBy: userId },
    include: { steps: { orderBy: { stepNum: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  })

  const active    = projects.filter(p => ['draft', 'in-progress'].includes(p.status))
  const review    = projects.filter(p => p.status === 'review')
  const published = projects.filter(p => p.status === 'published')

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-purple-50/10 to-blue-50/10">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-white py-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-sm mb-4 text-gray-400">
            <a href="/admin" className="hover:text-white transition-colors">← Admin</a>
            <span>/</span>
            <span className="text-gray-200">AI Studio</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 via-indigo-400 to-pink-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-3xl font-black">AI Studio</h1>
                  <span className="bg-purple-500 text-white text-xs font-black px-2 py-0.5 rounded-full">NEW</span>
                </div>
                <p className="text-indigo-300 text-sm">Workspace thông minh cho đội học liệu</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/admin/ai-studio/course-generator"
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl font-bold shadow hover:from-emerald-600 hover:to-teal-600 transition-all min-h-[44px]">
                <Rocket size={18} />
                Generate Full Course
              </Link>
              <Link href="/admin/ai-studio/new"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-bold shadow hover:from-purple-600 hover:to-indigo-600 transition-all min-h-[44px]">
                <Plus size={18} />
                Dự án mới
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-black">{projects.length}</div>
              <div className="text-xs text-gray-400">Tổng dự án</div>
            </div>
            <div className="w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-blue-400">{active.length}</div>
              <div className="text-xs text-gray-400">Đang làm</div>
            </div>
            <div className="w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{published.length}</div>
              <div className="text-xs text-gray-400">Đã xuất bản</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="container-custom py-8 space-y-8">

        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Chào mừng đến AI Studio!</h2>
            <p className="text-gray-500 mb-6">Tạo dự án đầu tiên để bắt đầu sinh học liệu tự động với AI</p>
            <Link href="/admin/ai-studio/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg">
              <Plus size={20} />
              Tạo dự án đầu tiên
            </Link>
          </div>
        )}

        {/* Active projects */}
        {active.length > 0 && (
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🔄 Đang làm ({active.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {active.map(p => <ProjectCard key={p.id} project={p as Parameters<typeof ProjectCard>[0]['project']} />)}
              {/* New project card */}
              <Link href="/admin/ai-studio/new"
                className="block bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all p-5 flex flex-col items-center justify-center text-center min-h-[200px] group">
                <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-2xl flex items-center justify-center mb-3 transition-colors">
                  <Plus size={24} className="text-purple-600" />
                </div>
                <div className="font-bold text-gray-500 group-hover:text-purple-700 transition-colors text-sm">Dự án mới</div>
                <div className="text-xs text-gray-400 mt-1">Bắt đầu tạo học liệu</div>
              </Link>
            </div>
          </section>
        )}

        {/* Review */}
        {review.length > 0 && (
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">⏳ Chờ xét duyệt ({review.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {review.map(p => <ProjectCard key={p.id} project={p as Parameters<typeof ProjectCard>[0]['project']} />)}
            </div>
          </section>
        )}

        {/* Published */}
        {published.length > 0 && (
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">✅ Đã xuất bản ({published.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {published.map(p => <ProjectCard key={p.id} project={p as Parameters<typeof ProjectCard>[0]['project']} />)}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
