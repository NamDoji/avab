import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding default school: AvaB Education...')

  // 1. Upsert School
  const school = await prisma.school.upsert({
    where: { slug: 'avab' },
    update: {
      name: 'AvaB Education',
      primaryColor: '#7c3aed',
      description: 'Nền tảng giáo dục AI hàng đầu dành cho K12 Việt Nam',
      isActive: true,
    },
    create: {
      name: 'AvaB Education',
      slug: 'avab',
      primaryColor: '#7c3aed',
      description: 'Nền tảng giáo dục AI hàng đầu dành cho K12 Việt Nam',
      isActive: true,
    },
  })
  console.log(`✅ School upserted: ${school.id} (${school.slug})`)

  // 2. Upsert SchoolSettings
  await prisma.schoolSettings.upsert({
    where: { schoolId: school.id },
    update: {
      allowSelfRegister: false,
      maxStudents: null,
      features: {
        gamification: true,
        ai_studio: true,
        publishing: true,
      },
    },
    create: {
      schoolId: school.id,
      allowSelfRegister: false,
      maxStudents: null,
      features: {
        gamification: true,
        ai_studio: true,
        publishing: true,
      },
    },
  })
  console.log('✅ SchoolSettings upserted')

  // 3. Link all existing users to this school
  const users = await prisma.user.findMany({ select: { id: true } })
  console.log(`👤 Found ${users.length} users to link`)

  let userLinked = 0
  for (const user of users) {
    try {
      await prisma.schoolUser.upsert({
        where: { schoolId_userId: { schoolId: school.id, userId: user.id } },
        update: {},
        create: {
          schoolId: school.id,
          userId: user.id,
          role: 'STUDENT',
        },
      })
      userLinked++
    } catch (_e) {
      // skip duplicates silently
    }
  }
  console.log(`✅ Linked ${userLinked} users to school`)

  // 4. Link all existing courses to this school
  const courses = await prisma.course.findMany({ select: { id: true } })
  console.log(`📚 Found ${courses.length} courses to link`)

  let courseLinked = 0
  for (const course of courses) {
    try {
      await prisma.schoolCourse.upsert({
        where: { schoolId_courseId: { schoolId: school.id, courseId: course.id } },
        update: {},
        create: {
          schoolId: school.id,
          courseId: course.id,
        },
      })
      courseLinked++
    } catch (_e) {
      // skip duplicates silently
    }
  }
  console.log(`✅ Linked ${courseLinked} courses to school`)

  console.log('\n🎉 Done! Default school seeded successfully.')
  console.log(`   School ID: ${school.id}`)
  console.log(`   School slug: ${school.slug}`)
}

main()
  .catch(err => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
