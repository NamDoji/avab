/**
 * Current Org Session Helper
 *
 * Active org is stored in a secure HTTP-only cookie (not URL param).
 * This allows users belonging to multiple orgs to switch context
 * without exposing the org ID in the address bar.
 */

import type { NextRequest } from 'next/server'

export const CURRENT_ORG_COOKIE = 'avab-current-org'

/**
 * Read the currently active org ID from the request cookie.
 * Returns null when the cookie is absent or empty.
 */
export function getCurrentOrgFromRequest(req: NextRequest): string | null {
  return req.cookies.get(CURRENT_ORG_COOKIE)?.value ?? null
}
