import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

export async function GET(req: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  // Honour active-org cookie, fall back to default org
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(check.userId, cookieOrgId)
  // For TuitionPayment: filter via enrollment.course.organizationId
  const wherePayments = orgCtx
    ? { enrollment: { course: { organizationId: orgCtx.id } } }
    : {}

  // All payments (scoped to org)
  const allPayments = await prisma.tuitionPayment.findMany({
    where: wherePayments,
    select: {
      id: true, amount: true, isFree: true, isPaid: true, paidAt: true,
      collection: { select: { courseId: true, title: true } },
      enrollment: {
        select: {
          course: { select: { id: true, name: true, grade: true, courseType: true } },
          user: { select: { id: true, name: true, phone: true } },
        },
      },
    },
  })

  // Summary cards
  const expectedRevenue = allPayments.filter(p => !p.isFree).reduce((s, p) => s + p.amount, 0)
  const collectedRevenue = allPayments.filter(p => p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0)
  const pendingRevenue = allPayments.filter(p => !p.isPaid && !p.isFree).reduce((s, p) => s + p.amount, 0)
  const freeCount = allPayments.filter(p => p.isFree).length

  // Active enrollment count (scoped to org)
  const whereEnrollments = orgCtx
    ? { status: { in: ['ACTIVE', 'APPROVED'] }, course: { organizationId: orgCtx.id } }
    : { status: { in: ['ACTIVE', 'APPROVED'] } }
  const activeEnrollments = await prisma.enrollment.count({ where: whereEnrollments })

  // Monthly chart data (last 12 months)
  const monthlyMap: Record<string, { month: string; collected: number; pending: number }> = {}
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = { month: key, collected: 0, pending: 0 }
  }
  allPayments.forEach(p => {
    const d = p.paidAt ? new Date(p.paidAt) : null
    if (p.isPaid && d) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (monthlyMap[key]) monthlyMap[key].collected += p.amount
    } else if (!p.isPaid && !p.isFree) {
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      if (monthlyMap[key]) monthlyMap[key].pending += p.amount
    }
  })
  const monthlyData = Object.values(monthlyMap)

  // Per-course stats
  const courseMap: Record<string, {
    id: string; name: string; grade: string | null; courseType: string
    students: Set<string>; collected: number; pending: number
  }> = {}
  allPayments.forEach(p => {
    const course = p.enrollment.course
    if (!courseMap[course.id]) {
      courseMap[course.id] = {
        id: course.id, name: course.name, grade: course.grade, courseType: course.courseType,
        students: new Set(), collected: 0, pending: 0,
      }
    }
    courseMap[course.id].students.add(p.enrollment.user.id)
    if (p.isPaid && !p.isFree) courseMap[course.id].collected += p.amount
    if (!p.isPaid && !p.isFree) courseMap[course.id].pending += p.amount
  })
  const courseStats = Object.values(courseMap).map(c => ({
    id: c.id, name: c.name, grade: c.grade, courseType: c.courseType,
    students: c.students.size, collected: c.collected, pending: c.pending,
    total: c.collected + c.pending,
    completionPct: c.collected + c.pending > 0
      ? Math.round((c.collected / (c.collected + c.pending)) * 100) : 0,
  }))

  // Recent payments log (last 20 paid)
  const recentLogs = allPayments
    .filter(p => p.isPaid && p.paidAt)
    .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())
    .slice(0, 20)
    .map(p => ({
      course: p.enrollment.course.name,
      collection: p.collection.title,
      student: p.enrollment.user.name ?? p.enrollment.user.phone,
      amount: p.amount,
      isPaid: p.isPaid,
      paidAt: p.paidAt,
    }))

  return NextResponse.json({
    success: true,
    data: {
      summary: { expectedRevenue, collectedRevenue, pendingRevenue, freeCount, activeEnrollments },
      monthlyData,
      courseStats,
      recentLogs,
    },
  })
}
