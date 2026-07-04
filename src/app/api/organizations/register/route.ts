import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/

interface RegisterPayload {
  orgName: string
  orgType: string
  orgCity?: string
  orgSize?: string
  slug: string
  adminName: string
  adminPhone: string
  adminEmail: string
  adminPassword: string
  adminTitle?: string
  modules: string[]
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterPayload = await req.json()

    const {
      orgName,
      orgType,
      orgCity,
      slug,
      adminName,
      adminPhone,
      adminEmail,
      adminPassword,
      adminTitle,
      modules,
    } = body

    // ── Validate required fields ────────────────────────────────────────────
    if (!orgName?.trim()) {
      return NextResponse.json({ error: 'Tên tổ chức không được để trống' }, { status: 400 })
    }
    if (!slug?.trim() || !SLUG_REGEX.test(slug)) {
      return NextResponse.json({ error: 'Slug không hợp lệ' }, { status: 400 })
    }
    if (!adminName?.trim() || !adminPhone?.trim() || !adminEmail?.trim() || !adminPassword) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin admin' }, { status: 400 })
    }
    if (adminPassword.length < 8) {
      return NextResponse.json({ error: 'Mật khẩu tối thiểu 8 ký tự' }, { status: 400 })
    }

    // ── Check slug availability ─────────────────────────────────────────────
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (existingOrg) {
      return NextResponse.json({ error: 'Slug đã được sử dụng, vui lòng chọn tên khác' }, { status: 409 })
    }

    // ── Check email / phone uniqueness ─────────────────────────────────────
    const [existingPhone, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { phone: adminPhone }, select: { id: true } }),
      adminEmail
        ? prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } })
        : Promise.resolve(null),
    ])
    if (existingPhone) {
      return NextResponse.json({ error: 'Số điện thoại đã được đăng ký' }, { status: 409 })
    }
    if (existingEmail) {
      return NextResponse.json({ error: 'Email đã được đăng ký' }, { status: 409 })
    }

    // ── Hash password ───────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // ── Transaction: create org + user + membership + campus + academic year ─
    const now = new Date()
    const currentYear = now.getFullYear()
    const academicYearName = now.getMonth() >= 8
      ? `Năm học ${currentYear}-${currentYear + 1}`
      : `Năm học ${currentYear - 1}-${currentYear}`
    const ayStart = now.getMonth() >= 8
      ? new Date(currentYear, 8, 1)        // Sep this year
      : new Date(currentYear - 1, 8, 1)   // Sep last year
    const ayEnd = new Date(ayStart.getFullYear() + 1, 5, 30) // Jun next year

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: orgName.trim(),
          slug,
          type: orgType || 'CENTER',
          modules: modules.length > 0 ? modules : ['erp', 'finance'],
          settings: {
            city: orgCity ?? '',
            adminTitle: adminTitle ?? '',
            registeredAt: now.toISOString(),
          },
          isActive: true,
        },
      })

      // 2. Create Admin User
      const user = await tx.user.create({
        data: {
          name: adminName.trim(),
          phone: adminPhone.trim(),
          email: adminEmail.trim() || undefined,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      })

      // 3. Link user as OWNER of org
      await tx.organizationUser.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          orgRole: 'OWNER',
          isDefault: true,
        },
      })

      // 4. Create default Campus (cơ sở chính)
      await tx.campus.create({
        data: {
          organizationId: org.id,
          name: `${orgName.trim()} — Cơ sở chính`,
          code: 'MAIN',
          isActive: true,
        },
      })

      // 5. Create current AcademicYear
      await tx.academicYear.create({
        data: {
          organizationId: org.id,
          name: academicYearName,
          startDate: ayStart,
          endDate: ayEnd,
          isCurrent: true,
        },
      })

      return { org, user }
    })

    return NextResponse.json({
      success: true,
      orgId: result.org.id,
      slug,
      workspaceUrl: `${slug}.avab.vn/admin`,
      orgName: result.org.name,
    })
  } catch (err) {
    console.error('[POST /api/organizations/register]', err)
    return NextResponse.json({ error: 'Đã có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
  }
}
