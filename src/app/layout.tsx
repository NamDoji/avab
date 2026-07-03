import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
})

// Use Inter as main display font (clean, Facebook-style)
const nunito = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: {
    default: 'AvaB - Luyện Thi Học Bổng Vào Lớp 1 | Toán Tư Duy Cho Bé',
    template: '%s | AvaB',
  },
  description:
    'AvaB - Nền tảng AI Giáo dục K12 thông minh. Hỗ trợ học sinh từ Mầm non đến Lớp 12 học tập cá nhân hóa với AI.',
  keywords: [
    'AI giáo dục K12',
    'học tập thông minh',
    'toán tư duy',
    'trường chất lượng cao',
    'AvaB',
    'avab.vn',
    'luyện thi học sinh giỏi',
  ],
  authors: [{ name: 'AvaB Education' }],
  creator: 'TenGo Team',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: 'en_US',
    url: 'https://avab.vn',
    siteName: 'AvaB',
    title: 'AvaB - Luyện Thi Học Bổng Vào Lớp 1',
    description:
      'Nền tảng AI Giáo dục K12 — Cá nhân hóa học tập cho mọi học sinh từ Mầm non đến Lớp 12.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AvaB Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AvaB - Luyện Thi Học Bổng Vào Lớp 1',
    description: 'Nền tảng AI Giáo dục K12 thông minh',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${nunito.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
