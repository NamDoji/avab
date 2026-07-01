import { Newspaper, ArrowRight, Calendar } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'

export const metadata = { title: 'Tin tức' }
export const revalidate = 60

export default async function TinTucPage() {
  const news = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  }).catch(() => [])

  return (
    <div className="min-h-screen pt-20">
      <div className="gradient-hero text-white py-16">
        <div className="container-custom text-center">
          <Newspaper className="mx-auto mb-4" size={48} />
          <h1 className="text-4xl md:text-5xl font-black mb-4">Tin Tức</h1>
          <p className="text-white/80 max-w-xl mx-auto">
            Cập nhật mới nhất từ AvaB — kết quả học sinh, sự kiện và thông tin tuyển sinh.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {news.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg font-semibold">Chưa có tin tức nào. Hãy quay lại sau!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link
                key={item.id}
                href={`/tin-tuc/${item.slug}`}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm card-hover overflow-hidden flex flex-col"
              >
                <div className="gradient-card h-36 flex items-center justify-center text-5xl">
                  📰
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {item.publishedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                      <Calendar size={12} />
                      {format(item.publishedAt, 'dd MMM yyyy', { locale: vi })}
                    </div>
                  )}
                  <h3 className="font-black text-gray-900 text-base mb-2 leading-snug group-hover:text-purple-700 transition-colors">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-purple-600 text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
                    Đọc tiếp <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
