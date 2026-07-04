import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import QuickNav, { type NavGroup } from '@/components/admin/QuickNav'
import { getOrganizationContext } from '@/lib/organization'

export const metadata = { title: 'Admin Dashboard — AvaB' }

// ─────────────────────────────────────────────────────────────────────────────
// Zone C: full module list — matches specification exactly
// ─────────────────────────────────────────────────────────────────────────────
function buildModuleGroups(isSuperAdmin: boolean, orgModules: string[]): NavGroup[] {
  // Kiểm tra org có bật module không (mảng rỗng = chưa cấu hình → cho thấy mọi thứ chuẩn)
  const has = (m: string) => isSuperAdmin || orgModules.length === 0 || orgModules.includes(m)
  // AI luôn phải trả phí riêng — không bao giờ free
  const hasAI = isSuperAdmin || orgModules.includes('ai')

  const groups: NavGroup[] = []

  // ═══════════════════════════════════════════════════════════════════════════
  // ĐIỂM 1 — KHOÁ HỌC: chỉ AvaB platform (SUPER_ADMIN)
  //          Đây là hoạt động kinh doanh của AvaB, org không được vào
  // ═══════════════════════════════════════════════════════════════════════════
  if (isSuperAdmin) {
    groups.push({
      id: 'courses', icon: '📚', label: 'Khoá học (Chỉ dành cho AvaB)',
      modules: [
        { href: '/admin/courses',     icon: '📚', label: 'Khoá học',    desc: 'Khoá học của nền tảng AvaB' },
        { href: '/admin/enrollments', icon: '📝', label: 'Đăng ký học', desc: 'Ghi danh & phê duyệt' },
        { href: '/admin/finance/invoices', icon: '💰', label: 'Thu học phí', desc: 'Đợt thu & thanh toán' },
        { href: '/admin/ai-studio/course-generator', icon: '🚀', label: 'AI Tạo khoá học', desc: 'Chỉ dành cho AvaB' },
      ],
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // THÀNH VIÊN — LMS cơ bản (gói 'lms' hoặc mặc định)
  // ═══════════════════════════════════════════════════════════════════════════
  if (has('lms')) {
    groups.push({
      id: 'members', icon: '👥', label: 'Thành viên',
      modules: [
        { href: '/admin/erp/students',  icon: '👦',    label: 'Học sinh',    desc: 'Hồ sơ học viên' },
        { href: '/admin/erp/teachers',  icon: '👨‍🏫', label: 'Giáo viên',  desc: 'Hồ sơ · lịch dạy' },
        { href: '/admin/users',         icon: '👤',    label: 'Tài khoản',   desc: 'Quản lý đăng nhập' },
        { href: '/admin/erp/classes',   icon: '📋',    label: 'Lớp học',     desc: 'Tạo lớp, gán GV' },
        // Org admin: đăng ký học nằm ở đây (không có nhóm Khoá học riêng)
        ...(!isSuperAdmin ? [
          { href: '/admin/enrollments', icon: '📝', label: 'Đăng ký học', desc: 'Ghi danh & phê duyệt' },
        ] : []),
        { href: '/admin/erp/transfers', icon: '🔄',    label: 'Chuyển lớp', desc: 'Yêu cầu chuyển lớp' },
        { href: '/admin/erp/alumni',    icon: '🎓',    label: 'Alumni',      desc: 'Học sinh đã tốt nghiệp' },
      ],
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HỌC VỤ ERP (gói 'erp')
  // ═══════════════════════════════════════════════════════════════════════════
  if (has('erp')) {
    groups.push({
      id: 'academic', icon: '🏫', label: 'Học vụ ERP',
      modules: [
        { href: '/admin/erp',                    icon: '🏫', label: 'ERP Hub',      desc: 'Trung tâm học vụ' },
        { href: '/admin/erp/attendance',         icon: '✅', label: 'Điểm danh',    desc: 'Check-in, vắng mặt' },
        { href: '/admin/erp/timetable',          icon: '📅', label: 'TKB',          desc: 'Thời khóa biểu' },
        { href: '/admin/erp/timetable/workload', icon: '⚖️', label: 'Tải công GV',  desc: 'Phân công giảng dạy' },
        { href: '/admin/erp/classrooms',         icon: '🚪', label: 'Phòng học',    desc: 'Quản lý phòng học' },
        { href: '/admin/erp/health',             icon: '🏥', label: 'Sức khỏe',     desc: 'Hồ sơ y tế HS' },
        { href: '/admin/erp/equipment',          icon: '💻', label: 'Thiết bị',     desc: 'Tài sản nhà trường' },
        { href: '/admin/erp/awards',             icon: '🏆', label: 'Khen thưởng',  desc: 'Giải thưởng HS' },
        { href: '/admin/erp/reports',            icon: '📊', label: 'Báo cáo ERP',  desc: 'Báo cáo học vụ' },
        { href: '/admin/erp/bus-routes',         icon: '🚌', label: 'Xe tuyến',     desc: 'Xe đưa đón HS' },
        { href: '/admin/erp/uniforms',           icon: '👕', label: 'Đồng phục',    desc: 'Đặt đồng phục HS' },
        { href: '/admin/erp/canteen',            icon: '🍽️', label: 'Căng tin',     desc: 'Suất ăn & thực đơn' },
        { href: '/admin/erp/library',            icon: '📖', label: 'Thư viện',     desc: 'Sách & mượn trả' },
        { href: '/admin/erp/academic-years',     icon: '📆', label: 'Năm học',      desc: 'Quản lý năm học' },
      ],
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TÀI CHÍNH (gói 'finance')
  // ═══════════════════════════════════════════════════════════════════════════
  if (has('finance')) {
    groups.push({
      id: 'finance', icon: '💰', label: 'Tài chính',
      modules: [
        { href: '/admin/finance',                icon: '💰', label: 'Finance Hub',  desc: 'Tổng quan tài chính' },
        { href: '/admin/finance/invoices',       icon: '📋', label: 'Hóa đơn',     desc: 'Đợt thu học phí' },
        { href: '/admin/finance/vouchers',       icon: '🎟️', label: 'Voucher',     desc: 'Mã giảm giá' },
        { href: '/admin/finance/scholarships',   icon: '🏆', label: 'Học bổng',    desc: 'Chương trình học bổng' },
        { href: '/admin/finance/installments',   icon: '📆', label: 'Trả góp',     desc: 'Kế hoạch trả góp' },
        { href: '/admin/finance/cashflow',       icon: '📊', label: 'Cashflow',    desc: 'Dòng tiền' },
        { href: '/admin/finance/payment-gateway',icon: '💳', label: 'Cổng TT',     desc: 'VNPay, MoMo, Banking' },
        { href: '/admin/finance/forecast',       icon: '📉', label: 'Dự báo DT',   desc: 'Dự báo doanh thu' },
        { href: '/admin/finance/reports',        icon: '📰', label: 'Báo cáo TC',  desc: 'Báo cáo tài chính' },
        { href: '/admin/analytics',              icon: '📈', label: 'Phân tích',   desc: 'Báo cáo & phân tích' },
      ],
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRM TUYỂN SINH (gói 'crm')
  // ═══════════════════════════════════════════════════════════════════════════
  if (has('crm')) {
    groups.push({
      id: 'crm', icon: '📊', label: 'CRM Tuyển sinh',
      modules: [
        { href: '/admin/crm',           icon: '📊', label: 'CRM Hub',   desc: 'Pipeline · leads · tuyển sinh' },
        { href: '/admin/crm/pipeline',  icon: '📋', label: 'Pipeline',  desc: 'Kanban leads' },
        { href: '/admin/crm/campaigns', icon: '📣', label: 'Campaigns', desc: 'Email · SMS · Zalo' },
        { href: '/admin/contacts',      icon: '📞', label: 'Contacts',  desc: 'Danh bạ liên hệ' },
      ],
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HRM NHÂN SỰ (gói 'hrm')
  // ═══════════════════════════════════════════════════════════════════════════
  if (has('hrm')) {
    groups.push({
      id: 'hrm', icon: '👔', label: 'HRM Nhân sự',
      modules: [
        { href: '/admin/hrm',            icon: '👔', label: 'HRM Hub',    desc: 'Quản lý nhân sự' },
        { href: '/admin/hrm/staff',      icon: '👥', label: 'Nhân viên',  desc: 'Hồ sơ, phân công' },
        { href: '/admin/hrm/contracts',  icon: '📄', label: 'Hợp đồng',  desc: 'HĐLĐ, theo dõi' },
        { href: '/admin/hrm/attendance', icon: '⏰', label: 'Chấm công',  desc: 'Check-in/out' },
        { href: '/admin/hrm/leave',      icon: '🌴', label: 'Nghỉ phép',  desc: 'Đơn xin nghỉ' },
        { href: '/admin/hrm/kpi',        icon: '📊', label: 'KPI',        desc: 'Mục tiêu, đánh giá' },
        { href: '/admin/hrm/payroll',    icon: '💰', label: 'Bảng lương', desc: 'Lương, thưởng' },
      ],
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CỘNG TÁC (gói 'collab')
  // ═══════════════════════════════════════════════════════════════════════════
  if (has('collab')) {
    groups.push({
      id: 'collab', icon: '🤝', label: 'Cộng tác',
      modules: [
        { href: '/admin/collab/tasks',    icon: '✅', label: 'Tasks',    desc: 'Quản lý công việc' },
        { href: '/admin/collab/calendar', icon: '📅', label: 'Calendar', desc: 'Lịch nhóm' },
        { href: '/admin/collab/meetings', icon: '🎥', label: 'Meetings', desc: 'Họp trực tuyến' },
        { href: '/admin/workflow',        icon: '⚙️', label: 'Workflow', desc: 'BPM & approval' },
      ],
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PORTALS — luôn hiển thị
  // ═══════════════════════════════════════════════════════════════════════════
  groups.push({
    id: 'portals', icon: '🌐', label: 'Portals',
    modules: [
      { href: '/giao-vien', icon: '👩‍🏫', label: 'Portal Giáo viên', desc: 'Giao diện dành cho GV' },
      { href: '/hoc-vien',  icon: '🎒',          label: 'Portal Học sinh',  desc: 'Giao diện dành cho HS' },
      { href: '/phu-huynh', icon: '👨‍👩‍👧', label: 'Portal Phụ huynh', desc: 'Giao diện dành cho PH' },
    ],
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // ĐIỂM 2 — AI PREMIUM: Add-on trả phí, mặc định khoá
  // ═══════════════════════════════════════════════════════════════════════════
  if (hasAI) {
    groups.push({
      id: 'ai-premium', icon: '✨', label: 'AI Studio (Premium)',
      modules: [
        { href: '/admin/ai-studio',                  icon: '✨', label: 'AI Studio',       desc: 'Tạo nội dung bằng AI' },
        { href: '/admin/ai-studio/course-generator', icon: '🚀', label: 'Course Generator', desc: 'Sinh khoá học tự động' },
        { href: '/admin/ai-decision',                icon: '🧠', label: 'AI Decision',      desc: 'Phân tích & cảnh báo AI' },
        { href: '/admin/material-import',            icon: '📥', label: 'Material Import',  desc: 'Word/PDF → AI xử lý' },
        { href: '/admin/question-bank',              icon: '🗃️', label: 'Question Bank',   desc: 'Ngân hàng câu hỏi AI' },
        { href: '/admin/education-standards',        icon: '📖', label: 'AvaB Standards',   desc: 'K12/Cambridge/IB' },
        { href: '/admin/publishing',                 icon: '📤', label: 'Publishing',       desc: 'Xuất Word/PDF/Slide' },
        { href: '/admin/gamification',               icon: '🎮', label: 'Gamification',     desc: 'Điểm · huy hiệu · XH' },
      ],
    })
  } else {
    // Org chưa mua AI → hiện nút nâng cấp
    groups.push({
      id: 'ai-upgrade', icon: '🔒', label: 'AI Studio',
      modules: [
        { href: '/admin/settings', icon: '⭐', label: '✨ Nâng cấp để dùng AI', desc: 'Liên hệ AvaB để kích hoạt' },
        { href: '/admin/ai-studio',                  icon: '✨', label: 'AI Studio',       desc: 'Tạo nội dung bằng AI' },
        { href: '/admin/ai-studio/course-generator', icon: '🚀', label: 'Course Generator', desc: 'Sinh khoá học tự động' },
        { href: '/admin/ai-decision',                icon: '🧠', label: 'AI Decision',      desc: 'Phân tích & cảnh báo AI' },
        { href: '/admin/material-import',            icon: '📥', label: 'Material Import',  desc: 'Word/PDF → AI xử lý' },
        { href: '/admin/question-bank',              icon: '🗃️', label: 'Question Bank',   desc: 'Ngân hàng câu hỏi AI' },
        { href: '/admin/publishing',                 icon: '📤', label: 'Publishing',       desc: 'Xuất Word/PDF/Slide' },
        { href: '/admin/gamification',               icon: '🎮', label: 'Gamification',     desc: 'Điểm · huy hiệu · Xếp hạng' },
      ],
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HỆ THỐNG — luôn hiển thị cuối
  // ═══════════════════════════════════════════════════════════════════════════
  groups.push({
    id: 'system', icon: '⚙️', label: 'Hệ thống',
    modules: [
      { href: '/admin/roles',          icon: '🛡️', label: 'RBAC',           desc: 'Roles & phân quyền' },
      { href: '/admin/permissions',    icon: '🔑', label: 'Permissions',    desc: 'Danh mục quyền' },
      { href: '/admin/audit',          icon: '📋', label: 'Audit Log',      desc: 'Lịch sử thay đổi' },
      { href: '/admin/organizations',  icon: '🏢', label: 'Tổ chức',        desc: 'Trường & cơ sở' },
      { href: '/admin/notifications',  icon: '🔔', label: 'Thông báo',      desc: 'Notification center' },
      { href: '/admin/news',           icon: '📰', label: 'Tin tức',         desc: 'Bài viết & thông báo' },
      { href: '/admin/settings',       icon: '⚙️', label: 'Cài đặt & Gói dịch vụ', desc: 'Cấu hình & module' },
      { href: '/admin/data-migration', icon: '📦', label: 'Data Migration',  desc: 'Import/Export dữ liệu' },
    ],
  })

  // Platform Admin — chỉ SUPER_ADMIN
  if (isSuperAdmin) {
    groups.push({
      id: 'platform', icon: '🔧', label: 'Platform Admin',
      modules: [
        { href: '/admin/platform',       icon: '🔧', label: 'Platform',        desc: 'Quản trị nền tảng AvaB' },
        { href: '/admin/organizations',  icon: '🏢', label: 'Tất cả tổ chức', desc: 'Tạo & quản lý org' },
        { href: '/admin/users',          icon: '👤', label: 'Tất cả user',    desc: 'Người dùng hệ thống' },
        { href: '/admin/app-center',     icon: '🧩', label: 'App Center',      desc: 'Tích hợp & mở rộng' },
        { href: '/admin/app-center/api', icon: '🔌', label: 'API Platform',    desc: 'REST & GraphQL' },
      ],
    })
  }

  return groups
}
// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default async function AdminPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) redirect('/dang-nhap')

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = userId ? await getOrganizationContext(userId) : null
  const userRole = (session.user as { role?: string })?.role ?? ''
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  const allOrgUsers = userId
    ? await prisma.organizationUser.findMany({
        where: { userId },
        include: { organization: { select: { id: true, name: true, slug: true } } },
      })
    : []

  // ── Zone A data ───────────────────────────────────────────────────────────
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const overdueThreshold = new Date(Date.now() - 30 * 86_400_000)

  // Org filter — SUPER_ADMIN without org sees all, org admin sees only their org
  const orgFilter = orgCtx?.id ? { organizationId: orgCtx.id } : {}
  const orgPaymentFilter = orgCtx?.id ? { enrollment: { course: { organizationId: orgCtx.id } } } : {}
  const courseOrgFilter = orgCtx?.id ? { organizationId: orgCtx.id, isActive: true } : { isActive: true }

  const [
    activeStudents,
    pendingApprovals,
    newContacts,
    activeProjects,
    totalCourses,
    unpaidCount,
    paidThisMonth,
    draftProjects,
    aiWarnings,
  ] = await Promise.all([
    prisma.enrollment.count({ where: { ...orgFilter, status: 'ACTIVE' } }),
    prisma.enrollment.count({ where: { ...orgFilter, status: 'PENDING' } }),
    prisma.registration.count({ where: { status: 'NEW' } }),
    prisma.aIProject.count({ where: { ...orgFilter, status: 'in-progress' } }),
    prisma.course.count({ where: courseOrgFilter }),
    prisma.tuitionPayment.count({ where: { ...orgPaymentFilter, isPaid: false, isFree: false } }),
    prisma.tuitionPayment.aggregate({
      where: { ...orgPaymentFilter, isPaid: true, isFree: false, paidAt: { gte: thisMonthStart } },
      _sum: { amount: true },
    }),
    prisma.aIProject.count({ where: { ...orgFilter, status: 'draft' } }),
    prisma.tuitionPayment.count({
      where: { ...orgPaymentFilter, isPaid: false, isFree: false, createdAt: { lt: overdueThreshold } },
    }),
  ])

  const paidThisMonthAmt = paidThisMonth._sum.amount ?? 0
  const fmtVNDShort = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return Math.round(n / 1_000) + 'K'
    return String(n)
  }

  // Total warning count for AI Decision badge
  const totalWarnings = aiWarnings + (pendingApprovals > 5 ? 1 : 0)

  // ── Zone A: stat pills ────────────────────────────────────────────────────
  const statPills = [
    { icon: '👥', count: activeStudents,   label: 'Đang học',   urgent: false },
    { icon: '⏳', count: pendingApprovals, label: 'Chờ duyệt',  urgent: pendingApprovals > 0 },
    { icon: '📩', count: newContacts,       label: 'Liên hệ mới', urgent: newContacts > 0 },
    { icon: '🤖', count: activeProjects,    label: 'AI đang chạy', urgent: false },
    { icon: '📚', count: totalCourses,      label: 'Khóa học',   urgent: false },
  ]

  // ── Zone B: 4 hero action cards ───────────────────────────────────────────
  const primaryActions = [
    {
      href: '/admin/ai-studio/course-generator',
      icon: '🚀',
      title: 'Tạo khóa học',
      desc: 'AI sinh lý thuyết, bài tập, đề kiểm tra tự động',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      badge: draftProjects > 0 ? `${draftProjects} projects draft` : null,
      badgeUrgent: false,
    },
    {
      href: '/admin/enrollments',
      icon: '✅',
      title: 'Duyệt đăng ký',
      desc: 'Xem và phê duyệt học viên chờ vào khóa học',
      gradient: pendingApprovals > 0
        ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
        : 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
      badge: pendingApprovals > 0 ? `${pendingApprovals} chờ duyệt` : null,
      badgeUrgent: pendingApprovals > 0,
    },
    {
      href: '/admin/finance',
      icon: '💰',
      title: 'Thu học phí',
      desc: 'Theo dõi và xử lý học phí học viên',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      badge: unpaidCount > 0 ? `${unpaidCount} chưa thu` : null,
      badgeUrgent: unpaidCount > 0,
    },
    {
      href: '/admin/ai-decision',
      icon: '🧠',
      title: 'AI Decision',
      desc: 'Phân tích rủi ro, cảnh báo học sinh & tài chính',
      gradient: totalWarnings > 0
        ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      badge: totalWarnings > 0 ? `${totalWarnings} cảnh báo` : null,
      badgeUrgent: totalWarnings > 0,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Zone A: Today's Pulse (compact pills) ─────────────────────────── */}
      <div className="container-custom pt-6 pb-2">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
            📅 Hôm nay
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Admin Dashboard</h1>
            {orgCtx ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                🏢 {orgCtx.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                ⚙️ AvaB Platform Admin
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {orgCtx
              ? `${orgCtx.name} · Vai trò: ${orgCtx.orgRole}`
              : 'Tình trạng vận hành nền tảng AvaB'}
          </p>

          {/* Org switcher */}
          {allOrgUsers.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-gray-400 self-center">Chuyển org:</span>
              {allOrgUsers.map((ou) => (
                <Link
                  key={ou.organization.id}
                  href={`/admin/organizations/${ou.organization.id}/settings`}
                  className="text-xs font-bold px-3 py-1 rounded-full border transition-colors"
                  style={{
                    borderColor: orgCtx?.id === ou.organization.id ? '#7c3aed' : '#e5e7eb',
                    color: orgCtx?.id === ou.organization.id ? '#7c3aed' : '#6b7280',
                    background: orgCtx?.id === ou.organization.id ? '#f5f3ff' : '#fff',
                  }}
                >
                  {ou.organization.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Compact stat pills ── */}
        <div className="flex flex-wrap gap-2 mb-3">
          {statPills.map((pill) => (
            <div
              key={pill.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm border transition-all"
              style={{
                background: pill.urgent ? '#fef2f2' : '#ffffff',
                borderColor: pill.urgent ? '#fca5a5' : '#e5e7eb',
                color: pill.urgent ? '#dc2626' : '#374151',
              }}
            >
              <span className="text-base leading-none">{pill.icon}</span>
              <span className="text-base font-black">{pill.count.toLocaleString('vi-VN')}</span>
              <span className="text-xs font-semibold opacity-75">{pill.label}</span>
            </div>
          ))}
        </div>

        {/* Finance quick bar */}
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

        {/* ── Organization Management card ─────────────────────────────────── */}
        {orgCtx && (
          <div
            className="rounded-2xl overflow-hidden shadow-sm border border-purple-100"
            style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  🏢
                </div>
                <div>
                  <p className="font-black text-gray-900 text-base leading-tight">{orgCtx.name}</p>
                  <p className="text-xs text-gray-500">
                    Vai trò: <span className="font-bold text-purple-700">{orgCtx.orgRole}</span>
                    {' · '}{orgCtx.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/organizations/${orgCtx.id}/settings`}
                  className="text-xs font-bold px-3 py-2 rounded-lg border transition hover:bg-white"
                  style={{ borderColor: '#c4b5fd', color: '#7c3aed' }}
                >
                  ⚙️ Cài đặt
                </Link>
                <Link
                  href={`/admin/organizations/${orgCtx.id}`}
                  className="text-xs font-bold px-3 py-2 rounded-lg text-white transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  🏢 Quản lý tổ chức →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Zone B: 4 Hero Action Cards ──────────────────────────────────── */}
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
                {/* Decorative blob */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full pointer-events-none"
                  style={{ transform: 'translate(30%, -40%)' }}
                />

                <div className="relative flex items-start justify-between mb-3">
                  <span className="text-4xl leading-none">{action.icon}</span>
                  {action.badge && (
                    <span
                      className="text-xs font-black px-2.5 py-1 rounded-full animate-pulse"
                      style={{
                        background: action.badgeUrgent ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.25)',
                        color: 'white',
                      }}
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

        {/* ── Zone C: Full Navigation (collapsible, state persisted) ─────── */}
        <QuickNav groups={buildModuleGroups(isSuperAdmin, orgCtx?.modules ?? [])} />

      </div>
    </div>
  )
}
