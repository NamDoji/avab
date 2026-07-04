import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Rocket, Building2 } from 'lucide-react'
import { getOrganizationContext } from '@/lib/organization'

export const metadata = { title: 'AI Studio — AvaB Admin' }

// ─── Types ────────────────────────────────────────────────────────────────────

type StepType = 'setup' | 'curriculum' | 'lesson' | 'homework' | 'qa' | 'preview' | 'publish' | 'done'

interface ProjectStep {
  stepType: string
  status: string
}

interface ProjectData {
  id: string
  title: string
  grade: string
  subject: string
  subjectName?: string | null
  topic: string
  status: string
  updatedAt: Date
  organizationId?: string | null
  steps: ProjectStep[]
  createdByUser?: { name: string | null } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEP_ORDER: StepType[] = ['setup', 'curriculum', 'lesson', 'homework', 'qa', 'preview', 'publish', 'done']

function getProgressInfo(steps: ProjectStep[]) {
  const doneCount = steps.filter(s => s.status === 'done').length
  const total = 8
  const pct = Math.round((doneCount / total) * 100)

  // Count content types done
  const stepMap = new Map(steps.map(s => [s.stepType, s.status]))
  const contentCounts = {
    curriculum: stepMap.get('curriculum') === 'done' ? 1 : 0,
    lesson: stepMap.get('lesson') === 'done' ? 1 : 0,
    homework: stepMap.get('homework') === 'done' ? 1 : 0,
    qa: stepMap.get('qa') === 'done' ? 1 : 0,
  }
  return { doneCount, total, pct, contentCounts }
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft:          'bg-gray-100 text-gray-600',
    'in-progress':  'bg-blue-100 text-blue-700',
    review:         'bg-yellow-100 text-yellow-700',
    published:      'bg-green-100 text-green-700',
  }
  const labels: Record<string, string> = {
    draft:          'Nháp',
    'in-progress':  'Đang làm',
    review:         'Chờ duyệt',
    published:      'Đã xuất bản',
  }
  return { cls: map[status] ?? 'bg-gray-100 text-gray-500', label: labels[status] ?? status }
}

function subjectEmoji(subject: string) {
  const map: Record<string, string> = {
    MATH: '📐', ENGLISH: '🔤', SCIENCE: '🔬', CODING: '💻',
    VIETNAMESE: '📖', HISTORY: '🏛️', GEOGRAPHY: '🌍', ART: '🎨',
    MUSIC: '🎵', PE: '⚽', ALGO: '🤖', SCRATCH: '🐱', PYTHON: '🐍',
    CPP: '⚡', IELTS: '📝', CAMBRIDGE: '🎓', PHYSICS: '⚛️',
    CHEMISTRY: '🧪', BIOLOGY: '🧬', INFORMATICS: '💻',
  }
  return map[subject.toUpperCase()] ?? '📚'
}

function gradeLabel(grade: string) {
  if (grade === 'preschool') return 'Mầm non'
  return `Lớp ${grade}`
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)   return 'Vừa xong'
  if (diffMin < 60)  return `${diffMin} phút trước`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)    return `${diffH} giờ trước`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7)     return `${diffD} ngày trước`
  return new Date(date).toLocaleDateString('vi-VN')
}

// ─── Pipeline chip ────────────────────────────────────────────────────────────

function PipelineChips({ steps }: { steps: ProjectStep[] }) {
  const stepMap = new Map(steps.map(s => [s.stepType, s.status]))
  const items: { key: string; icon: string; label: string }[] = [
    { key: 'curriculum', icon: '📋', label: 'Giáo án' },
    { key: 'lesson',     icon: '📖', label: 'Lý thuyết' },
    { key: 'homework',   icon: '📝', label: 'Bài tập' },
    { key: 'qa',         icon: '❓', label: 'Quiz' },
  ]

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {items.map(item => {
        const status = stepMap.get(item.key) ?? 'pending'
        const isDone = status === 'done'
        const isRunning = status === 'running'
        return (
          <span
            key={item.key}
            className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
            style={
              isDone
                ? { background: '#dcfce7', color: '#166534' }
                : isRunning
                ? { background: '#dbeafe', color: '#1e40af' }
                : { background: '#f3f4f6', color: '#9ca3af' }
            }
          >
            {item.icon} {item.label}
            {isDone ? ' ✓' : isRunning ? ' ⟳' : ''}
          </span>
        )
      })}
    </div>
  )
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({ project, showOrg }: {
  project: ProjectData
  showOrg?: boolean
}) {
  const { doneCount, total, pct } = getProgressInfo(project.steps)
  const badge = statusBadge(project.status)
  const emoji = subjectEmoji(project.subject)
  const isActive   = ['draft', 'in-progress'].includes(project.status)
  const isPublished = project.status === 'published'

  return (
    <Link
      href={`/admin/ai-studio/${project.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all p-5"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{emoji}</span>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
          <span className="text-xs text-gray-400">{relativeTime(project.updatedAt)}</span>
        </div>
      </div>

      <h3 className="font-black text-gray-900 text-sm leading-tight mb-1 group-hover:text-purple-700 transition-colors line-clamp-2">
        {project.title}
      </h3>
      <p className="text-xs text-gray-400 mb-1">
        {gradeLabel(project.grade)} · {project.subjectName ?? project.subject} · {project.topic}
      </p>

      {/* Content pipeline chips */}
      <PipelineChips steps={project.steps} />

      {/* Progress bar */}
      <div className="mt-3 mb-3">
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

      {/* Author (super admin view) */}
      {showOrg && project.createdByUser?.name && (
        <p className="text-xs text-gray-400 mb-2">
          👤 {project.createdByUser.name}
        </p>
      )}

      {/* Action button */}
      <div className="flex gap-2">
        <span className={`flex-1 text-center text-xs font-bold py-2 rounded-xl transition-all ${
          isActive
            ? 'bg-purple-600 text-white group-hover:bg-purple-700'
            : isPublished
            ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        }`}>
          {isActive ? '▶ Tiếp tục' : isPublished ? '📤 Xuất bản' : '👁 Xem'}
        </span>
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SearchParams = Promise<{ orgId?: string }>

export default async function AIStudioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const userId = (session.user as { id?: string })?.id!
  const { orgId: filterOrgId } = await searchParams

  // Detect super admin: no org membership
  const orgCtx = await getOrganizationContext(userId)
  const isSuperAdmin = !orgCtx

  // Fetch orgs list for super-admin org filter
  const orgs = isSuperAdmin
    ? await prisma.organization.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      })
    : []

  // Build where clause
  const whereClause = isSuperAdmin
    ? (filterOrgId ? { organizationId: filterOrgId } : {})
    : { createdBy: userId }

  const projects = await prisma.aIProject.findMany({
    where: whereClause,
    include: {
      steps: { orderBy: { stepNum: 'asc' } },
      ...(isSuperAdmin ? { createdByUser: { select: { name: true } } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  })

  const active    = projects.filter(p => ['draft', 'in-progress'].includes(p.status))
  const review    = projects.filter(p => p.status === 'review')
  const published = projects.filter(p => p.status === 'published')

  // Count total steps done across all projects
  const totalStepsDone = projects.reduce((acc, p) => acc + p.steps.filter(s => s.status === 'done').length, 0)
  const avgProgress = projects.length > 0
    ? Math.round((totalStepsDone / (projects.length * 8)) * 100)
    : 0

  // Active org name for display
  const activeOrgName = filterOrgId
    ? (orgs.find(o => o.id === filterOrgId)?.name ?? null)
    : null

  return (
    <div className="min-h-screen pt-14 bg-gradient-to-br from-gray-50 via-purple-50/10 to-blue-50/10">

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
                {isSuperAdmin && (
                  <p className="text-yellow-400 text-xs mt-0.5 font-bold">⚡ Super Admin Mode</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/admin/ai-studio/course-generator"
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl font-bold shadow hover:from-emerald-600 hover:to-teal-600 transition-all min-h-[44px]"
              >
                <Rocket size={18} />
                Generate Full Course
              </Link>
              <Link
                href="/admin/ai-studio/new"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-bold shadow hover:from-purple-600 hover:to-indigo-600 transition-all min-h-[44px]"
              >
                <Plus size={18} />
                Dự án mới
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6 flex-wrap">
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
              <div className="text-2xl font-black text-yellow-400">{review.length}</div>
              <div className="text-xs text-gray-400">Chờ duyệt</div>
            </div>
            <div className="w-px bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{published.length}</div>
              <div className="text-xs text-gray-400">Đã xuất bản</div>
            </div>
            {projects.length > 0 && (
              <>
                <div className="w-px bg-gray-700" />
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-400">{avgProgress}%</div>
                  <div className="text-xs text-gray-400">Tiến độ TB</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="container-custom py-8 space-y-8">

        {/* Super admin org filter */}
        {isSuperAdmin && orgs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Building2 size={16} className="text-purple-600" />
                Lọc theo tổ chức:
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin/ai-studio"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    !filterOrgId
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </Link>
                {orgs.map(org => (
                  <Link
                    key={org.id}
                    href={`/admin/ai-studio?orgId=${org.id}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      filterOrgId === org.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {org.name}
                  </Link>
                ))}
              </div>
              {activeOrgName && (
                <span className="text-sm text-purple-600 font-semibold ml-auto">
                  📍 {activeOrgName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Course Generator — hero entry point */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">🚀 Khởi động nhanh</p>
          <Link
            href="/admin/ai-studio/course-generator"
            className="block relative overflow-hidden rounded-3xl p-6 text-white hover:scale-[1.005] transition-transform shadow-lg hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)' }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
            />
            <div className="relative flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                🚀
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-white">Course Generator</h2>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.25)' }}
                  >
                    AI
                  </span>
                </div>
                <p className="text-white/80 text-sm">
                  Nhập chủ đề → AI tự sinh toàn bộ: Lý thuyết · Bài tập · Đáp án · Quiz · GV Guide · Video Script
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm font-bold text-white/90">
                  <span>Tạo khóa học ngay</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Chào mừng đến AI Studio!</h2>
            <p className="text-gray-500 mb-6">
              {isSuperAdmin && filterOrgId
                ? 'Tổ chức này chưa có dự án nào.'
                : 'Tạo dự án đầu tiên để bắt đầu sinh học liệu tự động với AI'}
            </p>
            <Link
              href="/admin/ai-studio/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Plus size={20} />
              Tạo dự án đầu tiên
            </Link>
          </div>
        )}

        {/* ── Đang làm ─────────────────────────────────────────── */}
        {active.length > 0 && (
          <section>
            <p className="text-sm font-bold text-gray-700 mb-3">🔄 Đang làm ({active.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {active.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p as ProjectData}
                  showOrg={isSuperAdmin}
                />
              ))}
              {/* New project card */}
              <Link
                href="/admin/ai-studio/new"
                className="block bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all p-5 flex flex-col items-center justify-center text-center min-h-[200px] group"
              >
                <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-2xl flex items-center justify-center mb-3 transition-colors">
                  <Plus size={24} className="text-purple-600" />
                </div>
                <div className="font-bold text-gray-500 group-hover:text-purple-700 transition-colors text-sm">
                  Dự án mới
                </div>
                <div className="text-xs text-gray-400 mt-1">Bắt đầu tạo học liệu</div>
              </Link>
            </div>
          </section>
        )}

        {/* ── Chờ duyệt ────────────────────────────────────────── */}
        {review.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700">⏳ Chờ duyệt ({review.length})</p>
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-lg">
                Cần xem xét và phê duyệt
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {review.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p as ProjectData}
                  showOrg={isSuperAdmin}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Đã xuất bản ──────────────────────────────────────── */}
        {published.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700">✅ Đã xuất bản ({published.length})</p>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                Sẵn sàng sử dụng
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {published.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p as ProjectData}
                  showOrg={isSuperAdmin}
                />
              ))}
            </div>
          </section>
        )}

        {/* No active projects prompt */}
        {active.length === 0 && projects.length > 0 && (
          <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">💡</div>
            <p className="font-bold text-gray-700 mb-1">Không có dự án đang làm</p>
            <p className="text-gray-400 text-sm mb-4">Tạo dự án mới để bắt đầu</p>
            <Link
              href="/admin/ai-studio/new"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition"
            >
              <Plus size={16} />
              Dự án mới
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
