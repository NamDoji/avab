import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Search, BookOpen, Newspaper, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Tìm kiếm — AvaB' }

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function highlight(text: string, q: string): string {
  if (!q) return text
  return text.replace(
    new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
    '<mark class="bg-yellow-100 text-yellow-900 rounded px-0.5">$1</mark>'
  )
}

// ─── Search Input (client island) ──────────────────────────────────────────────

function SearchInput({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="GET" action="/tim-kiem" className="relative max-w-2xl mx-auto">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Tìm khoá học, bài viết..."
        autoFocus
        className="w-full pl-12 pr-28 py-4 rounded-2xl border-2 border-gray-200 focus:border-cherry-400 text-sm focus:outline-none shadow-sm transition bg-white text-gray-900"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-cherry-600 text-white text-sm font-bold hover:bg-cherry-700 transition"
      >
        Tìm
      </button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: rawQ } = await searchParams
  const q = (rawQ ?? '').trim().slice(0, 100) // sanitise length

  // Parallel search queries
  const [courses, news] = await Promise.all([
    q
      ? prisma.course.findMany({
          where: {
            isPublic: true,
            isActive: true,
            OR: [
              { name:        { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { subjectName: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: {
            id:          true,
            name:        true,
            description: true,
            subjectName: true,
            gradeMin:    true,
            thumbnail:   true,
            price:       true,
          },
          take:    12,
          orderBy: { createdAt: 'desc' },
        })
      : [],

    q
      ? prisma.news.findMany({
          where: {
            isPublished:    true,
            organizationId: null,
            OR: [
              { title:   { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: {
            id:          true,
            title:       true,
            slug:        true,
            summary:     true,
            thumbnail:   true,
            publishedAt: true,
          },
          take:    6,
          orderBy: { publishedAt: 'desc' },
        })
      : [],
  ])

  const hasResults = courses.length > 0 || news.length > 0

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* ── Hero search bar ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-gray-900 to-cherry-900 text-white py-10 px-4">
        <div className="container-custom max-w-3xl">
          <h1 className="text-center font-black text-2xl mb-6">🔍 Tìm kiếm</h1>
          <SearchInput defaultValue={q} />
          {q && (
            <p className="text-center text-sm text-gray-400 mt-3">
              Kết quả cho: <strong className="text-white">&ldquo;{q}&rdquo;</strong>
            </p>
          )}
        </div>
      </div>

      <div className="container-custom max-w-4xl py-8 space-y-8">

        {/* Empty state — no query */}
        {!q && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔎</div>
            <h2 className="text-xl font-black text-gray-800 mb-2">Tìm gì đó ngay nào!</h2>
            <p className="text-gray-500 text-sm">Nhập từ khoá để tìm khoá học, bài viết và thông tin hữu ích.</p>
            {/* Quick links */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {['Toán', 'Tiếng Anh', 'Lập trình', 'Python', 'Scratch'].map(term => (
                <a
                  key={term}
                  href={`/tim-kiem?q=${encodeURIComponent(term)}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-cherry-400 hover:text-cherry-700 transition shadow-sm"
                >
                  {term}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {q && !hasResults && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-xl font-black text-gray-800 mb-2">Không tìm thấy kết quả</h2>
            <p className="text-gray-500 text-sm">
              Không có khoá học hoặc bài viết nào khớp với <strong>&ldquo;{q}&rdquo;</strong>
            </p>
            <a
              href="/tim-kiem"
              className="inline-block mt-4 text-sm text-cherry-600 hover:underline"
            >
              Xoá tìm kiếm
            </a>
          </div>
        )}

        {/* ── Courses section ──────────────────────────────────────────── */}
        {courses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <BookOpen size={18} className="text-cherry-500" />
                Khoá học
                <span className="text-sm font-semibold text-gray-400">({courses.length})</span>
              </h2>
              <Link
                href="/khoa-hoc"
                className="text-xs font-semibold text-cherry-600 hover:text-cherry-800 flex items-center gap-1"
              >
                Xem tất cả <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <Link
                  key={course.id}
                  href={`/khoa-hoc/${course.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="h-28 bg-gradient-to-br from-cherry-100 to-cherry-100 flex items-center justify-center overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-4xl">📚</span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-black text-gray-900 text-sm mb-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: highlight(course.name, q) }}
                    />
                    {course.description && (
                      <p
                        className="text-xs text-gray-500 line-clamp-2 mb-2"
                        dangerouslySetInnerHTML={{ __html: highlight(course.description, q) }}
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cherry-600 font-semibold">
                        {course.subjectName ?? 'Khoá học'}
                        {course.gradeMin != null ? ` · Lớp ${course.gradeMin}` : ''}
                      </span>
                      {course.price != null && course.price > 0 ? (
                        <span className="text-xs font-bold text-gray-700">
                          {course.price.toLocaleString('vi-VN')}₫
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-600">Miễn phí</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── News section ─────────────────────────────────────────────── */}
        {news.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <Newspaper size={18} className="text-blue-500" />
                Bài viết
                <span className="text-sm font-semibold text-gray-400">({news.length})</span>
              </h2>
            </div>

            <div className="space-y-3">
              {news.map(article => (
                <Link
                  key={article.id}
                  href={`/tin-tuc/${article.slug}`}
                  className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 items-start group"
                >
                  {article.thumbnail && (
                    <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-black text-gray-900 text-sm mb-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: highlight(article.title, q) }}
                    />
                    {article.summary && (
                      <p
                        className="text-xs text-gray-500 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlight(article.summary, q) }}
                      />
                    )}
                    {article.publishedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
