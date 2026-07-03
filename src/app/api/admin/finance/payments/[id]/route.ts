import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

// PATCH /api/admin/finance/payments/[id] — mark payment as paid
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdmin()
  if ('error' in check)
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id } = await params
  const body = await req.json()
  const { isPaid } = body

  if (typeof isPaid !== 'boolean') {
    return NextResponse.json(
      { success: false, error: 'isPaid phải là boolean' },
      { status: 400 },
    )
  }

  const payment = await prisma.tuitionPayment.update({
    where: { id },
    data: {
      isPaid,
      paidAt: isPaid ? new Date() : null,
    },
  })

  return NextResponse.json({ success: true, data: payment })
}
