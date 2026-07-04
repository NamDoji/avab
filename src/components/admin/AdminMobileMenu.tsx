'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'

interface OrgOption { id: string; name: string; slug: string; type: string }
interface Props {
  currentOrg?: { id: string; name: string; slug: string } | null
  allOrgs?: OrgOption[]
}

const NAV = [
  // ── 1. Khoá học (đầu tiên — sản phẩm cốt lõi) ───────────────────────────
  { group: '📚 Khoá học', items: [
    { href: '/admin/courses',                    icon: '📚', label: 'Khoá học' },
    { href: '/admin/enrollments',                icon: '📝', label: 'Đăng ký học' },
    { href: '/admin/finance/invoices',           icon: '💰', label: 'Thu học phí' },
    { href: '/admin/ai-studio/course-generator', icon: '🚀', label: 'Tạo khoá AI' },
  ]},
  // ── 2. Thành viên (học sinh + GV + tài khoản — cùng nhóm người) ──────────
  { group: '👥 Thành viên', items: [
    { href: '/admin/erp/students', icon: '👦', label: 'Học sinh' },
    { href: '/admin/erp/teachers', icon: '👨‍🏫', label: 'Giáo viên' },
    { href: '/admin/users',        icon: '👤', label: 'Tài khoản' },
    { href: '/admin/erp/classes',  icon: '📋', label: 'Lớp học' },
    { href: '/admin/erp/transfers',icon: '🔄', label: 'Chuyển lớp' },
    { href: '/admin/erp/alumni',   icon: '🎓', label: 'Alumni' },
  ]},
  // ── 3. Học vụ ERP ─────────────────────────────────────────────────────────
  { group: '🏫 Học vụ ERP', items: [
    { href: '/admin/erp',                    icon: '🏫', label: 'ERP Hub' },
    { href: '/admin/erp/attendance',         icon: '✅', label: 'Điểm danh' },
    { href: '/admin/erp/timetable',          icon: '📅', label: 'TKB AI' },
    { href: '/admin/erp/timetable/workload', icon: '⚖️', label: 'Tải công GV' },
    { href: '/admin/erp/classrooms',         icon: '🚪', label: 'Phòng học' },
    { href: '/admin/erp/health',             icon: '🏥', label: 'Sức khỏe' },
    { href: '/admin/erp/equipment',          icon: '💻', label: 'Thiết bị' },
    { href: '/admin/erp/rewards',            icon: '🎮', label: 'Điểm thưởng' },
    { href: '/admin/erp/awards',             icon: '🏆', label: 'Khen thưởng' },
    { href: '/admin/erp/reports',            icon: '📊', label: 'Báo cáo ERP' },
    { href: '/admin/erp/bus-routes',         icon: '🚌', label: 'Xe tuyến' },
    { href: '/admin/erp/uniforms',           icon: '👕', label: 'Đồng phục' },
    { href: '/admin/erp/canteen',            icon: '🍽️', label: 'Căng tin' },
    { href: '/admin/erp/library',            icon: '📖', label: 'Thư viện' },
    { href: '/admin/erp/academic-years',     icon: '📆', label: 'Năm học' },
  ]},
  // ── 4. Tài chính ──────────────────────────────────────────────────────────
  { group: '💰 Tài chính', items: [
    { href: '/admin/finance',                 icon: '💰', label: 'Finance Hub' },
    { href: '/admin/finance/invoices',        icon: '📋', label: 'Hóa đơn' },
    { href: '/admin/finance/vouchers',        icon: '🎟️', label: 'Voucher' },
    { href: '/admin/finance/scholarships',    icon: '🏆', label: 'Học bổng' },
    { href: '/admin/finance/installments',    icon: '📆', label: 'Trả góp' },
    { href: '/admin/finance/cashflow',        icon: '📊', label: 'Cashflow' },
    { href: '/admin/finance/payment-gateway', icon: '💳', label: 'Cổng TT' },
    { href: '/admin/finance/forecast',        icon: '📉', label: 'Dự báo DT' },
    { href: '/admin/finance/reports',         icon: '📰', label: 'Báo cáo TC' },
    { href: '/admin/analytics',               icon: '📈', label: 'Phân tích' },
  ]},
  // ── 5. CRM ────────────────────────────────────────────────────────────────
  { group: '📊 CRM', items: [
    { href: '/admin/crm',           icon: '📊', label: 'CRM Hub' },
    { href: '/admin/crm/pipeline',  icon: '📋', label: 'Pipeline' },
    { href: '/admin/crm/campaigns', icon: '📣', label: 'Campaigns' },
    { href: '/admin/contacts',      icon: '📞', label: 'Contacts' },
  ]},
  // ── 6. HRM ────────────────────────────────────────────────────────────────
  { group: '👔 HRM', items: [
    { href: '/admin/hrm',            icon: '👔', label: 'HRM Hub' },
    { href: '/admin/hrm/staff',      icon: '👥', label: 'Nhân viên' },
    { href: '/admin/hrm/contracts',  icon: '📄', label: 'Hợp đồng' },
    { href: '/admin/hrm/attendance', icon: '⏰', label: 'Chấm công' },
    { href: '/admin/hrm/leave',      icon: '🌴', label: 'Nghỉ phép' },
    { href: '/admin/hrm/kpi',        icon: '📊', label: 'KPI' },
    { href: '/admin/hrm/payroll',    icon: '💰', label: 'Bảng lương' },
  ]},
  // ── 7. AI & Nội dung ──────────────────────────────────────────────────────
  { group: '🤖 AI & Nội dung', items: [
    { href: '/admin/ai-studio',           icon: '✨', label: 'AI Studio' },
    { href: '/admin/ai-decision',         icon: '🧠', label: 'AI Decision' },
    { href: '/admin/question-bank',       icon: '🗃️', label: 'Question Bank' },
    { href: '/admin/material-import',     icon: '📥', label: 'Material Import' },
    { href: '/admin/publishing',          icon: '📤', label: 'Publishing' },
    { href: '/admin/education-standards', icon: '📖', label: 'AvaB Standards' },
    { href: '/admin/gamification',        icon: '🎮', label: 'Gamification' },
  ]},
  // ── 8. Cộng tác ───────────────────────────────────────────────────────────
  { group: '🤝 Cộng tác', items: [
    { href: '/admin/collab/tasks',    icon: '✅', label: 'Tasks' },
    { href: '/admin/collab/calendar', icon: '📅', label: 'Calendar' },
    { href: '/admin/collab/meetings', icon: '🎥', label: 'Meetings' },
    { href: '/admin/workflow',        icon: '⚡', label: 'Workflow' },
  ]},
  // ── 9. Portals ────────────────────────────────────────────────────────────
  { group: '👥 Portals', items: [
    { href: '/giao-vien', icon: '👩‍🏫', label: 'Portal Giáo viên' },
    { href: '/hoc-vien',  icon: '🎒',   label: 'Portal Học sinh' },
    { href: '/phu-huynh', icon: '👨‍👩‍👧', label: 'Portal Phụ huynh' },
  ]},
  // ── 10. Hệ thống (IT/config — cuối cùng) ─────────────────────────────────
  { group: '⚙️ Hệ thống', items: [
    { href: '/admin/roles',          icon: '🛡️', label: 'Phân quyền' },
    { href: '/admin/permissions',    icon: '🔑', label: 'Permissions' },
    { href: '/admin/audit',          icon: '📋', label: 'Audit Log' },
    { href: '/admin/organizations',  icon: '🏢', label: 'Tổ chức' },
    { href: '/admin/news',           icon: '📰', label: 'Tin tức' },
    { href: '/admin/notifications',  icon: '🔔', label: 'Thông báo' },
    { href: '/admin/settings',       icon: '⚙️', label: 'Cài đặt' },
    { href: '/admin/app-center',     icon: '🧩', label: 'App Center' },
    { href: '/admin/data-migration', icon: '📦', label: 'Data Migration' },
  ]},
]

export function AdminMobileMenu({ currentOrg, allOrgs = [] }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setOpen(false); setQuery('') }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  async function switchOrg(orgId: string) {
    if (orgId === currentOrg?.id) { setOpen(false); return }
    setSwitching(orgId)
    try {
      const res = await fetch('/api/auth/switch-org', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      })
      if (res.ok) { setOpen(false); router.refresh() }
    } finally { setSwitching(null) }
  }

  const q = query.toLowerCase()
  const filtered = q
    ? NAV.map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) })).filter(g => g.items.length > 0)
    : NAV

  const drawer = (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(300px, 85vw)',
        background: '#fff',
        zIndex: 10001,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 16px 10px', flexShrink: 0,
          borderBottom: '1px solid #f3f4f6',
        }}>
          <span style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#111827' }}>Menu</span>
          <button
            onClick={() => setOpen(false)}
            style={{ fontSize: 18, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 4 }}
          >✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 12px 8px', flexShrink: 0, borderBottom: '1px solid #f3f4f6' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="🔍 Tìm chức năng..."
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 10,
              border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
              background: '#f9fafb', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Org switcher */}
        {allOrgs.length > 1 && (
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              🏢 Tổ chức
            </p>
            {allOrgs.map(org => (
              <button key={org.id} onClick={() => switchOrg(org.id)} disabled={!!switching}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '7px 8px', borderRadius: 8, border: 'none',
                  background: org.id === currentOrg?.id ? '#ede9fe' : 'transparent',
                  cursor: switching ? 'wait' : 'pointer', marginBottom: 2,
                  fontSize: 13, fontWeight: org.id === currentOrg?.id ? 700 : 400,
                  color: org.id === currentOrg?.id ? '#6d28d9' : '#374151',
                  textAlign: 'left',
                }}
              >
                <span>{switching === org.id ? '⏳' : org.id === currentOrg?.id ? '✅' : '🏢'}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Nav links */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Link href="/admin" onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 16px', textDecoration: 'none',
              background: pathname === '/admin' ? '#ede9fe' : 'transparent',
              borderBottom: '1px solid #f9fafb',
            }}>
            <span style={{ fontSize: 18 }}>🏠</span>
            <span style={{ fontSize: 14, fontWeight: pathname === '/admin' ? 700 : 500, color: pathname === '/admin' ? '#6d28d9' : '#374151' }}>Dashboard</span>
          </Link>

          {filtered.map(g => (
            <div key={g.group}>
              <div style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {g.group}
              </div>
              {g.items.map(item => {
                const active = pathname === item.href || (item.href.startsWith('/admin') && pathname.startsWith(item.href + '/'))
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 16px 9px 22px', textDecoration: 'none',
                      background: active ? '#ede9fe' : 'transparent',
                      borderLeft: `3px solid ${active ? '#7c3aed' : 'transparent'}`,
                    }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#6d28d9' : '#374151' }}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Menu"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(0,0,0,0.06)', border: 'none',
          cursor: 'pointer', fontSize: 18, color: '#374151',
        }}
      >☰</button>

      {mounted && open && createPortal(drawer, document.body)}
    </>
  )
}
