/**
 * seed-thpt.ts — Seed dữ liệu THPT Nguyễn Du (Optimized: batch createMany)
 * Run: npx tsx scripts/seed-thpt.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Data ─────────────────────────────────────────────────────────────────────

const ROLES = [
  { name: 'Hiệu trưởng',        slug: 'hieu-truong',         description: 'Người đứng đầu trường, toàn quyền quản lý', level: 'ORGANIZATION', color: 'red'    },
  { name: 'Hiệu phó',           slug: 'hieu-pho',            description: 'Phó hiệu trưởng, hỗ trợ quản lý',           level: 'ORGANIZATION', color: 'orange' },
  { name: 'Giáo viên chủ nhiệm',slug: 'gv-chu-nhiem',        description: 'GV phụ trách lớp',                           level: 'ACADEMIC',     color: 'blue'   },
  { name: 'Giáo viên bộ môn',   slug: 'gv-bo-mon',           description: 'Giảng dạy môn học',                          level: 'ACADEMIC',     color: 'cyan'   },
  { name: 'Học sinh',           slug: 'hoc-sinh',            description: 'Học sinh trong trường',                      level: 'END_USER',     color: 'green'  },
  { name: 'Phụ huynh',          slug: 'phu-huynh',           description: 'Phụ huynh học sinh',                         level: 'END_USER',     color: 'purple' },
  { name: 'Nhân viên văn phòng',slug: 'nhan-vien-van-phong', description: 'Hành chính, văn thư',                        level: 'OPERATION',    color: 'yellow' },
  { name: 'Kế toán',            slug: 'ke-toan',             description: 'Quản lý tài chính',                          level: 'OPERATION',    color: 'indigo' },
  { name: 'Tư vấn tuyển sinh',  slug: 'tu-van-tuyen-sinh',   description: 'Tư vấn học sinh mới',                        level: 'OPERATION',    color: 'pink'   },
  { name: 'Quản trị hệ thống',  slug: 'quan-tri-he-thong',   description: 'IT Admin, cấu hình hệ thống',                level: 'SYSTEM',       color: 'gray'   },
]

const STAFF = [
  { name: 'Nguyễn Văn Hùng',  email: 'hieututruong@thpt-nguyendu.edu.vn', phone: '0901000001' },
  { name: 'Trần Thị Lan',     email: 'hieupho@thpt-nguyendu.edu.vn',      phone: '0901000002' },
  { name: 'Lê Văn Toán',      email: 'gv.toan@thpt-nguyendu.edu.vn',      phone: '0901000011' },
  { name: 'Phạm Thị Toán',    email: 'gv.toan2@thpt-nguyendu.edu.vn',     phone: '0901000012' },
  { name: 'Nguyễn Thị Văn',   email: 'gv.van@thpt-nguyendu.edu.vn',       phone: '0901000013' },
  { name: 'Hoàng Văn Văn',    email: 'gv.van2@thpt-nguyendu.edu.vn',      phone: '0901000014' },
  { name: 'Bùi Thị Anh',      email: 'gv.anh@thpt-nguyendu.edu.vn',       phone: '0901000015' },
  { name: 'Đặng Văn Lý',      email: 'gv.ly@thpt-nguyendu.edu.vn',        phone: '0901000016' },
  { name: 'Vũ Thị Hóa',       email: 'gv.hoa@thpt-nguyendu.edu.vn',       phone: '0901000017' },
  { name: 'Phan Văn Sinh',     email: 'gv.sinh@thpt-nguyendu.edu.vn',      phone: '0901000018' },
  { name: 'Lý Thị Sử',        email: 'gv.su@thpt-nguyendu.edu.vn',        phone: '0901000019' },
  { name: 'Trương Văn Địa',   email: 'gv.dia@thpt-nguyendu.edu.vn',       phone: '0901000020' },
  { name: 'Ngô Thị GDCD',     email: 'gv.gdcd@thpt-nguyendu.edu.vn',      phone: '0901000021' },
  { name: 'Đinh Văn Tin',     email: 'gv.tin@thpt-nguyendu.edu.vn',       phone: '0901000022' },
  { name: 'Lê Văn Thể',       email: 'gv.theduc@thpt-nguyendu.edu.vn',    phone: '0901000023' },
  { name: 'Phạm Văn Công',    email: 'gv.congnge@thpt-nguyendu.edu.vn',   phone: '0901000024' },
  { name: 'Trần Thị Nông',    email: 'gv.nongnge@thpt-nguyendu.edu.vn',   phone: '0901000025' },
]

const CLASSES = [
  { code: '10A1', name: 'Lớp 10A1', grade: '10', gvcnEmail: 'gv.toan@thpt-nguyendu.edu.vn'  },
  { code: '10A2', name: 'Lớp 10A2', grade: '10', gvcnEmail: 'gv.van@thpt-nguyendu.edu.vn'   },
  { code: '10A3', name: 'Lớp 10A3', grade: '10', gvcnEmail: 'gv.anh@thpt-nguyendu.edu.vn'   },
  { code: '11A1', name: 'Lớp 11A1', grade: '11', gvcnEmail: 'gv.ly@thpt-nguyendu.edu.vn'    },
  { code: '11A2', name: 'Lớp 11A2', grade: '11', gvcnEmail: 'gv.hoa@thpt-nguyendu.edu.vn'   },
  { code: '11A3', name: 'Lớp 11A3', grade: '11', gvcnEmail: 'gv.sinh@thpt-nguyendu.edu.vn'  },
  { code: '12A1', name: 'Lớp 12A1', grade: '12', gvcnEmail: 'gv.su@thpt-nguyendu.edu.vn'    },
  { code: '12A2', name: 'Lớp 12A2', grade: '12', gvcnEmail: 'gv.dia@thpt-nguyendu.edu.vn'   },
  { code: '12A3', name: 'Lớp 12A3', grade: '12', gvcnEmail: 'gv.gdcd@thpt-nguyendu.edu.vn'  },
]

const SUBJECTS_PER_CLASS = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh', 'Sử/Địa', 'Tin học']

// ── Helpers ───────────────────────────────────────────────────────────────────

const LAST  = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý']
const FIRST = ['Minh','Hùng','Lan','Thu','Tú','Dũng','Hà','Linh','Phong','Mai','Nam','Hoa','Tuấn','Nga','Khoa','Thảo','Long','Yến','Đức','Trinh']

function genName(idx: number) { return `${LAST[idx % LAST.length]} ${FIRST[(idx * 3 + 7) % FIRST.length]}` }
function genPhone(idx: number) { return `0${920000000 + idx}` }

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const t0 = Date.now()
  console.log('🚀 Bắt đầu seed THPT Nguyễn Du (batch mode)...\n')

  // ── 1. ROLES ──────────────────────────────────────────────────────────────
  process.stdout.write('📌 [1/8] Roles... ')
  let rolesOk = 0
  for (const r of ROLES) {
    try {
      await prisma.role.upsert({ where: { name: r.name }, create: r, update: { description: r.description } })
      rolesOk++
    } catch { try { await prisma.role.upsert({ where: { slug: r.slug }, create: r, update: {} }); rolesOk++ } catch {} }
  }
  console.log(`✅ ${rolesOk}/${ROLES.length}`)

  // ── 2. ORGANIZATION ───────────────────────────────────────────────────────
  process.stdout.write('🏫 [2/8] Organization... ')
  const org = await prisma.organization.upsert({
    where: { slug: 'thpt-nguyen-du' },
    create: { name: 'THPT Nguyễn Du', slug: 'thpt-nguyen-du', type: 'SCHOOL', country: 'VN', modules: ['erp','finance','crm','hrm','collab','ai'] },
    update: {},
  })
  console.log(`✅ ${org.name}`)

  // ── 3. CAMPUS ─────────────────────────────────────────────────────────────
  process.stdout.write('🏢 [3/8] Campus... ')
  let campus = await prisma.campus.findFirst({ where: { organizationId: org.id, code: 'CS1' } })
  if (!campus) campus = await prisma.campus.create({ data: { organizationId: org.id, code: 'CS1', name: 'Cơ sở chính', address: '123 Nguyễn Du, Q.1, TP.HCM', isActive: true } })
  console.log(`✅ ${campus.name}`)

  // ── 4. STAFF ─────────────────────────────────────────────────────────────
  process.stdout.write('👨‍🏫 [4/8] Staff (17)... ')
  const staffPwd = await bcrypt.hash('Thpt@123456', 10)

  // createMany for users (skipDuplicates handles re-runs)
  await prisma.user.createMany({
    data: STAFF.map(s => ({ name: s.name, email: s.email, phone: s.phone, password: staffPwd, role: 'ADMIN', isActive: true })),
    skipDuplicates: true,
  })

  // Fetch created staff
  const staffUsers = await prisma.user.findMany({ where: { email: { in: STAFF.map(s => s.email) } } })
  const staffMap = Object.fromEntries(staffUsers.map(u => [u.email!, u]))

  // Org + Campus memberships
  await prisma.organizationUser.createMany({
    data: staffUsers.map(u => ({ organizationId: org.id, userId: u.id, orgRole: 'ADMIN' })),
    skipDuplicates: true,
  })
  await prisma.campusUser.createMany({
    data: staffUsers.map(u => ({ campusId: campus!.id, userId: u.id, isPrimary: true })),
    skipDuplicates: true,
  })
  console.log(`✅ ${staffUsers.length}/${STAFF.length}`)

  // ── 5. CLASSES ────────────────────────────────────────────────────────────
  process.stdout.write('📚 [5/8] Classes (9)... ')
  await prisma.course.createMany({
    data: CLASSES.map(cls => ({
      code: cls.code, name: cls.name, grade: cls.grade,
      organizationId: org.id, campusId: campus!.id,
      isActive: true, courseType: 'CLASS', subjectCode: 'CLASS', subjectName: cls.name,
      description: `Lớp ${cls.code} - THPT Nguyễn Du`,
    })),
    skipDuplicates: true,
  })
  const courses = await prisma.course.findMany({ where: { code: { in: CLASSES.map(c => c.code) } } })
  const classMap = Object.fromEntries(courses.map(c => [c.code, c]))
  console.log(`✅ ${courses.length}/${CLASSES.length}`)

  // ── 6. STUDENTS (315) ─────────────────────────────────────────────────────
  process.stdout.write('👨‍🎓 [6/8] Students (315)... ')
  const studentPwd = await bcrypt.hash('Hs@123456', 10)

  // Build all 315 student rows
  const studentEmails: string[] = []
  const studentRows: any[] = []
  for (let idx = 1; idx <= 315; idx++) {
    const email = `hs${idx}@thpt-nguyendu.edu.vn`
    studentEmails.push(email)
    studentRows.push({ name: genName(idx), email, phone: genPhone(idx), password: studentPwd, role: 'STUDENT', isActive: true })
  }

  // Batch create (all 315 in one shot, skip existing)
  await prisma.user.createMany({ data: studentRows, skipDuplicates: true })

  // Fetch all student records
  const allStudents = await prisma.user.findMany({ where: { email: { in: studentEmails } } })
  const studentByEmail = Object.fromEntries(allStudents.map(u => [u.email!, u]))
  console.log(`✅ ${allStudents.length}/315`)

  // Build class→student mapping
  const studentsByClass: Record<string, typeof allStudents> = {}
  let si = 1
  for (const cls of CLASSES) {
    studentsByClass[cls.code] = []
    for (let i = 0; i < 35; i++) {
      const email = `hs${si}@thpt-nguyendu.edu.vn`
      const u = studentByEmail[email]
      if (u) studentsByClass[cls.code].push(u)
      si++
    }
  }

  // Batch enrollments
  process.stdout.write('   ↳ Enrollments... ')
  const enrollRows: any[] = []
  for (const cls of CLASSES) {
    const course = classMap[cls.code]
    if (!course) continue
    for (const student of studentsByClass[cls.code]) {
      enrollRows.push({ userId: student.id, courseId: course.id, organizationId: org.id, campusId: campus!.id, status: 'ACTIVE' })
    }
  }
  const enrollResult = await prisma.enrollment.createMany({ data: enrollRows, skipDuplicates: true })
  console.log(`✅ ${enrollResult.count} enrollments`)

  // ── 7. SUBJECTS ──────────────────────────────────────────────────────────
  process.stdout.write('📖 [7/8] Subjects (72)... ')
  const subjectRows: any[] = []
  for (const cls of CLASSES) {
    const course = classMap[cls.code]
    if (!course) continue
    for (let i = 0; i < SUBJECTS_PER_CLASS.length; i++) {
      subjectRows.push({ courseId: course.id, organizationId: org.id, name: SUBJECTS_PER_CLASS[i], order: i + 1, isActive: true })
    }
  }

  // Check existing subjects first (no unique constraint → manual dedup)
  const existingSubjects = await prisma.subject.findMany({
    where: { courseId: { in: courses.map(c => c.id) } },
    select: { courseId: true, name: true, id: true },
  })
  const existingSubjSet = new Set(existingSubjects.map(s => `${s.courseId}::${s.name}`))
  const newSubjectRows = subjectRows.filter(r => !existingSubjSet.has(`${r.courseId}::${r.name}`))

  let subjectCreated = 0
  if (newSubjectRows.length > 0) {
    const res = await prisma.subject.createMany({ data: newSubjectRows, skipDuplicates: true })
    subjectCreated = res.count
  }
  const totalSubjects = existingSubjSet.size + subjectCreated
  console.log(`✅ ${totalSubjects} total (${subjectCreated} new, ${existingSubjSet.size} existed)`)

  // Fetch all subjects for later use
  const allSubjects = await prisma.subject.findMany({ where: { courseId: { in: courses.map(c => c.id) } } })
  const subjectsByClass: Record<string, typeof allSubjects> = {}
  for (const cls of CLASSES) {
    const course = classMap[cls.code]
    if (!course) continue
    subjectsByClass[cls.code] = allSubjects.filter(s => s.courseId === course.id)
  }

  // ── 8a. ATTENDANCE ────────────────────────────────────────────────────────
  process.stdout.write('📅 [8/8a] Attendance (30d × 315 HS ≈ 9 450)... ')
  const today = new Date()
  const attendanceRows: any[] = []

  for (const cls of CLASSES) {
    const course = classMap[cls.code]
    if (!course) continue
    const students = studentsByClass[cls.code]
    for (let d = 0; d < 30; d++) {
      const dt = new Date(today)
      dt.setDate(today.getDate() - 29 + d)
      const dateOnly = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()))
      for (const student of students) {
        const r = Math.random()
        attendanceRows.push({
          courseId: course.id,
          userId: student.id,
          date: dateOnly,
          status: r < 0.85 ? 'present' : r < 0.95 ? 'late' : 'absent',
        })
      }
    }
  }

  // Insert in 1 000-row batches
  let attTotal = 0
  const ABATCH = 1000
  for (let i = 0; i < attendanceRows.length; i += ABATCH) {
    const chunk = attendanceRows.slice(i, i + ABATCH)
    try {
      const r = await prisma.attendance.createMany({ data: chunk, skipDuplicates: true })
      attTotal += r.count
    } catch (e: any) { console.error(`\n  ❌ att batch ${i}: ${e?.message}`) }
  }
  console.log(`✅ ${attTotal} records`)

  // ── 8b. TUITION ───────────────────────────────────────────────────────────
  process.stdout.write('💰 [8/8b] Tuition tháng 7/2026... ')
  let collCount = 0, payCount = 0

  // Fetch all enrollments at once
  const allEnrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courses.map(c => c.id) } },
    select: { id: true, userId: true, courseId: true },
  })
  const enrollByUserCourse = Object.fromEntries(allEnrollments.map(e => [`${e.userId}::${e.courseId}`, e.id]))

  for (const cls of CLASSES) {
    const course = classMap[cls.code]
    if (!course) continue
    const students = studentsByClass[cls.code]
    const collTitle = `Thu học phí tháng 7/2026 - ${cls.name}`

    let collection = await prisma.tuitionCollection.findFirst({ where: { courseId: course.id, title: collTitle } })
    if (!collection) {
      collection = await prisma.tuitionCollection.create({
        data: { organizationId: org.id, campusId: campus!.id, courseId: course.id, title: collTitle, sessions: 1, unitAmount: 1_500_000, totalAmount: 1_500_000, note: 'Học phí tháng 7/2026' },
      })
      collCount++
    }

    const payRows: any[] = []
    for (let i = 0; i < students.length; i++) {
      const enrollId = enrollByUserCourse[`${students[i].id}::${course.id}`]
      if (!enrollId) continue
      const isPaid = i < 30
      payRows.push({ collectionId: collection.id, enrollmentId: enrollId, userId: students[i].id, amount: 1_500_000, isPaid, paidAt: isPaid ? new Date('2026-07-05T07:00:00Z') : null })
    }
    const r = await prisma.tuitionPayment.createMany({ data: payRows, skipDuplicates: true })
    payCount += r.count
  }
  console.log(`✅ ${collCount} collections, ${payCount} payments`)

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('📊  KẾT QUẢ SEED — THPT NGUYỄN DU')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`  ✅ Roles seeded:           ${rolesOk}/${ROLES.length}`)
  console.log(`  ✅ Organization + Campus:  ${org.name} + ${campus!.name}`)
  console.log(`  ✅ Staff seeded:           ${staffUsers.length}/${STAFF.length}`)
  console.log(`  ✅ Lớp học:               ${courses.length}/${CLASSES.length}`)
  console.log(`  ✅ Học sinh:              ${allStudents.length}/315`)
  console.log(`  ✅ Subjects:              ${totalSubjects} (${subjectCreated} mới)`)
  console.log(`  ✅ Attendance records:    ${attTotal}`)
  console.log(`  ✅ Học phí:              ${collCount} collections, ${payCount} payments`)
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`  ⏱  Tổng thời gian: ${elapsed}s`)
  console.log('═══════════════════════════════════════════════════════════════')
}

main()
  .catch(e => { console.error('\n💥 Fatal:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
