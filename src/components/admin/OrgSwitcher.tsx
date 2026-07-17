'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgOption {
  id: string
  name: string
  slug: string
  type: string
}

interface Props {
  currentOrg: { id: string; name: string; slug: string } | null
  allOrgs: OrgOption[]
}

// ─── Icon map by org type ─────────────────────────────────────────────────────

function orgIcon(type: string): string {
  switch (type) {
    case 'SCHOOL': return '🏫'
    case 'CENTER': return '🎓'
    case 'CHAIN':  return '🏢'
    default:       return '🏛️'
  }
}

// ─── OrgSwitcher ─────────────────────────────────────────────────────────────

export function OrgSwitcher({ currentOrg, allOrgs }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function switchOrg(orgId: string) {
    if (orgId === currentOrg?.id) {
      setOpen(false)
      return
    }
    setLoading(orgId)
    try {
      const res = await fetch('/api/auth/switch-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      })
      if (res.ok) {
        setOpen(false)
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  const label = currentOrg?.name ?? 'Chọn tổ chức'

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 10px',
          borderRadius: 10,
          border: '1.5px solid #e5e7eb',
          background: '#fff',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 13,
          color: '#374151',
          maxWidth: 200,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          flexShrink: 0,
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ fontSize: 16 }}>🏢</span>
        {/* Hide name on mobile — only show icon */}
        <span
          className="admin-topbar-label"
          style={{
            flex: 1,
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 140,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown — fixed so it never overflows viewport */}
      {open && (
        <div
          role="listbox"
          style={{
            position: 'fixed',
            top: 60,
            right: 8,
            minWidth: Math.min(240, (typeof window !== 'undefined' ? window.innerWidth : 400) - 16),
            maxWidth: 'calc(100vw - 16px)',
            background: '#fff',
            borderRadius: 12,
            border: '1.5px solid #e5e7eb',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 9998,
            overflow: 'hidden',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
          }}
        >
          {/* Org list */}
          {allOrgs.map(org => {
            const isActive = org.id === currentOrg?.id
            const isLoading = loading === org.id
            return (
              <button
                key={org.id}
                role="option"
                aria-selected={isActive}
                onClick={() => switchOrg(org.id)}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: isActive ? '#FFF7F9' : '#fff',
                  cursor: isLoading ? 'wait' : 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#951F3D' : '#374151',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#fff'
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>
                  {isLoading ? '⏳' : isActive ? '✅' : orgIcon(org.type)}
                </span>
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {org.name}
                </span>
              </button>
            )
          })}

          {/* Divider */}
          <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />

          {/* Register new org */}
          <a
            href="/dang-ky-to-chuc"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#6b7280',
              textDecoration: 'none',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#f9fafb')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '')}
          >
            <span>➕</span>
            Đăng ký tổ chức mới
          </a>

          {/* Platform admin link (shown to all; backend enforces access) */}
          <a
            href="/admin/organizations"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#6b7280',
              textDecoration: 'none',
              transition: 'background 0.1s',
              borderTop: '1px solid #f3f4f6',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#f9fafb')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '')}
          >
            <span>🏛️</span>
            AvaB Platform Admin
          </a>
        </div>
      )}
    </div>
  )
}
