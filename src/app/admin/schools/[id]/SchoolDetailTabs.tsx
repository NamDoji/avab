'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'

// ── Types ────────────────────────────────────────────────────────────────────

interface SchoolSettings {
  id: string
  allowSelfRegister: boolean
  maxStudents: number | null
  features: Record<string, boolean> | null
  customCSS: string | null
}

interface SchoolData {
  id: string
  name: string
  slug: string
  logo: string | null
  domain: string | null
  primaryColor: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { schoolUsers: number; schoolCourses: number }
  settings: SchoolSettings | null
}

interface SchoolUserItem {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    phone: string
    email: string | null
    role: string
    avatar: string | null
    isActive: boolean
    createdAt: string
  }
}

interface CourseItem {
  id: string
  course: {
    id: string
    code: string
    name: string
    thumbnail: string | null
    subjectName: string | null
    subjectCode: string
    gradeMin: number | null
    gradeMax: number | null
    isActive: boolean
    approvalStatus: string
    createdAt: string
    _count: { enrollments: number; subjects: number }
  }
}

interface Props {
  school: SchoolData
  initialUsers: SchoolUserItem[]
  initialCourses: CourseItem[]
  defaultTab: string
}

const FEATURE_LABELS: Record<string, string> = {
  gamification: '🎮 Gamification',
  ai_studio:    '✨ AI Studio',
  publishing:   '📤 Publishing',
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SchoolDetailTabs({ school, initialUsers, initialCourses, defaultTab }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses'>(
    (defaultTab as 'overview' | 'users' | 'courses') ?? 'overview'
  )
  const [users, setUsers] = useState<SchoolUserItem[]>(initialUsers)
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [showCourseSelect, setShowCourseSelect] = useState(false)

  // Remove user
  async function handleRemoveUser(userId: string, userName: string) {
    if (!confirm(`Xóa "${userName || userId}" khỏi trường này?`)) return
    setRemovingUserId(userId)
    try {
      const res = await fetch(`/api/admin/schools/${school.id}/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json() as { success: boolean }
      if (data.success) {
        setUsers(prev => prev.filter(su => su.user.id !== userId))
      }
    } finally {
      setRemovingUserId(null)
    }
  }

  // Remove course
  async function handleRemoveCourse(courseId: string, courseName: string) {
    if (!confirm(`Xóa khóa học "${courseName}" khỏi trường này?`)) return
    setRemovingCourseId(courseId)
    try {
      const res = await fetch(`/api/admin/schools/${school.id}/courses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json() as { success: boolean }
      if (data.success) {
        setCourses(prev => prev.filter(sc => sc.course.id !== courseId))
      }
    } finally {
      setRemovingCourseId(null)
    }
  }

  function onUserAdded(su: SchoolUserItem) {
    setUsers(prev => {
      const exists = prev.some(u => u.user.id === su.user.id)
      if (exists) return prev
      return [su, ...prev]
    })
  }

  function onCourseAdded(sc: CourseItem) {
    setCourses(prev => {
      const exists = prev.some(c => c.course.id === sc.course.id)
      if (exists) return prev
      return [sc, ...prev]
    })
  }

  return (
    <>
      {/* ── Tab bar ───────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-1 w-fit">
        {[
          { key: 'overview', label: '📋 Tổng quan' },
          { key: 'users',    label: `👥 Người dùng (${users.length})` },
          { key: 'courses',  label: `📚 Khóa học (${courses.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'overview' | 'users' | 'courses')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            style={activeTab === tab.key ? { background: school.primaryColor } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Tổng quan ────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 text-base">📋 Thông tin trường</h3>
              <Link
                href={`/admin/schools/${school.id}/edit`}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                ✏️ Chỉnh sửa
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Tên trường" value={school.name} />
              <InfoRow label="Slug" value={`/${school.slug}`} mono />
              {school.domain && <InfoRow label="Domain" value={school.domain} mono />}
              {school.email && <InfoRow label="Email" value={school.email} />}
              {school.phone && <InfoRow label="Điện thoại" value={school.phone} />}
              {school.address && <InfoRow label="Địa chỉ" value={school.address} />}
              <div>
                <p className="text-gray-400 text-xs mb-1">Màu thương hiệu</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-gray-200" style={{ background: school.primaryColor }} />
                  <span className="font-mono text-gray-700">{school.primaryColor}</span>
                </div>
              </div>
              <InfoRow label="Trạng thái" value={school.isActive ? '✓ Đang hoạt động' : '✗ Ngưng hoạt động'} />
            </div>
            {school.description && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-gray-400 text-xs mb-1">Mô tả</p>
                <p className="text-sm text-gray-700">{school.description}</p>
              </div>
            )}
          </div>

          {/* Settings card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 text-base mb-4">⚙️ Cài đặt</h3>
            {school.settings ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tự đăng ký</p>
                    <p className="text-xs text-gray-400">Học sinh tự tạo tài khoản</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    school.settings.allowSelfRegister
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {school.settings.allowSelfRegister ? 'Bật' : 'Tắt'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Giới hạn học sinh</p>
                    <p className="text-xs text-gray-400">Số lượng tối đa</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {school.settings.maxStudents ? `${school.settings.maxStudents} HS` : 'Không giới hạn'}
                  </span>
                </div>
                {/* Features */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">Tính năng</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                      const enabled = school.settings?.features?.[key] ?? false
                      return (
                        <div
                          key={key}
                          className={`rounded-xl p-3 border ${
                            enabled
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-gray-50 border-gray-100 text-gray-400'
                          }`}
                        >
                          <p className="text-sm font-bold">{label}</p>
                          <p className="text-xs mt-0.5">{enabled ? 'Đang bật' : 'Đã tắt'}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Chưa có cài đặt</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-3xl font-black text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-400 mt-1">👤 Người dùng</div>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-3xl font-black text-gray-900">{courses.length}</div>
              <div className="text-sm text-gray-400 mt-1">📚 Khóa học</div>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Người dùng ───────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-900">{users.length}</strong> người dùng trong trường
            </p>
            <button
              onClick={() => setShowUserSearch(true)}
              className="text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
              style={{ background: school.primaryColor }}
            >
              ➕ Thêm User
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {users.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-3xl mb-3">👥</p>
                <p className="text-sm font-semibold">Chưa có người dùng nào</p>
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="mt-3 text-blue-600 hover:underline text-xs font-semibold"
                >
                  + Thêm ngay
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Người dùng</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Vai trò</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Trạng thái</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(su => (
                      <tr key={su.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                              style={{ background: school.primaryColor }}
                            >
                              {su.user.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{su.user.name ?? '(Chưa đặt tên)'}</p>
                              <p className="text-gray-400 text-xs">{su.user.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {su.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${su.user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                            {su.user.isActive ? '● Active' : '○ Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveUser(su.user.id, su.user.name ?? su.user.phone)}
                            disabled={removingUserId === su.user.id}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-all disabled:opacity-50"
                          >
                            {removingUserId === su.user.id ? '⏳' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Khóa học ─────────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-900">{courses.length}</strong> khóa học trong trường
            </p>
            <button
              onClick={() => setShowCourseSelect(true)}
              className="text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
              style={{ background: school.primaryColor }}
            >
              ➕ Thêm Khóa học
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {courses.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-3xl mb-3">📚</p>
                <p className="text-sm font-semibold">Chưa có khóa học nào</p>
                <button
                  onClick={() => setShowCourseSelect(true)}
                  className="mt-3 text-blue-600 hover:underline text-xs font-semibold"
                >
                  + Thêm ngay
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Khóa học</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Môn / Lớp</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Học sinh</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-xs uppercase tracking-wide">Trạng thái</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {courses.map(sc => (
                      <tr key={sc.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{sc.course.name}</p>
                            <p className="text-gray-400 text-xs font-mono">{sc.course.code}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <p>{sc.course.subjectName ?? sc.course.subjectCode}</p>
                          {sc.course.gradeMin && (
                            <p className="text-gray-400">Lớp {sc.course.gradeMin}{sc.course.gradeMax && sc.course.gradeMax !== sc.course.gradeMin ? `–${sc.course.gradeMax}` : ''}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-700">
                          {sc.course._count.enrollments}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            sc.course.approvalStatus === 'published'
                              ? 'bg-green-100 text-green-700'
                              : sc.course.approvalStatus === 'approved'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {sc.course.approvalStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveCourse(sc.course.id, sc.course.name)}
                            disabled={removingCourseId === sc.course.id}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-all disabled:opacity-50"
                          >
                            {removingCourseId === sc.course.id ? '⏳' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────── */}
      {showUserSearch && (
        <UserSearchModal
          schoolId={school.id}
          primaryColor={school.primaryColor}
          existingUserIds={users.map(su => su.user.id)}
          onClose={() => setShowUserSearch(false)}
          onAdded={onUserAdded}
        />
      )}

      {showCourseSelect && (
        <CourseSelectModal
          schoolId={school.id}
          primaryColor={school.primaryColor}
          existingCourseIds={courses.map(sc => sc.course.id)}
          onClose={() => setShowCourseSelect(false)}
          onAdded={onCourseAdded}
        />
      )}
    </>
  )
}

// ── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className={`font-semibold text-gray-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}

// ── UserSearchModal ──────────────────────────────────────────────────────────

interface UserSearchModalProps {
  schoolId: string
  primaryColor: string
  existingUserIds: string[]
  onClose: () => void
  onAdded: (su: SchoolUserItem) => void
}

interface UserSearchResult {
  id: string
  name: string | null
  phone: string
  email: string | null
  role: string
  isActive: boolean
}

function UserSearchModal({ schoolId, primaryColor, existingUserIds, onClose, onAdded }: UserSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/users?search=${encodeURIComponent(q)}&limit=20`)
      const data = await res.json() as { success: boolean; data?: Array<{ user: UserSearchResult }> }
      if (data.success && data.data) {
        // Only show users NOT already in school
        const filtered = data.data
          .map(su => su.user)
          .filter(u => !existingUserIds.includes(u.id))
        setResults(filtered)
      }
    } finally {
      setLoading(false)
    }
  }, [schoolId, existingUserIds])

  async function handleAdd(userId: string) {
    setAddingId(userId)
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: 'STUDENT' }),
      })
      const data = await res.json() as { success: boolean; data?: SchoolUserItem }
      if (data.success && data.data) {
        onAdded(data.data)
        setResults(prev => prev.filter(u => u.id !== userId))
      }
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-black text-gray-900 text-base mb-3">👤 Tìm kiếm người dùng</h3>
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              void search(e.target.value)
            }}
            placeholder="Tên, SĐT hoặc email..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-gray-400 text-sm">⏳ Đang tìm...</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">Không tìm thấy user phù hợp</div>
          )}
          {!loading && !query && (
            <div className="p-8 text-center text-gray-400 text-sm">Nhập để tìm kiếm người dùng</div>
          )}
          {results.map(user => (
            <div key={user.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: primaryColor }}
                >
                  {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{user.name ?? '(Chưa đặt tên)'}</p>
                  <p className="text-xs text-gray-400">{user.phone}</p>
                </div>
              </div>
              <button
                onClick={() => handleAdd(user.id)}
                disabled={addingId === user.id}
                className="text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                style={{ background: primaryColor }}
              >
                {addingId === user.id ? '⏳' : '+ Thêm'}
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CourseSelectModal ────────────────────────────────────────────────────────

interface CourseSelectModalProps {
  schoolId: string
  primaryColor: string
  existingCourseIds: string[]
  onClose: () => void
  onAdded: (sc: CourseItem) => void
}

interface CourseSearchResult {
  id: string
  code: string
  name: string
  subjectName: string | null
  subjectCode: string
  isActive: boolean
  approvalStatus: string
}

function CourseSelectModal({ schoolId, primaryColor, existingCourseIds, onClose, onAdded }: CourseSelectModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CourseSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  const search = useCallback(async (q: string) => {
    setLoading(true)
    try {
      // Fetch ALL courses from admin API, then filter client-side
      const res = await fetch('/api/admin/courses')
      const data = await res.json() as { success: boolean; data?: Array<CourseSearchResult> }
      if (data.success && data.data) {
        const lower = q.toLowerCase()
        const filtered = data.data.filter(c =>
          !existingCourseIds.includes(c.id) &&
          (q.trim() === '' || c.name.toLowerCase().includes(lower) || c.code.toLowerCase().includes(lower))
        )
        setResults(filtered)
      }
    } finally {
      setLoading(false)
    }
  }, [existingCourseIds])

  // Load on first open
  useEffect(() => {
    void search('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAdd(courseId: string) {
    setAddingId(courseId)
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json() as { success: boolean; data?: CourseItem }
      if (data.success && data.data) {
        onAdded(data.data)
        setResults(prev => prev.filter(c => c.id !== courseId))
      }
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-black text-gray-900 text-base mb-3">📚 Thêm Khóa học</h3>
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              void search(e.target.value)
            }}
            placeholder="Tên hoặc mã khóa học..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-gray-400 text-sm">⏳ Đang tải...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              {query ? 'Không tìm thấy khóa học phù hợp' : 'Tất cả khóa học đã được thêm vào trường'}
            </div>
          )}
          {results.map(course => (
            <div key={course.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50">
              <div>
                <p className="font-semibold text-sm text-gray-900">{course.name}</p>
                <p className="text-xs text-gray-400 font-mono">{course.code}</p>
              </div>
              <button
                onClick={() => handleAdd(course.id)}
                disabled={addingId === course.id}
                className="text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 shrink-0"
                style={{ background: primaryColor }}
              >
                {addingId === course.id ? '⏳' : '+ Thêm'}
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
