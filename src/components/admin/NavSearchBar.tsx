'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchItem {
  id: string
  label: string
  description?: string
  icon: string
  href: string
  keywords: string[]
}

const ITEMS: SearchItem[] = [
  { id: 'dashboard',      label: 'Dashboard',           description: 'Trang chủ quản trị',    icon: '🏠', href: '/admin',                          keywords: ['dashboard','trang chủ','home'] },
  { id: 'ai-studio',      label: 'AI Studio',           description: 'Quản lý AI projects',   icon: '✨', href: '/admin/ai-studio',                 keywords: ['ai studio','ai'] },
  { id: 'course-gen',     label: 'Course Generator',    description: 'Tạo khóa học bằng AI',  icon: '🚀', href: '/admin/ai-studio/course-generator', keywords: ['course','generator','tạo khóa học'] },
  { id: 'courses',        label: 'Khóa học',            description: 'Quản lý khóa học',      icon: '📚', href: '/admin/courses',                   keywords: ['khóa học','course'] },
  { id: 'students',       label: 'Học sinh',            description: 'Danh sách học sinh',    icon: '👥', href: '/admin/erp/students',              keywords: ['học sinh','student'] },
  { id: 'teachers',       label: 'Giáo viên',           description: 'Danh sách giáo viên',   icon: '👨‍🏫', href: '/admin/erp/teachers',             keywords: ['giáo viên','teacher'] },
  { id: 'classes',        label: 'Lớp học',             description: 'Quản lý lớp học',       icon: '📋', href: '/admin/erp/classes',               keywords: ['lớp','class'] },
  { id: 'attendance',     label: 'Điểm danh',           description: 'Điểm danh học sinh',    icon: '✅', href: '/admin/erp/attendance',            keywords: ['điểm danh','attendance'] },
  { id: 'timetable',      label: 'Thời khóa biểu',     description: 'AI xếp TKB',            icon: '📅', href: '/admin/erp/timetable',             keywords: ['thời khóa biểu','tkb','lịch'] },
  { id: 'finance',        label: 'Tài chính',           description: 'Dashboard tài chính',   icon: '💰', href: '/admin/finance',                   keywords: ['tài chính','finance','doanh thu'] },
  { id: 'invoices',       label: 'Học phí',             description: 'Quản lý học phí',       icon: '📋', href: '/admin/finance/invoices',          keywords: ['học phí','invoice','thu tiền'] },
  { id: 'crm',            label: 'CRM',                 description: 'Quản lý khách hàng',    icon: '📊', href: '/admin/crm',                       keywords: ['crm','khách hàng','lead'] },
  { id: 'hrm',            label: 'Nhân sự',             description: 'Quản lý nhân sự',       icon: '👔', href: '/admin/hrm',                       keywords: ['nhân sự','hr'] },
  { id: 'analytics',      label: 'Phân tích',           description: 'Báo cáo & thống kê',    icon: '📈', href: '/admin/analytics',                 keywords: ['analytics','phân tích','báo cáo'] },
  { id: 'question-bank',  label: 'Ngân hàng câu hỏi',  description: 'Quản lý câu hỏi',       icon: '🗃️', href: '/admin/question-bank',            keywords: ['câu hỏi','question bank'] },
  { id: 'material',       label: 'Import học liệu',     description: 'Import Word/PDF',        icon: '📤', href: '/admin/material-import',           keywords: ['import','học liệu'] },
  { id: 'roles',          label: 'Phân quyền',          description: 'Roles & permissions',   icon: '🔐', href: '/admin/roles',                     keywords: ['role','phân quyền','quyền'] },
  { id: 'users',          label: 'Người dùng',          description: 'Quản lý tài khoản',     icon: '👤', href: '/admin/users',                     keywords: ['user','người dùng','tài khoản'] },
  { id: 'organizations',  label: 'Tổ chức',             description: 'Quản lý tổ chức',       icon: '🏢', href: '/admin/organizations',             keywords: ['organization','tổ chức','trường'] },
  { id: 'bus-routes',     label: 'Xe tuyến',          description: 'Xe đưa đón học sinh',     icon: '🚌', href: '/admin/erp/bus-routes',          keywords: ['xe tuyến','xe buýt','đưa đón','bus'] },
  { id: 'uniforms',       label: 'Đồng phục',          description: 'Quản lý đồng phục HS',     icon: '👕', href: '/admin/erp/uniforms',            keywords: ['đồng phục','quần áo','uniform','áo'] },
  { id: 'rewards',        label: 'Điểm thưởng',        description: 'Gamification & điểm',      icon: '🎮', href: '/admin/erp/rewards',             keywords: ['điểm thưởng','gamification','badge'] },
  { id: 'awards',         label: 'Khen thưởng',        description: 'Giải thưởng học sinh',     icon: '🏆', href: '/admin/erp/awards',              keywords: ['khen thưởng','giải thưởng','award'] },
  { id: 'classrooms',     label: 'Phòng học',          description: 'Quản lý phòng học',        icon: '🚪', href: '/admin/erp/classrooms',          keywords: ['phòng học','classroom','phòng'] },
  { id: 'erp-reports',    label: 'Báo cáo ERP',        description: 'Báo cáo học vụ',          icon: '📊', href: '/admin/erp/reports',             keywords: ['báo cáo erp','học vụ','report'] },
  { id: 'workload',       label: 'Tải công GV',        description: 'Phân công giảng dạy',      icon: '⚖️', href: '/admin/erp/timetable/workload',  keywords: ['tải công','workload','phân công','giáo viên'] },
  { id: 'payment-gw',     label: 'Cổng thanh toán',    description: 'VNPay, MoMo, Banking',    icon: '💳', href: '/admin/finance/payment-gateway', keywords: ['cổng thanh toán','vnpay','momo','payment gateway'] },
  { id: 'news',           label: 'Tin tức',            description: 'Bài viết & thông báo',     icon: '📰', href: '/admin/news',                    keywords: ['tin tức','bài viết','news','blog'] },
  { id: 'contacts',       label: 'Contacts',           description: 'Danh bạ liên hệ',          icon: '📞', href: '/admin/contacts',                keywords: ['contacts','liên hệ','danh bạ'] },
  { id: 'platform',       label: 'Platform Admin',     description: 'Quản trị nền tảng',        icon: '🔧', href: '/admin/platform',                keywords: ['platform','nền tảng','super admin'] },
  { id: 'data-migration', label: 'Data Migration',     description: 'Import/Export dữ liệu',    icon: '📦', href: '/admin/data-migration',          keywords: ['data migration','import','export','dữ liệu'] },
  { id: 'roles-matrix',   label: 'Ma trận quyền',      description: 'Permission matrix',        icon: '🗂️', href: '/admin/roles/matrix',            keywords: ['ma trận quyền','permission matrix','phân quyền'] },
  { id: 'workflow',       label: 'Workflow',            description: 'Quy trình tự động',        icon: '⚡', href: '/admin/workflow',                keywords: ['workflow','quy trình','automation','tự động'] },
  { id: 'academic-years', label: 'Năm học', description: 'Quản lý năm học', icon: '📅', href: '/admin/erp/academic-years', keywords: ['năm học','academic year','học kỳ'] },
  { id: 'phu-huynh-portal', label: 'Portal Phụ huynh', description: 'Trang phụ huynh xem học phí & tiến độ con', icon: '👨‍👩‍👧', href: '/phu-huynh', keywords: ['phụ huynh','parent','phu huynh','cha mẹ'] },
  { id: 'hoc-vien-portal',  label: 'Portal Học viên',  description: 'Trang học sinh xem bài học & tiến độ',       icon: '🎒',      href: '/hoc-vien',   keywords: ['học viên','học sinh','student','hoc vien'] },
  { id: 'giao-vien-portal', label: 'Portal Giáo viên', description: 'Trang giáo viên quản lý lớp & nhận xét',    icon: '👩‍🏫',     href: '/giao-vien',  keywords: ['giáo viên','teacher','giao vien'] },
  { id: 'notifications', label: 'Thông báo', description: 'Notification center', icon: '🔔', href: '/admin/notifications', keywords: ['thông báo','notification','notify','chuông'] },
  { id: 'settings',       label: 'Cài đặt',             description: 'Cấu hình hệ thống',     icon: '⚙️', href: '/admin/settings',                 keywords: ['setting','cài đặt','cấu hình'] },
  { id: 'gamification',   label: 'Gamification',        description: 'Điểm & bảng xếp hạng', icon: '🎮', href: '/admin/gamification',              keywords: ['game','điểm','leaderboard'] },
  { id: 'erp',            label: 'School ERP',          description: 'Quản lý nhà trường',    icon: '🏫', href: '/admin/erp',                       keywords: ['erp','trường'] },
  { id: 'bus-routes',     label: 'Xe tuyến',            description: 'Quản lý xe đưa đón',    icon: '🚌', href: '/admin/erp/bus-routes',            keywords: ['xe tuyến','xe buýt','đưa đón','bus'] },
  { id: 'uniforms',       label: 'Đồng phục',           description: 'Quản lý đồng phục HS',  icon: '👕', href: '/admin/erp/uniforms',              keywords: ['đồng phục','quần áo','uniform','áo'] },
  { id: 'canteen',        label: 'Căng tin',             description: 'Suất ăn & thực đơn',     icon: '🍽️', href: '/admin/erp/canteen',              keywords: ['căng tin','suất ăn','thực đơn','ăn trưa','bữa ăn','canteen'] },
  { id: 'library',        label: 'Thư viện',             description: 'Sách & mượn trả',          icon: '📖', href: '/admin/erp/library',              keywords: ['thư viện','sách','mượn sách','library','book'] },
  { id: 'content-studio',  label: 'Content Studio',       description: 'Soạn bài giảng AI',          icon: '📝', href: '/admin/content-studio',           keywords: ['content studio','bài giảng','soạn','lesson','content'] },
  { id: 'analytics-owner', label: 'Owner Dashboard',      description: 'Tổng quan toàn hệ thống',     icon: '👑', href: '/admin/analytics/owner',          keywords: ['owner','chủ trường','tổng quan','dashboard'] },
  { id: 'analytics-report',label: 'Báo cáo in',           description: 'Print-ready PDF report',      icon: '🖨️', href: '/admin/analytics/report',         keywords: ['báo cáo','in','report','pdf','print'] },
  { id: 'collab-hub',      label: 'Collab Hub',           description: 'Trung tâm cộng tác nhóm',    icon: '🤝', href: '/admin/collab',                   keywords: ['collab','cộng tác','collaboration','hub'] },
  { id: 'erp-rewards',     label: 'Điểm thưởng ERP',      description: 'Gamification & tích điểm',    icon: '🎮', href: '/admin/erp/rewards',              keywords: ['điểm thưởng','gamification','tích điểm','xp','reward'] },
  { id: 'webhooks',        label: 'Webhooks',             description: 'Webhook & integration',       icon: '🔗', href: '/admin/webhooks',                 keywords: ['webhook','tích hợp','integration','api hook'] },
]

const QUICK_CHIPS = ['Học sinh', 'Tài chính', 'Điểm danh', 'Thời khóa biểu', 'Phân quyền']

export function NavSearchBar() {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const [panelRect, setPanelRect] = useState<{ top: number; right: number } | null>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  const results = query.trim()
    ? ITEMS.filter(it =>
        it.label.toLowerCase().includes(query.toLowerCase()) ||
        (it.description ?? '').toLowerCase().includes(query.toLowerCase()) ||
        it.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : []

  const openBar = useCallback(() => {
    setOpen(true)
    // Capture button position so panel can be positioned via fixed
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPanelRect({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const closeBar = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  const navigate = useCallback((href: string) => {
    closeBar()
    router.push(href)
  }, [closeBar, router])

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeBar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeBar])

  // Outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const panel = document.getElementById('nav-search-panel')
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        panel && !panel.contains(e.target as Node)
      ) closeBar()
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, closeBar])

  // Recalc on resize
  useEffect(() => {
    if (!open) return
    const onResize = () => {
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect()
        setPanelRect({ top: r.bottom + 8, right: window.innerWidth - r.right })
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open])

  // Panel width: capped at 360 but never wider than viewport - 16px
  const panelWidth = typeof window !== 'undefined'
    ? Math.min(360, window.innerWidth - 16)
    : 360

  return (
    <>
      {/* Toggle button */}
      <button
        ref={btnRef}
        onClick={open ? closeBar : openBar}
        aria-label="Tìm chức năng"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '6px 10px',
          background: open ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.9)',
          border: open ? '1.5px solid rgba(99,102,241,0.4)' : '1.5px solid rgba(0,0,0,0.1)',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          color: open ? '#4f46e5' : '#374151',
          cursor: 'pointer',
          transition: 'all 0.18s',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 15 }}>🔍</span>
        {/* Hide text label on very small screens via inline media — handled by CSS class below */}
        <span className="nav-search-label">{open ? '✕' : 'Tìm kiếm'}</span>
      </button>

      {/* Fixed-position dropdown — never clips outside viewport */}
      {open && panelRect && (
        <div
          id="nav-search-panel"
          role="dialog"
          aria-label="Tìm kiếm chức năng"
          style={{
            position: 'fixed',
            top: panelRect.top,
            // Anchor right edge to button's right edge; clamp so left edge ≥ 8px
            right: Math.max(panelRect.right, 8),
            width: panelWidth,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            border: '1px solid rgba(0,0,0,0.08)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Input */}
          <div style={{ padding: '12px 12px 0' }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm chức năng… (vd: học sinh, tài chính)"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f9fafb',
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
            />
          </div>

          {/* Results */}
          {results.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: '6px 8px 10px', maxHeight: 340, overflowY: 'auto' }}>
              {results.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.href)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 10px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                    <span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.label}</div>
                      {item.description && (
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{item.description}</div>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div style={{ padding: '16px 20px 18px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Không tìm thấy &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div style={{ padding: '12px 14px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gợi ý nhanh</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_CHIPS.map(t => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      fontSize: 13,
                      cursor: 'pointer',
                      color: '#374151',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLButtonElement).style.color = '#4f46e5' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scoped responsive style */}
      <style>{`
        @media (max-width: 480px) {
          .nav-search-label { display: none; }
        }
      `}</style>
    </>
  )
}
