'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface OrgOption { id: string; name: string; slug: string; type: string }

interface Props {
  currentOrg?: { id: string; name: string; slug: string } | null
  allOrgs?: OrgOption[]
}

const MENU_GROUPS = [
  {
    icon: '🤖', label: 'AI & Nội dung',
    items: [
      { href: '/admin/ai-studio', icon: '✨', label: 'AI Studio' },
      { href: '/admin/ai-studio/course-generator', icon: '🚀', label: 'Course Generator' },
      { href: '/admin/question-bank', icon: '🗃️', label: 'Question Bank' },
      { href: '/admin/publishing', icon: '📤', label: 'Publishing' },
      { href: '/admin/material-import', icon: '📚', label: 'Material Import' },
      { href: '/admin/content-studio', icon: '🎨', label: 'Content Studio' },
    ],
  },
  {
    icon: '🏫', label: 'Học vụ ERP',
    items: [
      { href: '/admin/erp', icon: '🏫', label: 'ERP Hub' },
      { href: '/admin/erp/students', icon: '👥', label: 'Học sinh' },
      { href: '/admin/erp/teachers', icon: '👨‍🏫', label: 'Giáo viên' },
      { href: '/admin/erp/classes', icon: '📋', label: 'Lớp học' },
      { href: '/admin/erp/attendance', icon: '✅', label: 'Điểm danh' },
      { href: '/admin/erp/timetable', icon: '📅', label: 'TKB AI' },
      { href: '/admin/erp/academic-years', icon: '📆', label: 'Năm học' },
      { href: '/admin/erp/bus-routes', icon: '🚌', label: 'Xe tuyến' },
      { href: '/admin/erp/uniforms', icon: '👕', label: 'Đồng phục' },
      { href: '/admin/erp/canteen', icon: '🍽️', label: 'Căng tin' },
      { href: '/admin/erp/library', icon: '📖', label: 'Thư viện' },
      { href: '/admin/erp/health', icon: '🏥', label: 'Sức khỏe' },
      { href: '/admin/erp/awards', icon: '🏆', label: 'Khen thưởng' },
      { href: '/admin/erp/reports', icon: '📊', label: 'Báo cáo ERP' },
    ],
  },
  {
    icon: '💰', label: 'Tài chính',
    items: [
      { href: '/admin/finance', icon: '💰', label: 'Finance Hub' },
      { href: '/admin/finance/invoices', icon: '📋', label: 'Hóa đơn' },
      { href: '/admin/finance/vouchers', icon: '🎟️', label: 'Voucher' },
      { href: '/admin/finance/scholarships', icon: '🏆', label: 'Học bổng' },
      { href: '/admin/finance/installments', icon: '📆', label: 'Trả góp' },
      { href: '/admin/analytics', icon: '📈', label: 'Báo cáo' },
    ],
  },
  {
    icon: '📊', label: 'CRM & HRM',
    items: [
      { href: '/admin/crm', icon: '📊', label: 'CRM Hub' },
      { href: '/admin/crm/pipeline', icon: '📋', label: 'Pipeline' },
      { href: '/admin/crm/campaigns', icon: '📣', label: 'Campaigns' },
      { href: '/admin/hrm', icon: '👔', label: 'HRM Hub' },
      { href: '/admin/hrm/staff', icon: '👥', label: 'Nhân viên' },
      { href: '/admin/hrm/payroll', icon: '💰', label: 'Bảng lương' },
    ],
  },
  {
    icon: '👥', label: 'Portals',
    items: [
      { href: '/giao-vien', icon: '👩‍🏫', label: 'Portal Giáo viên' },
      { href: '/hoc-vien', icon: '🎒', label: 'Portal Học sinh' },
      { href: '/phu-huynh', icon: '👨‍👩‍👧', label: 'Portal Phụ huynh' },
    ],
  },
  {
    icon: '⚙️', label: 'Hệ thống',
    items: [
      { href: '/admin/organizations', icon: '🏢', label: 'Tổ chức' },
      { href: '/admin/roles', icon: '🛡️', label: 'Phân quyền' },
      { href: '/admin/users', icon: '👤', label: 'Người dùng' },
      { href: '/admin/notifications', icon: '🔔', label: 'Thông báo' },
      { href: '/admin/news', icon: '📰', label: 'Tin tức' },
      { href: '/admin/settings', icon: '⚙️', label: 'Cài đặt' },
      { href: '/admin/data-migration', icon: '📦', label: 'Data Migration' },
      { href: '/admin/workflow', icon: '⚡', label: 'Workflow' },
      { href: '/admin/app-center', icon: '🧩', label: 'App Center' },
    ],
  },
]

export function AdminMobileMenu({ currentOrg, allOrgs = [] }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [switching, setSwitching] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => { setOpen(false); setSearch('') }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function switchOrg(orgId: string) {
    if (orgId === currentOrg?.id) { setOpen(false); return }
    setSwitching(orgId)
    try {
      const res = await fetch('/api/auth/switch-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      })
      if (res.ok) { setOpen(false); router.refresh() }
    } finally { setSwitching(null) }
  }

  // Search filter
  const q = search.toLowerCase().trim()
  const filteredGroups = q
    ? MENU_GROUPS.map(g => ({
        ...g,
        items: g.items.filter(i => i.label.toLowerCase().includes(q) || i.href.includes(q)),
      })).filter(g => g.items.length > 0)
    : MENU_GROUPS

  return (
    <>
      {/* ☰ Button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Menu"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: open ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.06)',
          border: open ? '1.5px solid rgba(99,102,241,0.4)' : '1.5px solid transparent',
          cursor: 'pointer', fontSize: 20, transition: 'all 0.18s',
          color: open ? '#4f46e5' : '#374151',
        }}
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: 'rgba(0,0,0,0.5)',
            WebkitBackdropFilter: 'blur(2px)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9991,
          width: 'min(300px, 88vw)',
          background: '#fff',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 900, fontSize: 15, color: '#111827' }}>☰ Menu</span>
            <button onClick={() => setOpen(false)} style={{ fontSize: 18, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>✕</button>
          </div>

          {/* Search inside menu */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Tìm chức năng..."
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 10,
              border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none',
              background: '#f9fafb', boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = '#6366f1' }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
          />
        </div>

        {/* Org switcher (if multiple orgs) */}
        {allOrgs.length > 1 && (
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>🏢 Tổ chức</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {allOrgs.map(org => (
                <button
                  key={org.id}
                  onClick={() => switchOrg(org.id)}
                  disabled={!!switching}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 10, border: 'none',
                    background: org.id === currentOrg?.id ? '#eef2ff' : '#f9fafb',
                    cursor: switching ? 'wait' : 'pointer', textAlign: 'left',
                    fontSize: 13, fontWeight: org.id === currentOrg?.id ? 700 : 500,
                    color: org.id === currentOrg?.id ? '#4f46e5' : '#374151',
                  }}
                >
                  <span>{switching === org.id ? '⏳' : org.id === currentOrg?.id ? '✅' : '🏢'}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0 24px' }}>
          <Link
            href="/admin"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', textDecoration: 'none', background: pathname === '/admin' ? '#eef2ff' : 'transparent', borderBottom: '1px solid #f8fafc' }}
          >
            <span style={{ fontSize: 18 }}>🏠</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Dashboard</span>
          </Link>

          {filteredGroups.map(group => (
            <div key={group.label}>
              <div style={{ padding: '8px 20px 3px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {group.icon} {group.label}
              </div>
              {group.items.map(item => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 20px 9px 26px', textDecoration: 'none',
                      background: active ? '#eef2ff' : 'transparent',
                      borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#4f46e5' : '#374151' }}>
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
}
