'use client'

import { signOut } from 'next-auth/react'

export function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/dang-nhap' })}
      title="Đăng xuất"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: 'rgba(239,68,68,0.08)',
        border: '1.5px solid rgba(239,68,68,0.2)',
        cursor: 'pointer', fontSize: 15, color: '#ef4444',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)'
      }}
    >
      ⏻
    </button>
  )
}
