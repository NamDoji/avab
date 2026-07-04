'use client'

import Link from 'next/link'

interface AdminOrgBadgeProps {
  orgName: string
  orgSlug: string
  campusCount: number
}

/**
 * AdminOrgBadge — shows current organization context in admin UI.
 * Clicking it navigates to the org list/settings.
 */
export default function AdminOrgBadge({ orgName, orgSlug, campusCount }: AdminOrgBadgeProps) {
  return (
    <Link
      href="/admin/organizations"
      title={`${orgSlug}.avab.vn`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 20,
        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        textDecoration: 'none',
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <span>🏢</span>
      <span>{orgName}</span>
      {campusCount > 0 && (
        <span style={{
          background: 'rgba(255,255,255,0.25)',
          borderRadius: 10,
          padding: '1px 7px',
          fontSize: 11,
          fontWeight: 800,
        }}>
          {campusCount} CS
        </span>
      )}
    </Link>
  )
}
