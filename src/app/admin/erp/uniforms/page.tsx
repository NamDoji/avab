'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UniformItem {
  id: string
  name: string
  code: string | null
  type: string
  color: string | null
  sizes: string[]
  pricePerUnit: number
  stock: number
  isActive: boolean
  _count: { orders: number }
}

interface UniformOrder {
  id: string
  size: string
  quantity: number
  totalPrice: number
  status: string
  isPaid: boolean
  note: string | null
  orderedAt: string
  deliveredAt: string | null
  uniformItem: { name: string; code: string | null; type: string }
  user: { id: string; name: string | null; phone: string }
}

interface CreateItemForm {
  organizationId: string
  name: string
  code: string
  type: string
  color: string
  sizes: string
  pricePerUnit: number
  stock: number
}

const EMPTY_ITEM_FORM: Omit<CreateItemForm, 'organizationId'> = {
  name: '',
  code: '',
  type: 'SHIRT',
  color: '',
  sizes: 'S,M,L,XL,XXL',
  pricePerUnit: 0,
  stock: 0,
}

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  SHIRT: { label: 'Áo', icon: '👕' },
  PANT: { label: 'Quần', icon: '👖' },
  HAT: { label: 'Mũ', icon: '🧢' },
  SHOES: { label: 'Giày', icon: '👟' },
  SET: { label: 'Bộ', icon: '🎽' },
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'Chờ duyệt', bg: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { label: 'Đã xác nhận', bg: '#dbeafe', color: '#1d4ed8' },
  DELIVERED: { label: 'Đã giao', bg: '#dcfce7', color: '#166534' },
  CANCELLED: { label: 'Huỷ', bg: '#fee2e2', color: '#dc2626' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UniformsPage() {
  const [tab, setTab] = useState<'items' | 'orders'>('items')
  const [items, setItems] = useState<UniformItem[]>([])
  const [orders, setOrders] = useState<UniformOrder[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_ITEM_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchItems = useCallback(async () => {
    setLoadingItems(true)
    const res = await fetch('/api/admin/erp/uniforms')
    if (res.ok) setItems(await res.json())
    setLoadingItems(false)
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch('/api/admin/erp/uniforms/orders?' + params.toString())
    if (res.ok) setOrders(await res.json())
    setLoadingOrders(false)
  }, [statusFilter])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const sizesArr = form.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    const res = await fetch('/api/admin/erp/uniforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        sizes: sizesArr,
        pricePerUnit: Number(form.pricePerUnit),
        stock: Number(form.stock),
      }),
    })
    if (res.ok) {
      setShowModal(false)
      setForm(EMPTY_ITEM_FORM)
      fetchItems()
    } else {
      setError('Lỗi khi tạo sản phẩm. Vui lòng thử lại.')
    }
    setSaving(false)
  }

  function exportCSV() {
    const header = ['Học sinh', 'SĐT', 'Sản phẩm', 'Loại', 'Size', 'SL', 'Tổng tiền', 'Trạng thái', 'Thanh toán', 'Ngày đặt']
    const rows = orders.map((o) => [
      o.user.name ?? '',
      o.user.phone,
      o.uniformItem.name,
      o.uniformItem.type,
      o.size,
      o.quantity,
      o.totalPrice,
      STATUS_STYLES[o.status]?.label ?? o.status,
      o.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
      new Date(o.orderedAt).toLocaleDateString('vi-VN'),
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `don-hang-dong-phuc-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-purple-100 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Đồng phục</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-1">👕 Đồng phục</h1>
              <p className="text-purple-100 text-sm">Quản lý danh mục & đơn hàng đồng phục học sinh</p>
            </div>
            {tab === 'items' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                + Thêm sản phẩm
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 mt-5">
            <div>
              <div className="text-3xl font-black">{items.length}</div>
              <div className="text-xs text-purple-100">Sản phẩm</div>
            </div>
            <div>
              <div className="text-3xl font-black text-yellow-200">{orders.length}</div>
              <div className="text-xs text-purple-100">Đơn hàng</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-200">
                {orders.filter((o) => o.isPaid).length}
              </div>
              <div className="text-xs text-purple-100">Đã thanh toán</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <div className="container-custom py-6 space-y-5">
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm w-fit">
          {(['items', 'orders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={
                tab === t
                  ? { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white' }
                  : { color: '#6b7280' }
              }
            >
              {t === 'items' ? '📦 Danh mục' : '📋 Đơn hàng'}
            </button>
          ))}
        </div>

        {/* ─── Items Tab ──────────────────────────────────────────────── */}
        {tab === 'items' && (
          <>
            {loadingItems ? (
              <div className="flex justify-center py-20">
                <div className="text-gray-400 text-sm animate-pulse">Đang tải...</div>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="text-5xl mb-3">👕</div>
                <p className="text-gray-500 font-semibold text-lg">Chưa có sản phẩm nào</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
                >
                  + Thêm sản phẩm đầu tiên
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Tên sản phẩm</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Loại</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Màu</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Sizes</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Giá</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Tồn kho</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Số đơn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const typeMeta = TYPE_LABELS[item.type] ?? { label: item.type, icon: '📦' }
                        return (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{item.name}</div>
                              {item.code && <div className="text-xs text-gray-400 font-mono">{item.code}</div>}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-base">{typeMeta.icon}</span>
                              <span className="ml-1 text-xs text-gray-600">{typeMeta.label}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-sm">
                              {item.color ?? <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {(item.sizes as string[]).map((s) => (
                                  <span key={s} className="text-xs bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded-md">{s}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-semibold">
                              {item.pricePerUnit > 0
                                ? item.pricePerUnit.toLocaleString('vi-VN') + ' ₫'
                                : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${item.stock <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                                {item.stock}
                              </span>
                              {item.stock <= 5 && item.stock > 0 && (
                                <span className="ml-1 text-xs text-red-500">Sắp hết</span>
                              )}
                              {item.stock === 0 && (
                                <span className="ml-1 text-xs text-red-500 font-bold">Hết hàng</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-purple-700">{item._count.orders}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── Orders Tab ─────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(STATUS_STYLES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <button
                onClick={exportCSV}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                📥 Export CSV
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex justify-center py-20">
                <div className="text-gray-400 text-sm animate-pulse">Đang tải...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-500 font-semibold text-lg">Chưa có đơn hàng nào</p>
                <p className="text-gray-400 text-sm mt-1">Đơn hàng đồng phục sẽ xuất hiện ở đây</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Học sinh</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Sản phẩm</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Size</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">SL</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Tổng tiền</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Trạng thái</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Thanh toán</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Ngày đặt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusMeta = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{order.user.name ?? '—'}</div>
                              <div className="text-xs text-gray-400">{order.user.phone}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-800">{order.uniformItem.name}</div>
                              {order.uniformItem.code && (
                                <div className="text-xs text-gray-400 font-mono">{order.uniformItem.code}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md">{order.size}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-800">{order.quantity}</td>
                            <td className="px-4 py-3 font-semibold text-gray-700">
                              {order.totalPrice > 0
                                ? order.totalPrice.toLocaleString('vi-VN') + ' ₫'
                                : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                style={{ background: statusMeta.bg, color: statusMeta.color }}
                              >
                                {statusMeta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {order.isPaid ? (
                                <span className="text-xs font-bold text-green-600">✓ Đã TT</span>
                              ) : (
                                <span className="text-xs text-gray-400">Chưa TT</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {new Date(order.orderedAt).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-2">
          <Link href="/admin/erp" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Quay về School ERP
          </Link>
        </div>
      </div>

      {/* ─── Create Item Modal ────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div
              className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
            >
              <h2 className="text-lg font-black">👕 Thêm sản phẩm đồng phục</h2>
              <button onClick={() => setShowModal(false)} className="text-purple-100 hover:text-white text-xl font-bold leading-none">✕</button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tên sản phẩm *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Áo đồng phục mùa hè"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Mã SP</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="DP-001"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Loại</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Màu sắc</label>
                  <input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="Trắng, Xanh navy..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Sizes (phân cách bằng dấu phẩy)</label>
                  <input
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    placeholder="S,M,L,XL,XXL"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Giá/cái (₫)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.pricePerUnit}
                    onChange={(e) => setForm({ ...form, pricePerUnit: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
                >
                  {saving ? 'Đang lưu...' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
