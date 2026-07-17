'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Save, Loader2, RefreshCw } from 'lucide-react'

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'

interface TuitionPayment {
  id: string
  amount: number
  isFree: boolean
  isPaid: boolean
  paidAt: string | null
  note: string | null
  enrollment: {
    pausedAt: string | null
    resumedAt: string | null
    user: { id: string; name: string | null; phone: string; email: string | null }
  }
}

interface TuitionCollectionDetail {
  id: string
  title: string
  sessions: number
  unitAmount: number
  totalAmount: number
  note: string | null
  createdAt: string
  payments: TuitionPayment[]
}

interface CollectionSummary {
  id: string
  title: string
  sessions: number
  unitAmount: number
  totalAmount: number
  note: string | null
  createdAt: string
  totalStudents: number
  paidCount: number
  freeCount: number
  unpaidCount: number
  collectedAmount: number
  pendingAmount: number
}

interface Course {
  id: string
  name: string
  price: number | null
  pricePerSession: number | null
  paymentType: 'PER_COURSE' | 'PER_SESSION'
}

export default function TuitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [loading, setLoading] = useState(true)

  // Expanded state per collection
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedData, setExpandedData] = useState<Record<string, TuitionCollectionDetail>>({})
  const [expandedLoading, setExpandedLoading] = useState<string | null>(null)

  // Edited rows per collection: colId → paymentId → partial TuitionPayment
  const [edits, setEdits] = useState<Record<string, Record<string, Partial<TuitionPayment>>>>({})
  const [saving, setSaving] = useState<string | null>(null)

  // Create modal
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', sessions: '', amount: '' })
  const [creating, setCreating] = useState(false)

  const loadList = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/courses/${id}/tuition`)
    const data = await res.json()
    if (data.success) {
      setCourse(data.data.course)
      const cols: CollectionSummary[] = data.data.collections
      setCollections(cols)
      // PER_COURSE: auto-expand the single collection
      if (data.data.course?.paymentType === 'PER_COURSE' && cols.length > 0) {
        setExpandedId(cols[0].id)
      }
    }
    setLoading(false)
  }, [id])

  useEffect(() => { loadList() }, [loadList])

  const toggleExpand = async (colId: string) => {
    if (expandedId === colId) { setExpandedId(null); return }
    setExpandedId(colId)
    if (expandedData[colId]) return
    setExpandedLoading(colId)
    const res = await fetch(`/api/admin/courses/${id}/tuition/${colId}`)
    const data = await res.json()
    if (data.success) setExpandedData(prev => ({ ...prev, [colId]: data.data }))
    setExpandedLoading(null)
  }

  const handleEdit = (colId: string, payId: string, field: string, value: any) => {
    setEdits(prev => ({
      ...prev,
      [colId]: {
        ...(prev[colId] ?? {}),
        [payId]: {
          ...(prev[colId]?.[payId] ?? {}),
          [field]: value,
        },
      },
    }))
  }

  const handleSave = async (colId: string) => {
    const colEdits = edits[colId]
    if (!colEdits || Object.keys(colEdits).length === 0) return
    setSaving(colId)
    const col = expandedData[colId]
    const payments = Object.entries(colEdits).map(([payId, changes]) => {
      const original = col?.payments.find(p => p.id === payId)
      return { id: payId, ...original, ...changes }
    })
    await fetch(`/api/admin/courses/${id}/tuition/${colId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payments }),
    })
    // Reload expanded data
    const res = await fetch(`/api/admin/courses/${id}/tuition/${colId}`)
    const data = await res.json()
    if (data.success) setExpandedData(prev => ({ ...prev, [colId]: data.data }))
    setEdits(prev => { const n = { ...prev }; delete n[colId]; return n })
    setSaving(null)
    loadList()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const payload: Record<string, unknown> = { title: form.title }
    if (course?.paymentType === 'PER_COURSE') {
      payload.amount = Number(form.amount) || course?.price || 0
    } else {
      payload.sessions = Number(form.sessions)
    }
    const res = await fetch(`/api/admin/courses/${id}/tuition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setCreating(false)
    if (data.success) {
      setShowModal(false)
      setForm({ title: '', sessions: '', amount: '' })
      loadList()
    } else {
      alert(data.error ?? 'Có lỗi xảy ra')
    }
  }

  const pricePerSession = course?.pricePerSession ?? 0
  const previewAmount = form.sessions ? pricePerSession * Number(form.sessions) : 0
  const isPERCOURSE = course?.paymentType === 'PER_COURSE'
  const perCourseAmount = form.amount ? Number(form.amount) : (course?.price ?? 0)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
      <div className="max-w-5xl mx-auto">
        <Link href={`/admin/courses/${id}`} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Chi tiết khoá học
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">💰 Thu học phí</h1>
            {course && <p className="text-gray-500 text-sm mt-0.5">{course.name}</p>}
          </div>
          {isPERCOURSE ? (
            // PER_COURSE: refresh button to sync latest enrollment list
            <button
              onClick={loadList}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl transition text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Làm mới danh sách
            </button>
          ) : (
            // PER_SESSION: original create button
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-cherry-600 hover:bg-cherry-700 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm"
            >
              <Plus className="w-4 h-4" /> Tạo đợt thu mới
            </button>
          )}
        </div>

        {/* Collections list */}
        {collections.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
            <div className="text-5xl mb-3">💸</div>
            <p>Chưa có đợt thu nào. Tạo đợt thu đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map(col => {
              const isExpanded = expandedId === col.id
              const isLoading = expandedLoading === col.id
              const detail = expandedData[col.id]
              const colEdits = edits[col.id] ?? {}
              const hasEdits = Object.keys(colEdits).length > 0

              return (
                <div key={col.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header row */}
                  <button
                    onClick={() => toggleExpand(col.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900">{col.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {col.sessions === 0
                          ? `Học phí khoá học · ${fmt(col.totalAmount)}/HS`
                          : `${col.sessions} buổi · ${fmt(col.unitAmount)}/buổi · ${fmt(col.totalAmount)}/HS`}
                        {' · '}{new Date(col.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-sm">
                      <span className="text-teal-600 font-bold">{col.paidCount} đã đóng</span>
                      <span className="text-orange-500 font-bold">{col.unpaidCount} chưa</span>
                      {col.freeCount > 0 && <span className="text-gray-400">{col.freeCount} miễn phí</span>}
                      <span className="text-cherry-700 font-black">{fmt(col.collectedAmount)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-gray-400">
                          <Loader2 className="animate-spin mr-2" size={20} /> Đang tải...
                        </div>
                      ) : detail ? (
                        <div className="p-5">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs">
                                  <th className="text-left pb-3 pr-3 font-medium">STT</th>
                                  <th className="text-left pb-3 pr-3 font-medium min-w-[140px]">Họ tên</th>
                                  <th className="text-left pb-3 pr-3 font-medium">SĐT</th>
                                  <th className="text-left pb-3 pr-3 font-medium min-w-[110px]">Số tiền</th>
                                  <th className="text-center pb-3 pr-3 font-medium">Miễn phí</th>
                                  <th className="text-center pb-3 pr-3 font-medium">Đã đóng</th>
                                  <th className="text-left pb-3 pr-3 font-medium min-w-[100px]">Ngày đóng</th>
                                  <th className="text-left pb-3 font-medium min-w-[130px]">Ghi chú</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {detail.payments.map((pay, idx) => {
                                  const edited = colEdits[pay.id] ?? {}
                                  const current = { ...pay, ...edited }
                                  return (
                                    <tr key={pay.id} className={current.isPaid ? 'bg-teal-50/40' : current.isFree ? 'bg-blue-50/30' : ''}>
                                      <td className="py-2.5 pr-3 text-gray-400">{idx + 1}</td>
                                      <td className="py-2.5 pr-3 font-medium text-gray-800">
                                        <span>{pay.enrollment.user.name ?? 'N/A'}</span>
                                        {pay.enrollment.pausedAt && !pay.enrollment.resumedAt && (
                                          <span className="ml-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">PAUSED</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 pr-3 text-gray-500">{pay.enrollment.user.phone}</td>
                                      <td className="py-2.5 pr-3">
                                        <input
                                          type="number"
                                          value={current.amount}
                                          onChange={e => handleEdit(col.id, pay.id, 'amount', Number(e.target.value))}
                                          className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300"
                                        />
                                      </td>
                                      <td className="py-2.5 pr-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={current.isFree}
                                          onChange={e => handleEdit(col.id, pay.id, 'isFree', e.target.checked)}
                                          className="w-4 h-4 accent-blue-500"
                                        />
                                      </td>
                                      <td className="py-2.5 pr-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={current.isPaid}
                                          onChange={e => handleEdit(col.id, pay.id, 'isPaid', e.target.checked)}
                                          className="w-4 h-4 accent-teal-500"
                                        />
                                      </td>
                                      <td className="py-2.5 pr-3 text-gray-400 text-xs">
                                        {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString('vi-VN') : '—'}
                                      </td>
                                      <td className="py-2.5">
                                        <input
                                          type="text"
                                          value={current.note ?? ''}
                                          onChange={e => handleEdit(col.id, pay.id, 'note', e.target.value)}
                                          placeholder="Ghi chú..."
                                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-300"
                                        />
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {detail.payments.length} học viên
                              · Đã thu: <span className="font-bold text-teal-600">
                                {fmt(detail.payments.filter(p => p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0))}
                              </span>
                              · Còn thiếu: <span className="font-bold text-orange-500">
                                {fmt(detail.payments.filter(p => !p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0))}
                              </span>
                            </div>
                            <button
                              onClick={() => handleSave(col.id)}
                              disabled={!hasEdits || saving === col.id}
                              className="flex items-center gap-2 bg-cherry-600 hover:bg-cherry-700 text-white font-bold px-4 py-2 rounded-xl transition disabled:opacity-40 text-sm"
                            >
                              {saving === col.id
                                ? <><Loader2 className="animate-spin" size={15} /> Đang lưu...</>
                                : <><Save size={15} /> Lưu thay đổi</>}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-gray-400 text-sm">Không tải được dữ liệu</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-gray-900 mb-5">📋 Tạo đợt thu mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên đợt thu</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Thu học phí tháng 3/2026"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cherry-400 text-sm"
                />
              </div>
              {isPERCOURSE ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Học phí (mỗi học viên)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder={String(course?.price ?? 0)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cherry-400 text-sm"
                    />
                  </div>
                  <div className="bg-cherry-50 rounded-xl px-4 py-3 text-sm">
                    <p className="text-cherry-700 font-semibold">
                      💰 Học phí: <span className="font-black text-cherry-900">{fmt(perCourseAmount)}</span>/HS
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Số buổi thu</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.sessions}
                      onChange={e => setForm(f => ({ ...f, sessions: e.target.value }))}
                      placeholder="8"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cherry-400 text-sm"
                    />
                  </div>
                  {form.sessions && pricePerSession > 0 && (
                    <div className="bg-cherry-50 rounded-xl px-4 py-3 text-sm">
                      <p className="text-cherry-700 font-semibold">
                        💰 Số tiền mỗi HS: <span className="font-black text-cherry-900">{fmt(previewAmount)}</span>
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{form.sessions} buổi × {fmt(pricePerSession)}/buổi</p>
                    </div>
                  )}
                  {pricePerSession === 0 && (
                    <p className="text-amber-600 text-xs">⚠️ Khoá học chưa cài giá/buổi — số tiền sẽ là 0đ. Hãy cập nhật trong trang chi tiết khoá học.</p>
                  )}
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating}
                  className="flex-1 bg-cherry-600 hover:bg-cherry-700 text-white font-black py-3 rounded-2xl transition disabled:opacity-50">
                  {creating ? 'Đang tạo...' : '✅ Tạo đợt thu'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-50 transition">
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
