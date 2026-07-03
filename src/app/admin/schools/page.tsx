import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Quản lý Trường — AvaB Admin' }

export default async function SchoolsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/dang-nhap')
  }

  const schools = await prisma.school.findMany({
    include: {
      _count: { select: { schoolUsers: true, schoolCourses: true } },
      settings: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* ── Header gradient ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-12"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2447 60%, #1a1a4e 100%)' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(99,179,237,0.12)', transform: 'translate(25%, -50%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(147,51,234,0.15)', transform: 'translate(-25%, 50%)' }} />

        <div className="container-custom relative">
          <p className="text-blue-300 text-sm mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            {' / '}
            <span>Trường &amp; Trung tâm</span>
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
            <div>
              <h1 className="text-4xl font-black">🏫 Trường &amp; Trung tâm</h1>
              <p className="text-blue-200 text-sm mt-1">
                Quản lý hệ thống đa trường — {schools.length} đơn vị
              </p>
            </div>
            <Link
              href="/admin/schools/new"
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <span>+</span> Thêm Trường
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mt-6">
            {[
              { label: 'Tổng trường', value: schools.length, color: 'text-blue-300' },
              {
                label: 'Đang hoạt động',
                value: schools.filter(s => s.isActive).length,
                color: 'text-green-300',
              },
              {
                label: 'Tổng người dùng',
                value: schools.reduce((acc, s) => acc + s._count.schoolUsers, 0),
                color: 'text-yellow-300',
              },
              {
                label: 'Tổng khóa học',
                value: schools.reduce((acc, s) => acc + s._count.schoolCourses, 0),
                color: 'text-pink-300',
              },
            ].map(s => (
              <div key={s.label}>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-blue-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── School Cards ────────────────────────────────────────────── */}
      <div className="container-custom py-8">
        {schools.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏫</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Chưa có trường nào</h2>
            <p className="text-gray-500 text-sm mb-6">Thêm trường đầu tiên để bắt đầu quản lý đa trường</p>
            <Link
              href="/admin/schools/new"
              className="inline-flex items-center gap-2 bg-blue-900 text-white hover:bg-blue-800 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm"
            >
              <span>+</span> Thêm Trường đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {schools.map(school => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Types ────────────────────────────────────────────────────────────────────
interface SchoolWithCounts {
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
  createdAt: Date
  _count: { schoolUsers: number; schoolCourses: number }
  settings: {
    allowSelfRegister: boolean
    maxStudents: number | null
    features: unknown
  } | null
}

function SchoolCard({ school }: { school: SchoolWithCounts }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ background: school.primaryColor }} />

      <div className="p-5">
        {/* Logo + Name row */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-sm"
            style={{ background: school.primaryColor }}
          >
            {school.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logo} alt={school.name} className="w-full h-full object-contain rounded-xl" />
            ) : (
              school.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-gray-900 text-base leading-tight truncate">{school.name}</h3>
              {school.isActive ? (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  ✓ Active
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-gray-400 text-xs font-mono mt-0.5">/{school.slug}</p>
            {school.domain && (
              <p className="text-blue-500 text-xs mt-0.5 truncate">{school.domain}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-gray-900">{school._count.schoolUsers}</div>
            <div className="text-xs text-gray-400 mt-0.5">👤 Người dùng</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xl font-black text-gray-900">{school._count.schoolCourses}</div>
            <div className="text-xs text-gray-400 mt-0.5">📚 Khóa học</div>
          </div>
        </div>

        {/* Settings chips */}
        {school.settings && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {school.settings.allowSelfRegister && (
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                Self-register
              </span>
            )}
            {school.settings.maxStudents && (
              <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                Max {school.settings.maxStudents} HS
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/admin/schools/${school.id}`}
            className="flex-1 text-center bg-gray-900 hover:bg-gray-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            Xem chi tiết
          </Link>
          <Link
            href={`/admin/schools/${school.id}?tab=settings`}
            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            ⚙️ Cài đặt
          </Link>
        </div>
      </div>
    </div>
  )
}
