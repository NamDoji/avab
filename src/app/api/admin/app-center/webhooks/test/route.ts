/**
 * POST /api/admin/app-center/webhooks/test
 * Send a test ping to a webhook URL before saving it.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { url?: string }
  try {
    body = await req.json() as { url?: string }
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  if (!body.url) {
    return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 })
  }

  try {
    new URL(body.url)
  } catch {
    return NextResponse.json({ success: false, error: 'URL không hợp lệ' }, { status: 400 })
  }

  const payload = {
    event: 'ping',
    source: 'avab',
    timestamp: new Date().toISOString(),
    message: 'This is a test webhook from AvaB',
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(body.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AvaB-Event': 'ping',
        'X-AvaB-Delivery': `test_${Date.now()}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    return NextResponse.json({
      success: response.ok,
      message: response.ok
        ? `Webhook phản hồi ${response.status} — OK`
        : `Webhook trả về ${response.status}`,
      statusCode: response.status,
    })
  } catch (err) {
    const msg = err instanceof Error && err.name === 'AbortError'
      ? 'Timeout — URL không phản hồi trong 8 giây'
      : 'Không thể kết nối đến URL'

    return NextResponse.json({ success: false, message: msg })
  }
}
