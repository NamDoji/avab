import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'

// GET /api/admin/erp/timetable/setup-data?campusId=X
// Returns: campuses, classes (courses), teachers for the org/campus
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)
  const { searchParams } = new URL(req.url)
  const campusId = searchParams.get('campusId')

  // Campuses for this org
  const campuses = orgCtx?.id
    ? await prisma.campus.findMany({
        where: { organizationId: orgCtx.id, isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: 'asc' },
      })
    : []

  // Classes (courses) for campus / org — with grade info
  const courses = await prisma.course.findMany({
    where: {
      ...(orgCtx?.id ? { organizationId: orgCtx.id } : {}),
      ...(campusId ? { campusId } : {}),
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
      subjectCode: true,
      subjectName: true,
      gradeMin: true,
      gradeMax: true,
      campusId: true,
    },
    orderBy: [{ gradeMin: 'asc' }, { name: 'asc' }],
    take: 200,
  })

  // Group courses by grade level
  const gradeGroups: Record<string, { label: string; courses: typeof courses }> = {}
  for (const c of courses) {
    const g = c.gradeMin
    let key: string
    let label: string
    if (g === null || g === undefined) { key = 'other'; label = 'Khác' }
    else if (g === 0) { key = 'mn'; label: 'Mầm non'; label = 'Mầm non' }
    else if (g <= 5)  { key = 'th'; label = `Tiểu học (Lớp ${g})` }
    else if (g <= 9)  { key = 'thcs'; label = `THCS (Lớp ${g})` }
    else              { key = 'thpt'; label = `THPT (Lớp ${g})` }
    if (!gradeGroups[key]) gradeGroups[key] = { label, courses: [] }
    gradeGroups[key].courses.push(c)
  }

  // Teachers for this org/campus
  const campusUserIds = campusId
    ? (await prisma.campusUser.findMany({
        where: { campusId, campusRole: 'TEACHER' },
        select: { userId: true },
      })).map(cu => cu.userId)
    : []

  const orgUserIds = orgCtx?.id
    ? (await prisma.organizationUser.findMany({
        where: { organizationId: orgCtx.id },
        select: { userId: true },
      })).map(ou => ou.userId)
    : []

  const teacherIds = campusUserIds.length > 0 ? campusUserIds : orgUserIds

  const teachers = await prisma.user.findMany({
    where: {
      role: 'TEACHER',
      ...(teacherIds.length > 0 ? { id: { in: teacherIds } } : {}),
    },
    select: { id: true, name: true, phone: true },
    orderBy: { name: 'asc' },
    take: 100,
  })

  // Standard subjects by grade
  const SUBJECT_TEMPLATES: Record<string, { name: string; periodsPerWeek: number }[]> = {
    mn:   [{ name: 'Mầm non tổng hợp', periodsPerWeek: 25 }],
    th:   [{ name: 'Toán', periodsPerWeek: 4 }, { name: 'Tiếng Việt', periodsPerWeek: 5 }, { name: 'Tiếng Anh', periodsPerWeek: 4 }, { name: 'Khoa học', periodsPerWeek: 2 }, { name: 'Lịch sử & Địa lý', periodsPerWeek: 2 }, { name: 'Tin học', periodsPerWeek: 2 }, { name: 'Đạo đức', periodsPerWeek: 1 }, { name: 'Thể dục', periodsPerWeek: 2 }, { name: 'Mỹ thuật', periodsPerWeek: 1 }, { name: 'Âm nhạc', periodsPerWeek: 1 }],
    thcs: [{ name: 'Toán', periodsPerWeek: 4 }, { name: 'Ngữ văn', periodsPerWeek: 4 }, { name: 'Tiếng Anh', periodsPerWeek: 3 }, { name: 'Vật lý', periodsPerWeek: 2 }, { name: 'Hóa học', periodsPerWeek: 2 }, { name: 'Sinh học', periodsPerWeek: 2 }, { name: 'Lịch sử', periodsPerWeek: 1 }, { name: 'Địa lý', periodsPerWeek: 1 }, { name: 'GDCD', periodsPerWeek: 1 }, { name: 'Tin học', periodsPerWeek: 2 }, { name: 'Công nghệ', periodsPerWeek: 1 }, { name: 'Thể dục', periodsPerWeek: 2 }],
    thpt: [{ name: 'Toán', periodsPerWeek: 4 }, { name: 'Ngữ văn', periodsPerWeek: 4 }, { name: 'Tiếng Anh', periodsPerWeek: 3 }, { name: 'Vật lý', periodsPerWeek: 2 }, { name: 'Hóa học', periodsPerWeek: 2 }, { name: 'Sinh học', periodsPerWeek: 2 }, { name: 'Lịch sử', periodsPerWeek: 2 }, { name: 'Địa lý', periodsPerWeek: 2 }, { name: 'GDCD', periodsPerWeek: 1 }, { name: 'Tin học', periodsPerWeek: 2 }, { name: 'Thể dục', periodsPerWeek: 2 }],
  }

  return NextResponse.json({
    org: orgCtx ? { id: orgCtx.id, name: orgCtx.name } : null,
    campuses,
    gradeGroups,
    teachers,
    subjectTemplates: SUBJECT_TEMPLATES,
  })
}
