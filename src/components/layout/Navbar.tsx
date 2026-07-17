'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Globe, User, LogOut, ChevronDown, Search } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

// ── "Về chúng tôi" dropdown items ──────────────────────────────────────────
const aboutLinks = [
  { href: '/gioi-thieu',         label: 'Giới thiệu',         labelEn: 'About' },
  { href: '/thi-truong',         label: 'Thị trường',          labelEn: 'Market' },
  { href: '/mo-hinh-kinh-doanh', label: 'Mô hình kinh doanh', labelEn: 'Business Model' },
  { href: '/tai-chinh',          label: 'Tài chính',           labelEn: 'Finance' },
]

// ── Flat nav links (không gồm 4 cái trên) ──────────────────────────────────
const navLinks = [
  { href: '/khoa-hoc',  label: 'Khoá học',  labelEn: 'Courses',     highlight: true },
  { href: '/bang-vang', label: 'Bảng Vàng', labelEn: 'Leaderboard' },
  { href: '/ai',        label: 'AI Học Tập',labelEn: 'AI Tutor' },
  { href: '/tin-tuc',   label: 'Tin tức',   labelEn: 'News' },
  { href: '/lien-he',   label: 'Liên hệ',   labelEn: 'Contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen]           = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const [aboutOpen, setAboutOpen]     = useState(false)   // desktop hover
  const [aboutMobile, setAboutMobile] = useState(false)   // mobile expand
  const [searchQuery, setSearchQuery] = useState('')
  const { lang, setLang } = useLang()
  const pathname  = usePathname()
  const router    = useRouter()
  const { data: session } = useSession()
  const dropRef = useRef<HTMLDivElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`)
    setIsOpen(false)
    setSearchQuery('')
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close desktop dropdown + mobile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setAboutOpen(false)
      }
      // Đóng mobile menu khi click ngoài
      const nav = document.getElementById('mobile-menu-panel')
      const toggle = document.getElementById('mobile-menu-toggle')
      if (nav && toggle && !nav.contains(e.target as Node) && !toggle.contains(e.target as Node)) {
        setIsOpen(false)
        setAboutMobile(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive      = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const isAboutActive = aboutLinks.some(l => isActive(l.href))

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-cherry-100/50' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image src="/logo.png" alt="AvaB" width={48} height={48}
              className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-transform duration-200"
              style={{ background: 'transparent' }} priority />
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-1">

            {/* Dropdown: Về chúng tôi */}
            <div ref={dropRef} className="relative"
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}>
              <button
                onClick={() => setAboutOpen(v => !v)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isAboutActive ? 'bg-cherry-100 text-cherry-700' : 'text-gray-600 hover:text-cherry-700 hover:bg-cherry-50'
                }`}>
                {lang === 'vi' ? 'Về chúng tôi' : 'About Us'}
                <ChevronDown size={14} className={`transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
              {aboutOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-cherry-100 py-2 z-50">
                  {aboutLinks.map(link => (
                    <Link key={link.href} href={link.href}
                      onClick={() => setAboutOpen(false)}
                      className={`flex items-center px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isActive(link.href)
                          ? 'text-cherry-700 bg-cherry-50'
                          : 'text-gray-600 hover:text-cherry-700 hover:bg-cherry-50'
                      }`}>
                      {lang === 'vi' ? link.label : link.labelEn}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Flat links */}
            {navLinks.map(link => (
              link.highlight ? (
                <Link key={link.href} href={link.href}
                  className="px-6 py-2.5 rounded-full text-sm font-extrabold text-white whitespace-nowrap border-none overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #7B1933 0%, #951F3D 60%, #BE3659 100%)',
                    boxShadow: '0 4px 20px rgba(109,40,217,0.45)',
                    transition: 'all 220ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                  onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { boxShadow: '0 8px 32px rgba(109,40,217,0.6)', transform: 'translateY(-2px)' })}
                  onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { boxShadow: '0 4px 20px rgba(109,40,217,0.45)', transform: 'translateY(0)' })}>
                  {lang === 'vi' ? link.label : link.labelEn}
                </Link>
              ) : (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive(link.href)
                      ? 'bg-cherry-100 text-cherry-700'
                      : 'text-gray-600 hover:text-cherry-700 hover:bg-cherry-50'
                  }`}>
                  {lang === 'vi' ? link.label : link.labelEn}
                </Link>
              )
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-cherry-50 hover:text-cherry-700 transition-all">
              <Globe size={16} />
              <span>{lang.toUpperCase()}</span>
            </button>

            {session ? (
              <div className="flex items-center gap-2">
                <Link href="/hoc-vien"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cherry-50 text-cherry-700 text-sm font-semibold hover:bg-cherry-100 transition-all">
                  <User size={16} />
                  <span className="max-w-[100px] truncate">{session.user?.name || 'Học viên'}</span>
                </Link>
                <button onClick={() => signOut()}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/dang-nhap" className="btn-outline !py-2 !px-4 !text-sm">
                  {lang === 'vi' ? 'Đăng nhập' : 'Login'}
                </Link>
                <Link href="/dang-ky" className="btn-primary !py-2 !px-4 !text-sm">
                  {lang === 'vi' ? 'Đăng ký' : 'Sign up'}
                </Link>
              </div>
            )}

            {/* Khoá học nổi bật - luôn hiện trên mobile */}
            <Link href="/khoa-hoc"
              className="lg:hidden px-4 py-2 rounded-full text-sm font-extrabold text-white border-none"
              style={{
                background: 'linear-gradient(135deg, #7B1933 0%, #951F3D 60%, #BE3659 100%)',
                boxShadow: '0 4px 14px rgba(109,40,217,0.45)',
              }}>
              {lang === 'vi' ? 'Khoá học' : 'Courses'}
            </Link>

            {/* Mobile toggle */}
            <button id="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-cherry-50 hover:text-cherry-700 transition-all">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {isOpen && (
        <div id="mobile-menu-panel" className="lg:hidden bg-white border-t border-cherry-100 shadow-xl">
          <div className="container-custom py-4 flex flex-col gap-1">

            {/* Về chúng tôi group */}
            <button
              onClick={() => setAboutMobile(v => !v)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                isAboutActive ? 'bg-cherry-100 text-cherry-700' : 'text-gray-700 hover:bg-cherry-50'
              }`}>
              <span>{lang === 'vi' ? 'Về chúng tôi' : 'About Us'}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${aboutMobile ? 'rotate-180' : ''}`} />
            </button>

            {aboutMobile && (
              <div className="ml-4 border-l-2 border-cherry-200 pl-3 flex flex-col gap-1">
                {aboutLinks.map(link => (
                  <Link key={link.href} href={link.href}
                    onClick={() => { setIsOpen(false); setAboutMobile(false) }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive(link.href) ? 'bg-cherry-100 text-cherry-700' : 'text-gray-600 hover:bg-cherry-50'
                    }`}>
                    {lang === 'vi' ? link.label : link.labelEn}
                  </Link>
                ))}
              </div>
            )}

            {/* Flat links */}
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                  link.highlight
                    ? 'text-white font-black rounded-2xl'
                    : isActive(link.href) ? 'bg-cherry-100 text-cherry-700'
                    : 'text-gray-700 hover:bg-cherry-50'
                }`}
                style={link.highlight ? { background: 'linear-gradient(135deg, #951F3D, #5F1227)' } : {}}>
                {lang === 'vi' ? link.label : link.labelEn}
              </Link>
            ))}

            {/* Mobile Search bar */}
            <form onSubmit={handleSearch} className="relative mt-1 mb-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'vi' ? 'Tìm khoá học, bài học...' : 'Search courses, lessons...'}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cherry-300"
                />
              </div>
            </form>

            {/* Quick portal links */}
            <div className="border-t border-gray-100 pt-3 mt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">
                {lang === 'vi' ? 'Cổng thông tin' : 'Portals'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { href: '/hoc-vien',  icon: '🎓', label: lang === 'vi' ? 'Học viên'  : 'Student'  },
                  { href: '/giao-vien', icon: '👨‍🏫', label: lang === 'vi' ? 'Giáo viên' : 'Teacher'  },
                  { href: '/phu-huynh',icon: '👪', label: lang === 'vi' ? 'Phụ huynh' : 'Parent'   },
                ].map((portal) => (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl bg-gray-50 hover:bg-cherry-50 hover:text-cherry-700 transition-all text-center"
                  >
                    <span className="text-xl">{portal.icon}</span>
                    <span className="text-[11px] font-bold text-gray-700">{portal.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth buttons */}
            <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
              {session ? (
                <>
                  <Link href="/hoc-vien" onClick={() => setIsOpen(false)} className="btn-outline text-center">
                    {lang === 'vi' ? 'Trang học viên' : 'Student Dashboard'}
                  </Link>
                  <button onClick={() => signOut()} className="text-red-500 py-2 font-medium">
                    {lang === 'vi' ? 'Đăng xuất' : 'Sign out'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/dang-nhap" onClick={() => setIsOpen(false)} className="btn-outline text-center">
                    {lang === 'vi' ? 'Đăng nhập' : 'Login'}
                  </Link>
                  <Link href="/dang-ky" onClick={() => setIsOpen(false)} className="btn-primary text-center">
                    {lang === 'vi' ? 'Đăng ký miễn phí' : 'Sign up free'}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
