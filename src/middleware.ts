/**
 * AvaB Multi-Tenant Middleware
 *
 * Detects organization from:
 *   1. Subdomain: ob-school.avab.vn → x-org-slug: ob-school
 *   2. Custom domain: newton.edu.vn → x-org-slug via DB lookup
 *   3. Default: avab.vn → platform routes (no org context)
 *
 * Sets headers:
 *   x-org-slug    — organization slug (empty = platform)
 *   x-workspace   — "true" if request is in org workspace
 */

import { NextRequest, NextResponse } from 'next/server'

const PLATFORM_DOMAINS = [
  'avab.vn',
  'www.avab.vn',
  'localhost',
  'localhost:3000',
  '127.0.0.1',
]

// Subdomains reserved for platform (not org slugs)
const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'cdn', 'mail', 'admin', 'app', 'docs', 'help',
])

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? ''
  const res      = NextResponse.next()

  // Strip port for local dev
  const host = hostname.replace(/:\d+$/, '')

  // Check if it's a known platform domain
  if (PLATFORM_DOMAINS.includes(host)) {
    res.headers.set('x-workspace', 'false')
    res.headers.set('x-org-slug', '')
    return res
  }

  // Check for subdomain: xxx.avab.vn
  const isAVABSubdomain = host.endsWith('.avab.vn')
  if (isAVABSubdomain) {
    const subdomain = host.replace('.avab.vn', '').split('.')[0]
    if (!RESERVED_SUBDOMAINS.has(subdomain)) {
      res.headers.set('x-workspace', 'true')
      res.headers.set('x-org-slug', subdomain)
      return res
    }
  }

  // Custom domain: pass x-org-domain for API to look up
  if (!isAVABSubdomain && !PLATFORM_DOMAINS.includes(host)) {
    res.headers.set('x-workspace', 'true')
    res.headers.set('x-org-domain', host)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.png).*)',
  ],
}
