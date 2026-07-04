import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import QuickNav, { type NavGroup } from '@/components/admin/QuickNav'

export const metadata = { title: 'Admin Dashboard — AvaB' }

// ─────────────────────────────────────────────────────────────────────────────
// Zone C: full module list, grouped for the collapsible accordion
// ─────────────────────────────────────────────────────────────────────────────
const ALL_MODULE_GROUPS: NavGroup[] = [
  {
    id: 'ai-content',
    icon: '🤖',
    label: 'AI & Nội dung',
    modules: [
      { href: '/admin/ai-studio',                  icon: '✨',  label: 'AI Studio',        desc: 'AI projects & engine' },
      { href: '/admin/ai-studio/course-generator', icon: '🚀',  label: 'Course Generator', desc: 'Tạo khóa học AI' },
      { href: '/admin/material-import',            icon: '📚',  label: 'Material Import',  desc: 'Word/PDF/Quizizz' },
      { href: '/admin/question-bank',              icon: '🗃️', label: 'Question Bank',    desc: 'Ngân hàng câu hỏi' },
      { href: '/admin/education-standards',        icon: '📖',  label: 'AvaB Standards',   desc: 'K12/Cambridge/IB' },
      { href: '/admin/content-studio',             icon: '🎨',  label: 'Content Studio',   desc: 'Tạo học liệu A–Z' },
      { href: '/admin/ai-generator',               icon: '🤖',  label: 'AI Generator',     desc: 'Engine modules' },
    ],
  },
  {
    id: 'academic',
    icon: '🎓',
    label: 'Học vụ',
    modules: [
      { href: '/admin/courses',          icon: '📚',  label: 'Khóa học',       desc: 'Thêm, sửa, xoá' },
      { href: '/admin/enrollments',      icon: '✅',      label: 'Đăng ký',       desc: 'Phê duyệt HS' },
      { href: '/admin/users',            icon: '👥',  label: 'Học sinh',        desc: 'Quản lý học viên' },
      { href: '/admin/erp/teachers',     icon: '👨‍🏫',  label: 'Giáo viên ERP',   desc: 'Hồ sơ · lịch dạy · cơ sở' },
      { href: '/admin/erp/classrooms',   icon: '🏛️',  label: 'Phòng học',       desc: 'Quản lý phòng học' },
      { href: '/giao-vien',              icon: '👨🏫',  label: 'Portal GV',         desc: 'Portal giáo viên' },
      { href: '/hoc-vien',               icon: '👦',  label: 'Học viên',        desc: 'Portal học sinh' },
      { href: '/phu-huynh',         icon: '👨‍👩‍👧‍👦', label: 'Phụ huynh',  desc: 'Theo dõi con' },
    ],
  },
  {
    id: 'finance',
    icon: '💰',
    label: 'Tài chính',
    modules: [
      { href: '/admin/finance',           icon: '💰', label: 'Finance',        desc: 'Doanh thu & học phí' },
      { href: '/admin/finance/invoices',  icon: '📋', label: 'Hóa đơn',        desc: 'Quản lý đợt thu HP' },
      { href: '/admin/data-migration',    icon: '📦', label: 'Data Migration', desc: 'Import Excel/CSV' },
    ],
  },
  {
    id: 'org',
    icon: '🏢',
    label: 'Tổ chức',
    modules: [
      { href: '/admin/organizations', icon: '🏢',  label: 'Organizations', desc: 'Trường & cơ sở' },
      { href: '/admin/roles',         icon: '🛡️', label: 'RBAC',          desc: 'Roles & phân quyền' },
      { href: '/admin/workflow',      icon: '⚙️',  label: 'Workflow',      desc: 'BPM & approval' },
      { href: '/admin/erp',           icon: '🏫',  label: 'School ERP',    desc: 'Điểm danh · TKB' },
      { href: '/admin/hrm',           icon: '👨‍💼', label: 'HRM',           desc: 'Nhân sự giáo viên' },
      { href: '/admin/collab',        icon: '🤝',  label: 'Collaboration', desc: 'Cộng tác nhóm' },
    ],
  },
  {
    id: 'analytics',
    icon: '📊',
    label: 'Phân tích',
    modules: [
      { href: '/admin/analytics',     icon: '📊', label: 'Analytics',    desc: 'Báo cáo học tập' },
      { href: '/admin/ai-decision',   icon: '🧠', label: 'AI Decision',  desc: 'Phân tích · Cảnh báo' },
      { href: '/admin/gamification',  icon: '🎮', label: 'Gamification', desc: 'XP · Badge · Mission' },
    ],
  },
  {
    id: 'system',
    icon: '⚙️',
    label: 'Hệ thống',
    modules: [
      { href: '/admin/audit',         icon: '📋',  label: 'Audit Log',        desc: 'Lịch sử thay đổi' },
      { href: '/admin/permissions',   icon: '🔑',  label: 'Permissions',      desc: 'Danh mục quyền' },
      { href: '/admin/roles/matrix',  icon: '📊',  label: 'Permission Matrix', desc: 'Ma trận phân quyền' },
      { href: '/admin/news',          icon: '📰',  label: 'Tin tức',          desc: 'Đăng bài viết' },
      { href: '/admin/crm',           icon: '📊',  label: 'CRM',              desc: 'Pipeline · leads · tuyển sinh' },
      { href: '/admin/contacts',      icon: '📩',  label: 'Liên hệ',          desc: 'CRM / leads (legacy)' },
      { href: '/admin/schools',       icon: '🏫',  label: 'Trường & TT',      desc: 'Multi-school' },
      { href: '/admin/publishing',     icon: '📤',  label: 'Publishing',       desc: 'Xuất Word/PDF/Slide' },
      { href: '/admin/notifications',  icon: '🔔',  label: 'Notifications',    desc: 'Trung tâm thông báo' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default async function AdminPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  // ── Zone A data: today's operational snapshot ────────────────────────────
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [
    activeStudents,
    pendingApprovals,
    newContacts,
    activeProjects,
    totalCourses,
    unpaidCount,
    paidThisMonth,
  ] = await Promise.all([
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.registration.count({ where: { status: 'NEW' } }),
    prisma.aIProject.count({ where: { status: 'in-progress' } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.tuitionPayment.count({ where: { isPaid: false, isFree: false } }),
    prisma.tuitionPayment.aggregate({
      where: { isPaid: true, isFree: false, paidAt: { gte: thisMonthStart } },
      _sum: { amount: true },
    }),
  ])

  const paidThisMonthAmt = paidThisMonth._sum.amount ?? 0
  const fmtVNDShort = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return Math.round(n / 1_000) + 'K'
    return String(n)
  }

  // ── Zone B: primary action cards ────────────────────────────────────────
  const primaryActions = [
    {
      href: '/admin/ai-studio/course-generator',
      icon: '🚀',
      title: 'Tạo khóa học mới',
      desc: 'AI tự động sinh lý thuyết, bài tập, đề kiểm tra',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      badge: 'AI',
    },
    {
      href: '/admin/enrollments',
      icon: '✅',
      title: 'Duyệt đăng ký',
      desc: 'Xem và phê duyệt học viên đăng ký khóa học',
      gradient: pendingApprovals > 0
        ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
        : 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
      badge: pendingApprovals > 0 ? `${pendingApprovals} chờ` : null,
    },
    {
      href: '/admin/material-import',
      icon: '📚',
      title: 'Import tài liệu',
      desc: 'Đưa Word/PDF/Quizizz vào AvaB bằng AI',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #059669 100%)',
      badge: 'AI',
    },
    {
      href: '/admin/analytics',
      icon: '📊',
      title: 'Xem báo cáo',
      desc: 'Doanh thu, học sinh, tiến độ học tập',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      badge: null,
    },
  ]

  return (
    <div className="min-h-screen pt-20 bg-gray-50">

      {/* ── Zone A: Today's Overview ──────────────────────────────────────── */}
      <div className="container-custom pt-6 pb-2">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
            📅 Hôm nay
          </p>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tình trạng vận hành nền tảng AvaB</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* Học sinh đang học — teal */}
          <div
            className="rounded-2xl p-4 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1 leading-tight">👥 Học sinh đang học</p>
            <p className="text-3xl font-black">{activeStudents}</p>
          </div>

          {/* Chờ duyệt — orange (highlight when > 0) */}
          <div
            className="rounded-2xl p-4 text-white shadow-sm relative overflow-hidden"
            style={{
              background: pendingApprovals > 0
                ? 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
            }}
          >
            {pendingApprovals > 0 && (
              <div
                className="absolute top-0 right-0 w-10 h-10 bg-white/20 rounded-full pointer-events-none"
                style={{ transform: 'translate(30%, -30%)' }}
              />
            )}
            <p className="text-xs font-semibold opacity-75 mb-1 leading-tight">⏳ Chờ duyệt</p>
            <p className="text-3xl font-black">{pendingApprovals}</p>
            {pendingApprovals > 0 && (
              <p className="text-xs mt-1 font-bold opacity-90">Cần xử lý</p>
            )}
          </div>

          {/* Liên hệ mới — blue */}
          <div
            className="rounded-2xl p-4 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1 leading-tight">📩 Liên hệ mới</p>
            <p className="text-3xl font-black">{newContacts}</p>
          </div>

          {/* AI Projects — violet */}
          <div
            className="rounded-2xl p-4 text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1 leading-tight">🤖 AI Projects</p>
            <p className="text-3xl font-black">{activeProjects}</p>
          </div>

          {/* Khóa học — purple */}
          <div
            className="rounded-2xl p-4 text-white shadow-sm col-span-2 sm:col-span-1"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
          >
            <p className="text-xs font-semibold opacity-75 mb-1 leading-tight">📚 Khóa học</p>
            <p className="text-3xl font-black">{totalCourses}</p>
          </div>
        </div>

        {/* Finance quick-stats bar */}
        <Link
          href="/admin/finance"
          className="flex items-center justify-between rounded-2xl px-5 py-3.5 text-white shadow-sm hover:opacity-90 active:scale-[0.99] transition-all"
          style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-xs font-semibold text-emerald-200 leading-tight">Tài chính tháng này</p>
              <p className="text-sm font-black text-white">{fmtVNDShort(paidThisMonthAmt)}đ đã thu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unpaidCount > 0 && (
              <span className="text-xs font-black bg-red-500 text-white px-2.5 py-1 rounded-full">
                🔴 {unpaidCount} chưa thu
              </span>
            )}
            {unpaidCount === 0 && (
              <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">
                ✅ Không có công nợ
              </span>
            )}
            <span className="text-white/60 text-sm">→</span>
          </div>
        </Link>
      </div>

      <div className="container-custom py-6 space-y-6">

        {/* ── Zone B: Primary Actions ───────────────────────────────────────── */}
        <div>
          <p className="text-sm font-bold text-gray-500 mb-3">✨ Bạn muốn làm gì?</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {primaryActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="relative overflow-hidden rounded-2xl p-6 text-white hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md hover:shadow-xl group"
                style={{ background: action.gradient }}
              >
                {/* decorative blob */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full pointer-events-none"
                  style={{ transform: 'translate(30%, -40%)' }}
                />

                <div className="relative flex items-start justify-between mb-3">
                  <span className="text-4xl leading-none">{action.icon}</span>
                  {action.badge && (
                    <span
                      className="text-xs font-black px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
                    >
                      {action.badge}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <h3 className="text-lg font-black text-white leading-tight">{action.title}</h3>
                  <p className="text-sm mt-1 text-white/75 leading-relaxed">{action.desc}</p>
                  <p className="text-sm font-bold mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <span>Mở ngay</span>
                    <span>→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Zone C: Full Navigation (collapsible) ─────────────────────────── */}
        <QuickNav groups={ALL_MODULE_GROUPS} />

      </div>
    </div>
  )
}
