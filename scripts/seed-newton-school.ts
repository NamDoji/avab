/**
 * Seed: Trường Newton — Test accounts dễ nhớ
 * Admin: 0801000001 / Newton@admin
 * GV:    0801000002 / Newton@gv01
 * HS:    0801000003 / Newton@hs01
 *
 * Chạy: export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/seed-newton-school.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({ log: [] })

async function main() {
  console.log('🏫  Seeding Newton School...\n')

  const ADMIN_PASS  = await bcrypt.hash('Newton@admin', 10)
  const TEACHER_PASS = await bcrypt.hash('Newton@gv01',  10)
  const STUDENT_PASS = await bcrypt.hash('Newton@hs01',  10)

  // ── 1. Organization ────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where:  { slug: 'newton-school' },
    create: {
      name: 'Hệ thống Trường Newton',
      slug: 'newton-school',
      type: 'CHAIN',
      modules: ['erp','finance','crm','hrm','analytics','ai-studio'],
      settings: { theme: 'violet' },
    },
    update: {},
  })
  console.log(`✅ Org: ${org.name}  (id=${org.id})`)

  // ── 2. Academic Year ───────────────────────────────────────────────────────
  await prisma.academicYear.upsert({
    where:  { id: 'newton-ay-2526' },
    create: {
      id: 'newton-ay-2526',
      organizationId: org.id,
      name: 'Năm học 2025-2026',
      startDate: new Date('2025-09-01'),
      endDate:   new Date('2026-06-30'),
      isCurrent: true,
    },
    update: { isCurrent: true },
  })

  // ── 3. Campus ──────────────────────────────────────────────────────────────
  const campus = await prisma.campus.upsert({
    where:  { id: 'newton-campus-q3' },
    create: {
      id: 'newton-campus-q3',
      organizationId: org.id,
      name: 'Newton Quận 3',
      code: 'NTQ3',
      address: '100 Điện Biên Phủ, Q.3, HCM',
    },
    update: {},
  })
  console.log(`✅ Campus: ${campus.name}`)

  // ── 4. Admin (quyền to nhất) ───────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where:  { phone: '0801000001' },
    create: { name: 'Newton Admin', phone: '0801000001', password: ADMIN_PASS, role: 'SUPER_ADMIN' },
    update: { password: ADMIN_PASS, role: 'SUPER_ADMIN' },
  })
  await prisma.organizationUser.upsert({
    where:  { organizationId_userId: { organizationId: org.id, userId: admin.id } },
    create: { organizationId: org.id, userId: admin.id, orgRole: 'OWNER', isDefault: true },
    update: { orgRole: 'OWNER' },
  })
  await prisma.campusUser.upsert({
    where:  { campusId_userId: { campusId: campus.id, userId: admin.id } },
    create: { campusId: campus.id, userId: admin.id, campusRole: 'PRINCIPAL', isPrimary: true },
    update: {},
  })
  console.log(`✅ Admin: ${admin.name}  (${admin.phone})`)

  // ── 5. Giáo viên ──────────────────────────────────────────────────────────
  const teacher = await prisma.user.upsert({
    where:  { phone: '0801000002' },
    create: { name: 'Nguyễn Thị Hương (GV Newton)', phone: '0801000002', password: TEACHER_PASS, role: 'TEACHER' },
    update: { password: TEACHER_PASS },
  })
  await prisma.organizationUser.upsert({
    where:  { organizationId_userId: { organizationId: org.id, userId: teacher.id } },
    create: { organizationId: org.id, userId: teacher.id, orgRole: 'MEMBER', isDefault: true },
    update: {},
  })
  await prisma.campusUser.upsert({
    where:  { campusId_userId: { campusId: campus.id, userId: teacher.id } },
    create: { campusId: campus.id, userId: teacher.id, campusRole: 'TEACHER', isPrimary: true },
    update: {},
  })
  console.log(`✅ GV: ${teacher.name}  (${teacher.phone})`)

  // ── 6. Course cho GV dạy ──────────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where:  { code: 'NEWTON-TOAN10-2526' },
    create: {
      code: 'NEWTON-TOAN10-2526',
      name: 'Toán 10 Newton 2025-2026',
      subjectCode: 'MATH',
      subjectName: 'Toán THPT',
      gradeMin: 10,
      gradeMax: 10,
      organizationId: org.id,
      campusId: campus.id,
      price: 5_000_000,
      approvalStatus: 'published',
      isPublic: false,
    },
    update: {},
  })
  console.log(`✅ Course: ${course.name}`)

  // ── 7. Học sinh ───────────────────────────────────────────────────────────
  const student = await prisma.user.upsert({
    where:  { phone: '0801000003' },
    create: { name: 'Trần Văn An (HS Newton)', phone: '0801000003', password: STUDENT_PASS, role: 'STUDENT' },
    update: { password: STUDENT_PASS },
  })
  await prisma.organizationUser.upsert({
    where:  { organizationId_userId: { organizationId: org.id, userId: student.id } },
    create: { organizationId: org.id, userId: student.id, orgRole: 'MEMBER', isDefault: true },
    update: {},
  })

  // Enroll student vào course
  const existingEnroll = await prisma.enrollment.findFirst({
    where: { userId: student.id, courseId: course.id }
  })
  if (!existingEnroll) {
    await prisma.enrollment.create({
      data: {
        courseId: course.id,
        userId: student.id,
        status: 'ACTIVE',
        organizationId: org.id,
        campusId: campus.id,
      },
    })
  }
  console.log(`✅ HS: ${student.name}  (${student.phone}) → enrolled in ${course.title}`)

  // ── 8. Summary ─────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(55))
  console.log('🎉  NEWTON SCHOOL — TÀI KHOẢN TEST')
  console.log('='.repeat(55))
  console.log(`  🔑 SUPER ADMIN  : 0801000001 / Newton@admin`)
  console.log(`  👩‍🏫 GIÁO VIÊN   : 0801000002 / Newton@gv01`)
  console.log(`  🎒 HỌC SINH     : 0801000003 / Newton@hs01`)
  console.log('='.repeat(55))
  console.log(`  Org slug: newton-school`)
  console.log(`  Campus  : Newton Quận 3  (NTQ3)`)
  console.log('='.repeat(55) + '\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
