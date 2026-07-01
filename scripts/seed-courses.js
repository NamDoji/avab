/**
 * Seed new courses: Tiếng Anh, Thuật toán, Scratch, Python, C++
 * Run: node scripts/seed-courses.js
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const COURSES = [
  {
    code: 'ENGLISH-STARTER',
    name: 'English Starter — Tiếng Anh Tư Duy Cho Trẻ 5 Tuổi',
    description: 'Khóa học Tiếng Anh tư duy dành cho trẻ 5 tuổi chuẩn bị vào lớp 1. Học qua hình ảnh, trò chơi, phản xạ và AI hội thoại. Không học ngữ pháp, không dịch từng từ.',
    courseType: 'TIENG_ANH',
    price: 1500000,
    subjects: [
      { order: 1,  icon: '👋', name: 'Hello & My Name',       description: 'Chào hỏi và giới thiệu bản thân' },
      { order: 2,  icon: '🎨', name: 'Colors',                description: 'Màu sắc — Red, Blue, Green, Yellow...' },
      { order: 3,  icon: '🔢', name: 'Numbers',               description: 'Số đếm 1–20, hỏi đáp How many?' },
      { order: 4,  icon: '🔷', name: 'Shapes',                description: 'Hình dạng — Circle, Square, Triangle...' },
      { order: 5,  icon: '📏', name: 'Big & Small',           description: 'Kích thước và so sánh đơn giản' },
      { order: 6,  icon: '🤸', name: 'My Body',               description: 'Các bộ phận cơ thể — Head, Eyes, Hands...' },
      { order: 7,  icon: '👨‍👩‍👧', name: 'My Family',            description: 'Thành viên gia đình — Mom, Dad, Brother...' },
      { order: 8,  icon: '🐘', name: 'Animals',               description: 'Động vật — Dog, Cat, Lion, Elephant...' },
      { order: 9,  icon: '🍎', name: 'Fruits',                description: 'Hoa quả — Apple, Banana, Mango...' },
      { order: 10, icon: '🍕', name: 'Food & Drinks',         description: 'Đồ ăn thức uống — Rice, Milk, Water...' },
      { order: 11, icon: '🧸', name: 'Toys',                  description: 'Đồ chơi — Ball, Doll, Car, Robot...' },
      { order: 12, icon: '📚', name: 'Classroom Objects',     description: 'Đồ dùng học tập — Book, Pen, Ruler...' },
      { order: 13, icon: '🏃', name: 'Actions',               description: 'Hành động — Run, Jump, Eat, Sleep...' },
      { order: 14, icon: '😊', name: 'Feelings',              description: 'Cảm xúc — Happy, Sad, Angry, Scared...' },
      { order: 15, icon: '⛅', name: 'Weather',               description: 'Thời tiết — Sunny, Rainy, Cloudy, Cold...' },
      { order: 16, icon: '👕', name: 'Clothes',               description: 'Quần áo — Shirt, Pants, Shoes, Hat...' },
      { order: 17, icon: '🏠', name: 'Places',                description: 'Địa điểm — School, Park, Hospital...' },
      { order: 18, icon: '🚌', name: 'Transportation',        description: 'Phương tiện — Bus, Car, Plane, Boat...' },
      { order: 19, icon: '↕️', name: 'Position Words',        description: 'Vị trí — On, Under, Next to, Behind...' },
      { order: 20, icon: '🌅', name: 'Daily Routine',         description: 'Thói quen hàng ngày — Wake up, Brush teeth...' },
    ],
  },
  {
    code: 'CODING-KIDS-ALGO',
    name: 'Coding Kids — Tư Duy Thuật Toán Đầu Đời',
    description: 'Khóa học lập trình tư duy thuật toán dành cho học sinh lớp 1–2 (6–8 tuổi). Học qua robot, mê cung, kéo thả lệnh. Không cần biết code.',
    courseType: 'LAP_TRINH_THUAT_TOAN',
    price: 1200000,
    subjects: [
      { order: 1,  icon: '🤖', name: 'Robot và Lệnh',         description: 'Học lệnh: tiến, lùi, trái, phải, bắt đầu, dừng' },
      { order: 2,  icon: '📋', name: 'Thứ Tự Thực Hiện',      description: 'Khái niệm sequence — sắp xếp bước đúng thứ tự' },
      { order: 3,  icon: '🌀', name: 'Đi Trong Mê Cung',      description: 'Tìm đường đi cho robot, tránh vật cản' },
      { order: 4,  icon: '🔁', name: 'Lặp Lại',               description: 'Khái niệm repeat — thay nhiều lệnh giống nhau' },
      { order: 5,  icon: '❓', name: 'Điều Kiện',              description: 'Khái niệm If/Then — nếu gặp tường thì rẽ' },
      { order: 6,  icon: '⚖️', name: 'So Sánh',               description: 'Lớn hơn, nhỏ hơn, bằng nhau — robot chọn đúng' },
      { order: 7,  icon: '🔮', name: 'Quy Luật',              description: 'Tìm pattern trong dãy hình, màu sắc, hướng đi' },
      { order: 8,  icon: '📦', name: 'Phân Loại',             description: 'Classification — robot dọn kho theo nhóm' },
      { order: 9,  icon: '✨', name: 'Tối Ưu',                description: 'Chọn đường ít bước hơn, lệnh ngắn hơn' },
      { order: 10, icon: '🔍', name: 'Gỡ Lỗi',               description: 'Debugging — tìm và sửa lỗi trong chuỗi lệnh' },
      { order: 11, icon: '✂️', name: 'Chia Bài Toán',         description: 'Decomposition — chia nhiệm vụ lớn thành nhỏ' },
      { order: 12, icon: '🏆', name: 'Dự Án Tổng Kết',        description: 'Robot vượt mê cung, nhặt kim cương, về đích!' },
    ],
  },
  {
    code: 'SCRATCH-KIDS',
    name: 'Ông Bụt Scratch Kids — Lập Trình Kéo Thả',
    description: 'Lập trình kéo thả Scratch dành cho học sinh 7–10 tuổi. Tạo game, hoạt hình, câu chuyện tương tác. Mỗi bài học tạo ra một mini project.',
    courseType: 'LAP_TRINH_SCRATCH',
    price: 1200000,
    subjects: [
      { order: 1,  icon: '🐱', name: 'Làm Quen Với Scratch',   description: 'Scratch là gì? Sprite, Backdrop, block đầu tiên' },
      { order: 2,  icon: '🚶', name: 'Nhân Vật Di Chuyển',     description: 'Motion blocks — Move, Turn, Go to, Glide' },
      { order: 3,  icon: '⌨️', name: 'Sự Kiện Và Điều Khiển',  description: 'When green flag, When key pressed, Broadcast' },
      { order: 4,  icon: '💬', name: 'Ngoại Hình Và Hội Thoại', description: 'Looks blocks — Say, Think, Costume, Show/Hide' },
      { order: 5,  icon: '🎵', name: 'Âm Thanh Và Hiệu Ứng',   description: 'Sound blocks — nhạc nền, hiệu ứng âm thanh' },
      { order: 6,  icon: '🔄', name: 'Vòng Lặp',               description: 'Repeat, Forever, Wait — animation loop' },
      { order: 7,  icon: '🔀', name: 'Điều Kiện If/Then',       description: 'If, If/Else, Touching — game tránh chướng ngại' },
      { order: 8,  icon: '🏅', name: 'Biến Số Và Điểm Số',     description: 'Variable, Score, Lives, Timer — game tính điểm' },
      { order: 9,  icon: '🗺️', name: 'Tọa Độ Và Bản Đồ',      description: 'X/Y coordinates, Random position — game bắt táo' },
      { order: 10, icon: '👾', name: 'Clone Và Nhiều Đối Tượng', description: 'Create clone — nhiều kẻ địch, game bắn bóng' },
      { order: 11, icon: '🎮', name: 'Thiết Kế Game Hoàn Chỉnh', description: 'Start screen, Game over, Level system' },
      { order: 12, icon: '🌟', name: 'Dự Án Cuối Khóa',         description: 'Tự chọn: game / hoạt hình / truyện tương tác' },
    ],
  },
  {
    code: 'PYTHON-BASIC',
    name: 'Lập Trình Python Cơ Bản',
    description: 'Khóa học Python từ cơ bản cho học sinh phổ thông. Học qua bài tập thực hành, code editor tích hợp, AI hỗ trợ debug.',
    courseType: 'LAP_TRINH_PYTHON',
    price: 1500000,
    subjects: [
      { order: 1,  icon: '🐍', name: 'Giới Thiệu Python',      description: 'Python là gì? Cài đặt, Hello World đầu tiên' },
      { order: 2,  icon: '📦', name: 'Biến Và Kiểu Dữ Liệu',   description: 'int, float, str, bool — khai báo và sử dụng biến' },
      { order: 3,  icon: '🖨️', name: 'Input/Output',           description: 'print(), input() — nhập và xuất dữ liệu' },
      { order: 4,  icon: '🔢', name: 'Toán Tử Và Biểu Thức',   description: '+, -, *, /, //, %, ** — tính toán cơ bản' },
      { order: 5,  icon: '🔀', name: 'Câu Lệnh Điều Kiện',     description: 'if, elif, else — rẽ nhánh chương trình' },
      { order: 6,  icon: '🔁', name: 'Vòng Lặp',               description: 'for, while — lặp lại thao tác' },
      { order: 7,  icon: '📝', name: 'Danh Sách (List)',        description: 'Tạo, truy cập, thêm, xóa phần tử list' },
      { order: 8,  icon: '🗂️', name: 'Từ Điển (Dict)',         description: 'key-value pairs — lưu và truy xuất dữ liệu' },
      { order: 9,  icon: '🔧', name: 'Hàm (Function)',          description: 'def, return — chia nhỏ chương trình' },
      { order: 10, icon: '📂', name: 'Xử Lý File',             description: 'Đọc và ghi file text cơ bản' },
      { order: 11, icon: '⚠️', name: 'Xử Lý Ngoại Lệ',        description: 'try/except — chương trình không bị crash' },
      { order: 12, icon: '🚀', name: 'Dự Án Thực Tế',          description: 'Xây dựng mini app: game đoán số, quản lý danh sách' },
    ],
  },
  {
    code: 'CPP-ALGO',
    name: 'Lập Trình C++ — Thi Thuật Toán',
    description: 'Lập trình C++ và luyện thi thuật toán dành cho học sinh phổ thông. Hệ thống tương tự Codeforces — có judge tự chấm, ranking, contest.',
    courseType: 'LAP_TRINH_CPP',
    price: 2000000,
    subjects: [
      { order: 1,  icon: '⚡', name: 'Nhập Môn C++',            description: 'Cú pháp cơ bản, cin/cout, kiểu dữ liệu' },
      { order: 2,  icon: '🔀', name: 'Điều Kiện Và Vòng Lặp',  description: 'if/else, for, while, do-while' },
      { order: 3,  icon: '🗂️', name: 'Mảng Và Chuỗi',          description: 'Array, string, xử lý ký tự' },
      { order: 4,  icon: '🔧', name: 'Hàm Và Đệ Quy',          description: 'Function, recursion, stack overflow' },
      { order: 5,  icon: '📊', name: 'Sắp Xếp Và Tìm Kiếm',    description: 'Bubble sort, binary search, STL sort' },
      { order: 6,  icon: '🗄️', name: 'STL Containers',         description: 'vector, map, set, queue, stack, priority_queue' },
      { order: 7,  icon: '🔢', name: 'Số Học Và Toán',          description: 'GCD, LCM, số nguyên tố, lũy thừa nhanh' },
      { order: 8,  icon: '💡', name: 'Tham Lam (Greedy)',       description: 'Chiến lược tham lam — bài tập cổ điển' },
      { order: 9,  icon: '🏗️', name: 'Quy Hoạch Động (DP)',    description: 'DP 1D, 2D — bài toán ba lô, dãy con' },
      { order: 10, icon: '🌲', name: 'Đồ Thị Cơ Bản',           description: 'BFS, DFS, tìm đường đi ngắn nhất' },
      { order: 11, icon: '🏅', name: 'Contest Training',         description: 'Luyện đề thi Codeforces Div.4, Div.3' },
      { order: 12, icon: '🏆', name: 'Thi Thử',                 description: 'Virtual contest — thi thật, chấm thật, ranking' },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding courses...\n')

  for (const courseData of COURSES) {
    const { subjects, ...courseFields } = courseData

    // Check if course already exists
    const existing = await prisma.course.findUnique({ where: { code: courseFields.code } })
    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${courseFields.code}`)
      continue
    }

    const course = await prisma.course.create({
      data: {
        ...courseFields,
        courseType: courseFields.courseType,
        isActive: true,
      },
    })
    console.log(`✅ Created course: ${course.name}`)

    for (const sub of subjects) {
      await prisma.subject.create({
        data: {
          courseId: course.id,
          order: sub.order,
          icon: sub.icon,
          name: sub.name,
          description: sub.description,
          isActive: true,
          isPreview: sub.order === 1, // Chuyên đề 1 xem thử miễn phí
        },
      })
    }
    console.log(`   📚 Added ${subjects.length} subjects\n`)
  }

  console.log('✅ Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
