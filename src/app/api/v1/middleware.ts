/**
 * API v1 — Middleware helpers for API key authentication
 *
 * Usage in route handlers:
 *   const auth = await validateApiKey(request)
 *   if (!auth.ok) return auth.response
 *   // auth.orgId, auth.permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export interface ApiKeyContext {
  ok: true
  orgId: string
  permissions: string[]
  keyId: string
}

interface ApiKeyError {
  ok: false
  response: NextResponse
}

/**
 * Validate `Authorization: Bearer avab_sk_...` header.
 * Looks up the key prefix, verifies the hash, checks expiry.
 */
export async function validateApiKey(
  req: NextRequest,
): Promise<ApiKeyContext | ApiKeyError> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Missing Authorization header', code: 'MISSING_AUTH' },
        { status: 401 },
      ),
    }
  }

  const rawKey = auth.slice(7).trim()
  if (!rawKey.startsWith('avab_sk_')) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid API key format', code: 'INVALID_KEY_FORMAT' },
        { status: 401 },
      ),
    }
  }

  // Hash the incoming key with SHA-256 to compare with stored hash
  const incomingHash = createHash('sha256').update(rawKey).digest('hex')

  // Look up by unique key value directly (stored in plaintext index for lookup)
  // The keyHash column stores SHA-256 for offline verification
  const apiKey = await prisma.apiKey.findUnique({
    where: { key: rawKey },
    select: {
      id: true,
      organizationId: true,
      permissions: true,
      isActive: true,
      expiresAt: true,
      keyHash: true,
    },
  })

  if (!apiKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid API key', code: 'INVALID_KEY' },
        { status: 401 },
      ),
    }
  }

  if (!apiKey.isActive) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'API key is deactivated', code: 'KEY_INACTIVE' },
        { status: 401 },
      ),
    }
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'API key has expired', code: 'KEY_EXPIRED' },
        { status: 401 },
      ),
    }
  }

  // Verify hash matches
  if (apiKey.keyHash !== incomingHash) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid API key', code: 'INVALID_KEY' },
        { status: 401 },
      ),
    }
  }

  // Update lastUsedAt async (fire & forget)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => { /* non-critical */ })

  return {
    ok: true,
    orgId: apiKey.organizationId,
    permissions: Array.isArray(apiKey.permissions) ? (apiKey.permissions as string[]) : [],
    keyId: apiKey.id,
  }
}

/**
 * Check if the resolved API key context has the required permission.
 */
export function requirePermission(
  ctx: ApiKeyContext,
  permission: string,
): NextResponse | null {
  if (!ctx.permissions.includes(permission)) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing required permission: ${permission}`,
        code: 'INSUFFICIENT_PERMISSIONS',
      },
      { status: 403 },
    )
  }
  return null
}
