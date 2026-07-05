'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: string
  href: string
  category: string
  keywords: string[]
}

const COMMANDS: CommandItem[] = [
  // AI & Nội dung
  { id: 'ai-studio', label: 'AI Studio', description: 'Quản lý AI projects', icon: '✨', href: '/admin/ai-studio', category: 'AI', keywords: ['ai studio','project','ai'] },
  { id: 'course-generator', label: 'Course Generator', description: 'Tạo khóa học bằng AI', icon: '🚀', href: '/admin/ai-studio/course-generator', category: 'AI', keywords: ['course','generator','tạo khóa học','ai'] },
  { id: 'material-import', label: 'Import học liệu', description: 'Import Word/PDF/Quizizz', icon: '📚', href: '/admin/material-import', category: 'AI', keywords: ['import','word','pdf','học liệu'] },
  { id: 'question-bank', label: 'Ngân hàng câu hỏi', description: 'Quản lý câu hỏi', icon: '🗃️', href: '/admin/question-bank', category: 'AI', keywords: ['question','bank','câu hỏi','ngân hàng'] },
  { id: 'publishing', label: 'Publishing Center', description: 'Xuất Word/PDF/Slide', icon: '📤', href: '/admin/publishing', category: 'AI', keywords: ['publish','xuất','word','pdf','slide'] },
  // Học vụ ERP
  { id: 'erp', label: 'School ERP', description: 'Quản lý nhà trường', icon: '🏫', href: '/admin/erp', category: 'ERP', keywords: ['erp','trường','school'] },
  { id: 'students', label: 'Học sinh', description: 'Danh sách học sinh', icon: '👥', href: '/admin/erp/students', category: 'ERP', keywords: ['học sinh','student','danh sách'] },
  { id: 'teachers', label: 'Giáo viên', description: 'Danh sách giáo viên', icon: '👨‍🏫', href: '/admin/erp/teachers', category: 'ERP', keywords: ['giáo viên','teacher'] },
  { id: 'classes', label: 'Lớp học', description: 'Quản lý lớp học', icon: '📋', href: '/admin/erp/classes', category: 'ERP', keywords: ['lớp','class','khóa học'] },
  { id: 'attendance', label: 'Điểm danh', description: 'Điểm danh học sinh', icon: '✅', href: '/admin/erp/attendance', category: 'ERP', keywords: ['điểm danh','attendance','vắng'] },
  { id: 'timetable', label: 'Thời khóa biểu', description: 'AI xếp thời khóa biểu', icon: '📅', href: '/admin/erp/timetable', category: 'ERP', keywords: ['thời khóa biểu','tkb','lịch','timetable'] },
  { id: 'timetable-settings', label: 'Cấu hình TKB', description: 'Cài đặt tiết học, ngày nghỉ', icon: '⚙️', href: '/admin/erp/timetable/settings', category: 'ERP', keywords: ['cấu hình','settings','ngày nghỉ','holiday'] },
  { id: 'health', label: 'Sức khỏe', description: 'Hồ sơ sức khỏe học sinh', icon: '🏥', href: '/admin/erp/health', category: 'ERP', keywords: ['sức khỏe','health','bảo hiểm'] },
  { id: 'equipment', label: 'Thiết bị', description: 'Quản lý thiết bị', icon: '💻', href: '/admin/erp/equipment', category: 'ERP', keywords: ['thiết bị','equipment','máy tính'] },
  { id: 'alumni', label: 'Alumni', description: 'Học sinh tốt nghiệp', icon: '🎓', href: '/admin/erp/alumni', category: 'ERP', keywords: ['alumni','tốt nghiệp','cựu học sinh'] },
  { id: 'transfers', label: 'Chuyển lớp', description: 'Duyệt chuyển lớp', icon: '🔄', href: '/admin/erp/transfers', category: 'ERP', keywords: ['chuyển lớp','transfer'] },
  // Tài chính
  { id: 'finance', label: 'Tài chính', description: 'Dashboard tài chính', icon: '💰', href: '/admin/finance', category: 'Finance', keywords: ['tài chính','finance','doanh thu'] },
  { id: 'invoices', label: 'Hóa đơn', description: 'Quản lý đợt thu học phí', icon: '📋', href: '/admin/finance/invoices', category: 'Finance', keywords: ['hóa đơn','invoice','học phí','thu tiền'] },
  { id: 'vouchers', label: 'Voucher', description: 'Mã giảm giá', icon: '🎫', href: '/admin/finance/vouchers', category: 'Finance', keywords: ['voucher','giảm giá','coupon','mã'] },
  { id: 'scholarships', label: 'Học bổng', description: 'Quản lý học bổng', icon: '🎓', href: '/admin/finance/scholarships', category: 'Finance', keywords: ['học bổng','scholarship','miễn giảm'] },
  { id: 'installments', label: 'Trả góp', description: 'Kế hoạch trả góp', icon: '📋', href: '/admin/finance/installments', category: 'Finance', keywords: ['trả góp','installment','kỳ','góp'] },
  { id: 'cashflow', label: 'Dòng tiền', description: 'Cash flow tháng', icon: '📈', href: '/admin/finance/cashflow', category: 'Finance', keywords: ['cashflow','dòng tiền','cash'] },
  { id: 'finance-reports', label: 'Báo cáo tài chính', description: 'Báo cáo & thống kê', icon: '📊', href: '/admin/finance/reports', category: 'Finance', keywords: ['báo cáo','report','thống kê','tài chính'] },
  { id: 'forecast', label: 'Dự báo doanh thu', description: 'Revenue forecast', icon: '🔮', href: '/admin/finance/forecast', category: 'Finance', keywords: ['dự báo','forecast','revenue'] },
  // CRM
  { id: 'crm', label: 'CRM', description: 'Quản lý khách hàng', icon: '📊', href: '/admin/crm', category: 'CRM', keywords: ['crm','khách hàng','lead','tư vấn'] },
  { id: 'crm-pipeline', label: 'Pipeline', description: 'Kanban tuyển sinh', icon: '🎯', href: '/admin/crm/pipeline', category: 'CRM', keywords: ['pipeline','kanban','tuyển sinh','lead'] },
  { id: 'crm-campaigns', label: 'Campaigns', description: 'Chiến dịch marketing', icon: '📣', href: '/admin/crm/campaigns', category: 'CRM', keywords: ['campaign','marketing','chiến dịch'] },
  // HRM
  { id: 'hrm', label: 'HRM', description: 'Quản lý nhân sự', icon: '👔', href: '/admin/hrm', category: 'HRM', keywords: ['hrm','nhân sự','hr','nhân viên'] },
  { id: 'hrm-staff', label: 'Nhân viên', description: 'Danh sách nhân viên', icon: '👥', href: '/admin/hrm/staff', category: 'HRM', keywords: ['nhân viên','staff','danh sách'] },
  { id: 'hrm-contracts', label: 'Hợp đồng', description: 'Hợp đồng lao động', icon: '📄', href: '/admin/hrm/contracts', category: 'HRM', keywords: ['hợp đồng','contract','lao động'] },
  { id: 'hrm-leave', label: 'Nghỉ phép', description: 'Đơn xin nghỉ phép', icon: '🌴', href: '/admin/hrm/leave', category: 'HRM', keywords: ['nghỉ phép','leave','xin nghỉ'] },
  { id: 'hrm-kpi', label: 'KPI & OKR', description: 'Đánh giá hiệu suất', icon: '📊', href: '/admin/hrm/kpi', category: 'HRM', keywords: ['kpi','okr','đánh giá','hiệu suất'] },
  { id: 'hrm-payroll', label: 'Bảng lương', description: 'Tính và xuất lương', icon: '💰', href: '/admin/hrm/payroll', category: 'HRM', keywords: ['lương','payroll','bảng lương'] },
  // Cộng tác
  { id: 'collab', label: 'Collaboration', description: 'Task, Calendar, Meeting', icon: '🤝', href: '/admin/collab', category: 'Collab', keywords: ['collab','task','meeting','cộng tác'] },
  { id: 'tasks', label: 'Tasks', description: 'Quản lý công việc', icon: '✅', href: '/admin/collab/tasks', category: 'Collab', keywords: ['task','công việc','to do','deadline'] },
  { id: 'calendar', label: 'Calendar', description: 'Lịch học thuật', icon: '📅', href: '/admin/collab/calendar', category: 'Collab', keywords: ['calendar','lịch','sự kiện','ngày'] },
  { id: 'meetings', label: 'Meetings', description: 'Cuộc họp & biên bản AI', icon: '🎥', href: '/admin/collab/meetings', category: 'Collab', keywords: ['meeting','họp','biên bản'] },
  { id: 'workflow', label: 'Workflow', description: 'Quy trình phê duyệt', icon: '🔄', href: '/admin/workflow', category: 'Collab', keywords: ['workflow','phê duyệt','approve','quy trình'] },
  // Analytics
  { id: 'analytics', label: 'Analytics', description: 'Dashboard phân tích', icon: '📊', href: '/admin/analytics', category: 'Analytics', keywords: ['analytics','phân tích','thống kê','dashboard'] },
  { id: 'ai-decision', label: 'AI Decision Center', description: 'Cảnh báo & khuyến nghị AI', icon: '🧠', href: '/admin/ai-decision', category: 'Analytics', keywords: ['ai decision','cảnh báo','alert','khuyến nghị'] },
  { id: 'analytics-owner', label: 'Owner Dashboard', description: 'Tổng quan toàn hệ thống', icon: '👑', href: '/admin/analytics/owner', category: 'Analytics', keywords: ['owner','chủ trường','tổng quan'] },
  { id: 'analytics-report', label: 'Báo cáo in', description: 'Print-ready report', icon: '🖨️', href: '/admin/analytics/report', category: 'Analytics', keywords: ['báo cáo','in','report','pdf','print'] },
  // Hệ thống
  { id: 'roles', label: 'Role Management', description: 'Quản lý roles & permissions', icon: '🛡️', href: '/admin/roles', category: 'System', keywords: ['role','quyền','permission','rbac'] },
  { id: 'organizations', label: 'Organizations', description: 'Quản lý tổ chức', icon: '🏢', href: '/admin/organizations', category: 'System', keywords: ['organization','tổ chức','trường','org'] },
  { id: 'audit', label: 'Audit Log', description: 'Lịch sử thay đổi', icon: '📋', href: '/admin/audit', category: 'System', keywords: ['audit','log','lịch sử'] },
  { id: 'notifications', label: 'Notifications', description: 'Trung tâm thông báo', icon: '🔔', href: '/admin/notifications', category: 'System', keywords: ['notification','thông báo'] },
  { id: 'settings', label: 'Cài đặt', description: 'Cài đặt hệ thống', icon: '⚙️', href: '/admin/settings', category: 'System', keywords: ['settings','cài đặt','config'] },
  { id: 'app-center', label: 'App Center', description: 'Tích hợp & API', icon: '🔌', href: '/admin/app-center', category: 'System', keywords: ['app','api','webhook','tích hợp','integration'] },
  { id: 'content-studio', label: 'Content Studio',      description: 'Soạn bài giảng AI',       icon: '📝', href: '/admin/content-studio',            category: 'AI',    keywords: ['content','studio','bài giảng','soạn','lesson'] },
  { id: 'erp-rewards',    label: 'Điểm thưởng ERP',     description: 'Gamification & tích điểm', icon: '🎮', href: '/admin/erp/rewards',               category: 'ERP',   keywords: ['điểm thưởng','reward','xp','tích điểm','gamification'] },
  // Portals
  { id: 'portal-teacher', label: 'Portal Giáo viên', description: 'Xem như giáo viên', icon: '👨‍🏫', href: '/giao-vien', category: 'Portals', keywords: ['portal','giáo viên','teacher'] },
  { id: 'portal-student', label: 'Portal Học sinh', description: 'Xem như học sinh', icon: '👦', href: '/hoc-vien', category: 'Portals', keywords: ['portal','học sinh','student'] },
  { id: 'portal-parent', label: 'Portal Phụ huynh', description: 'Xem như phụ huynh', icon: '👨‍👩‍👧', href: '/phu-huynh', category: 'Portals', keywords: ['portal','phụ huynh','parent'] },
]

const CATEGORY_ORDER = ['AI','ERP','Finance','CRM','HRM','Collab','Analytics','System','Portals']

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const [sel, setSel]     = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  // Open: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = query.trim()
    ? COMMANDS.filter(c => {
        const q = normalize(query)
        return (
          normalize(c.label).includes(q) ||
          normalize(c.description ?? '').includes(q) ||
          c.keywords.some(k => normalize(k).includes(q))
        )
      }).slice(0, 8)
    : COMMANDS.slice(0, 8)

  const navigate = useCallback((item: CommandItem) => {
    router.push(item.href)
    setOpen(false)
  }, [router])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s+1, filtered.length-1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s-1, 0)) }
      if (e.key === 'Enter' && filtered[sel]) navigate(filtered[sel])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, sel, navigate])

  // Group results
  const grouped = query.trim()
    ? { 'Kết quả': filtered }
    : CATEGORY_ORDER.reduce<Record<string, CommandItem[]>>((acc, cat) => {
        const items = COMMANDS.filter(c => c.category === cat).slice(0, 4)
        if (items.length) acc[cat] = items
        return acc
      }, {})

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm transition-colors border border-gray-200"
        title="Tìm kiếm (Ctrl+K)"
      >
        <span>🔍</span>
        <span className="hidden sm:inline">Tìm chức năng...</span>
        <kbd className="hidden sm:inline text-xs bg-gray-200 text-gray-400 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="fixed top-[15%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl shadow-2xl overflow-hidden"
           style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)' }}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <span className="text-xl">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSel(0) }}
            placeholder="Tìm chức năng, màn hình, module..."
            className="flex-1 text-base bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
          )}
          <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto py-2">
          {query.trim() ? (
            filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Không tìm thấy chức năng nào cho &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="px-2">
                {filtered.map((item, i) => (
                  <button key={item.id} onClick={() => navigate(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${i === sel ? 'bg-violet-50' : 'hover:bg-gray-50'}`}>
                    <span className="text-xl w-8 text-center flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.label}</p>
                      {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
                    </div>
                    <span className="text-xs text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{item.category}</span>
                  </button>
                ))}
              </div>
            )
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-1">
                <p className="px-5 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">{cat}</p>
                {items.map((item, i) => (
                  <button key={item.id} onClick={() => navigate(item)}
                    className="w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-left transition-colors">
                    <span className="text-base w-6 text-center flex-shrink-0">{item.icon}</span>
                    <p className="text-sm text-gray-700 font-medium truncate">{item.label}</p>
                    {item.description && <p className="text-xs text-gray-400 truncate hidden sm:block">{item.description}</p>}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          <span>↑↓ Chọn</span>
          <span>↵ Mở</span>
          <span>Esc Đóng</span>
          <span className="ml-auto">⌘K để mở nhanh</span>
        </div>
      </div>
    </>
  )
}
