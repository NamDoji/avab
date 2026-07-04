/**
 * /api/admin/app-center/webhooks
 *
 * GET    — list webhooks for the current org
 * POST   — add a new webhook endpoint
 * PATCH  — toggle isActive
 * DELETE ?id=xxx — delete a webhook endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'
import { randomBytes } from 'crypto'

// ─────────────────────────────────────────────────────────────────────────────
// Auth helper
// ─────────────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Vui lòng đăng nhập', status: 401 as const }
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return { error: 'Không có quyền truy cập', status: 403 as const }
  }
  return { session, userId: (session.user as { id?: string })?.id ?? '' }
}

const VALID_EVENTS = new Set([
  'enrollment.created',
  'payment.received',
  'student.created',
  'course.published',
])

// ─────────────────────────────────────────────────────────────────────────────
// GET — list webhooks
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const orgCtx = await getOrganizationContext(check.userId)
  if (!orgCtx) return NextResponse.json({ success: true, data: [] })

  const webhooks = await prisma.webhookEndpoint.findMany({
    where: { organizationId: orgCtx.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      url: true,
      events: true,
      isActive: true,
      lastDeliveredAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ success: true, data: webhooks })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — create webhook
// ─────────────────────────────────────────────────────────────────────────────

interface CreateBody {
  url: string
  events: string[]
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const orgCtx = await getOrganizationContext(check.userId)
  if (!orgCtx) {
    return NextResponse.json({ success: false, error: 'Tài khoản chưa thuộc tổ chức nào' }, { status: 400 })
  }

  let body: CreateBody
  try {
    body = await req.json() as CreateBody
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON không hợp lệ' }, { status: 400 })
  }

  const { url, events } = body

  if (!url?.trim()) {
    return NextResponse.json({ success: false, error: 'URL không được để trống' }, { status: 400 })
  }

  try { new URL(url) } catch {
    return NextResponse.json({ success: false, error: 'URL không hợp lệ' }, { status: 400 })
  }

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ success: false, error: 'Cần ít nhất một sự kiện' }, { status: 400 })
  }

  const invalidEvents = events.filter((e) => !VALID_EVENTS.has(e))
  if (invalidEvents.length > 0) {
    return NextResponse.json(
      { success: false, error: `Sự kiện không hợp lệ: ${invalidEvents.join(', ')}` },
      { status: 400 },
    )
  }

  // Generate a secret for HMAC signing
  const secret = `whsec_${randomBytes(32).toString('hex')}`

  const created = await prisma.webhookEndpoint.create({
    data: {
      organizationId: orgCtx.id,
      url: url.trim(),
      secret,
      events,
    },
    select: {
      id: true,
      url: true,
      events: true,
      isActive: true,
      lastDeliveredAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ success: true, data: created }, { status: 201 })
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH — toggle isActive
// ─────────────────────────────────────────────────────────────────────────────

interface PatchBody { id: string; isActive: boolean }

export async function PATCH(req: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const orgCtx = await getOrganizationContext(check.userId)
  if (!orgCtx) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy tổ chức' }, { status: 400 })
  }

  let body: PatchBody
  try {
    body = await req.json() as PatchBody
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON không hợp lệ' }, { status: 400 })
  }

  const existing = await prisma.webhookEndpoint.findFirst({
    where: { id: body.id, organizationId: orgCtx.id },
  })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy webhook' }, { status: 404 })
  }

  await prisma.webhookEndpoint.update({
    where: { id: body.id },
    data: { isActive: body.isActive },
  })

  return NextResponse.json({ success: true })
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — remove webhook
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const orgCtx = await getOrganizationContext(check.userId)
  if (!orgCtx) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy tổ chức' }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ success: false, error: 'Thiếu id' }, { status: 400 })
  }

  const existing = await prisma.webhookEndpoint.findFirst({
    where: { id, organizationId: orgCtx.id },
  })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy webhook' }, { status: 404 })
  }

  await prisma.webhookEndpoint.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
