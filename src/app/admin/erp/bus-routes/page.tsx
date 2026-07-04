'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusRoute {
  id: string
  name: string
  code: string | null
  description: string | null
  driverName: string | null
  driverPhone: string | null
  vehicleNumber: string | null
  capacity: number
  feePerMonth: number
  isActive: boolean
  _count: { assignments: number }
}

interface CreateForm {
  organizationId: string
  name: string
  code: string
  description: string
  driverName: string
  driverPhone: string
  vehicleNumber: string
  capacity: number
  feePerMonth: number
}

const EMPTY_FORM: Omit<CreateForm, 'organizationId'> = {
  name: '',
  code: '',
  description: '',
  driverName: '',
  driverPhone: '',
  vehicleNumber: '',
  capacity: 45,
  feePerMonth: 0,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BusRoutesPage() {
  const [routes, setRoutes] = useState<BusRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchRoutes = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/erp/bus-routes')
    if (res.ok) setRoutes(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchRoutes() }, [fetchRoutes])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/erp/bus-routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, feePerMonth: Number(form.feePerMonth), capacity: Number(form.capacity) }),
    })
    if (res.ok) {
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchRoutes()
    } else {
      setError('Lỗi khi tạo tuyến mới. Vui lòng thử lại.')
    }
    setSaving(false)
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Ẩn tuyến này?')) return
    await fetch(`/api/admin/erp/bus-routes/${id}`, { method: 'DELETE' })
    fetchRoutes()
  }

  const totalStudents = routes.reduce((s, r) => s + r._count.assignments, 0)
  const totalFee = routes.reduce((s, r) => s + r.feePerMonth * r._count.assignments, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─────────────────────────────────────────────────── */}
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
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Xe tuyến</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-1">🚌 Xe tuyến</h1>
              <p className="text-orange-100 text-sm">Quản lý xe đưa đón học sinh theo tuyến</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              + Thêm tuyến mới
            </button>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 mt-5">
            <div>
              <div className="text-3xl font-black">{routes.length}</div>
              <div className="text-xs text-orange-100">Tổng tuyến</div>
            </div>
            <div>
              <div className="text-3xl font-black text-yellow-200">{totalStudents}</div>
              <div className="text-xs text-orange-100">HS đăng ký</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-200">
                {totalFee > 0 ? (totalFee / 1_000_000).toFixed(1) + ' tr' : '0'}
              </div>
              <div className="text-xs text-orange-100">Tổng thu/tháng</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <div className="container-custom py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-gray-400 text-sm animate-pulse">Đang tải...</div>
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-3">🚌</div>
            <p className="text-gray-500 font-semibold text-lg">Chưa có tuyến xe nào</p>
            <p className="text-gray-400 text-sm mt-1">Thêm tuyến xe để quản lý xe đưa đón học sinh</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              + Thêm tuyến đầu tiên
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Tên tuyến</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Mã</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Tài xế</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">SĐT</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Biển số</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Sĩ số / Sức chứa</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Phí/tháng</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{route.name}</div>
                        {route.description && (
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">{route.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {route.code ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {route.driverName ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {route.driverPhone ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {route.vehicleNumber ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-800">{route._count.assignments}</span>
                        <span className="text-gray-400 text-xs"> / {route.capacity}</span>
                        {route._count.assignments >= route.capacity && (
                          <span className="ml-1 text-xs text-red-500 font-bold">Đầy</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {route.feePerMonth > 0
                          ? route.feePerMonth.toLocaleString('vi-VN') + ' ₫'
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={
                            route.isActive
                              ? { background: '#dcfce7', color: '#166534' }
                              : { background: '#fee2e2', color: '#dc2626' }
                          }
                        >
                          {route.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeactivate(route.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                          >
                            Ẩn
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link href="/admin/erp" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Quay về School ERP
          </Link>
        </div>
      </div>

      {/* ─── Create Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div
              className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              <h2 className="text-lg font-black">🚌 Thêm tuyến xe mới</h2>
              <button onClick={() => setShowModal(false)} className="text-orange-100 hover:text-white text-xl font-bold leading-none">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tên tuyến *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Tuyến A - Hoàng Mai"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Mã tuyến</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="TA"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Biển số xe</label>
                  <input
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    placeholder="29A-12345"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tài xế</label>
                  <input
                    value={form.driverName}
                    onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">SĐT tài xế</label>
                  <input
                    value={form.driverPhone}
                    onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Sức chứa (HS)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Phí/tháng (₫)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.feePerMonth}
                    onChange={(e) => setForm({ ...form, feePerMonth: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Mô tả</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Thông tin thêm về tuyến xe..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
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
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  {saving ? 'Đang lưu...' : 'Tạo tuyến'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
