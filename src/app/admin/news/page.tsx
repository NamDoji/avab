'use client'

import { useState, useEffect } from 'react'
import { Newspaper, Plus, Edit, Trash2, Eye, EyeOff, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface NewsArticle {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  thumbnail: string | null
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  title: '',
  summary: '',
  content: '',
  thumbnail: '',
  isPublished: false,
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/news')
    const data = await res.json()
    if (data.success) setArticles(data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setShowForm(true)
  }

  const openEdit = (article: NewsArticle) => {
    setEditingId(article.id)
    setForm({
      title: article.title,
      summary: article.summary ?? '',
      content: article.content,
      thumbnail: article.thumbnail ?? '',
      isPublished: article.isPublished,
    })
    setError(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      content: form.content.trim(),
      thumbnail: form.thumbnail.trim() || null,
      isPublished: form.isPublished,
    }

    const res = editingId
      ? await fetch(`/api/admin/news/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/admin/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    const data = await res.json()
    if (data.success) {
      closeForm()
      load()
    } else {
      setError(data.error)
    }
    setSaving(false)
  }

  const handleTogglePublish = async (article: NewsArticle) => {
    await fetch(`/api/admin/news/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !article.isPublished }),
    })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá bài viết này? Hành động không thể hoàn tác.')) return
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    load()
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })

  return (
    <main className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-purple-600 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-purple-600" />
              Quản lý tin tức
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tạo bài viết
          </button>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">
                {editingId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="Nhập tiêu đề bài viết"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tóm tắt
                </label>
                <textarea
                  placeholder="Tóm tắt ngắn gọn bài viết (tuỳ chọn)"
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  placeholder="Nội dung đầy đủ của bài viết..."
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono text-sm"
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL ảnh đại diện
                </label>
                <input
                  type="url"
                  placeholder="https://... (tuỳ chọn)"
                  value={form.thumbnail}
                  onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {form.isPublished ? 'Đã xuất bản' : 'Nháp'}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg py-2.5 font-semibold transition"
                >
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Đăng bài'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Articles Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Đang tải...</div>
          ) : articles.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Chưa có bài viết nào</p>
              <p className="text-sm mt-1">Nhấn &quot;Tạo bài viết&quot; để bắt đầu</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Bài viết</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Ngày tạo</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="p-4 max-w-sm">
                      <p className="font-semibold text-gray-800 truncate">{article.title}</p>
                      {article.summary && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">{article.summary}</p>
                      )}
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{article.slug}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          article.isPublished
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {article.isPublished ? '✅ Xuất bản' : '📝 Nháp'}
                      </span>
                      {article.publishedAt && (
                        <p className="text-xs text-gray-400 mt-1">{formatDate(article.publishedAt)}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">{formatDate(article.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(article)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(article)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 transition"
                          title={article.isPublished ? 'Chuyển về nháp' : 'Xuất bản'}
                        >
                          {article.isPublished ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition"
                          title="Xoá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        {articles.length > 0 && (
          <p className="text-sm text-gray-400 mt-3 text-right">
            {articles.filter((a) => a.isPublished).length} xuất bản ·{' '}
            {articles.filter((a) => !a.isPublished).length} nháp ·{' '}
            {articles.length} tổng
          </p>
        )}
      </div>
    </main>
  )
}
