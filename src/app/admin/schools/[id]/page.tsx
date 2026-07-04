import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SchoolDetailTabs from './SchoolDetailTabs'

export const metadata = { title: 'Chi tiết Trường — AvaB Admin' }

type Params = { params: Promise<{ id: string }>; searchParams?: Promise<{ tab?: string }> }

export default async function SchoolDetailPage({ params, searchParams }: Params) {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
    redirect('/dang-nhap')
  }

  const { id } = await params
  const sp = searchParams ? await searchParams : {}
  const defaultTab = (sp.tab === 'users' || sp.tab === 'courses' || sp.tab === 'settings') ? sp.tab : 'overview'

  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      settings: true,
      _count: { select: { schoolUsers: true, schoolCourses: true } },
    },
  })

  if (!school) notFound()

  // Load users and courses
  const [schoolUsers, schoolCourses] = await Promise.all([
    prisma.schoolUser.findMany({
      where: { schoolId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            avatar: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
      take: 100,
    }),
    prisma.schoolCourse.findMany({
      where: { schoolId: id },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            thumbnail: true,
            subjectName: true,
            subjectCode: true,
            gradeMin: true,
            gradeMax: true,
            isActive: true,
            approvalStatus: true,
            createdAt: true,
            _count: { select: { enrollments: true, subjects: true } },
          },
        },
      },
      orderBy: { course: { name: 'asc' } },
    }),
  ])

  // Serialize for client
  const serializedSchool = {
    id: school.id,
    name: school.name,
    slug: school.slug,
    logo: school.logo,
    domain: school.domain,
    primaryColor: school.primaryColor,
    description: school.description,
    address: school.address,
    phone: school.phone,
    email: school.email,
    isActive: school.isActive,
    createdAt: school.createdAt.toISOString(),
    updatedAt: school.updatedAt.toISOString(),
    _count: school._count,
    settings: school.settings
      ? {
          id: school.settings.id,
          allowSelfRegister: school.settings.allowSelfRegister,
          maxStudents: school.settings.maxStudents,
          features: school.settings.features as Record<string, boolean> | null,
          customCSS: school.settings.customCSS,
        }
      : null,
  }

  const serializedUsers = schoolUsers.map(su => ({
    id: su.id,
    role: su.role,
    user: {
      id: su.user.id,
      name: su.user.name,
      phone: su.user.phone,
      email: su.user.email,
      role: su.user.role,
      avatar: su.user.avatar,
      isActive: su.user.isActive,
      createdAt: su.user.createdAt.toISOString(),
    },
  }))

  const serializedCourses = schoolCourses.map(sc => ({
    id: sc.id,
    course: {
      id: sc.course.id,
      code: sc.course.code,
      name: sc.course.name,
      thumbnail: sc.course.thumbnail,
      subjectName: sc.course.subjectName,
      subjectCode: sc.course.subjectCode,
      gradeMin: sc.course.gradeMin,
      gradeMax: sc.course.gradeMax,
      isActive: sc.course.isActive,
      approvalStatus: sc.course.approvalStatus,
      createdAt: sc.course.createdAt.toISOString(),
      _count: sc.course._count,
    },
  }))

  return (
    <div className="min-h-screen pt-14 bg-gray-50">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: `linear-gradient(135deg, ${school.primaryColor}dd 0%, ${school.primaryColor}99 100%)` }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.1)', transform: 'translate(25%, -50%)' }} />
        <div className="container-custom relative">
          <p className="text-white/70 text-sm mb-3">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            {' / '}
            <Link href="/admin/schools" className="hover:text-white">Trường</Link>
            {' / '}
            <span>{school.name}</span>
          </p>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0 shadow-lg"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                {school.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={school.logo} alt={school.name} className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  school.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-black">{school.name}</h1>
                  {school.isActive ? (
                    <span className="bg-green-400/20 text-green-200 border border-green-400/30 text-xs font-bold px-2.5 py-1 rounded-full">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="bg-white/20 text-white/60 text-xs font-bold px-2.5 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm font-mono mt-0.5">/{school.slug}</p>
                {school.domain && (
                  <p className="text-white/70 text-xs mt-0.5">{school.domain}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-5 text-sm text-white/70">
            <span><strong className="text-white">{school._count.schoolUsers}</strong> người dùng</span>
            <span><strong className="text-white">{school._count.schoolCourses}</strong> khóa học</span>
            {school.address && <span>📍 {school.address}</span>}
          </div>
        </div>
      </div>

      {/* ── Tabs (client component) ─────────────────────────────────── */}
      <div className="container-custom py-8">
        <SchoolDetailTabs
          school={serializedSchool}
          initialUsers={serializedUsers}
          initialCourses={serializedCourses}
          defaultTab={defaultTab}
        />
      </div>
    </div>
  )
}
