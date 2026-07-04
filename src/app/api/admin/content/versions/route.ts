import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  if ((session.user as { role?: string }).role !== 'ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  return { session }
}

// GET /api/admin/content/versions?entityId=xxx&entityType=xxx
export async function GET(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const { searchParams } = new URL(request.url)
  const entityId = searchParams.get('entityId')
  const entityType = searchParams.get('entityType')

  if (!entityId || !entityType) {
    return NextResponse.json(
      { success: false, error: 'Thiếu entityId hoặc entityType' },
      { status: 400 }
    )
  }

  try {
    const versions = await prisma.contentVersion.findMany({
      where: { entityId, entityType },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        version: true,
        label: true,
        createdBy: true,
        createdAt: true,
        content: false, // Don't send full content in list
      },
    })

    return NextResponse.json({ success: true, data: versions })
  } catch (error) {
    console.error('[GET /api/admin/content/versions]', error)
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 })
  }
}

// POST /api/admin/content/versions — save a new version
export async function POST(request: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json() as {
      entityId: string
      entityType: string
      content: string
      label?: string
    }

    const { entityId, entityType, content, label } = body

    if (!entityId || !entityType || !content) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Get next version number
    const lastVersion = await prisma.contentVersion.findFirst({
      where: { entityId, entityType },
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    const nextVersion = (lastVersion?.version ?? 0) + 1
    const userId = (check.session.user as { id?: string }).id

    const version = await prisma.contentVersion.create({
      data: {
        entityId,
        entityType,
        content,
        label: label ?? `v${nextVersion}`,
        version: nextVersion,
        createdBy: userId,
      },
    })

    return NextResponse.json({ success: true, data: version }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/content/versions]', error)
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
