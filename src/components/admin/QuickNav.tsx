'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface NavModule {
  href: string
  icon: string
  label: string
  desc: string
}

export interface NavGroup {
  id: string
  icon: string
  label: string
  modules: NavModule[]
}

interface QuickNavProps {
  groups: NavGroup[]
}

export default function QuickNav({ groups }: QuickNavProps) {
  const [open, setOpen] = useState(false)

  // Restore persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin-quicknav-open')
      if (saved === 'true') setOpen(true)
    } catch {
      // ignore (SSR / private browsing)
    }
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    try {
      localStorage.setItem('admin-quicknav-open', String(next))
    } catch {
      // ignore
    }
  }

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span>🗂️</span>
          <span>Tất cả tính năng</span>
        </span>
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ↓
        </span>
      </button>

      {/* Groups accordion */}
      {open && (
        <div className="mt-3 space-y-2">
          {groups.map((group) => (
            <details key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group/details">
              <summary className="px-4 py-3 cursor-pointer list-none flex items-center gap-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 select-none transition-colors">
                <span className="text-base">{group.icon}</span>
                <span>{group.label}</span>
                <span className="ml-auto text-xs text-gray-400 group-open/details:rotate-180 transition-transform duration-150">▾</span>
              </summary>

              <div className="px-4 pb-4 pt-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {group.modules.map((mod) => (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="flex flex-col gap-1 p-3 rounded-xl border border-gray-100 hover:border-cherry-200 hover:bg-cherry-50 transition-all group/card"
                  >
                    <span className="text-xl leading-none">{mod.icon}</span>
                    <span className="text-xs font-bold text-gray-800 group-hover/card:text-cherry-700 leading-tight mt-0.5">
                      {mod.label}
                    </span>
                    <span className="text-xs text-gray-400 leading-tight">{mod.desc}</span>
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
