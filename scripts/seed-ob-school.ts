/**
 * Seed: Hệ thống Trường OB — Ultra-fast batch version
 * 5 campus × 14 lớp × 15 HS = ~1,050 học sinh (đủ để test mọi workflow)
 * Chạy: export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/seed-ob-school.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: [] })
const PWD = '$2b$10$HzkdhQU1fPmNGycBbpHisOQ58XefkBmcUwLDQp2OVYDUph.HaDl.2' // Ob@12345

const HO  = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Đặng','Bùi']
const TEN_M = ['Minh','Hùng','Tuấn','Dũng','Khoa','Nam','Hải','Long','Đức','Bình']
const TEN_F = ['Anh','Linh','Hương','Lan','Mai','Hoa','Thảo','Ngọc','Uyên','Trang']
const DM = ['Văn','Quốc','Thanh'], DF = ['Thị','Ngọc','Kim']

let ni = 0
const genName = (g: 'm'|'f') => {
  const n = `${HO[ni%10]} ${g==='m'?DM[ni%3]:DF[ni%3]} ${g==='m'?TEN_M[ni%10]:TEN_F[ni%10]}`
  ni++; return n
}

let phoneN = 910_000_001
const genPhone = () => `0${phoneN++}`
const rI = (a:number,b:number) => Math.floor(Math.random()*(b-a+1))+a

const CAMPUSES = [
  { code:'Q1', name:'OB Quận 1',    addr:'123 Lê Lợi, Q.1, HCM' },
  { code:'Q7', name:'OB Quận 7',    addr:'456 Nguyễn Thị Thập, Q.7, HCM' },
  { code:'TD', name:'OB Thủ Đức',   addr:'789 Võ Văn Ngân, Thủ Đức, HCM' },
  { code:'BD', name:'OB Bình Dương',addr:'321 ĐL Bình Dương, BD' },
  { code:'DN', name:'OB Đồng Nai',  addr:'654 Phạm Văn Thuận, ĐN' },
]

const LEVELS = [
  { code:'MN',  label:'Mầm non',  grade:'0',  cls:3, price:3_500_000, subCode:'GENERAL',       subName:'Mầm non' },
  { code:'TH',  label:'Tiểu học', grade:'5',  cls:4, price:4_000_000, subCode:'THINKING_MATH', subName:'Tiểu học' },
  { code:'THCS',label:'THCS',     grade:'9',  cls:4, price:4_500_000, subCode:'MATH',          subName:'Toán THCS' },
  { code:'THPT',label:'THPT',     grade:'12', cls:3, price:5_000_000, subCode:'MATH',          subName:'Toán THPT' },
]
const STUDENTS_PER_CLASS = 15

async function main() {
  console.log('🏫  Seeding OB School (batch mode)...\n')

  // ── 1. Org + Academic Year ─────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where:  { slug:'ob-school' },
    create: { name:'Hệ thống Trường OB', slug:'ob-school', type:'CHAIN',
               modules:['erp','finance','crm','hrm','analytics','ai-studio'],
               settings:{ theme:'blue' } },
    update: {},
  })
  await prisma.academicYear.upsert({
    where:  { id:'ob-ay-2526' },
    create: { id:'ob-ay-2526', organizationId:org.id, name:'Năm học 2025-2026',
               startDate:new Date('2025-09-01'), endDate:new Date('2026-06-30'), isCurrent:true },
    update: { isCurrent:true },
  })
  console.log(`✅ Org: ${org.name}`)

  // ── 2. Staff users (BGH + teachers) — all at once ─────────────────────────
  const staffData: Parameters<typeof prisma.user.createMany>[0]['data'] = []
  const campusStaffMap: Record<string, { principalPhone:string; vpPhones:string[]; teacherPhones:string[] }> = {}

  for (const c of CAMPUSES) {
    const principalPhone = genPhone()
    const vpPhones = [genPhone(), genPhone()]
    const teacherPhones = Array.from({length:8}, () => genPhone())

    staffData.push(
      { name:`Hiệu trưởng ${c.name}`, phone:principalPhone, password:PWD, role:'ADMIN',
        email:`ht.${c.code.toLowerCase()}@ob.edu.vn` },
      ...vpPhones.map((p,i) => ({ name:`Hiệu phó ${i+1} ${c.name}`, phone:p, password:PWD, role:'ADMIN',
        email:`hp${i+1}.${c.code.toLowerCase()}@ob.edu.vn` })),
      ...teacherPhones.map((p,i) => ({ name:genName(i%3===0?'m':'f'), phone:p, password:PWD, role:'TEACHER',
        email:`gv${i}.${c.code.toLowerCase()}@ob.edu.vn` })),
    )
    campusStaffMap[c.code] = { principalPhone, vpPhones, teacherPhones }
  }

  await prisma.user.createMany({ data:staffData, skipDuplicates:true })
  console.log(`✅ ${staffData.length} nhân viên`)

  // ── 3. Campuses ───────────────────────────────────────────────────────────
  const campusIds: Record<string,string> = {}
  const principalUserMap: Record<string,string> = {}

  for (const c of CAMPUSES) {
    const { principalPhone } = campusStaffMap[c.code]
    const principal = await prisma.user.findUnique({ where:{ phone:principalPhone }, select:{ id:true } })
    if (!principal) continue

    principalUserMap[c.code] = principal.id
    const campus = await prisma.campus.upsert({
      where:  { id:`ob-cs-${c.code}` },
      create: { id:`ob-cs-${c.code}`, organizationId:org.id, name:c.name, code:c.code,
                 address:c.addr, principalId:principal.id },
      update: {},
    })
    campusIds[c.code] = campus.id
  }
  console.log(`✅ ${CAMPUSES.length} campus`)

  // ── 4. OrgUsers + CampusUsers (batch) ────────────────────────────────────
  const allStaffPhones = staffData.map(s => s.phone as string)
  const allStaffUsers  = await prisma.user.findMany({
    where:{ phone:{ in:allStaffPhones } }, select:{ id:true, phone:true, email:true }
  })
  const phoneToUser = Object.fromEntries(allStaffUsers.map(u => [u.phone, u.id]))

  const orgUserData: Parameters<typeof prisma.organizationUser.createMany>[0]['data'] = []
  const campusUserData: Parameters<typeof prisma.campusUser.createMany>[0]['data'] = []

  for (const c of CAMPUSES) {
    const { principalPhone, vpPhones, teacherPhones } = campusStaffMap[c.code]
    const cid = campusIds[c.code]
    if (!cid) continue

    const pid = phoneToUser[principalPhone]
    if (pid) {
      orgUserData.push({ organizationId:org.id, userId:pid, orgRole:'ADMIN' })
      campusUserData.push({ campusId:cid, userId:pid, campusRole:'PRINCIPAL', isPrimary:true })
    }
    for (const p of vpPhones) {
      const uid = phoneToUser[p]
      if (uid) campusUserData.push({ campusId:cid, userId:uid, campusRole:'VICE_PRINCIPAL' })
    }
    for (const p of teacherPhones) {
      const uid = phoneToUser[p]
      if (uid) campusUserData.push({ campusId:cid, userId:uid, campusRole:'TEACHER', isPrimary:true })
    }
  }

  await prisma.organizationUser.createMany({ data:orgUserData, skipDuplicates:true })
  await prisma.campusUser.createMany({ data:campusUserData, skipDuplicates:true })
  console.log(`✅ OrgUsers + CampusUsers gán xong`)

  // ── 5. Courses + Subjects (batch) ─────────────────────────────────────────
  type CourseRecord = { id:string; campusCode:string; price:number; name:string }
  const courseRecords: CourseRecord[] = []
  const subjectData: Parameters<typeof prisma.subject.createMany>[0]['data'] = []

  for (const c of CAMPUSES) {
    for (const lv of LEVELS) {
      for (let n = 1; n <= lv.cls; n++) {
        const code  = `OB-${c.code}-${lv.code}-${n}`
        const cName = `${lv.label} ${['A','B','C','D'][n-1]} — ${c.name}`
        const course = await prisma.course.upsert({
          where:  { code },
          create: { code, name:cName, subjectCode:lv.subCode, subjectName:lv.subName,
                     grade:lv.grade, gradeMin:parseInt(lv.grade), price:lv.price,
                     organizationId:org.id, campusId:campusIds[c.code] },
          update: { organizationId:org.id, campusId:campusIds[c.code] },
        })
        courseRecords.push({ id:course.id, campusCode:c.code, price:lv.price, name:cName })
        subjectData.push({ id:`${course.id}-s0`, courseId:course.id, name:`${lv.subName} HK1`, order:0 })
      }
    }
  }
  await prisma.subject.createMany({ data:subjectData, skipDuplicates:true })
  console.log(`✅ ${courseRecords.length} lớp học + subjects`)

  // ── 6. Students — ALL at once, then map to courses ─────────────────────────
  console.log(`📚 Tạo ${courseRecords.length * STUDENTS_PER_CLASS} học sinh...`)

  // Generate all student data
  const studentPhonesByCourse: Record<string, string[]> = {}
  const allStudentData: Parameters<typeof prisma.user.createMany>[0]['data'] = []

  for (const course of courseRecords) {
    const phones: string[] = []
    for (let s = 0; s < STUDENTS_PER_CLASS; s++) {
      const p = genPhone()
      phones.push(p)
      allStudentData.push({ name:genName(s%2===0?'m':'f'), phone:p, password:PWD, role:'STUDENT' })
    }
    studentPhonesByCourse[course.id] = phones
  }

  await prisma.user.createMany({ data:allStudentData, skipDuplicates:true })

  // Fetch all student IDs by phone
  const allStudentPhones = allStudentData.map(s => s.phone as string)
  const studentUsers = await prisma.user.findMany({
    where:{ phone:{ in:allStudentPhones } }, select:{ id:true, phone:true }
  })
  const phoneToStudentId = Object.fromEntries(studentUsers.map(u => [u.phone, u.id]))

  // Build enrollments
  const enrollmentData: Parameters<typeof prisma.enrollment.createMany>[0]['data'] = []
  for (const course of courseRecords) {
    for (const p of studentPhonesByCourse[course.id]) {
      const uid = phoneToStudentId[p]
      if (uid) enrollmentData.push({ userId:uid, courseId:course.id, status:'ACTIVE',
                                       expiresAt:new Date('2026-06-30') })
    }
  }
  await prisma.enrollment.createMany({ data:enrollmentData, skipDuplicates:true })
  console.log(`✅ ${enrollmentData.length} enrollments`)

  // ── 7. Tuition (1 collection per course, payments batch) ──────────────────
  let totalPaid = 0, totalUnpaid = 0
  for (const course of courseRecords) {
    const coll = await prisma.tuitionCollection.create({
      data:{ courseId:course.id, title:`Học phí HK1`, sessions:4,
             unitAmount:course.price, totalAmount:course.price*4 }
    })

    const phones   = studentPhonesByCourse[course.id]
    const enrolls  = await prisma.enrollment.findMany({
      where:{ courseId:course.id, userId:{ in:phones.map(p=>phoneToStudentId[p]).filter(Boolean) } }
    })
    const paysData = enrolls.map(e => {
      const isPaid = Math.random() > 0.25
      if (isPaid) totalPaid++; else totalUnpaid++
      return { collectionId:coll.id, enrollmentId:e.id, userId:e.userId,
               amount:course.price*4, isPaid,
               paidAt:isPaid ? new Date(Date.now() - rI(1,60)*86_400_000) : null }
    })
    await prisma.tuitionPayment.createMany({ data:paysData, skipDuplicates:true })
  }
  console.log(`✅ Học phí: ${totalPaid} đã thu · ${totalUnpaid} chưa thu`)

  // ── 8. Sample attendance (first 5 courses) ─────────────────────────────────
  const firstPrincipalId = principalUserMap[CAMPUSES[0].code]
  for (const course of courseRecords.slice(0, 5)) {
    const subject = await prisma.subject.findFirst({ where:{ courseId:course.id } })
    if (!subject || !firstPrincipalId) continue

    const enrolls = await prisma.enrollment.findMany({
      where:{ courseId:course.id, status:'ACTIVE' }, take:15
    })
    for (let d = 1; d <= 2; d++) {
      const fb = await prisma.sessionFeedback.create({
        data:{ subjectId:subject.id, sessionDate:new Date(Date.now()-d*86_400_000),
               createdBy:firstPrincipalId, sessionNote:`Buổi học ${d}` }
      })
      await prisma.studentSessionRecord.createMany({
        data: enrolls.map(e => ({
          feedbackId:fb.id, userId:e.userId, attendance:Math.random()>0.1,
          focusLevel:rI(3,5), comprehension:rI(3,5), discipline:5,
          emotionState:['great','good','good','neutral'][rI(0,3)]
        })),
        skipDuplicates:true,
      })
    }
  }
  console.log(`✅ Điểm danh mẫu cho 5 lớp đầu`)

  // ── Summary ────────────────────────────────────────────────────────────────
  const [nCS,nStu,nEnr,nPd,nUpd] = await Promise.all([
    prisma.campus.count({ where:{ organizationId:org.id } }),
    prisma.user.count({ where:{ role:'STUDENT' } }),
    prisma.enrollment.count({ where:{ status:'ACTIVE' } }),
    prisma.tuitionPayment.count({ where:{ isPaid:true } }),
    prisma.tuitionPayment.count({ where:{ isPaid:false } }),
  ])

  console.log(`
╔══════════════════════════════════════╗
║   🏫 OB SCHOOL SEED — HOÀN THÀNH   ║
╠══════════════════════════════════════╣
║  Cơ sở:         ${String(nCS).padEnd(6)}              ║
║  Học sinh:      ${String(nStu).padEnd(6)}              ║
║  Đang học:      ${String(nEnr).padEnd(6)}              ║
║  HP đã thu:     ${String(nPd).padEnd(6)}              ║
║  HP chưa thu:   ${String(nUpd).padEnd(6)}              ║
╚══════════════════════════════════════╝
🔑 Mật khẩu: Ob@12345
`)
}

main().catch(e => { console.error(e); process.exit(1) })
     .finally(() => prisma.$disconnect())
