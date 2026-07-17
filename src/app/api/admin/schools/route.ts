import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) return null
  return session
}

// GET /api/admin/schools — list all schools with counts
export async function GET(_req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const schools = await prisma.school.findMany({
    include: {
      _count: { select: { schoolUsers: true, schoolCourses: true } },
      settings: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: schools })
}

// POST /api/admin/schools — create school
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as {
    name: string
    slug?: string
    logo?: string
    domain?: string
    primaryColor?: string
    description?: string
    address?: string
    phone?: string
    email?: string
    settings?: {
      allowSelfRegister?: boolean
      maxStudents?: number | null
      features?: Record<string, boolean>
    }
  }

  const { name, slug, logo, domain, primaryColor, description, address, phone, email, settings } = body

  if (!name) {
    return NextResponse.json({ success: false, error: 'name là bắt buộc' }, { status: 400 })
  }

  const generatedSlug = slug || name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // Check unique slug
  const existingSlug = await prisma.school.findUnique({ where: { slug: generatedSlug } })
  if (existingSlug) {
    return NextResponse.json({ success: false, error: 'Slug đã tồn tại' }, { status: 409 })
  }

  // Check unique domain
  if (domain) {
    const existingDomain = await prisma.school.findUnique({ where: { domain } })
    if (existingDomain) {
      return NextResponse.json({ success: false, error: 'Domain đã tồn tại' }, { status: 409 })
    }
  }

  const school = await prisma.school.create({
    data: {
      name,
      slug: generatedSlug,
      logo: logo || null,
      domain: domain || null,
      primaryColor: primaryColor || '#951F3D',
      description: description || null,
      address: address || null,
      phone: phone || null,
      email: email || null,
      isActive: true,
      settings: settings
        ? {
            create: {
              allowSelfRegister: settings.allowSelfRegister ?? false,
              maxStudents: settings.maxStudents ?? null,
              features: settings.features ?? undefined,
            },
          }
        : undefined,
    },
    include: {
      settings: true,
      _count: { select: { schoolUsers: true, schoolCourses: true } },
    },
  })

  return NextResponse.json({ success: true, data: school }, { status: 201 })
}
