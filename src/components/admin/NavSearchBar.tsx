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
  { id: 'dashboard', label: 'Dashboard', description: 'Trang chủ quản trị', icon: '🏠', href: '/admin', keywords: ['dashboard','trang chủ','home'] },
  { id: 'ai-studio', label: 'AI Studio', icon: '✨', href: '/admin/ai-studio', keywords: ['ai studio','ai'] },
  { id: 'course-generator', label: 'Course Generator', description: 'Tạo khóa học bằng AI', icon: '🚀', href: '/admin/ai-studio/course-generator', keywords: ['course','generator','tạo khóa học'] },
  { id: 'courses', label: 'Khóa học', description: 'Quản lý khóa học', icon: '📚', href: '/admin/courses', keywords: ['khóa học','course'] },
  { id: 'students', label: 'Học sinh', description: 'Danh sách học sinh', icon: '👥', href: '/admin/erp/students', keywords: ['học sinh','student'] },
  { id: 'teachers', label: 'Giáo viên', description: 'Danh sách giáo viên', icon: '👨‍🏫', href: '/admin/erp/teachers', keywords: ['giáo viên','teacher'] },
  { id: 'classes', label: 'Lớp học', icon: '📋', href: '/admin/erp/classes', keywords: ['lớp','class'] },
  { id: 'attendance', label: 'Điểm danh', icon: '✅', href: '/admin/erp/attendance', keywords: ['điểm danh','attendance'] },
  { id: 'timetable', label: 'Thời khóa biểu', icon: '📅', href: '/admin/erp/timetable', keywords: ['thời khóa biểu','tkb','lịch'] },
  { id: 'finance', label: 'Tài chính', icon: '💰', href: '/admin/finance', keywords: ['tài chính','finance','doanh thu'] },
  { id: 'invoices', label: 'Học phí', icon: '📋', href: '/admin/finance/invoices', keywords: ['học phí','invoice','thu tiền'] },
  { id: 'crm', label: 'CRM', icon: '📊', href: '/admin/crm', keywords: ['crm','khách hàng','lead'] },
  { id: 'hrm', label: 'Nhân sự', icon: '👔', href: '/admin/hrm', keywords: ['nhân sự','hr'] },
  { id: 'analytics', label: 'Phân tích', icon: '📈', href: '/admin/analytics', keywords: ['analytics','phân tích','báo cáo'] },
  { id: 'question-bank', label: 'Ngân hàng câu hỏi', icon: '🗃️', href: '/admin/question-bank', keywords: ['câu hỏi','question bank'] },
  { id: 'material-import', label: 'Import học liệu', icon: '📤', href: '/admin/material-import', keywords: ['import','học liệu'] },
  { id: 'roles', label: 'Phân quyền', icon: '🔐', href: '/admin/roles', keywords: ['role','phân quyền','quyền'] },
  { id: 'users', label: 'Người dùng', icon: '👤', href: '/admin/users', keywords: ['user','người dùng','tài khoản'] },
  { id: 'organizations', label: 'Tổ chức', icon: '🏢', href: '/admin/organizations', keywords: ['organization','tổ chức','trường'] },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️', href: '/admin/settings', keywords: ['setting','cài đặt','cấu hình'] },
  { id: 'notifications', label: 'Thông báo', icon: '🔔', href: '/admin/notifications', keywords: ['thông báo','notification'] },
  { id: 'collab', label: 'Lịch & Họp', icon: '📅', href: '/admin/collab', keywords: ['lịch','họp','calendar','meeting'] },
  { id: 'gamification', label: 'Gamification', icon: '🎮', href: '/admin/gamification', keywords: ['game','điểm','leaderboard'] },
  { id: 'erp', label: 'School ERP', icon: '🏫', href: '/admin/erp', keywords: ['erp','trường'] },
]

export function NavSearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const results = query.trim()
    ? ITEMS.filter(it =>
        it.label.toLowerCase().includes(query.toLowerCase()) ||
        (it.description ?? '').toLowerCase().includes(query.toLowerCase()) ||
        it.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : []

  const openBar = useCallback(() => {
    setOpen(true)
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

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeBar])

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeBar()
      }
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, closeBar])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Search toggle button */}
      <button
        onClick={open ? closeBar : openBar}
        title={open ? 'Đóng tìm kiếm (Esc)' : 'Tìm chức năng'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: open ? '6px 14px' : '6px 12px',
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
        }}
      >
        <span style={{ fontSize: 15 }}>🔍</span>
        {!open && <span>Tìm kiếm</span>}
        {open && <span>✕</span>}
      </button>

      {/* Dropdown search panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 360,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            border: '1px solid rgba(0,0,0,0.08)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Input */}
          <div style={{ padding: '12px 14px 0' }}>
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
            <ul style={{ listStyle: 'none', margin: 0, padding: '8px 8px 10px', maxHeight: 360, overflowY: 'auto' }}>
              {results.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.href)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '9px 10px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s',
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
              Không tìm thấy chức năng &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gợi ý nhanh</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Học sinh', 'Tài chính', 'Điểm danh', 'Thời khóa biểu', 'Phân quyền'].map(t => (
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
                      transition: 'all 0.12s',
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
    </div>
  )
}
