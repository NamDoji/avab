'use client'

import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, LayoutDashboard, Users, Link2, LogOut } from 'lucide-react'

const NAV = [
  { href: '/phu-huynh', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/phu-huynh/lien-ket', label: 'Liên kết với con', icon: Link2 },
]

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dang-nhap')
    } else if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role !== 'PARENT' && role !== 'ADMIN') {
        router.push('/')
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const role = (session?.user as any)?.role
  if (!session?.user || (role !== 'PARENT' && role !== 'ADMIN')) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm">A</div>
          <span className="font-black text-gray-900 text-sm">AvaB</span>
          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Phụ huynh</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-xl hover:bg-gray-100 transition">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col fixed left-0 top-0 h-full z-30 shadow-sm">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Sidebar mobile overlay */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-64 bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm">A</div>
                  <span className="font-black text-gray-900">AvaB Phụ huynh</span>
                </div>
                <button onClick={() => setOpen(false)}><X size={20} /></button>
              </div>
              <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-60 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {/* Logo — desktop only */}
      <div className="hidden lg:flex p-5 border-b border-gray-100 items-center gap-2.5">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
        <div>
          <p className="font-black text-gray-900 text-sm leading-tight">AvaB</p>
          <p className="text-xs text-blue-600 font-semibold">Phụ huynh 👨‍👩‍👧‍👦</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/phu-huynh' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}>
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link href="/dang-nhap" className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition">
          <LogOut size={14} /> Đăng xuất
        </Link>
      </div>
    </>
  )
}
