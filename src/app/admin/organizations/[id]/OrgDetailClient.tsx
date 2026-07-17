'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AddCampusModal from './AddCampusModal'

interface Campus {
  id: string
  name: string
  code: string | null
  address: string | null
  phone: string | null
  email: string | null
  isActive: boolean
  _count: { campusUsers: number }
}

interface OrgUser {
  id: string
  orgRole: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    phone: string | null
    role: string
    avatar: string | null
  }
}

interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

interface Org {
  id: string
  name: string
  slug: string
  logo: string | null
  type: string
  isActive: boolean
  modules: string[] | null
  domain: string | null
  createdAt: string
  campuses: Campus[]
  _count: { organizationUsers: number; courses: number; campuses: number }
}

interface Props {
  org: Org
  orgUsers: OrgUser[]
  academicYears: AcademicYear[]
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-cherry-100 text-cherry-700',
  MEMBER: 'bg-slate-100 text-slate-600',
}

const TYPE_LABELS: Record<string, string> = {
  SCHOOL: 'Trường học',
  CENTER: 'Trung tâm',
  CHAIN: 'Chuỗi',
}

type Tab = 'campuses' | 'users' | 'courses' | 'settings'

export default function OrgDetailClient({ org, orgUsers, academicYears }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('campuses')
  const [showAddCampus, setShowAddCampus] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const [deactivatingCampus, setDeactivatingCampus] = useState<string | null>(null)

  const TABS: { key: Tab; label: string }[] = [
    { key: 'campuses', label: '🏫 Cơ sở' },
    { key: 'users', label: '👥 Thành viên' },
    { key: 'courses', label: '📚 Khóa học' },
    { key: 'settings', label: '⚙️ Cài đặt' },
  ]

  const modules: string[] = Array.isArray(org.modules) ? (org.modules as string[]) : []

  const filteredUsers = orgUsers.filter((ou) => {
    const q = search.toLowerCase()
    return (
      !q ||
      (ou.user.name ?? '').toLowerCase().includes(q) ||
      (ou.user.phone ?? '').includes(q)
    )
  })

  async function handleDeactivateCampus(campusId: string) {
    if (!confirm('Vô hiệu hóa cơ sở này?')) return
    setDeactivatingCampus(campusId)
    try {
      await fetch(`/api/admin/organizations/${org.id}/campuses/${campusId}`, {
        method: 'DELETE',
      })
      window.location.reload()
    } finally {
      setDeactivatingCampus(null)
    }
  }

  async function handleEnterCampus(campusId: string) {
    const res = await fetch('/api/auth/switch-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: org.id }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error ?? 'Không thể chuyển sang org này')
      return
    }
    // Navigate to campus-scoped analytics
    router.push(`/admin/organizations/${org.id}/campuses/${campusId}`)
  }

  return (
    <>
      {showAddCampus && (
        <AddCampusModal orgId={org.id} onClose={() => setShowAddCampus(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${
                    activeTab === tab.key
                      ? 'text-cherry-700 border-b-2 border-cherry-600 bg-cherry-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Campuses Tab */}
              {activeTab === 'campuses' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{org.campuses.length} cơ sở</p>
                    <button
                      onClick={() => setShowAddCampus(true)}
                      className="text-sm font-bold px-3 py-1.5 rounded-xl text-white shadow-sm hover:scale-[1.02] transition-transform"
                      style={{ background: 'linear-gradient(135deg, #951F3D, #2563eb)' }}
                    >
                      + Thêm Cơ sở
                    </button>
                  </div>
                  {org.campuses.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <div className="text-4xl mb-2">🏫</div>
                      <p className="text-sm">Chưa có cơ sở nào</p>
                    </div>
                  ) : (
                    org.campuses.map((campus) => (
                      <div
                        key={campus.id}
                        className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900">{campus.name}</span>
                              {campus.code && (
                                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                  {campus.code}
                                </span>
                              )}
                              {!campus.isActive && (
                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                  Đã tắt
                                </span>
                              )}
                            </div>
                            {campus.address && (
                              <p className="text-xs text-gray-400 mt-0.5">📍 {campus.address}</p>
                            )}
                            {campus.phone && (
                              <p className="text-xs text-gray-400">📞 {campus.phone}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              👥 {campus._count.campusUsers} thành viên
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                            {/* View campus analytics */}
                            <Link
                              href={`/admin/organizations/${org.id}/campuses/${campus.id}`}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Xem analytics cơ sở"
                            >
                              📊 Analytics
                            </Link>

                            {/* Set campus principal */}
                            <Link
                              href={`/admin/organizations/${org.id}/campuses/${campus.id}?tab=principal`}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg border border-cherry-200 text-cherry-600 hover:bg-cherry-50 transition-colors"
                              title="Thiết lập hiệu trưởng / người phụ trách"
                            >
                              👤 Hiệu trưởng
                            </Link>

                            {/* Enter campus scope */}
                            {campus.isActive && (
                              <button
                                onClick={() => handleEnterCampus(campus.id)}
                                className="text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Đăng nhập vào campus này"
                              >
                                🔑 Vào campus
                              </button>
                            )}

                            {/* Edit */}
                            <Link
                              href={`/admin/organizations/${org.id}/campuses/${campus.id}`}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              ✏️ Sửa
                            </Link>

                            {/* Deactivate */}
                            {campus.isActive && (
                              <button
                                onClick={() => handleDeactivateCampus(campus.id)}
                                disabled={deactivatingCampus === campus.id}
                                className="text-xs font-bold px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {deactivatingCampus === campus.id ? '...' : '🚫 Vô hiệu'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="🔍 Tìm theo tên, số điện thoại..."
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-400"
                    />
                  </div>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">Không có thành viên nào</div>
                  ) : (
                    filteredUsers.map((ou) => (
                      <div key={ou.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cherry-400 to-cherry-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                          {(ou.user.name ?? '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{ou.user.name ?? 'Chưa đặt tên'}</p>
                          {ou.user.phone && (
                            <p className="text-xs text-gray-400">{ou.user.phone}</p>
                          )}
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[ou.orgRole] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ou.orgRole}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div className="text-center py-10 space-y-3">
                  <div className="text-5xl">📚</div>
                  <p className="font-black text-3xl text-gray-900">{org._count.courses}</p>
                  <p className="text-gray-500 text-sm">khóa học thuộc tổ chức này</p>
                  <Link
                    href={`/admin/courses?orgId=${org.id}`}
                    className="inline-block text-sm font-bold px-4 py-2 rounded-xl text-white mt-2 shadow"
                    style={{ background: 'linear-gradient(135deg, #951F3D, #2563eb)' }}
                  >
                    Xem tất cả khóa học →
                  </Link>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-black text-sm text-gray-700">Thông tin tổ chức</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-semibold">Slug:</span> {org.slug}</p>
                      <p><span className="font-semibold">Domain:</span> {org.domain ?? 'Chưa cấu hình'}</p>
                      <p><span className="font-semibold">Loại:</span> {TYPE_LABELS[org.type] ?? org.type}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-black text-sm text-gray-700">Module đang bật</h3>
                    <div className="flex flex-wrap gap-2">
                      {modules.length === 0 ? (
                        <p className="text-sm text-gray-400">Chưa bật module nào</p>
                      ) : (
                        modules.map((m) => (
                          <span key={m} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cherry-100 text-cherry-700">
                            {m}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="border border-red-100 rounded-xl p-4 space-y-2">
                    <h3 className="font-black text-sm text-red-700">⚠️ Danger Zone</h3>
                    <p className="text-xs text-gray-500">Xóa tổ chức sẽ ẩn toàn bộ dữ liệu liên quan.</p>
                    <button
                      onClick={async () => {
                        if (!confirm('Xác nhận xóa tổ chức này?')) return
                        await fetch(`/api/admin/organizations/${org.id}`, { method: 'DELETE' })
                        window.location.href = '/admin/organizations'
                      }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      🗑️ Xóa tổ chức
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-4">
          {/* Org info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="font-black text-gray-900">Thông tin</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Loại:</span>
                <span className="font-semibold">{TYPE_LABELS[org.type] ?? org.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trạng thái:</span>
                <span className={`font-semibold ${org.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {org.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ngày tạo:</span>
                <span className="font-semibold">{new Date(org.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="font-black text-gray-900">Thống kê</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Cơ sở', value: org._count.campuses, icon: '🏫' },
                { label: 'Thành viên', value: org._count.organizationUsers, icon: '👥' },
                { label: 'Khóa học', value: org._count.courses, icon: '📚' },
                { label: 'Module', value: modules.length, icon: '⚙️' },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-xl">{s.icon}</div>
                  <div className="font-black text-xl text-gray-900 mt-0.5">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Years */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900">Năm học</h3>
            </div>
            {academicYears.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có năm học</p>
            ) : (
              <div className="space-y-2">
                {academicYears.map((ay) => (
                  <div key={ay.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{ay.name}</span>
                    {ay.isCurrent && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Hiện tại
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
