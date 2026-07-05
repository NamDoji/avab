/**
 * seed-thpt.ts — Seed dữ liệu THPT Nguyễn Du
 * Run: npx tsx scripts/seed-thpt.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Roles ─────────────────────────────────────────────────────────────────────

const ROLES = [
  { name: 'Hiệu trưởng',        slug: 'hieu-truong',        description: 'Người đứng đầu trường, toàn quyền quản lý',   level: 'ORGANIZATION', color: 'red'    },
  { name: 'Hiệu phó',           slug: 'hieu-pho',           description: 'Phó hiệu trưởng, hỗ trợ quản lý',             level: 'ORGANIZATION', color: 'orange' },
  { name: 'Giáo viên chủ nhiệm',slug: 'gv-chu-nhiem',       description: 'GV phụ trách lớp',                             level: 'ACADEMIC',     color: 'blue'   },
  { name: 'Giáo viên bộ môn',   slug: 'gv-bo-mon',          description: 'Giảng dạy môn học',                            level: 'ACADEMIC',     color: 'cyan'   },
  { name: 'Học sinh',           slug: 'hoc-sinh',           description: 'Học sinh trong trường',                        level: 'END_USER',     color: 'green'  },
  { name: 'Phụ huynh',          slug: 'phu-huynh',          description: 'Phụ huynh học sinh',                           level: 'END_USER',     color: 'purple' },
  { name: 'Nhân viên văn phòng',slug: 'nhan-vien-van-phong',description: 'Hành chính, văn thư',                          level: 'OPERATION',    color: 'yellow' },
  { name: 'Kế toán',            slug: 'ke-toan',            description: 'Quản lý tài chính',                            level: 'OPERATION',    color: 'indigo' },
  { name: 'Tư vấn tuyển sinh',  slug: 'tu-van-tuyen-sinh',  description: 'Tư vấn học sinh mới',                          level: 'OPERATION',    color: 'pink'   },
  { name: 'Quản trị hệ thống',  slug: 'quan-tri-he-thong',  description: 'IT Admin, cấu hình hệ thống',                  level: 'SYSTEM',       color: 'gray'   },
]

// ── Staff ─────────────────────────────────────────────────────────────────────

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

// ── Classes & GVCN ────────────────────────────────────────────────────────────

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

const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý']
const FIRST_NAMES = ['Minh', 'Hùng', 'Lan', 'Thu', 'Tú', 'Dũng', 'Hà', 'Linh', 'Phong', 'Mai', 'Nam', 'Hoa', 'Tuấn', 'Nga', 'Khoa', 'Thảo', 'Long', 'Yến', 'Đức', 'Trinh']

function genName(idx: number): string {
  const ln = LAST_NAMES[idx % LAST_NAMES.length]
  const fn = FIRST_NAMES[(idx * 3 + 7) % FIRST_NAMES.length]
  return `${ln} ${fn}`
}

function genPhone(idx: number): string {
  // Range 0920000001 – 0920000315, no overlap with staff 090100000x
  const n = 920000000 + idx
  return `0${n}`
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const t0 = Date.now()
  console.log('🚀 Bắt đầu seed THPT Nguyễn Du...\n')

  // ────────────────────────────────────────────────────────────────────
  // 1. ROLES
  // ────────────────────────────────────────────────────────────────────
  console.log('📌 [1/8] Seeding roles...')
  let rolesOk = 0, rolesErr = 0
  for (const r of ROLES) {
    try {
      await prisma.role.upsert({
        where: { name: r.name },
        create: r,
        update: { description: r.description, level: r.level, color: r.color },
      })
      rolesOk++
    } catch (e: any) {
      // slug conflict? try with modified slug
      try {
        await prisma.role.upsert({
          where: { slug: r.slug },
          create: r,
          update: { description: r.description },
        })
        rolesOk++
      } catch {
        console.error(`  ❌ Role "${r.name}": ${e?.message ?? e}`)
        rolesErr++
      }
    }
  }
  const rolesStatus = rolesErr === 0 ? '✅' : '⚠️'
  console.log(`${rolesStatus} Roles: ${rolesOk}/${ROLES.length} (${rolesErr} lỗi)\n`)

  // ────────────────────────────────────────────────────────────────────
  // 2. ORGANIZATION
  // ────────────────────────────────────────────────────────────────────
  console.log('🏫 [2/8] Seeding organization...')
  let org: any
  try {
    org = await prisma.organization.upsert({
      where: { slug: 'thpt-nguyen-du' },
      create: {
        name: 'THPT Nguyễn Du',
        slug: 'thpt-nguyen-du',
        type: 'SCHOOL',
        country: 'VN',
        modules: ['erp', 'finance', 'crm', 'hrm', 'collab', 'ai'],
      },
      update: {},
    })
    console.log(`✅ Organization: ${org.name} (id: ${org.id})\n`)
  } catch (e: any) {
    console.error('❌ Organization failed:', e?.message ?? e)
    await prisma.$disconnect()
    process.exit(1)
  }

  // ────────────────────────────────────────────────────────────────────
  // 3. CAMPUS
  // ────────────────────────────────────────────────────────────────────
  console.log('🏢 [3/8] Seeding campus...')
  let campus: any
  try {
    const existing = await prisma.campus.findFirst({
      where: { organizationId: org.id, code: 'CS1' },
    })
    if (existing) {
      campus = existing
      console.log(`  ↩ Campus exists: ${campus.name}`)
    } else {
      campus = await prisma.campus.create({
        data: {
          organizationId: org.id,
          code: 'CS1',
          name: 'Cơ sở chính',
          address: '123 Nguyễn Du, Q.1, TP.HCM',
          isActive: true,
        },
      })
      console.log(`  ✔ Campus created: ${campus.name}`)
    }
    console.log(`✅ Campus: ${campus.name} (id: ${campus.id})\n`)
  } catch (e: any) {
    console.error('❌ Campus failed:', e?.message ?? e)
    await prisma.$disconnect()
    process.exit(1)
  }

  // ────────────────────────────────────────────────────────────────────
  // 4. STAFF
  // ────────────────────────────────────────────────────────────────────
  console.log('👨‍🏫 [4/8] Seeding staff (17 người)...')
  const staffPwd = await bcrypt.hash('Thpt@123456', 10)
  const staffMap: Record<string, any> = {} // email → user
  let staffOk = 0, staffErr = 0

  for (const s of STAFF) {
    try {
      const user = await prisma.user.upsert({
        where: { email: s.email },
        create: { name: s.name, email: s.email, phone: s.phone, password: staffPwd, role: 'ADMIN', isActive: true },
        update: { name: s.name, role: 'ADMIN' },
      })
      staffMap[s.email] = user

      await prisma.organizationUser.upsert({
        where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
        create: { organizationId: org.id, userId: user.id, orgRole: 'ADMIN' },
        update: {},
      })

      await prisma.campusUser.upsert({
        where: { campusId_userId: { campusId: campus.id, userId: user.id } },
        create: { campusId: campus.id, userId: user.id, isPrimary: true },
        update: {},
      })

      staffOk++
    } catch (e: any) {
      console.error(`  ❌ Staff "${s.name}" (${s.email}): ${e?.message ?? e}`)
      staffErr++
    }
  }
  const staffStatus = staffErr === 0 ? '✅' : '⚠️'
  console.log(`${staffStatus} Staff: ${staffOk}/${STAFF.length} (${staffErr} lỗi)\n`)

  // ────────────────────────────────────────────────────────────────────
  // 5. CLASSES (stored as Course)
  // ────────────────────────────────────────────────────────────────────
  console.log('📚 [5/8] Seeding 9 lớp học...')
  const classMap: Record<string, any> = {} // code → course
  let classOk = 0, classErr = 0

  for (const cls of CLASSES) {
    try {
      const course = await prisma.course.upsert({
        where: { code: cls.code },
        create: {
          code: cls.code,
          name: cls.name,
          grade: cls.grade,
          organizationId: org.id,
          campusId: campus.id,
          isActive: true,
          courseType: 'CLASS',
          subjectCode: 'CLASS',
          subjectName: cls.name,
          description: `Lớp ${cls.code} - THPT Nguyễn Du`,
        },
        update: { organizationId: org.id, campusId: campus.id, grade: cls.grade },
      })
      classMap[cls.code] = course
      classOk++
    } catch (e: any) {
      console.error(`  ❌ Class "${cls.code}": ${e?.message ?? e}`)
      classErr++
    }
  }
  const classStatus = classErr === 0 ? '✅' : '⚠️'
  console.log(`${classStatus} Classes: ${classOk}/${CLASSES.length} (${classErr} lỗi)\n`)

  // ────────────────────────────────────────────────────────────────────
  // 6. STUDENTS (315 HS)
  // ────────────────────────────────────────────────────────────────────
  console.log('👨‍🎓 [6/8] Seeding 315 học sinh (35/lớp × 9 lớp)...')
  const studentPwd = await bcrypt.hash('Hs@123456', 10)
  const studentsByClass: Record<string, any[]> = {}
  let studentOk = 0, studentErr = 0
  let globalIdx = 1

  for (const cls of CLASSES) {
    studentsByClass[cls.code] = []
    const course = classMap[cls.code]
    if (!course) { globalIdx += 35; continue }

    for (let i = 1; i <= 35; i++) {
      const idx = globalIdx
      const email = `hs${idx}@thpt-nguyendu.edu.vn`
      const phone = genPhone(idx)

      try {
        const student = await prisma.user.upsert({
          where: { email },
          create: { name: genName(idx), email, phone, password: studentPwd, role: 'STUDENT', isActive: true },
          update: {},
        })
        studentsByClass[cls.code].push(student)

        await prisma.enrollment.upsert({
          where: { userId_courseId: { userId: student.id, courseId: course.id } },
          create: {
            userId: student.id,
            courseId: course.id,
            organizationId: org.id,
            campusId: campus.id,
            status: 'ACTIVE',
          },
          update: {},
        })

        studentOk++
      } catch (e: any) {
        console.error(`  ❌ Student hs${idx}: ${e?.message ?? e}`)
        studentErr++
      }
      globalIdx++
    }
  }
  const studentStatus = studentErr === 0 ? '✅' : '⚠️'
  console.log(`${studentStatus} Students: ${studentOk}/315 (${studentErr} lỗi)\n`)

  // ────────────────────────────────────────────────────────────────────
  // 7. SUBJECTS (8 môn/lớp × 9 lớp = 72 subjects)
  // ────────────────────────────────────────────────────────────────────
  console.log('📖 [7/8] Seeding subjects (8 môn × 9 lớp = 72)...')
  const subjectsByClass: Record<string, any[]> = {}
  let subjectCreated = 0, subjectExisting = 0, subjectErr = 0

  for (const cls of CLASSES) {
    const course = classMap[cls.code]
    if (!course) continue
    subjectsByClass[cls.code] = []

    for (let i = 0; i < SUBJECTS_PER_CLASS.length; i++) {
      const subjectName = SUBJECTS_PER_CLASS[i]
      try {
        const existing = await prisma.subject.findFirst({
          where: { courseId: course.id, name: subjectName },
        })
        let subj: any
        if (existing) {
          subj = existing
          subjectExisting++
        } else {
          subj = await prisma.subject.create({
            data: {
              courseId: course.id,
              organizationId: org.id,
              name: subjectName,
              order: i + 1,
              isActive: true,
            },
          })
          subjectCreated++
        }
        subjectsByClass[cls.code].push(subj)
      } catch (e: any) {
        console.error(`  ❌ Subject "${subjectName}" for ${cls.code}: ${e?.message ?? e}`)
        subjectErr++
      }
    }
  }
  const subjectStatus = subjectErr === 0 ? '✅' : '⚠️'
  const subjectTotal = subjectCreated + subjectExisting
  console.log(`${subjectStatus} Subjects: ${subjectTotal} total (${subjectCreated} mới, ${subjectExisting} tồn tại, ${subjectErr} lỗi)\n`)

  // ────────────────────────────────────────────────────────────────────
  // 8a. ATTENDANCE (30 ngày × 315 HS = ~9,450 records)
  // ────────────────────────────────────────────────────────────────────
  console.log('📅 [8/8a] Seeding attendance (30 ngày × ~35 HS/lớp)...')
  const today = new Date()
  let attendanceTotal = 0, attendanceErr = 0
  const BATCH_SIZE = 1000

  for (const cls of CLASSES) {
    const course = classMap[cls.code]
    if (!course) continue
    const students = studentsByClass[cls.code]
    if (!students.length) continue

    const rows: { courseId: string; userId: string; date: Date; status: string }[] = []

    for (let d = 0; d < 30; d++) {
      const dt = new Date(today)
      dt.setDate(today.getDate() - 29 + d)
      // Store as UTC midnight for @db.Date
      const dateOnly = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()))

      for (const student of students) {
        const r = Math.random()
        const status = r < 0.85 ? 'present' : r < 0.95 ? 'late' : 'absent'
        rows.push({ courseId: course.id, userId: student.id, date: dateOnly, status })
      }
    }

    // Insert in batches
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE)
      try {
        const result = await prisma.attendance.createMany({ data: chunk, skipDuplicates: true })
        attendanceTotal += result.count
      } catch (e: any) {
        console.error(`  ❌ Attendance batch ${cls.code} [${i}–${i + chunk.length}]: ${e?.message ?? e}`)
        attendanceErr++
      }
    }
  }
  const attStatus = attendanceErr === 0 ? '✅' : '⚠️'
  console.log(`${attStatus} Attendance: ${attendanceTotal} records (${attendanceErr} batch lỗi)\n`)

  // ────────────────────────────────────────────────────────────────────
  // 8b. TUITION COLLECTION + PAYMENTS
  // ────────────────────────────────────────────────────────────────────
  console.log('💰 [8/8b] Seeding học phí tháng 7/2026...')
  let tuitionCollCount = 0, tuitionPayCount = 0, tuitionErr = 0

  for (const cls of CLASSES) {
    const course = classMap[cls.code]
    if (!course) continue
    const students = studentsByClass[cls.code]
    if (!students.length) continue

    const collTitle = `Thu học phí tháng 7/2026 - ${cls.name}`

    // Upsert collection (check by title+courseId)
    let collection: any
    try {
      const existing = await prisma.tuitionCollection.findFirst({
        where: { courseId: course.id, title: collTitle },
      })
      if (existing) {
        collection = existing
      } else {
        collection = await prisma.tuitionCollection.create({
          data: {
            organizationId: org.id,
            campusId: campus.id,
            courseId: course.id,
            title: collTitle,
            sessions: 1,
            unitAmount: 1_500_000,
            totalAmount: 1_500_000,
            note: 'Học phí tháng 7/2026',
          },
        })
        tuitionCollCount++
      }
    } catch (e: any) {
      console.error(`  ❌ TuitionCollection ${cls.code}: ${e?.message ?? e}`)
      tuitionErr++
      continue
    }

    // Fetch all enrollments for this class in bulk
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: course.id, userId: { in: students.map((s: any) => s.id) } },
    })
    const enrollMap: Record<string, string> = Object.fromEntries(enrollments.map(e => [e.userId, e.id]))

    // Build payment rows
    const payRows: any[] = []
    for (let i = 0; i < students.length; i++) {
      const student = students[i]
      const enrollmentId = enrollMap[student.id]
      if (!enrollmentId) continue
      const isPaid = i < 30
      payRows.push({
        collectionId: collection.id,
        enrollmentId,
        userId: student.id,
        amount: 1_500_000,
        isPaid,
        paidAt: isPaid ? new Date('2026-07-05T07:00:00Z') : null,
      })
    }

    try {
      const result = await prisma.tuitionPayment.createMany({
        data: payRows,
        skipDuplicates: true,
      })
      tuitionPayCount += result.count
    } catch (e: any) {
      console.error(`  ❌ TuitionPayments ${cls.code}: ${e?.message ?? e}`)
      tuitionErr++
    }
  }
  const tuitionStatus = tuitionErr === 0 ? '✅' : '⚠️'
  console.log(`${tuitionStatus} Tuition: ${tuitionCollCount} collections, ${tuitionPayCount} payments (${tuitionErr} lỗi)\n`)

  // ────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('📊  KẾT QUẢ SEED — THPT NGUYỄN DU')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`  ${rolesErr === 0 ? '✅' : '❌'} Roles seeded:           ${rolesOk}/${ROLES.length}`)
  console.log(`  ${org && campus ? '✅' : '❌'} Organization + Campus:  ${org?.name ?? 'N/A'} + ${campus?.name ?? 'N/A'}`)
  console.log(`  ${staffErr === 0 ? '✅' : '❌'} Staff seeded:           ${staffOk}/${STAFF.length}`)
  console.log(`  ${classErr === 0 ? '✅' : '❌'} Lớp học:               ${classOk}/${CLASSES.length}`)
  console.log(`  ${studentErr === 0 ? '✅' : '❌'} Học sinh:              ${studentOk}/315`)
  console.log(`  ${subjectErr === 0 ? '✅' : '❌'} Subjects:              ${subjectTotal} (${subjectCreated} new)`)
  console.log(`  ${attendanceErr === 0 ? '✅' : '❌'} Attendance records:    ${attendanceTotal}`)
  console.log(`  ${tuitionErr === 0 ? '✅' : '❌'} Học phí:               ${tuitionCollCount} collections, ${tuitionPayCount} payments`)
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`  ⏱  Tổng thời gian: ${elapsed}s`)
  console.log('═══════════════════════════════════════════════════════════════')
}

main()
  .catch((e) => { console.error('💥 Fatal:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
