import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

export async function GET(_req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const logs = await prisma.materialImportLog.findMany({
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
