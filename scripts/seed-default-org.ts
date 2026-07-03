import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Tạo default org
  const org = await prisma.organization.upsert({
    where: { slug: 'avab-demo' },
    create: {
      name: 'AvaB Demo',
      slug: 'avab-demo',
      type: 'CENTER',
      modules: ['ai-studio', 'erp', 'finance', 'crm', 'analytics'],
      settings: { theme: 'violet', locale: 'vi' },
    },
    update: {},
  })

  // 2. Tạo default campus
  const campus = await prisma.campus.upsert({
    where: { id: 'default-campus' },
    create: {
      id: 'default-campus',
      organizationId: org.id,
      name: 'Cơ sở chính',
      code: 'MAIN',
      isActive: true,
    },
    update: {},
  })

  // 3. Tạo academic year 2025-2026
  await prisma.academicYear.upsert({
    where: { id: 'ay-2025-2026' },
    create: {
      id: 'ay-2025-2026',
      organizationId: org.id,
      name: 'Năm học 2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      isCurrent: true,
    },
    update: { isCurrent: true },
  })

  // 4. Gán tất cả ADMIN users vào org
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
  for (const admin of admins) {
    await prisma.organizationUser.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: admin.id } },
      create: { organizationId: org.id, userId: admin.id, orgRole: 'OWNER' },
      update: {},
    })
  }

  // 5. Update existing courses để thuộc default org
  await prisma.course.updateMany({
    where: { organizationId: null },
    data: { organizationId: org.id },
  })

  console.log('✅ Default org seeded:', org.id, '| Campus:', campus.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
