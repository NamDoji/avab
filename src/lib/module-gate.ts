/**
 * Module Gate — kiểm tra org có quyền dùng module không
 * Áp dụng ở API level, không chỉ dashboard
 *
 * Usage trong API route:
 *   const gate = await checkModuleAccess(req, 'ai')
 *   if ('error' in gate) return NextResponse.json(gate, { status: gate.status })
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromRequest } from '@/lib/current-org'
import { getCurrentOrgFromSession } from '@/lib/organization'

export interface ModuleGateOk {
  userId: string
  role: string
  isSuperAdmin: boolean
  orgId: string | null
  modules: string[]
}

export interface ModuleGateError {
  error: string
  status: 401 | 403
}

/**
 * Check xem user có quyền dùng module chỉ định không.
 * SUPER_ADMIN luôn có quyền.
 * Org admin: phải có module trong org.modules.
 */
export async function checkModuleAccess(
  req: NextRequest,
  requiredModule: string
): Promise<ModuleGateOk | ModuleGateError> {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }

  const role = (session.user as { role?: string }).role ?? ''
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Không có quyền truy cập', status: 403 }
  }

  const userId = (session.user as { id?: string })?.id ?? ''
  const isSuperAdmin = role === 'SUPER_ADMIN'

  // SUPER_ADMIN luôn pass
  if (isSuperAdmin) {
    return { userId, role, isSuperAdmin: true, orgId: null, modules: ['*'] }
  }

  // Org admin — kiểm tra module
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)

  if (!orgCtx) {
    return { error: 'Không tìm thấy tổ chức', status: 403 }
  }

  const orgModules = orgCtx.modules ?? []

  // Kiểm tra org có module không
  if (!orgModules.includes(requiredModule)) {
    return {
      error: `Module "${requiredModule}" chưa được kích hoạt. Vui lòng nâng cấp gói dịch vụ.`,
      status: 403,
    }
  }

  return {
    userId,
    role,
    isSuperAdmin: false,
    orgId: orgCtx.id,
    modules: orgModules,
  }
}

/**
 * Lấy org modules của user hiện tại (cho dashboard gating)
 * Returns [] nếu không có org
 */
export async function getOrgModules(userId: string, cookieOrgId: string | null): Promise<string[]> {
  const role = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  if (role?.role === 'SUPER_ADMIN') return ['*']

  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return (orgCtx?.modules ?? []) as string[]
}
