'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'
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

  const stats = [
    { value: '500+', label: vi ? 'Phụ huynh'       : 'Parents' },
    { value: '100+', label: vi ? 'Học viên'         : 'Students' },
    { value: '3',    label: vi ? 'Năm hoạt động'    : 'Years' },
    { value: '10+',  label: vi ? 'Chuyên đề'        : 'Subjects' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-2 lg:col-span-1">
          <div className="mb-4">
            <div className="relative w-12 h-12">
              <Image src="/logo.png" alt="AvaB" fill className="object-contain" />
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {vi
              ? 'Nền tảng luyện thi học bổng vào lớp 1 các trường chất lượng cao hàng đầu. Phương pháp toán tư duy đỉnh cao.'
              : 'Premier Grade 1 scholarship exam prep platform. Top-tier logical thinking math methodology.'}
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 bg-purple-800 hover:bg-purple-600 rounded-xl flex items-center justify-center transition-colors text-sm font-bold">f</a>
            <a href="#" className="w-9 h-9 bg-red-800 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors text-sm font-bold">▶</a>
          </div>
        </div>

        {/* Explore links */}
        <div>
          <h4 className="font-bold text-white mb-4">{vi ? 'Khám phá' : 'Explore'}</h4>
          <ul className="space-y-2">
            {explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
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
                <Link href={link.href} className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  {vi ? link.label : link.labelEn}
                </Link>
              </li>
            ))}
          </ul>

          {/* Awards */}
          <div className="mt-6 p-3 bg-gray-800 rounded-2xl">
            <p className="text-xs text-purple-300 font-bold mb-1">🏆 {vi ? 'Giải thưởng' : 'Awards'}</p>
            <p className="text-xs text-gray-400">{vi ? 'Giải Nhất vòng Trường' : '1st Prize – School Round'}</p>
            <p className="text-xs text-gray-400">{vi ? 'Giải Nhì cụm Nam–Bắc Từ Liêm' : '2nd Prize – District Cluster'}</p>
            <p className="text-xs text-gray-400">{vi ? 'Giải Ba Thành phố Hà Nội' : '3rd Prize – Hanoi City'}</p>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-white mb-4">{vi ? 'Liên hệ' : 'Contact'}</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <MapPin size={16} className="text-purple-400 mt-0.5 shrink-0" />
              <span>SH1 Toà B, CC Paragon, Ngõ 86 Duy Tân, Cầu Giấy, {vi ? 'Hà Nội' : 'Hanoi'}</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-400">
              <Phone size={16} className="text-purple-400 shrink-0" />
              <a href="tel:0904290583" className="hover:text-purple-300 transition-colors">0904 290 583</a>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-400">
              <Mail size={16} className="text-purple-400 shrink-0" />
              <a href="mailto:nam@itsol.vn" className="hover:text-purple-300 transition-colors">nam@itsol.vn</a>
            </li>
          </ul>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-gray-800 rounded-xl p-2 text-center">
                <div className="text-purple-300 font-black text-lg">{stat.value}</div>
                <div className="text-gray-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-sm">
            © 2024 AvaB – avab.vn. {vi ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}
          </p>
          <p className="text-gray-600 text-xs">
            {vi ? 'Phát triển bởi' : 'Built by'} <span className="text-purple-400 font-semibold">TenGo Team</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
