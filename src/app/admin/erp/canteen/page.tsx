'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string
  name: string
  calories: number
  price: number
}

interface DailyMenu {
  date: string // YYYY-MM-DD
  items: MenuItem[]
}

interface MealRegistration {
  id: string
  studentName: string
  studentId: string
  class: string
  date: string
  paid: boolean
  amount: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function getWeekDates(): string[] {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

const WEEK_DATES = getWeekDates()

const WEEKLY_MENU: DailyMenu[] = [
  { date: WEEK_DATES[0], items: [{ id: 'm1', name: 'Cơm gà xào sả ớt', calories: 520, price: 25000 }, { id: 'm2', name: 'Canh bí đỏ thịt băm', calories: 120, price: 0 }, { id: 'm3', name: 'Dưa hấu tráng miệng', calories: 60, price: 0 }] },
  { date: WEEK_DATES[1], items: [{ id: 'm4', name: 'Cơm sườn nướng', calories: 580, price: 28000 }, { id: 'm5', name: 'Canh chua cá lóc', calories: 150, price: 0 }, { id: 'm6', name: 'Táo xanh tráng miệng', calories: 52, price: 0 }] },
  { date: WEEK_DATES[2], items: [{ id: 'm7', name: 'Cơm bò xào rau muống', calories: 490, price: 30000 }, { id: 'm8', name: 'Súp bí đỏ', calories: 90, price: 0 }, { id: 'm9', name: 'Nho tráng miệng', calories: 70, price: 0 }] },
  { date: WEEK_DATES[3], items: [{ id: 'm10', name: 'Cơm cá chiên sốt cà', calories: 510, price: 26000 }, { id: 'm11', name: 'Canh mướp thịt băm', calories: 110, price: 0 }, { id: 'm12', name: 'Cam tráng miệng', calories: 60, price: 0 }] },
  { date: WEEK_DATES[4], items: [{ id: 'm13', name: 'Cơm thịt kho trứng', calories: 560, price: 27000 }, { id: 'm14', name: 'Canh rau ngót', calories: 80, price: 0 }, { id: 'm15', name: 'Dưa hấu tráng miệng', calories: 60, price: 0 }] },
]

const INITIAL_REGISTRATIONS: MealRegistration[] = [
  { id: 'r1', studentName: 'Nguyễn Minh Khôi', studentId: 'HS001', class: '6A1', date: WEEK_DATES[0], paid: true, amount: 25000 },
  { id: 'r2', studentName: 'Trần Thị Lan', studentId: 'HS002', class: '7B2', date: WEEK_DATES[0], paid: false, amount: 25000 },
  { id: 'r3', studentName: 'Lê Văn Hùng', studentId: 'HS003', class: '8A3', date: WEEK_DATES[0], paid: true, amount: 25000 },
  { id: 'r4', studentName: 'Phạm Thu Hà', studentId: 'HS004', class: '6A1', date: WEEK_DATES[1], paid: true, amount: 28000 },
  { id: 'r5', studentName: 'Hoàng Đức Anh', studentId: 'HS005', class: '9C1', date: WEEK_DATES[1], paid: false, amount: 28000 },
  { id: 'r6', studentName: 'Võ Thị Mai', studentId: 'HS006', class: '7B2', date: WEEK_DATES[2], paid: true, amount: 30000 },
  { id: 'r7', studentName: 'Đỗ Minh Tú', studentId: 'HS007', class: '8A3', date: WEEK_DATES[2], paid: false, amount: 30000 },
  { id: 'r8', studentName: 'Bùi Ngọc Linh', studentId: 'HS008', class: '6A1', date: WEEK_DATES[3], paid: true, amount: 26000 },
  { id: 'r9', studentName: 'Nguyễn Minh Khôi', studentId: 'HS001', class: '6A1', date: WEEK_DATES[3], paid: false, amount: 26000 },
  { id: 'r10', studentName: 'Trần Thị Lan', studentId: 'HS002', class: '7B2', date: WEEK_DATES[4], paid: true, amount: 27000 },
]

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ'

// ─── Component ────────────────────────────────────────────────────────────────

export default function CanteenPage() {
  const [tab, setTab] = useState<'menu' | 'registrations' | 'payment' | 'reports'>('menu')
  const [registrations, setRegistrations] = useState<MealRegistration[]>(INITIAL_REGISTRATIONS)
  const [selectedDate, setSelectedDate] = useState(WEEK_DATES[0])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newReg, setNewReg] = useState({ studentName: '', studentId: '', class: '', date: WEEK_DATES[0] })

  // ── Derived data ──────────────────────────────────────────────────────────

  const todayMenu = WEEKLY_MENU.find(m => m.date === selectedDate)
  const todayMenuPrice = todayMenu?.items.find(i => i.price > 0)?.price ?? 0

  const filteredRegs = useMemo(() => {
    const regs = registrations.filter(r => r.date === selectedDate)
    if (!search.trim()) return regs
    const q = search.toLowerCase()
    return regs.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.studentId.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q)
    )
  }, [registrations, selectedDate, search])

  const stats = useMemo(() => {
    const total = registrations.length
    const paid = registrations.filter(r => r.paid).length
    const unpaid = total - paid
    const revenue = registrations.filter(r => r.paid).reduce((s, r) => s + r.amount, 0)
    const pending = registrations.filter(r => !r.paid).reduce((s, r) => s + r.amount, 0)
    return { total, paid, unpaid, revenue, pending }
  }, [registrations])

  const dailyReport = useMemo(() =>
    WEEK_DATES.map(date => {
      const regs = registrations.filter(r => r.date === date)
      return {
        date,
        count: regs.length,
        revenue: regs.filter(r => r.paid).reduce((s, r) => s + r.amount, 0),
        menuName: WEEKLY_MENU.find(m => m.date === date)?.items[0]?.name ?? '—',
      }
    }),
  [registrations])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const togglePaid = (id: string) => {
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, paid: !r.paid } : r))
  }

  const addRegistration = () => {
    if (!newReg.studentName || !newReg.studentId) return
    const price = WEEKLY_MENU.find(m => m.date === newReg.date)?.items.find(i => i.price > 0)?.price ?? 25000
    setRegistrations(prev => [
      ...prev,
      { ...newReg, id: `r${Date.now()}`, paid: false, amount: price },
    ])
    setNewReg({ studentName: '', studentId: '', class: '', date: WEEK_DATES[0] })
    setShowAddModal(false)
  }

  const removeRegistration = (id: string) => {
    setRegistrations(prev => prev.filter(r => r.id !== id))
  }

  // ── Tab styles ─────────────────────────────────────────────────────────────

  const tabStyle = (active: boolean) => ({
    padding: '8px 18px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    transition: 'all 0.15s',
    background: active ? '#f97316' : 'transparent',
    color: active ? '#fff' : '#6b7280',
  })

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-orange-100 text-sm mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/erp" className="hover:text-white transition-colors">ERP</Link>
            <span>/</span>
            <span>Căng tin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1">🍽️ Quản lý Căng tin</h1>
          <p className="text-orange-100 text-sm mb-4">Thực đơn, đăng ký suất ăn, thu tiền ăn</p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: '🍱', val: stats.total, label: 'Tổng đăng ký' },
              { icon: '✅', val: stats.paid, label: 'Đã thanh toán' },
              { icon: '⏳', val: stats.unpaid, label: 'Chưa thanh toán' },
              { icon: '💰', val: fmt(stats.revenue), label: 'Doanh thu' },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <span>{p.icon}</span>
                <span className="font-black text-white">{p.val}</span>
                <span className="text-orange-100 text-xs">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-6">

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 p-1.5 rounded-2xl bg-white shadow-sm border border-gray-100 w-fit">
          {([['menu', '📋 Thực đơn'], ['registrations', '📝 Đăng ký'], ['payment', '💳 Thu tiền'], ['reports', '📊 Báo cáo']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={tabStyle(tab === key)}>{label}</button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: MENU */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'menu' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4">📋 Thực đơn tuần này</h2>

            {/* Date picker row */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {WEEK_DATES.map((date, i) => {
                const d = new Date(date)
                const dayLabel = DAYS_OF_WEEK[d.getDay()]
                const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`
                const active = date === selectedDate
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 12,
                      border: active ? '2px solid #f97316' : '2px solid #e5e7eb',
                      background: active ? '#fff7ed' : '#fff',
                      color: active ? '#f97316' : '#374151',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div className="text-xs">{dayLabel}</div>
                    <div className="text-sm">{dateLabel}</div>
                  </button>
                )
              })}
            </div>

            {/* Menu card */}
            {todayMenu ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-black text-gray-900">
                    Thực đơn {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                  </h3>
                  <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    {fmt(todayMenuPrice)} / suất
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {todayMenu.items.map((item, idx) => (
                    <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: idx === 0 ? '#fff7ed' : idx === 1 ? '#f0fdf4' : '#fef9c3' }}>
                        {idx === 0 ? '🍚' : idx === 1 ? '🥣' : '🍑'}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.calories} kcal</div>
                      </div>
                      {item.price > 0 && (
                        <span className="text-sm font-bold text-orange-600">{fmt(item.price)}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-orange-50 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Đăng ký hôm nay: <strong className="text-orange-700">{registrations.filter(r => r.date === selectedDate).length} học sinh</strong>
                  </span>
                  <button
                    onClick={() => { setTab('registrations') }}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    Xem danh sách →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
                <div className="text-4xl mb-2">🍽️</div>
                <p>Chưa có thực đơn cho ngày này</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: REGISTRATIONS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'registrations' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">📝 Danh sách đăng ký ăn</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                + Thêm đăng ký
              </button>
            </div>

            {/* Date + search */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="flex gap-2">
                {WEEK_DATES.map(date => {
                  const d = new Date(date)
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: date === selectedDate ? '2px solid #f97316' : '2px solid #e5e7eb',
                        background: date === selectedDate ? '#fff7ed' : '#fff',
                        color: date === selectedDate ? '#f97316' : '#374151',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {d.getDate()}/{d.getMonth() + 1}
                    </button>
                  )
                })}
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm học sinh…"
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm flex-1 min-w-[160px]"
                style={{ outline: 'none' }}
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredRegs.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <div className="text-3xl mb-2">🍱</div>
                  <p>Không có đăng ký nào cho ngày này</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa' }}>
                      {['Học sinh', 'Mã HS', 'Lớp', 'Ngày', 'Tiền ăn', 'Trạng thái', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-bold text-orange-700 text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRegs.map(reg => (
                      <tr key={reg.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{reg.studentName}</td>
                        <td className="px-4 py-3 text-gray-500">{reg.studentId}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">{reg.class}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(reg.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 font-bold text-orange-600">{fmt(reg.amount)}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: reg.paid ? '#dcfce7' : '#fef9c3',
                              color: reg.paid ? '#166534' : '#854d0e',
                            }}
                          >
                            {reg.paid ? '✅ Đã thu' : '⏳ Chưa thu'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => togglePaid(reg.id)}
                              className="text-xs font-bold px-2 py-1 rounded-lg border transition"
                              style={{
                                borderColor: reg.paid ? '#fca5a5' : '#86efac',
                                color: reg.paid ? '#dc2626' : '#16a34a',
                              }}
                            >
                              {reg.paid ? 'Hoàn tiền' : 'Thu tiền'}
                            </button>
                            <button
                              onClick={() => removeRegistration(reg.id)}
                              className="text-xs text-gray-400 hover:text-red-500 px-1"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md mx-4">
                  <h3 className="text-lg font-black text-gray-900 mb-5">➕ Thêm đăng ký ăn</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Tên học sinh *', key: 'studentName', placeholder: 'Nguyễn Văn A' },
                      { label: 'Mã học sinh *', key: 'studentId', placeholder: 'HS001' },
                      { label: 'Lớp', key: 'class', placeholder: '6A1' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{f.label}</label>
                        <input
                          value={newReg[f.key as keyof typeof newReg]}
                          onChange={e => setNewReg(prev => ({ ...prev, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                          style={{ outline: 'none' }}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Ngày ăn</label>
                      <select
                        value={newReg.date}
                        onChange={e => setNewReg(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                        style={{ outline: 'none' }}
                      >
                        {WEEK_DATES.map(d => (
                          <option key={d} value={d}>{new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={addRegistration}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: PAYMENT */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'payment' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4">💳 Thu tiền ăn</h2>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: '💰', label: 'Đã thu', val: fmt(stats.revenue), color: '#059669', bg: '#dcfce7' },
                { icon: '⏳', label: 'Chưa thu', val: fmt(stats.pending), color: '#d97706', bg: '#fef9c3' },
                { icon: '📊', label: 'Tổng suất ăn', val: `${stats.total} suất`, color: '#2563eb', bg: '#dbeafe' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: c.bg }}>
                    {c.icon}
                  </div>
                  <div className="text-2xl font-black" style={{ color: c.color }}>{c.val}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Unpaid list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">⏳ Danh sách chưa thanh toán ({stats.unpaid})</h3>
              </div>
              {registrations.filter(r => !r.paid).length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="font-semibold">Tất cả đã thanh toán!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {registrations.filter(r => !r.paid).map(reg => (
                    <div key={reg.id} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{reg.studentName}</div>
                        <div className="text-xs text-gray-500">{reg.studentId} · {reg.class} · {new Date(reg.date).toLocaleDateString('vi-VN')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-orange-600">{fmt(reg.amount)}</span>
                        <button
                          onClick={() => togglePaid(reg.id)}
                          className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                        >
                          Thu tiền ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: REPORTS */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'reports' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4">📊 Báo cáo căng tin</h2>

            {/* Weekly table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Thống kê theo ngày trong tuần</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa' }}>
                    {['Ngày', 'Món chính', 'Số suất', 'Doanh thu'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-bold text-orange-700 text-xs uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dailyReport.map(row => (
                    <tr key={row.date} className="hover:bg-orange-50/20">
                      <td className="px-4 py-3 font-semibold">
                        {new Date(row.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px] truncate">{row.menuName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-bold text-xs">
                          {row.count} suất
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-orange-600">{fmt(row.revenue)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#fff7ed', borderTop: '2px solid #fed7aa' }}>
                    <td className="px-4 py-3 font-black text-orange-700" colSpan={2}>Tổng tuần</td>
                    <td className="px-4 py-3 font-black text-orange-700">{stats.total} suất</td>
                    <td className="px-4 py-3 font-black text-orange-700">{fmt(stats.revenue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chart placeholder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">📈 Doanh thu theo ngày</h3>
              <div className="flex items-end gap-3 h-32">
                {dailyReport.map(row => {
                  const maxRev = Math.max(...dailyReport.map(r => r.revenue), 1)
                  const heightPct = Math.round((row.revenue / maxRev) * 100)
                  const d = new Date(row.date)
                  return (
                    <div key={row.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs font-bold text-orange-600 whitespace-nowrap">
                        {row.revenue > 0 ? `${Math.round(row.revenue / 1000)}K` : '—'}
                      </div>
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${Math.max(heightPct, 4)}%`,
                          background: 'linear-gradient(180deg, #f97316, #ea580c)',
                          minHeight: 4,
                        }}
                      />
                      <div className="text-xs text-gray-500">{DAYS_OF_WEEK[d.getDay()]}</div>
                    </div>
                  )
                })}
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
    </div>
  )
}
