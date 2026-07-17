'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function AdminUserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const user = session?.user as { name?: string; email?: string; role?: string } | undefined
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : '?'
  const role = user?.role ?? ''

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(v => !v)}
        title={user?.name ?? 'Tài khoản'}
        style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: open ? '#FDECF0' : 'rgba(124,58,237,0.1)',
          border: `1.5px solid ${open ? '#951F3D' : 'rgba(124,58,237,0.25)'}`,
          cursor: 'pointer', fontSize: 12, fontWeight: 800,
          color: '#951F3D', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 40, right: 0,
          background: '#fff', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #f3f4f6',
          minWidth: 220, zIndex: 10100,
          overflow: 'hidden',
        }}>
          {/* User info */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #951F3D, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 8,
            }}>
              {initials}
            </div>
            <p style={{ fontWeight: 800, fontSize: 13, color: '#111827', margin: 0, lineHeight: 1.3 }}>
              {user?.name || 'Admin'}
            </p>
            {user?.email && (
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0', lineHeight: 1 }}>
                {user.email}
              </p>
            )}
            {role && (
              <span style={{
                display: 'inline-block', marginTop: 4,
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                background: role === 'SUPER_ADMIN' ? '#fef3c7' : '#FDECF0',
                color: role === 'SUPER_ADMIN' ? '#b45309' : '#951F3D',
                padding: '2px 7px', borderRadius: 99,
              }}>
                {role}
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: '6px 0' }}>
            <Link
              href="/doi-mat-khau"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', textDecoration: 'none',
                color: '#374151', fontSize: 13, fontWeight: 500,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 16 }}>🔑</span>
              Đổi mật khẩu
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', textDecoration: 'none',
                color: '#374151', fontSize: 13, fontWeight: 500,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 16 }}>⚙️</span>
              Cài đặt
            </Link>
          </div>

          {/* Divider + logout */}
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '6px 0' }}>
            <button
              onClick={() => signOut({ callbackUrl: '/dang-nhap' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', width: '100%', border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: '#ef4444', fontSize: 13, fontWeight: 600,
                transition: 'background 0.1s', textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 16 }}>⏻</span>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
