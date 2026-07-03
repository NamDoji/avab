/**
 * Seed: Học phí cho OB School (chạy sau seed-ob-school.ts)
 * Tạo TuitionCollection + TuitionPayment cho tất cả courses của OB
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: [] })
const rI = (a:number,b:number) => Math.floor(Math.random()*(b-a+1))+a

async function main() {
  console.log('💰 Seeding Học phí OB School...')

  const org = await prisma.organization.findUnique({ where: { slug: 'ob-school' } })
  if (!org) { console.error('Org not found'); return }

  // 1. Lấy tất cả courses của OB
  const courses = await prisma.course.findMany({
    where: { organizationId: org.id },
    select: { id: true, name: true, price: true },
  })
  console.log(`  ${courses.length} courses cần tạo học phí`)

  // 2. Lấy TẤT CẢ enrollments 1 lần
  const courseIds = courses.map(c => c.id)
  const allEnrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds }, status: 'ACTIVE' },
    select: { id: true, userId: true, courseId: true },
  })
  const enrollByCourse: Record<string, typeof allEnrollments> = {}
  for (const e of allEnrollments) {
    if (!enrollByCourse[e.courseId]) enrollByCourse[e.courseId] = []
    enrollByCourse[e.courseId].push(e)
  }

  // 3. Xóa collections cũ của OB (tránh duplicate)
  await prisma.tuitionCollection.deleteMany({
    where: { courseId: { in: courseIds } },
  })

  // 4. Tạo collections + payments
  let totalPaid = 0, totalUnpaid = 0
  const now = Date.now()
  const allPayments: Parameters<typeof prisma.tuitionPayment.createMany>[0]['data'] = []

  for (const course of courses) {
    const price = course.price ?? 4_000_000
    const coll = await prisma.tuitionCollection.create({
      data: {
        courseId:    course.id,
        title:       `Học phí HK1 — 2025-2026`,
        sessions:    4,
        unitAmount:  price,
        totalAmount: price * 4,
        note:        'Học kỳ 1 năm học 2025-2026',
      },
    })

    const enrolls = enrollByCourse[course.id] ?? []
    for (const e of enrolls) {
      const isPaid = Math.random() > 0.25
      if (isPaid) totalPaid++; else totalUnpaid++
      allPayments.push({
        collectionId: coll.id,
        enrollmentId: e.id,
        userId:       e.userId,
        amount:       price * 4,
        isPaid,
        paidAt:       isPaid ? new Date(now - rI(1, 60) * 86_400_000) : null,
      })
    }
  }

  // Batch insert payments in chunks of 500
  const CHUNK = 500
  for (let i = 0; i < allPayments.length; i += CHUNK) {
    await prisma.tuitionPayment.createMany({
      data: allPayments.slice(i, i + CHUNK),
      skipDuplicates: true,
    })
    process.stdout.write(`.`)
  }
  console.log()

  const [nPd, nUpd] = await Promise.all([
    prisma.tuitionPayment.count({ where: { isPaid: true } }),
    prisma.tuitionPayment.count({ where: { isPaid: false } }),
  ])

  console.log(`
✅ Học phí hoàn tất
   Đã thu:   ${nPd} bản ghi (~${Math.round(nPd * 16_000_000 / 1_000_000)}M VND)
   Chưa thu: ${nUpd} bản ghi (công nợ)
`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
