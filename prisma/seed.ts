import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding AVAB database...')

  // ─── Admin ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@avab2024', 12)
  const admin = await prisma.user.upsert({
    where: { phone: '0900000001' },
    update: {},
    create: {
      name: 'Admin AvaB',
      phone: '0900000001',
      email: 'admin@avab.vn',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin: ${admin.phone} / Admin@avab2024`)

  // ─── Sample Student ────────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash('Student123', 12)
  const student = await prisma.user.upsert({
    where: { phone: '0912345678' },
    update: {},
    create: {
      name: 'Nguyễn Minh Khoa',
      phone: '0912345678',
      email: 'khoa@example.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  // ─── Course ────────────────────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { code: 'LTLOP1-2025' },
    update: {},
    create: {
      code: 'LTLOP1-2025',
      name: 'Luyện Thi Học Bổng Vào Lớp 1 — Chương Trình 2025',
      description:
        'Chương trình toàn diện 25 chuyên đề Toán Tư Duy dành cho học sinh 5–6 tuổi chuẩn bị kỳ thi tuyển học bổng vào lớp 1 các trường chất lượng cao tại Hà Nội: Lương Thế Vinh, Nguyễn Siêu, Vinschool, THCS Ngô Sĩ Liên... Nội dung được nghiên cứu và phát triển bởi chính những học sinh xuất sắc đã đạt giải tại các kỳ thi Toán Tư Duy Quốc Tế.',
      price: 0,
      isActive: true,
    },
  })
  console.log(`✅ Course: ${course.code}`)

  // ─── 25 Chuyên đề thực tế ─────────────────────────────────────────────
  const subjects = [
    { order: 1,  icon: '➕', name: 'Phép cộng, phép trừ có nhớ',          desc: 'Thực hiện thành thạo phép cộng và phép trừ có nhớ trong phạm vi 100, nền tảng của mọi bài toán tư duy.' },
    { order: 2,  icon: '⚡', name: 'Bài toán tính nhanh',                  desc: 'Kỹ thuật tính toán vượt trội: nhóm số, tách số, dùng tính chất giao hoán và kết hợp để tính cực nhanh.' },
    { order: 3,  icon: '➡️', name: 'Bài toán tính xuôi',                   desc: 'Suy luận từ dữ liệu ban đầu đến kết quả theo chiều thuận, xây dựng tư duy giải bài toán có hệ thống.' },
    { order: 4,  icon: '⬅️', name: 'Bài toán tính ngược',                  desc: 'Lập luận ngược từ kết quả về dữ liệu ban đầu — kỹ năng tư duy ngược đặc biệt quan trọng trong đề thi chất lượng cao.' },
    { order: 5,  icon: '🌳', name: 'Bài toán trồng cây',                   desc: 'Đếm khoảng cách, số cây trồng trên đoạn thẳng/vòng tròn — dạng toán thực tiễn rèn luyện tư duy cộng 1.' },
    { order: 6,  icon: '👴', name: 'Bài toán tuổi',                        desc: 'Tính tuổi hiện tại, tuổi trong quá khứ/tương lai và mối liên hệ tuổi giữa các nhân vật — rèn tư duy thời gian.' },
    { order: 7,  icon: '🔄', name: 'Bài toán so sánh thay thế',            desc: 'Dùng phương pháp thay thế tương đương để so sánh và tính toán — tiền thân của phương pháp đại số.' },
    { order: 8,  icon: '⚖️', name: 'Bài toán cân thăng bằng',             desc: 'Lập luận từ điều kiện cân bằng để tìm giá trị ẩn — phát triển tư duy phương trình từ sớm.' },
    { order: 9,  icon: '🚶', name: 'Bài toán xếp hàng',                   desc: 'Xác định vị trí, số thứ tự trong hàng từ hai đầu — luyện tư duy đếm có định hướng và tránh đếm trùng.' },
    { order: 10, icon: '🧠', name: 'Bài toán Logic',                       desc: 'Lập luận logic chặt chẽ từ các giả thiết để đưa ra kết luận — nền tảng của tư duy toán học bậc cao.' },
    { order: 11, icon: '🐔', name: 'Bài toán Gà - Thỏ',                   desc: 'Bài toán tổng hợp cổ điển về đếm theo điều kiện kép — phát triển khả năng lập và giải hệ phương trình trực giác.' },
    { order: 12, icon: '📊', name: 'Bài toán nhiều hơn, ít hơn, bằng nhau', desc: 'So sánh chênh lệch và tìm giá trị ẩn từ quan hệ "nhiều hơn/ít hơn" — rèn tư duy phân tích số liệu.' },
    { order: 13, icon: '📐', name: 'Bài toán vẽ sơ đồ',                   desc: 'Biểu diễn bài toán bằng sơ đồ đoạn thẳng — phương pháp trực quan hoá mạnh mẽ giúp giải nhanh bài toán phức tạp.' },
    { order: 14, icon: '🔵', name: 'Bài toán biểu đồ Venn',               desc: 'Phân tích tập hợp và mối quan hệ giao nhau qua biểu đồ Venn — nền tảng lý thuyết tập hợp từ lứa tuổi mầm non.' },
    { order: 15, icon: '🎱', name: 'Bài toán bốc bi',                     desc: 'Đếm có điều kiện, xác suất cơ bản qua bài toán bốc bi — giới thiệu tư duy tổ hợp đơn giản.' },
    { order: 16, icon: '📏', name: 'Bài toán chênh lệch',                 desc: 'Tính toán từ hiệu số giữa hai đại lượng — kỹ thuật cốt lõi trong phân tích so sánh số học.' },
    { order: 17, icon: '🎨', name: 'Bài toán tô màu',                     desc: 'Tô màu thỏa mãn điều kiện không trùng màu kề nhau — ứng dụng tư duy lý thuyết đồ thị đơn giản.' },
    { order: 18, icon: '🧩', name: 'Bài toán IQ',                         desc: 'Tìm quy luật ẩn trong dãy số, hình ảnh và bảng số — thước đo chỉ số tư duy linh hoạt và sáng tạo.' },
    { order: 19, icon: '🔡', name: 'Bài toán thay số bằng chữ',           desc: 'Giải mã các phép tính khi chữ cái thay thế chữ số — luyện tư duy suy diễn và thử nghiệm có hệ thống.' },
    { order: 20, icon: '🔢', name: 'Bài toán quy luật số',                desc: 'Nhận dạng và tiếp nối quy luật trong dãy số — phát triển tư duy quy nạp và phân tích chuỗi.' },
    { order: 21, icon: '🔷', name: 'Bài toán quy luật hình',              desc: 'Nhận dạng quy luật biến đổi trong dãy hình — kết hợp tư duy không gian và tư duy quy luật.' },
    { order: 22, icon: '🔢', name: 'Bài toán số chẵn, số lẻ',            desc: 'Tính chất số chẵn/lẻ và ứng dụng trong lập luận — xây dựng nền tảng lý thuyết số sơ cấp.' },
    { order: 23, icon: '🔣', name: 'Bài toán định nghĩa phép toán mới',  desc: 'Làm việc với phép toán do đề bài tự định nghĩa — rèn tư duy đọc hiểu ký hiệu toán học và áp dụng linh hoạt.' },
    { order: 24, icon: '🗺️', name: 'Bài toán đếm cách đi',              desc: 'Đếm số cách di chuyển trên lưới — giới thiệu bài toán tổ hợp đường đi, tiền đề của Combinatorics.' },
    { order: 25, icon: '📅', name: 'Bài toán thứ trong tuần',            desc: 'Tính toán ngày, thứ trong tuần qua các mốc thời gian — rèn tư duy chu kỳ và lịch thực tiễn.' },
  ]

  const createdSubjects = []
  for (const s of subjects) {
    // Check if subject exists
    const existing = await prisma.subject.findFirst({
      where: { courseId: course.id, order: s.order },
    })
    if (existing) {
      createdSubjects.push(existing)
    } else {
      const created = await prisma.subject.create({
        data: {
          courseId: course.id,
          order: s.order,
          icon: s.icon,
          name: s.name,
          description: s.desc,
          isActive: true,
        },
      })
      createdSubjects.push(created)
    }
  }
  console.log(`✅ ${createdSubjects.length} chuyên đề tạo thành công`)

  // ─── Sample questions for Chuyên đề 1 ─────────────────────────────────
  const subject1 = createdSubjects[0]
  if (subject1) {
    await prisma.question.deleteMany({ where: { subjectId: subject1.id } })
    await prisma.question.createMany({
      data: [
        { subjectId: subject1.id, order: 1, content: '27 + 38 = ?', correctAnswer: '65', points: 1 },
        { subjectId: subject1.id, order: 2, content: '63 - 27 = ?', correctAnswer: '36', points: 1 },
        { subjectId: subject1.id, order: 3, content: '45 + ___ = 82. Điền số còn thiếu.', correctAnswer: '37', points: 1 },
        { subjectId: subject1.id, order: 4, content: '91 - 46 = ?', correctAnswer: '45', points: 1 },
        { subjectId: subject1.id, order: 5, content: 'Tính: 35 + 47 + 18 = ?', correctAnswer: '100', points: 1 },
      ],
    })
    console.log('✅ Câu hỏi mẫu chuyên đề 1 tạo xong')
  }

  // Sample questions for Chuyên đề 11 (Gà Thỏ — classic)
  const subject11 = createdSubjects[10]
  if (subject11) {
    await prisma.question.deleteMany({ where: { subjectId: subject11.id } })
    await prisma.question.createMany({
      data: [
        { subjectId: subject11.id, order: 1, content: 'Một chuồng có cả gà và thỏ, tổng cộng 10 con và 28 chân. Hỏi có bao nhiêu con thỏ?', correctAnswer: '4', points: 1 },
        { subjectId: subject11.id, order: 2, content: 'Có 8 con gà và thỏ, đếm được 22 chân. Có bao nhiêu con gà?', correctAnswer: '5', points: 1 },
        { subjectId: subject11.id, order: 3, content: 'Chuồng có 12 con gà và thỏ, tổng 34 chân. Số con thỏ là?', correctAnswer: '5', points: 1 },
      ],
    })
    console.log('✅ Câu hỏi mẫu chuyên đề 11 tạo xong')
  }

  // ─── More test students ──────────────────────────────────────────────
  const testStudents = [
    { name: 'Trần Bảo Ngọc', phone: '0912000001', email: 's1@avab.vn' },
    { name: 'Lê Minh Tuấn',  phone: '0912000002', email: 's2@avab.vn' },
    { name: 'Phạm Thu Hà',   phone: '0912000003', email: 's3@avab.vn' },
    { name: 'Nguyễn Gia Huy', phone: '0912000004', email: 's4@avab.vn' },
    { name: 'Đỗ Khánh Linh', phone: '0912000005', email: 's5@avab.vn' },
    { name: 'Vũ Đức Anh',    phone: '0912000006', email: 's6@avab.vn' },
    { name: 'Hoàng Minh Châu',phone: '0912000007', email: 's7@avab.vn' },
    { name: 'Bùi Thanh Tâm', phone: '0912000008', email: 's8@avab.vn' },
    { name: 'Đinh Quốc Bảo', phone: '0912000009', email: 's9@avab.vn' },
    { name: 'Cao Thị Lan',   phone: '0912000010', email: 's10@avab.vn' },
    { name: 'Tô Minh Nhật',  phone: '0912000011', email: 's11@avab.vn' },
    { name: 'Dương Bảo Trân', phone: '0912000012', email: 's12@avab.vn' },
  ]
  const createdTestStudents = []
  for (const s of testStudents) {
    const pw = await bcrypt.hash('Student123', 12)
    const u = await prisma.user.upsert({
      where: { phone: s.phone },
      update: {},
      create: { name: s.name, phone: s.phone, email: s.email, password: pw, role: 'STUDENT' },
    })
    createdTestStudents.push(u)
  }
  console.log(`✅ ${createdTestStudents.length} test students created`)

  // ─── Enrollment ────────────────────────────────────────────────────────
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id, status: 'APPROVED' },
  })
  for (const s of createdTestStudents) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: s.id, courseId: course.id } },
      update: {},
      create: { userId: s.id, courseId: course.id, status: 'APPROVED' },
    })
  }

  // ─── Sample answers (scores 12–25 per student) ─────────────────────────
  const allQuestions = await prisma.question.findMany({ where: { subjectId: { in: [subject1?.id, subject11?.id].filter(Boolean) as string[] } } })
  const scoreProfiles = [25, 23, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12]
  const allTestUsers = [student, ...createdTestStudents]
  for (let i = 0; i < allTestUsers.length; i++) {
    const u = allTestUsers[i]
    const targetScore = scoreProfiles[i] ?? 12
    let placed = 0
    for (const q of allQuestions) {
      if (placed >= targetScore) break
      await prisma.studentAnswer.upsert({
        where: { userId_questionId: { userId: u.id, questionId: q.id } },
        update: {},
        create: {
          userId: u.id,
          subjectId: q.subjectId,
          questionId: q.id,
          answer: q.correctAnswer,
          isCorrect: true,
          score: q.points,
        },
      }).catch(() => {})
      placed += q.points
    }
  }
  console.log('✅ Test answers với điểm 12-25 tạo xong')

  // ─── News ──────────────────────────────────────────────────────────────
  await prisma.news.upsert({
    where: { slug: 'avab-ra-mat-2025' },
    update: {},
    create: {
      title: 'AvaB ra mắt phiên bản website mới 2025 — Giao diện đẹp hơn, nhanh hơn!',
      slug: 'avab-ra-mat-2025',
      summary: 'AvaB chính thức ra mắt hệ thống website mới với 25 chuyên đề Toán Tư Duy chuẩn đề thi học bổng vào lớp 1.',
      content: 'Chúng tôi rất vui được giới thiệu phiên bản AvaB mới nhất với hệ thống 25 chuyên đề toàn diện...',
      isPublished: true,
      publishedAt: new Date(),
    },
  })
  await prisma.news.upsert({
    where: { slug: 'ket-qua-thi-2024' },
    update: {},
    create: {
      title: 'Kết quả kỳ thi học bổng lớp 1 năm 2024 — Học viên AvaB tỏa sáng!',
      slug: 'ket-qua-thi-2024',
      summary: 'Nhiều học viên AvaB đã đỗ vào các trường hàng đầu: Lương Thế Vinh, Nguyễn Siêu, Vinschool, THCS Ngô Sĩ Liên.',
      content: 'Mùa thi học bổng vào lớp 1 năm 2024 đã qua với nhiều kết quả đáng tự hào...',
      isPublished: true,
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  })

  // ─── Recruitment ───────────────────────────────────────────────────────
  const existingTeacher = await prisma.recruitment.findFirst({ where: { type: 'TEACHER', isActive: true } })
  if (!existingTeacher) {
    await prisma.recruitment.create({
      data: {
        title: 'Tuyển giáo viên dạy kèm Toán Tư Duy online',
        type: 'TEACHER',
        description: 'AvaB tuyển giáo viên cộng tác dạy kèm online 1-1 cho học sinh 5–6 tuổi chuẩn bị thi học bổng vào lớp 1.',
        requirements: 'Đam mê dạy trẻ nhỏ, kiến thức toán vững, kiên nhẫn. Ưu tiên sinh viên Sư phạm hoặc học sinh đạt giải toán tư duy.',
        benefits: 'Thu nhập 200–350K/buổi 45 phút. Lịch dạy linh hoạt chủ động. Được đào tạo phương pháp AvaB.',
        isActive: true,
      },
    })
  }
  const existingAgent = await prisma.recruitment.findFirst({ where: { type: 'AGENT', isActive: true } })
  if (!existingAgent) {
    await prisma.recruitment.create({
      data: {
        title: 'Tuyển đại lý phụ huynh — Hoa hồng hấp dẫn',
        type: 'AGENT',
        description: 'Phụ huynh đã có con học AvaB, muốn giới thiệu cho các gia đình khác và nhận hoa hồng?',
        requirements: 'Là phụ huynh học viên AvaB. Có mạng lưới quan hệ phụ huynh tốt. Nhiệt tình và trung thực.',
        benefits: 'Hoa hồng 15–20% mỗi khoá học. Không vốn, không rủi ro. Hỗ trợ tài liệu marketing.',
        isActive: true,
      },
    })
  }

  console.log('\n🎉 Seed hoàn thành!')
  console.log('══════════════════════════════════')
  console.log('🔑 Admin:   0900000001 / Admin@avab2024')
  console.log('🎓 Student: 0912345678 / Student123')
  console.log('🌐 Dev URL: http://localhost:3001')
}

main()
  .catch((e) => {
    console.error('❌ Seed lỗi:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
