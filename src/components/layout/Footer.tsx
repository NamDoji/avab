'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/contexts/LanguageContext'

export function Footer() {
  const { lang } = useLang()
  const vi = lang === 'vi'

  const explore = [
    { href: '/gioi-thieu',         label: 'Giới thiệu',         labelEn: 'About' },
    { href: '/khoa-hoc',           label: 'Khoá học',            labelEn: 'Courses' },
    { href: '/thi-truong',         label: 'Thị trường',          labelEn: 'Market' },
    { href: '/mo-hinh-kinh-doanh', label: 'Mô hình kinh doanh', labelEn: 'Business Model' },
    { href: '/tai-chinh',          label: 'Tài chính',           labelEn: 'Finance' },
    { href: '/bang-vang',          label: 'Bảng Vàng',           labelEn: 'Leaderboard' },
    { href: '/ai',                 label: 'AI Học Tập',          labelEn: 'AI Tutor' },
  ]

  const support = [
    { href: '/dang-ky',    label: 'Đăng ký học',  labelEn: 'Enroll' },
    { href: '/dang-nhap',  label: 'Đăng nhập',    labelEn: 'Login' },
    { href: '/tin-tuc',    label: 'Tin tức',       labelEn: 'News' },
    { href: '/tuyen-dung', label: 'Tuyển dụng',   labelEn: 'Careers' },
    { href: '/lien-he',    label: 'Liên hệ',       labelEn: 'Contact' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4">
            <div className="relative w-12 h-12">
              <Image src="/logo.png" alt="AvaB" fill className="object-contain" />
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {vi
              ? 'Nền tảng AI giáo dục K12 thông minh — Từ Mầm non đến Lớp 12. Công nghệ AI hỗ trợ học sinh học tập cá nhân hóa.'
              : 'Premier Grade 1 scholarship exam prep platform. Top-tier logical thinking math methodology.'}
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 bg-cherry-800 hover:bg-cherry-600 rounded-xl flex items-center justify-center transition-colors text-sm font-bold">f</a>
            <a href="#" className="w-9 h-9 bg-red-800 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors text-sm font-bold">▶</a>
          </div>
        </div>

        {/* Explore links */}
        <div>
          <h4 className="font-bold text-white mb-4">{vi ? 'Khám phá' : 'Explore'}</h4>
          <ul className="space-y-2">
            {explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-400 hover:text-cherry-300 text-sm transition-colors">
                  {vi ? link.label : link.labelEn}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support links */}
        <div>
          <h4 className="font-bold text-white mb-4">{vi ? 'Hỗ trợ' : 'Support'}</h4>
          <ul className="space-y-2">
            {support.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-400 hover:text-cherry-300 text-sm transition-colors">
                  {vi ? link.label : link.labelEn}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} AvaB – avab.vn. {vi ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}
          </p>
          <p className="text-gray-600 text-xs">
            {vi ? 'Phát triển bởi' : 'Built by'} <span className="text-cherry-400 font-semibold">TenGo Team</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
