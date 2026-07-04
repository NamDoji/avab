import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

// GET /api/admin/workflow — list workflow defs (scoped to org)
// Query: ?isTemplate=true|false  ?module=xxx
export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  // Get org context — filter workflow defs by org
  const orgCtx = await getOrganizationContext(check.userId)
  // orgCtx = null → super admin sees all (platform templates + all org defs)
  const whereOrg = orgCtx ? { organizationId: orgCtx.id } : {}

  try {
    const { searchParams } = new URL(request.url)
    const isTemplateParam = searchParams.get('isTemplate')
    const moduleParam = searchParams.get('module')

    const where: Record<string, unknown> = { isActive: true, ...whereOrg }
    if (isTemplateParam !== null) where.isTemplate = isTemplateParam === 'true'
    if (moduleParam) where.module = moduleParam

    const defs = await prisma.workflowDef.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { instances: true } },
      },
    })

    return NextResponse.json({ success: true, data: defs })
  } catch (error) {
    console.error('GET /api/admin/workflow error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tải workflows' }, { status: 500 })
  }
}

// POST /api/admin/workflow — create new workflow def with org context
export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  // Get org context to tag the created workflow
  const orgCtx = await getOrganizationContext(check.userId)

  try {
    const body = await request.json() as {
      name: string
      slug: string
      description?: string
      module?: string
      isTemplate?: boolean
      steps: unknown[]
      formSchema?: unknown
      settings?: unknown
    }

    const { name, slug, description, module: mod, isTemplate, steps, formSchema, settings } = body

    if (!name || !slug || !steps) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc: name, slug, steps' }, { status: 400 })
    }

    const existing = await prisma.workflowDef.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug đã tồn tại' }, { status: 409 })
    }

    const def = await prisma.workflowDef.create({
      data: {
        name,
        slug,
        description,
        module: mod ?? 'general',
        isTemplate: isTemplate ?? false,
        steps: steps as Parameters<typeof prisma.workflowDef.create>[0]['data']['steps'],
        formSchema: formSchema as Parameters<typeof prisma.workflowDef.create>[0]['data']['formSchema'] ?? undefined,
        settings: settings as Parameters<typeof prisma.workflowDef.create>[0]['data']['settings'] ?? undefined,
        createdBy: check.userId,
        organizationId: orgCtx?.id ?? null,
      },
    })

    return NextResponse.json({ success: true, data: def }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/workflow error:', error)
    return NextResponse.json({ success: false, error: 'Không thể tạo workflow' }, { status: 500 })
  }
}
