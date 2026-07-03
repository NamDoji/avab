/**
 * Seed default K12 Curricula
 * Run once: npx tsx scripts/seed-curricula.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding K12 Curricula...')

  const result = await prisma.curriculum.createMany({
    data: [
      {
        code: 'K12-VN',
        name: 'Chương trình K12 Việt Nam',
        description: 'Chương trình giáo dục phổ thông quốc gia Việt Nam (Lớp 1–12)',
        gradeMin: 1,
        gradeMax: 12,
        ageMin: 6,
        ageMax: 18,
      },
      {
        code: 'THINKING-MATH',
        name: 'Toán Tư Duy (Tất cả cấp)',
        description: 'Chương trình Toán Tư Duy phát triển tư duy logic và sáng tạo',
        gradeMin: 1,
        gradeMax: 9,
        ageMin: 5,
        ageMax: 15,
      },
      {
        code: 'CAMBRIDGE',
        name: 'Cambridge International',
        description: 'Chương trình Cambridge International (Primary → A Level)',
        gradeMin: 1,
        gradeMax: 12,
      },
      {
        code: 'PRESCHOOL',
        name: 'Mầm non',
        description: 'Chương trình giáo dục Mầm non (3–5 tuổi)',
        gradeMin: 0,
        gradeMax: 0,
        ageMin: 3,
        ageMax: 5,
      },
      {
        code: 'IELTS',
        name: 'IELTS Preparation',
        description: 'Luyện thi IELTS từ 7.0 trở lên',
        gradeMin: 7,
        gradeMax: 12,
      },
      {
        code: 'IB-PYP',
        name: 'IB Primary Years Programme',
        description: 'International Baccalaureate PYP (Ages 3–12)',
        gradeMin: 1,
        gradeMax: 6,
        ageMin: 3,
        ageMax: 12,
      },
    ],
    skipDuplicates: true,
  })

  console.log(`✅ Created ${result.count} curricula (skipped existing)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
