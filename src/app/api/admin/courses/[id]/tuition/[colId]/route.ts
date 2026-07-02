import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

// GET /api/admin/courses/[id]/tuition/[colId] — detail + payments
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; colId: string }> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { colId } = await params

  const collection = await prisma.tuitionCollection.findUnique({
    where: { id: colId },
    include: {
      payments: {
        include: {
          enrollment: {
            include: {
              user: { select: { id: true, name: true, phone: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!collection) return NextResponse.json({ success: false, error: 'Không tìm thấy' }, { status: 404 })

  return NextResponse.json({ success: true, data: collection })
}

// PATCH /api/admin/courses/[id]/tuition/[colId] — batch update payments
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; colId: string }> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const body = await req.json()
  // payments: Array<{ id: string; amount?: number; isFree?: boolean; isPaid?: boolean; note?: string }>
  const { payments } = body

  if (!Array.isArray(payments)) {
    return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  // Update each payment
  await Promise.all(
    payments.map(p =>
      prisma.tuitionPayment.update({
        where: { id: p.id },
        data: {
          amount: p.amount !== undefined ? Number(p.amount) : undefined,
          isFree: p.isFree !== undefined ? Boolean(p.isFree) : undefined,
          isPaid: p.isPaid !== undefined ? Boolean(p.isPaid) : undefined,
          paidAt: p.isPaid ? (p.paidAt ?? new Date()) : null,
          note: p.note !== undefined ? p.note : undefined,
        },
      })
    )
  )

  return NextResponse.json({ success: true })
}
