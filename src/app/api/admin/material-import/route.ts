import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/organization'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') return null
  const userId = (session.user as { id?: string })?.id ?? ''
  return { session, userId }
}

export async function GET(_req: NextRequest) {
  const adminCtx = await requireAdmin()
  if (!adminCtx) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // MaterialImportLog has no organizationId field — scope by importedBy for org admins
  // Super admin sees all logs; org admin sees only their own imports
  const orgCtx = await getOrganizationContext(adminCtx.userId)

  // Best-effort org scoping: filter by the current user's imports when they have an org
  // (MaterialImportLog.importedBy = userId)
  const whereFilter = orgCtx
    ? { importedBy: adminCtx.userId }
    : {}

  try {
    const logs = await prisma.materialImportLog.findMany({
      where: whereFilter,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        sourceType: true,
        sourceName: true,
        sourceSize: true,
        detectedType: true,
        detectedSubject: true,
        detectedGrade: true,
        targetModule: true,
        status: true,
        questionsFound: true,
        questionsImported: true,
        importedBy: true,
        subjectId: true,
        createdAt: true,
        completedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: logs })
  } catch (err: unknown) {
    console.error('[material-import GET]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
