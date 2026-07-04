import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) return null
  return session
}

type Params = { params: Promise<{ id: string }> }

// GET /api/admin/schools/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      settings: true,
      _count: { select: { schoolUsers: true, schoolCourses: true } },
    },
  })

  if (!school) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy trường' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: school })
}

// PUT /api/admin/schools/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json() as {
    name?: string
    slug?: string
    logo?: string | null
    domain?: string | null
    primaryColor?: string
    description?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    isActive?: boolean
    settings?: {
      allowSelfRegister?: boolean
      maxStudents?: number | null
      features?: Record<string, boolean>
    }
  }

  const existing = await prisma.school.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy trường' }, { status: 404 })
  }

  // Check slug uniqueness if changed
  if (body.slug && body.slug !== existing.slug) {
    const dupe = await prisma.school.findUnique({ where: { slug: body.slug } })
    if (dupe) {
      return NextResponse.json({ success: false, error: 'Slug đã tồn tại' }, { status: 409 })
    }
  }

  // Check domain uniqueness if changed
  if (body.domain && body.domain !== existing.domain) {
    const dupe = await prisma.school.findUnique({ where: { domain: body.domain } })
    if (dupe) {
      return NextResponse.json({ success: false, error: 'Domain đã tồn tại' }, { status: 409 })
    }
  }

  const school = await prisma.school.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.logo !== undefined && { logo: body.logo }),
      ...(body.domain !== undefined && { domain: body.domain }),
      ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    include: {
      settings: true,
      _count: { select: { schoolUsers: true, schoolCourses: true } },
    },
  })

  // Update settings if provided
  if (body.settings) {
    await prisma.schoolSettings.upsert({
      where: { schoolId: id },
      update: {
        ...(body.settings.allowSelfRegister !== undefined && { allowSelfRegister: body.settings.allowSelfRegister }),
        ...(body.settings.maxStudents !== undefined && { maxStudents: body.settings.maxStudents }),
        ...(body.settings.features !== undefined && { features: (body.settings.features as Record<string,boolean>) }),
      },
      create: {
        schoolId: id,
        allowSelfRegister: body.settings.allowSelfRegister ?? false,
        maxStudents: body.settings.maxStudents ?? null,
        features: body.settings.features ?? undefined,
      },
    })
  }

  return NextResponse.json({ success: true, data: school })
}

// DELETE /api/admin/schools/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.school.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy trường' }, { status: 404 })
  }

  await prisma.school.delete({ where: { id } })

  return NextResponse.json({ success: true, message: 'Đã xóa trường thành công' })
}
