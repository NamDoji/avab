import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Newspaper } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export const revalidate = 60

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const news = await prisma.news.findUnique({
    where: { slug, isPublished: true },
  }).catch(() => null)

  if (!news) notFound()

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-12 max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/tin-tuc"
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay lại tin tức
        </Link>

        {/* Article */}
        <article className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="gradient-hero text-white p-8 md:p-12">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <Newspaper size={14} />
              <span>Tin tức AvaB</span>
              {news.publishedAt && (
                <>
                  <span>·</span>
                  <Calendar size={14} />
                  <span>{format(news.publishedAt, 'dd MMMM yyyy', { locale: vi })}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black leading-tight">{news.title}</h1>
            {news.summary && (
              <p className="text-white/80 mt-4 text-lg leading-relaxed">{news.summary}</p>
            )}
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed text-base">
              {news.content.split('\n').map((para, i) =>
                para.trim() ? (
                  <p key={i} className="mb-4">{para}</p>
                ) : null
              )}
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
              <Link href="/tin-tuc" className="btn-outline !py-2 !px-4 !text-sm inline-flex items-center gap-2">
                <ArrowLeft size={14} />
                Xem thêm tin tức
              </Link>

            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
