/**
 * /api/admin/app-center/api-keys
 *
 * GET    — list active API keys for the current org
 * POST   — create a new API key
 * DELETE ?id=xxx — deactivate an API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'
import { randomBytes, createHash } from 'crypto'

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

// ─────────────────────────────────────────────────────────────────────────────
// Key generation
// ─────────────────────────────────────────────────────────────────────────────

function generateApiKey(): { raw: string; hash: string } {
  const entropy = randomBytes(32).toString('hex')
  const raw = `avab_sk_live_${entropy}`
  const hash = createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — list keys
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const orgCtx = await getOrganizationContext(check.userId)
  if (!orgCtx) {
    return NextResponse.json({ success: true, data: [] })
  }

  const keys = await prisma.apiKey.findMany({
    where: { organizationId: orgCtx.id, isActive: true },
    select: {
      id: true,
      name: true,
      key: true,
      permissions: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: keys })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — create key
// ─────────────────────────────────────────────────────────────────────────────

interface CreateBody {
  name: string
  permissions: string[]
  expiresAt?: string | null
}

const VALID_PERMISSIONS = new Set([
  'courses.read', 'courses.write',
  'students.read', 'students.write',
  'enrollments.read', 'enrollments.write',
  'payments.read', 'payments.write',
  'analytics.read',
])

export async function POST(req: NextRequest) {
  const check = await requireAdmin()
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }

  const orgCtx = await getOrganizationContext(check.userId)
  if (!orgCtx) {
    return NextResponse.json(
      { success: false, error: 'Tài khoản chưa thuộc tổ chức nào' },
      { status: 400 },
    )
  }

  let body: CreateBody
  try {
    body = await req.json() as CreateBody
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON không hợp lệ' }, { status: 400 })
  }

  const { name, permissions, expiresAt } = body

  if (!name?.trim()) {
    return NextResponse.json({ success: false, error: 'Tên key không được để trống' }, { status: 400 })
  }

  if (!Array.isArray(permissions) || permissions.length === 0) {
    return NextResponse.json({ success: false, error: 'Cần ít nhất một quyền' }, { status: 400 })
  }

  const invalidPerms = permissions.filter((p) => !VALID_PERMISSIONS.has(p))
  if (invalidPerms.length > 0) {
    return NextResponse.json(
      { success: false, error: `Quyền không hợp lệ: ${invalidPerms.join(', ')}` },
      { status: 400 },
    )
  }

  const { raw, hash } = generateApiKey()

  const created = await prisma.apiKey.create({
    data: {
      organizationId: orgCtx.id,
      name: name.trim(),
      key: raw,
      keyHash: hash,
      permissions,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: check.userId,
    },
    select: {
      id: true,
      name: true,
      key: true,
      permissions: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    success: true,
    data: { ...created, rawKey: raw },
  }, { status: 201 })
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — deactivate key
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

  // Ensure key belongs to this org
  const existing = await prisma.apiKey.findFirst({
    where: { id, organizationId: orgCtx.id },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy API key' }, { status: 404 })
  }

  await prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
