'use client'

import { useState } from 'react'
import { Voucher } from '@prisma/client'

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

function genCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function StatusBadge({ v }: { v: Voucher }) {
  const now = new Date()
  const expired = v.validTo && new Date(v.validTo) < now
  const notStarted = v.validFrom && new Date(v.validFrom) > now
  const maxed = v.maxUses !== null && v.usedCount >= v.maxUses

  if (!v.isActive || maxed) return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Vô hiệu</span>
  )
  if (expired) return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">Hết hạn</span>
  )
  if (notStarted) return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Chưa bắt đầu</span>
  )
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Đang hoạt động</span>
  )
}

interface Props {
  initialVouchers: Voucher[]
}

export default function VouchersClient({ initialVouchers }: Props) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validTo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/finance/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          code: form.code || genCode(),
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          validFrom: form.validFrom || null,
          validTo: form.validTo || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Lỗi tạo voucher')
      setVouchers([data.voucher, ...vouchers])
      setShowForm(false)
      setForm({ code: '', name: '', type: 'percent', value: '', minOrderAmount: '', maxUses: '', validFrom: '', validTo: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (v: Voucher) => {
    const res = await fetch(`/api/admin/finance/vouchers/${v.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !v.isActive }),
    })
    if (res.ok) {
      const { voucher } = await res.json()
      setVouchers(vouchers.map(x => x.id === voucher.id ? voucher : x))
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/finance/vouchers/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setVouchers(vouchers.filter(v => v.id !== id))
      setDeleteId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{vouchers.length} voucher trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition shadow-sm"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
        >
          {showForm ? '✕ Đóng' : '+ Tạo Voucher'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-black text-gray-900">Tạo voucher mới</h3>
          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Mã voucher</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono uppercase"
                  placeholder="Để trống = tự động tạo"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, code: genCode() })}
                  className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                >
                  🎲 Random
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Tên voucher *</label>
              <input
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="VD: Giảm 10% nhập học tháng 7"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Loại giảm giá *</label>
              <select
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}
              >
                <option value="percent">% Phần trăm</option>
                <option value="fixed">VNĐ Cố định</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Giá trị * {form.type === 'percent' ? '(%)' : '(VNĐ)'}
              </label>
              <input
                required
                type="number"
                min="0"
                max={form.type === 'percent' ? 100 : undefined}
                step="0.01"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder={form.type === 'percent' ? '10' : '500000'}
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Đơn hàng tối thiểu (VNĐ)</label>
              <input
                type="number"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Không giới hạn"
                value={form.minOrderAmount}
                onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Số lần dùng tối đa</label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Không giới hạn"
                value={form.maxUses}
                onChange={e => setForm({ ...form, maxUses: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={form.validFrom}
                onChange={e => setForm({ ...form, validFrom: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Ngày hết hạn</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={form.validTo}
                onChange={e => setForm({ ...form, validTo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
            >
              {loading ? 'Đang tạo...' : '✅ Tạo Voucher'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError('') }}
              className="px-6 py-2.5 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {vouchers.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">
            <p className="text-4xl mb-3">🎫</p>
            <p>Chưa có voucher nào. Tạo voucher đầu tiên!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 font-semibold uppercase tracking-wide bg-gray-50">
                  <th className="text-left px-6 py-3">Mã / Tên</th>
                  <th className="text-center px-4 py-3">Loại</th>
                  <th className="text-right px-4 py-3">Giá trị</th>
                  <th className="text-center px-4 py-3">Đã dùng / Tối đa</th>
                  <th className="text-center px-4 py-3">Hiệu lực</th>
                  <th className="text-center px-4 py-3">Trạng thái</th>
                  <th className="text-center px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-green-50/30 transition">
                    <td className="px-6 py-4">
                      <p className="font-mono font-black text-emerald-700 text-base">{v.code}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{v.name}</p>
                      {v.minOrderAmount && (
                        <p className="text-xs text-gray-400">Tối thiểu: {fmtVND(v.minOrderAmount)}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        v.type === 'percent'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {v.type === 'percent' ? '%' : 'VNĐ'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-gray-800">
                      {v.type === 'percent' ? `${v.value}%` : fmtVND(v.value)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-sm font-semibold ${
                        v.maxUses !== null && v.usedCount >= v.maxUses
                          ? 'text-red-600'
                          : 'text-gray-700'
                      }`}>
                        {v.usedCount} / {v.maxUses ?? '∞'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-gray-500">
                      {v.validFrom && (
                        <p>Từ: {new Date(v.validFrom).toLocaleDateString('vi-VN')}</p>
                      )}
                      {v.validTo && (
                        <p>Đến: {new Date(v.validTo).toLocaleDateString('vi-VN')}</p>
                      )}
                      {!v.validFrom && !v.validTo && <span className="text-gray-400">Không giới hạn</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge v={v} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleActive(v)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                            v.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {v.isActive ? 'Tắt' : 'Bật'}
                        </button>
                        {deleteId === v.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="text-xs font-bold px-2 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                            >
                              Xóa
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="text-xs font-bold px-2 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(v.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
