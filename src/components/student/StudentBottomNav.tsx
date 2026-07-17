'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  emoji: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/hoc-vien',          emoji: '🏠', label: 'Trang chủ' },
  { href: '/hoc-vien/lo-trinh', emoji: '🗺️', label: 'Lộ trình'  },
  { href: '/hoc-vien/ai-tutor', emoji: '🤖', label: 'AI Tutor'  },
  { href: '/hoc-vien/goi-y',    emoji: '💡', label: 'Gợi ý'     },
  { href: '/hoc-vien/thong-bao',emoji: '🔔', label: 'Thông báo' },
]

export default function StudentBottomNav() {
  const pathname = usePathname()

  // Only show on student pages — hide on quiz/subject deep pages to avoid distraction
  const hideOn = ['/quiz', '/bai-tap', '/dang-ky-thanh-cong']
  if (hideOn.some(p => pathname.includes(p))) return null

  return (
    <>
      {/* Spacer so content is not hidden behind the nav */}
      <div className="h-16 md:h-0" />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch">
          {NAV_ITEMS.map(item => {
            const isActive =
              item.href === '/hoc-vien'
                ? pathname === '/hoc-vien'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all active:scale-95 ${
                  isActive ? 'text-cherry-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {item.emoji}
                </span>
                <span
                  className={`text-[10px] font-bold leading-none ${
                    isActive ? 'text-cherry-600' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-cherry-500 mt-0.5" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop sidebar-style quick nav (shown on md+) */}
      <aside className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl px-2 py-1.5 gap-1">
        {NAV_ITEMS.map(item => {
          const isActive =
            item.href === '/hoc-vien'
              ? pathname === '/hoc-vien'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-cherry-600 text-white shadow-md shadow-cherry-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/hoc-vien/thong-ke"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            pathname.startsWith('/hoc-vien/thong-ke')
              ? 'bg-cherry-600 text-white shadow-md shadow-cherry-200'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <span className="text-base">📊</span>
          Thống kê
        </Link>
      </aside>
    </>
  )
}
