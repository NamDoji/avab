'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Book {
  id: string
  code: string
  title: string
  author: string
  category: string
  total: number
  available: number
  coverEmoji: string
}

interface BorrowRecord {
  id: string
  bookId: string
  bookTitle: string
  studentName: string
  studentId: string
  class: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: 'borrowed' | 'returned' | 'overdue'
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const today = new Date()
const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r.toISOString().split('T')[0]
}

const INITIAL_BOOKS: Book[] = [
  { id: 'b1', code: 'TH001', title: 'Toán học lớp 6', author: 'Trần Đức Huy', category: 'Giáo khoa', total: 30, available: 22, coverEmoji: '📐' },
  { id: 'b2', code: 'VH001', title: 'Văn học Việt Nam hiện đại', author: 'Nguyễn Thu Trang', category: 'Văn học', total: 15, available: 10, coverEmoji: '📖' },
  { id: 'b3', code: 'KH001', title: 'Khoa học tự nhiên 7', author: 'Phạm Văn Bình', category: 'Giáo khoa', total: 25, available: 18, coverEmoji: '🔬' },
  { id: 'b4', code: 'LS001', title: 'Lịch sử Việt Nam', author: 'Lê Thị Hoa', category: 'Lịch sử', total: 20, available: 14, coverEmoji: '🏛️' },
  { id: 'b5', code: 'TA001', title: 'Tiếng Anh Grade 8', author: 'John Smith & Ngọc Mai', category: 'Giáo khoa', total: 28, available: 20, coverEmoji: '🌐' },
  { id: 'b6', code: 'VL001', title: 'Vật lý đại cương', author: 'Hoàng Minh Tuấn', category: 'Khoa học', total: 12, available: 9, coverEmoji: '⚛️' },
  { id: 'b7', code: 'TN001', title: 'Truyện ngắn chọn lọc', author: 'Nhiều tác giả', category: 'Văn học', total: 8, available: 5, coverEmoji: '📚' },
  { id: 'b8', code: 'TT001', title: 'Tin học căn bản', author: 'Nguyễn Công Thắng', category: 'Công nghệ', total: 20, available: 15, coverEmoji: '💻' },
  { id: 'b9', code: 'DL001', title: 'Địa lý Việt Nam', author: 'Vũ Thị Lan', category: 'Địa lý', total: 18, available: 12, coverEmoji: '🗺️' },
  { id: 'b10', code: 'BD001', title: 'Bách khoa toàn thư thiếu nhi', author: 'NXB Giáo dục', category: 'Tham khảo', total: 5, available: 3, coverEmoji: '🌍' },
]

const INITIAL_BORROWS: BorrowRecord[] = [
  { id: 'br1', bookId: 'b1', bookTitle: 'Toán học lớp 6', studentName: 'Nguyễn Minh Khôi', studentId: 'HS001', class: '6A1', borrowDate: addDays(today, -10), dueDate: addDays(today, 4), returnDate: null, status: 'borrowed' },
  { id: 'br2', bookId: 'b2', bookTitle: 'Văn học Việt Nam hiện đại', studentName: 'Trần Thị Lan', studentId: 'HS002', class: '7B2', borrowDate: addDays(today, -20), dueDate: addDays(today, -6), returnDate: null, status: 'overdue' },
  { id: 'br3', bookId: 'b3', bookTitle: 'Khoa học tự nhiên 7', studentName: 'Lê Văn Hùng', studentId: 'HS003', class: '8A3', borrowDate: addDays(today, -5), dueDate: addDays(today, 9), returnDate: null, status: 'borrowed' },
  { id: 'br4', bookId: 'b7', bookTitle: 'Truyện ngắn chọn lọc', studentName: 'Phạm Thu Hà', studentId: 'HS004', class: '6A1', borrowDate: addDays(today, -15), dueDate: addDays(today, -1), returnDate: null, status: 'overdue' },
  { id: 'br5', bookId: 'b5', bookTitle: 'Tiếng Anh Grade 8', studentName: 'Hoàng Đức Anh', studentId: 'HS005', class: '9C1', borrowDate: addDays(today, -3), dueDate: addDays(today, 11), returnDate: null, status: 'borrowed' },
  { id: 'br6', bookId: 'b4', bookTitle: 'Lịch sử Việt Nam', studentName: 'Võ Thị Mai', studentId: 'HS006', class: '7B2', borrowDate: addDays(today, -25), dueDate: addDays(today, -11), returnDate: addDays(today, -9), status: 'returned' },
  { id: 'br7', bookId: 'b6', bookTitle: 'Vật lý đại cương', studentName: 'Đỗ Minh Tú', studentId: 'HS007', class: '8A3', borrowDate: addDays(today, -8), dueDate: addDays(today, 6), returnDate: null, status: 'borrowed' },
  { id: 'br8', bookId: 'b8', bookTitle: 'Tin học căn bản', studentName: 'Bùi Ngọc Linh', studentId: 'HS008', class: '6A1', borrowDate: addDays(today, -30), dueDate: addDays(today, -16), returnDate: addDays(today, -14), status: 'returned' },
]

const CATEGORIES = ['Tất cả', 'Giáo khoa', 'Văn học', 'Khoa học', 'Lịch sử', 'Địa lý', 'Công nghệ', 'Tham khảo']

// ─── Component ────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [tab, setTab] = useState<'books' | 'borrow' | 'overdue' | 'reports'>('books')
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS)
  const [borrows, setBorrows] = useState<BorrowRecord[]>(INITIAL_BORROWS)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Tất cả')
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState<BorrowRecord | null>(null)
  const [newBorrow, setNewBorrow] = useState({ bookId: '', studentName: '', studentId: '', class: '', days: '14' })

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredBooks = useMemo(() => {
    let list = books
    if (categoryFilter !== 'Tất cả') list = list.filter(b => b.category === categoryFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q)
      )
    }
    return list
  }, [books, search, categoryFilter])

  const activeBorrows = useMemo(() => borrows.filter(b => b.status !== 'returned'), [borrows])
  const overdueBorrows = useMemo(() => borrows.filter(b => b.status === 'overdue'), [borrows])

  const stats = useMemo(() => ({
    totalBooks: books.reduce((s, b) => s + b.total, 0),
    available: books.reduce((s, b) => s + b.available, 0),
    borrowed: activeBorrows.length,
    overdue: overdueBorrows.length,
  }), [books, activeBorrows, overdueBorrows])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleBorrow = () => {
    if (!newBorrow.bookId || !newBorrow.studentName || !newBorrow.studentId) return
    const book = books.find(b => b.id === newBorrow.bookId)
    if (!book || book.available === 0) return
    const bDate = today.toISOString().split('T')[0]
    const dDate = addDays(today, parseInt(newBorrow.days) || 14)
    setBorrows(prev => [...prev, {
      id: `br${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      studentName: newBorrow.studentName,
      studentId: newBorrow.studentId,
      class: newBorrow.class,
      borrowDate: bDate,
      dueDate: dDate,
      returnDate: null,
      status: 'borrowed',
    }])
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, available: b.available - 1 } : b))
    setNewBorrow({ bookId: '', studentName: '', studentId: '', class: '', days: '14' })
    setShowBorrowModal(false)
  }

  const handleReturn = (record: BorrowRecord) => {
    setBorrows(prev => prev.map(b =>
      b.id === record.id
        ? { ...b, returnDate: today.toISOString().split('T')[0], status: 'returned' as const }
        : b
    ))
    setBooks(prev => prev.map(b => b.id === record.bookId ? { ...b, available: b.available + 1 } : b))
    setShowReturnModal(null)
  }

  // ── Tab styles ─────────────────────────────────────────────────────────────

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    transition: 'all 0.15s',
    background: active ? '#6366f1' : 'transparent',
    color: active ? '#fff' : '#6b7280',
    whiteSpace: 'nowrap' as const,
  })

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-cherry-200 text-sm mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">ERP</Link>
            <span>/</span>
            <span>Thư viện</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1">📖 Quản lý Thư viện</h1>
          <p className="text-cherry-200 text-sm mb-4">Danh mục sách, mượn trả, theo dõi quá hạn</p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: '📚', val: stats.totalBooks, label: 'Tổng đầu sách' },
              { icon: '✅', val: stats.available, label: 'Còn trong kho' },
              { icon: '📤', val: stats.borrowed, label: 'Đang mượn' },
              { icon: '⚠️', val: stats.overdue, label: 'Quá hạn' },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <span>{p.icon}</span>
                <span className="font-black text-white">{p.val}</span>
                <span className="text-cherry-200 text-xs">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-6">

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 p-1.5 rounded-2xl bg-white shadow-sm border border-gray-100 w-fit overflow-x-auto">
          {([['books', '📚 Danh sách sách'], ['borrow', '📤 Mượn / Trả'], ['overdue', `⚠️ Quá hạn (${stats.overdue})`], ['reports', '📊 Báo cáo']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={tabStyle(tab === key)}>{label}</button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: BOOKS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'books' && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-black text-gray-900">📚 Danh mục sách ({books.length})</h2>
              <button
                onClick={() => setShowBorrowModal(true)}
                className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
              >
                + Cho mượn sách
              </button>
            </div>

            {/* Search + Category filter */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Tìm theo tên sách, tác giả, mã sách…"
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm flex-1 min-w-[200px]"
                style={{ outline: 'none' }}
              />
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      border: cat === categoryFilter ? '2px solid #6366f1' : '2px solid #e5e7eb',
                      background: cat === categoryFilter ? '#eef2ff' : '#fff',
                      color: cat === categoryFilter ? '#4338ca' : '#6b7280',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Book grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBooks.map(book => {
                const availPct = Math.round((book.available / book.total) * 100)
                const status = book.available === 0 ? 'Hết sách' : book.available < 3 ? 'Còn ít' : 'Còn sách'
                const statusColor = book.available === 0 ? '#dc2626' : book.available < 3 ? '#d97706' : '#16a34a'
                const statusBg = book.available === 0 ? '#fee2e2' : book.available < 3 ? '#fef9c3' : '#dcfce7'
                return (
                  <div key={book.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: '#eef2ff' }}>
                        {book.coverEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-gray-900 text-sm leading-tight truncate">{book.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</div>
                        <div className="text-xs text-cherry-600 font-bold mt-0.5">{book.code}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cherry-50 text-cherry-700 font-bold">
                        {book.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: statusBg, color: statusColor }}>
                        {status}
                      </span>
                    </div>

                    {/* Availability bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Còn lại: <strong className="text-cherry-700">{book.available}</strong>/{book.total}</span>
                        <span>{availPct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${availPct}%`,
                            background: availPct > 50 ? '#6366f1' : availPct > 20 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredBooks.length === 0 && (
                <div className="col-span-4 py-16 text-center text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p>Không tìm thấy sách nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: BORROW / RETURN */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'borrow' && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-black text-gray-900">📤 Sách đang mượn ({activeBorrows.length})</h2>
              <button
                onClick={() => setShowBorrowModal(true)}
                className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
              >
                + Cho mượn sách
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {activeBorrows.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="text-4xl mb-2">📚</div>
                  <p>Không có sách nào đang được mượn</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#eef2ff', borderBottom: '2px solid #c7d2fe' }}>
                      {['Sách', 'Học sinh', 'Lớp', 'Ngày mượn', 'Hạn trả', 'Trạng thái', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-bold text-cherry-700 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeBorrows.map(rec => {
                      const isOverdue = rec.status === 'overdue'
                      const daysLeft = Math.ceil((new Date(rec.dueDate).getTime() - today.getTime()) / 86400000)
                      return (
                        <tr key={rec.id} className={`hover:bg-cherry-50/20 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900 text-sm">{rec.bookTitle}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{rec.studentName}</div>
                            <div className="text-xs text-gray-500">{rec.studentId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">{rec.class}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(rec.borrowDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className={`font-bold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                              {new Date(rec.dueDate).toLocaleDateString('vi-VN')}
                            </div>
                            <div className={`text-xs ${isOverdue ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                              {isOverdue ? `Quá ${Math.abs(daysLeft)} ngày` : `Còn ${daysLeft} ngày`}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                background: isOverdue ? '#fee2e2' : '#dbeafe',
                                color: isOverdue ? '#dc2626' : '#1d4ed8',
                              }}
                            >
                              {isOverdue ? '⚠️ Quá hạn' : '📤 Đang mượn'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setShowReturnModal(rec)}
                              className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                            >
                              Trả sách ✓
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: OVERDUE */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'overdue' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4">⚠️ Sách quá hạn ({overdueBorrows.length})</h2>

            {overdueBorrows.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-semibold">Không có sách quá hạn!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueBorrows.map(rec => {
                  const daysOverdue = Math.ceil((today.getTime() - new Date(rec.dueDate).getTime()) / 86400000)
                  const fine = daysOverdue * 2000 // 2000đ/ngày
                  return (
                    <div key={rec.id} className="bg-white rounded-2xl p-5 shadow-sm border-l-4 flex items-center justify-between flex-wrap gap-4"
                      style={{ borderLeftColor: '#ef4444' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: '#fee2e2' }}>
                          📕
                        </div>
                        <div>
                          <div className="font-black text-gray-900">{rec.bookTitle}</div>
                          <div className="text-sm text-gray-600">{rec.studentName} · {rec.class} · {rec.studentId}</div>
                          <div className="text-xs text-red-500 font-bold mt-0.5">
                            Quá hạn {daysOverdue} ngày từ {new Date(rec.dueDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Phí phạt ước tính</div>
                          <div className="font-black text-red-600">{fine.toLocaleString('vi-VN')}đ</div>
                        </div>
                        <button
                          onClick={() => setShowReturnModal(rec)}
                          className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                        >
                          Trả sách ✓
                        </button>
                      </div>
                    </div>
                  )
                })}

                <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                  <p className="text-sm text-red-700 font-semibold">
                    💡 Phí phạt: 2.000đ/ngày quá hạn. Liên hệ phụ huynh để thu hồi sách.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: REPORTS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'reports' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4">📊 Báo cáo thư viện</h2>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { icon: '📚', label: 'Tổng đầu sách', val: books.length, color: '#6366f1', bg: '#eef2ff' },
                { icon: '📖', label: 'Tổng bản sách', val: books.reduce((s, b) => s + b.total, 0), color: '#2563eb', bg: '#dbeafe' },
                { icon: '📤', label: 'Đang mượn', val: activeBorrows.length, color: '#d97706', bg: '#fef9c3' },
                { icon: '⚠️', label: 'Quá hạn', val: overdueBorrows.length, color: '#dc2626', bg: '#fee2e2' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: c.bg }}>
                    {c.icon}
                  </div>
                  <div className="text-2xl font-black" style={{ color: c.color }}>{c.val}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Top borrowed books */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">🏆 Sách được mượn nhiều nhất</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {books
                  .map(b => ({
                    ...b,
                    borrowCount: borrows.filter(r => r.bookId === b.id).length,
                  }))
                  .sort((a, b) => b.borrowCount - a.borrowCount)
                  .slice(0, 5)
                  .map((book, idx) => (
                    <div key={book.id} className="px-5 py-3 flex items-center gap-4">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                        style={{ background: idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : idx === 2 ? '#cd7c00' : '#6366f1' }}>
                        {idx + 1}
                      </div>
                      <div className="text-2xl">{book.coverEmoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{book.title}</div>
                        <div className="text-xs text-gray-500">{book.author}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-cherry-50 text-cherry-700 font-black text-sm">
                        {book.borrowCount} lần
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent returns */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">🔄 Lịch sử trả sách gần đây</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {borrows.filter(b => b.status === 'returned').slice(-5).reverse().map(rec => (
                  <div key={rec.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{rec.bookTitle}</div>
                      <div className="text-xs text-gray-500">{rec.studentName} · {rec.class}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Ngày trả</div>
                      <div className="text-sm font-bold text-green-600">
                        {rec.returnDate ? new Date(rec.returnDate).toLocaleDateString('vi-VN') : '—'}
                      </div>
                    </div>
                  </div>
                ))}
                {borrows.filter(b => b.status === 'returned').length === 0 && (
                  <div className="p-6 text-center text-gray-400 text-sm">Chưa có lượt trả sách</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link href="/admin/erp" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← School ERP
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BORROW MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-gray-900 mb-5">📤 Cho mượn sách</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Chọn sách *</label>
                <select
                  value={newBorrow.bookId}
                  onChange={e => setNewBorrow(p => ({ ...p, bookId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  style={{ outline: 'none' }}
                >
                  <option value="">-- Chọn sách --</option>
                  {books.filter(b => b.available > 0).map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.available} còn lại)</option>
                  ))}
                </select>
              </div>
              {[
                { label: 'Tên học sinh *', key: 'studentName', placeholder: 'Nguyễn Văn A' },
                { label: 'Mã học sinh *', key: 'studentId', placeholder: 'HS001' },
                { label: 'Lớp', key: 'class', placeholder: '6A1' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{f.label}</label>
                  <input
                    value={newBorrow[f.key as keyof typeof newBorrow]}
                    onChange={e => setNewBorrow(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    style={{ outline: 'none' }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Thời hạn mượn (ngày)</label>
                <select
                  value={newBorrow.days}
                  onChange={e => setNewBorrow(p => ({ ...p, days: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  style={{ outline: 'none' }}
                >
                  {['7', '14', '21', '30'].map(d => <option key={d} value={d}>{d} ngày</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBorrowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={handleBorrow}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
              >
                Xác nhận cho mượn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* RETURN MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm mx-4">
            <h3 className="text-lg font-black text-gray-900 mb-2">🔄 Xác nhận trả sách</h3>
            <p className="text-sm text-gray-600 mb-6">
              <strong>{showReturnModal.studentName}</strong> trả lại sách{' '}
              <strong>"{showReturnModal.bookTitle}"</strong>?
            </p>
            {showReturnModal.status === 'overdue' && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-700 font-semibold">
                  ⚠️ Sách đã quá hạn. Vui lòng thu phí phạt theo quy định.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReturnModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={() => handleReturn(showReturnModal)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                ✓ Xác nhận trả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
