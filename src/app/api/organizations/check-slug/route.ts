import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/

function generateSuggestion(slug: string): string {
  const base = slug.replace(/-\d+$/, '')
  for (let i = 2; i <= 9; i++) {
    const candidate = `${base}-${i}`
    if (candidate.length >= 3 && candidate.length <= 50) return candidate
  }
  return `${base.slice(0, 45)}-2`
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? ''

  if (!slug) {
    return NextResponse.json({ available: false, error: 'Thiếu tham số slug' }, { status: 400 })
  }

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json({
      available: false,
      error: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang (3-50 ký tự)',
    })
  }

  const existing = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ available: true })
  }

  // Slug taken — suggest alternatives
  const suggestion = generateSuggestion(slug)
  return NextResponse.json({ available: false, suggestion })
}
