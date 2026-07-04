/**
 * withOrgScope — Centralized admin route middleware
 *
 * Replaces the boilerplate in every API route:
 *   const session = await auth()
 *   if (!session || !isAdmin(role)) return 401
 *   const orgCtx = await getOrganizationContext(userId)
 *
 * Usage:
 *   const ctx = await withOrgScope(req)
 *   if ('error' in ctx) return NextResponse.json(ctx, { status: ctx.status })
 *   const { orgCtx, userId, session } = ctx
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'
import { getCurrentOrgFromSession } from '@/lib/organization'

export type OrgScopeCtx = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
  userId: string
  role: string
  orgCtx: Awaited<ReturnType<typeof getOrganizationContext>>
  // Prisma filter helpers
  orgFilter:        Record<string, unknown>        // { organizationId: orgCtx.id } or {}
  orgPaymentFilter: Record<string, unknown>        // { enrollment: { course: { organizationId } } }
  orgUserFilter:    Record<string, unknown>        // { organizationUsers: { some: { organizationId } } }
  orgEnrollFilter:  Record<string, unknown>        // { organizationId, course: { organizationId } }
  courseOrgFilter:  Record<string, unknown>        // { organizationId, isActive: true }
  isSuperAdmin:     boolean
}

type ErrorResult = { error: string; status: 401 | 403 }

export async function withOrgScope(
  req?: NextRequest,
  opts: { allowTeacher?: boolean; allowParent?: boolean } = {}
): Promise<OrgScopeCtx | ErrorResult> {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }

  const role = (session.user as { role?: string })?.role ?? ''
  const userId = (session.user as { id?: string })?.id ?? ''

  const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']
  const allowed = opts.allowTeacher
    ? [...ADMIN_ROLES, 'TEACHER']
    : opts.allowParent
    ? [...ADMIN_ROLES, 'PARENT']
    : ADMIN_ROLES

  if (!allowed.includes(role)) {
    return { error: 'Không có quyền truy cập', status: 403 }
  }

  // Resolve current org from cookie or session
  const cookieOrgId = req ? getCurrentOrgFromRequest(req) : null
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)

  const isSuperAdmin = role === 'SUPER_ADMIN'

  // Build reusable Prisma filters
  const orgFilter        = orgCtx?.id ? { organizationId: orgCtx.id } : {}
  const orgPaymentFilter = orgCtx?.id ? { enrollment: { course: { organizationId: orgCtx.id } } } : {}
  const orgUserFilter    = orgCtx?.id ? { organizationUsers: { some: { organizationId: orgCtx.id } } } : {}
  const orgEnrollFilter  = orgCtx?.id ? { organizationId: orgCtx.id } : {}
  const courseOrgFilter  = orgCtx?.id ? { organizationId: orgCtx.id, isActive: true } : { isActive: true }

  return {
    session,
    userId,
    role,
    orgCtx,
    orgFilter,
    orgPaymentFilter,
    orgUserFilter,
    orgEnrollFilter,
    courseOrgFilter,
    isSuperAdmin,
  }
}

/** Type guard */
export function isOrgScopeError(ctx: OrgScopeCtx | ErrorResult): ctx is ErrorResult {
  return 'error' in ctx
}

/** Quick helper for API routes */
export function orgScopeError(ctx: ErrorResult) {
  return NextResponse.json({ error: ctx.error }, { status: ctx.status })
}
