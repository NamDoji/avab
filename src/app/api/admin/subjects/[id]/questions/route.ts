import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

// DELETE /api/admin/subjects/[id]/questions?orphansOnly=true
// Xóa tất cả câu hỏi chưa phân nhóm (homeworkSetId = null) của chuyên đề
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id: subjectId } = await params
  const orphansOnly = req.nextUrl.searchParams.get('orphansOnly') === 'true'

  try {
    const where = orphansOnly
      ? { subjectId, homeworkSetId: null }
      : { subjectId }

    const { count } = await prisma.question.deleteMany({ where })
    return NextResponse.json({ success: true, data: { deleted: count } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 })
  }
}
