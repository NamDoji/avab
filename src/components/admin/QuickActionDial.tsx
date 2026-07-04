'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

interface QuickAction {
  icon: string
  label: string
  href: string
  color: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: '➕',
    label: 'Học sinh mới',
    href: '/admin/erp/students/new',
    color: '#0ea5e9',
  },
  {
    icon: '👨‍🏫',
    label: 'Giáo viên mới',
    href: '/admin/erp/teachers/new',
    color: '#8b5cf6',
  },
  {
    icon: '📋',
    label: 'Đăng ký mới',
    href: '/admin/enrollments',
    color: '#10b981',
  },
  {
    icon: '💰',
    label: 'Thu học phí',
    href: '/admin/finance/invoices',
    color: '#f59e0b',
  },
  {
    icon: '🚌',
    label: 'Xe tuyến',
    href: '/admin/erp/bus-routes',
    color: '#f97316',
  },
  {
    icon: '👕',
    label: 'Đồng phục',
    href: '/admin/erp/uniforms',
    color: '#8b5cf6',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function QuickActionDial() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const handleAction = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 96, // above the AI Chat button (~80px)
        right: 20,
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
      }}
    >
      {/* Expanded action buttons */}
      {open && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8,
            animation: 'quickdial-in 0.18s ease-out',
          }}
        >
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={action.href}
              onClick={() => handleAction(action.href)}
              title={action.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                padding: '8px 14px 8px 12px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: 13,
                fontWeight: 700,
                color: '#1f2937',
                transition: 'transform 0.1s, box-shadow 0.1s',
                animationDelay: `${i * 30}ms`,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: `${action.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Quick actions"
        aria-label={open ? 'Đóng quick actions' : 'Mở quick actions'}
        aria-expanded={open}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          color: 'white',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = open ? 'rotate(45deg) scale(1.08)' : 'scale(1.08)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        ⚡
      </button>

      {/* CSS animation keyframes */}
      <style>{`
        @keyframes quickdial-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
